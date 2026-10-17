/* data integrity check for the ThepicScience library */
const fs = require('fs');
const path = __dirname + '/assets/';
global.window = {};
eval(fs.readFileSync(path + 'art.js', 'utf8'));
eval(fs.readFileSync(path + 'topics.js', 'utf8'));
eval(fs.readFileSync(path + 'topics-b.js', 'utf8'));
eval(fs.readFileSync(path + 'topics-c.js', 'utf8'));
eval(fs.readFileSync(path + 'topics-d.js', 'utf8'));
eval(fs.readFileSync(path + 'topics-e.js', 'utf8'));

const T = window.TOPICS, ART = window.ART;
let errs = [], warns = [];
const ids = new Set();

console.log('topics:', T.length, '| art keys:', ART.keys.length);

T.forEach(t => {
  ['id','title','subject','grades','blurb','keywords','scenes','quiz'].forEach(k => {
    if (!t[k]) errs.push(`${t.id||'?'}: missing ${k}`);
  });
  if (ids.has(t.id)) errs.push(`duplicate id ${t.id}`);
  ids.add(t.id);

  const tiers = [0,0,0,0];
  t.scenes.forEach((s, i) => {
    if (!s.t || !s.b || !s.art || !s.term || !s.term.w || !s.term.d) errs.push(`${t.id} scene ${i}: incomplete`);
    if (ART.keys.indexOf(s.art) === -1) errs.push(`${t.id} scene ${i}: unknown art "${s.art}"`);
    if (!Array.isArray(s.labels)) errs.push(`${t.id} scene ${i}: labels not an array`);
    else if (s.labels.length > 3) warns.push(`${t.id} scene ${i}: ${s.labels.length} labels (max 3 render)`);
    s.labels.forEach(l => { if (l.length > 44) warns.push(`${t.id} scene ${i}: label truncated "${l}"`); });
    if (!s.tier || s.tier < 1 || s.tier > 3) errs.push(`${t.id} scene ${i}: bad tier`);
    else tiers[s.tier]++;
    const w = s.b.trim().split(/\s+/).length;
    if (w < 20 || w > 60) warns.push(`${t.id} scene ${i}: ${w} words`);
  });
  if (t.scenes.length !== 12) errs.push(`${t.id}: ${t.scenes.length} scenes, expected 12`);
  if (tiers[1] !== 4 || tiers[2] !== 4 || tiers[3] !== 4) errs.push(`${t.id}: tier split ${tiers[1]}/${tiers[2]}/${tiers[3]}, expected 4/4/4`);

  if (t.quiz.length !== 10) errs.push(`${t.id}: ${t.quiz.length} quiz questions, expected 10`);
  t.quiz.forEach((q, i) => {
    if (!q.q || !q.why) errs.push(`${t.id} quiz ${i}: incomplete`);
    if (!Array.isArray(q.a) || q.a.length !== 3) errs.push(`${t.id} quiz ${i}: needs 3 options`);
    if (typeof q.c !== 'number' || q.c < 0 || q.c > 2) errs.push(`${t.id} quiz ${i}: bad answer index`);
  });

  // every art function must actually render
  t.scenes.forEach((s, i) => {
    try {
      const svg = ART.render(s.art, s.labels);
      if (!/^<svg/.test(svg) || svg.indexOf('NaN') > -1 || svg.indexOf('undefined') > -1)
        errs.push(`${t.id} scene ${i}: bad SVG for ${s.art}`);
    } catch (e) { errs.push(`${t.id} scene ${i}: art threw ${e.message}`); }
  });
});

// every art key renders standalone
ART.keys.forEach(k => {
  try {
    const svg = ART.render(k, ['one','two','three']);
    if (svg.indexOf('NaN') > -1) errs.push(`art ${k}: NaN in output`);
  } catch (e) { errs.push(`art ${k}: threw ${e.message}`); }
});

// unused art
const used = new Set(); T.forEach(t => t.scenes.forEach(s => used.add(s.art)));
console.log('art used:', used.size, '/ defined:', ART.keys.length,
  '| unused:', ART.keys.filter(k => !used.has(k)).join(', ') || 'none');

// keyword collisions: does each topic's own blurb+title match itself best?
function matchTopics(raw) {
  const text = ' ' + raw.toLowerCase().replace(/[^a-z0-9₂₄₆\s]/g, ' ').replace(/\s+/g, ' ') + ' ';
  const out = [];
  T.forEach(topic => {
    let score = 0; const hit = [];
    topic.keywords.forEach(k => {
      const key = k.toLowerCase();
      const found = key.indexOf(' ') > -1
        ? (text.indexOf(' ' + key + ' ') > -1 || text.indexOf(' ' + key) > -1)
        : text.indexOf(' ' + key + ' ') > -1;
      if (found) { score += key.indexOf(' ') > -1 ? 4 : (key.length > 6 ? 3 : 2); hit.push(k); }
    });
    topic.title.toLowerCase().split(/\s+/).forEach(w => { if (w.length > 3 && text.indexOf(' ' + w) > -1) score += 2; });
    if (score >= 4) out.push({ topic, score, hit });
  });
  return out.sort((a, b) => b.score - a.score);
}

console.log('\n-- self-match test (topic text should match its own topic) --');
T.forEach(t => {
  const sample = t.title + ' ' + t.blurb + ' ' + t.scenes.slice(0,3).map(s => s.t + ' ' + s.b).join(' ');
  const r = matchTopics(sample);
  const ok = r[0] && r[0].topic.id === t.id;
  console.log((ok ? 'PASS ' : 'FAIL ') + t.id.padEnd(18) + ' -> ' + (r[0] ? r[0].topic.id + ' (' + r[0].score + ')' : 'no match'));
  if (!ok) errs.push(`self-match failed for ${t.id}`);
});

console.log('\n-- realistic whiteboard-note test --');
const samples = [
  ['photosynthesis', '6CO2 + 6H2O -> C6H12O6 + 6O2 chlorophyll in the chloroplast absorbs light'],
  ['cells', 'Animal cell vs plant cell: nucleus, cell membrane, mitochondria, cell wall, vacuole'],
  ['forces-motion', "Newton's first law inertia. F = ma. friction and gravity. balanced forces"],
  ['circuits', 'series and parallel circuits. V = I x R. current is measured in amps'],
  ['water-cycle', 'evaporation condensation precipitation collection runoff transpiration'],
  ['genetics', 'Punnett square Bb x Bb dominant recessive allele genotype phenotype'],
  ['waves', 'wavelength amplitude frequency hertz reflection refraction pitch'],
  ['plate-tectonics', 'tectonic plates convergent divergent transform subduction earthquake'],
  ['body-systems', 'circulatory system heart arteries veins alveoli digestion small intestine'],
  ['chemical-change', 'physical vs chemical change conservation of mass rusting combustion precipitate'],
  ['atoms', 'protons neutrons electrons atomic number periodic table isotope valence'],
  ['energy', 'kinetic and potential energy conservation of energy joules conduction convection'],
  ['ecosystems', 'food chain producer consumer decomposer energy pyramid habitat'],
  ['states-of-matter', 'solid liquid gas melting boiling evaporation particles sublimation']
];
samples.forEach(([want, text]) => {
  const r = matchTopics(text);
  const got = r[0] ? r[0].topic.id : 'none';
  console.log((got === want ? 'PASS ' : 'FAIL ') + want.padEnd(18) + ' -> ' + got + (r[0] ? ' (' + r[0].score + ')' : ''));
  if (got !== want) errs.push(`sample match failed: wanted ${want}, got ${got}`);
});

console.log('\n-- nonsense should NOT match --');
['pizza party friday bring snacks', 'homework due monday page 42'].forEach(s => {
  const r = matchTopics(s);
  console.log((r.length ? 'FAIL ' : 'PASS ') + JSON.stringify(s) + ' -> ' + (r.length ? r[0].topic.id : 'no match'));
  if (r.length) warns.push(`nonsense matched: "${s}" -> ${r[0].topic.id} (${r[0].score})`);
});

// storyboard maths
console.log('\n-- video length check (rate 0.95) --');
function pick(topic, count) {
  const idx = topic.scenes.map((s, i) => ({ s, i }));
  idx.sort((a, b) => (a.s.tier - b.s.tier) || (a.i - b.i));
  const c = idx.slice(0, count); c.sort((a, b) => a.i - b.i);
  return c.map(x => x.s);
}
[[1,4],[3,8],[5,12]].forEach(([min, n]) => {
  let lo = 1e9, hi = 0;
  T.forEach(t => {
    const scenes = pick(t, n);
    const withTerm = min >= 3;
    const items = scenes.map(s => {
      const nar = s.t + '. ' + s.b + (withTerm ? ' Key word: ' + s.term.w + '. ' + s.term.d : '');
      return (nar.trim().split(/\s+/).length / 2.5) / 0.95 + 0.9;
    });
    const sum = items.reduce((a, b) => a + b, 0);
    const pad = Math.max(0.6, Math.min(5, (min * 60 - sum) / items.length));
    const total = sum + pad * items.length;
    lo = Math.min(lo, total); hi = Math.max(hi, total);
  });
  console.log(`${min} min target=${min*60}s -> actual ${lo.toFixed(0)}–${hi.toFixed(0)}s`);
  if (hi > min * 60 * 1.3 || lo < min * 60 * 0.7) warns.push(`${min}-minute videos land at ${lo.toFixed(0)}-${hi.toFixed(0)}s`);
});

console.log('\n=== ' + errs.length + ' errors, ' + warns.length + ' warnings ===');
errs.forEach(e => console.log('ERROR  ' + e));
warns.slice(0, 40).forEach(w => console.log('warn   ' + w));
if (errs.length) process.exitCode = 1;

// grades 3-5 wording must exist everywhere and actually be simpler
let simpleMissing = 0, longer = [], wordy = [];
T.forEach(t => t.scenes.forEach((s, i) => {
  if (!s.s) { simpleMissing++; return; }
  const sw = s.s.trim().split(/\s+/).length, bw = s.b.trim().split(/\s+/).length;
  if (sw >= bw) longer.push(`${t.id} ${i}: simple ${sw}w vs normal ${bw}w`);
  if (sw > 26) wordy.push(`${t.id} ${i}: ${sw} words`);
  const longWords = (s.s.match(/[a-z]{12,}/gi) || []);
  if (longWords.length > 1) wordy.push(`${t.id} ${i}: long words ${longWords.join(',')}`);
}));
console.log('\n-- grades 3-5 wording --');
console.log('missing:', simpleMissing, '| not shorter:', longer.length, '| too wordy:', wordy.length);
longer.slice(0,5).forEach(x=>console.log('  ', x));
wordy.slice(0,5).forEach(x=>console.log('  ', x));
if (simpleMissing || longer.length) process.exitCode = 1;

// projects: one per topic, complete, and safe-looking
const fsp = require('fs');
eval(fsp.readFileSync(path + 'projects.js', 'utf8'));
const P = window.PROJECTS;
let pErr = [];
T.forEach(t => {
  const p = P[t.id];
  if (!p) { pErr.push('no project for ' + t.id); return; }
  ['title','question','days','look','why','fair','stretch'].forEach(f => { if (!p[f]) pErr.push(t.id + ' missing ' + f); });
  if (!Array.isArray(p.needs) || p.needs.length < 3) pErr.push(t.id + ' needs list too short');
  if (!Array.isArray(p.steps) || p.steps.length < 4) pErr.push(t.id + ' steps list too short');
  const text = JSON.stringify(p).toLowerCase();
  ['bleach','flame','lighter','match ','knife','blade','acid ','mains'].forEach(w => {
    if (text.includes(w)) pErr.push(t.id + ' mentions "' + w.trim() + '" — check it is safe');
  });
});
console.log('\n-- projects --');
console.log('topics:', T.length, '| projects:', Object.keys(P).length, '| problems:', pErr.length ? pErr.join('; ') : 'none');
if (pErr.length) process.exitCode = 1;

// grade sign-in: every grade 3-12 has something to learn
const cover = [];
for (let g = 3; g <= 12; g++) {
  const n = T.filter(t => { const m = t.grades.match(/(\d+)\s*[–-]\s*(\d+)/); return m && g >= +m[1] && g <= +m[2]; }).length;
  cover.push('g' + g + ':' + n);
  if (!n) { console.log('ERROR grade ' + g + ' has no topics'); process.exitCode = 1; }
}
console.log('topics per grade:', cover.join(' '));

// the practice questions generated for wrong answers must all be correct
const appSrc = fsp.readFileSync(__dirname + '/assets/app.js', 'utf8');
const S = { grade: 'middle' };
const bodyFor = sc => sc.b;
eval(appSrc.slice(appSrc.indexOf('var VAGUE_TERM'), appSrc.indexOf('function practiceRound')));

let made = 0, badQ = [], sceneNoQ = [];
T.forEach(t => t.scenes.forEach((sc, i) => {
  const qs = practiceFor(t, i, 3);
  if (!qs.length) { sceneNoQ.push(t.id + ':' + i); return; }
  qs.forEach(q => {
    made++;
    const right = q.a[q.c], word = sc.term.w.replace(/\s*\(.*\)/, '');
    if (new Set(q.a).size !== 3) badQ.push(t.id + i + ' duplicate options');
    if (q.c < 0 || q.c > 2) badQ.push(t.id + i + ' bad answer index');
    if (/^Which word means this/.test(q.q) && right !== word) badQ.push(t.id + i + ' definition->word wrong');
    if (/^What does /.test(q.q) && right !== sc.term.d) badQ.push(t.id + i + ' word->definition wrong');
    if (/^What is the main point/.test(q.q) && right !== sc.term.d) badQ.push(t.id + i + ' main-point wrong');
    if (/^Fill the gap/.test(q.q) && (right !== word || !q.q.includes('______'))) badQ.push(t.id + i + ' cloze wrong');
  });
}));
console.log('\n-- practice questions (generated for wrong answers) --');
console.log('generated:', made, '| scenes with none:', sceneNoQ.length ? sceneNoQ.join(', ') : 'none',
  '| incorrect:', badQ.length ? badQ.slice(0, 5).join('; ') : 'none');
if (badQ.length || sceneNoQ.length) process.exitCode = 1;

// every topic needs an everyday example, and it has to be short enough to narrate
let exMissing = [], exLong = [];
T.forEach(t => {
  const e = t.example;
  if (!e || !e.t || !e.b || !e.spot) { exMissing.push(t.id); return; }
  const w = (e.b + ' ' + e.spot).trim().split(/\s+/).length;
  if (w > 70) exLong.push(t.id + ': ' + w + ' words');
  if (e.t.length > 52) exLong.push(t.id + ': title ' + e.t.length + ' chars');
});
console.log('\n-- everyday examples --');
console.log('missing:', exMissing.length ? exMissing.join(', ') : 'none',
  '| too long to narrate:', exLong.length ? exLong.join('; ') : 'none');
if (exMissing.length || exLong.length) process.exitCode = 1;

// the deeper layer: every topic, and every cross-link pointing somewhere real
eval(fsp.readFileSync(__dirname + '/assets/detail.js', 'utf8'));
const D = window.DETAIL, topicIds = new Set(T.map(t => t.id));
let dMissing = [], dBad = [];
T.forEach(t => {
  const d = D[t.id];
  if (!d) { dMissing.push(t.id); return; }
  if (!d.formulas || !d.formulas.length) dBad.push(t.id + ': no formulas');
  if (!d.mistakes || d.mistakes.length < 2) dBad.push(t.id + ': needs at least 2 mistakes');
  if (!d.deeper || d.deeper.length < 2) dBad.push(t.id + ': needs at least 2 deeper items');
  if (!d.links || d.links.length < 2) dBad.push(t.id + ': needs at least 2 links');
  (d.formulas || []).forEach(f => { if (!f.f || !f.what) dBad.push(t.id + ': incomplete formula'); });
  (d.mistakes || []).forEach(m => { if (!m.wrong || !m.right) dBad.push(t.id + ': incomplete mistake'); });
  (d.deeper || []).forEach(x => { if (!x.t || !x.b) dBad.push(t.id + ': incomplete deeper item'); });
  (d.links || []).forEach(l => {
    if (!topicIds.has(l.id)) dBad.push(t.id + ': link to unknown topic "' + l.id + '"');
    if (l.id === t.id) dBad.push(t.id + ': links to itself');
    if (!l.why) dBad.push(t.id + ': link with no reason');
  });
});
const extraD = Object.keys(D).filter(k => !topicIds.has(k));
console.log('\n-- go deeper --');
console.log('topics covered:', Object.keys(D).length + '/' + T.length,
  '| missing:', dMissing.length ? dMissing.join(', ') : 'none',
  '| orphans:', extraD.length ? extraD.join(', ') : 'none');
console.log('problems:', dBad.length ? dBad.slice(0, 6).join('; ') : 'none');
const counts = T.map(t => (D[t.id] ? D[t.id].formulas.length + '/' + D[t.id].mistakes.length + '/' + D[t.id].deeper.length : '-'));
console.log('formulas/mistakes/deeper per topic:', counts.join('  '));
if (dMissing.length || dBad.length) process.exitCode = 1;


// ── the profile: cosmetics and the titles you cannot buy ──
eval(fsp.readFileSync(__dirname + '/assets/pets.js', 'utf8'));
eval(fsp.readFileSync(__dirname + '/assets/profile.js', 'utf8'));
const PF = window.PROFILE;
let pBad = [];

// every slot needs exactly one free starter, and the default must be it
PF.slots.forEach(sl => {
  const items = PF.bySlot(sl.id);
  if (!items.length) pBad.push(sl.id + ': no items');
  const free = items.filter(it => it.cost === 0);
  if (free.length !== 1) pBad.push(sl.id + ': ' + free.length + ' free starters, expected 1');
  if (!PF.byKey(sl.id, PF.defaults[sl.id])) pBad.push(sl.id + ': default "' + PF.defaults[sl.id] + '" does not exist');
  else if (PF.byKey(sl.id, PF.defaults[sl.id]).cost !== 0) pBad.push(sl.id + ': default is not free');
  const seen = new Set();
  items.forEach(it => {
    if (seen.has(it.id)) pBad.push(sl.id + ': duplicate item id ' + it.id);
    seen.add(it.id);
    if (!it.name || !it.blurb) pBad.push(sl.id + '/' + it.id + ': missing name or blurb');
    if (it.cost !== null && (typeof it.cost !== 'number' || it.cost < 0)) pBad.push(sl.id + '/' + it.id + ': bad cost');
    if (it.earned && it.cost !== null) pBad.push(sl.id + '/' + it.id + ': an earned title must not have a price');
  });
});

// every cosmetic has to draw, with unique gradient and clip ids
const seenIds = new Set();
let drawn = 0;
PF.slots.forEach(sl => {
  PF.bySlot(sl.id).forEach(it => {
    const worn = Object.assign({}, PF.defaults);
    worn[sl.id] = it.id;
    const svg = PF.draw(worn);
    drawn++;
    if (!/^<svg /.test(svg) || !/<\/svg>$/.test(svg)) pBad.push(sl.id + '/' + it.id + ': not an svg');
    if (/undefined|NaN|\[object/.test(svg)) pBad.push(sl.id + '/' + it.id + ': placeholder in the markup');
    if ((svg.match(/</g) || []).length !== (svg.match(/>/g) || []).length) pBad.push(sl.id + '/' + it.id + ': unbalanced tags');
    (svg.match(/ id="([^"]+)"/g) || []).forEach(m => {
      const id = m.slice(5, -1);
      if (seenIds.has(id)) pBad.push(sl.id + '/' + it.id + ': reused id ' + id);
      seenIds.add(id);
    });
    // every url(#x) must point at an id defined in the same drawing
    (svg.match(/url\(#([^)]+)\)/g) || []).forEach(m => {
      const id = m.slice(5, -1);
      if (svg.indexOf('id="' + id + '"') === -1) pBad.push(sl.id + '/' + it.id + ': url(#' + id + ') has no definition');
    });
    // colours must be real hex
    (svg.match(/(?:fill|stroke|stop-color)="#[^"]*"/g) || []).forEach(c => {
      const v = c.split('"')[1];
      if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v)) pBad.push(sl.id + '/' + it.id + ': bad colour ' + v);
    });
  });
});

// the earned titles
const maxed = {
  topics: T.length, topicTotal: T.length,
  pets: window.PETS.list.length, petTotal: window.PETS.list.length,
  petMax: window.PETS.maxLevel, escapes: 99, duels: 99, lifetime: 999999,
  looks: PF.buyable(), lookTotal: PF.buyable()
};
const nothing = {
  topics: 0, topicTotal: T.length, pets: 1, petTotal: window.PETS.list.length,
  petMax: 1, escapes: 0, duels: 0, lifetime: 0, looks: 0, lookTotal: PF.buyable()
};
const allGot = PF.earnedTitles(maxed), noneGot = PF.earnedTitles(nothing);
PF.achievements.forEach(a => {
  if (!a.name || !a.need || typeof a.test !== 'function') pBad.push('achievement ' + a.id + ': incomplete');
  if (!allGot[a.id]) pBad.push('achievement ' + a.id + ': not granted at maximum');
  if (noneGot[a.id]) pBad.push('achievement ' + a.id + ': granted at zero');
  if (!PF.byKey('title', a.id)) pBad.push('achievement ' + a.id + ': not in the title slot');
});

// the legend has to need every other one: drop any single title and it must fall away
PF.achievements.filter(a => a.id !== 'legend').forEach(a => {
  const one = Object.assign({}, maxed);
  if (a.id === 'scholar' || a.id === 'master') one.topics = 0;
  else if (a.id === 'collector' || a.id === 'keeper') one.pets = 1;
  else if (a.id === 'survivor') one.escapes = 0;
  else if (a.id === 'duellist') one.duels = 0;
  else if (a.id === 'baron') one.lifetime = 0;
  else if (a.id === 'trainer') one.petMax = 1;
  else if (a.id === 'stylist') one.looks = 0;
  if (PF.earnedTitles(one).legend) pBad.push('the legend still fires without ' + a.id);
});

console.log('\n-- profile --');
console.log('slots:', PF.slots.length, '| items:', PF.list.length,
  '| buyable:', PF.buyable(), '| earned titles:', PF.achievements.length, '| drawn:', drawn);
const totalCost = PF.list.filter(i => i.cost > 0).reduce((n, i) => n + i.cost, 0);
console.log('sparks to unlock every look:', totalCost);
console.log('problems:', pBad.length ? pBad.slice(0, 8).join('; ') : 'none');
if (pBad.length) process.exitCode = 1;


// ── the monster ladder: three worlds, a chest each, every level winnable ──
eval(fsp.readFileSync(__dirname + '/assets/worlds.js', 'utf8'));
const WD = window.WORLDS;
let wBad = [];

WD.list.forEach(w => {
  ['id', 'name', 'monster', 'blurb', 'beat', 'lost', 'aria', 'tune', 'door', 'streak'].forEach(k => {
    if (!w[k]) wBad.push(w.id + ': missing ' + k);
  });
  if (typeof w.scene !== 'function') wBad.push(w.id + ': no scene');
  if (typeof w.monsterArt !== 'function') wBad.push(w.id + ': no monster');
  if (!(w.bounty > 0)) wBad.push(w.id + ': no chest');
  ['goal', 'startGap', 'maxGap', 'boost', 'penalty', 'baseClose', 'ramp'].forEach(k => {
    if (!(w.tune[k] > 0)) wBad.push(w.id + ': tune.' + k + ' must be positive');
  });
  if (w.tune.maxGap < w.tune.startGap) wBad.push(w.id + ': maxGap below startGap');
});

// the chests the user asked for
const bounty = {};
WD.list.forEach(w => { bounty[w.id] = w.bounty; });
if (bounty.slime !== 10) wBad.push('the slime chest should be 10, not ' + bounty.slime);
if (bounty.alien !== 30) wBad.push('the alien chest should be 30, not ' + bounty.alien);
if (bounty.backrooms !== 50) wBad.push('the backrooms chest should be 50, not ' + bounty.backrooms);

// a different monster every level, and the rotation comes back round
for (let L = 1; L <= 12; L++) {
  if (WD.forLevel(L).id === WD.forLevel(L + 1).id) wBad.push('level ' + L + ' and ' + (L + 1) + ' are the same monster');
}
if (WD.forLevel(1).id !== WD.forLevel(1 + WD.count).id) wBad.push('the rotation does not repeat');

// every level has to be beatable by someone who needs a couple of seconds a question
function slowestWin(level) {
  const c = WD.tuneFor(level);
  let best = 0;
  for (let read = 0.5; read <= 8; read += 0.05) {
    let gap = c.startGap, t = 0, dist = 0, boost = 0, n = 0, next = read;
    while (dist < c.goal && gap > 0 && t < 600) {
      t += 0.05;
      gap = Math.min(c.maxGap, gap - (c.baseClose + t * c.ramp) * 0.05);
      if (boost > 0) boost -= 0.05;
      dist += (26 + (boost > 0 ? 34 : 0)) * 0.05;
      if (t >= next) {
        n++;
        if (n % 5 === 0) { gap -= c.penalty; next = t + read + 1.8; }      // one wrong in five
        else { gap = Math.min(c.maxGap, gap + c.boost); boost = 1.4; next = t + read + 0.42; }
      }
    }
    if (dist >= c.goal) best = read;
  }
  return best;
}

const paces = [];
for (let L = 1; L <= 9; L++) {
  const p = slowestWin(L);
  paces.push(L + ':' + p.toFixed(1) + 's');
  if (p < 1.4) wBad.push('level ' + L + ' needs an answer every ' + p.toFixed(2) + 's, which is not fair');
}
// and it should actually get harder, not easier, as you climb
if (slowestWin(9) > slowestWin(1)) wBad.push('level 9 is easier than level 1');

console.log('\n-- the monster ladder --');
console.log('worlds:', WD.list.length, '| chests:', WD.list.map(w => w.id + ' ' + w.bounty).join(', '));
console.log('seconds per question you can afford, with one wrong in five:', paces.join('  '));
console.log('problems:', wBad.length ? wBad.slice(0, 6).join('; ') : 'none');
if (wBad.length) process.exitCode = 1;

// ── parties: team sizes, seating and the one-in-three robots ──
eval(fsp.readFileSync(__dirname + '/assets/party.js', 'utf8'));
const PY = window.PARTY;
let yBad = [];

['1v1', '2v2', '3v3', '4v4'].forEach(id => {
  const m = PY.modes.filter(x => x.id === id)[0];
  if (!m) { yBad.push('no ' + id + ' mode'); return; }
  if (PY.teamHp(id) < 5) yBad.push(id + ': too few hearts');

  // join one at a time and the sides must stay even
  const p = PY.create({ mode: id, host: { id: 'h', name: 'Host' } });
  for (let i = 1; i < m.per * 2; i++) {
    const r = PY.join(p, { id: 'g' + i, name: 'G' + i });
    if (!r.ok) yBad.push(id + ': could not seat player ' + (i + 1) + ' — ' + r.why);
  }
  if (!PY.isFull(p)) yBad.push(id + ': not full after ' + (m.per * 2) + ' players');
  if (PY.teamOf(p, 0).length !== m.per || PY.teamOf(p, 1).length !== m.per) {
    yBad.push(id + ': lopsided — ' + PY.teamOf(p, 0).length + ' v ' + PY.teamOf(p, 1).length);
  }
  if (PY.join(p, { id: 'extra', name: 'Extra' }).ok) yBad.push(id + ': let an extra player into a full party');

  // a host on their own plus robots must still make a full game
  const solo = PY.create({ mode: id, host: { id: 'h', name: 'Host' } });
  PY.fill(solo, ['bubble']);
  if (solo.members.length !== m.per * 2) yBad.push(id + ': robots did not fill it');
  if (solo.members.filter(x => x.ai).length !== m.per * 2 - 1) yBad.push(id + ': wrong number of robots');
});

// codes: four characters, nothing that can be misread aloud
const codes = new Set();
for (let i = 0; i < 4000; i++) {
  const c = PY.newCode();
  if (!/^[BCDFGHJKLMNPQRSTVWXYZ23456789]{4}$/.test(c)) yBad.push('bad code ' + c);
  codes.add(c);
}
if (codes.size < 3500) yBad.push('codes collide too often: ' + codes.size + ' in 4000');

// a robot answers one in three, and nothing cleverer
let hits = 0;
const q = { a: ['a', 'b', 'c'], c: 1 };
for (let i = 0; i < 120000; i++) if (PY.robotAnswer(q) === q.c) hits++;
const rate = hits / 120000;
if (Math.abs(rate - 1 / 3) > 0.01) yBad.push('robots answer ' + (rate * 100).toFixed(1) + '%, expected 33.3%');

console.log('\n-- parties --');
console.log('modes:', PY.modes.map(m => m.id + ' (' + PY.teamHp(m.id) + ' hearts)').join(', '));
console.log('robot accuracy over 120,000 answers:', (rate * 100).toFixed(2) + '%');
console.log('distinct codes in 4,000 draws:', codes.size);
console.log('problems:', yBad.length ? yBad.slice(0, 6).join('; ') : 'none');
if (yBad.length) process.exitCode = 1;
