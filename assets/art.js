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

  /* ── acids and bases ── */

  A.phScale = function (l) {
    var band = '', cols = ['#c0392b', '#d35400', '#e08e0b', '#9aab1f', '#36a65a', '#2a8f8f', '#2b6cb0', '#4a3f9f'];
    for (var i = 0; i < 8; i++) {
      band += '<rect x="' + (20 + i * 35) + '" y="70" width="35" height="40" fill="' + cols[i] + '"/>';
    }
    return frame(band +
      '<rect x="20" y="70" width="280" height="40" fill="none" stroke="' + INK + '" stroke-width="2"/>' +
      '<polygon class="a-slide" points="90,62 100,48 110,62" fill="' + INK + '"/>' +
      txt(24, 128, '0', 11, INK, 'start') + txt(160, 128, '7', 11) + txt(296, 128, '14', 11, INK, 'end') +
      txt(60, 60, 'acid', 11) + txt(160, 60, 'neutral', 11) + txt(262, 60, 'base', 11), l);
  };

  A.gasTest = function (l) {
    return frame(
      '<path d="M60 30 L 60 95 Q 60 125 90 125 Q 120 125 120 95 L 120 30" fill="none" stroke="' + INK + '" stroke-width="4"/>' +
      '<path d="M60 80 L 60 95 Q 60 125 90 125 Q 120 125 120 95 L 120 80 Z" fill="' + C[1] + '" opacity=".4"/>' +
      '<circle class="a-bubble" cx="80" cy="100" r="5" fill="' + C[1] + '"/>' +
      '<circle class="a-bubble" style="--d:.8s" cx="100" cy="110" r="4" fill="' + C[1] + '"/>' +
      '<path class="a-march" d="M120 45 Q 180 20 215 60" fill="none" stroke="' + INK + '" stroke-width="4" stroke-dasharray="10 6"/>' +
      '<path d="M190 60 L 190 120 Q 190 148 218 148 Q 246 148 246 120 L 246 60" fill="none" stroke="' + INK + '" stroke-width="4"/>' +
      '<path d="M190 105 L 190 120 Q 190 148 218 148 Q 246 148 246 120 L 246 105 Z" fill="' + C[2] + '" opacity=".45"/>' +
      '<circle class="a-glow" cx="218" cy="126" r="14" fill="#e8e8ee" opacity=".8"/>', l);
  };

  /* ── light and optics ── */

  A.rayBox = function (l) {
    var rays = '';
    for (var i = 0; i < 3; i++) {
      rays += '<line class="a-travel" style="--d:' + (i * .2) + 's" x1="80" y1="' + (55 + i * 30) +
        '" x2="285" y2="' + (55 + i * 30) + '" stroke="' + C[1] + '" stroke-width="3" stroke-dasharray="20 8"/>';
    }
    return frame('<rect x="22" y="48" width="56" height="94" rx="6" fill="' + INK + '" opacity=".55"/>' +
      '<circle class="a-glow" cx="68" cy="95" r="12" fill="' + C[1] + '"/>' + rays, l);
  };

  A.mirror = function (l) {
    return frame(
      '<line x1="40" y1="140" x2="280" y2="140" stroke="' + C[2] + '" stroke-width="7"/>' +
      '<line x1="40" y1="147" x2="280" y2="147" stroke="' + INK + '" stroke-width="3" opacity=".4"/>' +
      '<line x1="160" y1="30" x2="160" y2="140" stroke="' + INK + '" stroke-width="2" stroke-dasharray="6 5"/>' +
      txt(176, 44, 'normal', 11, INK, 'start') +
      '<g class="a-ping">' + arrow(60, 40, 155, 136, C[1], 3) + '</g>' +
      '<g class="a-ping" style="--d:.5s">' + arrow(165, 136, 262, 40, C[4], 3) + '</g>' +
      '<path d="M160 110 A 30 30 0 0 0 138 122" fill="none" stroke="' + C[1] + '" stroke-width="2"/>' +
      '<path d="M160 110 A 30 30 0 0 1 182 122" fill="none" stroke="' + C[4] + '" stroke-width="2"/>' +
      txt(126, 112, 'i', 12) + txt(196, 112, 'r', 12), l);
  };

  A.refract = function (l) {
    return frame(
      '<rect x="95" y="50" width="130" height="92" rx="4" fill="' + C[2] + '" opacity=".28" stroke="' + C[2] + '" stroke-width="3"/>' +
      '<line x1="95" y1="30" x2="95" y2="160" stroke="' + INK + '" stroke-width="2" stroke-dasharray="6 5"/>' +
      '<path class="a-travel" d="M22 48 L 95 78 L 225 128 L 292 146" fill="none" stroke="' + C[1] + '" stroke-width="3.5" stroke-dasharray="18 7"/>' +
      txt(60, 44, 'air', 11) + txt(160, 42, 'glass: slower', 11) + txt(268, 130, 'air', 11), l);
  };

  A.prism = function (l) {
    var fan = '', cols = ['#c0392b', '#d97b22', '#d8b219', '#37a05a', '#2d7fb8', '#5c4a9e'];
    for (var i = 0; i < 6; i++) {
      fan += '<line x1="196" y1="96" x2="296" y2="' + (56 + i * 17) + '" stroke="' + cols[i] + '" stroke-width="3.5"/>';
    }
    return frame(
      '<path class="a-travel" d="M18 82 L 132 92" fill="none" stroke="#e9e9ee" stroke-width="4" stroke-dasharray="16 7"/>' +
      '<polygon points="160,38 216,130 104,130" fill="' + C[2] + '" opacity=".3" stroke="' + C[2] + '" stroke-width="3"/>' +
      fan + txt(58, 72, 'white light', 11), l);
  };

  A.lens = function (l) {
    var rays = '';
    for (var i = 0; i < 3; i++) {
      var y = 56 + i * 36;
      rays += '<line class="a-travel" style="--d:' + (i * .15) + 's" x1="20" y1="' + y + '" x2="150" y2="' + y +
        '" stroke="' + C[1] + '" stroke-width="3" stroke-dasharray="16 7"/>' +
        '<line x1="170" y1="' + y + '" x2="262" y2="92" stroke="' + C[1] + '" stroke-width="3"/>';
    }
    return frame(rays +
      '<path d="M160 34 Q 192 92 160 150 Q 128 92 160 34 Z" fill="' + C[2] + '" opacity=".35" stroke="' + C[2] + '" stroke-width="3"/>' +
      '<circle class="a-pulse" cx="262" cy="92" r="6" fill="' + C[4] + '"/>' +
      txt(268, 118, 'focus', 11, INK, 'start'), l);
  };

  A.fibre = function (l) {
    return frame(
      '<path d="M20 60 Q 160 20 300 70" fill="none" stroke="' + C[2] + '" stroke-width="4" opacity=".6"/>' +
      '<path d="M20 120 Q 160 84 300 134" fill="none" stroke="' + C[2] + '" stroke-width="4" opacity=".6"/>' +
      '<path class="a-travel" d="M24 92 L 70 64 L 116 108 L 162 56 L 208 100 L 254 70 L 296 104" fill="none" stroke="' + C[1] + '" stroke-width="3.5" stroke-dasharray="14 8"/>' +
      '<circle class="a-glow" cx="296" cy="104" r="9" fill="' + C[1] + '"/>', l);
  };

  A.eclipse = function (l) {
    return frame(
      '<circle class="a-pulse" cx="42" cy="92" r="30" fill="' + C[1] + '"/>' +
      '<polygon points="72,70 160,84 160,100 72,114" fill="' + C[1] + '" opacity=".25"/>' +
      '<circle cx="168" cy="92" r="18" fill="' + INK + '"/>' +
      '<polygon points="186,86 282,60 282,124 186,98" fill="' + INK + '" opacity=".35"/>' +
      '<circle cx="268" cy="92" r="34" fill="' + C[2] + '" opacity=".55" stroke="' + C[2] + '" stroke-width="3"/>' +
      '<path d="M234 92 A 34 34 0 0 1 302 92 Z" fill="' + INK + '" opacity=".25"/>', l);
  };

  /* ── the solar system ── */

  A.solarSystem = function (l) {
    var out = '<circle class="a-pulse" cx="34" cy="92" r="26" fill="' + C[1] + '"/>';
    var sizes = [5, 7, 7.5, 6, 13, 11, 8, 8];
    for (var i = 0; i < 8; i++) {
      var x = 76 + i * 28;
      out += '<ellipse cx="34" cy="92" rx="' + (x - 34) + '" ry="' + ((x - 34) * 0.42) +
        '" fill="none" stroke="' + INK + '" stroke-width="1" opacity=".3"/>' +
        '<circle class="a-float" style="--d:' + (i * .3) + 's" cx="' + x + '" cy="92" r="' + sizes[i] +
        '" fill="' + C[i % 2 ? 2 : 3] + '"/>';
    }
    return frame(out, l);
  };

  A.dayNight = function (l) {
    return frame(
      '<circle class="a-glow" cx="36" cy="92" r="22" fill="' + C[1] + '"/>' +
      '<line class="a-travel" x1="60" y1="92" x2="130" y2="92" stroke="' + C[1] + '" stroke-width="3" stroke-dasharray="14 7"/>' +
      '<circle cx="200" cy="92" r="52" fill="' + INK + '" opacity=".6"/>' +
      '<path d="M200 40 A 52 52 0 0 0 200 144 Z" fill="' + C[2] + '"/>' +
      '<line x1="200" y1="24" x2="200" y2="160" stroke="' + INK + '" stroke-width="2" stroke-dasharray="5 5"/>' +
      '<path class="a-spin-slow" style="--ox:200px;--oy:92px" d="M236 56 A 50 50 0 0 1 248 84" fill="none" stroke="' + C[0] + '" stroke-width="3"/>' +
      txt(152, 96, 'day', 11) + txt(250, 96, 'night', 11), l);
  };

  A.seasons = function (l) {
    var out = '<circle class="a-pulse" cx="160" cy="92" r="24" fill="' + C[1] + '"/>' +
      '<ellipse cx="160" cy="92" rx="120" ry="52" fill="none" stroke="' + INK + '" stroke-width="1.5" opacity=".35"/>';
    [[40, 92, 'tilted away'], [280, 92, 'tilted toward']].forEach(function (p, i) {
      out += '<g transform="rotate(-23 ' + p[0] + ' ' + p[1] + ')">' +
        '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="20" fill="' + C[2] + '" opacity=".7"/>' +
        '<line x1="' + p[0] + '" y1="' + (p[1] - 28) + '" x2="' + p[0] + '" y2="' + (p[1] + 28) +
        '" stroke="' + INK + '" stroke-width="2.5"/></g>' +
        txt(p[0], p[1] + 46, p[2], 10);
    });
    return frame(out, l);
  };

  A.moonPhases = function (l) {
    var out = '';
    for (var i = 0; i < 5; i++) {
      var x = 44 + i * 58, lit = i / 4;
      out += '<circle cx="' + x + '" cy="88" r="22" fill="' + INK + '" opacity=".75"/>';
      if (i > 0) {
        out += '<path class="a-glow-fill" d="M' + x + ' 66 A 22 22 0 0 ' + (i >= 3 ? 1 : 0) + ' ' + x + ' 110 A ' +
          (22 * Math.abs(1 - lit * 2)) + ' 22 0 0 ' + (i > 2 ? 1 : 0) + ' ' + x + ' 66 Z" fill="#efe9d6"/>';
      }
    }
    return frame(out + txt(44, 138, 'new', 10) + txt(160, 138, 'half', 10) + txt(276, 138, 'full', 10), l);
  };

  A.orbitPull = function (l) {
    return frame(
      '<ellipse cx="160" cy="92" rx="112" ry="62" fill="none" stroke="' + INK + '" stroke-width="1.5" stroke-dasharray="7 6" opacity=".45"/>' +
      '<circle class="a-pulse" cx="160" cy="92" r="26" fill="' + C[1] + '"/>' +
      '<g class="a-orbit"><circle cx="272" cy="92" r="11" fill="' + C[2] + '"/></g>' +
      arrow(258, 78, 196, 88, C[4], 3) + arrow(276, 72, 276, 30, C[0], 3) +
      txt(216, 70, 'pull', 11) + txt(286, 26, 'speed', 11, INK, 'start'), l);
  };

  A.tides = function (l) {
    return frame(
      '<ellipse class="a-breathe" cx="150" cy="92" rx="78" ry="56" fill="' + C[2] + '" opacity=".4"/>' +
      '<circle cx="150" cy="92" r="48" fill="' + C[0] + '" opacity=".75"/>' +
      '<circle cx="286" cy="92" r="15" fill="' + INK + '" opacity=".7"/>' +
      arrow(250, 92, 216, 92, C[4], 3) +
      txt(226, 44, 'bulge', 11) + txt(74, 44, 'bulge', 11) + txt(286, 126, 'Moon', 10), l);
  };

  A.stars = function (l) {
    var out = '', seed = 11;
    for (var i = 0; i < 26; i++) {
      seed = (seed * 9301 + 49297) % 233280;
      var x = 14 + (seed / 233280) * 292;
      seed = (seed * 9301 + 49297) % 233280;
      var y = 20 + (seed / 233280) * 140;
      var r = 1.2 + (i % 4) * 0.9;
      out += '<circle class="a-glow" style="--d:' + ((i % 7) * 0.35).toFixed(2) + 's" cx="' + x.toFixed(1) +
        '" cy="' + y.toFixed(1) + '" r="' + r + '" fill="#f3efdf"/>';
    }
    return frame(out + '<circle class="a-pulse" cx="214" cy="60" r="13" fill="' + C[1] + '"/>', l);
  };

  A.comet = function (l) {
    return frame(
      '<circle class="a-pulse" cx="56" cy="130" r="20" fill="' + C[1] + '"/>' +
      '<circle cx="232" cy="62" r="13" fill="' + C[2] + '"/>' +
      '<path class="a-travel" d="M245 68 Q 290 86 308 120" fill="none" stroke="' + C[2] + '" stroke-width="9" opacity=".35" stroke-dasharray="18 8"/>' +
      '<path class="a-travel" d="M243 56 Q 288 60 310 46" fill="none" stroke="#dfe8f5" stroke-width="5" opacity=".5" stroke-dasharray="14 9"/>' +
      '<ellipse cx="140" cy="100" rx="120" ry="58" fill="none" stroke="' + INK + '" stroke-width="1.5" stroke-dasharray="6 6" opacity=".4"/>', l);
  };

  /* ── evolution ── */

  A.beaks = function (l) {
    function bird(x, y, beak, col) {
      return '<ellipse cx="' + x + '" cy="' + y + '" rx="30" ry="22" fill="' + col + '"/>' +
        '<circle cx="' + (x + 24) + '" cy="' + (y - 14) + '" r="14" fill="' + col + '"/>' +
        '<circle cx="' + (x + 29) + '" cy="' + (y - 17) + '" r="2.2" fill="' + INK + '"/>' + beak;
    }
    return frame(
      bird(70, 80, '<polygon class="a-nudge" points="38,66 72,70 38,76" transform="translate(60,0)" fill="' + C[1] + '"/>', C[3]) +
      txt(70, 124, 'crushes seeds', 10) +
      bird(210, 80, '<polygon class="a-nudge" points="38,68 92,72 38,74" transform="translate(200,0)" fill="' + C[1] + '"/>', C[0]) +
      txt(214, 124, 'probes flowers', 10) +
      txt(160, 158, 'same species, different beaks', 11), l);
  };

  A.fossil = function (l) {
    var layers = '';
    for (var i = 0; i < 4; i++) {
      layers += '<rect x="22" y="' + (44 + i * 28) + '" width="276" height="28" fill="' + C[1] +
        '" opacity="' + (0.18 + i * 0.12) + '"/>' +
        '<line x1="22" y1="' + (44 + i * 28) + '" x2="298" y2="' + (44 + i * 28) + '" stroke="' + INK + '" stroke-width="1.5" opacity=".4"/>';
    }
    var spine = '';
    for (var j = 0; j < 7; j++) {
      spine += '<line x1="' + (104 + j * 16) + '" y1="112" x2="' + (104 + j * 16) + '" y2="' + (100 + (j % 2) * 6) + '" stroke="' + INK + '" stroke-width="3"/>';
    }
    return frame(layers +
      '<path class="a-pulse" d="M96 118 Q 160 100 226 120" fill="none" stroke="' + INK + '" stroke-width="4"/>' + spine +
      '<circle cx="92" cy="118" r="9" fill="' + INK + '" opacity=".8"/>' +
      txt(258, 36, 'older ↓', 10), l);
  };

  A.treeOfLife = function (l) {
    return frame(
      '<path d="M160 150 L 160 112" stroke="' + C[1] + '" stroke-width="7" fill="none"/>' +
      '<path class="a-sway-top" d="M160 112 Q 110 96 86 56 M160 112 Q 210 96 234 56 M160 112 L 160 60 M86 56 Q 70 40 56 30 M86 56 Q 102 40 116 30 M234 56 Q 218 40 204 30 M234 56 Q 250 40 264 30 M160 60 Q 150 44 142 32 M160 60 Q 170 44 178 32" fill="none" stroke="' + C[0] + '" stroke-width="4"/>' +
      '<circle class="a-pulse" cx="56" cy="28" r="6" fill="' + C[3] + '"/>' +
      '<circle class="a-pulse" style="--d:.4s" cx="116" cy="28" r="6" fill="' + C[2] + '"/>' +
      '<circle class="a-pulse" style="--d:.8s" cx="142" cy="30" r="6" fill="' + C[4] + '"/>' +
      '<circle class="a-pulse" style="--d:1.2s" cx="178" cy="30" r="6" fill="' + C[0] + '"/>' +
      '<circle class="a-pulse" style="--d:1.6s" cx="204" cy="28" r="6" fill="' + C[3] + '"/>' +
      '<circle class="a-pulse" style="--d:2s" cx="264" cy="28" r="6" fill="' + C[2] + '"/>' +
      txt(160, 168, 'one common ancestor', 11), l);
  };

  /* ── mixtures and separating ── */

  A.filterFunnel = function (l) {
    return frame(
      '<polygon points="90,36 230,36 168,116 152,116" fill="none" stroke="' + INK + '" stroke-width="4"/>' +
      '<polygon points="100,44 220,44 166,108 154,108" fill="' + C[1] + '" opacity=".3"/>' +
      dots(112, 50, 96, 22, 8, C[1], true, 'a-jiggle-slow') +
      '<path class="a-rain" d="M160 118 L 160 134" stroke="' + C[2] + '" stroke-width="4"/>' +
      '<path d="M118 140 L 118 170 Q 118 186 160 186 Q 202 186 202 170 L 202 140" fill="none" stroke="' + INK + '" stroke-width="4"/>' +
      '<path d="M118 158 L 118 170 Q 118 186 160 186 Q 202 186 202 170 L 202 158 Z" fill="' + C[2] + '" opacity=".45"/>' +
      txt(252, 60, 'solid stays', 10, INK, 'start') + txt(238, 172, 'liquid through', 10, INK, 'start'), l);
  };

  A.distill = function (l) {
    return frame(
      '<path d="M44 110 Q 44 150 82 150 Q 120 150 120 110 L 120 72 L 100 72" fill="none" stroke="' + INK + '" stroke-width="4"/>' +
      '<path d="M46 124 Q 50 150 82 150 Q 114 150 118 124 Z" fill="' + C[2] + '" opacity=".45"/>' +
      '<circle class="a-bubble" cx="70" cy="132" r="4" fill="' + C[2] + '"/>' +
      '<circle class="a-bubble" style="--d:.9s" cx="94" cy="138" r="3.5" fill="' + C[2] + '"/>' +
      '<path class="a-march" d="M100 72 L 206 72" fill="none" stroke="' + INK + '" stroke-width="5" stroke-dasharray="12 7"/>' +
      '<rect x="138" y="58" width="76" height="28" rx="8" fill="' + C[3] + '" opacity=".3" stroke="' + C[3] + '" stroke-width="2.5"/>' +
      txt(176, 46, 'cooled', 10) +
      '<path d="M208 76 L 208 100 L 236 100" fill="none" stroke="' + INK + '" stroke-width="4"/>' +
      '<path d="M234 104 L 234 142 Q 234 158 262 158 Q 290 158 290 142 L 290 104" fill="none" stroke="' + INK + '" stroke-width="4"/>' +
      '<path d="M234 138 Q 236 158 262 158 Q 288 158 290 138 Z" fill="' + C[0] + '" opacity=".5"/>' +
      '<path class="a-rain" d="M240 104 L 240 118" stroke="' + C[0] + '" stroke-width="3.5"/>' +
      '<line x1="36" y1="166" x2="128" y2="166" stroke="' + C[4] + '" stroke-width="4"/>', l);
  };

  A.chromatography = function (l) {
    var spots = '', cols = [C[4], C[0], C[3]];
    for (var i = 0; i < 3; i++) {
      var x = 92 + i * 56;
      spots += '<circle cx="' + x + '" cy="128" r="7" fill="' + cols[i] + '" opacity=".85"/>' +
        '<circle class="a-climb" cx="' + x + '" cy="' + (96 - i * 10) + '" r="6" fill="' + cols[i] + '" opacity=".7"/>' +
        '<circle class="a-climb" style="--d:.6s" cx="' + x + '" cy="' + (68 - i * 14) + '" r="5" fill="' + cols[i] + '" opacity=".5"/>';
    }
    return frame(
      '<rect x="62" y="24" width="196" height="124" rx="4" fill="#f6f4ec" opacity=".35" stroke="' + INK + '" stroke-width="2.5"/>' +
      spots +
      '<line x1="62" y1="140" x2="258" y2="140" stroke="' + C[2] + '" stroke-width="4"/>' +
      txt(160, 168, 'the solvent carries them up', 11), l);
  };

  /* ── microbes and disease ── */

  A.bacteria = function (l) {
    function rod(x, y, rot) {
      var tail = '';
      for (var i = 0; i < 3; i++) tail += '<path d="M' + (x + 30) + ' ' + (y + i * 5 - 5) + ' q 12 -6 24 0" fill="none" stroke="' + C[0] + '" stroke-width="2"/>';
      return '<g class="a-jiggle" style="--d:' + (rot / 60) + 's" transform="rotate(' + rot + ' ' + x + ' ' + y + ')">' +
        '<rect x="' + (x - 30) + '" y="' + (y - 13) + '" width="60" height="26" rx="13" fill="' + C[0] + '" opacity=".8"/>' +
        '<ellipse cx="' + (x - 6) + '" cy="' + y + '" rx="12" ry="7" fill="' + C[0] + '"/>' + tail + '</g>';
    }
    return frame(rod(92, 62, -14) + rod(196, 106, 10) +
      '<circle class="a-pulse" cx="256" cy="48" r="15" fill="' + C[2] + '" opacity=".75"/>' +
      '<circle class="a-pulse" style="--d:.7s" cx="64" cy="134" r="12" fill="' + C[2] + '" opacity=".75"/>', l);
  };

  A.virus = function (l) {
    var spikes = '';
    for (var i = 0; i < 14; i++) {
      var a = i * Math.PI / 7;
      spikes += '<line x1="' + (160 + 42 * Math.cos(a)) + '" y1="' + (92 + 42 * Math.sin(a)) +
        '" x2="' + (160 + 60 * Math.cos(a)) + '" y2="' + (92 + 60 * Math.sin(a)) + '" stroke="' + C[4] + '" stroke-width="4"/>' +
        '<circle cx="' + (160 + 64 * Math.cos(a)) + '" cy="' + (92 + 64 * Math.sin(a)) + '" r="5" fill="' + C[4] + '"/>';
    }
    return frame('<g class="a-spin-slow" style="--ox:160px;--oy:92px">' + spikes + '</g>' +
      '<circle class="a-pulse" cx="160" cy="92" r="42" fill="' + C[4] + '" opacity=".45" stroke="' + C[4] + '" stroke-width="3"/>' +
      '<path class="a-helix" d="M142 80 q 18 12 36 0 q -18 12 -36 24 q 18 -12 36 0" fill="none" stroke="' + INK + '" stroke-width="2.5"/>', l);
  };

  A.whiteCell = function (l) {
    return frame(
      '<path class="a-breathe" d="M60 92 Q 60 36 124 34 Q 196 32 212 84 Q 226 140 150 150 Q 76 152 60 92 Z" fill="#eef1f6" opacity=".9" stroke="' + C[2] + '" stroke-width="3"/>' +
      '<circle cx="118" cy="88" r="22" fill="' + C[3] + '" opacity=".55"/>' +
      '<path class="a-nudge" d="M206 70 q 34 -10 56 4" fill="none" stroke="#eef1f6" stroke-width="12" stroke-linecap="round"/>' +
      '<rect class="a-jiggle" x="240" y="96" width="42" height="19" rx="9" fill="' + C[0] + '" opacity=".85"/>' +
      txt(256, 140, 'engulfed', 10), l);
  };

  A.syringe = function (l) {
    return frame(
      '<rect x="78" y="76" width="140" height="34" rx="5" fill="none" stroke="' + INK + '" stroke-width="3.5"/>' +
      '<rect class="a-slide" x="84" y="80" width="80" height="26" fill="' + C[0] + '" opacity=".55"/>' +
      '<rect x="46" y="80" width="34" height="26" rx="4" fill="' + INK + '" opacity=".6"/>' +
      '<rect x="30" y="68" width="14" height="50" rx="4" fill="' + INK + '" opacity=".6"/>' +
      '<line x1="218" y1="93" x2="286" y2="93" stroke="' + INK + '" stroke-width="4"/>' +
      '<circle class="a-ping" cx="292" cy="93" r="6" fill="' + C[1] + '"/>' +
      txt(160, 148, 'a safe practice run for your immune system', 10), l);
  };

  /* ── magnetism ── */

  A.fieldLines = function (l) {
    var lines = '';
    for (var i = 1; i <= 3; i++) {
      var k = i * 26;
      lines += '<path class="a-march" style="--d:' + (i * .25) + 's" d="M106 92 Q 160 ' + (92 - k - 14) + ' 214 92" fill="none" stroke="' + C[3] + '" stroke-width="2.5" stroke-dasharray="11 7"/>' +
        '<path class="a-march" style="--d:' + (i * .25) + 's" d="M106 92 Q 160 ' + (92 + k + 14) + ' 214 92" fill="none" stroke="' + C[3] + '" stroke-width="2.5" stroke-dasharray="11 7"/>';
    }
    return frame(lines +
      '<rect x="106" y="78" width="54" height="28" fill="' + C[4] + '"/>' +
      '<rect x="160" y="78" width="54" height="28" fill="' + C[2] + '"/>' +
      txt(132, 97, 'N', 13, 'var(--art-bg)') + txt(188, 97, 'S', 13, 'var(--art-bg)'), l);
  };

  A.compass = function (l) {
    return frame(
      '<circle cx="160" cy="92" r="58" fill="#f4f2ea" opacity=".3" stroke="' + INK + '" stroke-width="3.5"/>' +
      '<circle cx="160" cy="92" r="48" fill="none" stroke="' + INK + '" stroke-width="1.5" opacity=".4"/>' +
      txt(160, 48, 'N', 12) + txt(160, 144, 'S', 12) + txt(216, 97, 'E', 12) + txt(104, 97, 'W', 12) +
      '<g class="a-tip" style="transform-origin:160px 92px">' +
      '<polygon points="160,54 170,92 150,92" fill="' + C[4] + '"/>' +
      '<polygon points="160,130 170,92 150,92" fill="' + C[2] + '"/></g>' +
      '<circle cx="160" cy="92" r="5" fill="' + INK + '"/>', l);
  };

  A.electromagnet = function (l) {
    var coils = '';
    for (var i = 0; i < 7; i++) {
      coils += '<ellipse cx="' + (104 + i * 22) + '" cy="96" rx="9" ry="30" fill="none" stroke="' + C[2] + '" stroke-width="4"/>';
    }
    return frame(
      '<rect x="88" y="84" width="170" height="24" rx="4" fill="' + INK + '" opacity=".55"/>' +
      coils +
      '<path class="a-current" d="M96 126 L 40 126 L 40 56 L 96 56" fill="none" stroke="' + C[2] + '" stroke-width="3.5" stroke-dasharray="10 7"/>' +
      '<rect x="22" y="76" width="34" height="30" rx="4" fill="none" stroke="' + INK + '" stroke-width="3"/>' +
      txt(39, 97, '+−', 12) +
      '<g class="a-nudge"><rect x="266" y="86" width="26" height="20" rx="3" fill="' + C[4] + '"/></g>' +
      txt(280, 128, 'pulled in', 10), l);
  };

  A.motor = function (l) {
    return frame(
      '<rect x="30" y="52" width="34" height="84" rx="4" fill="' + C[4] + '" opacity=".75"/>' + txt(47, 100, 'N', 13, 'var(--art-bg)') +
      '<rect x="256" y="52" width="34" height="84" rx="4" fill="' + C[2] + '" opacity=".75"/>' + txt(273, 100, 'S', 13, 'var(--art-bg)') +
      '<g class="a-spin-slow" style="--ox:160px;--oy:94px">' +
      '<rect x="112" y="64" width="96" height="60" rx="6" fill="none" stroke="' + C[0] + '" stroke-width="5"/>' +
      '<line x1="160" y1="64" x2="160" y2="124" stroke="' + C[0] + '" stroke-width="3"/></g>' +
      '<line x1="72" y1="94" x2="112" y2="94" stroke="' + INK + '" stroke-width="2.5" stroke-dasharray="5 4"/>' +
      '<line x1="208" y1="94" x2="248" y2="94" stroke="' + INK + '" stroke-width="2.5" stroke-dasharray="5 4"/>' +
      txt(160, 158, 'the coil turns', 11), l);
  };

  window.ART = {
    render: function (key, labels) {
      var fn = A[key] || A.checklist;
      return fn(labels || []);
    },
    keys: Object.keys(A)
  };
})();
