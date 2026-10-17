/* worlds.js — the three places the chase happens, and the thing that chases you in each.

   Level 1 is the slime in the dark wood. Level 2 is the alien out in space. Level 3 is the
   backrooms, all yellow wallpaper and buzzing lights. Level 4 starts the rotation again,
   faster. Beat a level and a chest opens: the slime pays 10 sparks, the alien 30, the
   backrooms 50 — the nastier the place, the better the chest.

   Everything is drawn in code on the same canvas, so a new world costs nothing to download.
   Each world owns its own sky, its own parallax, its own ground and its own monster, which
   keeps chase.js about the running and the questions rather than the scenery.

   Spooky, never nasty. No blood, no jump scares, no sound, and "make it less scary" turns
   every one of the three friendly: the slime smiles, the alien waves, the long pale figure
   in the backrooms becomes a round one with a grin. */

(function () {
  'use strict';

  /* ── small helpers shared by all three ────────────── */

  function band(c, g, ground, opts) {
    /* one parallax layer of repeated shapes, scrolling at its own speed */
    var off = (g.scroll * opts.speed) % opts.step;
    for (var x = -opts.step; x < g.w + opts.step; x += opts.step) {
      opts.draw(c, x - off, ground, (x / opts.step) | 0);
    }
  }

  function stars(c, g, ground, seedCount, tint) {
    /* a fixed star field that drifts slowly, so space reads as moving but not dizzying */
    c.fillStyle = tint;
    for (var i = 0; i < seedCount; i++) {
      var sx = ((i * 137 + 31) % 1000) / 1000 * g.w;
      var sy = ((i * 73 + 17) % 1000) / 1000 * ground * 0.92;
      var drift = (g.scroll * 0.05 * (0.4 + (i % 5) / 8)) % (g.w + 40);
      var px = sx - drift;
      if (px < -20) px += g.w + 40;
      var r = 0.6 + (i % 4) * 0.45;
      c.globalAlpha = 0.35 + ((i % 7) / 10);
      c.beginPath();
      c.arc(px, sy, r, 0, 7);
      c.fill();
    }
    c.globalAlpha = 1;
  }

  function wobble(t, speed, amount, reduced) {
    return Math.sin(t / (reduced ? speed * 4 : speed)) * amount;
  }

  function eyes(c, pts, colour, glow, reduced) {
    c.shadowColor = colour;
    c.shadowBlur = (reduced ? 8 : 26) * glow;
    c.fillStyle = colour;
    pts.forEach(function (e) {
      c.beginPath();
      c.ellipse(e[0], e[1], e[2], e[3], e[4] || 0, 0, 7);
      c.fill();
    });
    c.shadowBlur = 0;
  }

  function teeth(c, x0, y0, count, w, h, colour) {
    c.fillStyle = colour;
    for (var i = 0; i < count; i++) {
      var tx = x0 + i * w;
      c.beginPath();
      c.moveTo(tx, y0);
      c.lineTo(tx + w / 2, y0 + h + (i % 2) * 5);
      c.lineTo(tx + w, y0);
      c.closePath();
      c.fill();
    }
  }

  /* ══ 1. the dark wood, and the slime ═══════════════ */

  var SLIME = {
    id: 'slime',
    name: 'The dark wood',
    monster: 'Slime',
    bounty: 10,
    blurb: 'A heavy green thing rolling after you between the trees.',
    beat: 'You outran the slime.',
    lost: 'The slime got you.',
    aria: 'A slime chasing a student down a dark woodland path',
    tune: { goal: 900, startGap: 46, maxGap: 56, boost: 15, penalty: 10, baseClose: 4, ramp: 0.06 },
    door: { glow: '#ffd479', face: '#fff0c2', ink: '#20180a' },
    streak: 'rgba(255,220,180,.16)',

    scene: function (c, g, ground) {
      var sky = c.createLinearGradient(0, 0, 0, ground);
      if (g.calm) { sky.addColorStop(0, '#1d2740'); sky.addColorStop(1, '#3b4a6b'); }
      else { sky.addColorStop(0, '#07070d'); sky.addColorStop(1, '#241026'); }
      c.fillStyle = sky;
      c.fillRect(0, -10, g.w, ground + 10);

      c.globalAlpha = 0.9;
      c.fillStyle = g.calm ? '#cfe0ff' : '#e8e2d0';
      c.beginPath();
      c.arc(g.w * 0.82, g.h * 0.2, Math.max(16, g.w * 0.035), 0, 7);
      c.fill();
      c.globalAlpha = 1;

      [{ speed: 0.12, h: 0.30, col: g.calm ? '#243356' : '#120a1c', step: 90 },
       { speed: 0.34, h: 0.22, col: g.calm ? '#1b2742' : '#0c0615', step: 64 },
       { speed: 0.72, h: 0.15, col: g.calm ? '#141d33' : '#06030c', step: 42 }
      ].forEach(function (b, bi) {
        c.fillStyle = b.col;
        band(c, g, ground, {
          speed: b.speed, step: b.step,
          draw: function (cc, px, gy, i) {
            var hh = g.h * b.h * (0.7 + ((bi + i) % 5) / 10);
            cc.beginPath();
            cc.moveTo(px, gy);
            cc.lineTo(px + b.step * 0.28, gy - hh);
            cc.lineTo(px + b.step * 0.56, gy);
            cc.closePath();
            cc.fill();
          }
        });
      });

      var gr = c.createLinearGradient(0, ground, 0, g.h);
      gr.addColorStop(0, g.calm ? '#26314d' : '#140b18');
      gr.addColorStop(1, g.calm ? '#10182b' : '#05030a');
      c.fillStyle = gr;
      c.fillRect(0, ground, g.w, g.h - ground);
    },

    monsterArt: function (c, g, t, k) {
      /* a slime is mostly silhouette and wobble: a heavy dome that squashes as it rolls,
         with drips coming off the underside */
      var squash = 1 + wobble(t, 230, 0.06, g.reduced);
      var body = g.calm ? '#6fc9a8' : '#2f8f3f';
      var skin = g.calm ? '#9ff0cf' : '#57c25c';
      var eye = g.calm ? '#1d3b2c' : '#eaff6a';

      c.fillStyle = 'rgba(0,0,0,.45)';
      c.beginPath();
      c.ellipse(0, 4, 74, 12, 0, 0, 7);
      c.fill();

      c.save();
      c.scale(1 / squash, squash);

      c.fillStyle = body;
      c.beginPath();
      c.moveTo(-72, 2);
      c.bezierCurveTo(-74, -70, -34, -112, 4, -112);
      c.bezierCurveTo(44, -112, 76, -74, 72, 2);
      c.closePath();
      c.fill();

      /* the lit top, so it reads as wet */
      c.fillStyle = skin;
      c.globalAlpha = 0.55;
      c.beginPath();
      c.ellipse(-12, -78, 30, 16, -0.3, 0, 7);
      c.fill();
      c.globalAlpha = 1;

      /* drips hanging off the bottom edge, each on its own slow timer */
      c.fillStyle = body;
      [[-50, 10, 0], [-14, 9, 400], [26, 11, 900], [58, 8, 1500]].forEach(function (d) {
        var fall = ((t + d[2]) % 2200) / 2200;
        c.beginPath();
        c.ellipse(d[0], d[1] + fall * 10, 7, 9 + fall * 5, 0, 0, 7);
        c.fill();
      });

      eyes(c, [[-16, -70, 11, 9, -0.15], [26, -66, 11, 9, -0.15]], eye, 0.55 + 0.45 * k, g.reduced);
      c.fillStyle = '#10200f';
      [[-14, -69], [28, -65]].forEach(function (p) {
        c.beginPath();
        c.ellipse(p[0], p[1], 3.4, 5, 0, 0, 7);
        c.fill();
      });

      if (g.calm) {
        c.strokeStyle = '#10200f';
        c.lineWidth = 3;
        c.lineCap = 'round';
        c.beginPath();
        c.arc(6, -46, 16, 0.25, Math.PI - 0.25);
        c.stroke();
      } else {
        teeth(c, -22, -40, 7, 9, 13, '#efe4cf');
      }
      c.restore();
    }
  };

  /* ══ 2. space, and the alien ═══════════════════════ */

  var ALIEN = {
    id: 'alien',
    name: 'Deep space',
    monster: 'Alien',
    bounty: 30,
    blurb: 'Low gravity, a long way from home, and something tall keeping pace.',
    beat: 'You lost the alien.',
    lost: 'The alien caught you.',
    aria: 'A tall alien chasing a student across a planet surface in space',
    tune: { goal: 950, startGap: 46, maxGap: 56, boost: 16, penalty: 10, baseClose: 4.35, ramp: 0.065 },
    door: { glow: '#7ef0d8', face: '#d8fff6', ink: '#06231f' },
    streak: 'rgba(170,220,255,.20)',

    scene: function (c, g, ground) {
      var sky = c.createLinearGradient(0, 0, 0, ground);
      if (g.calm) { sky.addColorStop(0, '#132046'); sky.addColorStop(1, '#2b3f7a'); }
      else { sky.addColorStop(0, '#03040c'); sky.addColorStop(1, '#190d33'); }
      c.fillStyle = sky;
      c.fillRect(0, -10, g.w, ground + 10);

      /* a nebula smear, kept faint so the question text over it stays readable */
      var neb = c.createRadialGradient(g.w * 0.3, ground * 0.45, 10, g.w * 0.3, ground * 0.45, g.w * 0.5);
      neb.addColorStop(0, g.calm ? 'rgba(120,180,255,.22)' : 'rgba(150,70,220,.26)');
      neb.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = neb;
      c.fillRect(0, -10, g.w, ground + 10);

      stars(c, g, ground, 70, '#ffffff');

      /* a ringed planet hanging over the horizon */
      var px = g.w * 0.78, py = ground * 0.34, pr = Math.max(22, g.w * 0.062);
      var pg = c.createLinearGradient(px - pr, py - pr, px + pr, py + pr);
      pg.addColorStop(0, g.calm ? '#9fc4ff' : '#c98a5a');
      pg.addColorStop(1, g.calm ? '#4a6fb5' : '#5e3220');
      c.fillStyle = pg;
      c.beginPath();
      c.arc(px, py, pr, 0, 7);
      c.fill();
      c.strokeStyle = g.calm ? 'rgba(200,225,255,.7)' : 'rgba(255,210,160,.55)';
      c.lineWidth = Math.max(2, pr * 0.14);
      c.beginPath();
      c.ellipse(px, py, pr * 1.9, pr * 0.42, -0.35, 0, 7);
      c.stroke();

      /* two bands of crystal spires instead of trees */
      [{ speed: 0.18, h: 0.34, col: g.calm ? '#2b3c68' : '#140a2e', step: 104 },
       { speed: 0.46, h: 0.22, col: g.calm ? '#1e2b4e' : '#0b0520', step: 68 }
      ].forEach(function (b, bi) {
        c.fillStyle = b.col;
        band(c, g, ground, {
          speed: b.speed, step: b.step,
          draw: function (cc, x, gy, i) {
            var hh = g.h * b.h * (0.6 + ((bi + i) % 6) / 9);
            cc.beginPath();
            cc.moveTo(x, gy);
            cc.lineTo(x + b.step * 0.16, gy - hh);
            cc.lineTo(x + b.step * 0.34, gy - hh * 0.55);
            cc.lineTo(x + b.step * 0.5, gy);
            cc.closePath();
            cc.fill();
          }
        });
      });

      var gr = c.createLinearGradient(0, ground, 0, g.h);
      gr.addColorStop(0, g.calm ? '#2b3a62' : '#2a1340');
      gr.addColorStop(1, g.calm ? '#131d36' : '#0a0418');
      c.fillStyle = gr;
      c.fillRect(0, ground, g.w, g.h - ground);

      /* craters, scrolling with the ground */
      c.fillStyle = g.calm ? 'rgba(10,20,45,.5)' : 'rgba(0,0,0,.45)';
      band(c, g, ground, {
        speed: 1.1, step: 150,
        draw: function (cc, x, gy, i) {
          var cy = gy + 18 + (i % 4) * ((g.h - gy) / 5);
          cc.beginPath();
          cc.ellipse(x, cy, 26 - (i % 3) * 6, 6 - (i % 3), 0, 0, 7);
          cc.fill();
        }
      });
    },

    monsterArt: function (c, g, t, k) {
      var body = g.calm ? '#8fd9b6' : '#5a8f6a';
      var dark = g.calm ? '#4f9b77' : '#30543a';
      var eye = g.calm ? '#1b2e26' : '#0a0a12';
      var sway = wobble(t, 200, 7, g.reduced);

      c.fillStyle = 'rgba(0,0,0,.4)';
      c.beginPath();
      c.ellipse(0, 4, 56, 10, 0, 0, 7);
      c.fill();

      /* long legs, striding */
      c.strokeStyle = dark;
      c.lineWidth = 9;
      c.lineCap = 'round';
      [1, -1].forEach(function (s) {
        c.beginPath();
        c.moveTo(0, -62);
        c.quadraticCurveTo(s * 14, -34, s * Math.sin(t / (g.reduced ? 600 : 150)) * 22, 0);
        c.stroke();
      });

      /* narrow torso */
      c.fillStyle = body;
      c.beginPath();
      c.moveTo(-16, -60);
      c.quadraticCurveTo(-22, -104, 0, -110);
      c.quadraticCurveTo(22, -104, 16, -60);
      c.closePath();
      c.fill();

      /* very long arms reaching ahead */
      c.strokeStyle = body;
      c.lineWidth = 8;
      c.beginPath();
      c.moveTo(12, -100);
      c.quadraticCurveTo(62, -92 + sway, 96, -60 + sway);
      c.stroke();
      c.beginPath();
      c.moveTo(10, -88);
      c.quadraticCurveTo(58, -62 - sway, 86, -30 - sway);
      c.stroke();
      c.lineWidth = 3.4;
      [[96, -60 + sway], [86, -30 - sway]].forEach(function (p) {
        for (var i = -1; i <= 1; i++) {
          c.beginPath();
          c.moveTo(p[0], p[1]);
          c.lineTo(p[0] + 15, p[1] + i * 8 + 3);
          c.stroke();
        }
      });

      /* the big head */
      c.fillStyle = body;
      c.beginPath();
      c.ellipse(4, -130, 30, 26, 0, 0, 7);
      c.fill();

      /* antennae */
      c.strokeStyle = dark;
      c.lineWidth = 3.4;
      [[-12, -1], [18, 1]].forEach(function (a) {
        c.beginPath();
        c.moveTo(a[0], -150);
        c.quadraticCurveTo(a[0] + a[1] * 10, -170 + sway * 0.4, a[0] + a[1] * 18, -176 + sway * 0.4);
        c.stroke();
        c.fillStyle = g.calm ? '#ffe9a8' : '#b6ff5a';
        c.beginPath();
        c.arc(a[0] + a[1] * 18, -176 + sway * 0.4, 4.6, 0, 7);
        c.fill();
      });

      /* huge almond eyes, which is the whole look */
      eyes(c, [[-9, -131, 12, 17, 0.35], [18, -131, 12, 17, -0.35]], eye, 0.5 + 0.5 * k, g.reduced);
      c.fillStyle = '#ffffff';
      c.globalAlpha = 0.65;
      [[-12, -138], [15, -138]].forEach(function (p) {
        c.beginPath();
        c.ellipse(p[0], p[1], 3, 4.5, 0.3, 0, 7);
        c.fill();
      });
      c.globalAlpha = 1;

      if (g.calm) {
        c.strokeStyle = eye;
        c.lineWidth = 2.6;
        c.beginPath();
        c.arc(4, -116, 9, 0.2, Math.PI - 0.2);
        c.stroke();
      } else {
        c.strokeStyle = eye;
        c.lineWidth = 2.6;
        c.beginPath();
        c.moveTo(-5, -110);
        c.lineTo(13, -110);
        c.stroke();
      }
    }
  };

  /* ══ 3. the backrooms, and the long figure ═════════ */

  var BACKROOMS = {
    id: 'backrooms',
    name: 'The backrooms',
    monster: 'The long one',
    bounty: 50,
    blurb: 'Yellow wallpaper, damp carpet, and one buzzing light after another.',
    beat: 'You found the way out.',
    lost: 'The long one caught you.',
    aria: 'A tall pale figure following a student down a yellow corridor',
    tune: { goal: 1000, startGap: 46, maxGap: 56, boost: 17, penalty: 10, baseClose: 4.7, ramp: 0.072 },
    door: { glow: '#9ff0cf', face: '#e6fff4', ink: '#123024' },
    streak: 'rgba(90,70,20,.22)',

    scene: function (c, g, ground) {
      /* the whole point of this place is that it is relentlessly yellow */
      var wall = c.createLinearGradient(0, 0, 0, ground);
      if (g.calm) { wall.addColorStop(0, '#ffe9a0'); wall.addColorStop(1, '#f6d97e'); }
      else { wall.addColorStop(0, '#d9c56a'); wall.addColorStop(1, '#b9a04a'); }
      c.fillStyle = wall;
      c.fillRect(0, -10, g.w, ground + 10);

      /* ceiling, with light panels sliding past and one of them flickering */
      var ceil = g.h * 0.16;
      c.fillStyle = g.calm ? '#f3dc90' : '#ab9342';
      c.fillRect(0, -10, g.w, ceil + 10);
      band(c, g, ground, {
        speed: 1.25, step: 132,
        draw: function (cc, x, gy, i) {
          var flick = (i % 4 === 1) && !g.reduced
            ? (Math.sin(g.scroll * 0.9 + i) > 0.72 ? 0.35 : 1) : 1;
          cc.globalAlpha = flick;
          cc.fillStyle = '#fffbe2';
          cc.fillRect(x, ceil - 12, 76, 11);
          cc.globalAlpha = flick * 0.22;
          cc.fillStyle = '#fffbe2';
          cc.beginPath();
          cc.moveTo(x - 20, ceil);
          cc.lineTo(x + 96, ceil);
          cc.lineTo(x + 130, gy);
          cc.lineTo(x - 54, gy);
          cc.closePath();
          cc.fill();
          cc.globalAlpha = 1;
        }
      });

      /* wallpaper stripes, then skirting, then doorways that never lead anywhere */
      c.strokeStyle = g.calm ? 'rgba(180,150,60,.30)' : 'rgba(120,96,24,.34)';
      c.lineWidth = 1.5;
      band(c, g, ground, {
        speed: 0.5, step: 26,
        draw: function (cc, x, gy) {
          cc.beginPath();
          cc.moveTo(x, ceil);
          cc.lineTo(x, gy);
          cc.stroke();
        }
      });

      c.fillStyle = g.calm ? 'rgba(150,120,40,.26)' : 'rgba(90,70,16,.3)';
      band(c, g, ground, {
        speed: 0.5, step: 210,
        draw: function (cc, x, gy, i) {
          if (i % 2) return;
          var dh = (gy - ceil) * 0.62;
          cc.fillRect(x, gy - dh, 52, dh);
        }
      });

      /* damp patches, because the place is always slightly wet */
      c.fillStyle = g.calm ? 'rgba(160,130,50,.16)' : 'rgba(80,62,14,.2)';
      band(c, g, ground, {
        speed: 0.32, step: 290,
        draw: function (cc, x, gy, i) {
          cc.beginPath();
          cc.ellipse(x + 40, ceil + (gy - ceil) * (0.3 + (i % 3) * 0.2), 44, 22, 0, 0, 7);
          cc.fill();
        }
      });

      var carpet = c.createLinearGradient(0, ground, 0, g.h);
      carpet.addColorStop(0, g.calm ? '#c9b05e' : '#8c7a36');
      carpet.addColorStop(1, g.calm ? '#9c8640' : '#5d5020');
      c.fillStyle = carpet;
      c.fillRect(0, ground, g.w, g.h - ground);

      c.strokeStyle = g.calm ? 'rgba(90,70,20,.5)' : 'rgba(40,32,8,.5)';
      c.lineWidth = 3;
      c.beginPath();
      c.moveTo(0, ground);
      c.lineTo(g.w, ground);
      c.stroke();
    },

    monsterArt: function (c, g, t, k) {
      /* tall, pale and faceless — unsettling without being gruesome. Calm mode gives it a
         face and shortens it, because a blank one is the whole reason it is creepy. */
      var pale = g.calm ? '#ffe3c6' : '#e8dcc4';
      var shade = g.calm ? '#e3b48c' : '#b8a888';
      var lean = wobble(t, 240, 5, g.reduced);
      var tall = g.calm ? 0.74 : 1;

      c.fillStyle = 'rgba(60,46,10,.42)';
      c.beginPath();
      c.ellipse(0, 4, 48, 9, 0, 0, 7);
      c.fill();

      c.save();
      c.scale(1, tall);

      c.strokeStyle = shade;
      c.lineWidth = 10;
      c.lineCap = 'round';
      [1, -1].forEach(function (s) {
        c.beginPath();
        c.moveTo(0, -70);
        c.quadraticCurveTo(s * 10, -36, s * Math.sin(t / (g.reduced ? 640 : 160)) * 20, 0);
        c.stroke();
      });

      c.fillStyle = pale;
      c.beginPath();
      c.moveTo(-18, -68);
      c.quadraticCurveTo(-24, -124, 0, -132);
      c.quadraticCurveTo(24, -124, 18, -68);
      c.closePath();
      c.fill();

      /* arms far too long for the body */
      c.strokeStyle = pale;
      c.lineWidth = 9;
      c.beginPath();
      c.moveTo(14, -120);
      c.quadraticCurveTo(68, -110 + lean, 104, -66 + lean);
      c.stroke();
      c.beginPath();
      c.moveTo(12, -108);
      c.quadraticCurveTo(62, -72 - lean, 92, -24 - lean);
      c.stroke();
      c.lineWidth = 3.2;
      [[104, -66 + lean], [92, -24 - lean]].forEach(function (p) {
        for (var i = -1; i <= 1; i++) {
          c.beginPath();
          c.moveTo(p[0], p[1]);
          c.lineTo(p[0] + 17, p[1] + i * 9 + 4);
          c.stroke();
        }
      });

      c.fillStyle = pale;
      c.beginPath();
      c.ellipse(2, -150, 21, 24, 0, 0, 7);
      c.fill();

      if (g.calm) {
        c.fillStyle = '#4a3420';
        [[-6, -154], [10, -154]].forEach(function (p) {
          c.beginPath();
          c.arc(p[0], p[1], 2.6, 0, 7);
          c.fill();
        });
        c.strokeStyle = '#4a3420';
        c.lineWidth = 2.4;
        c.beginPath();
        c.arc(2, -144, 8, 0.25, Math.PI - 0.25);
        c.stroke();
      } else {
        /* no face at all, just the light falling across where one should be */
        var sh = c.createLinearGradient(-20, -170, 20, -130);
        sh.addColorStop(0, 'rgba(255,245,210,.5)');
        sh.addColorStop(1, 'rgba(90,74,30,.22)');
        c.fillStyle = sh;
        c.beginPath();
        c.ellipse(2, -150, 21, 24, 0, 0, 7);
        c.fill();
        c.globalAlpha = 0.25 + 0.4 * k;
        c.fillStyle = '#6b5a2a';
        c.beginPath();
        c.ellipse(2, -146, 10, 13, 0, 0, 7);
        c.fill();
        c.globalAlpha = 1;
      }
      c.restore();
    }
  };

  /* ── the ladder ───────────────────────────────────────
     A different monster every level, in a fixed rotation so level 4 is the slime again and
     you always know what is coming next. Each trip round the loop is tuned tighter: the
     thing starts closer, closes faster and the exit is further away. */

  var LIST = [SLIME, ALIEN, BACKROOMS];

  function forLevel(level) {
    return LIST[(Math.max(1, level) - 1) % LIST.length];
  }

  function tuneFor(level) {
    var w = forLevel(level);
    var lap = Math.floor((Math.max(1, level) - 1) / LIST.length);   /* 0 on the first loop */
    /* Each lap tightens, but gently and with a ceiling. An endless ladder that becomes
       arithmetically impossible is not a challenge, it is a wall — even lap five leaves
       room to think for about two seconds a question and still get out. */
    var hard = Math.min(0.42, lap * 0.10);
    var t = w.tune;
    return {
      goal: Math.round(t.goal * (1 + lap * 0.05)),
      startGap: Math.round(t.startGap * (1 - hard * 0.12)),
      maxGap: Math.round(t.maxGap * (1 - hard * 0.10)),
      boost: t.boost,
      penalty: t.penalty,
      baseClose: +(t.baseClose * (1 + hard * 0.35)).toFixed(2),
      ramp: +(t.ramp * (1 + hard * 0.40)).toFixed(4)
    };
  }

  window.WORLDS = {
    list: LIST,
    forLevel: forLevel,
    tuneFor: tuneFor,
    count: LIST.length,
    byId: function (id) {
      return LIST.filter(function (w) { return w.id === id; })[0] || SLIME;
    },
    /* what the chest pays at a given level */
    bountyFor: function (level) { return forLevel(level).bounty; }
  };
})();
