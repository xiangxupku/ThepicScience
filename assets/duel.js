/* duel.js — two players, one device, one science topic.

   Both players sit at the same screen and take turns. On your attack you are offered three
   questions and you choose which one to send; the harder your attacking pet, the harder the
   three you get to choose from. Your opponent then answers it, and may spend one hint from
   their own pet. Get it wrong and you take damage.

   There is no server behind this, so there is no internet matchmaking — it is a pass-the-
   device duel. A hand-over screen sits between choosing and answering so the person
   answering never sees which question was picked until it is their turn. */

(function () {
  'use strict';

  var D = null;
  var MAX_HP = 5;

  /* ── how hard is a question ───────────────────────────
     Nothing in the library is labelled with a difficulty, so we work one out: which tier of
     the topic it teaches, and what kind of question it is. */
  function difficulty(q, topic) {
    var d = 0.4;
    var sc = topic.scenes[typeof q.teach === 'number' ? q.teach : 0];
    if (sc) d = sc.tier === 1 ? 0.22 : sc.tier === 2 ? 0.5 : 0.78;
    if (q.source === 'board') d += 0.12;                 /* built from their own photo */
    if (/^Fill the gap/.test(q.q)) d += 0.1;
    if (/^Which word means this/.test(q.q)) d -= 0.08;
    if (/^What is the main point/.test(q.q)) d -= 0.05;
    if (q.q.length > 120) d += 0.05;                     /* long stems are harder to parse */
    return Math.max(0, Math.min(1, d));
  }

  /* three questions near the attacker's strength, never the same one twice in a duel */
  function offer(pool, target, used) {
    var fresh = pool.filter(function (q) { return !used[q.q]; });
    if (fresh.length < 3) { used = {}; fresh = pool.slice(); }
    var ranked = fresh.slice().sort(function (a, b) {
      return Math.abs(a.diff - target) - Math.abs(b.diff - target);
    });
    var near = ranked.slice(0, Math.min(9, ranked.length));
    var picks = [];
    while (picks.length < 3 && near.length) {
      picks.push(near.splice(Math.floor(Math.random() * near.length), 1)[0]);
    }
    return picks;
  }

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function me() { return D.players[D.turn]; }
  function foe() { return D.players[1 - D.turn]; }

  /* ── screens ──────────────────────────────────────── */

  function render() {
    if (!D) return;
    D.el.hp.innerHTML = D.players.map(function (p, i) {
      var hearts = '';
      for (var h = 0; h < MAX_HP; h++) hearts += '<span class="hp' + (h < p.hp ? ' is-on' : '') + '"></span>';
      return '<div class="duel-side' + (i === D.turn ? ' is-turn' : '') + '">' +
        '<div class="duel-pet">' + window.PETS.draw(p.pet.id, p.level) + '</div>' +
        '<div><p class="duel-who">' + esc(p.name) + '</p>' +
        '<p class="duel-pet-name">' + esc(p.pet.name) + ' · L' + p.level +
        ' · ' + (p.pet.type === 'attack' ? '⚔' : '🛡') + '</p>' +
        '<div class="hp-row">' + hearts + '</div></div></div>';
    }).join('');

    if (D.phase === 'choose') return screenChoose();
    if (D.phase === 'handover') return screenHandover();
    if (D.phase === 'answer') return screenAnswer();
    if (D.phase === 'result') return screenResult();
    if (D.phase === 'over') return screenOver();
  }

  function screenChoose() {
    var target = window.PETS.bite(me().pet, me().level);
    D.choices = offer(D.pool, target, D.used);
    D.el.stage.innerHTML =
      '<p class="duel-step">' + esc(me().name) + ', pick a question to send</p>' +
      '<p class="duel-sub">' + esc(me().pet.name) + ' found three. The harder you go, the harder it is for ' +
      esc(foe().name) + ' — and for you later, because they get the same pool.</p>' +
      '<div class="duel-picks">' + D.choices.map(function (q, i) {
        var pct = Math.round(q.diff * 100);
        var band = q.diff < 0.35 ? 'easy' : q.diff < 0.62 ? 'medium' : 'hard';
        return '<button type="button" class="duel-pick" data-pick="' + i + '">' +
          '<span class="duel-band is-' + band + '">' + band + ' · ' + pct + '%</span>' +
          '<span class="duel-qtext">' + esc(q.q.length > 110 ? q.q.slice(0, 110) + '…' : q.q) + '</span>' +
          '</button>';
      }).join('') + '</div>';

    D.el.stage.querySelectorAll('[data-pick]').forEach(function (b) {
      b.addEventListener('click', function () {
        D.current = D.choices[Number(b.dataset.pick)];
        D.used[D.current.q] = true;
        D.phase = 'handover';
        render();
      });
    });
  }

  function screenHandover() {
    D.el.stage.innerHTML =
      '<div class="duel-pass">' +
      '<p class="duel-step">Pass the device to ' + esc(foe().name) + '</p>' +
      '<p class="duel-sub">' + esc(me().name) + ' has chosen. No peeking until it is handed over.</p>' +
      '<button type="button" class="btn btn-primary btn-big" id="duel-ready">I am ' + esc(foe().name) + ', show me</button>' +
      '</div>';
    D.el.stage.querySelector('#duel-ready').addEventListener('click', function () {
      D.turn = 1 - D.turn;              /* the defender is now the active person on screen */
      D.phase = 'answer';
      D.hintUsed = false;
      render();
    });
  }

  function screenAnswer() {
    var q = D.current;
    D.el.stage.innerHTML =
      '<p class="duel-step">' + esc(me().name) + ', answer this</p>' +
      '<p class="duel-q">' + esc(q.q) + '</p>' +
      '<div class="duel-opts">' + q.a.map(function (a, i) {
        return '<button type="button" class="chase-opt" data-ans="' + i + '">' + esc(a) + '</button>';
      }).join('') + '</div>' +
      '<div class="duel-hint-row">' +
      '<button type="button" class="btn" id="duel-hint">🐾 Ask ' + esc(me().pet.name) + ' (once)</button>' +
      '<span class="hint">' + esc(window.PETS.summary(me().pet, me().level)) + '</span>' +
      '</div><div id="duel-hint-box"></div>';

    D.el.stage.querySelector('#duel-hint').addEventListener('click', function () {
      if (D.hintUsed) return;
      D.hintUsed = true;
      this.disabled = true;
      var lines = window.PETS.hints(q, D.topic, me().pet, me().level);
      D.el.stage.querySelector('#duel-hint-box').innerHTML =
        '<div class="pet-hint"><div class="pet-hint-who">' + window.PETS.draw(me().pet.id, me().level) +
        '<span>' + esc(me().pet.name) + ' says</span></div><div class="pet-hint-lines">' +
        lines.map(function (l) { return '<p><span aria-hidden="true">' + l.icon + '</span>' + esc(l.text) + '</p>'; }).join('') +
        '</div></div>';
    });

    D.el.stage.querySelectorAll('[data-ans]').forEach(function (b) {
      b.addEventListener('click', function () { answer(Number(b.dataset.ans), b); });
    });
  }

  function answer(i, btn) {
    var q = D.current, right = i === q.c;
    var attacker = D.players[1 - D.turn];

    D.el.stage.querySelectorAll('[data-ans]').forEach(function (b) { b.disabled = true; });
    btn.classList.add(right ? 'is-right' : 'is-wrong');
    if (!right) {
      var ok = D.el.stage.querySelector('[data-ans="' + q.c + '"]');
      if (ok) ok.classList.add('is-right');
    }

    if (right) {
      me().score++;
    } else {
      /* a well-fed attacking pet hits for two */
      var dmg = window.PETS.bite(attacker.pet, attacker.level) >= 0.7 ? 2 : 1;
      me().hp = Math.max(0, me().hp - dmg);
      D.lastDamage = dmg;
    }
    D.lastRight = right;
    D.phase = D.players.some(function (p) { return p.hp <= 0; }) ? 'over' : 'result';
    setTimeout(render, 900);
  }

  function screenResult() {
    var def = me();
    D.el.stage.innerHTML =
      '<div class="duel-outcome ' + (D.lastRight ? 'is-win' : 'is-lose') + '">' +
      '<p class="duel-step">' + (D.lastRight
        ? esc(def.name) + ' defended it.'
        : esc(def.name) + ' took ' + D.lastDamage + ' damage.') + '</p>' +
      '<p class="duel-sub">' + esc(D.current.why) + '</p>' +
      '<button type="button" class="btn btn-primary btn-big" id="duel-next">' +
      esc(def.name) + ', take your attack</button></div>';
    D.el.stage.querySelector('#duel-next').addEventListener('click', function () {
      D.round++;
      D.phase = 'choose';
      render();
    });
  }

  function screenOver() {
    var loser = D.players.filter(function (p) { return p.hp <= 0; })[0];
    var winner = D.players.filter(function (p) { return p.hp > 0; })[0] || D.players[0];
    D.el.stage.innerHTML =
      '<div class="duel-outcome is-win">' +
      '<p class="duel-step">' + esc(winner.name) + ' wins.</p>' +
      '<p class="duel-sub">' + esc(loser.name) + ' ran out of hearts after ' + D.round + ' rounds. ' +
      esc(winner.name) + ' answered ' + winner.score + ' right, ' + esc(loser.name) + ' answered ' + loser.score + '.</p>' +
      '<button type="button" class="btn btn-primary" id="duel-again">Duel again</button></div>';
    D.el.stage.querySelector('#duel-again').addEventListener('click', function () {
      if (D.onAgain) D.onAgain();
    });
    if (D.onEnd) { D.onEnd({ winner: winner, loser: loser, rounds: D.round }); D.onEnd = null; }
  }

  function snapshot() {
    return D && {
      phase: D.phase, turn: D.turn, round: D.round,
      hp: D.players.map(function (p) { return p.hp; }),
      scores: D.players.map(function (p) { return p.score; })
    };
  }

  window.DUEL = {
    /* opts: { el:{hp,stage}, topic, questions, players:[{name,pet,level}], onEnd, onAgain } */
    start: function (opts) {
      var pool = opts.questions.map(function (q) {
        var copy = {}; for (var k in q) copy[k] = q[k];
        copy.diff = difficulty(q, opts.topic);
        return copy;
      });
      D = {
        el: opts.el, topic: opts.topic, pool: pool, used: {},
        players: opts.players.map(function (p) {
          return { name: p.name, pet: p.pet, level: p.level, hp: MAX_HP, score: 0 };
        }),
        turn: 0, round: 1, phase: 'choose', hintUsed: false,
        onEnd: opts.onEnd, onAgain: opts.onAgain
      };
      render();
      return D;
    },

    stop: function () { D = null; },
    running: function () { return !!D && D.phase !== 'over'; },
    state: snapshot,

    /* test seam: answer the current question correctly or not, without clicking */
    forceAnswer: function (correct) {
      if (!D || D.phase !== 'answer') return null;
      var btn = D.el.stage.querySelector('[data-ans="' + (correct ? D.current.c : (D.current.c + 1) % D.current.a.length) + '"]');
      if (btn) btn.click();
      return snapshot();
    },

    difficulty: difficulty
  };
})();
