/* art.js — the drawings.
   Every scene in the science library names one of these. Each function returns an SVG
   string drawn on a 320x238 canvas: the picture on top, up to three labels underneath.
   Colours come from CSS variables so the drawings work in light and dark mode. */

(function () {
  var C = ['var(--art-1)', 'var(--art-2)', 'var(--art-3)', 'var(--art-4)', 'var(--art-5)'];
  var INK = 'var(--art-ink)';

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /* labels stack under the picture, one per line, so long ones never collide */
  function legend(labels) {
    if (!labels || !labels.length) return '';
    var out = '';
    var n = Math.min(labels.length, 3);
    for (var i = 0; i < n; i++) {
      var y = 192 + i * 15;
      out += '<circle cx="15" cy="' + (y - 4) + '" r="4.5" fill="' + C[i % 5] + '"/>' +
        '<text x="27" y="' + y + '" font-size="12" fill="' + INK +
        '" font-family="ui-sans-serif, system-ui, sans-serif">' + esc(labels[i]).slice(0, 44) + '</text>';
    }
    return out;
  }

  function frame(inner, labels) {
    return '<svg viewBox="0 0 320 238" xmlns="http://www.w3.org/2000/svg" role="img" ' +
      'style="font-family:ui-sans-serif,system-ui,sans-serif">' +
      '<g stroke-linecap="round" stroke-linejoin="round">' + inner + '</g>' +
      legend(labels) + '</svg>';
  }

  function txt(x, y, s, size, fill, anchor) {
    return '<text x="' + x + '" y="' + y + '" font-size="' + (size || 12) + '" fill="' + (fill || INK) +
      '" text-anchor="' + (anchor || 'middle') + '">' + esc(s) + '</text>';
  }

  function arrow(x1, y1, x2, y2, col, w) {
    col = col || INK; w = w || 2.5;
    var a = Math.atan2(y2 - y1, x2 - x1), h = 7;
    var p1 = (x2 - h * Math.cos(a - 0.4)) + ',' + (y2 - h * Math.sin(a - 0.4));
    var p2 = (x2 - h * Math.cos(a + 0.4)) + ',' + (y2 - h * Math.sin(a + 0.4));
    return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + col +
      '" stroke-width="' + w + '"/><polygon points="' + x2 + ',' + y2 + ' ' + p1 + ' ' + p2 + '" fill="' + col + '"/>';
  }

  function dots(x, y, w, h, n, col, jitter, anim) {
    var s = '', seed = 7;
    for (var i = 0; i < n; i++) {
      seed = (seed * 9301 + 49297) % 233280;
      var rx = jitter ? (seed / 233280) : ((i % 4) / 3.5);
      seed = (seed * 9301 + 49297) % 233280;
      var ry = jitter ? (seed / 233280) : (Math.floor(i / 4) / 3.5);
      s += '<circle class="' + (anim || '') + '" style="--d:' + (i * 0.13).toFixed(2) + 's" cx="' +
        (x + rx * w) + '" cy="' + (y + ry * h) + '" r="4" fill="' + col + '"/>';
    }
    return s;
  }

  var A = {};

  A.sun = function (l) {
    var rays = '';
    for (var i = 0; i < 12; i++) {
      var a = i * Math.PI / 6;
      rays += '<line x1="' + (160 + 42 * Math.cos(a)) + '" y1="' + (85 + 42 * Math.sin(a)) +
        '" x2="' + (160 + 62 * Math.cos(a)) + '" y2="' + (85 + 62 * Math.sin(a)) +
        '" stroke="' + C[1] + '" stroke-width="4"/>';
    }
    return frame('<circle class="a-pulse" cx="160" cy="85" r="34" fill="' + C[1] + '"/>' +
      '<g class="a-spin">' + rays + '</g>', l);
  };

  A.leaf = function (l) {
    return frame(
      '<path class="a-sway" d="M160 25 C 90 45 65 110 105 145 C 155 165 215 120 205 60 C 195 38 180 28 160 25 Z" fill="' + C[0] + '"/>' +
      '<path d="M150 150 L 185 55" stroke="var(--art-bg)" stroke-width="4" fill="none"/>' +
      '<path d="M160 120 L 130 105 M168 100 L 138 88 M177 80 L 150 72" stroke="var(--art-bg)" stroke-width="3"/>' +
      '<line x1="150" y1="150" x2="140" y2="168" stroke="' + C[1] + '" stroke-width="5"/>', l);
  };

  A.chloroplast = function (l) {
    var stacks = '';
    for (var i = 0; i < 4; i++) {
      stacks += '<rect class="a-pulse" style="--d:' + (i * 0.35).toFixed(2) + 's" x="' + (98 + i * 34) +
        '" y="' + (62 + (i % 2) * 22) + '" width="24" height="34" rx="6" fill="' + C[0] + '"/>';
    }
    return frame('<ellipse cx="160" cy="90" rx="105" ry="55" fill="none" stroke="' + C[0] + '" stroke-width="4"/>' +
      '<ellipse cx="160" cy="90" rx="95" ry="45" fill="' + C[0] + '" opacity=".16"/>' + stacks, l);
  };

  A.plantCell = function (l) {
    return frame(
      '<rect x="45" y="25" width="230" height="130" rx="8" fill="none" stroke="' + C[1] + '" stroke-width="6"/>' +
      '<rect x="55" y="35" width="210" height="110" rx="6" fill="' + C[0] + '" opacity=".12" stroke="' + C[0] + '" stroke-width="2"/>' +
      '<rect x="95" y="55" width="120" height="70" rx="10" fill="' + C[2] + '" opacity=".25" stroke="' + C[2] + '" stroke-width="2"/>' +
      '<circle cx="80" cy="115" r="16" fill="' + C[3] + '"/>' +
      '<ellipse class="a-float" cx="240" cy="60" rx="16" ry="9" fill="' + C[0] + '"/>' +
      '<ellipse class="a-float" style="--d:1.4s" cx="235" cy="120" rx="16" ry="9" fill="' + C[0] + '"/>', l);
  };

  A.animalCell = function (l) {
    return frame(
      '<path d="M60 90 C 60 40 120 22 165 28 C 235 36 268 70 262 108 C 254 152 180 168 120 155 C 78 145 60 122 60 90 Z" fill="' + C[2] + '" opacity=".16" stroke="' + C[2] + '" stroke-width="3"/>' +
      '<circle cx="150" cy="88" r="30" fill="' + C[3] + '" opacity=".35" stroke="' + C[3] + '" stroke-width="3"/>' +
      '<circle class="a-pulse" cx="150" cy="88" r="10" fill="' + C[3] + '"/>' +
      '<ellipse class="a-float" cx="222" cy="70" rx="20" ry="11" transform="rotate(-18 222 70)" fill="' + C[4] + '"/>' +
      '<ellipse class="a-float" style="--d:1.1s" cx="98" cy="130" rx="20" ry="11" transform="rotate(12 98 130)" fill="' + C[4] + '"/>', l);
  };

  A.mitochondria = function (l) {
    return frame(
      '<ellipse cx="160" cy="88" rx="105" ry="52" fill="' + C[4] + '" opacity=".18" stroke="' + C[4] + '" stroke-width="4"/>' +
      '<path class="a-march" d="M70 88 C 95 55 110 120 135 88 C 160 55 175 120 200 88 C 225 55 240 120 255 88" fill="none" stroke="' + C[4] + '" stroke-width="4" stroke-dasharray="18 6"/>', l);
  };

  A.dna = function (l) {
    var rungs = '';
    for (var i = 0; i < 7; i++) {
      var y = 30 + i * 18;
      var off = 42 * Math.sin(i * 0.9);
      rungs += '<line x1="' + (160 - off) + '" y1="' + y + '" x2="' + (160 + off) + '" y2="' + y +
        '" stroke="' + C[i % 2 ? 1 : 3] + '" stroke-width="5"/>';
    }
    return frame(
      '<g class="a-helix">' +
      '<path d="M118 25 C 202 60 118 100 202 155" fill="none" stroke="' + C[0] + '" stroke-width="5"/>' +
      '<path d="M202 25 C 118 60 202 100 118 155" fill="none" stroke="' + C[0] + '" stroke-width="5"/>' + rungs +
      '</g>', l);
  };

  A.chromosome = function (l) {
    return frame(
      '<path d="M110 25 C 140 60 140 60 110 155" fill="none" stroke="' + C[3] + '" stroke-width="16"/>' +
      '<path d="M170 25 C 140 60 140 60 170 155" fill="none" stroke="' + C[3] + '" stroke-width="16"/>' +
      '<circle class="a-pulse" cx="140" cy="88" r="9" fill="' + C[4] + '"/>' +
      '<g class="a-nudge">' + arrow(200, 88, 250, 88, C[0]) + '</g>' + txt(268, 92, 'DNA', 12), l);
  };

  A.atom = function (l) {
    return frame(
      '<ellipse cx="160" cy="88" rx="100" ry="38" fill="none" stroke="' + C[2] + '" stroke-width="3"/>' +
      '<ellipse cx="160" cy="88" rx="100" ry="38" fill="none" stroke="' + C[2] + '" stroke-width="3" transform="rotate(60 160 88)"/>' +
      '<ellipse cx="160" cy="88" rx="100" ry="38" fill="none" stroke="' + C[2] + '" stroke-width="3" transform="rotate(-60 160 88)"/>' +
      '<circle class="a-pulse" cx="160" cy="88" r="20" fill="' + C[4] + '"/>' +
      '<g class="a-orbit"><circle cx="260" cy="88" r="7" fill="' + C[0] + '"/></g>' +
      '<g class="a-orbit" style="--d:-2s"><circle cx="110" cy="30" r="7" fill="' + C[0] + '"/></g>' +
      '<g class="a-orbit" style="--d:-4s"><circle cx="112" cy="145" r="7" fill="' + C[0] + '"/></g>', l);
  };

  A.periodic = function (l) {
    var g = '';
    for (var r = 0; r < 4; r++) {
      for (var c = 0; c < 9; c++) {
        var on = (r === 1 && c === 3);
        g += '<rect x="' + (48 + c * 26) + '" y="' + (30 + r * 30) + '" width="22" height="26" rx="3" fill="' +
          (on ? C[0] : 'none') + '" opacity="' + (on ? 1 : 1) + '" stroke="' + (on ? C[0] : C[2]) + '" stroke-width="2"/>';
      }
    }
    return frame(g.replace('fill="' + C[0] + '"', 'class="a-glow-fill" fill="' + C[0] + '"') +
      txt(159, 78, 'C', 15, 'var(--art-bg)'), l);
  };

  A.molecule = function (l) {
    return frame(
      '<line x1="160" y1="88" x2="95" y2="130" stroke="' + INK + '" stroke-width="6"/>' +
      '<line x1="160" y1="88" x2="225" y2="130" stroke="' + INK + '" stroke-width="6"/>' +
      '<circle cx="160" cy="88" r="34" fill="' + C[4] + '"/>' + txt(160, 94, 'O', 18, 'var(--art-bg)') +
      '<g class="a-float"><circle cx="95" cy="130" r="22" fill="' + C[2] + '"/>' + txt(95, 136, 'H', 14, 'var(--art-bg)') + '</g>' +
      '<g class="a-float" style="--d:.9s"><circle cx="225" cy="130" r="22" fill="' + C[2] + '"/>' + txt(225, 136, 'H', 14, 'var(--art-bg)') + '</g>', l);
  };

  A.beaker = function (l) {
    return frame(
      '<path d="M105 25 L 105 130 Q 105 155 130 155 L 190 155 Q 215 155 215 130 L 215 25" fill="none" stroke="' + INK + '" stroke-width="4"/>' +
      '<path d="M105 90 L 105 130 Q 105 155 130 155 L 190 155 Q 215 155 215 130 L 215 90 Z" fill="' + C[0] + '" opacity=".35"/>' +
      '<line x1="95" y1="25" x2="225" y2="25" stroke="' + INK + '" stroke-width="4"/>' +
      '<circle class="a-bubble" cx="140" cy="115" r="6" fill="' + C[0] + '"/>' +
      '<circle class="a-bubble" style="--d:.7s" cx="175" cy="128" r="5" fill="' + C[0] + '"/>' +
      '<circle class="a-bubble" style="--d:1.4s" cx="160" cy="100" r="4" fill="' + C[0] + '"/>', l);
  };

  A.flame = function (l) {
    return frame(
      '<path d="M160 20 C 200 62 208 92 190 118 C 176 138 144 138 130 118 C 112 92 122 62 160 20 Z" fill="' + C[1] + '"/>' +
      '<path class="a-flicker" d="M160 62 C 178 86 180 104 170 116 C 162 126 148 126 141 116 C 132 104 142 86 160 62 Z" fill="' + C[4] + '"/>' +
      '<rect x="130" y="138" width="60" height="18" rx="4" fill="' + INK + '" opacity=".5"/>', l);
  };

  A.statesMatter = function (l) {
    var box = function (x, label, n, jit, col, anim) {
      return '<rect x="' + x + '" y="35" width="84" height="90" rx="8" fill="none" stroke="' + INK + '" stroke-width="3"/>' +
        dots(x + 14, 50, 56, 60, n, col, jit, anim) + txt(x + 42, 145, label, 12);
    };
    return frame(box(18, 'solid', 12, false, C[2], 'a-jiggle-slow') +
      box(118, 'liquid', 10, true, C[0], 'a-jiggle') +
      box(218, 'gas', 6, true, C[1], 'a-jiggle-fast'), l);
  };

  A.thermometer = function (l) {
    return frame(
      '<rect x="148" y="20" width="24" height="110" rx="12" fill="none" stroke="' + INK + '" stroke-width="3"/>' +
      '<circle cx="160" cy="140" r="22" fill="' + C[4] + '"/>' +
      '<rect class="a-climb" x="153" y="70" width="14" height="62" fill="' + C[4] + '"/>' +
      '<line x1="180" y1="40" x2="200" y2="40" stroke="' + INK + '" stroke-width="2"/>' +
      '<line x1="180" y1="70" x2="200" y2="70" stroke="' + INK + '" stroke-width="2"/>' +
      '<line x1="180" y1="100" x2="200" y2="100" stroke="' + INK + '" stroke-width="2"/>', l);
  };

  A.waterDrop = function (l) {
    return frame('<path class="a-bob" d="M160 20 C 210 80 225 105 205 132 C 188 156 132 156 115 132 C 95 105 110 80 160 20 Z" fill="' + C[2] + '"/>' +
      '<circle cx="140" cy="115" r="10" fill="var(--art-bg)" opacity=".5"/>', l);
  };

  A.cloudRain = function (l) {
    var rain = '';
    for (var i = 0; i < 6; i++) {
      rain += '<line class="a-rain" style="--d:' + (i * 0.17).toFixed(2) + 's" x1="' + (95 + i * 26) +
        '" y1="118" x2="' + (88 + i * 26) + '" y2="152" stroke="' + C[2] + '" stroke-width="4"/>';
    }
    return frame(
      '<path class="a-drift" d="M100 105 A 30 30 0 0 1 100 45 A 38 38 0 0 1 172 40 A 32 32 0 0 1 225 105 Z" fill="' + C[2] + '" opacity=".45" stroke="' + C[2] + '" stroke-width="3"/>' + rain, l);
  };

  A.cycleArrows = function (l) {
    return frame(
      '<circle class="a-march" cx="160" cy="88" r="60" fill="none" stroke="' + C[0] + '" stroke-width="4" stroke-dasharray="14 10"/>' +
      arrow(160, 28, 178, 30, C[0], 4) + arrow(160, 148, 142, 146, C[0], 4) +
      '<circle cx="160" cy="88" r="24" fill="' + C[0] + '" opacity=".2"/>' + txt(160, 93, 'again', 12), l);
  };

  A.mountain = function (l) {
    return frame(
      '<circle class="a-pulse" cx="252" cy="42" r="20" fill="' + C[1] + '"/>' +
      '<path d="M20 150 L 95 55 L 150 120 L 190 75 L 300 150 Z" fill="' + C[2] + '" opacity=".5" stroke="' + C[2] + '" stroke-width="3"/>' +
      '<path d="M95 55 L 72 84 L 118 84 Z" fill="var(--art-bg)"/>', l);
  };

  A.volcano = function (l) {
    return frame(
      '<path d="M35 155 L 120 45 L 200 45 L 285 155 Z" fill="' + INK + '" opacity=".35"/>' +
      '<path d="M120 45 C 135 20 150 15 160 8 C 172 18 188 22 200 45 Z" fill="' + C[4] + '"/>' +
      '<path d="M160 45 L 150 105 L 175 105 Z" fill="' + C[1] + '"/>' +
      '<circle class="a-puff" cx="128" cy="26" r="7" fill="' + C[1] + '"/>' +
      '<circle class="a-puff" style="--d:.8s" cx="196" cy="30" r="6" fill="' + C[1] + '"/>', l);
  };

  A.earthLayers = function (l) {
    return frame(
      '<circle cx="160" cy="88" r="76" fill="' + C[2] + '" opacity=".3" stroke="' + C[2] + '" stroke-width="3"/>' +
      '<circle cx="160" cy="88" r="54" fill="' + C[1] + '" opacity=".45"/>' +
      '<circle cx="160" cy="88" r="30" fill="' + C[4] + '"/>' +
      '<circle class="a-glow" cx="160" cy="88" r="13" fill="' + C[4] + '"/>', l);
  };

  A.plates = function (l) {
    return frame(
      '<rect x="15" y="90" width="140" height="45" rx="4" fill="' + C[2] + '" opacity=".55" stroke="' + C[2] + '" stroke-width="3"/>' +
      '<rect x="165" y="90" width="140" height="45" rx="4" fill="' + C[1] + '" opacity=".55" stroke="' + C[1] + '" stroke-width="3"/>' +
      '<g class="a-nudge">' + arrow(70, 65, 140, 65, INK) + '</g>' +
      '<g class="a-nudge-back">' + arrow(250, 65, 180, 65, INK) + '</g>' +
      '<path class="a-pulse" d="M155 90 L 145 55 L 175 55 L 165 90 Z" fill="' + C[4] + '"/>', l);
  };

  A.forceArrow = function (l) {
    return frame(
      '<rect x="120" y="60" width="80" height="60" rx="6" fill="' + C[2] + '" opacity=".35" stroke="' + C[2] + '" stroke-width="3"/>' +
      '<g class="a-nudge">' + arrow(45, 90, 112, 90, C[0], 5) + '</g>' +
      '<g class="a-nudge-back">' + arrow(275, 90, 208, 90, C[4], 5) + '</g>' +
      txt(70, 72, 'push', 12) + txt(252, 72, 'push back', 12), l);
  };

  A.ramp = function (l) {
    return frame(
      '<path d="M30 145 L 275 145 L 275 45 Z" fill="' + INK + '" opacity=".18" stroke="' + INK + '" stroke-width="3"/>' +
      '<rect class="a-slide" x="185" y="60" width="46" height="34" rx="5" transform="rotate(-22 208 77)" fill="' + C[1] + '"/>' +
      arrow(205, 95, 150, 128, C[0], 4), l);
  };

  A.motionBall = function (l) {
    return frame(
      '<line x1="20" y1="150" x2="300" y2="150" stroke="' + INK + '" stroke-width="3"/>' +
      '<circle cx="80" cy="120" r="16" fill="' + C[2] + '" opacity=".3"/>' +
      '<circle cx="150" cy="120" r="18" fill="' + C[2] + '" opacity=".55"/>' +
      '<circle class="a-roll" cx="235" cy="120" r="20" fill="' + C[2] + '"/>' +
      arrow(100, 60, 250, 60, C[0], 4) + txt(175, 50, 'speeding up', 12), l);
  };

  A.spring = function (l) {
    var d = 'M60 40 ';
    for (var i = 0; i < 6; i++) d += 'L' + (i % 2 ? 60 : 120) + ' ' + (40 + i * 16) + ' ';
    return frame('<line x1="40" y1="30" x2="140" y2="30" stroke="' + INK + '" stroke-width="4"/>' +
      '<path d="' + d + '" fill="none" stroke="' + C[3] + '" stroke-width="4"/>' +
      '<rect class="a-bounce" x="62" y="132" width="56" height="30" rx="5" fill="' + C[1] + '"/>' +
      arrow(215, 40, 215, 140, C[0], 4) + txt(255, 95, 'energy', 12), l);
  };

  A.battery = function (l) {
    return frame(
      '<rect x="80" y="55" width="150" height="70" rx="8" fill="none" stroke="' + INK + '" stroke-width="4"/>' +
      '<rect x="230" y="78" width="16" height="24" rx="3" fill="' + INK + '"/>' +
      '<rect class="a-glow" x="88" y="63" width="80" height="54" rx="5" fill="' + C[0] + '" opacity=".5"/>' +
      txt(198, 98, '+', 26) + txt(102, 98, '−', 26, 'var(--art-ink)'), l);
  };

  A.bulb = function (l) {
    return frame(
      '<circle class="a-glow" cx="160" cy="75" r="44" fill="' + C[1] + '" opacity=".45" stroke="' + C[1] + '" stroke-width="4"/>' +
      '<path d="M143 100 L 150 70 L 160 90 L 170 70 L 177 100" fill="none" stroke="' + INK + '" stroke-width="3"/>' +
      '<rect x="142" y="118" width="36" height="26" rx="4" fill="' + INK + '" opacity=".6"/>' +
      '<line x1="228" y1="40" x2="252" y2="28" stroke="' + C[1] + '" stroke-width="4"/>' +
      '<line x1="92" y1="40" x2="68" y2="28" stroke="' + C[1] + '" stroke-width="4"/>', l);
  };

  A.circuit = function (l) {
    return frame(
      '<rect class="a-current" x="45" y="35" width="230" height="110" rx="10" fill="none" stroke="' + C[2] + '" stroke-width="4" stroke-dasharray="10 8"/>' +
      '<rect x="120" y="22" width="80" height="26" rx="4" fill="var(--art-bg)" stroke="' + INK + '" stroke-width="3"/>' +
      txt(160, 40, 'battery', 11) +
      '<circle class="a-glow" cx="275" cy="90" r="20" fill="' + C[1] + '" opacity=".7"/>' +
      '<line x1="100" y1="145" x2="130" y2="128" stroke="' + INK + '" stroke-width="4"/>' +
      txt(112, 168, 'switch', 11) + txt(275, 128, 'bulb', 11), l);
  };

  A.wave = function (l) {
    var d = 'M20 88 ';
    for (var x = 20; x <= 300; x += 4) d += 'L' + x + ' ' + (88 - 45 * Math.sin((x - 20) / 22)) + ' ';
    return frame('<path class="a-travel" d="' + d + '" fill="none" stroke="' + C[3] + '" stroke-width="4" stroke-dasharray="22 10"/>' +
      '<line x1="20" y1="88" x2="300" y2="88" stroke="' + INK + '" stroke-width="1.5" stroke-dasharray="5 5"/>' +
      arrow(55, 158, 193, 158, C[0], 3) + txt(124, 150, 'one wavelength', 11), l);
  };

  A.ear = function (l) {
    var arcs = '';
    for (var i = 0; i < 3; i++) {
      arcs += '<path class="a-ping" style="--d:' + (i * 0.45).toFixed(2) + 's" d="M' + (70 + i * 26) +
        ' 50 A 50 50 0 0 0 ' + (70 + i * 26) + ' 128" fill="none" stroke="' + C[3] + '" stroke-width="3"/>';
    }
    return frame(arcs +
      '<path d="M215 40 C 260 40 268 100 240 128 C 226 142 210 138 208 122 C 206 108 222 106 222 92" fill="none" stroke="' + INK + '" stroke-width="5"/>', l);
  };

  A.eye = function (l) {
    return frame(
      '<path d="M60 90 C 105 40 215 40 260 90 C 215 140 105 140 60 90 Z" fill="none" stroke="' + INK + '" stroke-width="4"/>' +
      '<circle cx="160" cy="90" r="28" fill="' + C[2] + '"/>' +
      '<circle class="a-pupil" cx="160" cy="90" r="12" fill="' + INK + '"/>' +
      '<g class="a-ping">' + arrow(285, 30, 200, 72, C[1], 3) + '</g>', l);
  };

  A.foodChain = function (l) {
    return frame(
      '<path d="M40 130 L 40 100 M30 118 L 40 108 L 50 118" stroke="' + C[0] + '" stroke-width="4" fill="none"/>' +
      '<ellipse cx="40" cy="140" rx="26" ry="10" fill="' + C[0] + '" opacity=".4"/>' +
      '<g class="a-nudge">' + arrow(75, 120, 118, 120, INK, 3) + '</g>' +
      '<ellipse cx="150" cy="120" rx="24" ry="15" fill="' + C[1] + '"/><circle cx="168" cy="112" r="7" fill="' + C[1] + '"/>' +
      '<g class="a-nudge" style="--d:.6s">' + arrow(185, 120, 228, 120, INK, 3) + '</g>' +
      '<ellipse cx="262" cy="112" rx="30" ry="18" fill="' + C[3] + '"/><circle cx="288" cy="98" r="10" fill="' + C[3] + '"/>' +
      '<polygon points="296,96 310,100 296,104" fill="' + C[1] + '"/>' +
      txt(160, 50, 'energy moves up', 12), l);
  };

  A.tree = function (l) {
    return frame(
      '<rect x="150" y="95" width="20" height="60" fill="' + C[1] + '"/>' +
      '<g class="a-sway-top">' +
      '<circle cx="160" cy="72" r="46" fill="' + C[0] + '" opacity=".75"/>' +
      '<circle cx="118" cy="92" r="26" fill="' + C[0] + '" opacity=".6"/>' +
      '<circle cx="202" cy="92" r="26" fill="' + C[0] + '" opacity=".6"/>' +
      '</g>' +
      '<line x1="20" y1="155" x2="300" y2="155" stroke="' + INK + '" stroke-width="3"/>', l);
  };

  A.heart = function (l) {
    return frame(
      '<path class="a-beat" d="M160 150 C 90 105 82 60 112 40 C 136 24 158 44 160 58 C 162 44 184 24 208 40 C 238 60 230 105 160 150 Z" fill="' + C[4] + '"/>' +
      arrow(60, 60, 108, 78, C[2], 4) + arrow(212, 78, 262, 60, C[0], 4), l);
  };

  A.lungs = function (l) {
    return frame(
      '<rect x="154" y="20" width="12" height="52" rx="5" fill="' + INK + '"/>' +
      '<path class="a-breathe" d="M158 65 C 120 65 82 92 88 132 C 92 158 130 158 142 138 C 152 122 158 100 158 65 Z" fill="' + C[2] + '" opacity=".6" stroke="' + C[2] + '" stroke-width="3"/>' +
      '<path class="a-breathe" d="M162 65 C 200 65 238 92 232 132 C 228 158 190 158 178 138 C 168 122 162 100 162 65 Z" fill="' + C[2] + '" opacity=".6" stroke="' + C[2] + '" stroke-width="3"/>' +
      arrow(160, 8, 160, 20, C[0], 3), l);
  };

  A.stomach = function (l) {
    return frame(
      '<path d="M120 15 L 120 60" stroke="' + INK + '" stroke-width="8"/>' +
      '<path d="M120 60 C 80 70 78 130 128 138 C 175 145 196 108 178 82 C 166 64 140 58 120 60 Z" fill="' + C[1] + '" opacity=".5" stroke="' + C[1] + '" stroke-width="3"/>' +
      '<path class="a-march" d="M170 132 C 210 150 230 120 250 145" fill="none" stroke="' + C[0] + '" stroke-width="8" stroke-dasharray="14 8"/>', l);
  };

  A.balance = function (l) {
    return frame(
      '<line x1="160" y1="35" x2="160" y2="150" stroke="' + INK + '" stroke-width="5"/>' +
      '<g class="a-tip">' +
      '<line x1="55" y1="45" x2="265" y2="45" stroke="' + INK + '" stroke-width="5"/>' +
      '<path d="M25 60 L 85 60 L 55 100 Z" fill="' + C[0] + '" opacity=".6"/>' +
      '<path d="M235 60 L 295 60 L 265 100 Z" fill="' + C[1] + '" opacity=".6"/>' +
      '<line x1="55" y1="45" x2="55" y2="60" stroke="' + INK + '" stroke-width="3"/>' +
      '<line x1="265" y1="45" x2="265" y2="60" stroke="' + INK + '" stroke-width="3"/>' +
      '</g>' +
      '<rect x="120" y="150" width="80" height="10" rx="4" fill="' + INK + '"/>', l);
  };

  A.magnet = function (l) {
    return frame(
      '<path d="M95 150 L 95 90 A 65 65 0 0 1 225 90 L 225 150" fill="none" stroke="' + C[2] + '" stroke-width="26"/>' +
      '<rect class="a-glow" x="82" y="132" width="26" height="24" fill="' + C[4] + '"/>' +
      '<rect class="a-glow" style="--d:1.3s" x="212" y="132" width="26" height="24" fill="' + C[2] + '"/>' +
      txt(95, 175, 'N', 13) + txt(225, 175, 'S', 13), l);
  };

  A.checklist = function (l) {
    var rows = '';
    for (var i = 0; i < 3; i++) {
      var y = 55 + i * 32;
      rows += '<path class="a-tick" style="--d:' + (i * 0.5).toFixed(2) + 's" d="M108 ' + y +
        ' l 9 9 l 16 -19" fill="none" stroke="' + C[0] + '" stroke-width="4"/>' +
        '<rect x="145" y="' + (y - 6) + '" width="80" height="9" rx="4" fill="' + INK + '" opacity=".3"/>';
    }
    return frame('<rect x="85" y="20" width="150" height="140" rx="10" fill="none" stroke="' + INK + '" stroke-width="4"/>' +
      '<rect x="132" y="10" width="56" height="20" rx="6" fill="' + INK + '" opacity=".5"/>' + rows, l);
  };

  A.microscope = function (l) {
    return frame(
      '<rect x="90" y="150" width="140" height="12" rx="5" fill="' + INK + '"/>' +
      '<path d="M150 150 C 120 120 130 70 165 55" fill="none" stroke="' + INK + '" stroke-width="8"/>' +
      '<rect x="150" y="25" width="34" height="60" rx="8" transform="rotate(22 167 55)" fill="' + C[2] + '"/>' +
      '<rect class="a-glow" x="120" y="112" width="90" height="8" fill="' + C[0] + '"/>', l);
  };

  A.gears = function (l) {
    function gear(cx, cy, r, col) {
      var s = '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + col + '" stroke-width="9"/>';
      for (var i = 0; i < 8; i++) {
        var a = i * Math.PI / 4;
        s += '<line x1="' + (cx + r * Math.cos(a)) + '" y1="' + (cy + r * Math.sin(a)) + '" x2="' +
          (cx + (r + 11) * Math.cos(a)) + '" y2="' + (cy + (r + 11) * Math.sin(a)) + '" stroke="' + col + '" stroke-width="8"/>';
      }
      return s;
    }
    return frame('<g class="a-spin-slow" style="--ox:115px;--oy:85px">' + gear(115, 85, 38, C[2]) + '</g>' +
      '<g class="a-spin-back" style="--ox:215px;--oy:110px">' + gear(215, 110, 28, C[1]) + '</g>', l);
  };

  A.person = function (l) {
    return frame(
      '<circle cx="160" cy="45" r="24" fill="' + C[3] + '"/>' +
      '<path d="M160 70 C 120 70 110 120 112 155 L 208 155 C 210 120 200 70 160 70 Z" fill="' + C[3] + '" opacity=".55"/>' +
      '<path class="a-sway" d="M112 100 L 70 78 M208 100 L 250 78" stroke="' + C[3] + '" stroke-width="8" fill="none"/>', l);
  };

  window.ART = {
    render: function (key, labels) {
      var fn = A[key] || A.checklist;
      return fn(labels || []);
    },
    keys: Object.keys(A)
  };
})();
