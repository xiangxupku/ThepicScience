/* pets.js — sparks, eggs, fifty pets, and the hint ladder.

   Sparks are earned by doing science and nothing else. There is no way to buy them, no real
   money anywhere in this app, and the egg prints its exact odds on the front before you spend
   a single spark. A duplicate is refunded, so an egg is never wasted.

   Fifty pets would be fifty hand-drawn files, so instead each one is a recipe: a body shape,
   a colour set from its rarity, and a feature. The combination is chosen per pet, so they
   still look deliberate rather than random.

   A pet's level decides how much it can tell you about a question, and its rarity gives it a
   head start. Every hint is built from checked library data, so a pet cannot invent an
   answer. */

(function () {
  'use strict';

  /* ── levels and costs ───────────────────────────────
     Twenty levels, each costing more than the last — the shape the doubling idea wanted.
     True doubling does not survive a calculator: from 1, doubling nineteen times makes the
     last level cost 524,288 sparks, about a quarter of a million right answers. Growing by
     about a third keeps every level a real step and still lets you reach 20 in a term. */

  var MAX_LEVEL = 20;

  function levelCost(fromLevel) {
    if (fromLevel >= MAX_LEVEL) return 0;
    return Math.round(6 * Math.pow(1.32, fromLevel - 1));
  }

  var EGG_PRICE = 10;
  var DUPLICATE_REFUND = 5;

  /* Getting past a monster is paid by that world's chest, not from here — see worlds.js. */
  var EARN = {
    rightAnswer: 2, perfectRound: 5, fixedMistake: 3, finishedLesson: 3,
    newTopic: 5, wonDuel: 12, chaseDistance: 1
  };

  /* ── rarity ───────────────────────────────────────────
     The chances asked for were 80 / 50 / 30 / 20 / 10 / 1, which adds up to 191% and so
     cannot happen. These keep that order and keep impossible at 1 in 100, and they add up
     to exactly 100. */

  var RARITY = [
    { id: 'common',     name: 'Common',     chance: 50, bonus: 0, ink: '#5f7a6b', tone: ['#8fc7ae', '#6fae95', '#cfe7dc'] },
    { id: 'rare',       name: 'Rare',       chance: 25, bonus: 1, ink: '#3f5a86', tone: ['#8fb0f2', '#6d8fd8', '#d4e0fb'] },
    { id: 'gold',       name: 'Gold',       chance: 14, bonus: 2, ink: '#9a7320', tone: ['#ffd45e', '#e8b63c', '#fff0c2'] },
    { id: 'legendary',  name: 'Legendary',  chance:  7, bonus: 3, ink: '#9a4423', tone: ['#ff9a3c', '#e8632c', '#ffd9bb'] },
    { id: 'mythic',     name: 'Mythic',     chance:  3, bonus: 4, ink: '#6b3a86', tone: ['#c79ae6', '#a35fd0', '#ecd9f8'] },
    { id: 'impossible', name: 'Impossible', chance:  1, bonus: 6, ink: '#1f6f66', tone: ['#7ef0d8', '#49c9f0', '#f7e6a8'] }
  ];

  function rarity(id) {
    return RARITY.filter(function (r) { return r.id === id; })[0] || RARITY[0];
  }

  /* ── drawing ──────────────────────────────────────── */

  function eyes(y, gap, r) {
    var x1 = 50 - gap, x2 = 50 + gap;
    return '<g class="pet-eyes">' +
      '<ellipse cx="' + x1 + '" cy="' + y + '" rx="' + r + '" ry="' + (r * 1.15) + '" fill="#20202a"/>' +
      '<ellipse cx="' + x2 + '" cy="' + y + '" rx="' + r + '" ry="' + (r * 1.15) + '" fill="#20202a"/>' +
      '<circle cx="' + (x1 + r * 0.4) + '" cy="' + (y - r * 0.5) + '" r="' + (r * 0.33) + '" fill="#fff"/>' +
      '<circle cx="' + (x2 + r * 0.4) + '" cy="' + (y - r * 0.5) + '" r="' + (r * 0.33) + '" fill="#fff"/>' +
      '</g>';
  }

  function mouth(style, y) {
    if (style === 'grin') return '<path d="M40 ' + y + ' q 10 10 20 0" fill="none" stroke="#20202a" stroke-width="2.4" stroke-linecap="round"/>';
    if (style === 'fang') return '<path d="M41 ' + y + ' q 9 8 18 0 l -4 0 l -2 4 l -3 -4 l -3 4 l -2 -4 Z" fill="#20202a"/>';
    if (style === 'smirk') return '<path d="M44 ' + y + ' q 8 6 14 -1" fill="none" stroke="#20202a" stroke-width="2.4" stroke-linecap="round"/>';
    if (style === 'o') return '<ellipse cx="50" cy="' + (y + 2) + '" rx="4" ry="5" fill="#20202a"/>';
    return '<path d="M43 ' + y + ' q 7 7 14 0" fill="none" stroke="#20202a" stroke-width="2.3" stroke-linecap="round"/>';
  }

  /* ten body shapes */
  var BODY = {
    blob: function (c) {
      return '<path d="M50 88 C 18 88 12 60 20 44 C 28 26 44 20 50 20 C 56 20 72 26 80 44 C 88 60 82 88 50 88 Z" fill="' + c[0] + '"/>' +
        '<ellipse cx="36" cy="40" rx="8" ry="6" fill="#fff" opacity=".4"/>';
    },
    drop: function (c) {
      return '<path d="M50 12 C 72 46 80 58 72 72 C 64 86 36 86 28 72 C 20 58 28 46 50 12 Z" fill="' + c[0] + '"/>' +
        '<ellipse cx="38" cy="58" rx="6" ry="8" fill="#fff" opacity=".35"/>';
    },
    orb: function (c) {
      return '<circle cx="50" cy="54" r="30" fill="' + c[0] + '"/>' +
        '<path d="M26 62 q 24 12 48 0" fill="none" stroke="' + c[1] + '" stroke-width="4" opacity=".6"/>';
    },
    bean: function (c) {
      return '<path d="M26 56 C 26 32 46 24 62 30 C 80 37 82 62 72 74 C 60 88 30 84 26 56 Z" fill="' + c[0] + '"/>';
    },
    crystal: function (c) {
      return '<polygon points="50,14 76,44 66,84 34,84 24,44" fill="' + c[0] + '"/>' +
        '<polygon points="50,14 66,84 50,84" fill="' + c[1] + '" opacity=".5"/>';
    },
    cube: function (c) {
      return '<path d="M26 40 L50 28 L74 40 L74 72 L50 84 L26 72 Z" fill="' + c[0] + '"/>' +
        '<path d="M50 28 L74 40 L50 52 L26 40 Z" fill="' + c[2] + '" opacity=".75"/>';
    },
    star: function (c) {
      return '<polygon points="50,16 59,42 86,42 64,58 72,84 50,68 28,84 36,58 14,42 41,42" fill="' + c[0] + '"/>';
    },
    flame: function (c) {
      return '<path class="pet-flame" d="M50 12 C 70 38 78 52 70 66 C 62 80 38 80 30 66 C 22 52 30 38 50 12 Z" fill="' + c[0] + '"/>' +
        '<path d="M50 42 C 60 56 62 66 56 72 C 50 78 42 76 40 70 C 37 62 42 54 50 42 Z" fill="' + c[2] + '" opacity=".75"/>';
    },
    ring: function (c) {
      return '<circle cx="50" cy="54" r="26" fill="' + c[0] + '"/>' +
        '<ellipse class="pet-ring-tilt" cx="50" cy="54" rx="42" ry="12" fill="none" stroke="' + c[2] + '" stroke-width="4" transform="rotate(-18 50 54)"/>';
    },
    spiral: function (c) {
      return '<path d="M50 84 C 20 84 20 46 50 46 C 72 46 72 72 54 72 C 42 72 42 58 52 58" fill="none" stroke="' + c[0] + '" stroke-width="13" stroke-linecap="round"/>';
    }
  };

  /* eight features bolted on top */
  var FEATURE = {
    none: function () { return ''; },
    antenna: function (c) {
      return '<line x1="50" y1="24" x2="50" y2="10" stroke="' + c[1] + '" stroke-width="3"/>' +
        '<circle class="pet-spark" cx="50" cy="8" r="5" fill="' + c[2] + '"/>';
    },
    ears: function (c) {
      return '<path d="M30 28 L24 8 L44 22 Z" fill="' + c[1] + '"/>' +
        '<path d="M70 28 L76 8 L56 22 Z" fill="' + c[1] + '"/>';
    },
    horns: function (c) {
      return '<path d="M32 26 C 24 16 26 8 32 4 C 36 12 38 20 38 26 Z" fill="' + c[1] + '"/>' +
        '<path d="M68 26 C 76 16 74 8 68 4 C 64 12 62 20 62 26 Z" fill="' + c[1] + '"/>';
    },
    wings: function (c) {
      return '<path class="pet-wing" d="M24 50 C 6 38 4 60 20 68 Z" fill="' + c[2] + '" opacity=".85"/>' +
        '<path class="pet-wing" style="--d:.4s" d="M76 50 C 94 38 96 60 80 68 Z" fill="' + c[2] + '" opacity=".85"/>';
    },
    tail: function (c) {
      return '<path class="pet-sway" d="M74 76 q 18 4 20 -14" fill="none" stroke="' + c[1] + '" stroke-width="6" stroke-linecap="round"/>';
    },
    spikes: function (c) {
      var out = '';
      for (var i = 0; i < 5; i++) {
        var x = 32 + i * 9;
        out += '<polygon points="' + x + ',30 ' + (x + 4.5) + ',16 ' + (x + 9) + ',30" fill="' + c[1] + '"/>';
      }
      return out;
    },
    orbit: function (c) {
      return '<g class="pet-turn"><circle cx="50" cy="54" r="38" fill="none" stroke="' + c[2] +
        '" stroke-width="2" stroke-dasharray="6 8"/><circle cx="88" cy="54" r="5" fill="' + c[1] + '"/></g>';
    },
    leaves: function (c) {
      return '<path class="pet-leaf" d="M46 24 C 26 22 20 10 22 4 C 34 2 44 10 46 24 Z" fill="' + c[1] + '"/>' +
        '<path class="pet-leaf" style="--d:.7s" d="M54 24 C 74 22 80 10 78 4 C 66 2 56 10 54 24 Z" fill="' + c[2] + '"/>';
    }
  };

  /* level trim, so growth is visible all the way to 20 */
  function trim(level, r) {
    var out = '';
    if (level >= 3) out += '<circle class="pet-spark" cx="16" cy="24" r="2.6" fill="#ffd36b"/>';
    if (level >= 6) out += '<circle class="pet-spark" style="--d:.6s" cx="85" cy="30" r="3.2" fill="#ffd36b"/>';
    if (level >= 9) out += '<circle class="pet-spark" style="--d:1.1s" cx="76" cy="14" r="2.4" fill="#9ff0dc"/>';
    if (level >= 12) out += '<path class="pet-scarf" d="M30 74 q 20 10 40 0 l 0 7 q -20 9 -40 0 Z" fill="#e0556b"/>';
    if (level >= 16) out += '<path class="pet-crown" d="M34 15 L41 23 L50 12 L59 23 L66 15 L63 28 L37 28 Z" fill="#ffd36b" stroke="#e0a93c" stroke-width="1.6" stroke-linejoin="round"/>';
    if (level >= 20) out += '<circle class="pet-aura" cx="50" cy="54" r="46" fill="none" stroke="' + r.tone[0] + '" stroke-width="2.5" stroke-dasharray="5 7" opacity=".85"/>';
    return out;
  }

  var MOTION = {
    blob: 'pet-bounce', drop: 'pet-bob', orb: 'pet-bob', bean: 'pet-wobble',
    crystal: 'pet-glow', cube: 'pet-stomp', star: 'pet-glow', flame: 'pet-bounce',
    ring: 'pet-bob', spiral: 'pet-wobble'
  };

  function draw(id, level) {
    var p = byId(id);
    if (!p) return '';
    var r = rarity(p.rarity);
    var c = p.tone || r.tone;
    var body = (BODY[p.body] || BODY.blob)(c);
    var feat = (FEATURE[p.feature] || FEATURE.none)(c);
    var halo = p.rarity === 'impossible'
      ? '<circle class="pet-aura" cx="50" cy="54" r="43" fill="none" stroke="' + c[2] + '" stroke-width="3" stroke-dasharray="3 9"/>' : '';
    return '<svg viewBox="0 0 100 100" class="pet-svg is-' + p.rarity + '" role="img" aria-hidden="true">' +
      '<g class="' + (MOTION[p.body] || 'pet-bob') + '">' +
      halo + feat + body + eyes(p.eyeY || 54, p.eyeGap || 9, p.eyeR || 4.4) +
      mouth(p.mouth || 'smile', (p.eyeY || 54) + 12) + trim(level || 1, r) +
      '</g></svg>';
  }

  /* ── the fifty ────────────────────────────────────── */

  function P(id, name, rar, body, feature, mouthStyle, extra) {
    var o = { id: id, name: name, rarity: rar, body: body, feature: feature, mouth: mouthStyle };
    for (var k in (extra || {})) o[k] = extra[k];
    /* attackers are the spiky, fiery, crystalline ones; the soft ones defend */
    o.type = (['spikes', 'horns', 'orbit'].indexOf(feature) > -1 ||
      ['crystal', 'flame', 'star', 'cube'].indexOf(body) > -1) ? 'attack' : 'defend';
    return o;
  }

  var LIST = [
    /* common — 18 */
    P('bubble', 'Bubble', 'common', 'blob', 'none', 'smile'),
    P('sprout', 'Sprout', 'common', 'bean', 'leaves', 'smile'),
    P('drip', 'Drip', 'common', 'drop', 'none', 'smile'),
    P('pebble', 'Pebble', 'common', 'bean', 'none', 'smirk'),
    P('mossy', 'Mossy', 'common', 'blob', 'leaves', 'smile'),
    P('fizz', 'Fizz', 'common', 'orb', 'antenna', 'o'),
    P('dusty', 'Dusty', 'common', 'bean', 'ears', 'smile'),
    P('clip', 'Clip', 'common', 'cube', 'none', 'smirk'),
    P('chalky', 'Chalky', 'common', 'cube', 'none', 'smile'),
    P('mito', 'Mito', 'common', 'bean', 'none', 'grin'),
    P('spore', 'Spore', 'common', 'orb', 'leaves', 'o'),
    P('cog', 'Cog', 'common', 'ring', 'none', 'smirk'),
    P('beaker', 'Beaker', 'common', 'drop', 'antenna', 'smile'),
    P('flick', 'Flick', 'common', 'spiral', 'none', 'grin'),
    P('puddle', 'Puddle', 'common', 'blob', 'none', 'o'),
    P('twig', 'Twig', 'common', 'spiral', 'leaves', 'smile'),
    P('snap', 'Snap', 'common', 'cube', 'spikes', 'fang'),
    P('gus', 'Gus', 'common', 'orb', 'ears', 'grin'),

    /* rare — 12 */
    P('volt', 'Volt', 'rare', 'star', 'orbit', 'smirk'),
    P('mo', 'Mo', 'rare', 'orb', 'spikes', 'grin'),
    P('quartz', 'Quartz', 'rare', 'crystal', 'none', 'smirk'),
    P('frost', 'Frost', 'rare', 'crystal', 'spikes', 'smile'),
    P('gale', 'Gale', 'rare', 'spiral', 'wings', 'smile'),
    P('cinder', 'Cinder', 'rare', 'flame', 'none', 'fang'),
    P('echo', 'Echo', 'rare', 'ring', 'orbit', 'o'),
    P('lumen', 'Lumen', 'rare', 'orb', 'antenna', 'smile'),
    P('bolt', 'Bolt', 'rare', 'star', 'none', 'grin'),
    P('saline', 'Saline', 'rare', 'cube', 'none', 'smile'),
    P('mag', 'Mag', 'rare', 'bean', 'horns', 'smirk'),
    P('comi', 'Comi', 'rare', 'drop', 'wings', 'grin'),

    /* gold — 8 */
    P('ember', 'Ember', 'gold', 'flame', 'horns', 'fang'),
    P('rocky', 'Rocky', 'gold', 'bean', 'spikes', 'fang'),
    P('auron', 'Auron', 'gold', 'crystal', 'wings', 'smirk'),
    P('helix', 'Helix', 'gold', 'spiral', 'orbit', 'smile'),
    P('prism', 'Prism', 'gold', 'crystal', 'orbit', 'smile'),
    P('pyro', 'Pyro', 'gold', 'flame', 'spikes', 'fang'),
    P('zenith', 'Zenith', 'gold', 'star', 'wings', 'smirk'),
    P('titan', 'Titan', 'gold', 'cube', 'horns', 'fang'),

    /* legendary — 6 */
    P('nova', 'Nova', 'legendary', 'star', 'orbit', 'grin'),
    P('ringo', 'Ringo', 'legendary', 'ring', 'none', 'smile'),
    P('vortex', 'Vortex', 'legendary', 'spiral', 'orbit', 'smirk'),
    P('aurora', 'Aurora', 'legendary', 'drop', 'wings', 'smile'),
    P('obelisk', 'Obelisk', 'legendary', 'cube', 'spikes', 'fang'),
    P('seraph', 'Seraph', 'legendary', 'orb', 'wings', 'smile'),

    /* mythic — 4 */
    P('quasar', 'Quasar', 'mythic', 'star', 'orbit', 'fang'),
    P('chronos', 'Chronos', 'mythic', 'ring', 'orbit', 'smirk'),
    P('abyss', 'Abyss', 'mythic', 'blob', 'horns', 'fang'),
    P('phoenix', 'Phoenix', 'mythic', 'flame', 'wings', 'grin'),

    /* impossible — 2 */
    P('singularity', 'Singularity', 'impossible', 'orb', 'orbit', 'o'),
    P('paradox', 'Paradox', 'impossible', 'crystal', 'wings', 'smirk')
  ];

  function byId(id) {
    return LIST.filter(function (p) { return p.id === id; })[0] || null;
  }

  /* ── hatching ─────────────────────────────────────────
     Roll a rarity on the printed odds, then pick a pet of that rarity you do not already
     own. Own them all at that rarity and it drops to the next tier down rather than wasting
     the egg. A duplicate is impossible by construction, but if every pet is owned the egg
     refunds instead. */

  function hatch(owned, roll) {
    var r = typeof roll === 'number' ? roll : Math.random() * 100;
    var acc = 0, tier = RARITY[0];
    for (var i = 0; i < RARITY.length; i++) {
      acc += RARITY[i].chance;
      if (r < acc) { tier = RARITY[i]; break; }
    }
    /* walk down from the rolled tier until we find something new */
    var order = RARITY.map(function (x) { return x.id; });
    var start = order.indexOf(tier.id);
    for (var step = 0; step < RARITY.length; step++) {
      var id = order[(start - step + RARITY.length) % RARITY.length];
      var pool = LIST.filter(function (p) { return p.rarity === id && !owned[p.id]; });
      if (pool.length) {
        return { pet: pool[Math.floor(Math.random() * pool.length)], rolled: tier, got: rarity(id) };
      }
    }
    return null;      /* every pet owned */
  }

  /* ── what a pet can tell you ──────────────────────── */

  var LADDER = [
    'points at the right page',
    'and names the key word',
    'and rules out a wrong answer',
    'and explains what the key word means',
    'and gives you a nudge toward the answer'
  ];

  /* rarity counts as a head start, so a mythic at level 1 already helps more than a common */
  function power(pet, level) {
    return (level || 1) + rarity(pet.rarity).bonus;
  }

  function rungs(pet, level) {
    var step = pet.type === 'defend' ? 4 : 5;
    return Math.max(1, Math.min(LADDER.length, 1 + Math.floor((power(pet, level) - 1) / step)));
  }

  function bite(pet, level) {
    var base = (power(pet, level) - 1) / (MAX_LEVEL - 1);
    return Math.max(0, Math.min(1, pet.type === 'attack' ? base * 1.15 + 0.12 : base * 0.55));
  }

  function hintLines(q, topic, pet, level) {
    var sc = topic.scenes[typeof q.teach === 'number' ? q.teach : 0];
    if (!sc) return [{ icon: '🤔', text: 'I am not sure which page this one is from.' }];
    var n = rungs(pet, level), lines = [];

    lines.push({ icon: '📖', text: 'This is the page called "' + sc.t + '".' });
    if (n >= 2) lines.push({ icon: '🔑', text: 'The key word is ' + sc.term.w + '.' });
    if (n >= 3) {
      var wrong = null;
      for (var i = 0; i < q.a.length; i++) { if (i !== q.c) { wrong = q.a[i]; break; } }
      if (wrong) lines.push({ icon: '🚫', text: 'It is definitely not "' + wrong + '".' });
    }
    if (n >= 4) lines.push({ icon: '💡', text: sc.term.w + ' means: ' + sc.term.d });
    if (n >= 5) {
      var nudge = String(q.why || ''), ans = String(q.a[q.c] || '');
      if (ans.length > 2) nudge = nudge.replace(new RegExp(ans.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'ig'), '…');
      lines.push({ icon: '🤔', text: nudge });
    }
    return lines;
  }

  window.PETS = {
    list: LIST,
    rarities: RARITY,
    earn: EARN,
    ladder: LADDER,
    maxLevel: MAX_LEVEL,
    eggPrice: EGG_PRICE,
    duplicateRefund: DUPLICATE_REFUND,
    starter: 'bubble',

    byId: byId,
    rarity: rarity,
    levelCost: levelCost,
    totalToMax: (function () { var t = 0; for (var i = 1; i < MAX_LEVEL; i++) t += levelCost(i); return t; })(),

    rungs: rungs,
    bite: bite,
    power: power,
    hatch: hatch,
    draw: draw,
    hints: hintLines,

    summary: function (pet, level) {
      var n = rungs(pet, level), hard = Math.round(bite(pet, level) * 100);
      return pet.type === 'attack'
        ? 'Sends questions at ' + hard + '% difficulty, and gives you ' + n + ' of 5 hint steps.'
        : 'Gives you ' + n + ' of 5 hint steps, and sends questions at ' + hard + '% difficulty.';
    }
  };
})();
