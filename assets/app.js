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
    file: null,          // the first one, which is what the preview shows
    files: [],           // every picture added, up to MAX_SHOTS
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
    sparks: 0,           // earned, never bought
    lifetime: 0,         // every spark ever earned, for the profile
    spent: 0,            // every spark ever spent, which is a different number
    mastered: null,      // topic id -> { question text: true } for the ones you got right
    tally: null,         // { escapes, duels, bestLevel } — what the earned titles are judged on
    chaseLevel: 1,       // which rung of the monster ladder you are on
    partyMode: '2v2',    // 1v1 | 2v2 | 3v3 | 4v4
    party: null,         // the lobby you are in
    watcher: null,       // the polling handle for an online party
    netReady: null,      // what the party server said when we asked
    bestTimes: null,     // level -> fastest escape in ms, on this device
    boardView: 'me',     // 'me' = your own bests, 'world' = everyone's
    chestOwed: 0,        // sparks waiting in an unopened chest
    chestWorld: null,    // which world dropped it
    profile: null,       // { name, worn: slot -> item id, items: 'slot:id' -> true }
    owned: {},           // pet id -> level
    pet: '',             // whichever one is helping right now
    seenTopics: {},      // topics already rewarded, so the bonus is once each
    hinted: {},          // question index -> true, one hint per question
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

  /* ── step 1: getting pictures in ─────────────
     A whiteboard rarely fits in one photo, so up to ten come in at once and are read one
     after another into a single piece of text. A video is different — frames are sampled
     out of it — so it arrives on its own rather than mixed in with stills. */

  var MAX_BYTES = 50 * 1024 * 1024;
  var MAX_SHOTS = 10;

  function fileError(msg) {
    var e = $('file-error');
    if (!msg) { e.hidden = true; e.textContent = ''; return; }
    e.hidden = false;
    e.textContent = msg;
    say(msg);
  }

  function checkFile(file) {
    var isImg = /^image\//.test(file.type);
    var isVid = /^video\//.test(file.type);
    if (!isImg && !isVid) {
      return 'One of those is ' + (file.type || 'an unknown type') +
        '. ThepicScience needs photos or a video \u2014 try a JPG, PNG or MP4.';
    }
    if (file.size > MAX_BYTES) {
      return '"' + file.name + '" is ' + (file.size / 1048576).toFixed(0) +
        ' MB, and the limit is 50 MB each. Try a photo instead of a long video.';
    }
    return '';
  }

  /* `add` keeps what is already there, which is what the Add more button wants */
  function handleFiles(list, add) {
    var incoming = Array.prototype.slice.call(list || []);
    if (!incoming.length) return;
    fileError('');

    var problems = [];
    incoming = incoming.filter(function (f) {
      var why = checkFile(f);
      if (why) { problems.push(why); return false; }
      return true;
    });
    if (!incoming.length) { fileError(problems[0] || 'Nothing there we can read.'); return; }

    var video = incoming.filter(function (f) { return /^video\//.test(f.type); })[0];
    if (video) {
      /* frames are sampled out of a video, so it stands on its own */
      clearFile(true);
      S.files = [video];
      S.kind = 'video';
      if (incoming.length > 1) problems.push('A video is read on its own, so the other files were left out.');
    } else {
      var kept = (add && S.kind === 'image' ? S.files : []).concat(
        incoming.filter(function (f) { return /^image\//.test(f.type); })
      );
      if (kept.length > MAX_SHOTS) {
        problems.push('Ten pictures is the limit, so the last ' + (kept.length - MAX_SHOTS) + ' were left out.');
        kept = kept.slice(0, MAX_SHOTS);
      }
      if (!add || S.kind !== 'image') clearFile(true);
      S.files = kept;
      S.kind = 'image';
    }

    S.file = S.files[0];
    if (S.previewUrl) URL.revokeObjectURL(S.previewUrl);
    S.previewUrl = URL.createObjectURL(S.file);
    if (problems.length) fileError(problems[0]);
    paintPreview();
  }

  function paintPreview() {
    var isImg = S.kind === 'image';
    var n = S.files.length;
    var total = S.files.reduce(function (a, f) { return a + f.size; }, 0);

    $('preview-media').innerHTML = isImg
      ? '<img src="' + S.previewUrl + '" alt="The picture you added">'
      : '<video src="' + S.previewUrl + '" muted playsinline controls></video>';

    $('preview-name').textContent = n > 1 ? n + ' pictures' : S.file.name;
    $('preview-sub').textContent = (isImg ? (n > 1 ? n + ' photos' : 'Photo') : 'Video') +
      ' \u00b7 ' + (total / 1048576).toFixed(1) + ' MB \u00b7 stays on your device';
    $('preview').hidden = false;
    $('add-more').hidden = !isImg || n >= MAX_SHOTS;

    /* the strip, so you can see what is going in and drop any that came out blurred */
    var strip = $('shot-strip');
    strip.hidden = !(isImg && n > 1);
    strip.innerHTML = !strip.hidden ? S.files.map(function (f, i) {
      return '<li class="shot"><img src="' + URL.createObjectURL(f) + '" alt="Picture ' + (i + 1) + '">' +
        '<span class="shot-n">' + (i + 1) + '</span>' +
        '<button type="button" class="shot-x" data-drop-shot="' + i +
        '" aria-label="Remove picture ' + (i + 1) + '">\u00d7</button></li>';
    }).join('') : '';
    strip.querySelectorAll('[data-drop-shot]').forEach(function (b) {
      b.addEventListener('click', function () {
        S.files.splice(Number(b.dataset.dropShot), 1);
        if (!S.files.length) { clearFile(false); return; }
        S.file = S.files[0];
        if (S.previewUrl) URL.revokeObjectURL(S.previewUrl);
        S.previewUrl = URL.createObjectURL(S.file);
        paintPreview();
      });
    });

    $('scan-btn').disabled = false;
    $('scan-btn').textContent = isImg
      ? (n > 1 ? 'Read these ' + n + ' pictures' : 'Read this picture')
      : 'Read this video';
    say('Added ' + (n > 1 ? n + ' pictures' : S.file.name) + '. Now choose Read.');
    $('scan-btn').focus();
  }

  function clearFile(quiet) {
    if (S.previewUrl) URL.revokeObjectURL(S.previewUrl);
    S.file = null; S.files = []; S.kind = null; S.previewUrl = null;
    S.imageForOcr = null; S.shots = null;
    $('preview').hidden = true;
    $('preview-media').innerHTML = '';
    $('shot-strip').hidden = true;
    $('shot-strip').innerHTML = '';
    $('file-input').value = '';
    $('camera-input').value = '';
    if (!quiet) { fileError(''); say('Pictures removed.'); }
  }

  $('pick-file').addEventListener('click', function (e) { e.stopPropagation(); $('file-input').click(); });
  $('pick-camera').addEventListener('click', function (e) { e.stopPropagation(); $('camera-input').click(); });
  $('file-input').addEventListener('change', function () { handleFiles(this.files, this.dataset.add === '1'); this.dataset.add = ''; });
  $('camera-input').addEventListener('change', function () { handleFiles(this.files, true); });
  $('remove-file').addEventListener('click', function () { clearFile(false); });
  $('add-more').addEventListener('click', function (e) {
    e.stopPropagation();
    $('file-input').dataset.add = '1';
    $('file-input').click();
  });

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
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) {
      handleFiles(e.dataTransfer.files, false);
    }
  });
  document.addEventListener('paste', function (e) {
    if (!e.clipboardData) return;
    var items = e.clipboardData.files;
    if (items && items.length) {
      handleFiles(items, true);      /* pasting one after another builds up a set */
      toast(items.length > 1 ? 'Pasted ' + items.length + ' pictures' : 'Pasted your picture');
    }
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
    say(S.files.length > 1
      ? 'Reading your ' + S.files.length + ' pictures. This can take a few seconds.'
      : 'Reading your picture. This can take a few seconds.');

    var prep = S.kind === 'video'
      ? grabVideoFrames(S.previewUrl, 3)
      : Promise.all(S.files.map(function (f) {
          var u = URL.createObjectURL(f);
          return shrinkImage(u, 1600).then(function (shot) {
            URL.revokeObjectURL(u);
            return shot;
          });
        }));

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
          if (shots.length > 1) {
            scanProgress(35 + (n / shots.length) * 55,
              'Reading ' + (S.kind === 'video' ? 'frame ' : 'picture ') + (n + 1) +
              ' of ' + shots.length + '\u2026');
          }
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
  /* The search box used to be a plain substring test, which had two problems once the
     library passed twenty topics. Typing two words found nothing unless that exact phrase
     appeared somewhere, and a word two topics share went to whichever came first in the
     file — "transpiration" landed on the water cycle rather than the topic about it.

     So: every word in the query has to match somewhere, and the results are ranked. A
     keyword that is exactly what you typed beats one that merely contains it, which beats
     a passing mention in a blurb. */

  function topicScore(t, words, whole) {
    var title = t.title.toLowerCase();
    var subject = t.subject.toLowerCase();
    var blurb = t.blurb.toLowerCase();
    var total = 0;

    /* Typing a whole keyword should beat a topic that merely has both words about it.
       “nervous system” is a keyword of the nervous system topic; body systems only
       happens to contain the word system in its title. */
    for (var e = 0; e < t.keywords.length; e++) {
      if (t.keywords[e] === whole) { total += 150; break; }
    }

    for (var i = 0; i < words.length; i++) {
      var w = words[i];
      var best = 0, hits = 0;
      for (var k = 0; k < t.keywords.length; k++) {
        var key = t.keywords[k];
        if (key.indexOf(w) > -1) hits++;
        if (key === w) best = Math.max(best, 100);
        else if (key.indexOf(w) === 0) best = Math.max(best, 40);
        else if (key.indexOf(w) > -1) best = Math.max(best, 18);
      }
      /* Two topics can both own a word outright — the water cycle and plant transport
         both list transpiration. The one that lists it several ways, including the common
         misspelling, is the one the word is really about. */
      if (hits > 1) best += Math.min(9, (hits - 1) * 3);
      if (title.indexOf(w) > -1) best = Math.max(best, 60);
      if (subject.indexOf(w) > -1) best = Math.max(best, 8);
      if (blurb.indexOf(w) > -1) best = Math.max(best, 6);
      if (!best) return 0;              /* every word has to land somewhere */
      total += best;
    }
    return total;
  }

  function renderTopics(filter) {
    var q = (filter || '').trim().toLowerCase();
    var words = q ? q.split(/\s+/).filter(Boolean) : [];
    var list = window.TOPICS;
    if (words.length) {
      list = window.TOPICS.map(function (t) { return { t: t, n: topicScore(t, words, q) }; })
        .filter(function (x) { return x.n > 0; })
        .sort(function (a, b) { return b.n - a.n; })
        .map(function (x) { return x.t; });
    }

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
    chase: 'Start running', duel: 'Set up the duel'
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
    } else if (S.format === 'duel') {
      $('make-sub').textContent = 'Two players, one device, questions about ' + name + '.';
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
    $('duel-view').hidden = true;
    if (window.CHASE) window.CHASE.stop();
    if (window.DUEL) window.DUEL.stop();
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
      else if (S.board.format === 'duel') showDuel();
      else showDoc();
      buildQuiz();
      showDeeper();
      if (!S.seenTopics[S.board.topic.id]) {
        S.seenTopics[S.board.topic.id] = true;
        earn(window.PETS.earn.newTopic, 'a new topic: ' + S.board.topic.title.toLowerCase());
      }
      var isGame = S.board.format === 'chase' || S.board.format === 'duel';
      $('quiz').hidden = isGame;
      $('exports').hidden = isGame;
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
    S.finishedBook = false;
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
    if (d > 0 && S.page === n - 1 && !S.finishedBook) {
      S.finishedBook = true;
      earn(window.PETS.earn.finishedLesson, 'reading to the last page');
    }
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
    back.classList.remove('is-out', 'push-left', 'push-right');
    back.classList.add(V.i % 2 ? 'push-left' : 'push-right');
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
    earn(window.PETS.earn.finishedLesson, 'watching it to the end');
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

  /* How much work a question is, before you know any science: how many words you have to
     read, plus how deep into the topic it sits. The chase sorts on this so a run opens with
     something you can take in at a glance and ends with the long ones. */
  function askWeight(q, topic) {
    var words = (q.q + ' ' + q.a.join(' ')).trim().split(/\s+/).length;
    var sc = topic.scenes[typeof q.teach === 'number' ? q.teach : 0];
    var tier = sc ? sc.tier : 2;
    /* words lead, because "can I read this in one glance" is what makes the opening of a
       run feel fair; the tier only breaks ties between questions of similar length */
    return words + (tier - 1) * 4;
  }

  function chaseQuestions(topic) {
    var pool = topic.quiz.map(function (q) {
      return { q: q.q, a: q.a, c: q.c, why: q.why, teach: teachIndexFor(q, topic), source: 'library' };
    });
    /* top it up with generated ones so a long run never repeats itself */
    topic.scenes.forEach(function (sc, i) {
      pool = pool.concat(practiceFor(topic, i, 1));
    });
    if (GRADES[S.grade].cloze) pool = pool.concat(boardQuestions(topic, 2));
    pool.forEach(function (q) { q.weight = askWeight(q, topic); });
    return pool;
  }

  /* ── the monster ladder ─────────────────────
     Level 1 is the slime, level 2 the alien, level 3 the backrooms, then round again a
     little faster. Get out alive and a chest pays the bounty for that world: 10, 30 or 50.
     The level you reached is remembered, so you carry on where you stopped. */

  function chestArt(world, open) {
    var lid = open
      ? '<path d="M8 26 L50 14 L92 26 L92 34 L8 34 Z" transform="rotate(-18 14 30)"/>'
      : '<path d="M8 34 q 42 -22 84 0 v6 H8 Z"/>';
    return '<svg viewBox="0 0 100 72" role="img" aria-hidden="true" class="chest-svg' +
      (open ? ' is-open' : '') + '">' +
      '<g fill="' + world.door.glow + '" stroke="#3a2a10" stroke-width="3" stroke-linejoin="round">' +
      lid +
      '<rect x="8" y="34" width="84" height="30" rx="4"/>' +
      '</g>' +
      '<rect x="44" y="36" width="12" height="16" rx="2" fill="#3a2a10"/>' +
      '<circle cx="50" cy="44" r="2.6" fill="' + world.door.face + '"/>' +
      (open ? '<g class="chest-spark" fill="#ffd45e">' +
        '<circle cx="26" cy="16" r="3"/><circle cx="50" cy="8" r="4"/><circle cx="74" cy="18" r="3"/>' +
        '</g>' : '') +
      '</svg>';
  }

  function renderChaseLevel() {
    var lv = S.chaseLevel;
    var w = window.WORLDS.forLevel(lv);
    var lap = Math.floor((lv - 1) / window.WORLDS.count);
    $('chase-level').innerHTML =
      '<span class="lv-num">Level ' + lv + '</span>' +
      '<span class="lv-world is-' + w.id + '">' + esc(w.name) + '</span>' +
      '<span class="lv-mon">' + esc(w.monster) + '</span>' +
      '<span class="lv-chest">chest ' + w.bounty + ' ' + BOLT_CHAR + '</span>' +
      (lap ? '<span class="lv-lap">lap ' + (lap + 1) + ', faster</span>' : '');
    $('chase-level').title = w.blurb;
  }

  function showChase(level) {
    if (typeof level === 'number') S.chaseLevel = Math.max(1, level);
    $('chase-view').hidden = false;
    $('chase-chest').hidden = true;
    $('chase-next').hidden = true;
    $('chase-restart').hidden = S.chaseLevel <= 1;
    renderChaseLevel();
    checkScores();
    if (S.boardView === 'world') loadBoard(S.chaseLevel);

    var w = window.WORLDS.forLevel(S.chaseLevel);
    $('step4-sub').textContent = 'Level ' + S.chaseLevel + ': ' + w.blurb +
      ' Answer fast and you outrun it. Get out and the chest pays ' + w.bounty + ' sparks.';

    var el = {
      wrap: $('chase-wrap'), canvas: $('chase-canvas'),
      bar: $('chase-bar'), dist: $('chase-dist'), gap: $('chase-gap'), clock: $('chase-clock'),
      play: $('chase-play'), q: $('chase-q'), opts: $('chase-opts'), feedback: $('chase-feedback'),
      over: $('chase-over'), overTitle: $('chase-over-title'), overSub: $('chase-over-sub')
    };

    window.CHASE.start({
      el: el,
      questions: chaseQuestions(S.board.topic),
      reduced: reduceMotion,
      calm: $('chase-calm').checked,
      level: S.chaseLevel,
      onEnd: function (result) {
        /* the per-question sparks are paid straight away; the escape bounty waits in the
           chest, because opening it yourself is the reward */
        var prize = result.right * window.PETS.earn.rightAnswer;
        if (prize) earn(prize, 'the questions you got right');

        if (result.escaped) {
          S.tally.escapes++;
          S.chestOwed = result.bounty;
          S.chestWorld = result.world;
          recordTime(result);
          saveProfile();
          offerChest(result);
        } else {
          S.chestOwed = 0;
          $('chase-chest').hidden = true;
          $('chase-next').hidden = true;
        }
        grantEarnedTitles(true);
        S.missed = result.wrong.filter(function (q) { return typeof q.teach === 'number'; });
        $('chase-learn').hidden = !S.missed.length;
        say(result.escaped
          ? result.world.beat + ' There is a chest to open.'
          : result.world.lost);
      }
    });
    say('Level ' + S.chaseLevel + '. ' + w.monster + ' is chasing you. Answer the question to run faster.');
  }

  /* ── the speed-run board ────────────────────
     Your own best per level is kept on this device and always works. The shared board
     needs the score server, so it is only offered when there is one and it is durable —
     a leaderboard that forgets itself every few minutes is worse than none. */

  function fmtMs(ms) {
    var s = ms / 1000;
    var m = Math.floor(s / 60);
    return m + ':' + ((s - m * 60) < 10 ? '0' : '') + (s - m * 60).toFixed(1);
  }

  function recordTime(result) {
    var lv = String(result.level);
    var prev = S.bestTimes[lv];
    var best = !prev || result.ms < prev;
    if (best) S.bestTimes[lv] = result.ms;
    S.lastRun = {
      level: result.level, ms: result.ms, right: result.right,
      asked: result.asked, world: result.world.id, goal: result.world.tune.goal, best: best
    };
    if (best) toast('New best on level ' + result.level + ': ' + fmtMs(result.ms));
    submitTime(S.lastRun);
  }

  function submitTime(run) {
    if (!S.scoresReady || !S.scoresReady.durable) { renderBoard(); return; }
    fetch('/api/scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        level: run.level, ms: run.ms, right: run.right, asked: run.asked,
        world: run.world, goal: run.goal, name: displayName()
      })
    }).then(function (r) { return r.json(); }).then(function (j) {
      S.boardRows = j.rows || [];
      if (j.kept && j.place) toast('Number ' + j.place + ' in the world on level ' + run.level);
      renderBoard();
    }).catch(function () { renderBoard(); });
  }

  function checkScores() {
    if (S.scoresReady) { renderBoard(); return; }
    fetch('/api/scores?level=1').then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        S.scoresReady = j ? { online: true, durable: !!j.durable } : { online: false, durable: false };
        renderBoard();
      })
      .catch(function () {
        S.scoresReady = { online: false, durable: false };
        renderBoard();
      });
  }

  function loadBoard(level) {
    if (!S.scoresReady || !S.scoresReady.durable) return;
    fetch('/api/scores?level=' + level).then(function (r) { return r.json(); })
      .then(function (j) { S.boardRows = j.rows || []; renderBoard(); })
      .catch(function () {});
  }

  function renderBoard() {
    var global = S.scoresReady && S.scoresReady.durable;
    $('board-tabs').innerHTML =
      '<button type="button" class="slot-tab" role="tab" data-board="me" aria-selected="' +
      (S.boardView === 'me') + '">Your bests</button>' +
      (global
        ? '<button type="button" class="slot-tab" role="tab" data-board="world" aria-selected="' +
          (S.boardView === 'world') + '">Everyone, level ' + S.chaseLevel + '</button>'
        : '');
    $('board-tabs').querySelectorAll('[data-board]').forEach(function (b) {
      b.addEventListener('click', function () {
        S.boardView = b.dataset.board;
        if (S.boardView === 'world') loadBoard(S.chaseLevel);
        renderBoard();
      });
    });

    if (!global && S.boardView === 'world') S.boardView = 'me';

    if (S.boardView === 'me') {
      var levels = Object.keys(S.bestTimes).map(Number).sort(function (a, b) { return a - b; });
      $('board-sub').textContent = 'The quickest you have got out of each level, on this device.';
      $('board-list').innerHTML = levels.length
        ? levels.map(function (lv) {
            var w = window.WORLDS.forLevel(lv);
            return '<li' + (lv === S.chaseLevel ? ' class="is-here"' : '') + '>' +
              '<span class="board-rank">L' + lv + '</span>' +
              '<span class="board-name">' + esc(w.monster) + '</span>' +
              '<span class="board-time">' + fmtMs(S.bestTimes[lv]) + '</span></li>';
          }).join('')
        : '<li class="board-empty">No escapes yet. Get past one and your time lands here.</li>';
      $('board-note').textContent = global
        ? 'Your times are sent to the shared board too, under the name on your profile.'
        : (S.scoresReady && !S.scoresReady.online
          ? 'A shared board needs the score server, which this copy does not have.'
          : 'The shared board is switched off until the site has somewhere durable to keep it.');
      return;
    }

    var rows = S.boardRows || [];
    var w = window.WORLDS.forLevel(S.chaseLevel);
    $('board-sub').textContent = 'Level ' + S.chaseLevel + ' \u2014 ' + w.name + ', past ' + w.monster + '.';
    $('board-list').innerHTML = rows.length
      ? rows.map(function (r, i) {
          return '<li' + (r.name === displayName() ? ' class="is-me"' : '') + '>' +
            '<span class="board-rank">' + (i + 1) + '</span>' +
            '<span class="board-name">' + esc(r.name) + '</span>' +
            '<span class="board-right">' + r.right + ' right</span>' +
            '<span class="board-time">' + fmtMs(r.ms) + '</span></li>';
        }).join('')
      : '<li class="board-empty">Nobody has escaped this level yet. Be first.</li>';
    $('board-note').textContent = 'Fastest twenty. Names are whatever people typed on their own device.';
  }

  function offerChest(result) {
    var box = $('chase-chest');
    box.hidden = false;
    box.classList.remove('is-open');
    $('chest-art').innerHTML = chestArt(result.world, false);
    $('chest-label').textContent = 'Open the chest';
    $('chest-btn').disabled = false;
    $('chest-sub').textContent = result.world.monster + ' dropped it. It holds ' +
      result.bounty + ' sparks.';
  }

  $('chest-btn').addEventListener('click', function () {
    if (!S.chestOwed) return;
    var amount = S.chestOwed, world = S.chestWorld;
    S.chestOwed = 0;
    this.disabled = true;

    $('chase-chest').classList.add('is-open');
    $('chest-art').innerHTML = chestArt(world, true);
    $('chest-label').textContent = '+' + amount + ' ' + BOLT_CHAR;
    $('chest-sub').textContent = 'Straight into your sparks. Spend them on an egg or on how you look.';
    earn(amount, 'the ' + world.monster.toLowerCase() + ' chest');

    /* the next level is a different monster, so say which */
    var next = S.chaseLevel + 1;
    S.tally.bestLevel = Math.max(S.tally.bestLevel || 1, next);
    saveProfile();
    var nw = window.WORLDS.forLevel(next);
    var btn = $('chase-next');
    btn.hidden = false;
    btn.textContent = 'Level ' + next + ': ' + nw.monster + ' \u2192';
    btn.focus();
  });

  $('chase-next').addEventListener('click', function () { showChase(S.chaseLevel + 1); });
  $('chase-again').addEventListener('click', function () { showChase(S.chaseLevel); });
  $('chase-restart').addEventListener('click', function () { showChase(1); });

  $('chase-calm').addEventListener('change', function () {
    if (window.CHASE) window.CHASE.setCalm(this.checked);
    toast(this.checked ? 'Friendly monsters' : 'Back to scary');
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

  /* ── sparks and pets ───────────────────────────────────
     Sparks are earned by doing science. There is no way to buy them and nothing here touches
     real money. A pet's level decides how much of a hint it can give, and every hint is built
     from the same checked library data as the lesson, so a pet cannot invent an answer. */

  var BOLT_CHAR = '\u26a1';
  var SPARK_KEY = 'thepicscience.sparks';
  var PET_KEY = 'thepicscience.pets';
  var PROFILE_KEY = 'thepicscience.profile';

  function loadSparks() {
    try {
      var raw = window.localStorage.getItem(SPARK_KEY);
      S.sparks = Math.max(0, parseInt(raw, 10) || 0);
      var saved = JSON.parse(window.localStorage.getItem(PET_KEY) || 'null');
      if (saved && saved.owned) {
        S.owned = saved.owned;
        S.pet = saved.pet && saved.owned[saved.pet] ? saved.pet : '';
        S.seenTopics = saved.seenTopics || {};
      }
    } catch (e) { /* private mode: play on, just do not remember */ }
    var first = window.PETS.starter;
    if (!S.owned[first]) S.owned[first] = 1;        /* the starter is always yours */
    if (!S.pet || !S.owned[S.pet]) S.pet = first;
    loadProfile();
  }

  function loadProfile() {
    var p = null;
    try { p = JSON.parse(window.localStorage.getItem(PROFILE_KEY) || 'null'); } catch (e) {}
    S.profile = {
      name: (p && typeof p.name === 'string' ? p.name : '').slice(0, window.PROFILE.maxName),
      worn: (p && p.worn) || {},
      items: (p && p.items) || {}
    };
    S.lifetime = Math.max(S.sparks, (p && parseInt(p.lifetime, 10)) || 0);
    S.tally = {
      escapes: (p && parseInt(p.tally && p.tally.escapes, 10)) || 0,
      duels: (p && parseInt(p.tally && p.tally.duels, 10)) || 0,
      bestLevel: (p && parseInt(p.tally && p.tally.bestLevel, 10)) || 1
    };
    S.chaseLevel = Math.max(1, S.tally.bestLevel);
    S.bestTimes = (p && p.bestTimes) || {};
    S.spent = (p && parseInt(p.spent, 10)) || 0;
    S.mastered = (p && p.mastered) || {};
    /* the free starters are always yours, even if the save file predates them */
    window.PROFILE.freeKeys().forEach(function (k) { S.profile.items[k] = true; });
    window.PROFILE.slots.forEach(function (sl) {
      var id = S.profile.worn[sl.id];
      if (!id || !S.profile.items[window.PROFILE.key(sl.id, id)]) {
        S.profile.worn[sl.id] = window.PROFILE.defaults[sl.id];
      }
    });
  }

  function saveProfile() {
    try {
      window.localStorage.setItem(PROFILE_KEY, JSON.stringify({
        name: S.profile.name, worn: S.profile.worn,
        items: S.profile.items, lifetime: S.lifetime, tally: S.tally,
        bestTimes: S.bestTimes, spent: S.spent, mastered: S.mastered
      }));
    } catch (e) {}
  }

  function displayName() {
    return S.profile && S.profile.name ? S.profile.name : 'You';
  }

  function saveSparks() {
    try {
      window.localStorage.setItem(SPARK_KEY, String(S.sparks));
      window.localStorage.setItem(PET_KEY, JSON.stringify({
        owned: S.owned, pet: S.pet, seenTopics: S.seenTopics
      }));
    } catch (e) {}
  }

  /* Every spark leaving your total goes through here, so “I have money.” counts all of
     it — eggs, pet levels and cosmetics alike — and no new way to spend can forget to. */
  function spend(amount, what) {
    if (!amount || S.sparks < amount) return false;
    S.sparks -= amount;
    S.spent += amount;
    saveSparks();
    saveProfile();
    return true;
  }

  function earn(amount, reason) {
    if (!amount) return;
    S.sparks += amount;
    S.lifetime += amount;
    saveSparks();
    saveProfile();
    paintSparks(true);
    toast('+' + amount + ' sparks — ' + reason);
    say('Earned ' + amount + ' sparks for ' + reason + '. You now have ' + S.sparks + '.');
  }

  function paintSparks(pop) {
    $('spark-count').textContent = S.sparks;
    var chip = $('spark-chip');
    chip.setAttribute('aria-label', S.sparks + ' sparks earned');
    if (pop) {
      chip.classList.remove('is-pop');
      void chip.offsetWidth;
      chip.classList.add('is-pop');
    }
    renderShop();
    renderProfile();
  }

  function activePet() {
    var p = window.PETS.byId(S.pet) || window.PETS.byId(window.PETS.starter);
    return { def: p, level: S.owned[p.id] || 1 };
  }

  function renderActivePet() {
    var cur = activePet();
    var max = window.PETS.maxLevel;
    var r = window.PETS.rarity(cur.def.rarity);
    $('shop-active').hidden = false;
    $('active-pet-art').innerHTML = window.PETS.draw(cur.def.id, cur.level);
    $('active-pet-name').innerHTML = esc(cur.def.name) +
      ' <span class="pet-kind is-' + cur.def.rarity + '">' + esc(r.name) + '</span>' +
      ' <span class="pet-kind is-' + cur.def.type + '">' +
      (cur.def.type === 'attack' ? '⚔ attacker' : '🛡 defender') + '</span>';

    var pips = '';
    for (var i = 1; i <= max; i++) pips += '<span class="pip' + (i <= cur.level ? ' is-on' : '') + '"></span>';
    $('active-pet-level').innerHTML = pips + '<span class="pip-label">level ' + cur.level + ' of ' + max + '</span>';

    var n = window.PETS.rungs(cur.def, cur.level);
    $('active-pet-can').innerHTML = esc(cur.def.name + ' ' + window.PETS.ladder.slice(0, n).join(', ')) + '.<br>' +
      esc(window.PETS.summary(cur.def, cur.level)) +
      (r.bonus ? ' <b>' + esc(r.name) + ' gives a +' + r.bonus + ' head start.</b>' : '');

    var btn = $('level-btn');
    if (cur.level >= max) {
      btn.disabled = true;
      btn.textContent = 'Fully grown';
    } else {
      var cost = window.PETS.levelCost(cur.level);
      btn.disabled = S.sparks < cost;
      btn.textContent = 'Level up for ' + cost + ' ⚡';
    }
  }

  function renderShop() {
    if (!window.PETS) return;
    renderActivePet();

    var owned = window.PETS.list.filter(function (p) { return S.owned[p.id]; }).length;
    var total = window.PETS.list.length;
    $('egg-count').textContent = owned >= total
      ? 'You have found every one of the ' + total + ' pets.'
      : owned + ' of ' + total + ' pets found. ' + (total - owned) + ' still out there.';
    renderEggs(owned >= total);

    $('pet-grid').innerHTML = window.PETS.list.map(function (p) {
      var level = S.owned[p.id] || 0;
      var have = level > 0;
      var active = S.pet === p.id;
      if (!have) {
        return '<li class="pet-card is-locked"><div class="pet-stage small">' +
          '<span class="pet-unknown">?</span></div>' +
          '<p class="pet-card-name">Not found yet<span class="pet-kind is-' + p.rarity + '">' +
          esc(window.PETS.rarity(p.rarity).name) + '</span></p></li>';
      }
      return '<li class="pet-card is-owned' + (active ? ' is-active' : '') + '">' +
        '<div class="pet-stage small">' + window.PETS.draw(p.id, level) + '</div>' +
        '<p class="pet-card-name">' + esc(p.name) +
        '<span class="pet-kind is-' + p.rarity + '">' + esc(window.PETS.rarity(p.rarity).name) + '</span></p>' +
        '<p class="pet-card-blurb">' + (p.type === 'attack' ? '⚔ attacker' : '🛡 defender') +
        ' · level ' + level + '</p>' +
        '<button type="button" class="btn ' + (active ? 'btn-quiet' : 'btn-primary') +
        '" data-pet="' + p.id + '"' + (active ? ' disabled' : '') + '>' +
        (active ? 'Helping you now' : 'Pick ' + esc(p.name)) + '</button></li>';
    }).join('');

    $('pet-grid').querySelectorAll('[data-pet]').forEach(function (b) {
      b.addEventListener('click', function () { choosePet(b.dataset.pet); });
    });

    $('earn-list').innerHTML = [
      'A right answer in the quick check: +' + window.PETS.earn.rightAnswer,
      'Every question right in one round: +' + window.PETS.earn.perfectRound + ' on top',
      'Getting a practice question right after missing it: +' + window.PETS.earn.fixedMistake,
      'Reaching the end of a lesson: +' + window.PETS.earn.finishedLesson,
      'Your first lesson on a new topic: +' + window.PETS.earn.newTopic,
      'The chest for getting past a monster: +10, +30 or +50 depending on the level',
      'Winning a duel: +' + window.PETS.earn.wonDuel
    ].map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('');
  }

  /* ── the three eggs ─────────────────────────
     Same fifty pets behind all of them; the price buys better odds, and every set of odds
     is on the card before you spend. pets.js owns the numbers. */

  function eggArt(e) {
    return '<svg viewBox="0 0 100 120" class="egg-svg" aria-hidden="true"><g class="egg-wiggle">' +
      '<ellipse cx="50" cy="72" rx="34" ry="42" fill="' + e.tone[0] + '"/>' +
      '<ellipse cx="50" cy="72" rx="34" ry="42" fill="none" stroke="' + e.tone[1] + '" stroke-width="3"/>' +
      '<path d="M28 64 q 10 -8 20 0 q 10 8 22 -2" fill="none" stroke="' + e.tone[1] + '" stroke-width="3"/>' +
      '<circle cx="40" cy="88" r="5" fill="' + e.tone[2] + '"/><circle cx="60" cy="96" r="4" fill="' + e.tone[2] + '"/>' +
      (e.id === 'starlight'
        ? '<g class="egg-sparkle" fill="#fff6dc"><circle cx="30" cy="40" r="2.6"/>' +
          '<circle cx="70" cy="34" r="2"/><circle cx="50" cy="26" r="3"/></g>'
        : '') +
      (e.id === 'golden'
        ? '<path d="M50 24 l2.4 6 6.4 .6 -5 4.2 1.6 6.2 -5.4 -3.5 -5.4 3.5 1.6 -6.2 -5 -4.2 6.4 -.6 z" fill="#ffd45e"/>'
        : '') +
      '</g></svg>';
  }

  function renderEggs(allFound) {
    $('egg-row').innerHTML = window.PETS.eggs.map(function (e) {
      var afford = S.sparks >= e.price;
      var odds = window.PETS.rarities.map(function (r) {
        var pct = e.odds[r.id] || 0;
        return '<li' + (pct ? '' : ' class="is-never"') + '>' +
          '<span class="odds-dot is-' + r.id + '"></span>' +
          '<b>' + esc(r.name) + '</b>' +
          '<span class="odds-pct">' + (pct ? pct + '%' : 'never') + '</span></li>';
      }).join('');

      return '<div class="egg-card is-' + e.id + '">' +
        '<div class="egg-visual">' + eggArt(e) + '</div>' +
        '<p class="egg-name">' + esc(e.name) + '</p>' +
        '<p class="egg-blurb">' + esc(e.blurb) + '</p>' +
        '<ul class="egg-odds">' + odds + '</ul>' +
        '<button type="button" class="btn ' + (afford && !allFound ? 'btn-primary' : 'btn-quiet') +
        '" data-egg="' + e.id + '"' + (afford && !allFound ? '' : ' disabled') + '>' +
        (allFound ? 'All found' : 'Hatch — ' + e.price + ' ' + BOLT_CHAR) + '</button>' +
        (afford || allFound ? '' : '<p class="egg-short">' + (e.price - S.sparks) + ' more needed</p>') +
        '</div>';
    }).join('');

    $('egg-row').querySelectorAll('[data-egg]').forEach(function (b) {
      b.addEventListener('click', function () { hatchEgg(b.dataset.egg); });
    });
  }

  function hatchEgg(eggId) {
    var e = window.PETS.egg(eggId);
    if (S.sparks < e.price) { toast('You need ' + e.price + ' sparks for that one'); return; }
    var result = window.PETS.hatch(S.owned, e.id);
    if (!result) { toast('You already have every pet'); return; }

    spend(e.price, 'an egg');
    S.owned[result.pet.id] = 1;
    saveSparks();

    var r = window.PETS.rarity(result.pet.rarity);
    var box = $('egg-result');
    box.hidden = false;
    box.className = 'egg-result is-' + result.pet.rarity;
    box.innerHTML = '<div class="egg-pop">' + window.PETS.draw(result.pet.id, 1) + '</div>' +
      '<div><p class="egg-rarity">' + esc(r.name) + '</p>' +
      '<p class="egg-name">' + esc(result.pet.name) + '</p>' +
      '<p class="hint">From the ' + esc(e.name.toLowerCase()) + '. ' +
      (result.pet.type === 'attack' ? '\u2694 An attacker' : '\u{1F6E1} A defender') +
      (r.bonus ? ' with a +' + r.bonus + ' level head start' : '') + '.</p>' +
      '<button type="button" class="btn btn-primary" id="egg-use">Make ' + esc(result.pet.name) + ' my helper</button></div>';
    box.querySelector('#egg-use').addEventListener('click', function () { choosePet(result.pet.id); });

    paintSparks(true);
    toast(r.name + '! You got ' + result.pet.name);
    say('The ' + e.name.toLowerCase() + ' hatched a ' + r.name + ' pet: ' + result.pet.name + '.');
  }

  function choosePet(id) {
    if (!S.owned[id]) return;
    S.pet = id;
    saveSparks();
    renderShop();
    toast(window.PETS.byId(id).name + ' is helping you now');
  }

  $('level-btn').addEventListener('click', function () {
    var cur = activePet();
    if (cur.level >= window.PETS.maxLevel) return;
    var cost = window.PETS.levelCost(cur.level);
    if (S.sparks < cost) { toast('Not enough sparks yet'); return; }
    spend(cost, 'a pet level');
    S.owned[cur.def.id] = cur.level + 1;
    saveSparks();
    paintSparks(true);
    toast(cur.def.name + ' is level ' + (cur.level + 1) + '!');
    say(cur.def.name + ' reached level ' + (cur.level + 1) + ' and can now tell you more.');
  });

  $('shop-toggle').addEventListener('click', function () {
    var body = $('shop-body');
    var open = body.hidden;
    body.hidden = !open;
    this.setAttribute('aria-expanded', String(open));
    this.textContent = open ? 'Close the shop' : 'Open the shop';
    if (open) goTo($('shop'));
  });

  $('spark-chip').addEventListener('click', function () {
    goTo($('shop'));
    if ($('shop-body').hidden) $('shop-toggle').click();
  });

  /* ── your profile ──────────────────────────────
     The chip in the top right corner opens a locker of things to wear. Everything in it is
     bought with earned sparks and none of it touches a lesson, a question or a hint. */

  var LOCKER_SLOT = 'skin';

  function owns(slot, id) {
    return !!S.profile.items[window.PROFILE.key(slot, id)];
  }

  function paintProfileChip() {
    $('me-chip-art').innerHTML = window.PROFILE.draw(S.profile.worn);
    $('me-chip-name').textContent = displayName();
    $('me-chip-title').textContent = window.PROFILE.titleText(S.profile.worn.title);
    $('me-chip').setAttribute('aria-label',
      'Your profile. ' + displayName() + ', ' + window.PROFILE.titleText(S.profile.worn.title) + '.');
  }

  /* Every number an earned title can be judged on, counted in one place. */
  function achieveStats() {
    var petLevels = window.PETS.list.map(function (p) { return S.owned[p.id] || 0; });
    var looks = Object.keys(S.profile.items).filter(function (k) {
      var it = window.PROFILE.byKey(k.slice(0, k.indexOf(':')), k.slice(k.indexOf(':') + 1));
      return it && it.cost > 0;
    }).length;
    var mine = topicsForMe();
    var dressOwned = Object.keys(S.profile.items).filter(function (k) {
      var slot = k.slice(0, k.indexOf(':'));
      var it = window.PROFILE.byKey(slot, k.slice(k.indexOf(':') + 1));
      return it && it.cost > 0 && window.PROFILE.dressSlots.indexOf(slot) > -1;
    }).length;

    return {
      topics: Object.keys(S.seenTopics).filter(function (id) {
        return mine.some(function (t) { return t.id === id; });
      }).length,
      topicTotal: mine.length,
      spent: S.spent,
      dressed: dressOwned >= window.PROFILE.dressTotal(),
      dressOwned: dressOwned,
      dressTotal: window.PROFILE.dressTotal(),
      mastered: mine.filter(topicMastered).length,
      masterTotal: mine.length,
      pets: petLevels.filter(function (l) { return l > 0; }).length,
      petTotal: window.PETS.list.length,
      petMax: Math.max.apply(null, petLevels.concat([0])),
      escapes: S.tally.escapes,
      duels: S.tally.duels,
      lifetime: S.lifetime,
      looks: looks,
      lookTotal: window.PROFILE.buyable()
    };
  }

  /* A title is granted the moment the numbers say so, and announced once. */
  function grantEarnedTitles(announce) {
    var got = window.PROFILE.earnedTitles(achieveStats());
    var fresh = [];
    window.PROFILE.achievements.forEach(function (ach) {
      var k = window.PROFILE.key('title', ach.id);
      if (got[ach.id] && !S.profile.items[k]) {
        S.profile.items[k] = true;
        fresh.push(ach);
      }
    });
    if (!fresh.length) return [];
    saveProfile();
    if (announce) {
      fresh.forEach(function (ach) {
        toast('Title earned: ' + ach.name);
        say('You earned a new title: ' + ach.name + '. ' + ach.need + '.');
      });
    }
    return fresh;
  }

  function titlesEarned() {
    return window.PROFILE.achievements.filter(function (ach) {
      return S.profile.items[window.PROFILE.key('title', ach.id)];
    }).length;
  }

  function profileStats() {
    var petsFound = window.PETS.list.filter(function (p) { return S.owned[p.id]; }).length;
    var wornCount = achieveStats().looks;
    var topics = Object.keys(S.seenTopics).length;
    return [
      [S.sparks, 'sparks to spend'],
      [S.lifetime, 'earned in total'],
      [topics + ' / ' + window.TOPICS.length, 'topics learned'],
      [petsFound + ' / ' + window.PETS.list.length, 'pets found'],
      [wornCount + ' / ' + window.PROFILE.buyable(), 'looks unlocked'],
      [titlesEarned() + ' / ' + window.PROFILE.achievements.length, 'titles earned']
    ];
  }

  /* ── the achievement wall ──────────────────
     Beside the avatar, so the first thing you see on your own profile is what you have
     done. Locked ones stay on the wall rather than hiding, because a goal you cannot see
     is not a goal — each says what it needs and, where it is a count, how far along. */

  function medal(earned) {
    return '<svg viewBox="0 0 24 24" class="medal" aria-hidden="true">' +
      '<path d="M7 2 L12 9 L17 2" fill="none" stroke="' + (earned ? '#d9644f' : 'currentColor') +
      '" stroke-width="2.4" stroke-linejoin="round"/>' +
      '<circle cx="12" cy="15.5" r="6.5" fill="' + (earned ? '#ffd45e' : 'none') +
      '" stroke="' + (earned ? '#9a7320' : 'currentColor') + '" stroke-width="2"/>' +
      (earned ? '<path d="M9.3 15.6 l1.9 1.9 3.6 -3.8" fill="none" stroke="#9a7320" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' : '') +
      '</svg>';
  }

  /* where a counting achievement has got to, for the ones that have a number */
  function achieveProgress(id, st) {
    var p = {
      scholar: [Math.min(st.topics, 5), 5],
      collector: [Math.min(st.pets, 10), 10],
      survivor: [Math.min(st.escapes, 3), 3],
      duellist: [Math.min(st.duels, 5), 5],
      baron: [Math.min(st.lifetime, 1000), 1000],
      trainer: [st.petMax, window.PETS.maxLevel],
      keeper: [st.pets, st.petTotal],
      stylist: [st.dressOwned, st.dressTotal],
      wardrobe: [st.looks, st.lookTotal],
      master: [st.topics, st.topicTotal],
      rich: [Math.min(st.spent, 100000), 100000],
      grandmaster: [st.mastered, st.masterTotal]
    }[id];
    return p || null;
  }

  function renderWall() {
    var st = achieveStats();
    var list = window.PROFILE.achievements;
    var mine = list.filter(function (a) { return owns('title', a.id); }).length;
    $('wall-count').textContent = mine + ' of ' + list.length;

    $('profile-wall').innerHTML = list.map(function (a) {
      var got = owns('title', a.id);
      var worn = S.profile.worn.title === a.id;
      var prog = got ? null : achieveProgress(a.id, st);
      var bar = prog && prog[1]
        ? '<span class="wall-bar"><i style="width:' +
          Math.min(100, Math.round(prog[0] / prog[1] * 100)) + '%"></i></span>' +
          '<span class="wall-num">' + prog[0].toLocaleString() + ' / ' + prog[1].toLocaleString() + '</span>'
        : '';
      return '<li class="wall-item' + (got ? ' is-got' : '') + (worn ? ' is-worn' : '') +
        '" title="' + esc(a.need) + '">' +
        medal(got) +
        '<span class="wall-text"><b>' + esc(a.name) + '</b>' +
        '<span class="wall-need">' + esc(got ? (worn ? 'worn as your title' : 'earned') : a.need) + '</span>' +
        bar + '</span></li>';
    }).join('');
  }

  function renderProfile() {
    if (!S.profile) return;
    grantEarnedTitles(true);
    paintProfileChip();
    if ($('profile').hidden) return;

    $('profile-avatar').innerHTML = window.PROFILE.draw(S.profile.worn);
    renderWall();
    if ($('profile-name').value !== S.profile.name) $('profile-name').value = S.profile.name;
    $('profile-title').textContent = window.PROFILE.titleText(S.profile.worn.title);

    $('profile-stats').innerHTML = profileStats().map(function (st) {
      return '<li><b>' + esc(String(st[0])) + '</b><span>' + esc(st[1]) + '</span></li>';
    }).join('');

    var bought = achieveStats().looks;
    $('locker-owned').textContent = bought + ' of ' + window.PROFILE.buyable() +
      ' unlocked. You have ' + S.sparks + ' spark' + (S.sparks === 1 ? '' : 's') + ' to spend.';

    $('slot-tabs').innerHTML = window.PROFILE.slots.map(function (sl) {
      var items = window.PROFILE.bySlot(sl.id);
      var left = items.filter(function (it) { return it.cost > 0 && !owns(sl.id, it.id); }).length;
      if (sl.id === 'title') {
        left += window.PROFILE.achievements.filter(function (ach) {
          return !owns('title', ach.id);
        }).length;
      }
      return '<button type="button" class="slot-tab" role="tab" data-slot="' + sl.id + '" ' +
        'aria-selected="' + (sl.id === LOCKER_SLOT) + '">' + esc(sl.name) +
        (left ? ' <span class="slot-dot">' + left + '</span>' : '') + '</button>';
    }).join('');
    $('slot-tabs').querySelectorAll('[data-slot]').forEach(function (b) {
      b.addEventListener('click', function () { LOCKER_SLOT = b.dataset.slot; renderProfile(); });
    });

    var slot = window.PROFILE.slots.filter(function (sl) { return sl.id === LOCKER_SLOT; })[0];
    $('slot-note').textContent = slot ? slot.note : '';

    $('locker-grid').innerHTML = window.PROFILE.bySlot(LOCKER_SLOT).map(function (it) {
      var have = owns(it.slot, it.id);
      var worn = S.profile.worn[it.slot] === it.id;
      /* preview the item on your own avatar, so you see it before you pay */
      var preview = {};
      for (var k in S.profile.worn) preview[k] = S.profile.worn[k];
      preview[it.slot] = it.id;

      var art = it.slot === 'title'
        ? '<div class="locker-art is-text">' + esc(it.name) + '</div>'
        : '<div class="locker-art">' + window.PROFILE.draw(preview) + '</div>';

      var action, price;
      if (worn) {
        action = '<button type="button" class="btn btn-quiet" disabled>Wearing this</button>';
      } else if (have) {
        action = '<button type="button" class="btn btn-primary" data-wear="' + it.id + '">Wear it</button>';
      } else if (it.earned) {
        action = '<button type="button" class="btn btn-quiet" disabled>Not yet earned</button>';
      } else {
        action = '<button type="button" class="btn btn-primary" data-buy="' + it.id + '"' +
          (S.sparks < it.cost ? ' disabled' : '') + '>Buy for ' + it.cost + ' ⚡</button>';
      }

      if (it.earned) price = have ? (worn ? 'On you now' : 'Earned') : 'Cannot be bought';
      else price = have ? (worn ? 'On you now' : 'Yours') : it.cost + ' ⚡';

      return '<li class="locker-item' + (worn ? ' is-worn' : '') + (have ? '' : ' is-locked') +
        (it.earned ? ' is-earned' : '') + '">' +
        art +
        '<p class="locker-name">' + esc(it.name) +
        (it.earned ? '<span class="earned-flag">earned</span>' : '') + '</p>' +
        '<p class="locker-blurb">' + esc(it.blurb) + '</p>' +
        '<p class="locker-price">' + esc(price) + '</p>' +
        action + '</li>';
    }).join('');

    $('locker-grid').querySelectorAll('[data-wear]').forEach(function (b) {
      b.addEventListener('click', function () { wear(LOCKER_SLOT, b.dataset.wear); });
    });
    $('locker-grid').querySelectorAll('[data-buy]').forEach(function (b) {
      b.addEventListener('click', function () { buyLook(LOCKER_SLOT, b.dataset.buy); });
    });
  }

  function wear(slot, id) {
    if (!owns(slot, id)) return;
    S.profile.worn[slot] = id;
    saveProfile();
    renderProfile();
    var it = window.PROFILE.byKey(slot, id);
    if (it) toast(it.name + ' — on you now');
  }

  function buyLook(slot, id) {
    var it = window.PROFILE.byKey(slot, id);
    if (!it || owns(slot, id)) return;
    if (S.sparks < it.cost) { toast('You need ' + it.cost + ' sparks for that'); return; }
    spend(it.cost, 'a look');
    S.profile.items[window.PROFILE.key(slot, id)] = true;
    S.profile.worn[slot] = id;
    saveSparks();
    saveProfile();
    paintSparks(true);
    renderProfile();
    toast('Unlocked ' + it.name + ' — ' + S.sparks + ' sparks left');
    say('Unlocked ' + it.name + ' for ' + it.cost + ' sparks. You have ' + S.sparks + ' left.');
  }

  function openProfile(open) {
    $('profile').hidden = !open;
    $('me-chip').setAttribute('aria-expanded', String(open));
    if (open) { renderProfile(); goTo($('profile')); $('profile-name').focus(); }
  }

  $('me-chip').addEventListener('click', function () { openProfile($('profile').hidden); });
  $('profile-close').addEventListener('click', function () {
    openProfile(false);
    $('me-chip').focus();
  });

  $('profile-name').addEventListener('input', function () {
    S.profile.name = this.value.replace(/\s+/g, ' ').slice(0, window.PROFILE.maxName);
    saveProfile();
    paintProfileChip();
  });
  $('profile-name').addEventListener('blur', function () {
    S.profile.name = S.profile.name.trim();
    this.value = S.profile.name;
    saveProfile();
    paintProfileChip();
  });

  /* ── the hint itself ──────────────────────────────── */

  function firstUnanswered() {
    for (var i = 0; i < S.questions.length; i++) {
      if (!$('quiz-form').querySelector('input[name="q' + i + '"]:checked')) return i;
    }
    return S.questions.length ? 0 : -1;
  }

  $('hint-btn').addEventListener('click', function () {
    if (!S.board || !S.questions || !S.questions.length) { toast('Make a lesson first'); return; }
    var qi = firstUnanswered();
    if (qi < 0) return;
    if (S.hinted[qi]) { toast('Your pet already helped with that one'); return; }

    var cur = activePet();
    var lines = window.PETS.hints(S.questions[qi], S.board.topic, cur.def, cur.level);
    S.hinted[qi] = true;

    var box = document.createElement('div');
    box.className = 'pet-hint';
    box.innerHTML = '<div class="pet-hint-who">' + window.PETS.draw(cur.def.id, cur.level) +
      '<span>' + esc(cur.def.name) + ' says</span></div>' +
      '<div class="pet-hint-lines">' + lines.map(function (l) {
        return '<p><span aria-hidden="true">' + l.icon + '</span>' + esc(l.text) + '</p>';
      }).join('') + '</div>' +
      (function () {
        var now = window.PETS.rungs(cur.def, cur.level);
        if (now >= window.PETS.ladder.length) return '';
        for (var L = cur.level + 1; L <= window.PETS.maxLevel; L++) {
          if (window.PETS.rungs(cur.def, L) > now) {
            return '<p class="pet-hint-more">At level ' + L + ', ' + esc(cur.def.name) + ' ' +
              esc(window.PETS.ladder[now].replace(/^and /, '')) + '.</p>';
          }
        }
        return '';
      })();

    var fs = $('quiz-form').querySelectorAll('.q')[qi];
    var old = fs.querySelector('.pet-hint');
    if (old) old.remove();
    fs.appendChild(box);
    goTo(fs);
    say(cur.def.name + ' gave you a hint on question ' + (qi + 1) + '.');
  });

  /* ── duelling: parties, teams and robots ────────
     A party is seats split over two teams, 1v1 up to 4v4. It can sit entirely on this
     device — pass it round, robots fill whatever is left — or it can live on the server
     so people on other devices join with the code.

     Online is host-authoritative: the host's phone runs duel.js and publishes what the
     screen says, guests render that and post back what they tapped. One copy of the rules
     means the two screens cannot drift. net.js is the wire; this is the wiring. */

  var PARTY_WHERE = 'local';
  var localSeatNo = 1;

  function myId() {
    if (!S.profile.deviceId) {
      S.profile.deviceId = 'p' + Math.random().toString(36).slice(2, 9);
      saveProfile();
    }
    return S.profile.deviceId;
  }

  function mySeat() {
    var cur = activePet();
    return { id: myId(), name: displayName(), petId: cur.def.id, level: cur.level };
  }

  function ownedPetIds() {
    return window.PETS.list.filter(function (p) { return S.owned[p.id]; })
      .map(function (p) { return p.id; });
  }

  function petOptions(selected) {
    return window.PETS.list.filter(function (p) { return S.owned[p.id]; }).map(function (p) {
      var lv = S.owned[p.id];
      return '<option value="' + p.id + '"' + (p.id === selected ? ' selected' : '') + '>' +
        esc(p.name) + ' \u00b7 L' + lv + ' \u00b7 ' + window.PETS.rarity(p.rarity).name +
        ' \u00b7 ' + (p.type === 'attack' ? 'attacker' : 'defender') + '</option>';
    }).join('');
  }

  /* party members carry a pet id; duel.js wants the pet itself */
  function teamsForDuel(p) {
    return window.PARTY.sides(p).map(function (t) {
      return {
        name: t.name,
        members: t.members.map(function (m) {
          return {
            id: m.id, name: m.name, ai: !!m.ai,
            pet: window.PETS.byId(m.petId) || window.PETS.byId(window.PETS.starter),
            level: m.level || 1
          };
        })
      };
    });
  }

  function partyMsg(text, bad) {
    var el = $('party-msg');
    el.textContent = text || '';
    el.classList.toggle('is-bad', !!bad);
  }

  /* ── the opening screen ── */

  function renderModeRow() {
    $('mode-row').innerHTML = window.PARTY.modes.map(function (m) {
      return '<button type="button" class="mode-btn" role="radio" data-mode="' + m.id + '" ' +
        'aria-checked="' + (m.id === S.partyMode) + '">' +
        '<b>' + esc(m.name) + '</b><span>' + esc(m.blurb) + '</span></button>';
    }).join('');
    $('mode-row').querySelectorAll('[data-mode]').forEach(function (b) {
      b.addEventListener('click', function () {
        S.partyMode = b.dataset.mode;
        renderModeRow();
      });
    });
  }

  function setWhere(where) {
    PARTY_WHERE = where;
    $('where-row').querySelectorAll('[data-where]').forEach(function (b) {
      b.setAttribute('aria-checked', String(b.dataset.where === where));
    });
    $('join-row').hidden = where !== 'online';
  }

  function checkOnline() {
    if (!window.NET) { $('where-online').disabled = true; $('online-note').textContent = 'Not available.'; return; }
    window.NET.available().then(function (r) {
      S.netReady = r;
      $('where-online').disabled = !r.online;
      $('online-note').textContent = r.online
        ? (r.durable
          ? 'Share a code. Other phones and laptops join it.'
          : 'Share a code. Works best if everyone joins within a few minutes.')
        : 'Needs the party server, which this copy does not have.';
      if (!r.online && PARTY_WHERE === 'online') setWhere('local');
    });
  }

  function showDuel() {
    $('duel-view').hidden = false;
    $('duel-setup').hidden = false;
    $('party-start').hidden = false;
    $('party-lobby').hidden = true;
    $('duel-board').hidden = true;
    stopParty();
    S.party = null;
    partyMsg('');
    $('step4-sub').textContent = 'Pick your teams, then throw science questions at each other. ' +
      'Everyone attacks and everyone answers.';
    renderModeRow();
    setWhere(PARTY_WHERE);
    checkOnline();
  }

  /* ── making and joining ── */

  function createParty() {
    var p = window.PARTY.create({
      mode: S.partyMode,
      host: mySeat(),
      online: PARTY_WHERE === 'online',
      topicId: S.board && S.board.topic ? S.board.topic.id : ''
    });
    localSeatNo = 1;

    if (!p.online) {
      S.party = p;
      openLobby();
      return;
    }
    partyMsg('Making the party\u2026');
    window.NET.create(p.code, p).then(function () {
      S.party = p;
      openLobby();
      hostWatch();
    }).catch(function (e) {
      partyMsg(e.message || 'Could not reach the party server.', true);
    });
  }

  function joinParty() {
    var code = window.PARTY.cleanCode($('party-code').value);
    if (code.length !== 4) { partyMsg('A code is four letters.', true); return; }
    partyMsg('Looking for ' + code + '\u2026');
    window.NET.join(code, Object.assign({ team: 0, ai: false }, mySeat())).then(function (j) {
      S.party = j.party;
      S.party.code = code;
      openLobby();
      guestWatch();
    }).catch(function (e) {
      partyMsg(e.message || 'No party with that code.', true);
    });
  }

  function amHost() {
    return S.party && S.party.host === myId();
  }

  function openLobby() {
    $('party-start').hidden = true;
    $('party-lobby').hidden = false;
    $('party-code-out').textContent = S.party.code;
    $('party-where').textContent = S.party.online
      ? (amHost() ? 'Online. Read the code out and they join from their own device.'
                  : 'Online. Waiting for the host to start.')
      : 'On this device. Add the people sitting with you, or let robots take the rest.';
    renderLobby();
  }

  function renderLobby() {
    var p = S.party;
    if (!p) return;
    var sum = window.PARTY.summary(p);
    var per = sum.per;

    $('party-teams').innerHTML = [0, 1].map(function (t) {
      var seats = window.PARTY.teamOf(p, t);
      var rows = [];
      for (var i = 0; i < per; i++) {
        var m = seats[i];
        if (!m) {
          rows.push('<li class="seat is-empty">' +
            (p.online ? '<span class="seat-wait">waiting for a player\u2026</span>'
                      : '<span class="seat-wait">empty \u2014 a robot will take it</span>') +
            '</li>');
          continue;
        }
        var isMe = m.id === myId();
        var canEdit = !p.online && !isMe && !m.ai && amHost();
        rows.push('<li class="seat' + (m.ai ? ' is-ai' : '') + (isMe ? ' is-me' : '') + '">' +
          '<span class="seat-pet">' + (m.petId ? window.PETS.draw(m.petId, m.level || 1) : '') + '</span>' +
          '<span class="seat-body">' +
          (canEdit
            ? '<input class="input seat-name" data-rename="' + m.id + '" value="' + esc(m.name) + '" maxlength="14">'
            : '<b class="seat-name-text">' + esc(m.name) + (isMe ? ' (you)' : '') + '</b>') +
          (m.ai
            ? '<span class="seat-tag">robot \u00b7 answers 1 in 3</span>'
            : (canEdit
              ? '<select class="input seat-pet-pick" data-pet="' + m.id + '">' + petOptions(m.petId) + '</select>'
              : '<span class="seat-tag">' + esc((window.PETS.byId(m.petId) || {}).name || 'no pet') +
                ' L' + (m.level || 1) + '</span>')) +
          '</span>' +
          ((amHost() && !isMe) ? '<button type="button" class="seat-x" data-drop="' + m.id +
            '" aria-label="Remove ' + esc(m.name) + '">\u00d7</button>' : '') +
          '</li>');
      }
      var room = seats.length < per;
      return '<div class="party-team">' +
        '<p class="lbl">' + (t === 0 ? 'Team A' : 'Team B') + ' <span class="team-count">' +
        seats.length + ' / ' + per + '</span></p>' +
        '<ul class="seats">' + rows.join('') + '</ul>' +
        (amHost() && room && !p.online
          ? '<div class="seat-add">' +
            '<button type="button" class="btn btn-quiet" data-add-human="' + t + '">+ Person here</button>' +
            '<button type="button" class="btn btn-quiet" data-add-ai="' + t + '">+ Robot</button>' +
            '</div>'
          : (amHost() && room && p.online
            ? '<div class="seat-add"><button type="button" class="btn btn-quiet" data-add-ai="' + t + '">+ Robot</button></div>'
            : '')) +
        '</div>';
    }).join('');

    $('party-teams').querySelectorAll('[data-add-human]').forEach(function (b) {
      b.addEventListener('click', function () { addHuman(Number(b.dataset.addHuman)); });
    });
    $('party-teams').querySelectorAll('[data-add-ai]').forEach(function (b) {
      b.addEventListener('click', function () { addRobot(Number(b.dataset.addAi)); });
    });
    $('party-teams').querySelectorAll('[data-drop]').forEach(function (b) {
      b.addEventListener('click', function () { dropSeat(b.dataset.drop); });
    });
    $('party-teams').querySelectorAll('[data-rename]').forEach(function (inp) {
      inp.addEventListener('input', function () {
        var m = p.members.filter(function (x) { return x.id === inp.dataset.rename; })[0];
        if (m) m.name = inp.value.slice(0, 14);
      });
    });
    $('party-teams').querySelectorAll('[data-pet]').forEach(function (sel) {
      sel.addEventListener('change', function () {
        var m = p.members.filter(function (x) { return x.id === sel.dataset.pet; })[0];
        if (m) { m.petId = sel.value; m.level = S.owned[sel.value] || 1; renderLobby(); }
      });
    });

    var go = $('party-start-btn');
    go.hidden = !amHost();
    go.textContent = sum.empty
      ? 'Start with ' + sum.empty + ' robot' + (sum.empty === 1 ? '' : 's')
      : 'Start the duel';
    $('party-swap').hidden = !!p.online && !amHost() ? false : false;
    $('party-fill-note').textContent = sum.empty
      ? sum.empty + ' seat' + (sum.empty === 1 ? '' : 's') + ' still open. Start now and ' +
        (sum.empty === 1 ? 'a robot takes it' : 'robots take them') + ' \u2014 each one answers at random, so about one in three.'
      : 'Everyone is in.';

  }

  function addHuman(team) {
    var p = S.party;
    if (window.PARTY.teamOf(p, team).length >= window.PARTY.mode(p.mode).per) return;
    localSeatNo++;
    var ids = ownedPetIds();
    p.members.push({
      id: 'local' + localSeatNo + Math.random().toString(36).slice(2, 5),
      name: 'Player ' + localSeatNo,
      team: team,
      petId: ids[(localSeatNo - 1) % ids.length] || S.pet,
      level: 1,
      ai: false
    });
    renderLobby();
    pushParty();
  }

  function addRobot(team) {
    var p = S.party;
    if (window.PARTY.teamOf(p, team).length >= window.PARTY.mode(p.mode).per) return;
    var n = p.members.filter(function (m) { return m.ai; }).length;
    p.members.push({
      id: 'ai' + n + Math.random().toString(36).slice(2, 5),
      name: window.PARTY.robotNames[n % window.PARTY.robotNames.length],
      team: team,
      petId: ownedPetIds()[n % Math.max(1, ownedPetIds().length)] || S.pet,
      level: 4 + (n % 3) * 2,
      ai: true
    });
    renderLobby();
    pushParty();
  }

  function dropSeat(id) {
    window.PARTY.leave(S.party, id);
    renderLobby();
    pushParty();
  }

  /* ── staying in step with the other devices ── */

  function stopParty() {
    if (S.watcher) { S.watcher.stop(); S.watcher = null; }
  }

  function pushParty() {
    if (!S.party || !S.party.online || !amHost()) return;
    window.NET.putParty(S.party.code, myId(), S.party).catch(function () {});
  }

  /* The server only appends whoever asked to join — it runs no rules, so it has no idea
     which side has room. The host does the seating, and writes the corrected party back. */
  function seatArrivals(incoming) {
    var p = S.party;
    var known = {};
    p.members.forEach(function (m) { known[m.id] = m; });
    var changed = false;

    incoming.forEach(function (m) {
      if (known[m.id]) return;
      var t = window.PARTY.openTeam(p);
      if (t < 0) return;                       /* full: they are told when they next poll */
      p.members.push({
        id: m.id, name: m.name, team: t,
        petId: m.petId || '', level: m.level || 1, ai: !!m.ai
      });
      changed = true;
      toast(m.name + ' joined');
    });

    /* anyone the server has dropped has left on their own device */
    var still = {};
    incoming.forEach(function (m) { still[m.id] = true; });
    var before = p.members.length;
    p.members = p.members.filter(function (m) {
      return m.ai || m.id === myId() || still[m.id] || m.id.indexOf('local') === 0;
    });
    if (p.members.length !== before) changed = true;
    return changed;
  }

  function hostWatch() {
    stopParty();
    S.watcher = window.NET.watch({
      code: S.party.code, id: myId(), host: true,
      onParty: function (p) {
        if (!S.party || window.DUEL.running()) return;
        if (seatArrivals(p.members)) { renderLobby(); pushParty(); }
      },
      onActions: function (actions) {
        actions.forEach(function (a) {
          if (a.type === 'pick' || a.type === 'answer' || a.type === 'ready') {
            window.DUEL.applyRemote(a);
          }
        });
      },
      onError: function (m) { partyMsg(m, true); }
    });
  }

  function guestWatch() {
    stopParty();
    S.watcher = window.NET.watch({
      code: S.party.code, id: myId(), host: false,
      onParty: function (p) {
        S.party.members = p.members;
        S.party.started = p.started;
        S.party.mode = p.mode;
        if (p.started && $('duel-board').hidden) joinStartedDuel();
        else if (!p.started) renderLobby();
      },
      onState: function (state) { paintGuest(state); },
      onError: function (m) { partyMsg(m, true); }
    });
  }

  /* ── starting ── */

  function startDuel() {
    var p = S.party;
    window.PARTY.fill(p, ownedPetIds());
    p.started = true;

    $('duel-setup').hidden = true;
    $('duel-board').hidden = false;

    var teams = teamsForDuel(p);
    var localIds = p.online
      ? [myId()]
      : p.members.filter(function (m) { return !m.ai; }).map(function (m) { return m.id; });

    window.DUEL.start({
      el: { hp: $('duel-hp'), stage: $('duel-stage') },
      topic: S.board.topic,
      questions: chaseQuestions(S.board.topic),
      teams: teams,
      maxHp: window.PARTY.teamHp(p.mode),
      remote: !!p.online,
      localIds: localIds,
      reduced: reduceMotion,
      onState: function (st) {
        if (p.online && amHost()) window.NET.putState(p.code, myId(), st, p).catch(function () {});
      },
      onEnd: function (r) {
        var mine = r.winner.members.some(function (m) { return m.id === myId(); });
        S.tally.duels += mine ? 1 : 0;
        saveProfile();
        if (mine) earn(window.PETS.earn.wonDuel, 'winning the duel');
        grantEarnedTitles(true);
        say(r.winner.name + ' won the duel after ' + r.rounds + ' rounds.');
      },
      onAgain: function () { showDuel(); }
    });

    if (p.online) pushParty();
    say('Duel started. ' + window.PARTY.mode(p.mode).name + '.');
  }

  function joinStartedDuel() {
    /* a guest does not run the rules; it renders what the host publishes */
    $('duel-setup').hidden = true;
    $('duel-board').hidden = false;
    $('duel-stage').innerHTML = '<div class="duel-wait"><p class="duel-step">Starting\u2026</p></div>';
  }

  function paintGuest(st) {
    if (!S.party || amHost() || !st) return;
    if ($('duel-board').hidden) joinStartedDuel();
    var teams = teamsForDuel(S.party);
    var me = myId();

    $('duel-hp').innerHTML = teams.map(function (t, i) {
      var hearts = '';
      for (var h = 0; h < (st.maxHp ? st.maxHp[i] : 5); h++) {
        hearts += '<span class="hp' + (h < st.hp[i] ? ' is-on' : '') + '"></span>';
      }
      return '<div class="duel-team' + (i === st.turn ? ' is-turn' : '') + '">' +
        '<div class="duel-team-head"><p class="duel-who">' + esc(t.name) + '</p>' +
        '<div class="hp-row">' + hearts + '</div></div>' +
        '<ul class="duel-seats">' + t.members.map(function (m) {
          var role = m.id === st.attacker ? 'attack' : (m.id === st.defender ? 'defend' : '');
          return '<li class="duel-seat' + (role ? ' is-' + role : '') + (m.ai ? ' is-ai' : '') + '">' +
            '<span class="duel-seat-pet">' + window.PETS.draw(m.pet.id, m.level) + '</span>' +
            '<span class="duel-seat-text"><b>' + esc(m.name) + '</b><span>' +
            (m.ai ? 'robot' : esc(m.pet.name)) + '</span></span></li>';
        }).join('') + '</ul></div>';
    }).join('');

    var all = teams[0].members.concat(teams[1].members);
    var who = function (id) {
      var m = all.filter(function (x) { return x.id === id; })[0];
      return m ? m.name : 'someone';
    };

    if (st.phase === 'over') {
      var won = st.hp[0] > 0 ? 0 : 1;
      var mineTeam = teams[0].members.some(function (m) { return m.id === me; }) ? 0 : 1;
      $('duel-stage').innerHTML = '<div class="duel-outcome ' +
        (won === mineTeam ? 'is-win' : 'is-lose') + '">' +
        '<p class="duel-step">' + esc(teams[won].name) + ' wins.</p>' +
        '<p class="duel-sub">After ' + st.round + ' rounds. Right answers: ' +
        st.scores.join(' and ') + '.</p>' +
        '<button type="button" class="btn btn-primary" id="guest-again">Back to the lobby</button></div>';
      var ga = $('duel-stage').querySelector('#guest-again');
      if (ga) ga.addEventListener('click', function () { stopParty(); window.DUEL.stop(); showDuel(); });
      return;
    }
    if (st.phase === 'choose' && st.attacker === me && st.choices) {
      pickGuest(st);
      return;
    }
    if (st.phase === 'answer' && st.defender === me) {
      askGuest(st);
      return;
    }
    if (st.phase === 'result') {
      $('duel-stage').dataset.asked = '';
      $('duel-stage').dataset.picked = '';
      $('duel-stage').innerHTML = '<div class="duel-outcome ' +
        (st.lastRight ? 'is-win' : 'is-lose') + '">' +
        '<p class="duel-step">' + esc(st.lastDefender || 'They') + ' ' +
        (st.lastRight ? 'defended it.' : 'missed it \u2014 ' + st.lastDamage + ' heart' +
          (st.lastDamage === 1 ? '' : 's') + ' gone.') + '</p>' +
        (st.why ? '<p class="duel-sub">' + esc(st.why) + '</p>' : '') + '</div>';
      return;
    }
    $('duel-stage').dataset.asked = '';
    $('duel-stage').dataset.picked = '';
    $('duel-stage').innerHTML = '<div class="duel-wait">' +
      '<p class="duel-step">' + (st.phase === 'choose'
        ? esc(who(st.attacker)) + ' is choosing a question\u2026'
        : esc(who(st.defender)) + ' is answering\u2026') + '</p>' +
      (st.phase !== 'choose' && st.question ? '<p class="duel-sub">' + esc(st.question) + '</p>' : '') +
      '<div class="duel-dots" aria-hidden="true"><i></i><i></i><i></i></div></div>';
  }

  function pickGuest(st) {
    var stage = $('duel-stage');
    var key = st.round + ':' + st.choices.map(function (c) { return c.q; }).join('|');
    if (stage.dataset.picked === key) return;
    stage.dataset.picked = key;
    stage.innerHTML =
      '<p class="duel-step">Your turn \u2014 pick a question to send</p>' +
      '<p class="duel-sub">Whoever is up on the other team has to answer it.</p>' +
      '<div class="duel-picks">' + st.choices.map(function (c, i) {
        var pct = Math.round(c.diff * 100);
        var band = c.diff < 0.35 ? 'easy' : c.diff < 0.62 ? 'medium' : 'hard';
        return '<button type="button" class="duel-pick" data-gp="' + i + '">' +
          '<span class="duel-band is-' + band + '">' + band + ' \u00b7 ' + pct + '%</span>' +
          '<span class="duel-qtext">' + esc(c.q.length > 110 ? c.q.slice(0, 110) + '\u2026' : c.q) + '</span>' +
          '</button>';
      }).join('') + '</div>';
    stage.querySelectorAll('[data-gp]').forEach(function (b) {
      b.addEventListener('click', function () {
        stage.querySelectorAll('[data-gp]').forEach(function (x) { x.disabled = true; });
        window.NET.act(S.party.code, myId(), { type: 'pick', index: Number(b.dataset.gp) })
          .catch(function () { partyMsg('That did not reach the host.', true); });
      });
    });
  }

  function askGuest(st) {
    /* the host sends only the stem over the wire, so the guest asks for the options it
       already has in its own copy of the library */
    var pool = chaseQuestions(S.board.topic);
    var q = pool.filter(function (x) { return x.q === st.question; })[0];
    if (!q) {
      $('duel-stage').innerHTML = '<div class="duel-wait"><p class="duel-step">Your turn\u2026</p></div>';
      return;
    }
    var key = st.round + ':' + st.question;
    if ($('duel-stage').dataset.asked === key) return;
    $('duel-stage').dataset.asked = key;
    $('duel-stage').innerHTML =
      '<p class="duel-step">Your turn to answer</p>' +
      '<p class="duel-q">' + esc(q.q) + '</p>' +
      '<div class="duel-opts">' + q.a.map(function (a, i) {
        return '<button type="button" class="chase-opt" data-g="' + i + '">' + esc(a) + '</button>';
      }).join('') + '</div>';
    $('duel-stage').querySelectorAll('[data-g]').forEach(function (b) {
      b.addEventListener('click', function () {
        $('duel-stage').querySelectorAll('[data-g]').forEach(function (x) { x.disabled = true; });
        window.NET.act(S.party.code, myId(), { type: 'answer', index: Number(b.dataset.g) })
          .catch(function () { partyMsg('That did not reach the host.', true); });
      });
    });
  }

  /* ── buttons ── */

  $('where-row').querySelectorAll('[data-where]').forEach(function (b) {
    b.addEventListener('click', function () { if (!b.disabled) setWhere(b.dataset.where); });
  });
  $('party-create').addEventListener('click', createParty);
  $('party-join').addEventListener('click', joinParty);
  $('party-code').addEventListener('input', function () {
    this.value = window.PARTY.cleanCode(this.value);
  });
  $('party-start-btn').addEventListener('click', startDuel);
  $('party-swap').addEventListener('click', function () {
    if (!S.party) return;
    if (window.PARTY.swapSide(S.party, myId())) { renderLobby(); pushParty(); }
    else toast('No room on the other side');
  });
  $('party-copy').addEventListener('click', function () {
    if (!S.party) return;
    var code = S.party.code;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code).then(function () { toast('Copied ' + code); },
        function () { toast('Your code is ' + code); });
    } else toast('Your code is ' + code);
  });
  $('party-leave').addEventListener('click', function () {
    if (S.party && S.party.online) window.NET.leave(S.party.code, myId()).catch(function () {});
    stopParty();
    window.DUEL.stop();
    showDuel();
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

    S.hinted = {};
    $('quiz-score').textContent = '';
    $('quiz-reset').hidden = true;
    $('quiz-check').disabled = false;
    $('missed').hidden = true;
    $('missed-list').innerHTML = '';
  }

  /* “I am the master” wants every question in a unit answered right, so we remember which
     of a topic's ten have been. Only the library questions count: the generated practice
     ones are built fresh each time and there is no fixed set of them to finish. */
  function noteMastery(q) {
    if (!S.board || !S.board.topic || q.source !== 'library') return;
    var id = S.board.topic.id;
    if (!S.mastered[id]) S.mastered[id] = {};
    if (S.mastered[id][q.q]) return;
    S.mastered[id][q.q] = true;
    saveProfile();
  }

  /* a topic is finished when all ten of its questions have been answered right */
  function topicMastered(topic) {
    var got = S.mastered[topic.id];
    if (!got) return false;
    for (var i = 0; i < topic.quiz.length; i++) {
      if (!got[topic.quiz[i].q]) return false;
    }
    return true;
  }

  /* the topics that count: the ones your grade covers, or all of them if you skipped it */
  function topicsForMe() {
    if (!S.gradeNum) return window.TOPICS;
    var mine = window.TOPICS.filter(function (t) {
      var r = gradeRange(t);
      return S.gradeNum >= r.lo && S.gradeNum <= r.hi;
    });
    return mine.length ? mine : window.TOPICS;
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
      if (picked && Number(picked.value) === q.c) {
        score++;
        noteMastery(q);
      } else if (picked) missed.push(q);
    });

    if (answered) {
      var gained = score * window.PETS.earn.rightAnswer;
      if (score === qs.length && qs.length > 1) gained += window.PETS.earn.perfectRound;
      var fixed = qs.filter(function (q, i) {
        var picked = $('quiz-form').querySelector('input[name="q' + i + '"]:checked');
        return q.source === 'practice' && picked && Number(picked.value) === q.c;
      }).length;
      gained += fixed * window.PETS.earn.fixedMistake;
      if (gained) earn(gained, score + ' right' + (fixed ? ' and ' + fixed + ' fixed' : ''));
    }

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
    $('duel-view').hidden = true;
    if (window.CHASE) window.CHASE.stop();
    if (window.DUEL) window.DUEL.stop();
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
  loadSparks();
  paintSparks(false);
  renderProfile();
  renderTopics('');
  renderGradeButtons();
  var saved = readGrade();
  if (saved) setGrade(saved, false);
  unlock(1);
  updateGradeNote();
  updateMakeButton();
  renderFindOnline();
})();
