/* quizbank.js — the rest of the questions, fetched after the page is up.

   Every topic ships with ten questions inside topics*.js. Those ten are the core: they are
   what "finish a unit" means, and they are in the page from the first paint so the quick
   check works the moment a lesson is built.

   The other forty per topic live in quizbank-01.js … quizbank-11.js, four topics to a file.
   That is too much to put in front of someone on a phone on school wifi who may only want
   to read four pages, so it is not in the page at the start. It is fetched once the page
   has finished loading, in the background, while the student is still picking a topic. By
   the time anyone reaches a quiz it is nearly always there, and if it is not, the quick
   check simply uses the core ten and the rest join in on the next round. Nothing waits on
   it and nothing breaks without it.

   A part file calls add() with a map of topic id to questions. Order matters: the core ten
   stay at the front of each bank, so topic.quiz.slice(0, 10) is always the core. */

(function () {
  'use strict';

  var PARTS = [];
  for (var p = 1; p <= 11; p++) PARTS.push('assets/quizbank-' + ('0' + p).slice(-2) + '.js');

  var CORE = 10;            /* how many of each bank came with the topic itself */
  var added = 0;
  var started = false;

  function byId(id) {
    for (var i = 0; i < window.TOPICS.length; i++) {
      if (window.TOPICS[i].id === id) return window.TOPICS[i];
    }
    return null;
  }

  /* Add questions to the topics that are already here. A question whose stem is already in
     the bank is dropped, so loading a part twice cannot double anything up. */
  function add(map) {
    Object.keys(map).forEach(function (id) {
      var t = byId(id);
      if (!t) return;
      var have = {};
      t.quiz.forEach(function (q) { have[q.q] = true; });
      map[id].forEach(function (q) {
        if (have[q.q]) return;
        have[q.q] = true;
        t.quiz.push(q);
        added++;
      });
    });
  }

  function load() {
    if (started) return;
    started = true;
    PARTS.forEach(function (src) {
      var s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.onerror = function () { /* the core ten carry on without it */ };
      document.head.appendChild(s);
    });
  }

  /* ── where the right answer sits ───────────────
     Measured across the library's original ten-question sets, the first option was the
     right one 64 percent of the time. A student does not need to know any science to beat
     that, and once they notice, the quiz stops teaching them anything.

     So the three options are reordered before they are shown. The order comes from a hash
     of the question itself, which means it never changes: the same question looks the same
     today and tomorrow, and in an online duel the host and the guest see it the same way
     round. Only the order moves — no wording is touched.

     An option like “both of these” only makes sense last, so anything that reads like one
     is left exactly where it was. */

  var PERMS = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]];
  var FIXED = /^\s*(both|neither|all of|none of|either|any of)\b/i;

  function hash(s) {
    var h = 5381;
    for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
    return h >>> 0;
  }

  function spread(q) {
    if (!q || !Array.isArray(q.a) || q.a.length !== 3) return q;
    if (typeof q.c !== 'number') return q;
    if (q.a.some(function (a) { return FIXED.test(String(a)); })) return q;
    var p = PERMS[hash(q.q) % PERMS.length];
    var out = {};
    Object.keys(q).forEach(function (k) { out[k] = q[k]; });
    out.a = p.map(function (i) { return q.a[i]; });
    out.c = p.indexOf(q.c);
    return out;
  }

  window.QUIZBANK = {
    core: CORE,
    add: add,
    load: load,
    spread: spread,
    count: function () { return added; }
  };

  /* after the page is usable, not before */
  if (document.readyState === 'complete') setTimeout(load, 400);
  else window.addEventListener('load', function () { setTimeout(load, 400); });
})();
