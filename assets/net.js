/* net.js — the thin wire between two devices in the same party.

   There is no game logic in here. The host's phone runs duel.js and publishes what the
   screen should say; the guests read that and post back which button they pressed. One
   copy of the rules, so two screens cannot disagree about who has how many hearts.

   Everything goes through /api/party, which is the only server-side file in this project.
   If that endpoint is not there — anyone running the folder as plain static files, which is
   how it works offline — `available()` comes back false and the app quietly offers only
   same-device play. Nothing breaks, the online button is just switched off with a reason.

   Polling rather than sockets, on purpose: a serverless function cannot hold a socket open,
   and a question-and-answer game is slow enough that asking every second is plenty.

   The store can forget a party at any moment — see api/party.js — so nothing here treats
   that as fatal. The host writes its party straight back and carries on. A guest keeps
   asking quietly, and only says something is wrong after several seconds of silence, by
   which time the host has almost always put it back. */

(function () {
  'use strict';

  var API = '/api/party';
  var POLL_MS = 1100;
  var probe = null;             /* a promise, so twenty callers cause one request */

  function post(body) {
    return fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }).then(function (r) {
      return r.json().then(function (j) {
        if (!j.ok) throw new Error(j.why || 'That did not work.');
        return j;
      }, function () { throw new Error('The server sent something unreadable.'); });
    });
  }

  /* Is online play switched on here at all?

     A yes is remembered. A no is not: the first request to a serverless endpoint can be
     slow enough to look like a failure, and remembering that left the Online button greyed
     out for the rest of the visit with no way back but a reload. Now a failed probe is
     thrown away and the next look asks again. */
  function available() {
    if (probe) return probe;
    if (window.RELAY) {
      probe = window.RELAY.reachable(7000).then(function (ok) {
        if (ok) return { online: true, durable: true, relay: true, why: '' };
        probe = null;
        return httpProbe();
      });
      return probe;
    }
    return httpProbe();
  }

  function httpProbe() {
    var attempt = fetch(API, { method: 'GET' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        if (!j || !j.ok) throw new Error('no party server');
        return { online: true, durable: !!j.durable, why: '' };
      })
      .catch(function () {
        if (probe === attempt) probe = null;    /* ask again next time */
        return { online: false, durable: false, why: 'Could not reach the party server.' };
      });
    probe = attempt;
    return attempt;
  }

  /* ── a running connection ─────────────────────────────
     watch() keeps asking the server what changed and calls back only when something has.
     Both the host and the guests use it; the host additionally drains the action inbox. */

  function gone(message) {
    return /no party with that code/i.test(message || '');
  }

  function watch(opts) {
    if (relayUsable()) {
      /* messages arrive as they are published, so there is nothing to poll for */
      hooks = {
        onParty: opts.onParty, onState: opts.onState,
        onActions: opts.onActions, onError: opts.onError, onBack: opts.onBack,
        onKnock: opts.onKnock, onBye: opts.onBye, onClosed: opts.onClosed,
        onResend: opts.onResend
      };
      amHost = !!opts.host;
      return {
        stop: function () { hooks = {}; },
        stopped: function () { return false; },
        missing: function () { return 0; }
      };
    }

    var stopped = false;
    var timer = null;
    var lastRev = -1;
    var quiet = 0;          /* polls in a row that found nothing */

    function healthy() {
      if (quiet && opts.onBack) opts.onBack();
      quiet = 0;
    }

    function tick() {
      if (stopped) return;
      var job = opts.host
        ? post({ op: 'drain', code: opts.code, host: opts.id })
            .then(function (j) {
              healthy();
              if (j.actions && j.actions.length && opts.onActions) opts.onActions(j.actions);
              if (j.rev !== lastRev) { lastRev = j.rev; if (opts.onParty) opts.onParty(j.party); }
            })
        : post({ op: 'get', code: opts.code })
            .then(function (j) {
              healthy();
              if (j.rev === lastRev) return;
              lastRev = j.rev;
              if (opts.onParty) opts.onParty(j.party);
              if (j.state && opts.onState) opts.onState(j.state);
            });

      job.catch(function (e) {
        var msg = e.message || 'Lost the party.';
        quiet++;
        if (gone(msg)) {
          /* The store has been recycled. The host puts the party straight back; a guest
             waits for that to happen rather than announcing a problem. */
          if (opts.host && opts.revive) {
            lastRev = -1;
            return opts.revive();
          }
          if (quiet >= 6 && opts.onError) opts.onError('Cannot find that party any more.');
          return;
        }
        if (quiet >= 3 && opts.onError) opts.onError(msg);
      }).then(function () {
        if (!stopped) timer = setTimeout(tick, POLL_MS);
      });
    }

    tick();
    return {
      stop: function () { stopped = true; clearTimeout(timer); },
      stopped: function () { return stopped; },
      missing: function () { return quiet; }
    };
  }

  /* ── the relay path ───────────────────────────
     /api/party cannot carry an online duel. It keeps parties in memory inside a
     serverless function, and 48 requests to the live deploy came back from 10 different
     instances — a party written into one is invisible from the other nine. Two phones
     essentially never meet.

     relay.js connects every device to the same public broker instead, so there is nothing
     to be split. These functions keep the shape the app already calls, so nothing above
     this file had to change: the host still publishes what the screen should say, guests
     still post back what they tapped, and duel.js is still the only copy of the rules. */

  var R = null;            /* the open room */
  var amHost = false;
  var lastParty = null;
  var seen = {};           /* members who have announced themselves, by id */
  var hooks = {};          /* whatever watch() wants told */

  function relayUsable() {
    return !!(window.RELAY && R && R.live());
  }

  function dispatch(msg) {
    if (!msg || !msg.t) return;

    if (msg.t === 'hello' && amHost) {
      /* A device asking to join. Ask the host first, because only the host knows whether
         there is a seat: a full party and a duel already under way both used to end in the
         guest waiting out its nine seconds and being told the code did not exist. */
      if (!msg.member || !msg.member.id) return;
      var no = hooks.onKnock ? hooks.onKnock(msg.member) : '';
      if (no) {
        R.say({ t: 'no', id: msg.member.id, why: no });
        return;
      }
      seen[msg.member.id] = msg.member;
      var members = (lastParty && lastParty.members ? lastParty.members.slice() : []);
      Object.keys(seen).forEach(function (id) {
        if (!members.some(function (m) { return m.id === id; })) members.push(seen[id]);
      });
      if (hooks.onParty) hooks.onParty({ members: members });
      /* answer straight away so the guest is not left waiting on a poll */
      if (lastParty) R.say({ t: 'party', party: lastParty });
      /* And say where the duel is up to. Someone who refreshes mid-duel keeps their seat,
         but states are only published when something changes — without this they sat in
         the lobby until the next question happened to come round. */
      if (hooks.onResend) hooks.onResend();
      return;
    }

    if (msg.t === 'act' && amHost) {
      /* Who tapped matters once there are four of you: without this, anyone in the room
         could answer a question meant for a teammate. duel.js checks it against whose
         turn it actually is. */
      var act = {};
      Object.keys(msg.action || {}).forEach(function (k) { act[k] = msg.action[k]; });
      act.from = msg.from;
      if (hooks.onActions) hooks.onActions([act]);
      return;
    }

    if (msg.t === 'party' && !amHost) {
      lastParty = msg.party;
      if (hooks.onParty) hooks.onParty(msg.party);
      return;
    }

    if (msg.t === 'state' && !amHost) {
      if (hooks.onState) hooks.onState(msg.state);
      return;
    }

    if (msg.t === 'bye' && amHost) {
      delete seen[msg.id];
      if (hooks.onBye) hooks.onBye(msg.id);
      return;
    }

    /* the host could not seat us, and said why */
    if (msg.t === 'no' && !amHost) {
      if (hooks.onNo) hooks.onNo(msg);
      return;
    }

    /* the host has shut the party down, so there is nothing left to wait for */
    if (msg.t === 'closed' && !amHost) {
      if (hooks.onClosed) hooks.onClosed();
    }
  }

  function openRoom(code) {
    if (R) { R.close(); R = null; }
    seen = {};
    R = window.RELAY.open({
      code: code,
      onMessage: dispatch,
      onDrop: function () { if (hooks.onError) hooks.onError('Lost the connection. Trying again\u2026'); },
      onReady: function () {
        if (hooks.onBack) hooks.onBack();
        /* re-announce after a reconnect so nobody is forgotten */
        if (amHost && lastParty) R.say({ t: 'party', party: lastParty });
        else if (!amHost && lastParty) R.say({ t: 'hello', member: lastParty.me });
      }
    });
    return R;
  }

  function waitLive(ms) {
    return new Promise(function (res) {
      var tries = 0;
      var t = setInterval(function () {
        if (R && R.live()) { clearInterval(t); res(true); }
        else if (++tries > ms / 150) { clearInterval(t); res(false); }
      }, 150);
    });
  }

  window.NET = {
    api: API,
    pollMs: POLL_MS,
    available: available,

    create: function (code, party) {
      if (!window.RELAY) return post({ op: 'create', code: code, party: party });
      amHost = true;
      lastParty = party;
      openRoom(code);
      return waitLive(9000).then(function (ok) {
        if (!ok) throw new Error('Could not reach the party relay.');
        R.say({ t: 'party', party: party });
        return { ok: true, party: party, relay: true };
      });
    },

    join: function (code, member) {
      if (!window.RELAY) return post({ op: 'join', code: code, member: member });
      amHost = false;
      lastParty = { me: member, members: [] };
      openRoom(code);
      return waitLive(9000).then(function (ok) {
        if (!ok) throw new Error('Could not reach the party relay.');
        return new Promise(function (res, rej) {
          var settled = false;
          var saw = hooks.onParty;
          /* the host answers a hello with the party; wait for one that includes us */
          var give = setTimeout(function () {
            if (settled) return;
            settled = true;
            hooks.onParty = saw;
            hooks.onNo = null;
            rej(new Error('No party with that code. Check the four letters.'));
          }, 9000);

          hooks.onNo = function (m) {
            if (settled || !m || m.id !== member.id) return;
            settled = true;
            clearTimeout(give);
            hooks.onParty = saw;
            hooks.onNo = null;
            rej(new Error(m.why || 'The host could not let you in.'));
          };

          hooks.onParty = function (p) {
            if (saw) saw(p);
            if (settled || !p || !p.members) return;
            if (!p.members.some(function (m) { return m.id === member.id; })) return;
            settled = true;
            clearTimeout(give);
            hooks.onParty = saw;
            hooks.onNo = null;
            lastParty = p;
            res({ ok: true, party: p, relay: true });
          };

          var knock = setInterval(function () {
            if (settled) { clearInterval(knock); return; }
            R.say({ t: 'hello', member: member });
          }, 900);
          R.say({ t: 'hello', member: member });
        });
      });
    },
    get: function (code) {
      return post({ op: 'get', code: code });
    },
    putParty: function (code, host, party) {
      if (relayUsable()) {
        lastParty = party;
        R.say({ t: 'party', party: party });
        return Promise.resolve({ ok: true });
      }
      return post({ op: 'party', code: code, host: host, party: party });
    },
    /* write the whole party back over whatever is there, or is not. On the relay there is
       nothing to lose in the first place, so this is just a re-announcement. */
    revive: function (code, host, party, state) {
      if (relayUsable()) {
        lastParty = party;
        R.say({ t: 'party', party: party });
        if (state) R.say({ t: 'state', state: state });
        return Promise.resolve({ ok: true, revived: false });
      }
      return post({ op: 'revive', code: code, host: host, party: party, state: state });
    },
    putState: function (code, host, state, party) {
      if (relayUsable()) {
        if (party) lastParty = party;
        R.say({ t: 'state', state: state });
        return Promise.resolve({ ok: true });
      }
      return post({ op: 'state', code: code, host: host, state: state, party: party });
    },
    act: function (code, from, action) {
      if (relayUsable()) {
        R.say({ t: 'act', from: from, action: action });
        return Promise.resolve({ ok: true });
      }
      return post({ op: 'act', code: code, from: from, action: action });
    },
    leave: function (code, id) {
      if (relayUsable()) {
        if (amHost) R.say({ t: 'closed' });
        else R.say({ t: 'bye', id: id });
        R.close(); R = null; lastParty = null; seen = {}; hooks = {};
        return Promise.resolve({ ok: true });
      }
      return post({ op: 'leave', code: code, id: id });
    },

    watch: watch,

    /* test seam: point the client at a different endpoint */
    useEndpoint: function (url) { API = url; probe = null; window.NET.api = url; }
  };
})();
