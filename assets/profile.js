/* profile.js — your corner of the app: a name, an avatar you build, and the shelf of things
   you can put on it.

   You start with a plain lab coat and nothing else. Everything else is bought with sparks,
   which are earned by doing science — there is no money anywhere in this app and no way to
   buy sparks with anything real.

   The avatar is drawn in code as SVG, the same way the pets and the lesson art are, so a
   hundred cosmetics cost nothing to download and all of them work in dark mode. It is drawn
   in the same paper tone as the egg on purpose: it is an illustration of a scientist, not a
   picture of a person, so nothing about how you actually look is behind a price.

   Six slots — skin, hat, frame, banner, badge and title — and 40 things to put in them, 6 of
   which you already have. Nothing here changes a lesson, a question or a hint. It is only
   ever a look. */

(function () {
  'use strict';

  var INK = '#2f3a37';
  var PAPER = '#f0e4d2';     /* the drawing tone, shared with the mystery egg */
  var SHADE = '#dcc9a8';
  var COAT = '#fbfbf9';

  var MAX_PET_LEVEL = 20;   /* pets.js owns this; repeated only for the wording */

  var uid = 0;               /* gradients and clip paths need ids that cannot collide when
                                several avatars are on the page at once */

  /* ── the shared face ──────────────────────────────── */

  function neck() {
    return '<path d="M43 58 h14 v13 h-14 z" fill="' + SHADE + '" stroke="' + INK + '" stroke-width="2.2" stroke-linejoin="round"/>';
  }

  function shoulders(coat, collar) {
    return '<path d="M16 102 C 19 78, 32 68, 50 68 C 68 68, 81 78, 84 102 Z" fill="' + coat +
      '" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>' +
      (collar === false ? '' :
        '<path d="M43 69 L50 80 L57 69" fill="none" stroke="' + INK + '" stroke-width="2.2" stroke-linejoin="round"/>');
  }

  function head(fill, rx, ry) {
    return '<ellipse cx="50" cy="43" rx="' + (rx || 19.5) + '" ry="' + (ry || 21) +
      '" fill="' + (fill || PAPER) + '" stroke="' + INK + '" stroke-width="2.4"/>';
  }

  function eyes(y, gap, r) {
    y = y || 43; gap = gap || 7.5; r = r || 2.5;
    return '<circle cx="' + (50 - gap) + '" cy="' + y + '" r="' + r + '" fill="' + INK + '"/>' +
      '<circle cx="' + (50 + gap) + '" cy="' + y + '" r="' + r + '" fill="' + INK + '"/>';
  }

  function smile(y) {
    return '<path d="M44 ' + (y || 52) + ' q 6 5 12 0" fill="none" stroke="' + INK +
      '" stroke-width="2.2" stroke-linecap="round"/>';
  }

  function hair(colour) {
    return '<path d="M30 40 q 2 -19 20 -19 q 18 0 20 19 q -7 -10 -20 -10 q -13 0 -20 10 z" fill="' +
      (colour || INK) + '"/>';
  }

  /* ── skins ────────────────────────────────────────────
     Each one returns the whole character. They are deliberately different creatures rather
     than different-looking people. */

  var SKIN = {
    plain: function () {
      return neck() + shoulders(COAT) + head() + hair() + eyes() + smile();
    },

    goggles: function () {
      return neck() + shoulders(COAT) + head() + hair() + eyes() + smile() +
        '<path d="M30 42 h-7 M70 42 h7" stroke="' + INK + '" stroke-width="2.2" stroke-linecap="round"/>' +
        '<rect x="30" y="35" width="40" height="14" rx="6" fill="#bfe6f2" fill-opacity=".62" stroke="' + INK + '" stroke-width="2.4"/>' +
        '<line x1="50" y1="36" x2="50" y2="48" stroke="' + INK + '" stroke-width="2"/>';
    },

    headphones: function () {
      return neck() + shoulders('#4a5a86') + head() + hair() + eyes() + smile() +
        '<path d="M28 42 q 0 -24 22 -24 q 22 0 22 24" fill="none" stroke="' + INK + '" stroke-width="3.4" stroke-linecap="round"/>' +
        '<rect x="22" y="36" width="12" height="18" rx="5" fill="#8fb0f2" stroke="' + INK + '" stroke-width="2.4"/>' +
        '<rect x="66" y="36" width="12" height="18" rx="5" fill="#8fb0f2" stroke="' + INK + '" stroke-width="2.4"/>';
    },

    cat: function () {
      return '<path d="M31 30 L28 12 L45 22 Z" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>' +
        '<path d="M69 30 L72 12 L55 22 Z" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>' +
        '<path d="M33 27 L32 19 L40 23 Z" fill="#f0a7b8"/>' +
        '<path d="M67 27 L68 19 L60 23 Z" fill="#f0a7b8"/>' +
        neck() + shoulders('#f6d9a8') + head() + eyes(42, 8, 2.8) +
        '<path d="M50 48 l-3.2 -3 h6.4 z" fill="#f0a7b8"/>' +
        '<path d="M46 54 q 4 3 8 0" fill="none" stroke="' + INK + '" stroke-width="2.2" stroke-linecap="round"/>' +
        '<path d="M28 48 h8 M28 53 h8 M72 48 h-8 M72 53 h-8" stroke="' + INK + '" stroke-width="1.6" stroke-linecap="round"/>';
    },

    robot: function () {
      return '<line x1="50" y1="22" x2="50" y2="13" stroke="' + INK + '" stroke-width="2.6"/>' +
        '<circle class="pf-blink-led" cx="50" cy="10" r="4" fill="#ff8a5c" stroke="' + INK + '" stroke-width="2"/>' +
        neck() + shoulders('#9aa7b2') +
        '<rect x="30" y="24" width="40" height="38" rx="9" fill="#cfd8df" stroke="' + INK + '" stroke-width="2.4"/>' +
        '<rect x="35" y="35" width="30" height="13" rx="5" fill="#2a3b4a" stroke="' + INK + '" stroke-width="2"/>' +
        '<circle cx="42" cy="41.5" r="2.6" fill="#7ef0d8"/><circle cx="58" cy="41.5" r="2.6" fill="#7ef0d8"/>' +
        '<path d="M41 55 h18 M44 55 v4 M50 55 v4 M56 55 v4" stroke="' + INK + '" stroke-width="1.8"/>' +
        '<circle cx="33" cy="30" r="2" fill="' + INK + '"/><circle cx="67" cy="30" r="2" fill="' + INK + '"/>';
    },

    astronaut: function () {
      return neck() + shoulders('#eceff3') +
        '<path d="M22 70 h56" stroke="' + INK + '" stroke-width="2.4"/>' +
        '<rect x="40" y="74" width="8" height="6" rx="2" fill="#ff8a5c" stroke="' + INK + '" stroke-width="1.8"/>' +
        '<rect x="52" y="74" width="8" height="6" rx="2" fill="#7ef0d8" stroke="' + INK + '" stroke-width="1.8"/>' +
        head() + hair() + eyes() + smile() +
        '<circle cx="50" cy="43" r="27" fill="#bfe6f2" fill-opacity=".38" stroke="' + INK + '" stroke-width="2.6"/>' +
        '<path d="M34 30 q 7 -7 15 -8" fill="none" stroke="#ffffff" stroke-width="3.4" stroke-linecap="round" opacity=".85"/>';
    },

    wizard: function () {
      var g = 'pfw' + (++uid);
      return '<defs><linearGradient id="' + g + '" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#6b4ea8"/><stop offset="1" stop-color="#3b2d63"/></linearGradient></defs>' +
        neck() + shoulders('url(#' + g + ')', false) +
        '<path d="M50 4 L78 62 Q 50 72 22 62 Z" fill="url(#' + g + ')" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>' +
        '<ellipse cx="50" cy="48" rx="15" ry="13" fill="#2a2140"/>' +
        '<circle cx="44" cy="47" r="2.6" fill="#ffd45e"/><circle cx="56" cy="47" r="2.6" fill="#ffd45e"/>' +
        '<path d="M50 14 l1.6 4.2 4.4 .4 -3.4 2.9 1.1 4.3 -3.7 -2.4 -3.7 2.4 1.1 -4.3 -3.4 -2.9 4.4 -.4 z" fill="#ffd45e"/>' +
        '<circle cx="36" cy="34" r="1.8" fill="#ffd45e"/><circle cx="64" cy="30" r="1.5" fill="#ffd45e"/>';
    },

    dragon: function () {
      /* swept horns, a slim snout and slit pupils — a round snout on a round head reads as
         a pig, which is a different animal and a different vibe. */
      return '<path d="M36 26 C 31 19, 28 13, 21 9 C 30 11, 37 17, 41 24 Z" fill="#ffd45e" stroke="' + INK + '" stroke-width="2.2" stroke-linejoin="round"/>' +
        '<path d="M64 26 C 69 19, 72 13, 79 9 C 70 11, 63 17, 59 24 Z" fill="#ffd45e" stroke="' + INK + '" stroke-width="2.2" stroke-linejoin="round"/>' +
        neck() + shoulders('#2f8f6f') +
        head('#49b98c') +
        '<path d="M44 23 l3 -5 3 5 3 -5 3 5" fill="none" stroke="#2f8f6f" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>' +
        '<path d="M34 48 q 4 3 7 1 M66 48 q -4 3 -7 1" fill="none" stroke="#2f8f6f" stroke-width="2"/>' +
        '<ellipse cx="43.5" cy="42" rx="4.2" ry="3.4" fill="#fff6dc" stroke="' + INK + '" stroke-width="1.6"/>' +
        '<ellipse cx="56.5" cy="42" rx="4.2" ry="3.4" fill="#fff6dc" stroke="' + INK + '" stroke-width="1.6"/>' +
        '<ellipse cx="43.5" cy="42" rx="1.1" ry="3" fill="' + INK + '"/>' +
        '<ellipse cx="56.5" cy="42" rx="1.1" ry="3" fill="' + INK + '"/>' +
        '<path d="M40 53 q 10 -6 20 0 q -2 7 -10 7 q -8 0 -10 -7 z" fill="#6fd3aa" stroke="' + INK + '" stroke-width="2.2" stroke-linejoin="round"/>' +
        '<ellipse cx="46.5" cy="53.5" rx="1.3" ry="1" fill="' + INK + '"/>' +
        '<ellipse cx="53.5" cy="53.5" rx="1.3" ry="1" fill="' + INK + '"/>' +
        '<path d="M45 58 q 5 2.5 10 0" fill="none" stroke="' + INK + '" stroke-width="1.8" stroke-linecap="round"/>';
    }
  };

  /* ── hats ─────────────────────────────────────────── */

  var HAT = {
    none: function () { return ''; },

    beanie: function () {
      return '<path d="M29 30 q 2 -19 21 -19 q 19 0 21 19 z" fill="#d9644f" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>' +
        '<rect x="27" y="28" width="46" height="7" rx="3.5" fill="#f0a08c" stroke="' + INK + '" stroke-width="2.2"/>' +
        '<circle cx="50" cy="9" r="4.5" fill="#f0a08c" stroke="' + INK + '" stroke-width="2.2"/>';
    },

    cap: function () {
      return '<path d="M29 28 q 2 -18 21 -18 q 19 0 21 18 z" fill="#3f6fb5" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>' +
        '<path d="M50 28 h26 q 2 5 -4 6 h-22 z" fill="#2f5591" stroke="' + INK + '" stroke-width="2.2" stroke-linejoin="round"/>' +
        '<circle cx="50" cy="11" r="3" fill="#dce7f7" stroke="' + INK + '" stroke-width="1.8"/>';
    },

    flask: function () {
      return '<path d="M45 6 h10 v8 l8 15 q 2 5 -4 5 h-18 q -6 0 -4 -5 l8 -15 z" fill="#bfe6f2" fill-opacity=".8" stroke="' + INK + '" stroke-width="2.2" stroke-linejoin="round"/>' +
        '<path d="M38 24 h24 q 2 5 -4 5 h-16 q -6 0 -4 -5 z" fill="#49c9f0"/>' +
        '<circle class="pf-fizz" cx="47" cy="20" r="1.8" fill="#ffffff" opacity=".9"/>' +
        '<circle class="pf-fizz pf-fizz-2" cx="54" cy="17" r="1.3" fill="#ffffff" opacity=".9"/>' +
        '<path d="M43 6 h14" stroke="' + INK + '" stroke-width="2.4" stroke-linecap="round"/>';
    },

    halo: function () {
      return '<ellipse class="pf-halo" cx="50" cy="12" rx="16" ry="5" fill="none" stroke="#ffd45e" stroke-width="4"/>' +
        '<ellipse cx="50" cy="12" rx="16" ry="5" fill="none" stroke="#e8b63c" stroke-width="1.4"/>';
    },

    crown: function () {
      return '<path d="M30 28 L30 10 L40 19 L50 7 L60 19 L70 10 L70 28 Z" fill="#ffd45e" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>' +
        '<rect x="29" y="26" width="42" height="6" rx="3" fill="#e8b63c" stroke="' + INK + '" stroke-width="2.2"/>' +
        '<circle cx="50" cy="16" r="2.4" fill="#d9644f"/><circle cx="37" cy="23" r="1.8" fill="#49c9f0"/>' +
        '<circle cx="63" cy="23" r="1.8" fill="#49c9f0"/>';
    }
  };

  /* ── frames ───────────────────────────────────────── */

  var FRAME = {
    none: function () { return ''; },

    ring: function () {
      return '<circle cx="50" cy="50" r="47" fill="none" stroke="' + INK + '" stroke-width="3"/>';
    },

    dashed: function () {
      return '<circle class="pf-turn" cx="50" cy="50" r="47" fill="none" stroke="#6fae95" stroke-width="3.4" stroke-dasharray="7 6" stroke-linecap="round"/>';
    },

    glow: function () {
      return '<circle class="pf-pulse" cx="50" cy="50" r="46" fill="none" stroke="#49c9f0" stroke-width="4"/>' +
        '<circle cx="50" cy="50" r="42" fill="none" stroke="#49c9f0" stroke-width="1.4" opacity=".5"/>';
    },

    gold: function () {
      var g = 'pfg' + (++uid);
      return '<defs><linearGradient id="' + g + '" x1="0" y1="0" x2="1" y2="1">' +
        '<stop offset="0" stop-color="#fff0c2"/><stop offset=".45" stop-color="#ffd45e"/>' +
        '<stop offset="1" stop-color="#9a7320"/></linearGradient></defs>' +
        '<circle cx="50" cy="50" r="46.5" fill="none" stroke="url(#' + g + ')" stroke-width="5"/>' +
        '<circle cx="50" cy="50" r="42.5" fill="none" stroke="#9a7320" stroke-width="1.2" opacity=".6"/>' +
        '<circle cx="50" cy="4.5" r="3.2" fill="#fff0c2" stroke="#9a7320" stroke-width="1.4"/>' +
        '<circle cx="50" cy="95.5" r="3.2" fill="#fff0c2" stroke="#9a7320" stroke-width="1.4"/>';
    },

    rainbow: function () {
      var g = 'pfr' + (++uid);
      return '<defs><linearGradient id="' + g + '" x1="0" y1="0" x2="1" y2="1">' +
        '<stop offset="0" stop-color="#ff8a5c"/><stop offset=".3" stop-color="#ffd45e"/>' +
        '<stop offset=".6" stop-color="#7ef0d8"/><stop offset="1" stop-color="#a35fd0"/>' +
        '</linearGradient></defs>' +
        '<g class="pf-turn"><circle cx="50" cy="50" r="46.5" fill="none" stroke="url(#' + g + ')" stroke-width="5.5"/>' +
        '<circle cx="50" cy="50" r="46.5" fill="none" stroke="#ffffff" stroke-width="5.5" stroke-dasharray="2 26" opacity=".8"/></g>';
    }
  };

  /* ── banners (what is behind you) ─────────────────── */

  var BANNER = {
    plain: function () { return '<circle cx="50" cy="50" r="50" fill="#e7efe9"/>'; },

    grid: function () {
      var s = '<circle cx="50" cy="50" r="50" fill="#eef2f6"/><g stroke="#c7d6e2" stroke-width="1">';
      for (var i = 10; i < 100; i += 10) s += '<line x1="' + i + '" y1="0" x2="' + i + '" y2="100"/><line x1="0" y1="' + i + '" x2="100" y2="' + i + '"/>';
      return s + '</g>';
    },

    bubbles: function () {
      return '<circle cx="50" cy="50" r="50" fill="#dff1f7"/>' +
        '<g fill="#9fd8ea" opacity=".8"><circle class="pf-rise" cx="18" cy="80" r="7"/>' +
        '<circle class="pf-rise pf-rise-2" cx="78" cy="88" r="5"/>' +
        '<circle class="pf-rise pf-rise-3" cx="88" cy="42" r="9"/>' +
        '<circle class="pf-rise pf-rise-2" cx="12" cy="36" r="4.5"/></g>';
    },

    stars: function () {
      var s = '<circle cx="50" cy="50" r="50" fill="#2a2a46"/><g fill="#ffd45e">';
      var pts = [[16, 22, 2.6], [34, 12, 1.6], [78, 20, 2.2], [88, 50, 1.7], [22, 62, 1.9],
        [70, 76, 2.4], [44, 88, 1.6], [12, 46, 1.4], [58, 34, 1.3]];
      for (var i = 0; i < pts.length; i++) {
        s += '<circle class="pf-twinkle' + (i % 3 ? ' pf-twinkle-' + (i % 3) : '') +
          '" cx="' + pts[i][0] + '" cy="' + pts[i][1] + '" r="' + pts[i][2] + '"/>';
      }
      return s + '</g>';
    },

    circuit: function () {
      return '<circle cx="50" cy="50" r="50" fill="#13302c"/>' +
        '<g stroke="#49c9f0" stroke-width="1.6" fill="none" opacity=".75">' +
        '<path d="M0 26 h22 v-14 M100 30 h-26 v16 h-10"/>' +
        '<path d="M0 70 h16 v18 M100 72 h-20 v-12"/>' +
        '<path d="M12 50 h14"/></g>' +
        '<g fill="#7ef0d8"><circle class="pf-pulse" cx="22" cy="12" r="2.6"/>' +
        '<circle class="pf-pulse pf-twinkle-2" cx="64" cy="46" r="2.6"/>' +
        '<circle class="pf-pulse pf-twinkle-1" cx="16" cy="88" r="2.6"/>' +
        '<circle cx="80" cy="60" r="2.2"/></g>';
    },

    aurora: function () {
      var g = 'pfa' + (++uid);
      return '<defs><linearGradient id="' + g + '" x1="0" y1="0" x2="1" y2="1">' +
        '<stop offset="0" stop-color="#15213f"/><stop offset=".5" stop-color="#1f4f5e"/>' +
        '<stop offset="1" stop-color="#2d1a4a"/></linearGradient></defs>' +
        '<circle cx="50" cy="50" r="50" fill="url(#' + g + ')"/>' +
        '<g class="pf-wave" opacity=".55">' +
        '<path d="M-10 34 q 25 -16 50 0 q 25 16 60 0 v16 q -35 16 -60 0 q -25 -16 -50 0 z" fill="#49f0b8"/>' +
        '<path d="M-10 56 q 25 -14 50 0 q 25 14 60 0 v12 q -35 14 -60 0 q -25 -14 -50 0 z" fill="#8f7ef0" opacity=".8"/></g>' +
        '<g fill="#ffffff" opacity=".8"><circle cx="20" cy="16" r="1.4"/><circle cx="76" cy="22" r="1.1"/>' +
        '<circle cx="88" cy="74" r="1.2"/></g>';
    }
  };

  /* ── badges (pinned to the corner) ────────────────── */

  function pin(inner, tint) {
    return '<g transform="translate(74 76)">' +
      '<circle cx="0" cy="0" r="15" fill="' + (tint || '#ffffff') + '" stroke="' + INK + '" stroke-width="2.4"/>' +
      inner + '</g>';
  }

  var BADGE = {
    none: function () { return ''; },

    beaker: function () {
      return pin('<path d="M-4 -8 h8 v6 l5 9 q 1.6 3 -2.6 3 h-12.8 q -4.2 0 -2.6 -3 l5 -9 z" fill="#bfe6f2" stroke="' + INK + '" stroke-width="2"/>' +
        '<path d="M-6.5 3 h13 q 1 3 -2 3 h-9 q -3 0 -2 -3 z" fill="#49c9f0"/>');
    },

    leaf: function () {
      return pin('<path d="M-7 7 q 0 -14 14 -14 q 0 14 -14 14 z" fill="#6fae95" stroke="' + INK + '" stroke-width="2" stroke-linejoin="round"/>' +
        '<path d="M-5 5 q 6 -6 11 -8" fill="none" stroke="' + INK + '" stroke-width="1.4"/>');
    },

    atom: function () {
      return pin('<circle cx="0" cy="0" r="2.6" fill="' + INK + '"/>' +
        '<g class="pf-orbit" fill="none" stroke="#3f6fb5" stroke-width="1.8">' +
        '<ellipse cx="0" cy="0" rx="9" ry="4"/>' +
        '<ellipse cx="0" cy="0" rx="9" ry="4" transform="rotate(60)"/>' +
        '<ellipse cx="0" cy="0" rx="9" ry="4" transform="rotate(120)"/></g>');
    },

    bolt: function () {
      return pin('<path d="M1 -9 L-6 1 h5 l-2 9 L7 -1 H2 z" fill="#ffd45e" stroke="' + INK + '" stroke-width="1.8" stroke-linejoin="round"/>');
    },

    star: function () {
      return pin('<path d="M0 -10 L2.9 -3.2 L10 -2.4 L4.6 2.3 L6.2 9.4 L0 5.7 L-6.2 9.4 L-4.6 2.3 L-10 -2.4 L-2.9 -3.2 Z" fill="#ffd45e" stroke="' + INK + '" stroke-width="1.6" stroke-linejoin="round"/>',
        '#fff6dc');
    }
  };

  /* ── the shelf ────────────────────────────────────────
     cost 0 means it is yours from the start. */

  var LIST = [
    /* skins */
    { id: 'plain', slot: 'skin', name: 'Plain lab coat', cost: 0, blurb: 'Where everyone starts.' },
    { id: 'goggles', slot: 'skin', name: 'Safety goggles', cost: 25, blurb: 'The first rule of every lab.' },
    { id: 'headphones', slot: 'skin', name: 'Big headphones', cost: 40, blurb: 'Revision playlist on.' },
    { id: 'cat', slot: 'skin', name: 'Cat scientist', cost: 60, blurb: 'Curiosity, obviously.' },
    { id: 'robot', slot: 'skin', name: 'Lab robot', cost: 90, blurb: 'Never forgets a formula.' },
    { id: 'astronaut', slot: 'skin', name: 'Astronaut', cost: 130, blurb: 'Helmet on, visor polished.' },
    { id: 'wizard', slot: 'skin', name: 'Star wizard', cost: 180, blurb: 'Science that looks like magic.' },
    { id: 'dragon', slot: 'skin', name: 'Lab dragon', cost: 250, blurb: 'Handles the bunsen burner itself.' },

    /* hats */
    { id: 'none', slot: 'hat', name: 'No hat', cost: 0, blurb: 'Bare head, clear mind.' },
    { id: 'beanie', slot: 'hat', name: 'Bobble beanie', cost: 20, blurb: 'For fieldwork in the cold.' },
    { id: 'cap', slot: 'hat', name: 'Field cap', cost: 30, blurb: 'Sun out of your eyes.' },
    { id: 'flask', slot: 'hat', name: 'Fizzing flask', cost: 55, blurb: 'Balanced on your head. Do not try this.' },
    { id: 'halo', slot: 'hat', name: 'Halo', cost: 110, blurb: 'For handing homework in early.' },
    { id: 'crown', slot: 'hat', name: 'Crown', cost: 200, blurb: 'Top of the class.' },

    /* frames */
    { id: 'none', slot: 'frame', name: 'No frame', cost: 0, blurb: 'Nothing around the edge.' },
    { id: 'ring', slot: 'frame', name: 'Ink ring', cost: 15, blurb: 'A simple drawn circle.' },
    { id: 'dashed', slot: 'frame', name: 'Turning dashes', cost: 30, blurb: 'Slowly going round.' },
    { id: 'glow', slot: 'frame', name: 'Glow', cost: 70, blurb: 'Pulses like something charging.' },
    { id: 'gold', slot: 'frame', name: 'Gold rim', cost: 140, blurb: 'Heavy, polished, smug.' },
    { id: 'rainbow', slot: 'frame', name: 'Spectrum', cost: 240, blurb: 'Every wavelength, turning.' },

    /* banners */
    { id: 'plain', slot: 'banner', name: 'Plain wall', cost: 0, blurb: 'Quiet and out of the way.' },
    { id: 'grid', slot: 'banner', name: 'Graph paper', cost: 20, blurb: 'Squared, like your book.' },
    { id: 'bubbles', slot: 'banner', name: 'Rising bubbles', cost: 35, blurb: 'Something is reacting back there.' },
    { id: 'stars', slot: 'banner', name: 'Night sky', cost: 65, blurb: 'Twinkling, properly dark.' },
    { id: 'circuit', slot: 'banner', name: 'Live circuit', cost: 120, blurb: 'Current running behind you.' },
    { id: 'aurora', slot: 'banner', name: 'Aurora', cost: 220, blurb: 'Charged particles hitting the air.' },

    /* badges */
    { id: 'none', slot: 'badge', name: 'No badge', cost: 0, blurb: 'Nothing pinned on.' },
    { id: 'beaker', slot: 'badge', name: 'Beaker pin', cost: 18, blurb: 'Half full. Of something blue.' },
    { id: 'leaf', slot: 'badge', name: 'Leaf pin', cost: 28, blurb: 'For the photosynthesis crowd.' },
    { id: 'atom', slot: 'badge', name: 'Atom pin', cost: 50, blurb: 'Electrons going round.' },
    { id: 'bolt', slot: 'badge', name: 'Bolt pin', cost: 95, blurb: 'Charge, moving.' },
    { id: 'star', slot: 'badge', name: 'Gold star', cost: 170, blurb: 'The oldest reward there is.' },

    /* titles — text under your name, no drawing */
    { id: 'newcomer', slot: 'title', name: 'New here', cost: 0, blurb: 'Everyone starts somewhere.' },
    { id: 'curious', slot: 'title', name: 'Curious', cost: 15, blurb: 'Asks the next question.' },
    { id: 'note-taker', slot: 'title', name: 'Note-taker', cost: 25, blurb: 'Writes it down before it goes.' },
    { id: 'lab-partner', slot: 'title', name: 'Good lab partner', cost: 45, blurb: 'Does the washing up.' },
    { id: 'hypothesis', slot: 'title', name: 'Has a hypothesis', cost: 80, blurb: 'A guess you can test.' },
    { id: 'reviewed', slot: 'title', name: 'Peer reviewed', cost: 150, blurb: 'Someone else checked it.' },
    { id: 'mad', slot: 'title', name: 'Mad scientist', cost: 230, blurb: 'Affectionately.' },
    { id: 'laureate', slot: 'title', name: 'Future laureate', cost: 400, blurb: 'The expensive one.' }
  ];

  /* ── titles you cannot buy ──────────────────
     These are the ones worth having. No price, no shortcut: each one waits until you have
     actually done the thing. They sit in the same Title slot as the bought ones, so you wear
     a name you earned instead of a name you paid for.

     `need` is what it takes, written the way it is shown. `test` is handed the same numbers
     the profile already counts. */

  var EARNED = [
    { id: 'scholar', name: 'Scholar', need: 'Learn 5 different topics',
      test: function (st) { return st.topics >= 5; } },
    { id: 'collector', name: 'Collector', need: 'Find 10 pets',
      test: function (st) { return st.pets >= 10; } },
    { id: 'survivor', name: 'Survivor', need: 'Escape the monster 3 times',
      test: function (st) { return st.escapes >= 3; } },
    { id: 'duellist', name: 'Duellist', need: 'Win 5 duels',
      test: function (st) { return st.duels >= 5; } },
    { id: 'baron', name: 'Spark Baron', need: 'Earn 1,000 sparks in total',
      test: function (st) { return st.lifetime >= 1000; } },
    { id: 'trainer', name: 'Pet Trainer', need: 'Raise any pet to level ' + MAX_PET_LEVEL,
      test: function (st) { return st.petMax >= MAX_PET_LEVEL; } },
    { id: 'keeper', name: "Got 'em all!", need: 'Find all 50 pets',
      test: function (st) { return st.pets >= st.petTotal; } },
    { id: 'stylist', name: 'Look at me!', need: 'Own every skin, hat and background',
      test: function (st) { return st.dressed; } },
    { id: 'wardrobe', name: 'Walking Wardrobe', need: 'Unlock every single look, frames and badges too',
      test: function (st) { return st.looks >= st.lookTotal; } },
    { id: 'master', name: 'Master', need: 'Learn every topic your grade covers',
      test: function (st) { return st.topics >= st.topicTotal; } },
    { id: 'rich', name: 'I have money.', need: 'Spend 100,000 sparks',
      test: function (st) { return st.spent >= 100000; } },
    { id: 'grandmaster', name: 'I am the master', need: 'Every question right in every topic your grade covers',
      test: function (st) { return st.mastered > 0 && st.mastered >= st.masterTotal; } },
    { id: 'legend', name: 'The Legend', need: 'Earn every other title',
      test: function (st) { return st.others; } }
  ];

  /* pets.js owns the real number; this file only needs it for the wording */
  function petMaxLevel() {
    return (window.PETS && window.PETS.maxLevel) || 20;
  }

  /* which titles the numbers say you have now */
  function earnedTitles(st) {
    var got = {}, plain = 0;
    for (var i = 0; i < EARNED.length; i++) {
      var a = EARNED[i];
      if (a.id === 'legend') continue;
      if (a.test(st)) { got[a.id] = true; plain++; }
    }
    got.legend = plain === EARNED.length - 1;
    return got;
  }

  EARNED.forEach(function (a) {
    LIST.push({
      id: a.id, slot: 'title', name: a.name, cost: null,
      earned: true, need: a.need, blurb: a.need
    });
  });

  /* “Look at me!” is about the three slots people actually see at a glance. Frames,
     badges and titles are their own achievement, because collecting those is a longer job. */
  var DRESS_SLOTS = ['skin', 'hat', 'banner'];

  var SLOTS = [
    { id: 'skin', name: 'Who you are', note: 'The character in the circle.' },
    { id: 'hat', name: 'Hat', note: 'Goes on top.' },
    { id: 'frame', name: 'Frame', note: 'The ring around the edge.' },
    { id: 'banner', name: 'Background', note: 'What is behind you.' },
    { id: 'badge', name: 'Badge', note: 'Pinned to the corner.' },
    { id: 'title', name: 'Title', note: 'A line under your name.' }
  ];

  var DEFAULTS = {
    skin: 'plain', hat: 'none', frame: 'none',
    banner: 'plain', badge: 'none', title: 'newcomer'
  };

  function key(slot, id) { return slot + ':' + id; }

  function byKey(slot, id) {
    for (var i = 0; i < LIST.length; i++) {
      if (LIST[i].slot === slot && LIST[i].id === id) return LIST[i];
    }
    return null;
  }

  function bySlot(slot) {
    return LIST.filter(function (it) { return it.slot === slot; });
  }

  /* ── put it all together ──────────────────────────── */

  function draw(worn, cls) {
    worn = worn || {};
    var pick = function (slot) {
      return byKey(slot, worn[slot]) ? worn[slot] : DEFAULTS[slot];
    };
    var clip = 'pfc' + (++uid);
    var inside =
      (BANNER[pick('banner')] || BANNER.plain)() +
      (SKIN[pick('skin')] || SKIN.plain)() +
      (HAT[pick('hat')] || HAT.none)();

    return '<svg viewBox="0 0 100 100" class="pf-svg ' + (cls || '') + '" role="img" aria-hidden="true">' +
      '<defs><clipPath id="' + clip + '"><circle cx="50" cy="50" r="49"/></clipPath></defs>' +
      '<g clip-path="url(#' + clip + ')">' + inside + '</g>' +
      (BADGE[pick('badge')] || BADGE.none)() +
      (FRAME[pick('frame')] || FRAME.none)() +
      '</svg>';
  }

  function titleText(id) {
    var t = byKey('title', id);
    return t ? t.name : byKey('title', DEFAULTS.title).name;
  }

  window.PROFILE = {
    list: LIST,
    slots: SLOTS,
    defaults: DEFAULTS,
    maxName: 16,

    bySlot: bySlot,
    byKey: byKey,
    key: key,
    draw: draw,
    titleText: titleText,

    /* every free thing, as the keys the save file stores */
    freeKeys: function () {
      return LIST.filter(function (it) { return it.cost === 0; })
        .map(function (it) { return key(it.slot, it.id); });
    },

    buyable: function () {
      return LIST.filter(function (it) { return it.cost > 0; }).length;
    },

    achievements: EARNED,
    earnedTitles: earnedTitles,
    petMaxLevel: petMaxLevel,
    dressSlots: DRESS_SLOTS,

    /* how many buyable items live in the slots “Look at me!” counts */
    dressTotal: function () {
      return LIST.filter(function (it) {
        return it.cost > 0 && DRESS_SLOTS.indexOf(it.slot) > -1;
      }).length;
    }
  };
})();
