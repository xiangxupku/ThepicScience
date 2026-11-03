/* myvoice.js — narrate the video in your own voice.

   Worth saying plainly what this is and is not. It does not clone your voice: there is no
   model here that can take a sample of you and then read any sentence in it, and there is
   no honest way to do that inside a web page with no server behind it. What it does is
   simpler and, for a lesson, better. You read the pages out loud once, the app keeps the
   recordings, and the video plays you instead of the robot. It sounds like you because it
   is you.

   Every recording stays in IndexedDB on your own device. Nothing is uploaded, there is
   nothing to upload it to, and clearing site data clears the lot. The microphone is only
   opened while you hold the button down.

   A recording is filed against the words it reads, not the page number, so changing the
   length of the video or the grade keeps whatever you have already read. */

(function () {
  'use strict';

  var DB_NAME = 'thepicscience-voice';
  var STORE = 'clips';
  var dbp = null;

  function supported() {
    return !!(window.indexedDB && window.MediaRecorder &&
      navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  function db() {
    if (dbp) return dbp;
    dbp = new Promise(function (resolve, reject) {
      var req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = function () {
        if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE);
      };
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { reject(req.error); };
    });
    return dbp;
  }

  /* Resolve with the request's own result, read in its success handler. Handing back the
     request object itself meant a miss came out truthy, and every line in the video looked
     as though it had already been recorded. */
  function tx(mode, run) {
    return db().then(function (d) {
      return new Promise(function (resolve, reject) {
        var t = d.transaction(STORE, mode);
        var req = run(t.objectStore(STORE));
        var value;
        if (req && typeof req.onsuccess !== 'undefined') {
          req.onsuccess = function () { value = req.result; };
        }
        t.oncomplete = function () { resolve(value); };
        t.onerror = function () { reject(t.error); };
        t.onabort = function () { reject(t.error); };
      });
    });
  }

  /* ── keys ─────────────────────────────────────────────
     Filed against the words, so a recording survives the video being rebuilt at a
     different length, and two pages that read the same line share one clip. */

  function hash(s) {
    var h = 5381;
    for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
    return (h >>> 0).toString(36);
  }

  function keyFor(topicId, narration) {
    return (topicId || 'x') + ':' + hash(String(narration || '').trim().toLowerCase());
  }

  /* ── the store ────────────────────────────────────── */

  function put(key, blob) {
    return tx('readwrite', function (s) { return s.put(blob, key); });
  }

  function get(key) {
    return tx('readonly', function (s) { return s.get(key); });
  }

  function del(key) {
    return tx('readwrite', function (s) { return s.delete(key); });
  }

  function keys() {
    return tx('readonly', function (s) { return s.getAllKeys(); });
  }

  function clear() {
    return tx('readwrite', function (s) { return s.clear(); });
  }

  /* roughly how much room the recordings are taking, for the panel to show */
  function usage() {
    return tx('readonly', function (s) { return s.getAll(); }).then(function (all) {
      return (all || []).reduce(function (n, b) { return n + (b && b.size ? b.size : 0); }, 0);
    });
  }

  /* ── recording ────────────────────────────────────────
     The microphone track is stopped the moment a clip ends, so the browser's recording
     indicator goes out rather than sitting on while the page is open. */

  var rec = null;

  function start(onLevel) {
    if (rec) return Promise.reject(new Error('already recording'));
    return navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
    }).then(function (stream) {
      var mime = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus']
        .filter(function (m) { return window.MediaRecorder.isTypeSupported(m); })[0];
      var mr = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      var chunks = [];
      mr.ondataavailable = function (e) { if (e.data && e.data.size) chunks.push(e.data); };

      var meter = null;
      if (onLevel && window.AudioContext) {
        try {
          var ctx = new AudioContext();
          var an = ctx.createAnalyser();
          an.fftSize = 512;
          ctx.createMediaStreamSource(stream).connect(an);
          var buf = new Uint8Array(an.frequencyBinCount);
          meter = setInterval(function () {
            an.getByteTimeDomainData(buf);
            var peak = 0;
            for (var i = 0; i < buf.length; i++) peak = Math.max(peak, Math.abs(buf[i] - 128));
            onLevel(Math.min(1, peak / 90));
          }, 90);
          mr._ctx = ctx;
        } catch (e) { /* a meter is a nicety, not a requirement */ }
      }

      mr.start();
      rec = { mr: mr, stream: stream, chunks: chunks, meter: meter, mime: mime || 'audio/webm' };
      return true;
    });
  }

  function stop() {
    if (!rec) return Promise.resolve(null);
    var r = rec;
    rec = null;
    return new Promise(function (resolve) {
      r.mr.onstop = function () {
        clearInterval(r.meter);
        r.stream.getTracks().forEach(function (t) { t.stop(); });
        if (r.mr._ctx) { try { r.mr._ctx.close(); } catch (e) {} }
        resolve(new Blob(r.chunks, { type: r.mime }));
      };
      try { r.mr.stop(); } catch (e) { resolve(null); }
    });
  }

  function recording() { return !!rec; }

  /* ── playing one back ─────────────────────────────────
     A recording carries no word-boundary events, which is what the robot voice uses to
     light the captions up. So the words are spread across the clip's own length instead.
     It is an estimate rather than a measurement, and it reads well because a person
     narrating a single sentence keeps a fairly even pace. */

  var current = null;

  /* One context for the life of the page. A fresh one per clip starts suspended, and a
     suspended context that an element has been routed into plays nothing at all. */
  var ctxOne = null;
  function sharedCtx() {
    if (!window.AudioContext) return null;
    if (!ctxOne) {
      try { ctxOne = new AudioContext(); } catch (e) { return null; }
    }
    if (ctxOne.state === 'suspended') { try { ctxOne.resume(); } catch (e) {} }
    return ctxOne;
  }

  /* called on a tap, so the context is already running by the time a clip needs it */
  function wake() { sharedCtx(); }

  function play(blob, opts) {
    stopPlaying();
    opts = opts || {};
    var url = URL.createObjectURL(blob);
    var audio = new Audio(url);
    audio.playbackRate = opts.rate && opts.rate > 0.5 ? Math.min(2, opts.rate) : 1;

    var starts = [];                    /* character index of each word */
    var text = String(opts.text || '');
    var re = /\S+/g, m;
    while ((m = re.exec(text))) starts.push(m.index);

    /* Watch the clip's own loudness, so the face on screen moves with what is actually
       being said rather than on a timer that only knows the word count.

       Routing an audio element through WebAudio takes over its output: if the context is
       not running, the element goes silent. A meter is a nicety and playback is not, so
       the element is only ever rerouted once the context is confirmed running, and any
       failure leaves the plain element playing untouched. */
    var meter = null;
    if (opts.onLevel) {
      try {
        var ctx = sharedCtx();
        if (ctx && ctx.state === 'running') {
          var src = ctx.createMediaElementSource(audio);
          var an = ctx.createAnalyser();
          an.fftSize = 512;
          src.connect(an);
          an.connect(ctx.destination);
          var buf = new Uint8Array(an.frequencyBinCount);
          meter = setInterval(function () {
            an.getByteTimeDomainData(buf);
            var peak = 0;
            for (var i = 0; i < buf.length; i++) peak = Math.max(peak, Math.abs(buf[i] - 128));
            opts.onLevel(Math.min(1, peak / 70));
          }, 60);
        }
      } catch (e) { meter = null; }
    }

    function closeMeter() {
      clearInterval(meter);
      meter = null;
      if (opts.onLevel) opts.onLevel(0);
    }

    var ticker = null;
    function startTicking() {
      if (!opts.onWord || !starts.length) return;
      var dur = isFinite(audio.duration) && audio.duration > 0 ? audio.duration : null;
      ticker = setInterval(function () {
        var frac = dur ? audio.currentTime / dur : 0;
        var at = Math.min(starts.length - 1, Math.floor(frac * starts.length));
        opts.onWord(starts[at]);
      }, 110);
    }

    audio.onloadedmetadata = startTicking;
    audio.onended = function () {
      clearInterval(ticker);
      closeMeter();
      URL.revokeObjectURL(url);
      current = null;
      if (opts.onEnd) opts.onEnd();
    };
    audio.onerror = function () {
      clearInterval(ticker);
      closeMeter();
      URL.revokeObjectURL(url);
      current = null;
      if (opts.onEnd) opts.onEnd();
    };

    current = { audio: audio, ticker: ticker, url: url, closeMeter: closeMeter };
    var p = audio.play();
    if (p && p.catch) p.catch(function () { if (opts.onEnd) opts.onEnd(); });
    /* metadata may already be in by the time the handler is attached */
    if (audio.readyState >= 1) startTicking();
    return audio;
  }

  function stopPlaying() {
    if (!current) return;
    if (current.closeMeter) current.closeMeter();
    clearInterval(current.ticker);
    try { current.audio.pause(); } catch (e) {}
    try { URL.revokeObjectURL(current.url); } catch (e) {}
    current = null;
  }

  function pausePlaying() { if (current) { try { current.audio.pause(); } catch (e) {} } }
  function resumePlaying() { if (current) { try { current.audio.play(); } catch (e) {} } }
  function isPlaying() { return !!(current && !current.audio.paused); }

  window.MYVOICE = {
    supported: supported,
    keyFor: keyFor,
    put: put,
    get: get,
    del: del,
    keys: keys,
    clear: clear,
    usage: usage,

    start: start,
    stop: stop,
    recording: recording,

    wake: wake,
    play: play,
    stopPlaying: stopPlaying,
    pausePlaying: pausePlaying,
    resumePlaying: resumePlaying,
    isPlaying: isPlaying
  };
})();
