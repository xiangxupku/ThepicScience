/* chase.js — Escape the Monster.
   A thing is chasing you down a dark corridor. Every right answer is a burst of speed;
   every wrong one lets it close in. Answer enough and you reach the door.

   Spooky, not nasty: a shadow with glowing eyes and too many teeth. No blood, no jump
   scares, no sudden noise — and a "less scary" switch that calms the whole thing down.
   Everything is drawn in code on a canvas, so there is nothing to download. */

(function () {
  'use strict';

  var G = null;                      /* the running game, or null */

  /* Tuned so a good run still feels tight: answering right roughly cancels the ground the
     thing takes while you read, so the gap drifts slowly down instead of running away.
     Get one wrong and you feel it immediately. */
  var CFG = {
    goal: 900,                       /* metres to the door */
    startGap: 46,                    /* metres of head start */
    maxGap: 56,                      /* a small cushion, so right answers cannot bank safety */
    boost: 15,                       /* metres gained for a right answer */
    penalty: 10,                     /* metres lost for a wrong one */
    baseClose: 4,                    /* how fast it closes, metres per second */
    ramp: 0.06                       /* and how much that speeds up each second */
  };

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

    /* sky and fog */
    var sky = c.createLinearGradient(0, 0, 0, ground);
    if (g.calm) { sky.addColorStop(0, '#1d2740'); sky.addColorStop(1, '#3b4a6b'); }
    else { sky.addColorStop(0, '#07070d'); sky.addColorStop(1, '#241026'); }
    c.fillStyle = sky;
    c.fillRect(0, -10, W, ground + 10);

    /* moon */
    c.globalAlpha = 0.9;
    c.fillStyle = g.calm ? '#cfe0ff' : '#e8e2d0';
    c.beginPath();
    c.arc(W * 0.82, H * 0.2, Math.max(16, W * 0.035), 0, 7);
    c.fill();
    c.globalAlpha = 1;

    /* three parallax bands of trees */
    var bands = [
      { speed: 0.12, h: 0.30, col: g.calm ? '#243356' : '#120a1c', step: 90 },
      { speed: 0.34, h: 0.22, col: g.calm ? '#1b2742' : '#0c0615', step: 64 },
      { speed: 0.72, h: 0.15, col: g.calm ? '#141d33' : '#06030c', step: 42 }
    ];
    bands.forEach(function (b, bi) {
      c.fillStyle = b.col;
      var off = (g.scroll * b.speed) % b.step;
      for (var x = -b.step; x < W + b.step; x += b.step) {
        var px = x - off;
        var hh = H * b.h * (0.7 + ((bi + x) % 5) / 10);
        c.beginPath();
        c.moveTo(px, ground);
        c.lineTo(px + b.step * 0.28, ground - hh);
        c.lineTo(px + b.step * 0.56, ground);
        c.closePath();
        c.fill();
      }
    });

    /* ground */
    var gr = c.createLinearGradient(0, ground, 0, H);
    gr.addColorStop(0, g.calm ? '#26314d' : '#140b18');
    gr.addColorStop(1, g.calm ? '#10182b' : '#05030a');
    c.fillStyle = gr;
    c.fillRect(0, ground, W, H - ground);

    /* ground streaks, to show speed */
    c.strokeStyle = g.calm ? 'rgba(200,220,255,.22)' : 'rgba(255,220,180,.16)';
    c.lineWidth = 2;
    for (var i = 0; i < 14; i++) {
      var sx = (i * 97 - (g.scroll * 1.6) % 97 * 14) % (W + 120) - 60;
      var sy = ground + 10 + (i % 5) * ((H - ground) / 5);
      c.beginPath();
      c.moveTo(sx, sy);
      c.lineTo(sx + 26 + g.speedLines * 40, sy);
      c.stroke();
    }

    /* the door you are running for, sliding in as you get close */
    var left = Math.max(0, CFG.goal - g.run);
    if (left < 140) {
      var dx = W * 0.72 + (left / 140) * W * 0.6;
      var dh = H * 0.34, dw = dh * 0.56;
      c.fillStyle = g.calm ? '#9fd8c8' : '#ffd479';
      c.globalAlpha = 0.28;
      c.fillRect(dx - 14, ground - dh - 14, dw + 28, dh + 14);
      c.globalAlpha = 1;
      c.fillStyle = g.calm ? '#c9f2e6' : '#fff0c2';
      c.fillRect(dx, ground - dh, dw, dh);
      c.fillStyle = '#20180a';
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
    return Math.max(0, Math.min(1, 1 - g.gap / CFG.startGap));
  }

  function drawMonster(g, t, ground) {
    var c = g.ctx, W = g.w, H = g.h;
    var k = closeness(g);
    var x = W * (0.02 + 0.30 * k);
    var scale = (0.55 + 1.05 * k) * (H / 300);
    var bob = Math.sin(t / (g.reduced ? 900 : 170)) * 5 * scale;
    var y = ground + bob;

    c.save();
    c.translate(x, y);
    c.scale(scale, scale);

    var body = g.calm ? '#6d5ea8' : '#08040c';
    var eye = g.calm ? '#ffe9a8' : '#ff3b2f';

    /* a low, wide shadow so it reads as bulk, not a person */
    c.fillStyle = 'rgba(0,0,0,.45)';
    c.beginPath();
    c.ellipse(0, 4, 74, 12, 0, 0, 7);
    c.fill();

    c.fillStyle = body;
    c.beginPath();
    c.moveTo(-70, 2);
    c.quadraticCurveTo(-60, -96, -6, -112);
    c.quadraticCurveTo(52, -122, 62, -54);
    c.quadraticCurveTo(70, -8, 52, 2);
    c.closePath();
    c.fill();

    /* arms reaching forward, swinging as it runs */
    var swing = Math.sin(t / (g.reduced ? 700 : 130)) * 16;
    c.lineWidth = 13;
    c.lineCap = 'round';
    c.strokeStyle = body;
    c.beginPath();
    c.moveTo(30, -70);
    c.quadraticCurveTo(78, -56 + swing, 104, -30 + swing);
    c.stroke();
    c.beginPath();
    c.moveTo(24, -58);
    c.quadraticCurveTo(70, -34 - swing, 92, -6 - swing);
    c.stroke();

    /* claws */
    c.lineWidth = 4;
    [[104, -30 + swing], [92, -6 - swing]].forEach(function (p) {
      for (var i = -1; i <= 1; i++) {
        c.beginPath();
        c.moveTo(p[0], p[1]);
        c.lineTo(p[0] + 16, p[1] + i * 9 + 4);
        c.stroke();
      }
    });

    /* eyes, which glow harder the closer it gets */
    var glow = 0.55 + 0.45 * k;
    c.shadowColor = eye;
    c.shadowBlur = (g.reduced ? 8 : 26) * glow;
    c.fillStyle = eye;
    [[8, -86], [40, -80]].forEach(function (e) {
      c.beginPath();
      c.ellipse(e[0], e[1], 9, 6.5, -0.2, 0, 7);
      c.fill();
    });
    c.shadowBlur = 0;

    /* and the teeth */
    c.fillStyle = g.calm ? '#f2eef8' : '#efe4cf';
    for (var i = 0; i < 7; i++) {
      var tx = 2 + i * 9;
      c.beginPath();
      c.moveTo(tx, -62);
      c.lineTo(tx + 4.5, -48 - (i % 2) * 6);
      c.lineTo(tx + 9, -62);
      c.closePath();
      c.fill();
    }
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
    if (G.frozen) { hud(); return true; }
    G.t += dt;

    var closing = CFG.baseClose + G.t * CFG.ramp;
    G.gap -= closing * dt;
    if (G.boostLeft > 0) G.boostLeft -= dt;
    G.gap = Math.min(CFG.maxGap, G.gap);

    var pace = 26 + (G.boostLeft > 0 ? 34 : 0);
    G.run += pace * dt;
    G.scroll += pace * dt * (G.reduced ? 0.5 : 1.6);
    G.speedLines = Math.max(0, G.boostLeft);

    hud();
    if (G.gap <= 0) { finish(false); return false; }
    if (G.run >= CFG.goal) { finish(true); return false; }
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
    var pct = Math.max(0, Math.min(100, (G.run / CFG.goal) * 100));
    G.el.bar.style.width = pct + '%';
    G.el.dist.textContent = Math.max(0, Math.round(CFG.goal - G.run)) + ' m to the exit';
    var m = Math.max(0, Math.round(G.gap));
    G.el.gap.textContent = m + ' m behind you';
    G.el.gap.classList.toggle('is-panic', m <= 14);
    G.el.wrap.classList.toggle('is-near', closeness(G) > 0.62);
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
      G.gap = Math.min(CFG.maxGap, G.gap + CFG.boost);
      G.boostLeft = 1.4;
      btn.classList.add('is-right');
      G.el.feedback.textContent = 'Go! +' + CFG.boost + ' m';
      G.el.feedback.className = 'chase-feedback is-good';
    } else {
      G.wrong.push(q);
      G.gap -= CFG.penalty;
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
    G.el.overTitle.textContent = escaped ? 'You made it out.' : 'It got you.';
    G.el.overSub.textContent = escaped
      ? 'You answered ' + G.right + ' right out of ' + G.asked + ', and ran ' + CFG.goal + ' metres.'
      : 'You got ' + G.right + ' right and covered ' + Math.round(G.run) + ' of ' + CFG.goal +
        ' metres. The questions below are the ones that slowed you down.';
    if (G.onEnd) G.onEnd({ escaped: escaped, right: G.right, asked: G.asked, wrong: G.wrong.slice() });
  }

  window.CHASE = {
    /* opts: { el, questions, reduced, onEnd } */
    start: function (opts) {
      this.stop();
      G = {
        el: opts.el,
        queue: opts.questions.slice(),
        reduced: !!opts.reduced,
        calm: !!opts.calm,
        onEnd: opts.onEnd,
        gap: CFG.startGap, run: 0, scroll: 0, t: 0, boostLeft: 0, speedLines: 0,
        right: 0, asked: 0, wrong: [], locked: false, frozen: false, shakeUntil: 0,
        running: true, last: performance.now()
      };
      /* shuffle, deterministically enough to feel fresh each run */
      var r = rnd(Date.now() % 100000);
      G.queue.sort(function () { return r() - 0.5; });

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

    state: function () {
      return G && { gap: G.gap, run: G.run, right: G.right, asked: G.asked, running: G.running };
    },

    running: function () { return !!(G && G.running); }
  };
})();
