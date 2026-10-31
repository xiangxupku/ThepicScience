/* match.js — making step 2 forgiving.

   A whiteboard photo gives us text that is misread as often as it is mistyped: OCR turns
   "photosynthesis" into "photosynthess", a student writes "mitocondria", a teacher writes
   "how plants make food" and never once writes the word photosynthesis. The old matcher
   tested keywords as plain substrings, so all three of those missed completely.

   Three passes fix most of it:
     1. synonyms  — the phrasings a board actually uses, mapped onto library keywords
     2. spelling  — each long word snapped to the nearest keyword within an edit or two
     3. ranking   — every topic scored, and the best three offered rather than just one
   Every pass is additive: a word that already matches is left alone. */

(function () {
  'use strict';

  /* ── what boards say instead of the textbook word ──────
     Left side is what gets written on a board or typed into the search box; right side is
     a keyword that already exists in the library. Multi-word keys are matched as phrases
     before single words, so "cell division" beats "cell". */
  var SYNONYMS = {
    'how plants make food': ['photosynthesis', 'chlorophyll'],
    'plants make food': ['photosynthesis'],
    'plant food': ['photosynthesis'],
    'food from sunlight': ['photosynthesis'],
    'cell division': ['mitosis', 'meiosis'],
    'cell splitting': ['mitosis'],
    'body cells': ['cells', 'cell'],
    'building blocks of life': ['cells'],
    'parts of a cell': ['cells', 'organelle'],
    'powerhouse of the cell': ['mitochondria'],
    'heredity': ['genetics', 'inheritance'],
    'passed down': ['genetics', 'inheritance'],
    'traits from parents': ['genetics', 'inheritance'],
    'survival of the fittest': ['evolution', 'natural selection'],
    'change over time': ['evolution'],
    'germs': ['bacteria', 'virus', 'microbes'],
    'getting sick': ['disease', 'bacteria', 'virus'],
    'breathing': ['respiration', 'lungs'],
    'how we breathe': ['respiration', 'lungs'],
    'food chain': ['food chain', 'ecosystem'],
    'living things and their homes': ['ecosystem', 'habitat'],
    'sorting living things': ['classification'],
    'naming living things': ['classification'],
    'nerves': ['nervous system', 'neuron'],
    'brain and nerves': ['nervous system', 'neuron'],
    'water in plants': ['transpiration', 'xylem'],
    'states of water': ['states of matter', 'evaporation'],
    'solid liquid gas': ['states of matter'],
    'changing state': ['states of matter', 'melting', 'evaporation'],
    'rain cycle': ['water cycle', 'evaporation', 'condensation'],
    'where rain comes from': ['water cycle'],
    'tiny particles': ['atoms', 'particle'],
    'what things are made of': ['atoms', 'element'],
    'periodic table': ['element', 'atoms'],
    'push and pull': ['force', 'forces'],
    'pushes and pulls': ['force', 'forces'],
    'how things move': ['forces', 'motion'],
    'newtons laws': ['forces', 'motion'],
    'speed and motion': ['motion', 'speed'],
    'making things move': ['forces', 'energy'],
    'types of energy': ['energy', 'kinetic', 'potential'],
    'where energy goes': ['energy'],
    'electricity': ['circuit', 'current'],
    'making a circuit': ['circuit', 'current'],
    'bulbs and batteries': ['circuit', 'battery'],
    'light and sound': ['waves', 'light', 'sound'],
    'how light travels': ['light', 'reflection', 'refraction'],
    'bending light': ['refraction', 'lens'],
    'bouncing light': ['reflection', 'mirror'],
    'magnets': ['magnetism', 'magnet'],
    'north and south pole': ['magnetism', 'magnet'],
    'acids and alkalis': ['acids', 'bases', 'ph'],
    'ph scale': ['ph', 'acids', 'bases'],
    'sour and bitter': ['acids', 'bases'],
    'mixing things': ['mixtures', 'solution'],
    'separating mixtures': ['mixtures', 'filtration', 'distillation'],
    'new substance': ['chemical change', 'chemical reaction'],
    'chemical reaction': ['chemical change'],
    'burning': ['chemical change', 'combustion'],
    'earthquakes and volcanoes': ['plate tectonics', 'volcano', 'earthquake'],
    'moving plates': ['plate tectonics'],
    'layers of the earth': ['earth layers', 'plate tectonics'],
    'planets': ['solar system', 'planet'],
    'space': ['solar system', 'planet', 'stars'],
    'the sun and planets': ['solar system'],
    'body parts': ['body systems', 'organ'],
    'organ systems': ['body systems', 'organ'],
    'digesting food': ['digestion', 'stomach'],
    'breaking down food': ['digestion', 'enzyme'],
    'speeding up reactions': ['enzyme', 'catalyst'],
    'simple machines': ['lever', 'pulley', 'inclined plane'],
    'levers and pulleys': ['lever', 'pulley'],
    'how sound travels': ['sound', 'vibration'],
    'loud and quiet': ['sound', 'volume', 'amplitude'],
    'high and low notes': ['pitch', 'frequency'],
    'heat travel': ['heat transfer', 'conduction', 'convection'],
    'hot and cold': ['heat transfer', 'temperature'],
    'float and sink': ['density', 'buoyancy'],
    'floating and sinking': ['density', 'buoyancy'],
    'weather': ['weather', 'climate'],
    'types of rock': ['rock cycle', 'igneous', 'sedimentary'],
    'rocks and minerals': ['rock cycle', 'mineral'],
    'wearing away rock': ['weathering', 'erosion'],
    'moon': ['moon phases', 'moon'],
    'why we have seasons': ['seasons', 'tilt'],
    'fair test': ['scientific method', 'variable'],
    'doing an experiment': ['scientific method', 'experiment'],
    'how science works': ['scientific method', 'hypothesis'],
    'life cycle': ['life cycle', 'metamorphosis'],
    'butterfly life cycle': ['metamorphosis', 'life cycle'],
    'animal adaptations': ['adaptation', 'adaptations'],
    'dissolving': ['solution', 'solute', 'dissolve'],
    'solutions': ['solution', 'solute', 'solvent']
  };

  /* Single words that mean an existing keyword but never appear in the keyword lists. */
  var WORD_SYNONYMS = {
    photosynthesise: ['photosynthesis'], photosynthesize: ['photosynthesis'],
    germ: ['bacteria', 'virus'], germs: ['bacteria', 'virus'],
    microbe: ['microbes'], bug: ['bacteria'], bugs: ['bacteria'],
    alkali: ['bases'], alkalis: ['bases'], alkaline: ['bases'],
    amp: ['current'], amps: ['current'], volt: ['voltage'], volts: ['voltage'],
    quake: ['earthquake'], quakes: ['earthquake'],
    organelle: ['cells'], organelles: ['cells'],
    inherit: ['inheritance'], inherited: ['inheritance'], hereditary: ['inheritance'],
    offspring: ['inheritance', 'genetics'],
    predator: ['food chain', 'ecosystem'], prey: ['food chain', 'ecosystem'],
    habitat: ['ecosystem'], habitats: ['ecosystem'],
    friction: ['forces'], gravity: ['forces'], weight: ['forces'],
    newton: ['forces'], newtons: ['forces'],
    joule: ['energy'], joules: ['energy'],
    watt: ['energy'], watts: ['energy'],
    echo: ['sound'], echoes: ['sound'], decibel: ['sound'], decibels: ['sound'],
    hertz: ['frequency'], thermometer: ['temperature'],
    insulator: ['heat transfer', 'circuit'], conductor: ['heat transfer', 'circuit'],
    buoyant: ['buoyancy'], upthrust: ['buoyancy'],
    forecast: ['weather'], meteorologist: ['weather'],
    lunar: ['moon phases'], crescent: ['moon phases'], waxing: ['moon phases'], waning: ['moon phases'],
    equinox: ['seasons'], solstice: ['seasons'], tilted: ['tilt'],
    variable: ['scientific method'], variables: ['scientific method'],
    hypothesis: ['scientific method'], prediction: ['scientific method'],
    larva: ['metamorphosis'], pupa: ['metamorphosis'], chrysalis: ['metamorphosis'],
    tadpole: ['metamorphosis', 'life cycle'],
    camouflage: ['adaptation'], beak: ['adaptation'], beaks: ['adaptation'],
    dissolve: ['solution'], dissolved: ['solution'], soluble: ['solution'],
    saturated: ['solution'], solubility: ['solution']
  };

  /* Words that carry no subject meaning. Scoring them produces nonsense matches on a
     board that happens to say "today" or "homework". */
  var STOP = (' the a an and or of to in on is are was were be been it its this that these those ' +
    'for with from by as at we you your their there here what which who how why when where ' +
    'do does did done make makes made use uses used using write writes written answer answers ' +
    'question questions homework today tomorrow yesterday page pages chapter note notes class ' +
    'lesson learn learning learnt study lab worksheet name date title copy draw label diagram ' +
    'test quiz exam revision review example examples remember must should can could will would ' +
    'about into out up down over under more less than then also because so if but not all some ' +
    'each both very much many any new old next last first second third part parts ').split(/\s+/);
  var STOP_SET = {};
  STOP.forEach(function (w) { if (w) STOP_SET[w] = true; });

  /* ── vocabulary, built once from whatever the library holds ── */
  var vocabCache = null;
  function vocabulary() {
    if (vocabCache) return vocabCache;
    var words = {};
    var topics = window.TOPICS || [];
    topics.forEach(function (topic) {
      (topic.keywords || []).forEach(function (keyword) {
        String(keyword).toLowerCase().split(/\s+/).forEach(function (part) {
          if (part.length >= 4) words[part] = true;
        });
      });
      String(topic.title || '').toLowerCase().split(/\s+/).forEach(function (part) {
        if (part.length >= 4) words[part] = true;
      });
    });
    Object.keys(WORD_SYNONYMS).forEach(function (w) { if (w.length >= 4) words[w] = true; });
    vocabCache = Object.keys(words);
    return vocabCache;
  }

  /* Bounded edit distance. Bailing out as soon as the row minimum passes the limit keeps
     this cheap enough to run against the whole vocabulary for every word on a board. */
  function editDistance(a, b, limit) {
    if (a === b) return 0;
    if (Math.abs(a.length - b.length) > limit) return limit + 1;
    var previous = [];
    for (var j = 0; j <= b.length; j += 1) previous[j] = j;
    for (var i = 1; i <= a.length; i += 1) {
      var current = [i];
      var rowMin = i;
      for (var k = 1; k <= b.length; k += 1) {
        var cost = a.charAt(i - 1) === b.charAt(k - 1) ? 0 : 1;
        current[k] = Math.min(previous[k] + 1, current[k - 1] + 1, previous[k - 1] + cost);
        if (current[k] < rowMin) rowMin = current[k];
      }
      if (rowMin > limit) return limit + 1;
      previous = current;
    }
    return previous[b.length];
  }

  /* How wrong a word is allowed to be before we stop guessing. Short words get no slack —
     "cell" and "bell" are one apart and mean nothing like each other. */
  function slackFor(word) {
    if (word.length <= 4) return 0;
    if (word.length <= 6) return 1;
    return 2;
  }

  function correctWord(word) {
    var list = vocabulary();
    if (!word || word.length < 5) return null;
    for (var exact = 0; exact < list.length; exact += 1) if (list[exact] === word) return null;
    var limit = slackFor(word);
    if (!limit) return null;
    var best = null, bestScore = limit + 1;
    for (var i = 0; i < list.length; i += 1) {
      var candidate = list[i];
      if (Math.abs(candidate.length - word.length) > limit) continue;
      if (candidate.charAt(0) !== word.charAt(0)) continue;   /* first letters rarely both wrong */
      var d = editDistance(word, candidate, limit);
      if (d < bestScore) { bestScore = d; best = candidate; }
      if (bestScore === 1) break;
    }
    return best && bestScore <= limit ? { from: word, to: best, distance: bestScore } : null;
  }

  /* ── turn raw board text into something worth scoring ──
     Returns the cleaned text plus the corrections and synonyms that were applied, so the
     interface can tell the student what it assumed rather than silently guessing. */
  function expand(raw) {
    var text = ' ' + String(raw || '').toLowerCase().replace(/[^a-z0-9₂₄₆\s]/g, ' ').replace(/\s+/g, ' ').trim() + ' ';
    var added = [];
    var fixes = [];
    var usedSynonyms = [];

    Object.keys(SYNONYMS).forEach(function (phrase) {
      if (text.indexOf(' ' + phrase + ' ') > -1) {
        SYNONYMS[phrase].forEach(function (target) { added.push(target); });
        usedSynonyms.push(phrase);
      }
    });

    var words = text.trim().split(/\s+/).filter(Boolean);
    var seenFix = {};
    words.forEach(function (word) {
      if (STOP_SET[word] || word.length < 4) return;
      if (WORD_SYNONYMS[word]) {
        WORD_SYNONYMS[word].forEach(function (target) { added.push(target); });
        if (usedSynonyms.indexOf(word) < 0) usedSynonyms.push(word);
        return;
      }
      var fix = correctWord(word);
      if (fix && !seenFix[fix.from]) {
        seenFix[fix.from] = true;
        fixes.push(fix);
        added.push(fix.to);
      }
    });

    var expanded = text + (added.length ? added.join(' ') + ' ' : '');
    return { text: expanded, original: text, fixes: fixes, synonyms: usedSynonyms, added: added };
  }

  /* ── scoring a topic against prepared text ──────────── */
  function scoreTopic(topic, prepared) {
    var text = prepared.text;
    var score = 0;
    var hit = [];
    (topic.keywords || []).forEach(function (keyword) {
      var key = String(keyword).toLowerCase();
      var found = key.indexOf(' ') > -1
        ? text.indexOf(' ' + key + ' ') > -1 || text.indexOf(' ' + key) > -1
        : text.indexOf(' ' + key + ' ') > -1;
      if (!found) return;
      /* A phrase is strong evidence; a long single word is decent; a short one is weak.
         Anything we only know because we corrected or expanded it counts for less, so a
         guessed spelling never outranks a word the board really said. */
      var weight = key.indexOf(' ') > -1 ? 4 : key.length > 6 ? 3 : 2;
      if (prepared.original.indexOf(' ' + key) < 0) weight = Math.max(1, weight - 1);
      score += weight;
      hit.push(keyword);
    });
    String(topic.title || '').toLowerCase().split(/\s+/).forEach(function (word) {
      if (word.length > 3 && text.indexOf(' ' + word) > -1) score += 2;
    });
    return { topic: topic, score: score, words: hit };
  }

  /* Top matches, best first. Anything below the floor is dropped so a single stray word
     cannot present itself as a confident answer. */
  function matchTopics(raw, options) {
    var settings = options || {};
    var prepared = expand(raw);
    var floor = typeof settings.floor === 'number' ? settings.floor : 4;
    var results = [];
    (window.TOPICS || []).forEach(function (topic) {
      var scored = scoreTopic(topic, prepared);
      if (scored.score >= floor) results.push(scored);
    });
    results.sort(function (a, b) { return b.score - a.score || a.topic.title.localeCompare(b.topic.title); });
    results.prepared = prepared;
    return results;
  }

  /* ── the manual search box ─────────────────────────────
     Same spelling help, so typing "photosinthesis" finds the lesson instead of an empty
     list. Returns the corrected query too, so the page can say what it searched for. */
  function searchTopics(query) {
    var raw = String(query || '').trim().toLowerCase();
    if (!raw) return { list: (window.TOPICS || []).slice(), corrected: null };
    var words = raw.split(/\s+/).filter(Boolean);
    var corrected = [];
    var changed = false;
    words.forEach(function (word) {
      var fix = word.length >= 5 ? correctWord(word) : null;
      if (fix) { corrected.push(fix.to); changed = true; } else corrected.push(word);
    });
    var usedWords = corrected;
    var whole = usedWords.join(' ');
    var synonymTargets = [];
    if (SYNONYMS[whole]) synonymTargets = SYNONYMS[whole].slice();
    usedWords.forEach(function (word) { if (WORD_SYNONYMS[word]) synonymTargets = synonymTargets.concat(WORD_SYNONYMS[word]); });

    var scored = (window.TOPICS || []).map(function (topic) {
      return { topic: topic, n: queryScore(topic, usedWords, whole, synonymTargets) };
    }).filter(function (entry) { return entry.n > 0; })
      .sort(function (a, b) { return b.n - a.n; })
      .map(function (entry) { return entry.topic; });

    return { list: scored, corrected: changed ? whole : null, synonyms: synonymTargets };
  }

  function queryScore(topic, words, whole, synonymTargets) {
    var title = String(topic.title || '').toLowerCase();
    var subject = String(topic.subject || '').toLowerCase();
    var blurb = String(topic.blurb || '').toLowerCase();
    var keywords = (topic.keywords || []).map(function (k) { return String(k).toLowerCase(); });
    var total = 0;

    for (var e = 0; e < keywords.length; e += 1) {
      if (keywords[e] === whole) { total += 150; break; }
    }
    /* A synonym hit is real evidence but should not beat the literal word. */
    synonymTargets.forEach(function (target) {
      if (keywords.indexOf(target) > -1 || title.indexOf(target) > -1) total += 55;
    });

    for (var i = 0; i < words.length; i += 1) {
      var word = words[i];
      var best = 0, hits = 0;
      for (var k = 0; k < keywords.length; k += 1) {
        var key = keywords[k];
        if (key.indexOf(word) > -1) hits += 1;
        if (key === word) best = Math.max(best, 100);
        else if (key.indexOf(word) === 0) best = Math.max(best, 40);
        else if (key.indexOf(word) > -1) best = Math.max(best, 18);
      }
      if (hits > 1) best += Math.min(9, (hits - 1) * 3);
      if (title.indexOf(word) > -1) best = Math.max(best, 60);
      if (subject.indexOf(word) > -1) best = Math.max(best, 8);
      if (blurb.indexOf(word) > -1) best = Math.max(best, 6);
      if (!best && !synonymTargets.length) return 0;   /* every word has to land somewhere */
      total += best;
    }
    return total;
  }

  window.MATCH = {
    expand: expand,
    correctWord: correctWord,
    matchTopics: matchTopics,
    searchTopics: searchTopics,
    editDistance: editDistance,
    _resetVocab: function () { vocabCache = null; }
  };
})();
