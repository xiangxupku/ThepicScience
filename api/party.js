/* api/party.js — the only piece of this app that is not a static file.

   A duel across two devices needs somewhere for the two devices to leave messages for each
   other. That is all this does: it holds one small JSON document per party code for a few
   minutes, and hands it back to whoever asks for it. It runs no game rules, stores no
   accounts, and keeps nothing after the timeout.

   The rules stay on the host's phone. The host writes what the screen should say, the
   guests read it and post back what they tapped, and the host applies those. One copy of
   duel.js is in charge, so the two screens cannot drift apart.

   Storage, in order of preference:
     1. Upstash Redis over REST, if KV_REST_API_URL and KV_REST_API_TOKEN are set. This is
        the one to use in production — add it from the Vercel dashboard and it works.
     2. A plain Map in this process, if they are not. Good enough for `vercel dev` and for
        two phones in the same minute, but a serverless function can be moved to a fresh
        instance at any time, which drops every party. The client is told which one is in
        use so it can warn people.

   Nothing stored here is personal: a display name the player typed, a pet id, and which
   button they pressed. */

const TTL_SECONDS = 1800;          /* half an hour, then a party disappears by itself */
const MAX_BODY = 64 * 1024;        /* a party document has no business being larger */
const MAX_ACTIONS = 64;

const URL_BASE = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || '';
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || '';
const HAS_REDIS = !!(URL_BASE && TOKEN);

/* ── storage ─────────────────────────────────────────── */

const memory = new Map();

async function redis(command) {
  const res = await fetch(URL_BASE, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify(command)
  });
  if (!res.ok) throw new Error('store ' + res.status);
  const out = await res.json();
  return out.result;
}

async function read(code) {
  if (HAS_REDIS) {
    const raw = await redis(['GET', 'party:' + code]);
    return raw ? JSON.parse(raw) : null;
  }
  const row = memory.get(code);
  if (!row) return null;
  if (Date.now() - row.at > TTL_SECONDS * 1000) { memory.delete(code); return null; }
  return row.doc;
}

async function write(code, doc) {
  doc.updated = Date.now();
  if (HAS_REDIS) {
    await redis(['SET', 'party:' + code, JSON.stringify(doc), 'EX', String(TTL_SECONDS)]);
    return doc;
  }
  memory.set(code, { at: Date.now(), doc });
  /* keep the fallback from growing without limit if a lot of parties are abandoned */
  if (memory.size > 500) {
    for (const [k, v] of memory) {
      if (Date.now() - v.at > TTL_SECONDS * 1000) memory.delete(k);
    }
  }
  return doc;
}

async function remove(code) {
  if (HAS_REDIS) await redis(['DEL', 'party:' + code]);
  else memory.delete(code);
}

/* ── helpers ─────────────────────────────────────────── */

function clean(code) {
  return String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4);
}

function fresh(party) {
  return { party, state: null, actions: [], rev: 1, updated: Date.now() };
}

function bump(doc) {
  doc.rev = (doc.rev || 0) + 1;
  return doc;
}

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  let raw = '';
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > MAX_BODY) throw new Error('too big');
  }
  return raw ? JSON.parse(raw) : {};
}

/* ── the handler ─────────────────────────────────────── */

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'GET') {
    /* a plain GET is the client asking whether online play is switched on at all */
    return res.status(200).json({ ok: true, online: true, durable: HAS_REDIS });
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, why: 'POST only' });
  }

  let body;
  try {
    body = await readBody(req);
  } catch (e) {
    return res.status(400).json({ ok: false, why: 'Could not read that request.' });
  }

  const op = String(body.op || '');
  const code = clean(body.code);

  try {
    if (op === 'ping') {
      return res.status(200).json({ ok: true, online: true, durable: HAS_REDIS });
    }

    if (op === 'create') {
      if (!code || !body.party) return res.status(400).json({ ok: false, why: 'No party to create.' });
      const existing = await read(code);
      if (existing) return res.status(409).json({ ok: false, why: 'That code is taken.' });
      const doc = await write(code, fresh(body.party));
      return res.status(200).json({ ok: true, durable: HAS_REDIS, ...doc });
    }

    if (op === 'get') {
      const doc = await read(code);
      if (!doc) return res.status(404).json({ ok: false, why: 'No party with that code.' });
      /* a guest asks for everything except the action queue, which is the host's inbox */
      return res.status(200).json({
        ok: true, durable: HAS_REDIS,
        party: doc.party, state: doc.state, rev: doc.rev, updated: doc.updated
      });
    }

    if (op === 'join') {
      const doc = await read(code);
      if (!doc) return res.status(404).json({ ok: false, why: 'No party with that code.' });
      if (doc.party.started) return res.status(409).json({ ok: false, why: 'That duel has already started.' });
      const m = body.member || {};
      if (!m.id || !m.name) return res.status(400).json({ ok: false, why: 'A player needs a name.' });
      if (!doc.party.members.some((x) => x.id === m.id)) {
        doc.party.members.push(m);
      }
      bump(doc);
      await write(code, doc);
      return res.status(200).json({ ok: true, party: doc.party, rev: doc.rev });
    }

    if (op === 'party') {
      /* the host is the only one who rewrites the membership */
      const doc = await read(code);
      if (!doc) return res.status(404).json({ ok: false, why: 'No party with that code.' });
      if (body.host !== doc.party.host) return res.status(403).json({ ok: false, why: 'Only the host can do that.' });
      doc.party = body.party;
      bump(doc);
      await write(code, doc);
      return res.status(200).json({ ok: true, rev: doc.rev });
    }

    if (op === 'state') {
      const doc = await read(code);
      if (!doc) return res.status(404).json({ ok: false, why: 'No party with that code.' });
      if (body.host !== doc.party.host) return res.status(403).json({ ok: false, why: 'Only the host can do that.' });
      doc.state = body.state;
      if (body.party) doc.party = body.party;
      bump(doc);
      await write(code, doc);
      return res.status(200).json({ ok: true, rev: doc.rev });
    }

    if (op === 'act') {
      const doc = await read(code);
      if (!doc) return res.status(404).json({ ok: false, why: 'No party with that code.' });
      doc.actions = (doc.actions || []).concat([{ ...body.action, from: body.from, at: Date.now() }]);
      if (doc.actions.length > MAX_ACTIONS) doc.actions = doc.actions.slice(-MAX_ACTIONS);
      bump(doc);
      await write(code, doc);
      return res.status(200).json({ ok: true, rev: doc.rev });
    }

    if (op === 'drain') {
      /* the host collects what everyone tapped and empties the inbox in one go */
      const doc = await read(code);
      if (!doc) return res.status(404).json({ ok: false, why: 'No party with that code.' });
      if (body.host !== doc.party.host) return res.status(403).json({ ok: false, why: 'Only the host can do that.' });
      const actions = doc.actions || [];
      doc.actions = [];
      await write(code, doc);
      return res.status(200).json({ ok: true, actions, party: doc.party, rev: doc.rev });
    }

    if (op === 'leave') {
      const doc = await read(code);
      if (!doc) return res.status(200).json({ ok: true });
      doc.party.members = doc.party.members.filter((m) => m.id !== body.id);
      if (!doc.party.members.length) { await remove(code); return res.status(200).json({ ok: true, gone: true }); }
      if (doc.party.host === body.id) doc.party.host = doc.party.members[0].id;
      bump(doc);
      await write(code, doc);
      return res.status(200).json({ ok: true, party: doc.party, rev: doc.rev });
    }

    return res.status(400).json({ ok: false, why: 'Unknown operation.' });
  } catch (e) {
    return res.status(500).json({ ok: false, why: 'The party store is not answering.' });
  }
}
