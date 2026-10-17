/* party.js — who is in the duel, which side they are on, and the robots that fill the gaps.

   A party is a list of seats split over two teams. You pick 1v1, 2v2, 3v3 or 4v4, you get a
   four-letter code, and anyone with that code takes the next empty seat. If nobody else
   turns up the host can start anyway and every empty seat is filled by a robot.

   The robots are deliberately simple, and deliberately honest about it: a robot picks one of
   the three answers at random, so it gets one in three right. It is not pretending to know
   any science, and the odds are printed on its card so nobody thinks they lost to a genius.
   A robot attacking picks one of its three offered questions at random too.

   This file holds no rules about hearts or damage — that is duel.js. It only knows who is
   playing, so that the same party works whether the duel is on one device or across two. */

(function () {
  'use strict';

  var MODES = [
    { id: '1v1', per: 1, name: '1 v 1', blurb: 'Just the two of you.' },
    { id: '2v2', per: 2, name: '2 v 2', blurb: 'Two a side. Everyone attacks once per lap.' },
    { id: '3v3', per: 3, name: '3 v 3', blurb: 'Three a side. Longer, and harder to carry.' },
    { id: '4v4', per: 4, name: '4 v 4', blurb: 'Four a side. The full classroom brawl.' }
  ];

  function mode(id) {
    return MODES.filter(function (m) { return m.id === id; })[0] || MODES[0];
  }

  /* Hearts scale with the size of the team, or a 4v4 would be over in two rounds. */
  function teamHp(modeId) {
    return 3 + 2 * mode(modeId).per;
  }

  /* ── codes ────────────────────────────────────────────
     Four letters, no vowels and no 0/O/1/I, so a code read out loud cannot be misheard and
     cannot accidentally spell anything. */

  var ALPHABET = 'BCDFGHJKLMNPQRSTVWXYZ23456789';

  function newCode() {
    var s = '';
    for (var i = 0; i < 4; i++) s += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
    return s;
  }

  function cleanCode(raw) {
    return String(raw || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4);
  }

  /* ── robots ───────────────────────────────────────────
     Named after lab kit so it is obvious at a glance which seats are not people. */

  var ROBOT_NAMES = [
    'Bunsen Bot', 'Pipette', 'Beaker Bot', 'Magnet', 'Prism', 'Flask Bot', 'Crucible', 'Tongs'
  ];

  function robotFor(n, petIds) {
    /* a robot gets a middling pet so it is neither a pushover nor a wall */
    var pool = petIds && petIds.length ? petIds : [];
    return {
      id: 'ai' + n,
      name: ROBOT_NAMES[n % ROBOT_NAMES.length],
      ai: true,
      petId: pool.length ? pool[n % pool.length] : '',
      level: 4 + (n % 3) * 2,
      ready: true
    };
  }

  /* One in three, every time, with no memory and no cheating. */
  function robotAnswer(question) {
    return Math.floor(Math.random() * question.a.length);
  }

  function robotPick(choices) {
    return Math.floor(Math.random() * choices.length);
  }

  /* how long a robot "thinks" for, so its turn is readable rather than instant */
  function robotPause(reduced) {
    return reduced ? 300 : 900 + Math.floor(Math.random() * 700);
  }

  /* ── the party ────────────────────────────────────── */

  function create(opts) {
    return {
      code: opts.code || newCode(),
      mode: mode(opts.mode).id,
      host: opts.host.id,
      online: !!opts.online,
      started: false,
      topicId: opts.topicId || '',
      members: [seat(opts.host, 0)]
    };
  }

  /* A seat carries a pet *id*, not a pet object. Members travel to another device as
     JSON, and an id both survives that trip and keeps the message small — the other end
     looks the pet up in its own copy of pets.js. */
  function seat(m, team) {
    return {
      id: m.id, name: m.name, team: team,
      petId: m.petId || '', level: m.level || 1,
      ai: !!m.ai, ready: m.ready !== false
    };
  }

  function capacity(p) { return mode(p.mode).per * 2; }

  function humans(p) { return p.members.filter(function (m) { return !m.ai; }); }

  function teamOf(p, team) {
    return p.members.filter(function (m) { return m.team === team; });
  }

  /* the next team with room, so joining alternates sides and stays even */
  function openTeam(p) {
    var per = mode(p.mode).per;
    var a = teamOf(p, 0).length, b = teamOf(p, 1).length;
    if (a <= b && a < per) return 0;
    if (b < per) return 1;
    return -1;
  }

  function isFull(p) {
    return p.members.length >= capacity(p);
  }

  function join(p, m) {
    if (p.started) return { ok: false, why: 'That duel has already started.' };
    if (p.members.some(function (x) { return x.id === m.id; })) return { ok: true, already: true };
    var t = openTeam(p);
    if (t < 0) return { ok: false, why: 'That party is full.' };
    p.members.push(seat(m, t));
    return { ok: true };
  }

  function leave(p, id) {
    p.members = p.members.filter(function (m) { return m.id !== id; });
    if (p.host === id && p.members.length) p.host = humans(p)[0] ? humans(p)[0].id : p.members[0].id;
    return p;
  }

  /* move someone to the other side, if there is room for them there */
  function swapSide(p, id) {
    var m = p.members.filter(function (x) { return x.id === id; })[0];
    if (!m) return false;
    var other = 1 - m.team;
    if (teamOf(p, other).length >= mode(p.mode).per) return false;
    m.team = other;
    return true;
  }

  /* Fill every empty seat with a robot. The host does this by starting early. */
  function fill(p, pets) {
    var per = mode(p.mode).per;
    var n = 0;
    [0, 1].forEach(function (t) {
      while (teamOf(p, t).length < per) {
        p.members.push(seat(robotFor(n++, pets), t));
      }
    });
    return p;
  }

  /* teams in the shape duel.js wants, in seat order */
  function sides(p) {
    return [0, 1].map(function (t) {
      return {
        name: t === 0 ? 'Team A' : 'Team B',
        members: teamOf(p, t)
      };
    });
  }

  function summary(p) {
    var per = mode(p.mode).per;
    var a = teamOf(p, 0).length, b = teamOf(p, 1).length;
    var bots = p.members.filter(function (m) { return m.ai; }).length;
    return {
      mode: p.mode, per: per, capacity: per * 2,
      teamA: a, teamB: b, filled: p.members.length,
      empty: per * 2 - p.members.length,
      robots: bots,
      canStart: p.members.length >= 2 || per >= 1   /* the host plus robots is enough */
    };
  }

  window.PARTY = {
    modes: MODES,
    mode: mode,
    teamHp: teamHp,
    newCode: newCode,
    cleanCode: cleanCode,
    robotNames: ROBOT_NAMES,
    robotAnswer: robotAnswer,
    robotPick: robotPick,
    robotPause: robotPause,

    create: create,
    join: join,
    leave: leave,
    swapSide: swapSide,
    fill: fill,
    sides: sides,
    teamOf: teamOf,
    humans: humans,
    isFull: isFull,
    capacity: capacity,
    openTeam: openTeam,
    summary: summary
  };
})();
