/* duel.js — teams of students throwing science questions at each other.

   One to four a side. On your attack your pet finds three questions and you choose which
   one to send; the harder your attacking pet, the harder the three. Someone on the other
   team answers it, and may spend one hint from their own pet. Get it wrong and your team
   loses hearts.

   Everyone attacks and everyone defends: each team keeps its own two pointers, one for who
   attacks next and one for who answers next, and both walk round the team. Hearts scale
   with the size of the team so a 4v4 does not end in two rounds.

   Three kinds of seat, all handled here:
     • a person on this device     — a hand-over screen first, so they do not see the pick
     • a robot                     — answers at random, one in three, after a short pause
     • a person on another device  — this side renders and waits; the host applies the move

   The rules live in this file only once. In an online duel the host runs them and publishes
   what the screen should say, so a guest is never running a second, drifting copy. */

(function () {
  'use strict';

  var D = null;

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

  /* ── whose turn ───────────────────────────────────── */

  function attackTeam() { return D.teams[D.turn]; }
  function defendTeam() { return D.teams[1 - D.turn]; }

  function attacker() {
    var t = attackTeam();
    return t.members[t.attackIdx % t.members.length];
  }

  function defender() {
    var t = defendTeam();
    return t.members[t.defendIdx % t.members.length];
  }

  function advanceSeats() {
    attackTeam().attackIdx++;
    defendTeam().defendIdx++;
  }

  function isMine(member) {
    if (!member) return false;
    if (member.ai) return false;
    if (!D.remote) return true;               /* one device: every person here is you */
    return D.localIds.indexOf(member.id) !== -1;
  }

  function bite(member) {
    return member.pet ? window.PETS.bite(member.pet, member.level) : 0.4;
  }

  /* ── the scoreboard ───────────────────────────────── */

  function memberChip(m, role) {
    var art = m.pet ? window.PETS.draw(m.pet.id, m.level) : '';
    return '<li class="duel-seat' + (role ? ' is-' + role : '') + (m.ai ? ' is-ai' : '') + '">' +
      '<span class="duel-seat-pet">' + art + '</span>' +
      '<span class="duel-seat-text">' +
      '<b>' + esc(m.name) + '</b>' +
      '<span>' + (m.ai ? 'robot · 1 in 3' : (m.pet ? esc(m.pet.name) + ' L' + m.level : 'no pet')) +
      (m.pet ? ' · ' + (m.pet.type === 'attack' ? '⚔' : '\u{1F6E1}') : '') + '</span>' +
      '</span>' +
      (role ? '<span class="duel-role">' + (role === 'attack' ? 'attacking' : 'answering') + '</span>' : '') +
      '</li>';
  }

  function render() {
    if (!D) return;
    var atk = D.phase === 'over' ? null : attacker();
    var def = D.phase === 'over' ? null : defender();

    D.el.hp.innerHTML = D.teams.map(function (t, i) {
      var hearts = '';
      for (var h = 0; h < t.maxHp; h++) hearts += '<span class="hp' + (h < t.hp ? ' is-on' : '') + '"></span>';
      return '<div class="duel-team' + (i === D.turn ? ' is-turn' : '') + '">' +
        '<div class="duel-team-head"><p class="duel-who">' + esc(t.name) + '</p>' +
        '<div class="hp-row">' + hearts + '</div></div>' +
        '<ul class="duel-seats">' + t.members.map(function (m) {
          return memberChip(m, atk && m.id === atk.id ? 'attack' : (def && m.id === def.id ? 'defend' : ''));
        }).join('') + '</ul></div>';
    }).join('');

    if (D.phase === 'choose') return screenChoose();
    if (D.phase === 'handover') return screenHandover();
    if (D.phase === 'answer') return screenAnswer();
    if (D.phase === 'result') return screenResult();
    if (D.phase === 'over') return screenOver();
  }

  /* ── choosing a question ──────────────────────────── */

  function screenChoose() {
    var me = attacker(), foe = defender();
    D.choices = D.choices && D.choicesFor === me.id ? D.choices : null;
    if (!D.choices) {
      D.choices = offer(D.pool, bite(me), D.used);
      D.choicesFor = me.id;
    }

    if (!isMine(me)) {
      /* a robot picks for itself; a player on another device picks on theirs */
      D.el.stage.innerHTML =
        '<div class="duel-wait">' +
        '<p class="duel-step">' + esc(me.name) + ' is choosing a question' +
        (me.ai ? ' at random' : '') + '…</p>' +
        '<p class="duel-sub">It will be sent to ' + esc(foe.name) + '.</p>' +
        '<div class="duel-dots" aria-hidden="true"><i></i><i></i><i></i></div>' +
        '</div>';
      if (me.ai) {
        D.timer = setTimeout(function () {
          if (!D || D.phase !== 'choose') return;
          takeChoice(window.PARTY.robotPick(D.choices));
        }, window.PARTY.robotPause(D.reduced));
      }
      publish();
      return;
    }

    D.el.stage.innerHTML =
      '<p class="duel-step">' + esc(me.name) + ', pick a question to send</p>' +
      '<p class="duel-sub">' + (me.pet ? esc(me.pet.name) + ' found three' : 'Three to choose from') +
      '. The harder you go, the harder it is for ' + esc(foe.name) +
      ' — and for your own team later, because everyone draws from the same pool.</p>' +
      '<div class="duel-picks">' + D.choices.map(function (q, i) {
        var pct = Math.round(q.diff * 100);
        var band = q.diff < 0.35 ? 'easy' : q.diff < 0.62 ? 'medium' : 'hard';
        return '<button type="button" class="duel-pick" data-pick="' + i + '">' +
          '<span class="duel-band is-' + band + '">' + band + ' · ' + pct + '%</span>' +
          '<span class="duel-qtext">' + esc(q.q.length > 110 ? q.q.slice(0, 110) + '…' : q.q) + '</span>' +
          '</button>';
      }).join('') + '</div>';

    D.el.stage.querySelectorAll('[data-pick]').forEach(function (b) {
      b.addEventListener('click', function () { takeChoice(Number(b.dataset.pick)); });
    });
    publish();
  }

  function takeChoice(i) {
    if (!D || D.phase !== 'choose') return;
    clearTimeout(D.timer);
    D.current = D.choices[i];
    if (!D.current) return;
    D.used[D.current.q] = true;
    D.choices = null;
    D.choicesFor = null;
    D.hintUsed = false;

    var def = defender();
    /* a robot or a player elsewhere needs no hand-over; a second person here does */
    D.phase = (def.ai || D.remote) ? 'answer' : 'handover';
    render();
    if (D.phase === 'answer' && def.ai) scheduleRobotAnswer();
  }

  function screenHandover() {
    var def = defender();
    D.el.stage.innerHTML =
      '<div class="duel-pass">' +
      '<p class="duel-step">Pass the device to ' + esc(def.name) + '</p>' +
      '<p class="duel-sub">' + esc(attacker().name) + ' has chosen. No peeking until it is handed over.</p>' +
      '<button type="button" class="btn btn-primary btn-big" id="duel-ready">I am ' + esc(def.name) + ', show me</button>' +
      '</div>';
    D.el.stage.querySelector('#duel-ready').addEventListener('click', function () {
      D.phase = 'answer';
      render();
    });
  }

  /* ── answering ────────────────────────────────────── */

  function scheduleRobotAnswer() {
    D.timer = setTimeout(function () {
      if (!D || D.phase !== 'answer') return;
      var pick = window.PARTY.robotAnswer(D.current);
      var btn = D.el.stage.querySelector('[data-ans="' + pick + '"]');
      answer(pick, btn);
    }, window.PARTY.robotPause(D.reduced) + 400);
  }

  function screenAnswer() {
    var q = D.current, def = defender(), mine = isMine(def);
    D.el.stage.innerHTML =
      '<p class="duel-step">' + esc(def.name) + (mine ? ', answer this' : ' is answering…') + '</p>' +
      '<p class="duel-q">' + esc(q.q) + '</p>' +
      '<div class="duel-opts">' + q.a.map(function (a, i) {
        return '<button type="button" class="chase-opt" data-ans="' + i + '"' +
          (mine ? '' : ' disabled') + '>' + esc(a) + '</button>';
      }).join('') + '</div>' +
      (mine && def.pet
        ? '<div class="duel-hint-row">' +
          '<button type="button" class="btn" id="duel-hint">\u{1F43E} Ask ' + esc(def.pet.name) + ' (once)</button>' +
          '<span class="hint">' + esc(window.PETS.summary(def.pet, def.level)) + '</span>' +
          '</div>'
        : (def.ai ? '<p class="hint duel-ai-note">A robot picks one of the three at random, so it gets about one in three right.</p>' : '')) +
      '<div id="duel-hint-box"></div>';

    var hintBtn = D.el.stage.querySelector('#duel-hint');
    if (hintBtn) {
      hintBtn.addEventListener('click', function () {
        if (D.hintUsed) return;
        D.hintUsed = true;
        this.disabled = true;
        var lines = window.PETS.hints(q, D.topic, def.pet, def.level);
        D.el.stage.querySelector('#duel-hint-box').innerHTML =
          '<div class="pet-hint"><div class="pet-hint-who">' + window.PETS.draw(def.pet.id, def.level) +
          '<span>' + esc(def.pet.name) + ' says</span></div><div class="pet-hint-lines">' +
          lines.map(function (l) { return '<p><span aria-hidden="true">' + l.icon + '</span>' + esc(l.text) + '</p>'; }).join('') +
          '</div></div>';
      });
    }

    D.el.stage.querySelectorAll('[data-ans]').forEach(function (b) {
      b.addEventListener('click', function () { answer(Number(b.dataset.ans), b); });
    });
    publish();
  }

  function answer(i, btn) {
    if (!D || D.phase !== 'answer') return;
    clearTimeout(D.timer);
    var q = D.current, right = i === q.c;
    var atk = attacker(), def = defender();
    var defTeam = defendTeam();

    D.el.stage.querySelectorAll('[data-ans]').forEach(function (b) { b.disabled = true; });
    if (btn) btn.classList.add(right ? 'is-right' : 'is-wrong');
    if (!right) {
      var ok = D.el.stage.querySelector('[data-ans="' + q.c + '"]');
      if (ok) ok.classList.add('is-right');
    }

    if (right) {
      def.score = (def.score || 0) + 1;
      defTeam.score++;
      D.lastDamage = 0;
    } else {
      /* a well-fed attacking pet hits for two */
      var dmg = bite(atk) >= 0.7 ? 2 : 1;
      defTeam.hp = Math.max(0, defTeam.hp - dmg);
      D.lastDamage = dmg;
    }
    D.lastRight = right;
    D.lastDefender = def;
    D.round++;
    D.phase = D.teams.some(function (t) { return t.hp <= 0; }) ? 'over' : 'result';
    D.timer = setTimeout(render, 900);
  }

  function screenResult() {
    var def = D.lastDefender;
    var nextAtk;
    /* work out who is up next before the pointers move, so the button can name them */
    advanceSeats();
    D.turn = 1 - D.turn;
    nextAtk = attacker();

    D.el.stage.innerHTML =
      '<div class="duel-outcome ' + (D.lastRight ? 'is-win' : 'is-lose') + '">' +
      '<p class="duel-step">' + (D.lastRight
        ? esc(def.name) + ' defended it.'
        : esc(def.name) + ' missed it — ' + D.lastDamage + ' heart' + (D.lastDamage === 1 ? '' : 's') + ' gone.') + '</p>' +
      '<p class="duel-sub">' + esc(D.current.why) + '</p>' +
      (isMine(nextAtk)
        ? '<button type="button" class="btn btn-primary btn-big" id="duel-next">' +
          esc(nextAtk.name) + ', take your attack</button>'
        : '<p class="duel-sub duel-next-note">Next up: ' + esc(nextAtk.name) + '.</p>') +
      '</div>';

    var next = D.el.stage.querySelector('#duel-next');
    if (next) {
      next.addEventListener('click', function () { D.phase = 'choose'; render(); });
    } else {
      D.timer = setTimeout(function () {
        if (!D || D.phase !== 'result') return;
        D.phase = 'choose';
        render();
      }, nextAtk.ai ? 700 : 1200);
    }
    publish();
  }

  function screenOver() {
    var loser = D.teams.filter(function (t) { return t.hp <= 0; })[0] || D.teams[1];
    var winner = D.teams.filter(function (t) { return t.hp > 0; })[0] || D.teams[0];
    var best = winner.members.slice().sort(function (a, b) {
      return (b.score || 0) - (a.score || 0);
    })[0];

    D.el.stage.innerHTML =
      '<div class="duel-outcome is-win">' +
      '<p class="duel-step">' + esc(winner.name) + ' wins.</p>' +
      '<p class="duel-sub">' + esc(loser.name) + ' ran out of hearts after ' + D.round + ' rounds. ' +
      esc(winner.name) + ' answered ' + winner.score + ' right, ' +
      esc(loser.name) + ' answered ' + loser.score + '.' +
      (best && best.score ? ' Best on the winning side: ' + esc(best.name) + ' with ' + best.score + '.' : '') +
      '</p>' +
      '<button type="button" class="btn btn-primary" id="duel-again">Set up another</button></div>';
    D.el.stage.querySelector('#duel-again').addEventListener('click', function () {
      if (D && D.onAgain) D.onAgain();
    });
    publish();
    if (D.onEnd) {
      D.onEnd({ winner: winner, loser: loser, rounds: D.round, teams: D.teams });
      D.onEnd = null;
    }
  }

  /* ── what a guest on another device needs to see ──── */

  function publish() {
    if (D && D.onState) D.onState(snapshot());
  }

  function snapshot() {
    if (!D) return null;
    return {
      phase: D.phase, turn: D.turn, round: D.round,
      hp: D.teams.map(function (t) { return t.hp; }),
      maxHp: D.teams.map(function (t) { return t.maxHp; }),
      scores: D.teams.map(function (t) { return t.score; }),
      attacker: D.phase === 'over' ? null : attacker().id,
      defender: D.phase === 'over' ? null : defender().id,
      question: D.current ? D.current.q : null,
      /* only the stems travel. The other device has the same library, so it looks the
         options up itself rather than us sending four copies of everything. */
      choices: D.phase === 'choose' && D.choices
        ? D.choices.map(function (q) { return { q: q.q, diff: q.diff }; })
        : null,
      lastRight: D.lastRight,
      lastDamage: D.lastDamage,
      why: D.phase === 'result' && D.current ? D.current.why : null,
      lastDefender: D.lastDefender ? D.lastDefender.name : null
    };
  }

  window.DUEL = {
    /* opts: {
         el: { hp, stage }, topic, questions,
         teams: [ { name, members: [ { id, name, pet, level, ai } ] }, … ],
         maxHp, remote, localIds, reduced, onEnd, onAgain, onState
       } */
    start: function (opts) {
      this.stop();
      var pool = opts.questions.map(function (q) {
        var copy = {}; for (var k in q) copy[k] = q[k];
        copy.diff = difficulty(q, opts.topic);
        return copy;
      });
      var hp = opts.maxHp || 5;
      D = {
        el: opts.el, topic: opts.topic, pool: pool, used: {},
        teams: opts.teams.map(function (t) {
          return {
            name: t.name,
            members: t.members.map(function (m) {
              return {
                id: m.id, name: m.name, pet: m.pet || null,
                level: m.level || 1, ai: !!m.ai, score: 0
              };
            }),
            hp: hp, maxHp: hp, score: 0, attackIdx: 0, defendIdx: 0
          };
        }),
        turn: 0, round: 1, phase: 'choose', hintUsed: false,
        remote: !!opts.remote,
        localIds: opts.localIds || [],
        reduced: !!opts.reduced,
        onEnd: opts.onEnd, onAgain: opts.onAgain, onState: opts.onState,
        timer: null
      };
      render();
      return D;
    },

    stop: function () {
      if (D) clearTimeout(D.timer);
      D = null;
    },
    running: function () { return !!D && D.phase !== 'over'; },
    state: snapshot,

    /* a move that arrived from another device */
    applyRemote: function (action) {
      if (!D) return null;
      if (action.type === 'pick' && D.phase === 'choose') takeChoice(action.index);
      else if (action.type === 'answer' && D.phase === 'answer') {
        answer(action.index, D.el.stage.querySelector('[data-ans="' + action.index + '"]'));
      } else if (action.type === 'ready' && D.phase === 'handover') {
        D.phase = 'answer';
        render();
      }
      return snapshot();
    },

    /* test seam: answer the current question correctly or not, without clicking */
    forceAnswer: function (correct) {
      if (!D || D.phase !== 'answer') return null;
      var want = correct ? D.current.c : (D.current.c + 1) % D.current.a.length;
      var btn = D.el.stage.querySelector('[data-ans="' + want + '"]');
      answer(want, btn);
      return snapshot();
    },

    /* test seam: take the first offered question, whoever is choosing */
    forcePick: function (index) {
      if (!D || D.phase !== 'choose') return null;
      takeChoice(index || 0);
      return snapshot();
    },

    difficulty: difficulty
  };
})();
