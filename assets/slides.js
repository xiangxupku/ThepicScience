/* slides.js — turn a long list into a deck you swipe.

   The picture book was always pages: one idea, a drawing, Back and Next. Everything else
   was a column you scrolled. Cutting things down to make the column shorter was the wrong
   answer — the library did not need fewer topics, it needed to stop being a column.

   So this takes a list of items and lays them out as slides: a row of pages you swipe on a
   phone, or step through with the arrows and the keyboard. One screen tall, however many
   items there are. Forty-three topics take eight swipes instead of six screens of scroll.

   How it is wired: the page keeps its ordinary list in the DOM and hides it. That list is
   still the thing the app writes into, so nothing above this file had to learn a new way to
   render. After writing, call render() and the items are dealt into slides. Rebuilding the
   source list and calling render() again is the whole update path.

   Swiping is the browser's own horizontal scrolling with CSS snap points, so it has real
   momentum on a phone and it works with a trackpad, a mouse wheel tilt and a screen reader
   without any of that being written here. */

(function () {
  'use strict';

  var decks = [];          /* every live deck, so one resize listener serves them all */

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  /* How many items fit across? Measured, not guessed, so it answers correctly on a phone,
     on a tablet held either way, and in a window somebody is dragging wider. */
  function columns(width, min, gap) {
    if (!width) return 1;
    return Math.max(1, Math.floor((width + gap) / (min + gap)));
  }

  function render(source, deck, opts) {
    opts = opts || {};
    var rows = opts.rows || 3;
    var min = opts.min || 230;
    var gap = opts.gap || 8;
    var label = opts.label || 'items';

    var items = [].slice.call(source.children);
    deck.innerHTML = '';
    if (!items.length) { deck.hidden = true; return null; }
    deck.hidden = false;

    var width = deck.clientWidth || deck.parentNode.clientWidth || 0;
    var cols = columns(width, min, gap);
    /* One column means a phone, and three cards is a thin slide to swipe fifteen times.
       Taller slides, fewer of them. */
    if (!opts.rows) rows = cols === 1 ? 5 : 3;
    var per = opts.perSlide || (cols * rows);
    var pages = Math.ceil(items.length / per);

    var track = el('div', 'deck-track');
    track.setAttribute('tabindex', '0');
    track.setAttribute('role', 'group');
    track.setAttribute('aria-label', items.length + ' ' + label + ', ' + pages + ' pages');

    for (var p = 0; p < pages; p++) {
      var slide = el('div', 'deck-slide');
      /* the slide holds a copy of the original list element, so a <ul> keeps its <li>s and
         the page's own styling comes along unchanged */
      var holder = document.createElement(source.tagName);
      holder.className = source.className;
      holder.style.gridTemplateColumns = 'repeat(' + cols + ', minmax(0, 1fr))';
      for (var i = p * per; i < Math.min(items.length, (p + 1) * per); i++) holder.appendChild(items[i]);
      slide.appendChild(holder);
      track.appendChild(slide);
    }

    deck.appendChild(track);

    var bar = el('div', 'deck-bar');
    var prev = el('button', 'deck-arrow', '←');
    prev.type = 'button';
    prev.setAttribute('aria-label', 'Previous page');
    var count = el('p', 'deck-count');
    var next = el('button', 'deck-arrow', '→');
    next.type = 'button';
    next.setAttribute('aria-label', 'Next page');
    var dots = el('span', 'deck-dots');
    bar.appendChild(prev);
    bar.appendChild(count);
    bar.appendChild(dots);
    bar.appendChild(next);
    if (pages > 1) deck.appendChild(bar);

    function at() {
      var w = track.clientWidth || 1;
      return Math.min(pages - 1, Math.max(0, Math.round(track.scrollLeft / w)));
    }

    function paint() {
      var n = at();
      /* One section to a slide means the slides are all different heights, and a deck as
         tall as its longest section leaves a hole under every short one. The deck takes
         the height of the slide you are on instead. */
      if (opts.perSlide === 1) {
        var here = track.children[n];
        if (here) track.style.height = here.scrollHeight + 'px';
      }
      count.textContent = (n + 1) + ' of ' + pages;
      prev.disabled = n === 0;
      next.disabled = n === pages - 1;
      dots.innerHTML = '';
      for (var d = 0; d < pages; d++) {
        dots.appendChild(el('i', 'deck-dot' + (d === n ? ' is-here' : '')));
      }
    }

    /* Scroll the slide itself into view rather than setting scrollLeft. A programmatic
       scroll on a mandatory-snap container can be dropped on the floor; asking the slide to
       come into view cooperates with the snapping instead of fighting it. */
    function go(n) {
      n = Math.min(pages - 1, Math.max(0, n));
      var slide = track.children[n];
      if (!slide) return;
      /* Straight there, no animation. A smooth programmatic scroll is run frame by frame,
         and the frames stop in a backgrounded or offscreen page — the deck then sits where
         it was and the arrows look broken. Swiping keeps the browser's own momentum, which
         is where the nice feel actually comes from; the arrows just land. */
      track.scrollLeft = n * slide.offsetWidth;
      paint();
    }

    prev.addEventListener('click', function () { go(at() - 1); });
    next.addEventListener('click', function () { go(at() + 1); });
    track.addEventListener('scroll', function () {
      clearTimeout(track._t);
      track._t = setTimeout(paint, 60);
    });
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(at() + 1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); go(at() - 1); }
    });

    paint();

    var handle = {
      deck: deck, source: source, opts: opts, pages: pages,
      cols: cols, width: width,
      page: at,
      go: go,
      redraw: paint
    };
    decks = decks.filter(function (d) { return d.deck !== deck; });
    decks.push(handle);
    watch(handle);
    return handle;
  }

  /* Take the items back out of the slides and deal them again. */
  function repaginate(d) {
    var was = d.page();
    var total = d.pages;
    [].slice.call(d.deck.querySelectorAll('.deck-slide > *')).forEach(function (holder) {
      while (holder.firstChild) d.source.appendChild(holder.firstChild);
    });
    var fresh = render(d.source, d.deck, d.opts);
    if (fresh && total > 1) fresh.go(Math.round(was / total * fresh.pages));
    return fresh;
  }

  /* A deck inside a folded step or a hidden tab has no width yet, so it would be dealt one
     card wide and stay that way once it appeared. Watching the box means it is dealt again
     the moment it has a real size — and only then, because the column count has to have
     actually changed. */
  function watch(d) {
    if (typeof ResizeObserver !== 'function' || d.deck._watched) return;
    d.deck._watched = true;
    var ro = new ResizeObserver(function () {
      var live = decks.filter(function (x) { return x.deck === d.deck; })[0];
      if (!live) return;
      var w = live.deck.clientWidth;
      if (!w) return;
      var opts = live.opts;
      var c = columns(w, opts.min || 230, opts.gap || 8);
      if (c === live.cols && Math.abs(w - live.width) < 40) return;
      clearTimeout(live.deck._rt);
      live.deck._rt = setTimeout(function () { repaginate(live); }, 60);
    });
    ro.observe(d.deck);
  }

  /* A window that changed width may fit a different number across, so the items are dealt
     again. The page you were on is kept, because losing your place on a resize is worse
     than the resize itself. */
  var timer = null;
  window.addEventListener('resize', function () {
    clearTimeout(timer);
    timer = setTimeout(function () {
      decks.slice().forEach(repaginate);
    }, 180);
  });

  /* Deal any deck again whose shape no longer suits its box. A deck inside a folded step
     or a hidden tab has no width when it is first dealt, so it comes out one card wide;
     this is what the page calls when it opens that step. The resize observer above covers
     a window being dragged, but observers fire on their own schedule and opening a step
     should not look slow. */
  function refresh() {
    decks.slice().forEach(function (d) {
      var w = d.deck.clientWidth;
      if (!w) return;
      var c = columns(w, d.opts.min || 230, d.opts.gap || 8);
      if (c !== d.cols) repaginate(d);
      else d.redraw();
    });
  }

  window.SLIDES = { render: render, refresh: refresh };
})();
