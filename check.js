/* data integrity check for the ThepicScience library */
const fs = require('fs');
const path = __dirname + '/assets/';
global.window = {};
eval(fs.readFileSync(path + 'art.js', 'utf8'));
eval(fs.readFileSync(path + 'topics.js', 'utf8'));
eval(fs.readFileSync(path + 'topics-b.js', 'utf8'));

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
