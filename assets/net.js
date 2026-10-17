/* net.js — the thin wire between two devices in the same party.

   There is no game logic in here. The host's phone runs duel.js and publishes what the
   screen should say; the guests read that and post back which button they pressed. One
   copy of the rules, so two screens cannot disagree about who has how many hearts.

   Everything goes through /api/party, which is the only server-side file in this project.
   If that endpoint is not there — anyone running the folder as plain static files, which is
   how it works offline — `available()` comes back false and the app quietly offers only
   same-device play. Nothing breaks, the online button is just switched off with a reason.

   Polling rather than sockets, on purpose: a serverless function cannot hold a socket open,
   and a question-and-answer game is slow enough that asking every second is plenty. */

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

  /* Is online play switched on here at all? Asked once, answer remembered. */
  function available() {
    if (probe) return probe;
    probe = fetch(API, { method: 'GET' })
      .then(function (r) { return r.ok ? r.json() : { ok: false }; })
      .then(function (j) {
        return {
          online: !!(j && j.ok && j.online),
          durable: !!(j && j.durable),
          why: j && j.ok ? '' : 'This copy is running without the party server.'
        };
      })
      .catch(function () {
        return { online: false, durable: false, why: 'No party server on this address.' };
      });
    return probe;
  }

  /* ── a running connection ─────────────────────────────
     watch() keeps asking the server what changed and calls back only when something has.
     Both the host and the guests use it; the host additionally drains the action inbox. */

  function watch(opts) {
    var stopped = false;
    var timer = null;
    var lastRev = -1;

    function tick() {
      if (stopped) return;
      var job = opts.host
        ? post({ op: 'drain', code: opts.code, host: opts.id })
            .then(function (j) {
              if (j.actions && j.actions.length && opts.onActions) opts.onActions(j.actions);
              if (j.rev !== lastRev) { lastRev = j.rev; if (opts.onParty) opts.onParty(j.party); }
            })
        : post({ op: 'get', code: opts.code })
            .then(function (j) {
              if (j.rev === lastRev) return;
              lastRev = j.rev;
              if (opts.onParty) opts.onParty(j.party);
              if (j.state && opts.onState) opts.onState(j.state);
            });

      job.catch(function (e) {
        if (opts.onError) opts.onError(e.message || 'Lost the party.');
      }).then(function () {
        if (!stopped) timer = setTimeout(tick, POLL_MS);
      });
    }

    tick();
    return {
      stop: function () { stopped = true; clearTimeout(timer); },
      stopped: function () { return stopped; }
    };
  }

  window.NET = {
    api: API,
    pollMs: POLL_MS,
    available: available,

    create: function (code, party) {
      return post({ op: 'create', code: code, party: party });
    },
    join: function (code, member) {
      return post({ op: 'join', code: code, member: member });
    },
    get: function (code) {
      return post({ op: 'get', code: code });
    },
    putParty: function (code, host, party) {
      return post({ op: 'party', code: code, host: host, party: party });
    },
    putState: function (code, host, state, party) {
      return post({ op: 'state', code: code, host: host, state: state, party: party });
    },
    act: function (code, from, action) {
      return post({ op: 'act', code: code, from: from, action: action });
    },
    leave: function (code, id) {
      return post({ op: 'leave', code: code, id: id });
    },

    watch: watch,

    /* test seam: point the client at a different endpoint */
    useEndpoint: function (url) { API = url; probe = null; window.NET.api = url; }
  };
})();
