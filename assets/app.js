/* app.js — ThepicScience
   Flow: add a picture -> read it and match a topic -> pick book/video/length/voice -> read or watch.
   Everything runs in the browser. Nothing is uploaded anywhere. */

(function () {
  'use strict';

  /* ── small helpers ─────────────────────────────────── */
  var $ = function (id) { return document.getElementById(id); };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function say(msg) { $('live').textContent = msg; }

  var toastTimer;
  function toast(msg) {
    var t = $('toast');
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.hidden = true; }, 2600);
  }

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function goTo(el) {
    el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  }

  function fmtTime(s) {
    s = Math.max(0, Math.round(s));
    return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2);
  }

  function words(str) { return str.trim().split(/\s+/).length; }

  /* ── state ─────────────────────────────────────────── */
  var S = {
    file: null,
    kind: null,          // 'image' | 'video'
    imageForOcr: null,   // data URL we can hand to the reader
    shots: null,         // one cleaned-up image, or several frames from a video
    previewUrl: null,
    ocrText: '',
    topic: null,
    format: 'book',
    pages: 4,
    minutes: 1,
    voiceURI: '',
    rate: 0.95,
    grade: 'middle',     // elementary | middle | high
    gradeNum: null,      // the actual school year, 3 to 12, if they signed in
    boardTerms: [],      // science words found on the student's own photo
    boardOff: {},        // the ones they switched off
    questions: [],
    missed: [],
    round: 0,          // which slice of the question bank comes next
    deep: false,       // true once they ask for all ten questions
    board: null,         // built storyboard
    page: 0,
    unlocked: 1
  };

  var synth = window.speechSynthesis || null;
  var voices = [];

  /* ── steps ─────────────────────────────────────────── */
  function unlock(n) {
    if (n > S.unlocked) S.unlocked = n;
    for (var i = 1; i <= 4; i++) {
      $('step' + i).classList.toggle('is-locked', i > S.unlocked);
    }
    markStep(n);
  }

  function markStep(n) {
    document.querySelectorAll('.step-link').forEach(function (a) {
      var d = Number(a.dataset.step);
      a.classList.toggle('is-current', d === n);
      a.classList.toggle('is-done', d < n);
      if (d === n) a.setAttribute('aria-current', 'step'); else a.removeAttribute('aria-current');
    });
  }

  /* ── signing in as a grade ─────────────────────────────
     No account and no password: the only thing stored is a number, on this device.
     It picks the wording level and shows what that grade covers in science. */
  var GRADE_KEY = 'thepicscience.grade';

  function saveGrade(n) {
    try { window.localStorage.setItem(GRADE_KEY, String(n)); } catch (e) { /* private mode */ }
  }

  function readGrade() {
    try {
      var v = parseInt(window.localStorage.getItem(GRADE_KEY), 10);
      return (v >= 3 && v <= 12) ? v : null;
    } catch (e) { return null; }
  }

  function bandFor(n) { return n <= 5 ? 'elementary' : n <= 8 ? 'middle' : 'high'; }

  /* a grade suggests a length too — younger readers get the short version by default */
  function applyGradeDefaults() {
    if (S.lengthTouched) return;
    var g = GRADES[S.grade];
    S.pages = g.pages;
    S.minutes = g.minutes;
    var p = document.querySelector('input[name="pages"][value="' + g.pages + '"]');
    var m = document.querySelector('input[name="minutes"][value="' + g.minutes + '"]');
    if (p) p.checked = true;
    if (m) m.checked = true;
  }

  function gradeRange(topic) {
    var m = topic.grades.match(/(\d+)\s*[–-]\s*(\d+)/);
    return m ? { lo: Number(m[1]), hi: Number(m[2]) } : { lo: 3, hi: 12 };
  }

  function renderGradeButtons() {
    var out = '';
    for (var n = 3; n <= 12; n++) {
      var band = n <= 5 ? 'primary' : n <= 8 ? 'middle' : 'high';
      out += '<button type="button" class="grade-btn" data-grade="' + n + '">' + n +
        '<small>' + (band === 'primary' ? 'elem' : band) + '</small></button>';
    }
    $('grade-row').innerHTML = out;
    $('grade-row').querySelectorAll('[data-grade]').forEach(function (b) {
      b.addEventListener('click', function () { setGrade(Number(b.dataset.grade), true); });
    });
  }

  function setGrade(n, announce) {
    S.gradeNum = n;
    S.grade = bandFor(n);
    saveGrade(n);

    var radio = document.querySelector('input[name="grade"][value="' + S.grade + '"]');
    if (radio) radio.checked = true;
    applyGradeDefaults();
    if (!S.rateTouched) $('rate-select').value = String(GRADES[S.grade].rate);
    S.rate = Number($('rate-select').value);

    $('me-ask').hidden = true;
    $('me-known').hidden = false;
    $('me-grade').textContent = 'Grade ' + n;
    $('me-band').textContent = S.grade === 'elementary'
      ? 'Lessons come in short sentences with every word explained.'
      : S.grade === 'high'
        ? 'Full wording, and the quiz can pull extra questions from your own photo.'
        : 'The normal wording, with every key word explained.';

    $('grade-chip').hidden = false;
    $('grade-chip').textContent = 'Grade ' + n + ' · change';
    $('grade-chip').setAttribute('aria-label', 'Signed in as grade ' + n + '. Change your grade.');
    renderLearnList(n);
    updateGradeNote();
    updateMakeButton();
    if (announce) { toast('Signed in as grade ' + n); say('Signed in as grade ' + n + '.'); }
  }

  function renderLearnList(n) {
    var mine = window.TOPICS.filter(function (t) {
      var r = gradeRange(t);
      return n >= r.lo && n <= r.hi;
    });
    $('learn-h').textContent = 'What grade ' + n + ' usually covers — ' + mine.length + ' topics';
    $('learn-list').innerHTML = mine.map(function (t) {
      return '<li><button type="button" class="topic-btn" data-learn="' + t.id + '">' +
        '<b>' + esc(t.title) + '</b><span>' + esc(t.subject) + ' · ' + esc(t.blurb.slice(0, 62)) + '…</span></button></li>';
    }).join('');
    $('learn-list').querySelectorAll('[data-learn]').forEach(function (b) {
      b.addEventListener('click', function () {
        unlock(2);
        chooseTopic(b.dataset.learn);
        goTo($('step3'));
        markStep(3);
        say('Starting ' + b.dataset.learn.replace(/-/g, ' ') + '.');
      });
    });
  }

  function openGradePicker() {
    $('me').hidden = false;
    $('me-ask').hidden = false;
    $('me-known').hidden = true;
    goTo($('me'));
    $('grade-row').querySelector('button').focus();
  }

  $('me-change').addEventListener('click', openGradePicker);
  $('grade-chip').addEventListener('click', openGradePicker);

  $('me-skip').addEventListener('click', function () {
    $('me').hidden = true;
    goTo($('step1'));
    say('Skipped the grade. You can still make a lesson.');
  });

  /* ── step 1: getting a picture in ──────────────────── */
  var MAX_BYTES = 50 * 1024 * 1024;

  function fileError(msg) {
    var e = $('file-error');
    if (!msg) { e.hidden = true; e.textContent = ''; return; }
    e.hidden = false;
    e.textContent = msg;
    say(msg);
  }

  function handleFile(file) {
    if (!file) return;
    fileError('');
    var isImg = /^image\//.test(file.type);
    var isVid = /^video\//.test(file.type);

    if (!isImg && !isVid) {
      fileError('That file is ' + (file.type || 'an unknown type') + '. ThepicScience needs a photo or a video — try a JPG, PNG or MP4.');
      return;
    }
    if (file.size > MAX_BYTES) {
      fileError('That file is ' + (file.size / 1048576).toFixed(0) + ' MB, and the limit is 50 MB. Try a photo instead of a long video, or record a shorter clip.');
      return;
    }

    clearFile(true);
    S.file = file;
    S.kind = isImg ? 'image' : 'video';
    S.previewUrl = URL.createObjectURL(file);

    $('preview-media').innerHTML = isImg
      ? '<img src="' + S.previewUrl + '" alt="The picture you added">'
      : '<video src="' + S.previewUrl + '" muted playsinline controls></video>';
    $('preview-name').textContent = file.name;
    $('preview-sub').textContent = (isImg ? 'Photo' : 'Video') + ' · ' + (file.size / 1048576).toFixed(1) + ' MB · stays on your device';
    $('preview').hidden = false;
    $('scan-btn').disabled = false;
    $('scan-btn').textContent = isImg ? 'Read this picture' : 'Read this video';
    say('Added ' + file.name + '. Now choose Read this picture.');
    $('scan-btn').focus();
  }

  function clearFile(quiet) {
    if (S.previewUrl) URL.revokeObjectURL(S.previewUrl);
    S.file = null; S.kind = null; S.previewUrl = null; S.imageForOcr = null; S.shots = null;
    $('preview').hidden = true;
    $('preview-media').innerHTML = '';
    $('file-input').value = '';
    $('camera-input').value = '';
    if (!quiet) { fileError(''); say('Picture removed.'); }
  }

  $('pick-file').addEventListener('click', function (e) { e.stopPropagation(); $('file-input').click(); });
  $('pick-camera').addEventListener('click', function (e) { e.stopPropagation(); $('camera-input').click(); });
  $('file-input').addEventListener('change', function () { handleFile(this.files[0]); });
  $('camera-input').addEventListener('change', function () { handleFile(this.files[0]); });
  $('remove-file').addEventListener('click', function () { clearFile(false); });

  var drop = $('drop');
  drop.addEventListener('click', function () { $('file-input').click(); });
  drop.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); $('file-input').click(); }
  });
  ['dragenter', 'dragover'].forEach(function (ev) {
    drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add('is-over'); });
  });
  ['dragleave', 'drop'].forEach(function (ev) {
    drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove('is-over'); });
  });
  drop.addEventListener('drop', function (e) {
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  });
  document.addEventListener('paste', function (e) {
    if (!e.clipboardData) return;
    var items = e.clipboardData.files;
    if (items && items[0]) { handleFile(items[0]); toast('Pasted your picture'); }
  });

  $('skip-photo').addEventListener('click', function () {
    unlock(2);
    $('match-result').hidden = true;
    goTo($('step2'));
    $('topic-search').focus();
    say('Skipped the photo. Search the science library instead.');
  });

  /* ── turning the file into something readable ────────
     Phone photos carry sensor noise and JPEG speckle, and the text reader treats every
     speck as a possible letter. A light blur before reading is the one thing that measurably
     helps: on a deliberately bad board photo it took the reader from 12 of 23 words to 23 of
     23. Greyscale made no difference and contrast stretching actively hurt — it turned that
     same photo back into gibberish — so neither is done here. */

  var DENOISE_PX = 0.6;

  function drawScaled(source, w, h, maxSide) {
    var scale = Math.min(1, maxSide / Math.max(w, h));
    var c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(w * scale));
    c.height = Math.max(1, Math.round(h * scale));
    var ctx = c.getContext('2d');
    try { ctx.filter = 'blur(' + DENOISE_PX + 'px)'; } catch (e) { /* older browser: just skip it */ }
    ctx.drawImage(source, 0, 0, c.width, c.height);
    try { ctx.filter = 'none'; } catch (e) {}
    return c;
  }

  function shrinkImage(src, maxSide) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.onload = function () {
        var c = drawScaled(img, img.width, img.height, maxSide);
        resolve(c.toDataURL('image/jpeg', 0.92));
      };
      img.onerror = function () { reject(new Error('image')); };
      img.src = src;
    });
  }

  /* A video of a lesson does not hold still, so take a few frames across the clip and read
     them all. Whatever the teacher wrote is far more likely to appear in one of them. */
  function grabVideoFrames(url, howMany) {
    return new Promise(function (resolve, reject) {
      var v = document.createElement('video');
      var shots = [], done = false;
      var timer = setTimeout(function () {
        if (done) return;
        done = true;
        shots.length ? resolve(shots) : reject(new Error('slow'));
      }, 12000);

      function finish() {
        if (done) return;
        done = true;
        clearTimeout(timer);
        shots.length ? resolve(shots) : reject(new Error('video'));
      }

      v.muted = true; v.playsInline = true; v.preload = 'auto'; v.src = url;

      v.addEventListener('loadeddata', function () {
        var dur = v.duration && isFinite(v.duration) ? v.duration : 2;
        var points = [];
        for (var k = 0; k < howMany; k++) points.push(Math.min(dur - 0.05, dur * (k + 1) / (howMany + 1)));
        var at = 0;

        var next = function () {
          if (done) return;
          if (at >= points.length) return finish();
          try { v.currentTime = points[at++]; } catch (e) { finish(); }
        };

        v.addEventListener('seeked', function () {
          if (done) return;
          var c = drawScaled(v, v.videoWidth || 640, v.videoHeight || 480, 1500);
          shots.push(c.toDataURL('image/jpeg', 0.92));
          next();
        });

        next();
      });

      v.addEventListener('error', function () { finish(); });
    });
  }

  /* ── the text reader (OCR), loaded only when needed ── */
  var OCR_SRC = 'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js';
  var ocrWorker = null, ocrCancelled = false;

  /* The reader ships as a UMD bundle. It normally lands on window, but if anything else on
     the page has defined a global "exports" it lands there instead — so check both. */
  function ocrLib() {
    return window.Tesseract || (window.exports && window.exports.Tesseract) || null;
  }

  function loadOcrLib() {
    if (ocrLib()) return Promise.resolve(ocrLib());
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      var timer = setTimeout(function () { reject(new Error('timeout')); }, 15000);
      s.src = OCR_SRC;
      s.onload = function () {
        clearTimeout(timer);
        var lib = ocrLib();
        if (lib) resolve(lib); else reject(new Error('offline'));
      };
      s.onerror = function () { clearTimeout(timer); reject(new Error('offline')); };
      document.head.appendChild(s);
    });
  }

  function scanProgress(pct, label) {
    $('scan-bar').style.width = Math.max(3, Math.min(100, pct)) + '%';
    if (label) $('scan-text').textContent = label;
  }

  function showScan(on) {
    $('scan-status').hidden = !on;
    $('scan-btn').disabled = on;
    if (on) { scanProgress(4, 'Getting the reader ready…'); }
  }

  $('scan-cancel').addEventListener('click', function () {
    ocrCancelled = true;
    if (ocrWorker) { try { ocrWorker.terminate(); } catch (e) {} ocrWorker = null; }
    showScan(false);
    scanMiss('You stopped the reading. Pick your topic below instead — it is faster anyway.');
  });

  function scanMiss(msg) {
    $('match-result').hidden = false;
    $('match-top').innerHTML =
      '<div class="match-box is-miss"><p class="match-title">Could not read the picture</p>' +
      '<p class="match-why">' + esc(msg) + '</p></div>';
    unlock(2);
    goTo($('step2'));
    $('topic-search').focus();
    say(msg);
  }

  $('scan-btn').addEventListener('click', function () {
    if (!S.file) return;
    ocrCancelled = false;
    unlock(2);
    showScan(true);
    $('match-result').hidden = true;
    goTo($('step2'));
    say('Reading your picture. This can take a few seconds.');

    var prep = S.kind === 'video'
      ? grabVideoFrames(S.previewUrl, 3)
      : shrinkImage(S.previewUrl, 1600).then(function (one) { return [one]; });

    prep.then(function (shots) {
      if (ocrCancelled) throw new Error('cancelled');
      S.shots = shots;
      S.imageForOcr = shots[0];
      scanProgress(12, 'Downloading the text reader…');
      return loadOcrLib();
    }).then(function (T) {
      if (ocrCancelled) throw new Error('cancelled');
      scanProgress(22, 'Looking for words in your picture…');
      return T.createWorker('eng', 1, {
        logger: function (m) {
          if (ocrCancelled) return;
          if (m.status === 'recognizing text') scanProgress(35 + m.progress * 60, 'Reading the words… ' + Math.round(m.progress * 100) + '%');
          else if (m.progress) scanProgress(22 + m.progress * 12, 'Getting the reader ready…');
        }
      });
    }).then(function (w) {
      if (ocrCancelled) { try { w.terminate(); } catch (e) {} throw new Error('cancelled'); }
      ocrWorker = w;
      /* read every frame we grabbed, one after another, and join what they found */
      var shots = S.shots || [S.imageForOcr];
      var found = [];
      return shots.reduce(function (chain, shot, n) {
        return chain.then(function () {
          if (ocrCancelled) return;
          if (shots.length > 1) scanProgress(35 + (n / shots.length) * 55, 'Reading frame ' + (n + 1) + ' of ' + shots.length + '…');
          return w.recognize(shot).then(function (r) {
            var t = (r && r.data && r.data.text) ? r.data.text.trim() : '';
            if (t) found.push(t);
          });
        });
      }, Promise.resolve()).then(function () { return { data: { text: found.join('\n') } }; });
    }).then(function (res) {
      var text = (res && res.data && res.data.text) ? res.data.text : '';
      if (ocrWorker) { try { ocrWorker.terminate(); } catch (e) {} ocrWorker = null; }
      if (ocrCancelled) return;
      showScan(false);
      S.ocrText = text;
      afterScan(text);
    }).catch(function (err) {
      if (ocrWorker) { try { ocrWorker.terminate(); } catch (e) {} ocrWorker = null; }
      if (ocrCancelled || (err && err.message === 'cancelled')) return;
      showScan(false);
      if (window.console) console.error('[ThepicScience] reading the picture failed:', err);
      if (err && err.message === 'slow') scanMiss('That video would not give up any frames in time. Try a screenshot of it, or just pick the topic below.');
      else if (err && (err.message === 'offline' || err.message === 'timeout')) scanMiss('The text reader needs the internet the first time, and it could not download. Pick your topic below — everything after this works offline.');
      else scanMiss('Something went wrong reading that file. Pick your topic below and carry on.');
    });
  });

  function afterScan(text) {
    var clean = text.replace(/\s+/g, ' ').trim();
    var hits = matchTopics(clean);
    if (!clean || clean.length < 4) {
      scanMiss('No readable words in that picture. Blurry handwriting and small text are hard — try again closer up, or pick your topic below.');
      return;
    }
    if (!hits.length) {
      $('match-result').hidden = false;
      $('match-top').innerHTML =
        '<div class="match-box is-miss"><p class="match-title">Read it, but no topic matched</p>' +
        '<p class="match-why">We picked up words but none of them line up with the 14 topics in the library yet. Pick the closest one below.</p>' +
        peek(clean) + '</div>';
      goTo($('step2'));
      say('Read the picture but found no matching topic.');
      return;
    }

    var best = hits[0];
    var strength = best.score >= 12 ? 'Pretty sure' : best.score >= 7 ? 'Fairly sure' : 'Best guess';
    var alts = hits.slice(1, 4).map(function (h) {
      return '<button type="button" class="chip" data-topic="' + h.topic.id + '">' + esc(h.topic.title) + '</button>';
    }).join('');

    $('match-result').hidden = false;
    $('match-top').innerHTML =
      '<div class="match-box"><p class="match-title">' + strength + ' this is: ' + esc(best.topic.title) + '</p>' +
      '<p class="match-why">Matched on: ' + esc(best.words.slice(0, 5).join(', ')) + '.</p>' +
      peek(clean) +
      (alts ? '<div class="match-alts"><span class="match-why">Not right? Try:</span>' + alts + '</div>' : '') +
      '</div>';

    $('match-top').querySelectorAll('[data-topic]').forEach(function (b) {
      b.addEventListener('click', function () { chooseTopic(b.dataset.topic); });
    });

    chooseTopic(best.topic.id);
    showBoardTerms(best);
    goTo($('step2'));
    say(strength + ' the topic is ' + best.topic.title + '. Found ' + best.words.length + ' science words on your board.');
  }

  /* ── the words that were actually on their board ───────
     This is what makes the lesson theirs rather than generic: the terms we recognised
     steer which pages get built, and the student can switch any of them off. */
  function showBoardTerms(match) {
    S.boardTerms = match.words.slice(0, 10);
    S.boardOff = {};
    var box = $('board-terms');
    if (!S.boardTerms.length) { box.hidden = true; return; }
    box.hidden = false;
    renderBoardChips();

    /* be straight about anything on the board this topic does not cover */
    var covered = ' ' + S.boardTerms.join(' ') + ' ';
    var extra = (S.ocrText || '').toLowerCase().match(/[a-z]{5,}/g) || [];
    var unknown = [];
    extra.forEach(function (w) {
      if (unknown.length >= 3) return;
      if (covered.indexOf(w) > -1 || unknown.indexOf(w) > -1) return;
      if (S.topic && S.topic.keywords.join(' ').indexOf(w) > -1) return;
      if (/^(the|and|that|this|with|from|they|there|which|because|about|write|answer|question|homework|today|notes|page|chapter)$/.test(w)) return;
      unknown.push(w);
    });
    $('board-missing').hidden = true;
  }

  function renderBoardChips() {
    $('board-chips').innerHTML = S.boardTerms.map(function (w) {
      return '<button type="button" class="term-chip" data-term="' + esc(w) + '" aria-pressed="' +
        (S.boardOff[w] ? 'false' : 'true') + '">' + esc(w) + '</button>';
    }).join('');
    $('board-chips').querySelectorAll('[data-term]').forEach(function (b) {
      b.addEventListener('click', function () {
        var w = b.dataset.term;
        S.boardOff[w] = !S.boardOff[w];
        renderBoardChips();
        updateMakeButton();
        say(S.boardOff[w] ? w + ' dropped from your lesson.' : w + ' back in your lesson.');
      });
    });
  }

  function activeBoardTerms() {
    return (S.boardTerms || []).filter(function (w) { return !S.boardOff[w]; });
  }

  /* Which scenes does the board actually talk about?
     A word that shows up in half the scenes ("oxygen" in a photosynthesis unit) says nothing
     about which page the teacher was on, so it gets no weight. A word that points at one
     scene ("stomata") is worth a lot. That is what steers the lesson. */
  function sceneIdentity(sc) {
    return (' ' + sc.term.w + ' ' + sc.t + ' ' + (sc.labels || []).join(' ') + ' ')
      .toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ');
  }

  function hasTerm(hay, term) {
    var k = String(term).toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
    if (k.length < 3) return false;
    if (hay.indexOf(' ' + k + ' ') > -1) return true;
    var stem = k.replace(/s$/, '');
    return stem.length > 3 && hay.indexOf(' ' + stem) > -1;
  }

  function boardWeights(topic) {
    var terms = activeBoardTerms();
    var ids = topic.scenes.map(sceneIdentity);
    var w = {};
    terms.forEach(function (t) {
      var hits = 0;
      ids.forEach(function (h) { if (hasTerm(h, t)) hits++; });
      w[t] = (hits === 0 || hits > topic.scenes.length / 2) ? 0 : 1 / hits;
    });
    return w;
  }

  function sceneBoardScore(sc, weights) {
    var hay = sceneIdentity(sc), total = 0;
    Object.keys(weights).forEach(function (t) {
      if (weights[t] && hasTerm(hay, t)) total += weights[t];
    });
    return total;
  }

  /* show the student the raw words we read, so a wrong guess is explainable */
  function peek(clean) {
    return '<p class="ocr-peek">Words we read: <code>' + esc(clean.slice(0, 160)) + (clean.length > 160 ? '…' : '') + '</code></p>';
  }

  /* ── matching the words on the board to a topic ────── */
  function matchTopics(raw) {
    var text = ' ' + raw.toLowerCase().replace(/[^a-z0-9₂₄₆\s]/g, ' ').replace(/\s+/g, ' ') + ' ';
    var out = [];
    window.TOPICS.forEach(function (topic) {
      var score = 0, hit = [];
      topic.keywords.forEach(function (k) {
        var key = k.toLowerCase();
        var found = key.indexOf(' ') > -1
          ? (text.indexOf(' ' + key + ' ') > -1 || text.indexOf(' ' + key) > -1)
          : text.indexOf(' ' + key + ' ') > -1;
        if (found) {
          score += key.indexOf(' ') > -1 ? 4 : (key.length > 6 ? 3 : 2);
          hit.push(k);
        }
      });
      topic.title.toLowerCase().split(/\s+/).forEach(function (w) {
        if (w.length > 3 && text.indexOf(' ' + w) > -1) score += 2;
      });
      if (score >= 4) out.push({ topic: topic, score: score, words: hit });
    });
    return out.sort(function (a, b) { return b.score - a.score; });
  }

  /* ── step 2: the library list ──────────────────────── */
  function renderTopics(filter) {
    var q = (filter || '').trim().toLowerCase();
    var list = window.TOPICS.filter(function (t) {
      if (!q) return true;
      if (t.title.toLowerCase().indexOf(q) > -1) return true;
      if (t.subject.toLowerCase().indexOf(q) > -1) return true;
      if (t.blurb.toLowerCase().indexOf(q) > -1) return true;
      return t.keywords.some(function (k) { return k.indexOf(q) > -1; });
    });

    $('topic-list').innerHTML = list.map(function (t) {
      var on = S.topic && S.topic.id === t.id;
      return '<li><button type="button" class="topic-btn" data-topic="' + t.id + '" aria-pressed="' + (on ? 'true' : 'false') + '">' +
        '<b>' + esc(t.title) + '</b><span>' + esc(t.subject) + ' · ' + esc(t.grades) + '</span></button></li>';
    }).join('');

    $('topic-list').querySelectorAll('[data-topic]').forEach(function (b) {
      b.addEventListener('click', function () { chooseTopic(b.dataset.topic); });
    });

    $('topic-empty').hidden = list.length > 0;
    $('topic-count').textContent = q
      ? list.length + ' of ' + window.TOPICS.length + ' topics match "' + q + '"'
      : window.TOPICS.length + ' topics in the library right now.';
  }

  $('topic-search').addEventListener('input', function () { renderTopics(this.value); });

  function chooseTopic(id) {
    var t = window.TOPICS.filter(function (x) { return x.id === id; })[0];
    if (!t) return;
    S.topic = t;
    $('chosen').hidden = false;
    $('chosen-name').textContent = t.title;
    $('chosen-blurb').textContent = t.blurb;
    renderTopics($('topic-search').value);
    unlock(3);
    updateGradeNote();
    updateMakeButton();
    renderFindOnline();
    say('Topic set to ' + t.title + '.');
  }

  $('to-step3').addEventListener('click', function () {
    goTo($('step3'));
    markStep(3);
    $('make-btn').focus();
  });

  /* ── step 3: format, length, voice ─────────────────── */
  var styleForm = $('style-form');

  styleForm.addEventListener('change', function () {
    var fd = new FormData(styleForm);
    var gradeWas = S.grade;
    S.format = fd.get('format');
    S.pages = Number(fd.get('pages'));
    S.minutes = Number(fd.get('minutes'));
    S.grade = fd.get('grade') || 'middle';
    if (gradeWas !== S.grade && S.gradeNum && bandFor(S.gradeNum) !== S.grade) S.gradeNum = null;
    if (gradeWas !== S.grade) { applyGradeDefaults(); S.pages = Number(fd.get('pages')); S.minutes = Number(fd.get('minutes')); }
    if (S.grade !== gradeWas && !S.rateTouched) $('rate-select').value = String(GRADES[S.grade].rate);
    S.rate = Number($('rate-select').value);
    S.voiceURI = $('voice-select').value;
    $('len-book').hidden = S.format !== 'book';
    $('len-video').hidden = S.format !== 'video';
    updateGradeNote();
    updateMakeButton();
    renderFindOnline();
  });

  $('rate-select').addEventListener('change', function () { S.rateTouched = true; });
  $('voice-select').addEventListener('change', function () { S.voiceTouched = true; });
  ['pages', 'minutes'].forEach(function (n) {
    document.querySelectorAll('input[name="' + n + '"]').forEach(function (r) {
      r.addEventListener('click', function () { S.lengthTouched = true; });
    });
  });

  function updateGradeNote() {
    var n = $('grade-note');
    var on = activeBoardTerms().length;
    var bits = [];
    if (S.grade === 'elementary') bits.push('Shorter sentences, every key word said out loud, and the hardest pages left out.');
    if (S.grade === 'high') bits.push('Full wording, plus extra questions built from your own photo.');
    if (S.topic) bits.push('This topic is written for ' + S.topic.grades.toLowerCase() + '.');
    if (on) bits.push('Leading with the ' + on + ' word' + (on > 1 ? 's' : '') + ' we found on your board.');
    n.textContent = bits.join(' ');
  }

  var MAKE_LABEL = {
    book: 'Make my picture book', video: 'Make my video',
    project: 'Plan my project', report: 'Build my report outline',
    chase: 'Start running'
  };

  function updateMakeButton() {
    $('make-btn').textContent = MAKE_LABEL[S.format] || 'Make it';
    if (!S.topic) { $('make-sub').textContent = ''; return; }
    var name = S.topic.title.toLowerCase();
    if (S.format === 'book') {
      var real = buildBoard().items.length;
      $('make-sub').textContent = real + ' pages about ' + name +
        (real < S.pages ? ' — the rest is held back until grade 6.' : '.');
    } else if (S.format === 'video') {
      /* say the real running time, not the rounded label — narration length is what it is */
      $('make-sub').textContent = fmtTime(buildBoard().total) + ' long, about ' + name + '.';
    } else if (S.format === 'project') {
      var p = window.PROJECTS[S.topic.id];
      $('make-sub').textContent = p ? p.title + ' — ' + p.days.toLowerCase() + '.' : 'A hands-on project about ' + name + '.';
    } else if (S.format === 'chase') {
      $('make-sub').textContent = 'Outrun it by answering questions about ' + name + '.';
    } else {
      $('make-sub').textContent = 'A full writing plan for a report about ' + name + '.';
    }
  }

  /* ── look for a real video before making one ───────────
     No API calls: searching inside the page would need a paid key, and a key shipped in a
     public web page is a key anybody can take. So we hand the student a prefilled search
     on the real site instead, which needs no account and never expires. */
  var ZH = {
    'photosynthesis': '光合作用', 'cells': '细胞结构', 'states-of-matter': '物质三态',
    'water-cycle': '水循环', 'atoms': '原子 元素周期表', 'forces-motion': '牛顿运动定律',
    'energy': '动能 势能 能量守恒', 'circuits': '串联 并联 电路', 'ecosystems': '生态系统 食物链',
    'chemical-change': '物理变化 化学变化', 'plate-tectonics': '板块构造 地震',
    'body-systems': '人体系统 循环 呼吸 消化', 'genetics': 'DNA 遗传 基因', 'waves': '波 光 声音'
  };

  function renderFindOnline() {
    var box = $('find-online');
    var show = S.format === 'video' && !!S.topic;
    box.hidden = !show;
    $('make-fallback').hidden = !show;
    if (!show) return;

    var t = S.topic;
    var q = encodeURIComponent(t.title + ' explained');
    var zh = encodeURIComponent(ZH[t.id] || t.title);
    var sites = [
      { name: 'YouTube', url: 'https://www.youtube.com/results?search_query=' + q, note: 'video' },
      { name: 'Khan Academy', url: 'https://www.khanacademy.org/search?page_search_query=' + q, note: 'free lessons' },
      { name: 'Bilibili', url: 'https://search.bilibili.com/all?keyword=' + zh, note: '中文' },
      { name: 'Web search', url: 'https://duckduckgo.com/?q=' + q + '+video', note: 'everywhere else' }
    ];
    $('find-row').innerHTML = sites.map(function (s) {
      return '<a class="find-link" href="' + s.url + '" target="_blank" rel="noopener noreferrer">' +
        esc(s.name) + ' <span class="ext">' + esc(s.note) + ' ↗</span></a>';
    }).join('');
  }

  function loadVoices() {
    if (!synth) {
      $('voice-select').innerHTML = '<option>No voices on this device</option>';
      $('voice-select').disabled = true;
      $('voice-sample').disabled = true;
      $('voice-note').textContent = 'This browser has no speech voices, so the book and video will show text without narration.';
      $('speech-warn').hidden = false;
      return;
    }
    voices = synth.getVoices() || [];
    var en = voices.filter(function (v) { return /^en/i.test(v.lang); });
    var use = en.length ? en : voices;
    if (!use.length) {
      $('voice-select').innerHTML = '<option value="">Your device default voice</option>';
      return;
    }

    /* Most devices carry both a smooth modern voice and an old robotic one, and the default
       is often the robot. Rank them so the good one is picked for you. */
    use = use.slice().sort(function (a, b) { return voiceScore(b) - voiceScore(a); });
    var best = use[0];

    $('voice-select').innerHTML = use.map(function (v, i) {
      return '<option value="' + esc(v.voiceURI) + '">' + esc(v.name) + ' (' + esc(v.lang) + ')' +
        (i === 0 ? ' — smoothest here' : '') + '</option>';
    }).join('') + '<option value="">Your device default voice</option>';

    if (!S.voiceTouched && best) {
      $('voice-select').value = best.voiceURI;
      S.voiceURI = best.voiceURI;
    }
    $('voice-note').textContent = use.length + ' voices on this device' +
      (best ? ', and we have picked ' + best.name + ' as the smoothest' : '') + '. They work offline.';
  }

  if (synth) {
    loadVoices();
    synth.addEventListener ? synth.addEventListener('voiceschanged', loadVoices) : (synth.onvoiceschanged = loadVoices);
  } else {
    loadVoices();
  }

  /* ── making the narration speakable ───────────────────
     A speech engine reads "6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂" as noise. Spelling the chemistry and
     the symbols out first is the single biggest difference to how the narration sounds. The
     captions still show the proper notation — only the spoken version is rewritten. */

  var SPOKEN = [
    /* whole formulas first, because they read far better as names */
    [/C₆H₁₂O₆/g, ' glucose '], [/6CO₂/g, ' six carbon dioxide '], [/6H₂O/g, ' six water '],
    [/6O₂/g, ' six oxygen '], [/CO₂/g, ' carbon dioxide '], [/H₂O/g, ' water '],
    [/O₂/g, ' oxygen '], [/CH₄/g, ' methane '], [/CO₃/g, ' carbonate '],
    [/NaCl/g, ' sodium chloride '], [/H⁺/g, ' H plus '], [/OH⁻/g, ' O H minus '],
    [/\bpH\b/g, 'P H'], [/\bDNA\b/g, 'D N A'], [/\bCO\b/g, 'C O'],
    /* units */
    [/°C/g, ' degrees Celsius'], [/m\/s²/g, ' metres per second squared'],
    [/m\/s/g, ' metres per second'], [/N\/kg/g, ' newtons per kilogram'],
    [/g\/cm³/g, ' grams per cubic centimetre'], [/km\/h/g, ' kilometres per hour'],
    /* maths symbols */
    [/→/g, ' gives '], [/×/g, ' times '], [/÷/g, ' divided by '],
    [/\s=\s/g, ' equals '], [/\s\+\s/g, ' plus '], [/%/g, ' per cent'],
    [/⁺/g, ' plus'], [/⁻/g, ' minus'], [/²/g, ' squared'], [/³/g, ' cubed'],
    [/₀/g, ' zero'], [/₁/g, ' one'], [/₂/g, ' two'], [/₃/g, ' three'], [/₄/g, ' four'],
    [/₅/g, ' five'], [/₆/g, ' six'], [/₇/g, ' seven'], [/₈/g, ' eight'], [/₉/g, ' nine'],
    /* a dash is a pause when it is read, not a word */
    [/\s[—–]\s/g, ', '], [/\.\.\./g, ', '],
    [/½/g, ' a half '], [/¼/g, ' a quarter '], [/¾/g, ' three quarters '],
    /* tidy up */
    [/(\d)([A-Za-z])/g, '$1 $2'], [/\s{2,}/g, ' '], [/\s+([.,!?])/g, '$1']
  ];

  function speechText(text) {
    var out = ' ' + String(text) + ' ';
    SPOKEN.forEach(function (rule) { out = out.replace(rule[0], rule[1]); });
    out = out.trim();
    /* finish on a full stop so the engine lands the last word instead of clipping it */
    if (!/[.!?]$/.test(out)) out += '.';
    return out;
  }

  /* higher is smoother: modern neural voices beat the old formant ones by a mile */
  function voiceScore(v) {
    var n = (v.name || '') + ' ' + (v.voiceURI || '');
    var score = 0;
    if (/natural|neural/i.test(n)) score += 60;
    if (/google/i.test(n)) score += 40;
    if (/premium|enhanced|siri|online/i.test(n)) score += 30;
    if (/espeak|compact|pico|festival|flite/i.test(n)) score -= 60;
    if (/^en-GB/i.test(v.lang)) score += 6;
    if (/^en-US/i.test(v.lang)) score += 5;
    if (v.localService === false) score += 8;      /* cloud voices are usually the good ones */
    return score;
  }

  function speak(text, onEnd, onWord) {
    if (!synth) { if (onEnd) onEnd(); return null; }
    var u = new SpeechSynthesisUtterance(speechText(text));
    u.rate = S.rate;
    u.pitch = 1.02;        /* a hair above flat sounds less robotic */
    if (S.voiceURI) {
      var v = voices.filter(function (x) { return x.voiceURI === S.voiceURI; })[0];
      if (v) { u.voice = v; u.lang = v.lang; }
    }
    if (onEnd) u.onend = onEnd;
    /* Chrome and Edge fire a boundary event per word, which is what drives the caption
       highlight. Browsers that do not fire it simply show the caption unhighlighted. */
    if (onWord) u.onboundary = function (e) { onWord(e.charIndex || 0); };
    synth.speak(u);
    return u;
  }

  function stopSpeech() {
    clearTimeout(speakTimer);
    if (synth) { try { synth.cancel(); } catch (e) {} }
  }

  /* Chrome drops an utterance queued in the same tick as a cancel, which is what made the
     first word of each scene disappear. Leaving a beat fixes it. */
  var speakTimer = null;
  function speakSoon(text, onEnd, onWord) {
    clearTimeout(speakTimer);
    var wasSpeaking = !!(synth && (synth.speaking || synth.pending));
    if (synth) { try { synth.cancel(); } catch (e) {} }
    speakTimer = setTimeout(function () { speak(text, onEnd, onWord); }, wasSpeaking ? 110 : 20);
  }

  $('voice-sample').addEventListener('click', function () {
    stopSpeech();
    S.rate = Number($('rate-select').value);
    S.voiceURI = $('voice-select').value;
    speak('Photosynthesis is how a plant turns sunlight, water and carbon dioxide into food.');
    toast('Playing a sample');
  });

  /* ── building the storyboard ───────────────────────── */
  /* Pages are chosen board-first: whatever the student's own photo pointed at outranks
     everything else, then the usual tier order fills the rest. The closing recap page is
     always kept, so even a four-page book still ends properly. */
  function pickScenes(topic, count) {
    var weights = boardWeights(topic);
    var ceiling = GRADES[S.grade].maxTier;
    var idx = topic.scenes.map(function (sc, i) {
      return { s: sc, i: i, score: sceneBoardScore(sc, weights) };
    }).filter(function (x, i) {
      return x.s.tier <= ceiling || i === topic.scenes.length - 1;   /* always keep the recap */
    });

    count = Math.min(count, idx.length);
    var recap = count >= 4 ? idx[idx.length - 1] : null;
    var pool = idx.filter(function (x) { return x !== recap; });
    pool.sort(function (a, b) { return (b.score - a.score) || (a.s.tier - b.s.tier) || (a.i - b.i); });

    var chosen = (recap ? [recap] : []).concat(pool.slice(0, Math.max(0, count - (recap ? 1 : 0))));
    chosen.sort(function (a, b) { return a.i - b.i; });
    return chosen.map(function (c) { c.s._board = c.score > 0; return c.s; });
  }

  /* ── grade bands ───────────────────────────────────────
     Elementary gets the short retelling of each idea and always sees the key word.
     High school gets the full text plus the harder, board-built questions. */
  var GRADES = {
    /* maxTier holds back the most advanced quarter of a topic from the youngest readers —
       better to leave it out than to water it down into something wrong. */
    elementary: { label: 'Grades 3–5', rate: 0.8, alwaysTerm: true, cloze: false, maxTier: 2, pages: 4, minutes: 1 },
    middle: { label: 'Grades 6–8', rate: 0.95, alwaysTerm: true, cloze: true, maxTier: 3, pages: 8, minutes: 3 },
    high: { label: 'Grades 9–12', rate: 1.15, alwaysTerm: false, cloze: true, maxTier: 3, pages: 12, minutes: 5 }
  };

  function bodyFor(scene) {
    return (S.grade === 'elementary' && scene.s) ? scene.s : scene.b;
  }

  function narrationFor(scene, withTerm) {
    var t = scene.t + '. ' + bodyFor(scene);
    /* The one-minute video is the "just the big idea" option, so it skips the key-word
       sentence — except for the youngest readers, who need every word explained. */
    var terse = S.format === 'video' && S.minutes <= 3 && S.grade !== 'elementary';
    if (!terse && (withTerm || GRADES[S.grade].alwaysTerm)) {
      t += ' Key word: ' + scene.term.w + '. ' + scene.term.d;
    }
    return t;
  }

  function buildBoard() {
    var topic = S.topic;
    var isBook = S.format !== 'video';                    /* documents page like a book */
    var count = S.format === 'video' ? ({ 1: 4, 3: 8, 5: 12 })[S.minutes]
      : S.format === 'book' ? S.pages : 12;               /* documents use the whole topic */
    var scenes = pickScenes(topic, count);
    var withTerm = !isBook && S.minutes >= 3;

    var secs = function (text) { return (words(text) / 2.5) / S.rate + 0.9; };

    var items = scenes.map(function (sc) {
      var narration = narrationFor(sc, withTerm);
      return {
        kind: 'scene',
        t: sc.t, b: bodyFor(sc), art: sc.art, labels: sc.labels, term: sc.term,
        onBoard: !!sc._board,
        narration: narration,
        speechSecs: secs(narration)
      };
    });

    if (!isBook) {
      /* a real video opens and closes properly, so it gets a title slide and a recap slide.
         On the 1-minute version those slides are spoken briefly, so they do not eat the minute. */
      var brief = S.minutes === 1;
      var keyWords = items.slice(0, 4).map(function (x) { return x.term.w; });
      var titleNar = brief ? topic.title + '.' : topic.title + '. ' + topic.blurb;
      var endNar = brief
        ? 'That is it. Try the three questions underneath.'
        : 'That is the whole thing. The words to remember are: ' + keyWords.join(', ') +
          '. Now try the three questions underneath.';
      var open = { kind: 'title', t: topic.title, b: topic.blurb, narration: titleNar, speechSecs: secs(titleNar) };
      var close = { kind: 'end', t: 'You made it to the end', b: endNar, terms: items.slice(0, 4).map(function (x) { return x.term; }), narration: endNar, speechSecs: secs(endNar) };
      open.dur = open.speechSecs + (brief ? 0.8 : 1.4);
      close.dur = close.speechSecs + (brief ? 1.0 : 1.6);

      /* and one more slide before the recap: where this shows up in ordinary life */
      var ex = topic.example;
      var extra = [];
      if (ex) {
        var exNar = 'Where you see this. ' + ex.t + '. ' + ex.b + (brief ? '' : ' ' + ex.spot);
        extra.push({
          kind: 'example', t: ex.t, b: exNar, spot: ex.spot, blurb: ex.b,
          narration: exNar, speechSecs: secs(exNar)
        });
        extra[0].dur = extra[0].speechSecs + (brief ? 1 : 1.8);
      }

      var fixed = open.dur + close.dur + (extra[0] ? extra[0].dur : 0);
      var target = S.minutes * 60 - fixed;
      var sum = items.reduce(function (a, x) { return a + x.speechSecs; }, 0);
      var pad = Math.max(0.6, Math.min(5, (target - sum) / items.length));
      items.forEach(function (x) { x.dur = x.speechSecs + pad; });
      items = [open].concat(items, extra, [close]);
    }

    return {
      topic: topic,
      format: S.format,
      items: items,
      total: items.reduce(function (a, x) { return a + (x.dur || 0); }, 0)
    };
  }

  /* ── step 4 ────────────────────────────────────────── */
  styleForm.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!S.topic) { toast('Pick a topic first'); goTo($('step2')); return; }
    stopSpeech();
    unlock(4);
    goTo($('step4'));

    $('book-view').hidden = true;
    $('video-view').hidden = true;
    $('doc-view').hidden = true;
    $('chase-view').hidden = true;
    if (window.CHASE) window.CHASE.stop();
    $('deeper').hidden = true;
    $('quiz').hidden = true;
    $('exports').hidden = true;
    $('building').hidden = false;
    $('build-bar').style.width = '8%';
    $('build-text').textContent = 'Getting the science together…';
    say('Making your ' + (MAKE_LABEL[S.format] || 'lesson').replace(/^\w+ my /, '') + '.');

    /* The lesson is built right now. The little progress animation is decoration on top,
       and it never gates the result — browsers throttle timers in a background tab, and a
       student who switches away mid-build should not come back to a stuck progress bar. */
    S.board = buildBoard();
    S.page = 0;

    var done = false;
    function reveal() {
      if (done) return;
      done = true;
      $('building').hidden = true;
      if (S.board.format === 'book') showBook();
      else if (S.board.format === 'video') showVideo();
      else if (S.board.format === 'chase') showChase();
      else showDoc();
      buildQuiz();
      showDeeper();
      $('quiz').hidden = S.board.format === 'chase';
      $('exports').hidden = S.board.format === 'chase';
    }

    if (reduceMotion || document.hidden) { reveal(); return; }

    var steps = ['Getting the science together…', 'Drawing the pictures…', 'Writing it in plain words…', 'Almost there…'];
    var i = 0;
    var tick = setInterval(function () {
      i++;
      $('build-bar').style.width = (12 + i * 26) + '%';
      if (steps[i]) $('build-text').textContent = steps[i];
      if (i >= 3) { clearInterval(tick); reveal(); }
    }, 300);
    setTimeout(function () { clearInterval(tick); reveal(); }, 1600);   /* never wait longer than this */
  });

  /* ── the picture book ──────────────────────────────── */
  function showBook() {
    $('book-view').hidden = false;
    $('step4-sub').textContent = S.board.items.length + '-page picture book about ' + S.board.topic.title.toLowerCase() + '. Use the arrow keys to turn pages.';
    renderPage();
    $('book-page').focus();
  }

  function exampleBox(ex) {
    return '<div class="page-example">' +
      '<p class="pe-kicker">Where you see this</p>' +
      '<p class="pe-title">' + esc(ex.t) + '</p>' +
      '<p class="pe-body">' + esc(ex.b) + '</p>' +
      '<p class="pe-spot">' + esc(ex.spot) + '</p>' +
      '</div>';
  }

  function renderPage() {
    var n = S.board.items.length;
    var it = S.board.items[S.page];
    var lastPage = S.page === n - 1;
    $('book-page').innerHTML =
      '<div class="page-art">' + window.ART.render(it.art, it.labels) + '</div>' +
      '<div class="page-text">' +
      '<p class="page-num">Page ' + (S.page + 1) + ' of ' + n +
      (it.onBoard ? '<span class="from-board">on your board</span>' : '') + '</p>' +
      '<h3 class="page-title">' + esc(it.t) + '</h3>' +
      '<p class="page-body">' + esc(it.b) + '</p>' +
      '<p class="page-term"><b>' + esc(it.term.w) + '</b> — ' + esc(it.term.d) + '</p>' +
      (lastPage && S.board.topic.example ? exampleBox(S.board.topic.example) : '') +
      '</div>';
    $('page-count').textContent = 'Page ' + (S.page + 1) + ' of ' + n;
    $('prev-page').disabled = S.page === 0;
    $('next-page').textContent = S.page === n - 1 ? 'Back to page 1' : 'Next →';

    $('page-dots').innerHTML = S.board.items.map(function (x, i) {
      return '<button type="button" class="dot" data-p="' + i + '" aria-current="' + (i === S.page) + '" aria-label="Page ' + (i + 1) + '">' + (i + 1) + '</button>';
    }).join('');
    $('page-dots').querySelectorAll('[data-p]').forEach(function (b) {
      b.addEventListener('click', function () { S.page = Number(b.dataset.p); stopSpeech(); renderPage(); });
    });
  }

  function turn(d) {
    var n = S.board.items.length;
    S.page = (S.page + d + n) % n;
    stopSpeech();
    renderPage();
  }

  $('next-page').addEventListener('click', function () { turn(1); });
  $('prev-page').addEventListener('click', function () { turn(-1); });
  $('read-page').addEventListener('click', function () {
    if (!synth) { toast('This browser has no voices'); return; }
    stopSpeech();
    var it = S.board.items[S.page];
    speak(narrationFor(it, true));
    toast('Reading page ' + (S.page + 1));
  });

  document.addEventListener('keydown', function (e) {
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) return;
    if (!S.board) return;
    if (!$('book-view').hidden) {
      if (e.key === 'ArrowRight') { e.preventDefault(); turn(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); turn(-1); }
    }
    if (!$('video-view').hidden) {
      if (e.key === ' ') { e.preventDefault(); togglePlay(); }
      if (e.key === 'ArrowRight') { e.preventDefault(); jump(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); jump(-1); }
      if (e.key === 'f' || e.key === 'F') { e.preventDefault(); $('full-btn').click(); }
      if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        $('cc-toggle').checked = !$('cc-toggle').checked;
        renderCaption(S.board.items[V.i]);
      }
    }
  });

  /* ── the video player ──────────────────────────────── */
  /* The clock is a timer plus real timestamps, not requestAnimationFrame: browsers freeze
     animation frames in a background tab, and the narration would carry on without the picture. */
  var V = { i: 0, t: 0, playing: false, timer: null, last: 0, spoken: -1, words: [], spans: null };

  function showVideo() {
    $('video-view').hidden = false;
    $('layer-a').innerHTML = '';
    $('layer-b').innerHTML = '';
    $('layer-a').className = 'layer is-front';
    $('layer-b').className = 'layer';
    $('step4-sub').textContent = 'A ' + fmtTime(S.board.total) + ' video about ' + S.board.topic.title.toLowerCase() + '. Press play, or hit the space bar.';
    V.i = 0; V.t = 0; V.playing = false; V.spoken = -1;
    $('presenter').hidden = !$('pres-toggle').checked;
    talking(false);
    if (!synth) $('speech-warn').hidden = false;
    drawScene();
    renderTicks();
    renderChips();
    updateBar();
    $('play-btn').textContent = '▶ Play';
  }

  function renderChips() {
    $('scene-chips').innerHTML = S.board.items.map(function (x, i) {
      var label = x.kind === 'title' ? '★' : x.kind === 'end' ? '✓' : x.kind === 'example' ? '◉' : String(sceneNumberAt(i));
      var name = x.kind === 'scene' ? x.t
        : x.kind === 'title' ? 'Title'
          : x.kind === 'example' ? 'Where you see this: ' + x.t : 'The end';
      return '<button type="button" class="s-chip" data-jump="' + i + '" title="' + esc(name) +
        '" aria-label="Scene ' + (i + 1) + ': ' + esc(name) + '">' + label + '</button>';
    }).join('');
    $('scene-chips').querySelectorAll('[data-jump]').forEach(function (b) {
      b.addEventListener('click', function () { goToScene(Number(b.dataset.jump)); });
    });
    markChip();
  }

  function sceneNumberAt(index) {
    var n = 0;
    for (var i = 0; i <= index; i++) if (S.board.items[i].kind === 'scene') n++;
    return n;
  }

  function markChip() {
    var chips = $('scene-chips').querySelectorAll('.s-chip');
    for (var i = 0; i < chips.length; i++) {
      chips[i].classList.toggle('is-at', i === V.i);
      chips[i].classList.toggle('is-past', i < V.i);
    }
  }

  function goToScene(i) {
    stopSpeech();
    V.i = Math.max(0, Math.min(S.board.items.length - 1, i));
    V.t = 0; V.spoken = -1;
    drawScene();
    updateBar();
    if (V.playing) { speakScene(); V.last = now(); }
    else { $('play-btn').textContent = '▶ Play'; }
  }

  function renderTicks() {
    var acc = 0, out = '';
    S.board.items.forEach(function (x, i) {
      acc += x.dur;
      if (i < S.board.items.length - 1) out += '<i style="left:' + ((acc / S.board.total) * 100) + '%"></i>';
    });
    $('seek-ticks').innerHTML = out;
  }

  function frontLayer() {
    return $('stage').querySelector('.layer.is-front') || $('layer-a');
  }

  function slideHtml(it) {
    if (it.kind === 'title') {
      return '<div class="card-slide">' +
        '<p class="cs-kicker">ThepicScience</p>' +
        '<h3 class="cs-title">' + esc(it.t) + '</h3>' +
        '<p class="cs-sub">' + esc(it.b) + '</p>' +
        '<div class="cs-rule"></div>' +
        '<p class="cs-meta">' + esc(S.board.topic.subject + ' · ' + S.board.topic.grades) + '</p>' +
        '</div>';
    }
    if (it.kind === 'example') {
      return '<div class="card-slide">' +
        '<p class="cs-kicker">Where you see this</p>' +
        '<h3 class="cs-title">' + esc(it.t) + '</h3>' +
        '<p class="cs-sub">' + esc(it.blurb) + '</p>' +
        '<div class="cs-rule"></div>' +
        '<p class="cs-spot">' + esc(it.spot) + '</p>' +
        '</div>';
    }
    if (it.kind === 'end') {
      return '<div class="card-slide">' +
        '<h3 class="cs-title">' + esc(it.t) + '</h3>' +
        '<div class="cs-rule"></div>' +
        '<ul class="cs-list">' + (it.terms || []).map(function (tm) {
          return '<li><b>' + esc(tm.w) + '</b> — ' + esc(tm.d) + '</li>';
        }).join('') + '</ul></div>';
    }
    var n = sceneNumbers();
    return '<p class="scene-head">' + esc(it.t) + '</p>' +
      window.ART.render(it.art, it.labels) +
      (it.onBoard ? '<span class="from-board">on your board</span>' : '') +
      '<p class="scene-count">' + n.at + ' / ' + n.of + '</p>';
  }

  function sceneNumbers() {
    var of = 0, at = 0;
    S.board.items.forEach(function (x, i) {
      if (x.kind === 'scene') { of++; if (i <= V.i) at = of; }
    });
    return { at: at, of: of };
  }

  /* Two stacked layers: the next slide is built on the hidden one, then they swap with a
     cross-fade. A straight innerHTML swap was a hard cut, and it looked like a slideshow. */
  function drawScene() {
    var it = S.board.items[V.i];
    var front = $('stage').querySelector('.layer.is-front') || $('layer-a');
    var back = front.id === 'layer-a' ? $('layer-b') : $('layer-a');

    back.innerHTML = slideHtml(it);
    back.classList.remove('is-out');
    void back.offsetWidth;                /* restart the entry animation */
    back.classList.add('is-front');
    front.classList.remove('is-front');
    front.classList.add('is-out');

    renderCaption(it);
    markChip();
  }

  /* the caption is the narration, split into words so the spoken one can be highlighted */
  function renderCaption(it) {
    var box = $('captions');
    if (!$('cc-toggle').checked) { box.innerHTML = ''; V.words = []; return; }
    var text = it.narration || it.b || '';
    var out = '', at = 0;
    V.words = [];
    text.split(/(\s+)/).forEach(function (chunk) {
      if (/^\s+$/.test(chunk)) { out += chunk; at += chunk.length; return; }
      if (!chunk) return;
      V.words.push(at);
      out += '<span class="cw" data-at="' + at + '">' + esc(chunk) + '</span>';
      at += chunk.length;
    });
    box.innerHTML = out;
    V.spans = box.querySelectorAll('.cw');
  }

  /* The presenter only moves her mouth while an utterance is actually running. If the device
     has no voices at all she mimes along with playback instead, so the frame still reads as a
     video rather than a slide. */
  function talking(on) {
    var p = $('presenter');
    if (!p) return;
    p.classList.toggle('is-talking', !!on && !p.hidden);
  }

  var browTimer = null;
  function wordBeat() {
    var p = $('presenter');
    if (!p || p.hidden) return;
    p.classList.remove('is-word');
    void p.offsetWidth;
    p.classList.add('is-word');
    clearTimeout(browTimer);
    browTimer = setTimeout(function () { p.classList.remove('is-word'); }, 280);
  }

  function highlightWord(charIndex) {
    wordBeat();
    if (!V.spans || !V.spans.length) return;
    var hit = -1;
    for (var i = 0; i < V.words.length; i++) {
      if (V.words[i] <= charIndex) hit = i; else break;
    }
    for (var j = 0; j < V.spans.length; j++) {
      V.spans[j].classList.toggle('is-said', j < hit);
      V.spans[j].classList.toggle('is-now', j === hit);
    }
  }

  function elapsed() {
    var e = 0;
    for (var i = 0; i < V.i; i++) e += S.board.items[i].dur;
    return e + V.t;
  }

  function updateBar() {
    var e = elapsed(), pct = S.board.total ? (e / S.board.total) * 100 : 0;
    $('seek-fill').style.width = Math.min(100, pct) + '%';
    $('time').textContent = fmtTime(e) + ' / ' + fmtTime(S.board.total);
    var s = $('seek');
    s.setAttribute('aria-valuenow', Math.round(pct));
    var it = S.board.items[V.i];
    var where = it.kind === 'title' ? 'Title slide'
      : it.kind === 'end' ? 'Last slide'
        : it.kind === 'example' ? 'Where you see this'
          : 'Scene ' + sceneNumbers().at + ' of ' + sceneNumbers().of;
    s.setAttribute('aria-valuetext', where + ', ' + fmtTime(e) + ' of ' + fmtTime(S.board.total));
  }

  function speakScene() {
    if (!synth) { talking(true); return; }
    if (V.spoken === V.i) return;
    V.spoken = V.i;
    talking(true);
    speakSoon(S.board.items[V.i].narration, function () { talking(false); }, highlightWord);
  }

  function now() { return (window.performance && performance.now) ? performance.now() : Date.now(); }

  function tick() {
    if (!V.playing) return;
    var t = now();
    V.t += (t - V.last) / 1000;
    V.last = t;
    var it = S.board.items[V.i];
    if (V.t >= it.dur) {
      if (V.i >= S.board.items.length - 1) { finishVideo(); return; }
      V.i++; V.t = 0; V.spoken = -1;
      drawScene();
      speakScene();
    }
    updateBar();
  }

  function play() {
    V.playing = true;
    V.last = now();
    $('play-btn').textContent = '❚❚ Pause';
    $('play-btn').setAttribute('aria-label', 'Pause the video');
    if (synth && synth.paused && synth.speaking) synth.resume(); else speakScene();
    clearInterval(V.timer);
    V.timer = setInterval(tick, 100);
    say('Playing.');
  }

  function pause() {
    V.playing = false;
    talking(false);
    clearInterval(V.timer);
    $('play-btn').textContent = '▶ Play';
    $('play-btn').setAttribute('aria-label', 'Play the video');
    if (synth && synth.speaking) { try { synth.pause(); } catch (e) { stopSpeech(); } }
    say('Paused.');
  }

  function togglePlay() { if (V.playing) pause(); else play(); }

  function finishVideo() {
    V.playing = false;
    talking(false);
    clearInterval(V.timer);
    V.t = S.board.items[V.i].dur;
    updateBar();
    $('play-btn').textContent = '↺ Watch again';
    $('captions').innerHTML = '<span class="cw is-said">That is the end. Try the quick check below, or press play to watch it again.</span>';
    say('Video finished.');
  }

  $('play-btn').addEventListener('click', function () {
    if (!V.playing && V.i === S.board.items.length - 1 && V.t >= S.board.items[V.i].dur) {
      V.i = 0; V.t = 0; V.spoken = -1; drawScene(); updateBar();
    }
    togglePlay();
  });

  function jump(d) {
    stopSpeech();
    V.i = Math.max(0, Math.min(S.board.items.length - 1, V.i + d));
    V.t = 0; V.spoken = -1;
    drawScene();
    updateBar();
    if (V.playing) { speakScene(); V.last = now(); }
  }

  $('fwd-scene').addEventListener('click', function () { jump(1); });
  $('back-scene').addEventListener('click', function () { jump(-1); });
  $('cc-toggle').addEventListener('change', function () {
    renderCaption(S.board.items[V.i]);
  });

  $('pres-toggle').addEventListener('change', function () {
    $('presenter').hidden = !this.checked;
    if (!this.checked) talking(false);
    else if (V.playing) talking(true);
    toast(this.checked ? 'Presenter on' : 'Presenter hidden');
  });

  /* ── fullscreen, and the shortcuts a real player has ── */
  function fullscreenOn() {
    return document.fullscreenElement || document.webkitFullscreenElement || null;
  }

  $('full-btn').addEventListener('click', function () {
    var el = $('player');
    if (fullscreenOn()) {
      (document.exitFullscreen || document.webkitExitFullscreen || function () {}).call(document);
    } else if (el.requestFullscreen || el.webkitRequestFullscreen) {
      var go = (el.requestFullscreen || el.webkitRequestFullscreen).call(el);
      if (go && go.catch) go.catch(function () { toast('Fullscreen was blocked here'); });
    } else {
      toast('This browser will not do fullscreen');
    }
  });

  document.addEventListener('fullscreenchange', function () {
    var on = !!fullscreenOn();
    $('full-btn').textContent = on ? '⤫' : '⛶';
    $('full-btn').setAttribute('aria-label', on ? 'Leave fullscreen' : 'Fullscreen');
  });

  function seekTo(pct) {
    var target = S.board.total * pct, acc = 0;
    for (var i = 0; i < S.board.items.length; i++) {
      if (acc + S.board.items[i].dur > target || i === S.board.items.length - 1) {
        V.i = i; V.t = Math.max(0, Math.min(S.board.items[i].dur - 0.1, target - acc));
        break;
      }
      acc += S.board.items[i].dur;
    }
    V.spoken = -1;
    stopSpeech();
    drawScene();
    updateBar();
    if (V.playing) { speakScene(); V.last = now(); }
  }

  $('seek').addEventListener('click', function (e) {
    var r = this.getBoundingClientRect();
    seekTo(Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)));
  });
  $('seek').addEventListener('keydown', function (e) {
    var step = 5 / (S.board ? S.board.total : 60);
    var cur = S.board ? elapsed() / S.board.total : 0;
    if (e.key === 'ArrowRight') { e.preventDefault(); seekTo(Math.min(1, cur + step)); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); seekTo(Math.max(0, cur - step)); }
    if (e.key === 'Home') { e.preventDefault(); seekTo(0); }
    if (e.key === 'End') { e.preventDefault(); seekTo(0.999); }
  });

  /* ── the quick check ───────────────────────────────── */
  /* ── projects and reports ──────────────────────────────
     Same science, but shaped as something you hand in: an experiment to run, or an outline
     to write from. Both are built from the topic the photo pointed at. */

  function wordTarget() {
    return S.grade === 'elementary' ? '150 to 250 words'
      : S.grade === 'high' ? '600 to 900 words' : '300 to 500 words';
  }

  function showDoc() {
    $('doc-view').hidden = false;
    var html = S.format === 'project' ? projectHtml() : reportHtml();
    $('doc').innerHTML = html;
    $('step4-sub').textContent = S.format === 'project'
      ? 'A project you can actually do, about ' + S.board.topic.title.toLowerCase() + '. Print it and tick things off.'
      : 'A writing plan for a report about ' + S.board.topic.title.toLowerCase() + '. The facts are here; the words should be yours.';
    $('doc').focus();
  }

  function list(items, cls) {
    return '<ul class="' + (cls || 'doc-list') + '">' + items.map(function (x) {
      return '<li>' + esc(x) + '</li>';
    }).join('') + '</ul>';
  }

  function projectHtml() {
    var topic = S.board.topic;
    var p = window.PROJECTS[topic.id];
    if (!p) {
      return '<p class="doc-lede">There is no project written for this topic yet. The report option works for every topic, ' +
        'and the picture book covers the science itself.</p>';
    }
    var scenes = S.board.items.filter(function (x) { return x.kind !== 'title' && x.kind !== 'end'; });
    return '<p class="doc-kicker">Science project · ' + esc(topic.title) + '</p>' +
      '<h3 class="doc-title">' + esc(p.title) + '</h3>' +
      '<p class="doc-lede">' + esc(p.question) + '</p>' +
      '<p class="doc-meta">' + esc(p.days) + (S.gradeNum ? ' · written for grade ' + S.gradeNum : '') + '</p>' +

      '<h4>What you need</h4>' + list(p.needs) +
      '<h4>What to do</h4><ol class="doc-list">' + p.steps.map(function (x, i) {
        return '<li><span class="doc-step">' + (i + 1) + '</span>' + esc(x) + '</li>';
      }).join('') + '</ol>' +
      '<h4>What to look for</h4><p>' + esc(p.look) + '</p>' +
      '<h4>The science behind it</h4><p>' + esc(p.why) + '</p>' +
      '<div class="doc-callout"><b>Keeping it a fair test.</b> ' + esc(p.fair) + '</div>' +
      '<h4>If you want to go further</h4><p>' + esc(p.stretch) + '</p>' +

      '<h4>How to write it up</h4>' +
      list(['Title and the question you were testing',
        'What you thought would happen, and why (your hypothesis)',
        'What you used and what you did — enough that someone could repeat it',
        'Your results: a table, a chart, and your photos',
        'What the results mean, using the science words below',
        'What you would change if you did it again']) +
      '<h4>Words to use in your write-up</h4>' +
      '<div class="doc-terms">' + scenes.slice(0, 6).map(function (x) {
        return '<p><b>' + esc(x.term.w) + '</b> — ' + esc(x.term.d) + '</p>';
      }).join('') + '</div>' +
      '<p class="doc-foot">Ask an adult before using anything hot, sharp or electrical beyond a single battery.</p>';
  }

  function reportHtml() {
    var topic = S.board.topic;
    var scenes = S.board.items.filter(function (x) { return x.kind !== 'title' && x.kind !== 'end'; });
    var qs = topic.quiz.slice(0, 5);

    var sections = scenes.map(function (x, i) {
      return '<div class="doc-section">' +
        '<p class="doc-num">Section ' + (i + 1) + '</p>' +
        '<h4>' + esc(x.t) + '</h4>' +
        '<p class="doc-fact">' + esc(x.b) + '</p>' +
        '<p class="doc-prompt">Write this in your own words, and use <b>' + esc(x.term.w) + '</b> correctly.</p>' +
        '</div>';
    }).join('');

    return '<p class="doc-kicker">Report outline · ' + esc(topic.subject) + '</p>' +
      '<h3 class="doc-title">' + esc(topic.title) + '</h3>' +
      '<p class="doc-lede">' + esc(topic.blurb) + '</p>' +
      '<p class="doc-meta">Aim for ' + wordTarget() + (S.gradeNum ? ' · grade ' + S.gradeNum : '') +
      ' · ' + scenes.length + ' sections</p>' +

      '<div class="doc-callout"><b>How to use this.</b> Every section below gives you the fact and the key word. ' +
      'Do not copy the sentences — read them, close the page, and write what you remember. That is the part that makes it stick.</div>' +

      '<h4>Introduction</h4>' +
      '<p class="doc-prompt">Open by saying what ' + esc(topic.title.toLowerCase()) + ' is and why it matters. ' +
      'One good first line: ' + esc(topic.blurb) + '</p>' +
      sections +
      '<h4>Conclusion</h4>' +
      '<p class="doc-prompt">Finish with the big idea in one or two sentences: ' +
      esc(scenes[scenes.length - 1] ? scenes[scenes.length - 1].term.d : '') + '</p>' +

      (window.DETAIL && window.DETAIL[topic.id] && window.DETAIL[topic.id].formulas.length
        ? '<h4>Formulas to state and explain</h4>' +
          window.DETAIL[topic.id].formulas.map(function (f) {
            return '<p class="doc-fact"><b>' + esc(f.f) + '</b><br>' + esc(f.what) + '</p>';
          }).join('') +
          '<h4>Mistakes to avoid making in this report</h4>' +
          window.DETAIL[topic.id].mistakes.map(function (m) {
            return '<p class="doc-prompt">Not: ' + esc(m.wrong) + ' &nbsp;→&nbsp; ' + esc(m.right) + '</p>';
          }).join('')
        : '') +

      (topic.example
        ? '<h4>An everyday example to include</h4>' +
          '<p class="doc-fact"><b>' + esc(topic.example.t) + '.</b> ' + esc(topic.example.b) + '</p>' +
          '<p class="doc-prompt">' + esc(topic.example.spot) + '</p>'
        : '') +

      '<h4>Questions your report should answer</h4>' +
      list(qs.map(function (q) { return q.q; })) +

      '<h4>Vocabulary list</h4>' +
      '<div class="doc-terms">' + scenes.map(function (x) {
        return '<p><b>' + esc(x.term.w) + '</b> — ' + esc(x.term.d) + '</p>';
      }).join('') + '</div>' +

      '<h4>Before you hand it in</h4>' +
      list(['Every key word above is used at least once, correctly',
        'Every section is in your own words',
        'You have a diagram or two — the drawings in the picture book version work',
        'The conclusion answers the question you opened with',
        'You said where the information came from, including your own class notes']) +
      '<p class="doc-foot">Built from your own topic by ThepicScience. The writing has to be yours.</p>';
  }

  /* ── escape the monster ────────────────────────────────
     The same questions as the quiz, but with something closing in behind you. Right answers
     are speed; wrong ones cost you ground. Drawing and physics live in chase.js. */

  function chaseQuestions(topic) {
    var pool = topic.quiz.map(function (q) {
      return { q: q.q, a: q.a, c: q.c, why: q.why, teach: teachIndexFor(q, topic), source: 'library' };
    });
    /* top it up with generated ones so a long run never repeats itself */
    topic.scenes.forEach(function (sc, i) {
      pool = pool.concat(practiceFor(topic, i, 1));
    });
    if (GRADES[S.grade].cloze) pool = pool.concat(boardQuestions(topic, 2));
    return pool;
  }

  function showChase() {
    $('chase-view').hidden = false;
    $('step4-sub').textContent = 'Answer fast and you outrun it. ' +
      'Get one wrong and it closes in. Nothing jumps out and there is no sound.';

    var el = {
      wrap: $('chase-wrap'), canvas: $('chase-canvas'),
      bar: $('chase-bar'), dist: $('chase-dist'), gap: $('chase-gap'),
      play: $('chase-play'), q: $('chase-q'), opts: $('chase-opts'), feedback: $('chase-feedback'),
      over: $('chase-over'), overTitle: $('chase-over-title'), overSub: $('chase-over-sub')
    };

    window.CHASE.start({
      el: el,
      questions: chaseQuestions(S.board.topic),
      reduced: reduceMotion,
      calm: $('chase-calm').checked,
      onEnd: function (result) {
        S.missed = result.wrong.filter(function (q) { return typeof q.teach === 'number'; });
        $('chase-learn').hidden = !S.missed.length;
        say(result.escaped ? 'You escaped.' : 'It caught you.');
      }
    });
    say('The chase has started. Answer the question to run faster.');
  }

  $('chase-again').addEventListener('click', function () { showChase(); });

  $('chase-calm').addEventListener('change', function () {
    if (window.CHASE) window.CHASE.setCalm(this.checked);
    toast(this.checked ? 'Friendly shadow mode' : 'Back to scary');
  });

  $('chase-learn').addEventListener('click', function () {
    if (!S.missed || !S.missed.length) return;
    $('quiz').hidden = false;
    buildQuiz(practiceRound(S.missed.slice()));
    showMissed(S.missed);
    goTo($('quiz'));
  });

  window.addEventListener('resize', function () {
    if (window.CHASE && window.CHASE.running()) window.CHASE.resize();
  });

  /* ── the deeper layer ──────────────────────────────────
     The twelve scenes teach the idea. This is what sits on top of it in an exam: the
     formulas with every symbol named, the misconceptions that cost marks, a few steps past
     the basics, and the links to the rest of the library. Folded away until asked for, so
     it never buries the lesson. */

  function topicName(id) {
    var t = window.TOPICS.filter(function (x) { return x.id === id; })[0];
    return t ? t.title : id;
  }

  function deeperHtml(d) {
    var out = '';

    if (d.formulas && d.formulas.length) {
      out += '<h4 class="deeper-h">Formulas, and what each part means</h4><div class="deeper-list">' +
        d.formulas.map(function (f) {
          return '<div class="deeper-formula"><p class="df-eq">' + esc(f.f) + '</p>' +
            '<p class="df-what">' + esc(f.what) + '</p></div>';
        }).join('') + '</div>';
    }

    if (d.mistakes && d.mistakes.length) {
      out += '<h4 class="deeper-h">Where people lose marks</h4><div class="deeper-list">' +
        d.mistakes.map(function (m) {
          return '<div class="deeper-mistake">' +
            '<p class="dm-wrong"><span>✗</span>' + esc(m.wrong) + '</p>' +
            '<p class="dm-right"><span>✓</span>' + esc(m.right) + '</p></div>';
        }).join('') + '</div>';
    }

    if (d.deeper && d.deeper.length) {
      out += '<h4 class="deeper-h">A step past the lesson</h4><div class="deeper-list">' +
        d.deeper.map(function (x) {
          return '<div class="deeper-item"><p class="di-t">' + esc(x.t) + '</p>' +
            '<p class="di-b">' + esc(x.b) + '</p></div>';
        }).join('') + '</div>';
    }

    if (d.links && d.links.length) {
      out += '<h4 class="deeper-h">Joins up with</h4><div class="deeper-links">' +
        d.links.map(function (l) {
          return '<button type="button" class="deeper-link" data-goto-topic="' + esc(l.id) + '">' +
            '<b>' + esc(topicName(l.id)) + '</b><span>' + esc(l.why) + '</span></button>';
        }).join('') + '</div>';
    }

    return out;
  }

  function showDeeper() {
    var d = window.DETAIL && window.DETAIL[S.board.topic.id];
    var box = $('deeper');
    if (!d) { box.hidden = true; return; }
    box.hidden = false;
    $('deeper-body').innerHTML = deeperHtml(d);
    $('deeper-body').querySelectorAll('[data-goto-topic]').forEach(function (b) {
      b.addEventListener('click', function () {
        chooseTopic(b.dataset.gotoTopic);
        goTo($('step3'));
        markStep(3);
        toast('Switched to ' + topicName(b.dataset.gotoTopic));
      });
    });
  }

  $('deeper-toggle').addEventListener('click', function () {
    var body = $('deeper-body');
    var open = body.hidden;
    body.hidden = !open;
    this.setAttribute('aria-expanded', String(open));
    this.textContent = open ? 'Hide it again' : 'Show me';
    if (open) { goTo($('deeper')); say('Showing the deeper notes.'); }
  });

  /* ── the quick check ───────────────────────────────────
     Questions come from two places: the library's own three, and — when the photo gave us
     something clean enough — fill-the-gap questions built out of the student's own board. */

  function looksClean(sentence) {
    var letters = (sentence.match(/[a-zA-Z]/g) || []).length;
    if (letters / sentence.length < 0.72) return false;           /* mostly OCR noise */
    if (/[^\w\s.,'()\-+=°%:;\/₂₄₆]/.test(sentence)) return false;
    return !/\b[b-df-hj-np-tv-z]{5,}\b/i.test(sentence);          /* mangled words */
  }

  function boardQuestions(topic, limit) {
    var raw = S.ocrText || '';
    if (raw.replace(/\s+/g, ' ').trim().length < 25) return [];

    /* A whiteboard rarely has full stops, so each written LINE counts as a sentence.
       Keep the line breaks and split on those first, then on any punctuation. */
    var lines = raw.split(/[\n.!?;]+/).map(function (x) {
      return x.replace(/\s+/g, ' ').trim();
    });

    /* the key words this topic teaches, longest first so the specific ones win */
    var titleWords = ' ' + topic.title.toLowerCase() + ' ';
    var terms = topic.scenes.map(function (sc, i) {
      return { word: sc.term.w.replace(/\s*\(.*\)/, ''), scene: i, term: sc.term };
    }).filter(function (t) {
      if (t.word.length < 4) return false;
      if (/^(Big idea|Product|Reactant|Gradient|Open system)$/.test(t.word)) return false;
      return titleWords.indexOf(' ' + t.word.toLowerCase() + ' ') === -1;   /* not the topic's own name */
    });
    terms.sort(function (a, b) { return b.word.length - a.word.length; });

    var out = [], used = {};
    lines.forEach(function (sentence) {
      if (out.length >= limit) return;
      var n = sentence ? sentence.split(/\s+/).length : 0;
      if (n < 5 || n > 16 || !looksClean(sentence)) return;

      for (var i = 0; i < terms.length; i++) {
        var t = terms[i];
        if (used[t.word]) continue;
        var safe = t.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        var re = new RegExp('\\b' + safe + '\\b', 'i');
        var at = sentence.search(re);
        if (at < 1) continue;                       /* skip if absent, or the very first word */

        var others = terms.filter(function (x) {
          return x.word !== t.word &&
            !new RegExp('\\b' + x.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i').test(sentence);
        });
        if (others.length < 2) continue;

        var opts = [t.word, others[Math.floor(others.length / 3)].word, others[others.length - 1].word];
        var shift = (t.scene + sentence.length) % 3;        /* stable, and not always first */
        for (var k = 0; k < shift; k++) opts.push(opts.shift());

        used[t.word] = true;
        out.push({
          q: 'From your own board: "' + sentence.replace(re, '______') + '"',
          a: opts, c: opts.indexOf(t.word), source: 'board', teach: t.scene,
          why: t.term.w + ' — ' + t.term.d
        });
        break;
      }
    });
    return out;
  }

  /* ── new questions about the idea you missed ─────────
     Not the same question again: three different ways of asking about the same page, built
     from the page's own key word and text. Everything here comes from checked library data,
     so a generated question cannot be wrong. */

  var VAGUE_TERM = /^(Big idea|Product|Reactant|Gradient|Open system|Reservoir|Energy source)$/;

  /* two distractors from other pages, never repeating the right answer */
  function distractors(pool, right, seed) {
    var out = [];
    for (var k = 0; k < pool.length && out.length < 2; k++) {
      var pick = pool[(seed + k * 3 + 1) % pool.length];
      if (pick && pick !== right && out.indexOf(pick) < 0) out.push(pick);
    }
    return out;
  }

  /* put the right answer in a different slot each time */
  function spin(right, wrong, seed) {
    var opts = [right, wrong[0], wrong[1]];
    for (var k = 0; k < seed % 3; k++) opts.push(opts.shift());
    return { a: opts, c: opts.indexOf(right) };
  }

  function practiceFor(topic, sceneIndex, want) {
    var sc = topic.scenes[sceneIndex];
    if (!sc) return [];
    var others = topic.scenes.filter(function (x, i) { return i !== sceneIndex && !VAGUE_TERM.test(x.term.w); });
    var word = sc.term.w.replace(/\s*\(.*\)/, '');
    var out = [];
    var tag = function (q) { q.source = 'practice'; q.teach = sceneIndex; return q; };

    if (!VAGUE_TERM.test(sc.term.w) && others.length >= 2) {
      /* 1 — definition, pick the word */
      var w1 = distractors(others.map(function (x) { return x.term.w.replace(/\s*\(.*\)/, ''); }), word, sceneIndex);
      if (w1.length === 2) {
        var o1 = spin(word, w1, sceneIndex);
        out.push(tag({
          q: 'Which word means this? "' + sc.term.d + '"',
          a: o1.a, c: o1.c,
          why: word + ' — ' + sc.term.d
        }));
      }

      /* 2 — word, pick the meaning */
      var w2 = distractors(others.map(function (x) { return x.term.d; }), sc.term.d, sceneIndex + 1);
      if (w2.length === 2 && out.length < want) {
        var o2 = spin(sc.term.d, w2, sceneIndex + 1);
        out.push(tag({
          q: 'What does ' + word + ' mean?',
          a: o2.a, c: o2.c,
          why: 'From the page "' + sc.t + '".'
        }));
      }
    }

    /* 3b — pages whose key word is a generic label ("Big idea") get asked about the point
       of the page instead, so every page can still be practised */
    if (!out.length && others.length >= 2) {
      var wv = distractors(others.map(function (x) { return x.term.d; }), sc.term.d, sceneIndex + 4);
      if (wv.length === 2) {
        var ov = spin(sc.term.d, wv, sceneIndex + 4);
        out.push(tag({
          q: 'What is the main point of "' + sc.t + '"?',
          a: ov.a, c: ov.c,
          why: sc.t + ' — ' + sc.term.d
        }));
      }
    }

    /* 3 — fill the gap in the page's own sentence */
    if (out.length < want) {
      var text = bodyFor(sc);
      var re = new RegExp('\\b' + word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i');
      var sentence = text.split(/(?:\.\s+)/).filter(function (x) { return re.test(x); })[0];
      if (sentence && others.length >= 2) {
        var w3 = distractors(others.map(function (x) { return x.term.w.replace(/\s*\(.*\)/, ''); }), word, sceneIndex + 2);
        if (w3.length === 2) {
          var o3 = spin(word, w3, sceneIndex + 2);
          out.push(tag({
            q: 'Fill the gap: "' + sentence.trim().replace(re, '______') + '"',
            a: o3.a, c: o3.c,
            why: word + ' — ' + sc.term.d
          }));
        }
      }
    }

    return out.slice(0, want);
  }

  /* Build the practice round: new questions per idea missed, then the original one last
     so the student gets to prove they have it. */
  function practiceRound(missed) {
    var topic = S.board.topic;
    var seen = {}, out = [];
    missed.forEach(function (q) {
      if (seen[q.teach]) return;
      seen[q.teach] = true;
      out = out.concat(practiceFor(topic, q.teach, missed.length > 2 ? 1 : 2));
    });
    missed.forEach(function (q) { out.push(q); });
    return out.slice(0, 8);
  }

  /* Which page of the lesson answers this question? The key word carries the most weight —
     especially when it IS the right answer — because long page text would otherwise win
     on sheer word count. */
  function teachIndexFor(q, topic) {
    if (typeof q.teach === 'number') return q.teach;
    var flat = function (x) {
      return ' ' + String(x).toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ') + ' ';
    };
    var hay = flat(q.q + ' ' + q.a[q.c] + ' ' + q.why);
    var answer = flat(q.a[q.c]);

    var best = 0, bestScore = -1;
    topic.scenes.forEach(function (sc, i) {
      var term = flat(sc.term.w.replace(/\s*\(.*\)/, '')).trim();
      var score = 0;
      if (term.length > 3) {
        if (answer.indexOf(' ' + term) > -1) score += 10;      /* the key word is the answer */
        else if (hay.indexOf(' ' + term) > -1) score += 5;      /* mentioned somewhere */
      }
      (sc.t.toLowerCase().match(/[a-z]{5,}/g) || []).forEach(function (w) {
        if (hay.indexOf(' ' + w) > -1) score += 2;
      });
      var body = sc.b.toLowerCase().match(/[a-z]{6,}/g) || [];
      var seen = {}, hits = 0;
      body.forEach(function (w) { if (!seen[w] && hay.indexOf(' ' + w) > -1) { seen[w] = 1; hits++; } });
      score += (hits / Math.max(8, body.length)) * 3;           /* small, normalised nudge */

      if (score > bestScore) { bestScore = score; best = i; }
    });
    return best;
  }

  var PER_ROUND = 3;   /* three to start with. "Dig deeper" opens up all ten. */

  function buildQuiz(only) {
    var topic = S.board.topic;
    if (only && only.length) {
      S.questions = only;
    } else {
      /* walk through the bank so a second go asks the questions you have not seen yet */
      var bank = topic.quiz;
      var take = S.deep ? bank.length : Math.min(PER_ROUND, bank.length);
      var start = (S.round * take) % bank.length;
      var picked = [];
      for (var i = 0; i < take; i++) {
        var q = bank[(start + i) % bank.length];
        picked.push({ q: q.q, a: q.a, c: q.c, why: q.why, source: 'library', teach: teachIndexFor(q, topic) });
      }
      var extra = GRADES[S.grade].cloze ? boardQuestions(topic, S.grade === 'high' ? 2 : 1) : [];
      S.questions = picked.concat(extra);
      S.round++;
    }

    var fromBoard = S.questions.filter(function (q) { return q.source === 'board'; }).length;
    var lib = S.questions.length - fromBoard;
    $('quiz-h').textContent = 'Quick check — ' + S.questions.length + ' question' + (S.questions.length > 1 ? 's' : '');
    var photoBit = fromBoard ? ', plus ' + fromBoard + ' built out of the words on your own photo' : '';
    var practice = S.questions.filter(function (q) { return q.source === 'practice'; }).length;
    $('quiz-sub').textContent = only && only.length
      ? (practice
        ? practice + ' new question' + (practice > 1 ? 's' : '') + ' about the ideas you missed, then the original one again.'
        : 'Just the ones you missed. Same questions, second go.')
      : (S.deep
        ? 'All ' + lib + ' questions in this topic' + photoBit + '. This is the full set.'
        : lib + ' of the ' + topic.quiz.length + ' questions in this topic' + photoBit +
          '. Ask again for different ones, or dig deeper for all ' + topic.quiz.length + '.');
    $('quiz-deeper').hidden = !!(only && only.length) || S.deep;
    $('quiz-reset').textContent = S.deep ? 'Back to three questions' : 'Ask me different questions';

    $('quiz-form').innerHTML = S.questions.map(function (q, qi) {
      return '<fieldset class="q"><legend class="q-text">' + (qi + 1) + '. ' + esc(q.q) +
        (q.source === 'board' ? '<span class="q-tag">from your photo</span>' : '') +
        (q.source === 'practice' ? '<span class="q-tag is-practice">practice</span>' : '') + '</legend>' +
        '<div class="q-opts">' + q.a.map(function (a, ai) {
          return '<label class="q-opt" data-q="' + qi + '" data-a="' + ai + '">' +
            '<input type="radio" name="q' + qi + '" value="' + ai + '"> <span>' + esc(a) + '</span></label>';
        }).join('') + '</div><p class="q-why" data-why="' + qi + '" hidden></p></fieldset>';
    }).join('');

    $('quiz-score').textContent = '';
    $('quiz-reset').hidden = true;
    $('quiz-check').disabled = false;
    $('missed').hidden = true;
    $('missed-list').innerHTML = '';
  }

  $('quiz-check').addEventListener('click', function () {
    var qs = S.questions, score = 0, answered = 0, missed = [];
    qs.forEach(function (q, qi) {
      var picked = $('quiz-form').querySelector('input[name="q' + qi + '"]:checked');
      if (picked) answered++;
      $('quiz-form').querySelectorAll('[data-q="' + qi + '"]').forEach(function (lab) {
        var ai = Number(lab.dataset.a);
        lab.classList.remove('is-right', 'is-wrong');
        if (ai === q.c) lab.classList.add('is-right');
        else if (picked && Number(picked.value) === ai) lab.classList.add('is-wrong');
      });
      var why = $('quiz-form').querySelector('[data-why="' + qi + '"]');
      why.hidden = false;
      why.textContent = q.why;
      if (picked && Number(picked.value) === q.c) score++;
      else if (picked) missed.push(q);
    });

    if (!answered) {
      $('quiz-score').textContent = 'Pick an answer for at least one question first — the right answers are shown above now anyway.';
    } else {
      $('quiz-score').textContent = score + ' out of ' + qs.length +
        (score === qs.length ? ' — you have got this.'
          : score === 0 ? ' — nothing lost. The fix is right below.'
            : ' — nearly. The ones you missed are below.');
    }
    showMissed(missed);
    $('quiz-reset').hidden = false;
    $('quiz-check').disabled = true;
    say($('quiz-score').textContent);
  });

  /* ── helping with what you got wrong ─────────────────
     Every question knows which page of the lesson answers it, so a wrong answer turns
     into that exact page, read out loud if you want, and then the same question again. */
  function showMissed(missed) {
    var panel = $('missed');
    S.missed = missed;
    if (!missed.length) { panel.hidden = true; return; }
    var topic = S.board.topic;

    $('missed-list').innerHTML = missed.map(function (q, i) {
      var sc = topic.scenes[q.teach];
      return '<div class="missed-item">' +
        '<div class="missed-art">' + window.ART.render(sc.art, sc.labels) + '</div>' +
        '<div>' +
        '<p class="missed-q">You missed: ' + esc(q.q.length > 90 ? q.q.slice(0, 90) + '…' : q.q) + '</p>' +
        '<p class="missed-title">' + esc(sc.t) + '</p>' +
        '<p class="missed-body">' + esc(bodyFor(sc)) + '</p>' +
        '<p class="missed-term"><b>' + esc(sc.term.w) + '</b> — ' + esc(sc.term.d) + '</p>' +
        '<div class="missed-actions">' +
        '<button type="button" class="btn btn-quiet" data-read="' + i + '">🔊 Read this to me</button>' +
        '<button type="button" class="btn btn-quiet" data-goto="' + q.teach + '">Show me this part</button>' +
        '</div></div></div>';
    }).join('');

    $('missed-list').querySelectorAll('[data-read]').forEach(function (b) {
      b.addEventListener('click', function () {
        var sc = topic.scenes[missed[Number(b.dataset.read)].teach];
        stopSpeech();
        speak(narrationFor(sc, true));
        toast('Reading it again');
      });
    });
    $('missed-list').querySelectorAll('[data-goto]').forEach(function (b) {
      b.addEventListener('click', function () { jumpToScene(Number(b.dataset.goto)); });
    });

    panel.hidden = false;
    $('retry-missed').textContent = missed.length === 1
      ? 'Give me new questions on this'
      : 'Give me new questions on these ' + missed.length;
  }

  /* find that part inside whatever the student is looking at, and go there */
  function jumpToScene(sceneIndex) {
    var title = S.board.topic.scenes[sceneIndex].t;
    var at = -1;
    S.board.items.forEach(function (x, i) { if (x.t === title && at < 0) at = i; });

    if (at < 0) {
      toast('That part is not in this length, but the notes above cover it');
      return;
    }
    if (S.board.format === 'book') {
      S.page = at;
      stopSpeech();
      renderPage();
      goTo($('book-view'));
      $('book-page').focus();
    } else {
      if (V.playing) pause();
      V.i = at; V.t = 0; V.spoken = -1;
      drawScene();
      updateBar();
      goTo($('video-view'));
    }
    say('Jumped to ' + title + '.');
  }

  $('retry-missed').addEventListener('click', function () {
    if (!S.missed || !S.missed.length) return;
    var set = practiceRound(S.missed.slice());
    buildQuiz(set);
    goTo($('quiz'));
    var fresh = set.filter(function (q) { return q.source === 'practice'; }).length;
    say(fresh ? fresh + ' new questions about what you missed.' : 'The same questions again.');
  });

  $('quiz-reset').addEventListener('click', function () {
    if (S.deep) { S.deep = false; S.round = 0; }
    buildQuiz();
    goTo($('quiz'));
    say(S.deep ? 'All ten questions.' : 'Here is a different set of questions.');
  });

  $('quiz-deeper').addEventListener('click', function () {
    S.deep = true;
    S.round = 0;
    buildQuiz();
    goTo($('quiz'));
    say('All ten questions for this topic.');
  });

  /* ── keeping it: print, download, copy ─────────────── */
  /* exports carry the teaching scenes only: the video's title and recap slides have no key word or drawing */
  function teachingItems() {
    return S.board.items.filter(function (x) { return x.kind !== 'title' && x.kind !== 'end'; });
  }

  var KIND_NAME = { book: 'picture book', video: 'video script', project: 'science project', report: 'report outline' };

  function plainText() {
    var b = S.board;
    if (b.format === 'project' || b.format === 'report') return docText();
    var head = b.topic.title + ' — ' + (b.format === 'book' ? 'picture book' : 'video script') +
      ' from ThepicScience\n' + b.topic.blurb + '\n\n';
    var body = teachingItems().map(function (it, i) {
      var label = b.format === 'book' ? 'PAGE ' + (i + 1) : 'SCENE ' + (i + 1) + ' (' + fmtTime(it.dur) + ')';
      return label + ' — ' + it.t + '\n' + it.b + '\nKey word: ' + it.term.w + ' — ' + it.term.d + '\n';
    }).join('\n');
    var d = window.DETAIL && window.DETAIL[b.topic.id];
    var deep = d ? '\nGO DEEPER\n' +
      d.formulas.map(function (f) { return f.f + '\n   ' + f.what; }).join('\n') + '\n\n' +
      'Where people lose marks:\n' +
      d.mistakes.map(function (m) { return '   Not: ' + m.wrong + '\n   Actually: ' + m.right; }).join('\n') + '\n\n' +
      'A step past the lesson:\n' +
      d.deeper.map(function (x) { return '   ' + x.t + ' — ' + x.b; }).join('\n') + '\n'
      : '';
    var ex = b.topic.example
      ? '\nWHERE YOU SEE THIS\n' + b.topic.example.t + '\n' + b.topic.example.b + '\n' + b.topic.example.spot + '\n'
      : '';
    var quiz = '\nQUICK CHECK\n' + b.topic.quiz.map(function (q, i) {
      return (i + 1) + '. ' + q.q + '\n   ' + q.a.map(function (a, ai) { return (ai === q.c ? '[x] ' : '[ ] ') + a; }).join('\n   ') +
        '\n   Why: ' + q.why;
    }).join('\n');
    return head + body + ex + deep + quiz + '\n';
  }

  function download(name, content, type) {
    var blob = new Blob([content], { type: type });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
  }

  $('ex-copy').addEventListener('click', function () {
    var text = plainText();
    var done = function () { toast('Copied — paste it into your notes'); say('Copied to the clipboard.'); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(fallbackCopy);
    } else fallbackCopy();

    function fallbackCopy() {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed'; ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      document.body.removeChild(ta);
      if (ok) done(); else toast('Copying is blocked here — use Download instead');
    }
  });

  /* a document exports as readable plain text, straight from what is on screen */
  function docText() {
    var el = $('doc').cloneNode(true);
    el.querySelectorAll('h3, h4').forEach(function (h) { h.textContent = '\n' + h.textContent.toUpperCase() + '\n'; });
    el.querySelectorAll('li').forEach(function (li) { li.textContent = '  - ' + li.textContent; });
    el.querySelectorAll('p, li, div').forEach(function (n) { n.textContent = n.textContent + '\n'; });
    return S.board.topic.title + ' — ' + KIND_NAME[S.board.format] + ' from ThepicScience\n\n' +
      el.textContent.replace(/\n{3,}/g, '\n\n').trim() + '\n';
  }

  $('ex-download').addEventListener('click', function () {
    var slug = S.board.topic.id;
    if (S.board.format === 'project' || S.board.format === 'report') {
      download('thepicscience-' + slug + '-' + S.board.format + '.txt', docText(), 'text/plain');
      toast('Downloaded your ' + S.board.format);
      say('Downloaded.');
      return;
    }
    if (S.board.format === 'book') {
      download('thepicscience-' + slug + '-book.html', bookHtml(), 'text/html');
      toast('Downloaded the book as an HTML file');
    } else {
      download('thepicscience-' + slug + '-script.txt', plainText(), 'text/plain');
      toast('Downloaded the video script');
    }
    say('Downloaded.');
  });

  function bookHtml() {
    var b = S.board;
    var list = teachingItems();
    var pages = list.map(function (it, i) {
      return '<article><div class="art">' + window.ART.render(it.art, it.labels) + '</div>' +
        '<p class="n">Page ' + (i + 1) + ' of ' + list.length + '</p><h2>' + esc(it.t) + '</h2>' +
        '<p>' + esc(it.b) + '</p><p class="term"><b>' + esc(it.term.w) + '</b> — ' + esc(it.term.d) + '</p></article>';
    }).join('');
    return '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">' +
      '<meta name="viewport" content="width=device-width,initial-scale=1">' +
      '<title>' + esc(b.topic.title) + ' — ThepicScience</title><style>' +
      ':root{--art-bg:#f0efe9;--art-ink:#22262b;--art-1:#0d6a5f;--art-2:#c9752a;--art-3:#3a5ba0;--art-4:#8a4b86;--art-5:#b0342a}' +
      'body{font:17px/1.6 ui-sans-serif,system-ui,sans-serif;max-width:44rem;margin:0 auto;padding:2rem 1.25rem;color:#16191d;background:#fbfaf7}' +
      'article{border:1px solid #e3e0d8;border-radius:14px;padding:1.5rem;margin-bottom:1.25rem;background:#fff;page-break-after:always}' +
      '.art{background:var(--art-bg);border-radius:9px;padding:1rem;margin-bottom:1rem}.art svg{width:100%;height:auto}' +
      '.n{font-size:.75rem;letter-spacing:.08em;text-transform:uppercase;color:#5a6470}' +
      'h2{margin:.3rem 0 .6rem}.term{background:#f4f2ed;border-left:3px solid #0d6a5f;padding:.7rem .9rem;border-radius:6px;font-size:.95rem}' +
      'h1{font-size:1.6rem}.lede{color:#4d5661}</style></head><body>' +
      '<h1>' + esc(b.topic.title) + '</h1><p class="lede">' + esc(b.topic.blurb) + '</p>' + pages +
      '<p class="lede">Made with ThepicScience.</p></body></html>';
  }

  $('ex-print').addEventListener('click', function () {
    var b = S.board;
    if (b.format === 'project' || b.format === 'report') {
      $('print-area').innerHTML = '<div class="p-doc">' + $('doc').innerHTML + '</div>';
      stopSpeech();
      toast('Opening the print window');
      setTimeout(function () { window.print(); }, 150);
      return;
    }
    $('print-area').innerHTML = '<div class="p-page"><h2>' + esc(b.topic.title) + '</h2><p>' + esc(b.topic.blurb) + '</p></div>' +
      teachingItems().map(function (it, i) {
        return '<div class="p-page"><div class="p-art">' + window.ART.render(it.art, it.labels) + '</div>' +
          '<h2>' + (i + 1) + '. ' + esc(it.t) + '</h2><p>' + esc(it.b) + '</p>' +
          '<p class="p-term"><b>' + esc(it.term.w) + '</b> — ' + esc(it.term.d) + '</p></div>';
      }).join('');
    stopSpeech();
    if (V.playing) pause();
    toast('Opening the print window');
    setTimeout(function () { window.print(); }, 150);
  });

  $('ex-restart').addEventListener('click', function () {
    stopSpeech();
    if (V.playing) pause();
    clearFile(true);
    S.topic = null; S.board = null; S.ocrText = ''; S.page = 0; S.unlocked = 1;
    S.boardTerms = []; S.boardOff = {}; S.questions = []; S.missed = []; S.round = 0; S.deep = false;
    $('board-terms').hidden = true;
    $('chosen').hidden = true;
    $('match-result').hidden = true;
    $('topic-search').value = '';
    $('book-view').hidden = true;
    $('video-view').hidden = true;
    $('doc-view').hidden = true;
    $('chase-view').hidden = true;
    if (window.CHASE) window.CHASE.stop();
    $('deeper').hidden = true;
    $('quiz').hidden = true;
    $('exports').hidden = true;
    renderTopics('');
    renderFindOnline();
    unlock(1);
    markStep(1);
    goTo($('step1'));
    toast('Cleared. Add a new picture.');
    say('Started over.');
  });

  /* ── stepper links ─────────────────────────────────── */
  document.querySelectorAll('.step-link').forEach(function (a) {
    a.addEventListener('click', function () { markStep(Number(a.dataset.step)); });
  });

  window.addEventListener('beforeunload', stopSpeech);

  /* ── boot ──────────────────────────────────────────── */
  renderTopics('');
  renderGradeButtons();
  var saved = readGrade();
  if (saved) setGrade(saved, false);
  unlock(1);
  updateGradeNote();
  updateMakeButton();
  renderFindOnline();
})();
