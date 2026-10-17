/* chase.js — Escape the Monster.
   A thing is chasing you. Every right answer is a burst of speed; every wrong one lets it
   close in. Reach the exit and a chest pays out.

   This file owns the running, the questions and the chest. Where you are and what is after
   you lives in worlds.js: level 1 is the slime in the dark wood, level 2 the alien in
   space, level 3 the backrooms, and level 4 starts the rotation again, tighter. Keeping the
   scenery out of here means a new monster is a new entry in that table, not a new branch in
   this one.

   Spooky, not nasty. No blood, no jump scares, no sound — and a "less scary" switch that
   calms all three of them down. Everything is drawn in code on a canvas, so a whole new
   world costs nothing to download. */

(function () {
  'use strict';

  var G = null;                      /* the running game, or null */

  /* Tuned so a good run still feels tight: answering right roughly cancels the ground the
     thing takes while you read, so the gap drifts slowly down instead of running away.
     Get one wrong and you feel it immediately.

     These are the dark wood's numbers, which is level 1. Every world carries its own set and
     every lap of the rotation tightens them — see WORLDS.tuneFor. The running game keeps
     its own copy in G.cfg, so nothing here is global state that a later level can corrupt. */
  var BASE_CFG = {
    goal: 900,                       /* metres to the exit */
    startGap: 46,                    /* metres of head start */
    maxGap: 56,                      /* a small cushion, so right answers cannot bank safety */
    boost: 15,                       /* metres gained for a right answer */
    penalty: 10,                     /* metres lost for a wrong one */
    baseClose: 4,                    /* how fast it closes, metres per second */
    ramp: 0.06                       /* and how much that speeds up each second */
  };

  function cfgFor(level) {
    return (window.WORLDS && window.WORLDS.tuneFor(level)) || BASE_CFG;
  }

  function worldFor(level) {
    return (window.WORLDS && window.WORLDS.forLevel(level)) || null;
  }

  function rnd(seed) {               /* small deterministic random, so a run is repeatable */
    var s = seed % 2147483647;
    if (s <= 0) s += 2147483646;
    return function () {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
  }

  /* ── drawing ───────────────────────────────────────── */

  function paint(g, t) {
    var c = g.ctx, W = g.w, H = g.h;
    var ground = H * 0.78;
    var shake = g.shakeUntil > t && !g.calm && !g.reduced
      ? (Math.sin(t * 60) * 3 * ((g.shakeUntil - t) / 400)) : 0;

    c.setTransform(1, 0, 0, 1, 0, shake);
    c.clearRect(0, -10, W, H + 20);

    /* the world paints its own sky, its own parallax and its own ground */
    g.world.scene(c, g, ground);

    /* ground streaks, to show speed */
    c.strokeStyle = g.world.streak;
    c.lineWidth = 2;
    for (var i = 0; i < 14; i++) {
      var sx = (i * 97 - (g.scroll * 1.6) % 97 * 14) % (W + 120) - 60;
      var sy = ground + 10 + (i % 5) * ((H - ground) / 5);
      c.beginPath();
      c.moveTo(sx, sy);
      c.lineTo(sx + 26 + g.speedLines * 40, sy);
      c.stroke();
    }

    /* the exit you are running for, sliding in as you get close */
    var left = Math.max(0, g.cfg.goal - g.run);
    if (left < 140) {
      var d = g.world.door;
      var dx = W * 0.72 + (left / 140) * W * 0.6;
      var dh = H * 0.34, dw = dh * 0.56;
      c.fillStyle = d.glow;
      c.globalAlpha = 0.28;
      c.fillRect(dx - 14, ground - dh - 14, dw + 28, dh + 14);
      c.globalAlpha = 1;
      c.fillStyle = d.face;
      c.fillRect(dx, ground - dh, dw, dh);
      c.fillStyle = d.ink;
      c.font = '600 13px ui-sans-serif, system-ui, sans-serif';
      c.textAlign = 'center';
      c.fillText('EXIT', dx + dw / 2, ground - dh / 2);
    }

    drawMonster(g, t, ground);
    drawRunner(g, t, ground);
    c.setTransform(1, 0, 0, 1, 0, 0);
  }

  /* how close the thing feels, 0 far away … 1 right behind you */
  function closeness(g) {
    return Math.max(0, Math.min(1, 1 - g.gap / g.cfg.startGap));
  }

  function drawMonster(g, t, ground) {
    /* position, scale and bob are the same wherever you are — only the creature changes,
       so a world's monsterArt draws in plain local coordinates with the ground at y = 0. */
    var c = g.ctx, W = g.w, H = g.h;
    var k = closeness(g);
    var x = W * (0.02 + 0.30 * k);
    var scale = (0.55 + 1.05 * k) * (H / 300);
    var bob = Math.sin(t / (g.reduced ? 900 : 170)) * 5 * scale;

    c.save();
    c.translate(x, ground + bob);
    c.scale(scale, scale);
    g.world.monsterArt(c, g, t, k);
    c.restore();
  }

  function drawRunner(g, t, ground) {
    var c = g.ctx, W = g.w, H = g.h;
    var scale = H / 300;
    var x = W * 0.66;
    var cycle = t / (g.reduced ? 420 : 115) + g.speedLines * 3;
    var bob = Math.abs(Math.sin(cycle)) * 4 * scale;

    c.save();
    c.translate(x, ground - bob);
    c.scale(scale, scale);

    c.fillStyle = 'rgba(0,0,0,.4)';
    c.beginPath();
    c.ellipse(0, 3, 22, 6, 0, 0, 7);
    c.fill();

    var skin = '#f0c9a4', coat = g.calm ? '#bfe7dc' : '#eef1f5', hair = '#2b2119';

    /* legs */
    c.strokeStyle = '#33405a';
    c.lineWidth = 6;
    c.lineCap = 'round';
    c.beginPath();
    c.moveTo(0, -26);
    c.lineTo(Math.sin(cycle) * 14, -2);
    c.stroke();
    c.beginPath();
    c.moveTo(0, -26);
    c.lineTo(Math.sin(cycle + Math.PI) * 14, -2);
    c.stroke();

    /* body, in a lab coat */
    c.fillStyle = coat;
    c.beginPath();
    c.moveTo(-11, -28);
    c.quadraticCurveTo(-13, -56, 0, -58);
    c.quadraticCurveTo(13, -56, 11, -28);
    c.closePath();
    c.fill();

    /* arms pumping */
    c.strokeStyle = coat;
    c.lineWidth = 5;
    c.beginPath();
    c.moveTo(-6, -52);
    c.lineTo(-6 + Math.sin(cycle + Math.PI) * 13, -36);
    c.stroke();
    c.beginPath();
    c.moveTo(6, -52);
    c.lineTo(6 + Math.sin(cycle) * 13, -36);
    c.stroke();

    /* head, looking back over the shoulder */
    c.fillStyle = skin;
    c.beginPath();
    c.arc(-1, -68, 10, 0, 7);
    c.fill();
    c.fillStyle = hair;
    c.beginPath();
    c.arc(-1, -71, 10, Math.PI * 0.95, Math.PI * 2.1);
    c.fill();
    c.fillStyle = '#1b1b22';
    c.beginPath();
    c.arc(-7, -67, 1.8, 0, 7);
    c.fill();

    c.restore();
  }

  /* ── the loop ──────────────────────────────────────── */

  /* The physics is one function so it can be driven three ways: animation frames when the
     page is on screen, a slower watchdog when frames stall (a background tab stops sending
     them, and so does a hidden preview pane), and directly from tests. */
  function simulate(dt) {
    dt = Math.min(0.05, dt);
    /* While a wrong answer is being explained the chase holds still. Reading why you were
       wrong is the point of the game, and it should not be the moment you get eaten. */
    if (G.frozen) { G.clock += dt; hud(); return true; }
    G.t += dt;
    G.clock += dt;   /* the run clock keeps going while you read the explanation: a
                        speed run is a speed run, and the pause is part of the cost */

    var closing = G.cfg.baseClose + G.t * G.cfg.ramp;
    G.gap -= closing * dt;
    if (G.boostLeft > 0) G.boostLeft -= dt;
    G.gap = Math.min(G.cfg.maxGap, G.gap);

    var pace = 26 + (G.boostLeft > 0 ? 34 : 0);
    G.run += pace * dt;
    G.scroll += pace * dt * (G.reduced ? 0.5 : 1.6);
    G.speedLines = Math.max(0, G.boostLeft);

    hud();
    if (G.gap <= 0) { finish(false); return false; }
    if (G.run >= G.cfg.goal) { finish(true); return false; }
    return true;
  }

  function step(now) {
    if (!G || !G.running) return;
    G.lastFrame = now;
    var dt = (now - G.last) / 1000;
    G.last = now;
    if (simulate(dt)) {
      paint(G, now);
      G.raf = requestAnimationFrame(step);
    }
  }

  /* if animation frames dry up, keep the run going at a coarser tick */
  function watchdog() {
    if (!G || !G.running) return;
    var now = performance.now();
    if (now - G.lastFrame < 220) return;      /* frames are flowing, nothing to do */
    if (document.hidden) { G.last = now; return; }   /* tab in the background: hold still */
    var dt = (now - G.last) / 1000;
    G.last = now;
    G.lastFrame = now;
    if (simulate(dt)) {
      paint(G, now);
      cancelAnimationFrame(G.raf);
      G.raf = requestAnimationFrame(step);
    }
  }

  function hud() {
    var pct = Math.max(0, Math.min(100, (G.run / G.cfg.goal) * 100));
    G.el.bar.style.width = pct + '%';
    G.el.dist.textContent = Math.max(0, Math.round(G.cfg.goal - G.run)) + ' m to the exit';
    var m = Math.max(0, Math.round(G.gap));
    G.el.gap.textContent = m + ' m behind you';
    G.el.gap.classList.toggle('is-panic', m <= 14);
    G.el.wrap.classList.toggle('is-near', closeness(G) > 0.62);
    if (G.el.clock) G.el.clock.textContent = clockText(G.clock);
  }

  /* m:ss.t — tenths, because a speed run is won and lost in them */
  function clockText(secs) {
    var s = Math.max(0, secs);
    var m = Math.floor(s / 60);
    var r = s - m * 60;
    return m + ':' + (r < 10 ? '0' : '') + r.toFixed(1);
  }

  /* ── questions ─────────────────────────────────────── */

  function ask() {
    if (!G) return;
    var q = G.queue[G.asked % G.queue.length];
    G.current = q;
    G.asked++;
    G.el.q.textContent = q.q;
    G.el.opts.innerHTML = q.a.map(function (a, i) {
      return '<button type="button" class="chase-opt" data-i="' + i + '">' + esc(a) + '</button>';
    }).join('');
    G.el.opts.querySelectorAll('[data-i]').forEach(function (b) {
      b.addEventListener('click', function () { answer(Number(b.dataset.i), b); });
    });
    G.el.feedback.textContent = '';
    G.el.feedback.className = 'chase-feedback';
  }

  function answer(i, btn) {
    if (!G || !G.running || G.locked) return;
    G.locked = true;
    var q = G.current, right = i === q.c;

    if (right) {
      G.right++;
      G.gap = Math.min(G.cfg.maxGap, G.gap + G.cfg.boost);
      G.boostLeft = 1.4;
      btn.classList.add('is-right');
      G.el.feedback.textContent = 'Go! +' + G.cfg.boost + ' m';
      G.el.feedback.className = 'chase-feedback is-good';
    } else {
      G.wrong.push(q);
      G.gap -= G.cfg.penalty;
      G.frozen = true;
      G.shakeUntil = performance.now() + 400;
      btn.classList.add('is-wrong');
      var ok = G.el.opts.querySelector('[data-i="' + q.c + '"]');
      if (ok) ok.classList.add('is-right');
      G.el.feedback.textContent = 'It gained on you — ' + q.why;
      G.el.feedback.className = 'chase-feedback is-bad';
    }

    setTimeout(function () {
      if (!G) return;
      G.locked = false;
      G.frozen = false;
      G.last = performance.now();     /* do not bank the paused time as elapsed */
      if (G.running) ask();
    }, right ? 420 : 1800);
  }

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* ── start and finish ──────────────────────────────── */

  /* ── ordering the questions ──────────────────
     The first question of a run should be short enough to take in at a glance, and the last
     should be the kind a test ends on. app.js weighs each question by how many words you
     have to read and how deep into the topic it sits.

     Sorting on that alone is not enough: a run only gets through about fifteen questions out
     of a pool of forty, so it would never leave the easy end. Instead we sort, then walk the
     sorted pool in strides — the first pick from the very bottom, the last from the very top
     — so the climb happens inside the run you actually play. Whatever is left over follows in
     order, for a run that goes long. */

  var RUN_LENGTH = 15;         /* about how many questions one escape takes */

  function ramp(pool, level, r) {
    if (!pool.length || typeof pool[0].weight !== 'number') {
      return pool.slice().sort(function () { return r() - 0.5; });
    }
    var sorted = pool.slice().sort(function (a, b) {
      return (a.weight + r() * 2) - (b.weight + r() * 2);
    });

    /* later levels start further up the ramp, so level 6 opens where level 1 ended up */
    var lo = Math.min(0.5, (Math.max(1, level) - 1) * 0.06);
    var from = Math.floor(sorted.length * lo);
    var span = sorted.length - 1;
    var steps = Math.min(RUN_LENGTH, sorted.length);

    var taken = {}, out = [];
    for (var k = 0; k < steps; k++) {
      var at = steps === 1 ? from
        : Math.round(from + (k / (steps - 1)) * (span - from));
      while (taken[at] && at < span) at++;
      while (taken[at] && at > 0) at--;
      if (taken[at]) continue;
      taken[at] = true;
      out.push(sorted[at]);
    }
    sorted.forEach(function (q, i) { if (!taken[i]) out.push(q); });
    return out;
  }

  function sizeCanvas(g) {
    var rect = g.el.canvas.getBoundingClientRect();
    if (!rect.width) rect = g.el.wrap.getBoundingClientRect();   /* canvas not laid out yet */
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    g.w = Math.max(320, Math.round(rect.width));
    g.h = Math.round(g.w * 9 / 16);
    g.el.canvas.width = Math.round(g.w * dpr);
    g.el.canvas.height = Math.round(g.h * dpr);
    g.el.canvas.style.height = g.h + 'px';
    g.ctx = g.el.canvas.getContext('2d');
    g.ctx.scale(dpr, dpr);
  }

  function finish(escaped) {
    if (!G) return;
    G.running = false;
    cancelAnimationFrame(G.raf);
    clearInterval(G.tick);
    G.el.wrap.classList.remove('is-near');
    G.el.play.hidden = true;
    G.el.over.hidden = false;
    G.el.over.className = 'chase-over ' + (escaped ? 'is-win' : 'is-lose');
    G.el.overTitle.textContent = escaped ? G.world.beat : G.world.lost;
    G.el.overSub.textContent = escaped
      ? 'Level ' + G.level + ' clear in ' + clockText(G.clock) + '. You answered ' + G.right +
        ' right out of ' + G.asked + ', and ran ' + G.cfg.goal + ' metres.'
      : 'You got ' + G.right + ' right and covered ' + Math.round(G.run) + ' of ' + G.cfg.goal +
        ' metres. The questions below are the ones that slowed you down.';
    if (G.onEnd) {
      G.onEnd({
        escaped: escaped, right: G.right, asked: G.asked, wrong: G.wrong.slice(),
        level: G.level, world: G.world, bounty: G.world.bounty,
        ms: Math.round(G.clock * 1000), timeText: clockText(G.clock)
      });
    }
  }

  window.CHASE = {
    /* opts: { el, questions, reduced, calm, level, onEnd } */
    start: function (opts) {
      this.stop();
      var level = Math.max(1, opts.level || 1);
      var cfg = cfgFor(level);
      var world = worldFor(level);
      if (!world) throw new Error('chase: worlds.js has not loaded');
      G = {
        el: opts.el,
        queue: opts.questions.slice(),
        reduced: !!opts.reduced,
        calm: !!opts.calm,
        onEnd: opts.onEnd,
        level: level, world: world, cfg: cfg,
        gap: cfg.startGap, run: 0, scroll: 0, t: 0, boostLeft: 0, speedLines: 0,
        right: 0, asked: 0, wrong: [], locked: false, frozen: false, shakeUntil: 0,
        clock: 0, running: true, last: performance.now()
      };
      if (G.el.canvas) G.el.canvas.setAttribute('aria-label', world.aria);
      var r = rnd(Date.now() % 100000);
      G.queue = ramp(G.queue, level, r);

      G.lastFrame = G.last;
      sizeCanvas(G);
      G.el.over.hidden = true;
      G.el.play.hidden = false;
      hud();
      ask();
      paint(G, G.last);

      /* the first measurement can land before the layout settles, so take it again */
      setTimeout(function () { if (G) { sizeCanvas(G); paint(G, performance.now()); } }, 60);
      if (window.ResizeObserver && !G.ro) {
        G.ro = new ResizeObserver(function () { if (G && G.running) { sizeCanvas(G); paint(G, performance.now()); } });
        G.ro.observe(G.el.wrap);
      }

      G.raf = requestAnimationFrame(step);
      G.tick = setInterval(watchdog, 120);
      return G;
    },

    setCalm: function (on) { if (G) G.calm = !!on; },

    resize: function () { if (G) { sizeCanvas(G); paint(G, performance.now()); } },

    stop: function () {
      if (G) {
        G.running = false;
        cancelAnimationFrame(G.raf);
        clearInterval(G.tick);
        if (G.ro) G.ro.disconnect();
      }
      G = null;
    },

    /* test seam: answer the question on screen without having to read it */
    forceAnswer: function (correct) {
      if (!G || !G.running || G.locked) return null;
      var want = correct ? G.current.c : (G.current.c + 1) % G.current.a.length;
      var btn = G.el.opts.querySelector('[data-i="' + want + '"]');
      if (btn) btn.click();
      return { gap: G.gap, run: G.run, right: G.right, asked: G.asked };
    },

    /* test seam: advance the run, in the same small slices the real loop uses */
    advance: function (seconds) {
      if (!G || !G.running) return null;
      var left = seconds;
      while (left > 0 && G && G.running) {
        var slice = Math.min(0.05, left);
        left -= slice;
        if (!simulate(slice)) break;
      }
      return G ? { gap: G.gap, run: G.run, running: G.running } : { ended: true };
    },

    clockText: clockText,
    runLength: RUN_LENGTH,

    /* test seam: the order a pool would be asked in, without starting a game */
    plan: function (pool, level) {
      return ramp(pool, level || 1, rnd(1)).map(function (q) { return q.weight; });
    },


    state: function () {
      return G && {
        gap: G.gap, run: G.run, right: G.right, asked: G.asked, running: G.running,
        level: G.level, world: G.world.id, goal: G.cfg.goal,
        ms: Math.round(G.clock * 1000),
        /* how long the questions on screen have been, so the ramp can be checked */
        nextWeight: G.queue[G.asked % G.queue.length] ? G.queue[G.asked % G.queue.length].weight : null
      };
    },

    running: function () { return !!(G && G.running); }
  };
})();
