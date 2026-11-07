/* checkbank.js — does the question bank hold up?

   Every topic should end up with at least fifty questions: the core ten that ship inside
   topics*.js, plus forty from assets/quizbank-NN.js. This loads them the way a browser
   would and then looks for the things that quietly ruin a quiz:

     - a repeated question, so the same one comes round twice in a sitting
     - two identical options, or a missing one
     - an answer index that points at nothing
     - an explanation that does not explain
     - the right answer always being the longest option, which is a tell a student WILL
       learn to use, and then they are testing their eyes rather than their science
     - the right answer sitting in the same position too often, for the same reason

   Run: node checkbank.js */

const fs = require('fs');
const path = __dirname + '/assets/';

global.window = {};
global.document = {                       /* enough of a DOM for quizbank.js to load */
  readyState: 'loading',
  head: { appendChild() {} },
  createElement: () => ({})
};
global.setTimeout = (fn) => fn;
global.window.addEventListener = () => {};

['topics.js', 'topics-b.js', 'topics-c.js', 'topics-d.js', 'topics-e.js', 'topics-f.js', 'quizbank.js']
  .forEach(f => eval(fs.readFileSync(path + f, 'utf8')));

const T = window.TOPICS;
const core = {};
T.forEach(t => { core[t.id] = t.quiz.length; });

/* load the parts by hand, in order, exactly as the browser would */
const parts = fs.readdirSync(path).filter(f => /^quizbank-\d+\.js$/.test(f)).sort();
parts.forEach(f => eval(fs.readFileSync(path + f, 'utf8')));

console.log('parts loaded:', parts.length, '| questions added:', window.QUIZBANK.count());

const WANT = 50;
let errs = [], warns = [];
let total = 0, longestRight = 0, counted = 0;
const atIndex = [0, 0, 0];
const short = [];
const tooLong = [];

T.forEach(t => {
  const seen = new Map();
  if (core[t.id] !== 10) errs.push(`${t.id}: ${core[t.id]} core questions, expected 10`);
  if (t.quiz.length < WANT) short.push(`${t.id} ${t.quiz.length}`);
  total += t.quiz.length;

  t.quiz.forEach((q, i) => {
    const where = `${t.id} q${i}`;
    if (!q.q || typeof q.q !== 'string') { errs.push(`${where}: no question`); return; }
    if (!Array.isArray(q.a) || q.a.length !== 3) errs.push(`${where}: needs exactly 3 options`);
    else {
      const trimmed = q.a.map(a => String(a).trim().toLowerCase());
      if (trimmed.some(a => !a)) errs.push(`${where}: an empty option`);
      if (new Set(trimmed).size !== 3) errs.push(`${where}: two options are the same`);
    }
    if (typeof q.c !== 'number' || q.c < 0 || q.c > 2) errs.push(`${where}: answer index ${q.c}`);
    if (!q.why || q.why.length < 15) errs.push(`${where}: the explanation is missing or too thin`);

    const key = q.q.trim().toLowerCase();
    if (seen.has(key)) errs.push(`${t.id}: asked twice — "${q.q.slice(0, 60)}"`);
    seen.set(key, i);

    if (q.q.length > 160) warns.push(`${where}: ${q.q.length} characters, long for a phone`);
    q.a.forEach(a => { if (String(a).length > 90) warns.push(`${where}: a long option`); });

    if (Array.isArray(q.a) && q.a.length === 3 && typeof q.c === 'number' && q.a[q.c] !== undefined) {
      /* measure what a student actually sees, which is after quizbank.js reorders them */
      const shown = window.QUIZBANK.spread(q);
      atIndex[shown.c]++;
      counted++;
      const lens = q.a.map(a => String(a).length);
      const others = lens.filter((l, j) => j !== q.c);
      const max = Math.max.apply(null, lens);
      if (lens[q.c] === max && lens.filter(l => l === max).length === 1) longestRight++;
      if (lens[q.c] > Math.max.apply(null, others) * 1.6) tooLong.push(`${where}: "${String(q.a[q.c]).slice(0, 48)}"`);
    }
  });
});

const pct = n => (n / counted * 100).toFixed(1) + '%';
console.log('topics:', T.length, '| questions:', total, '| average per topic:', (total / T.length).toFixed(1));
console.log('answer sits at A/B/C:', atIndex.map(pct).join(' / '), '(a third each would be perfect)');
console.log('right answer is the longest option:', pct(longestRight), '(chance is about 33%)');

atIndex.forEach((n, i) => {
  if (n / counted > 0.42 || n / counted < 0.24) {
    warns.push(`answers land on option ${'ABC'[i]} ${pct(n)} of the time — guessable`);
  }
});
if (longestRight / counted > 0.45) {
  warns.push(`the longest option is right ${pct(longestRight)} of the time — a student will spot that`);
}

console.log('answer much longer than both wrong ones:', tooLong.length,
  '(' + (tooLong.length / counted * 100).toFixed(1) + '% — these read as the obvious one)');
if (process.argv.indexOf('--long') > -1) tooLong.forEach(l => console.log('  long  ' + l));
if (tooLong.length / counted > 0.2) {
  warns.push(tooLong.length + ' questions where the right answer dwarfs both distractors');
}
console.log('topics under ' + WANT + ':', short.length ? short.join(', ') : 'none');
console.log('\n=== ' + errs.length + ' errors, ' + warns.length + ' warnings ===');
errs.slice(0, 40).forEach(e => console.log('  ERROR ' + e));
if (errs.length > 40) console.log('  …and ' + (errs.length - 40) + ' more');
warns.slice(0, 15).forEach(w => console.log('  warn  ' + w));
if (warns.length > 15) console.log('  …and ' + (warns.length - 15) + ' more');
if (errs.length) process.exitCode = 1;
