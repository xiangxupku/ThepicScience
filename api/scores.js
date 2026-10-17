/* api/scores.js — the speed-run leaderboard.

   One list of the fastest escapes per level. A run posts its time, the server keeps the
   best twenty for that level, and anyone can read them back. No accounts: a run carries
   the display name the player typed on their own device and nothing else.

   Same storage choice as api/party.js: Upstash Redis over REST when the environment has
   it, a Map in the process when it does not. A leaderboard in a Map is near useless,
   because a serverless function can be moved to a fresh instance at any moment, so the
   client is told which one is in use and only shows the global board when it is durable.
   The personal bests are kept in localStorage on the player's own device either way, so
   there is always something to beat.

   Nothing here is trusted. A time is a number a browser sent, so it is sanity-checked
   against what the level can physically allow and against the questions actually answered.
   This is a science homework game, not a tournament: the check is there so an obvious
   impossibility does not sit at the top of a child's leaderboard, not to defeat anyone
   determined to cheat. There is no way to do that without a server that runs the game. */

const TTL_SECONDS = 60 * 60 * 24 * 30;   /* a month */
const KEEP = 20;
const MAX_NAME = 16;

const URL_BASE = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || '';
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || '';
const HAS_REDIS = !!(URL_BASE && TOKEN);

const memory = new Map();

async function redis(command) {
  const res = await fetch(URL_BASE, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify(command)
  });
  if (!res.ok) throw new Error('store ' + res.status);
  return (await res.json()).result;
}

async function readBoard(key) {
  if (HAS_REDIS) {
    const raw = await redis(['GET', key]);
    return raw ? JSON.parse(raw) : [];
  }
  return memory.get(key) || [];
}

async function writeBoard(key, rows) {
  if (HAS_REDIS) await redis(['SET', key, JSON.stringify(rows), 'EX', String(TTL_SECONDS)]);
  else memory.set(key, rows);
}

function clean(s, max) {
  return String(s || '').replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, max);
}

/* The fastest a level can physically be finished: the exit is `goal` metres away and the
   runner's top speed is 60 m/s, so anything quicker than that did not happen. A handful of
   seconds of slack covers rounding and a fast first question. */
function plausible(run) {
  const goal = Number(run.goal) || 900;
  const floor = (goal / 60) * 1000 - 500;
  if (!Number.isFinite(run.ms) || run.ms < floor) return false;
  if (run.ms > 1000 * 60 * 30) return false;
  /* you cannot cross the line without answering: roughly one question per 15 s at best */
  if (!Number.isFinite(run.right) || run.right < Math.floor(run.ms / 1000 / 15)) return false;
  return true;
}

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  let raw = '';
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 8192) throw new Error('too big');
  }
  return raw ? JSON.parse(raw) : {};
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'GET') {
    const level = Math.max(1, Math.min(99, parseInt(new URL(req.url, 'http://x').searchParams.get('level'), 10) || 1));
    try {
      const rows = await readBoard('scores:' + level);
      return res.status(200).json({ ok: true, durable: HAS_REDIS, level, rows });
    } catch (e) {
      return res.status(200).json({ ok: true, durable: HAS_REDIS, level, rows: [], why: 'store unavailable' });
    }
  }

  if (req.method !== 'POST') return res.status(405).json({ ok: false, why: 'GET or POST' });

  let body;
  try { body = await readBody(req); }
  catch (e) { return res.status(400).json({ ok: false, why: 'Could not read that.' }); }

  const level = Math.max(1, Math.min(99, parseInt(body.level, 10) || 1));
  const run = {
    name: clean(body.name, MAX_NAME) || 'Someone',
    ms: parseInt(body.ms, 10),
    right: parseInt(body.right, 10),
    asked: parseInt(body.asked, 10),
    world: clean(body.world, 12),
    goal: parseInt(body.goal, 10)
  };

  if (!plausible(run)) {
    return res.status(200).json({ ok: true, kept: false, why: 'That time is not possible for this level.' });
  }

  try {
    const key = 'scores:' + level;
    const rows = await readBoard(key);
    rows.push({ name: run.name, ms: run.ms, right: run.right, asked: run.asked, at: Date.now() });
    rows.sort((a, b) => a.ms - b.ms);
    const kept = rows.slice(0, KEEP);
    await writeBoard(key, kept);
    const place = kept.findIndex((r) => r.ms === run.ms && r.name === run.name);
    return res.status(200).json({
      ok: true, durable: HAS_REDIS, kept: place !== -1,
      place: place === -1 ? null : place + 1, rows: kept
    });
  } catch (e) {
    return res.status(200).json({ ok: true, kept: false, why: 'The score store is not answering.' });
  }
}
