/* topics-e.js — science library, topics 22–27: the biology a course actually spends weeks on.

   The library had seven life science topics and fourteen everything else, which did not
   match any real timetable. These are the six biggest gaps, measured against what US, UK
   and Canadian courses set as whole units:

     respiration      the partner to photosynthesis, and somehow the one everybody skips
     cell division    genetics gave mitosis and meiosis one scene between them
     enzymes          a GCSE Biology chapter on its own, and missing entirely
     classification   kingdoms, binomial names and keys
     plant transport  xylem, phloem, stomata, transpiration
     nervous system   neurones, the reflex arc and synapses

   Same shape as every other topic: twelve scenes, four of each tier, the last one a recap,
   and ten questions. See the README for the rules this file has to keep. */

(function () {
  'use strict';

  var T = [

  /* ── 22. respiration ──────────────────────────────── */
  {
    id: 'respiration',
    title: 'Respiration: how a cell gets energy',
    subject: 'Life science',
    grades: 'Grades 5–12',
    taught: 'UK: Respiration (KS3 Biology, GCSE Biology) · US: Matter and energy in organisms (NGSS MS-LS1-7, HS-LS1-7) · Canada: Cells (Ontario Gr 8), Biology (Gr 11)',
    blurb: 'How food becomes energy a cell can actually use, with oxygen and without.',
    keywords: [
      'respiration', 'respire', 'respiring', 'cellular respiration', 'aerobic', 'aerobic respiration',
      'anaerobic', 'anaerobic respiration', 'atp', 'glucose', 'mitochondria', 'mitochondrion',
      'lactic acid', 'lactic', 'fermentation', 'ferment', 'oxygen debt', 'energy release',
      'breathing', 'gas exchange', 'respirasion', 'respiraton', 'anerobic', 'glucoze'
    ],
    example: {
      t: 'Why bread has holes in it',
      b: 'Yeast in dough respires without oxygen and gives off carbon dioxide. The gas cannot escape the stretchy dough, so it collects in pockets and pushes the loaf up. Baking kills the yeast and sets the holes in place.',
      spot: 'Look at a slice of bread. Every hole was one bubble of gas from a living thing.'
    },
    scenes: [
      {
        tier: 1,
        t: 'Food is not energy yet',
        art: 'respire',
        labels: ['sugar + oxygen in', 'usable energy out'],
        b: 'A sandwich is not energy, any more than a log is heat. Something has to release it. Respiration is the reaction every living cell runs to get the energy out of food, quietly, all the time.',
        s: 'Food is not energy yet. Cells have to get the energy out of it. That is respiration.',
        term: { w: 'Respiration', d: 'the reaction cells use to release energy from food.' }
      },
      {
        tier: 1,
        t: 'Every living cell, every second',
        art: 'animalCell',
        labels: ['never stops', 'even while you sleep'],
        b: 'This is not something you do at the gym. Your cells do it while you sleep, a plant does it at night, and a seed does it inside the packet. Stop respiring and you are not alive.',
        s: 'Every living cell does this all the time. Even plants. Even while you sleep.',
        term: { w: 'Living', d: 'one test of life is that it releases energy from food.' }
      },
      {
        tier: 1,
        t: 'ATP is the money, not the food',
        art: 'atp',
        labels: ['glucose is the wages', 'ATP is the coins'],
        b: 'A cell cannot spend glucose directly, the way you cannot buy lunch with a cheque. Respiration turns it into ATP, a small molecule the cell breaks open whenever it needs a push.',
        s: 'Cells turn sugar into ATP. ATP is the energy a cell can actually spend.',
        term: { w: 'ATP', d: 'the small molecule cells use as ready-to-spend energy.' }
      },
      {
        tier: 2,
        t: 'The word equation',
        art: 'molecule',
        labels: ['glucose + oxygen', 'carbon dioxide + water'],
        b: 'With oxygen, the reaction is: glucose + oxygen → carbon dioxide + water, releasing energy. In symbols, C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O. Nothing is destroyed. The atoms are rearranged, and energy that was stored in the bonds comes out.',
        s: 'Sugar plus oxygen gives carbon dioxide plus water, and lets energy out.',
        term: { w: 'Aerobic', d: 'respiration that uses oxygen. It releases the most energy.' }
      },
      {
        tier: 2,
        t: 'Mitochondria are the place',
        art: 'mitochondria',
        labels: ['folded inside', 'more folds, more room'],
        b: 'Most of aerobic respiration happens inside mitochondria. They are folded in on themselves, which packs a huge surface into a tiny space. A muscle cell carries thousands; a cell that does little work carries far fewer.',
        s: 'Most of it happens inside tiny parts called mitochondria. Busy cells have more.',
        term: { w: 'Mitochondrion', d: 'the folded part of a cell where most respiration happens.' }
      },
      {
        tier: 2,
        t: 'Breathing is not respiration',
        art: 'lungs',
        labels: ['breathing moves air', 'respiration is chemistry'],
        b: 'This is the one that loses marks. Breathing is a muscle moving air in and out of lungs. Respiration is a chemical reaction inside cells. Breathing delivers the oxygen respiration needs, which is why they get confused, but they are not the same thing.',
        s: 'Breathing moves air. Respiration is the reaction inside cells. They are not the same.',
        term: { w: 'Breathing', d: 'moving air in and out. It supplies respiration, it is not respiration.' }
      },
      {
        tier: 2,
        t: 'Why running makes you hot',
        art: 'thermometer',
        labels: ['some energy escapes as heat'],
        b: 'No energy transfer is perfect. Some of what respiration releases always leaves as heat, which is why you warm up when you run and why a compost heap steams. Birds and mammals use that waste heat to hold a steady body temperature.',
        s: 'Some energy always leaves as heat. That is why running makes you hot.',
        term: { w: 'Waste heat', d: 'energy that escapes instead of being used, in every transfer.' }
      },
      {
        tier: 3,
        t: 'When the oxygen runs short',
        art: 'yeastTube',
        labels: ['no oxygen', 'much less energy'],
        b: 'If oxygen cannot arrive fast enough, cells carry on without it. This is anaerobic respiration. It is quick to start and needs no oxygen at all, but it releases only a fraction of the energy, because the glucose is not broken all the way down.',
        s: 'With no oxygen, cells can still get energy. They just get much less of it.',
        term: { w: 'Anaerobic', d: 'respiration without oxygen. Faster to start, far less energy.' }
      },
      {
        tier: 3,
        t: 'Lactic acid and the burn',
        art: 'person',
        labels: ['glucose → lactic acid', 'paid back afterwards'],
        b: 'In your muscles, anaerobic respiration turns glucose into lactic acid. It builds up and your legs start to ache. Afterwards you keep breathing hard to take in the extra oxygen needed to clear it, which is the oxygen debt.',
        s: 'Hard exercise makes lactic acid in muscles. That is the ache. Deep breaths clear it.',
        term: { w: 'Oxygen debt', d: 'the extra oxygen owed after exercise, to clear the lactic acid.' }
      },
      {
        tier: 3,
        t: 'Yeast does it differently',
        art: 'beaker',
        labels: ['glucose → ethanol + CO₂'],
        b: 'Yeast is a fungus, and without oxygen it turns glucose into ethanol and carbon dioxide rather than lactic acid. That one difference built two industries: the carbon dioxide raises bread, and the ethanol is what brewing is for.',
        s: 'Yeast with no air makes a gas and alcohol. That gas is what makes bread rise.',
        term: { w: 'Fermentation', d: 'anaerobic respiration in yeast, giving ethanol and carbon dioxide.' }
      },
      {
        tier: 3,
        t: 'The opposite of photosynthesis',
        art: 'cycleArrows',
        labels: ['one stores, one releases'],
        b: 'Photosynthesis takes carbon dioxide and water and builds glucose, storing energy. Respiration takes glucose and oxygen and gives carbon dioxide and water back, releasing it. Plants do both. In daylight they photosynthesise faster than they respire, which is why they give out oxygen overall.',
        s: 'One builds sugar and stores energy. The other breaks it down and lets energy out.',
        term: { w: 'Balance', d: 'the two reactions run opposite ways and keep the gases cycling.' }
      },
      {
        tier: 1,
        t: 'Say it in one breath',
        art: 'checklist',
        labels: ['food → ATP · with or without air'],
        b: 'Respiration releases energy from food inside every living cell. With oxygen it gives carbon dioxide, water and plenty of ATP. Without oxygen it gives far less, plus lactic acid in you or ethanol in yeast.',
        s: 'Cells get energy out of food. With air they get a lot. Without air they get a little.',
        term: { w: 'Big idea', d: 'food in, ATP out, and oxygen decides how much you get.' }
      }
    ],
    quiz: [
      { q: 'Respiration happens in…', a: ['Every living cell', 'Only the lungs', 'Only animals'], c: 0, why: 'Every living cell respires, plants and animals alike, all the time.' },
      { q: 'What does a cell actually spend its energy as?', a: ['ATP', 'Glucose', 'Oxygen'], c: 0, why: 'Glucose is the store. ATP is the form a cell can use straight away.' },
      { q: 'Aerobic respiration gives out…', a: ['Carbon dioxide and water', 'Oxygen and glucose', 'Lactic acid only'], c: 0, why: 'Glucose plus oxygen gives carbon dioxide plus water, and releases energy.' },
      { q: 'Most aerobic respiration happens inside the…', a: ['Mitochondria', 'Nucleus', 'Cell wall'], c: 0, why: 'Mitochondria are folded to pack a lot of working surface into a small space.' },
      { q: 'Breathing and respiration are…', a: ['Different things', 'The same thing', 'Both muscle movements'], c: 0, why: 'Breathing moves air. Respiration is a chemical reaction inside cells.' },
      { q: 'Anaerobic respiration releases…', a: ['Much less energy than aerobic', 'More energy than aerobic', 'Exactly the same'], c: 0, why: 'Without oxygen the glucose is not broken all the way down, so less energy comes out.' },
      { q: 'Anaerobic respiration in your muscles makes…', a: ['Lactic acid', 'Ethanol', 'Oxygen'], c: 0, why: 'Muscles make lactic acid. Yeast is the one that makes ethanol.' },
      { q: 'Yeast respiring without oxygen gives…', a: ['Ethanol and carbon dioxide', 'Lactic acid', 'Water only'], c: 0, why: 'That carbon dioxide is what raises bread, and the ethanol is what brewing uses.' },
      { q: 'Why do you keep panting after a sprint?', a: ['To repay the oxygen debt', 'To cool your lungs down', 'To make more glucose'], c: 0, why: 'The extra oxygen clears the lactic acid that built up while you ran.' },
      { q: 'Respiration and photosynthesis are best described as…', a: ['Opposite reactions', 'The same reaction', 'Unrelated'], c: 0, why: 'One stores energy by building glucose, the other releases it by breaking glucose down.' }
    ]
  },

  /* ── 23. cell division ────────────────────────────── */
  {
    id: 'cell-division',
    title: 'Cell division: mitosis and meiosis',
    subject: 'Life science',
    grades: 'Grades 6–12',
    taught: 'UK: Cell division (GCSE Biology), Cells (KS3) · US: Growth and development of organisms (NGSS MS-LS1-1, HS-LS1-4, HS-LS3-2) · Canada: Biology (Ontario Gr 11), Cells (Gr 8)',
    blurb: 'How one cell becomes two identical ones, and how a different kind of division makes sex cells.',
    keywords: [
      'mitosis', 'meiosis', 'cell division', 'cell cycle', 'chromosome', 'chromosomes', 'chromatid',
      'diploid', 'haploid', 'gamete', 'gametes', 'sex cells', 'daughter cells', 'replication',
      'cytokinesis', 'interphase', 'spindle', 'clone', 'stem cell', 'stem cells',
      'mitosys', 'myosis', 'meosis', 'chromosone'
    ],
    example: {
      t: 'How a cut closes up',
      b: 'A scab is mitosis you can watch. Skin cells at the edge of the cut copy themselves and divide, again and again, until the gap is filled with cells identical to the ones that were lost. A week later the scab falls off.',
      spot: 'Fingernails do the same thing without stopping, which is why they need cutting.'
    },
    scenes: [
      {
        tier: 1,
        t: 'Where new cells come from',
        art: 'mitosis',
        labels: ['every cell from another cell'],
        b: 'New cells are never built from scratch. Every one comes from a cell that split in two. You started as a single cell, and dividing is how it became the trillions you are made of.',
        s: 'New cells come from old cells splitting in two. That is the only way.',
        term: { w: 'Cell division', d: 'one cell splitting to make new cells.' }
      },
      {
        tier: 1,
        t: 'Chromosomes are what gets shared out',
        art: 'chromosome',
        labels: ['46 in a human body cell', '23 pairs'],
        b: 'The instructions sit on chromosomes, which are long pieces of DNA. A human body cell holds forty-six, in twenty-three pairs, one of each pair from each parent. Division is the job of sharing them out.',
        s: 'DNA is packed into chromosomes. A body cell has forty-six of them.',
        term: { w: 'Chromosome', d: 'a long piece of DNA carrying many genes.' }
      },
      {
        tier: 1,
        t: 'Two jobs, so two kinds of division',
        art: 'meiosis',
        labels: ['mitosis: grow and mend', 'meiosis: make sex cells'],
        b: 'Growing and mending need cells identical to the old ones, which is mitosis. Making egg and sperm cells needs something different, because two cells are about to join, and that is meiosis.',
        s: 'One kind makes cells that match. One kind makes egg and sperm cells.',
        term: { w: 'Two kinds', d: 'mitosis copies exactly; meiosis halves and shuffles.' }
      },
      {
        tier: 2,
        t: 'Mitosis: one becomes two identical',
        art: 'mitosis',
        labels: ['same number', 'same instructions'],
        b: 'In mitosis the cell copies every chromosome, lines the copies up down the middle, and pulls one of each to either end before splitting. Both new cells end with forty-six chromosomes and the same genes. They are clones of the original.',
        s: 'The cell copies everything, then splits. Both new cells are exactly the same.',
        term: { w: 'Mitosis', d: 'division giving two cells identical to the one that started.' }
      },
      {
        tier: 2,
        t: 'Copy first, then split',
        art: 'dna',
        labels: ['copy · line up · pull apart'],
        b: 'The order matters. The DNA is copied before anything moves, so that when the cell does split there is a full set waiting for each side. A cell that split first and copied afterwards would leave one half with nothing to read.',
        s: 'The DNA is copied first. Only then does the cell split. The order matters.',
        term: { w: 'Replication', d: 'copying the DNA, which has to happen before division.' }
      },
      {
        tier: 2,
        t: 'Growing, and mending a cut',
        art: 'person',
        labels: ['growth', 'repair', 'replacement'],
        b: 'Mitosis does three jobs: it makes you bigger, it repairs damage, and it replaces cells that wear out. You lose and replace skin cells constantly, and the lining of your gut is rebuilt every few days.',
        s: 'This is how you grow, how cuts heal, and how worn out cells get replaced.',
        term: { w: 'Repair', d: 'mending damage by making exact copies of the cells that were lost.' }
      },
      {
        tier: 2,
        t: 'The cell cycle',
        art: 'cycleArrows',
        labels: ['grow · copy · check · divide'],
        b: 'Division is one stage of a loop. The cell spends most of its time growing and doing its job, then copies its DNA, checks the copy, and only then divides. The checks matter: a cell that fails one is supposed to stop.',
        s: 'A cell grows, copies its DNA, checks the copy, then divides. Then it starts again.',
        term: { w: 'Cell cycle', d: 'the repeating loop of growing, copying, checking and dividing.' }
      },
      {
        tier: 3,
        t: 'Meiosis: one becomes four, all different',
        art: 'meiosis',
        labels: ['two divisions', 'four cells'],
        b: 'Meiosis divides twice but copies only once, so one cell gives four. Each ends with twenty-three chromosomes rather than forty-six, and no two of the four are the same. These become egg or sperm cells.',
        s: 'This division happens twice and makes four cells. Each one is different.',
        term: { w: 'Meiosis', d: 'division giving four cells, each with half a set of chromosomes.' }
      },
      {
        tier: 3,
        t: 'Half a set each, so the number stays right',
        art: 'chromosome',
        labels: ['23 + 23 = 46'],
        b: 'If egg and sperm each carried forty-six, the first cell of the next generation would have ninety-two, and the one after that a hundred and eighty-four. Halving first is what keeps the number steady from one generation to the next.',
        s: 'Egg and sperm each carry half a set. Joined, they make a full set again.',
        term: { w: 'Haploid', d: 'a cell with half a set of chromosomes, such as an egg or a sperm.' }
      },
      {
        tier: 3,
        t: 'Shuffling is why you are not your sibling',
        art: 'dna',
        labels: ['pairs swap pieces', 'then split at random'],
        b: 'Before the first division the pairs line up and swap pieces, and then which one of each pair goes which way is decided at random. Both steps mix the two sets you inherited. It is why siblings share parents and still differ.',
        s: 'The pairs swap bits and then split at random. That is why siblings are not the same.',
        term: { w: 'Variation', d: 'the mixing in meiosis, which makes every sex cell different.' }
      },
      {
        tier: 3,
        t: 'When division goes wrong',
        art: 'microscope',
        labels: ['checks exist for a reason'],
        b: 'Cells that divide when they should have stopped make a lump of cells with no job, which is what a tumour is. Separately, a chromosome going the wrong way in meiosis gives a cell one too many or one too few, which changes how an embryo develops.',
        s: 'Sometimes the checks fail and cells divide when they should not. That causes problems.',
        term: { w: 'Checkpoint', d: 'a stage where a cell is supposed to stop if something is wrong.' }
      },
      {
        tier: 1,
        t: 'Say it in one breath',
        art: 'checklist',
        labels: ['mitosis: 2 same · meiosis: 4 different'],
        b: 'Mitosis makes two identical cells with a full set of chromosomes, for growing and mending. Meiosis makes four different cells with half a set, for eggs and sperm. Copy once; divide once, or twice.',
        s: 'Mitosis makes two cells the same. Meiosis makes four cells that are all different.',
        term: { w: 'Big idea', d: 'two identical and full, or four different and half.' }
      }
    ],
    quiz: [
      { q: 'Mitosis produces…', a: ['Two identical cells', 'Four different cells', 'One larger cell'], c: 0, why: 'Both new cells get a full set of chromosomes and the same genes.' },
      { q: 'Meiosis produces…', a: ['Four different cells', 'Two identical cells', 'Three cells'], c: 0, why: 'It divides twice but copies once, so one cell gives four, all different.' },
      { q: 'A human body cell has how many chromosomes?', a: ['46', '23', '92'], c: 0, why: 'Forty-six, in twenty-three pairs, one of each pair from each parent.' },
      { q: 'A human sperm or egg cell has…', a: ['23 chromosomes', '46 chromosomes', '12 chromosomes'], c: 0, why: 'Half a set, so that joining two of them gives a full set again.' },
      { q: 'Which happens first in cell division?', a: ['The DNA is copied', 'The cell splits', 'The nucleus disappears'], c: 0, why: 'Copying first means a full set is ready for each side before anything splits.' },
      { q: 'Which job needs mitosis?', a: ['Healing a cut', 'Making sperm cells', 'Making egg cells'], c: 0, why: 'Repair needs cells identical to the ones that were lost.' },
      { q: 'Why must meiosis halve the chromosome number?', a: ['So the number stays the same each generation', 'To save space in the cell', 'To make the cell divide faster'], c: 0, why: 'Two full sets joining would double the number every single generation.' },
      { q: 'Why are siblings not identical?', a: ['Meiosis shuffles the chromosomes', 'Mitosis makes mistakes', 'Each parent has different DNA in every cell'], c: 0, why: 'Pairs swap pieces and then separate at random, so every sex cell is different.' },
      { q: 'A tumour is caused by cells that…', a: ['Divide when they should have stopped', 'Stop dividing too early', 'Lose their nucleus'], c: 0, why: 'The checks in the cell cycle have failed, so division carries on unchecked.' },
      { q: 'The cell cycle is best described as…', a: ['A repeating loop of growing, copying and dividing', 'A single one-off event', 'Only the moment of splitting'], c: 0, why: 'Dividing is one stage. Most of the time the cell is growing and doing its job.' }
    ]
  },

  /* ── 24. enzymes ──────────────────────────────────── */
  {
    id: 'enzymes',
    title: 'Enzymes: the tools a body works with',
    subject: 'Life science',
    grades: 'Grades 6–12',
    taught: 'UK: Enzymes (GCSE Biology), Nutrition and digestion (KS3) · US: Structure and function (NGSS MS-LS1-3, HS-LS1-6) · Canada: Biology (Ontario Gr 11), Biological molecules (Gr 12)',
    blurb: 'Why reactions in a body happen fast enough to matter, and what breaks them when they stop.',
    keywords: [
      'enzyme', 'enzymes', 'catalyst', 'catalysts', 'substrate', 'active site', 'lock and key',
      'denature', 'denatured', 'denaturation', 'optimum', 'amylase', 'protease', 'lipase',
      'catalase', 'digestion', 'digestive enzymes', 'protein', 'ph', 'enzime', 'enzyems', 'substrait'
    ],
    example: {
      t: 'Why washing powder gets stains out at 30 °C',
      b: 'Biological washing powder contains the same kinds of enzymes your gut uses. Protease breaks down blood and grass, lipase breaks down grease. They work cool, which is why the box says a low wash and why boiling the clothes would ruin them.',
      spot: 'Read a washing powder box. If it says biological, it is selling you enzymes.'
    },
    scenes: [
      {
        tier: 1,
        t: 'Reactions that would otherwise be far too slow',
        art: 'lockKey',
        labels: ['speeds the reaction up', 'without being used up'],
        b: 'Digesting a meal without help would take years at body temperature. An enzyme speeds a reaction up enormously without being used up. Everything a living thing does quickly, an enzyme is behind.',
        s: 'Enzymes make reactions in a body go fast. Without them, everything would be too slow.',
        term: { w: 'Enzyme', d: 'something that speeds up a reaction without being used up.' }
      },
      {
        tier: 1,
        t: 'An enzyme is a protein with a shape',
        art: 'molecule',
        labels: ['a long chain, folded up'],
        b: 'An enzyme is a protein: a long chain folded into a particular shape. The shape is the whole point. Somewhere on it is a dent called the active site, and that is where the reaction happens.',
        s: 'An enzyme is a protein folded into a shape. The shape is what makes it work.',
        term: { w: 'Active site', d: 'the dent in an enzyme where the reaction happens.' }
      },
      {
        tier: 1,
        t: 'One shape, one job',
        art: 'gears',
        labels: ['amylase → starch', 'lipase → fat'],
        b: 'Because the dent has a shape, only one kind of molecule fits. Amylase breaks down starch and nothing else; lipase breaks down fat and nothing else. A body needs thousands, because each does one job.',
        s: 'Each enzyme has one job. One breaks down starch. A different one breaks down fat.',
        term: { w: 'Specific', d: 'an enzyme works on one kind of molecule and no other.' }
      },
      {
        tier: 2,
        t: 'Lock and key',
        art: 'lockKey',
        labels: ['right shape fits', 'wrong shape does not'],
        b: 'The usual picture is a lock and a key. The molecule being worked on, the substrate, fits the active site the way a key fits a lock. The wrong molecule simply does not go in, which is why an enzyme never does the wrong job by accident.',
        s: 'The molecule fits the enzyme like a key fits a lock. The wrong one will not go in.',
        term: { w: 'Substrate', d: 'the molecule an enzyme works on.' }
      },
      {
        tier: 2,
        t: 'They come out unchanged',
        art: 'balance',
        labels: ['used again and again'],
        b: 'The substrate goes in, the reaction happens, the products leave and the enzyme is left exactly as it was, ready for the next one. One enzyme molecule can do this thousands of times a second, which is why a tiny amount goes a long way.',
        s: 'The enzyme is not used up. It does the job, then does it again and again.',
        term: { w: 'Catalyst', d: 'anything that speeds a reaction up and is left unchanged.' }
      },
      {
        tier: 2,
        t: 'Digestion runs on them',
        art: 'stomach',
        labels: ['big molecules → small ones'],
        b: 'Food is made of molecules too big to cross into your blood. Enzymes cut them down: amylase turns starch into sugars, protease turns protein into amino acids, lipase turns fat into fatty acids. Only then is the food small enough to absorb.',
        s: 'Food is too big to get into your blood. Enzymes cut it into small pieces first.',
        term: { w: 'Digestion', d: 'breaking food into pieces small enough to absorb.' }
      },
      {
        tier: 2,
        t: 'Temperature has a sweet spot',
        art: 'enzymeCurve',
        labels: ['faster, then suddenly not'],
        b: 'Warming things up makes molecules move faster and bump into each other more, so the reaction speeds up. That holds right up to a point, usually around body temperature, and then the rate falls off a cliff rather than levelling out.',
        s: 'Warmer is faster, up to a point. Past that point it suddenly gets much worse.',
        term: { w: 'Optimum', d: 'the temperature or pH at which an enzyme works fastest.' }
      },
      {
        tier: 3,
        t: 'Too hot, and the shape is gone for good',
        art: 'enzymeCurve',
        labels: ['denatured', 'does not come back'],
        b: 'Past the optimum the folds shake apart and the active site loses its shape. The substrate no longer fits and the enzyme has stopped working. Cooling it down does not fix it: this is what denatured means, and it is why a cooked egg never goes runny again.',
        s: 'Too much heat ruins the shape for good. Cooling it down will not bring it back.',
        term: { w: 'Denatured', d: 'an enzyme whose shape has been ruined, permanently.' }
      },
      {
        tier: 3,
        t: 'pH matters just as much',
        art: 'phScale',
        labels: ['stomach ~2', 'small intestine ~8'],
        b: 'Every enzyme also has a pH it likes. Stomach protease works best in strong acid, around pH 2. The enzymes further along work best in a slightly alkaline gut, around pH 8, which is why bile is released to neutralise the acid arriving from the stomach.',
        s: 'Enzymes also have a pH they like. Some need acid, some need the opposite.',
        term: { w: 'Optimum pH', d: 'the acidity at which a particular enzyme works fastest.' }
      },
      {
        tier: 3,
        t: 'Enzymes outside a body',
        art: 'beaker',
        labels: ['washing', 'cheese', 'baby food'],
        b: 'Because enzymes work in a test tube as happily as in a cell, industry uses them: protease and lipase in washing powder, an enzyme from calves to set cheese, protease to pre-digest baby food. All of it works cool, which saves a lot of energy.',
        s: 'Enzymes work outside a body too. They are used in washing powder and in cheese.',
        term: { w: 'Biotechnology', d: 'using living things, or parts of them, to make something.' }
      },
      {
        tier: 3,
        t: 'How to measure one',
        art: 'microscope',
        labels: ['time how fast the product appears'],
        b: 'To measure an enzyme you time something. Catalase on hydrogen peroxide gives oxygen, so you count bubbles or measure the gas. Amylase on starch makes the starch disappear, so you test with iodine every thirty seconds and record when it stops going blue-black.',
        s: 'To measure an enzyme, time how fast it works. Count bubbles, or test every half minute.',
        term: { w: 'Rate', d: 'how much happens in a given time. Change one thing and measure it.' }
      },
      {
        tier: 1,
        t: 'Say it in one breath',
        art: 'checklist',
        labels: ['shape · one job · ruined by heat'],
        b: 'An enzyme is a folded protein that speeds up one reaction and is not used up doing it. Its shape decides what fits. Too much heat or the wrong pH ruins that shape, permanently.',
        s: 'An enzyme is a protein with a shape. The shape does one job. Too much heat ruins it.',
        term: { w: 'Big idea', d: 'shape decides the job, and heat destroys the shape.' }
      }
    ],
    quiz: [
      { q: 'An enzyme is a…', a: ['Protein', 'Sugar', 'Fat'], c: 0, why: 'A long chain of smaller units, folded into a particular shape.' },
      { q: 'The dent where the reaction happens is called the…', a: ['Active site', 'Substrate', 'Optimum'], c: 0, why: 'Its shape is what decides which molecule can fit.' },
      { q: 'After the reaction, the enzyme is…', a: ['Unchanged and ready to go again', 'Used up', 'Broken into pieces'], c: 0, why: 'That is what makes it a catalyst, and why a tiny amount goes a long way.' },
      { q: 'Why does one enzyme only work on one substrate?', a: ['Only one shape fits the active site', 'It can only move slowly', 'It runs out of energy'], c: 0, why: 'Lock and key: the wrong molecule simply does not go in.' },
      { q: 'Which enzyme breaks down starch?', a: ['Amylase', 'Lipase', 'Protease'], c: 0, why: 'Lipase works on fat and protease works on protein.' },
      { q: 'Warming an enzyme up past its optimum makes the rate…', a: ['Fall sharply', 'Keep rising', 'Stay the same'], c: 0, why: 'The folds shake apart, the active site loses its shape, and it stops working.' },
      { q: 'A denatured enzyme can be fixed by…', a: ['Nothing — the change is permanent', 'Cooling it back down', 'Adding more substrate'], c: 0, why: 'The shape is gone for good, which is why a cooked egg never goes runny again.' },
      { q: 'Stomach protease works best at about…', a: ['pH 2', 'pH 7', 'pH 11'], c: 0, why: 'Strong acid. The enzymes further along the gut prefer slightly alkaline conditions.' },
      { q: 'Biological washing powder works at low temperatures because…', a: ['Hot water would denature the enzymes', 'Enzymes need cold to form', 'Cold water dissolves stains better'], c: 0, why: 'The enzymes in it are ruined by heat, exactly like the ones in you.' },
      { q: 'A good way to measure how fast an enzyme works is to…', a: ['Time how quickly the product appears', 'Weigh the enzyme afterwards', 'Count the enzyme molecules'], c: 0, why: 'Rate is amount per time, so you time something changing: bubbles, or a colour test.' }
    ]
  },

  /* ── 25. classification ───────────────────────────── */
  {
    id: 'classification',
    title: 'Classifying living things',
    subject: 'Life science',
    grades: 'Grades 4–10',
    taught: 'UK: Variation and classification (KS3 Biology), Biodiversity (GCSE Biology) · US: Biological evolution: unity and diversity (NGSS MS-LS4, 3-LS4) · Canada: Biodiversity (Ontario Gr 6), Diversity of living things (Gr 11)',
    blurb: 'How millions of species get sorted into groups, named, and told apart with a key.',
    keywords: [
      'classification', 'classify', 'classifying', 'taxonomy', 'kingdom', 'kingdoms', 'species',
      'genus', 'binomial', 'binomial name', 'linnaeus', 'vertebrate', 'vertebrates', 'invertebrate',
      'invertebrates', 'mammal', 'mammals', 'amphibian', 'reptile', 'arthropod', 'key',
      'dichotomous key', 'biodiversity', 'clasification', 'taxonomey', 'speceis'
    ],
    example: {
      t: 'Why a whale is not a fish',
      b: 'A whale is a fish shape living a fish life in the sea, and it is a mammal. It breathes air, is warm-blooded and feeds its young on milk. Grouping is about what something is and where it came from, not what it looks like.',
      spot: 'Look for the blowhole in a photo of a whale. Fish do not have one, because fish do not breathe air.'
    },
    scenes: [
      {
        tier: 1,
        t: 'Sorting is how biology copes',
        art: 'kingdoms',
        labels: ['millions of species', 'a few groups'],
        b: 'There are perhaps nine million species, and most have not been described yet. Nobody can hold that in their head, so biologists sort them into nested groups. The group tells you a lot before you look.',
        s: 'There are millions of living things. Sorting them into groups makes them easier to study.',
        term: { w: 'Classification', d: 'sorting living things into groups based on what they are.' }
      },
      {
        tier: 1,
        t: 'The big groups',
        art: 'kingdoms',
        labels: ['animals · plants · fungi', 'protists · bacteria'],
        b: 'At the widest level everything alive goes into one of a few kingdoms: animals, plants, fungi, protists and bacteria. Fungi surprise people. A mushroom has no chlorophyll and makes no food, so it is not a plant.',
        s: 'The biggest groups are animals, plants, fungi and two groups of tiny living things.',
        term: { w: 'Kingdom', d: 'one of the widest groups living things are sorted into.' }
      },
      {
        tier: 1,
        t: 'Every species gets two names',
        art: 'treeOfLife',
        labels: ['Panthera leo', 'Homo sapiens'],
        b: 'A species gets two Latin names: its group, then its own. A lion is Panthera leo, a tiger Panthera tigris. The shared first name means close relatives, and every country uses the same two words.',
        s: 'Each kind of living thing gets two names. The first name is shared by close relatives.',
        term: { w: 'Binomial name', d: 'the two-part Latin name every species is given.' }
      },
      {
        tier: 2,
        t: 'The levels, widest to narrowest',
        art: 'treeOfLife',
        labels: ['kingdom → species', 'each one narrower'],
        b: 'The groups nest inside each other: kingdom, phylum, class, order, family, genus, species. Each step down holds fewer things that are more alike. A human is in the animal kingdom, the mammal class, the primate order, and ends as one species.',
        s: 'The groups fit inside each other. Each step down holds fewer things that are more alike.',
        term: { w: 'Genus', d: 'the group just above species, and the first half of the Latin name.' }
      },
      {
        tier: 2,
        t: 'What counts as one species',
        art: 'beaks',
        labels: ['can breed together', 'and the young can too'],
        b: 'Two living things are the same species if they can breed and produce young that can themselves breed. A horse and a donkey can have a mule, but a mule cannot have young, so horses and donkeys stay two species.',
        s: 'Two living things are one species if they can have young that can have young too.',
        term: { w: 'Species', d: 'a group that can breed together and have fertile young.' }
      },
      {
        tier: 2,
        t: 'A key asks yes-or-no questions',
        art: 'dichotomous',
        labels: ['two choices at a time'],
        b: 'To identify something you did not catch, you use a key. It gives two statements, you pick the one that fits, and that sends you to the next pair. Each answer halves what is left, so a dozen questions can pick one species out of thousands.',
        s: 'A key gives you two choices. You pick one, and it sends you to the next two.',
        term: { w: 'Dichotomous key', d: 'a set of paired choices that leads you to one name.' }
      },
      {
        tier: 2,
        t: 'Using a key on something real',
        art: 'dichotomous',
        labels: ['legs? wings? antennae?'],
        b: 'Say you find a small creature under a log. Six legs or more than six? Six. Wings or no wings? No wings. Each answer cuts the list down, and in four or five steps you have a name. Good keys only ask about things you can actually see.',
        s: 'Count the legs. Look for wings. Each answer cuts the list down until one name is left.',
        term: { w: 'Observable', d: 'a good key only asks about things you can see on the spot.' }
      },
      {
        tier: 3,
        t: 'Backbone or no backbone',
        art: 'person',
        labels: ['vertebrates: 5 groups', 'invertebrates: almost everything'],
        b: 'Animals split first on whether they have a backbone. Vertebrates are fish, amphibians, reptiles, birds and mammals, and there are not many of them. Invertebrates are everything else, and they are about ninety-seven in every hundred animal species.',
        s: 'Animals split into those with a backbone and those without. Most have no backbone.',
        term: { w: 'Vertebrate', d: 'an animal with a backbone. There are five groups of them.' }
      },
      {
        tier: 3,
        t: 'Grouped by ancestry, not by looks',
        art: 'fossil',
        labels: ['dolphin with mammals', 'not with sharks'],
        b: 'Living things that look alike are not always related. A dolphin and a shark share a body shape because they solve the same problem, not because they are cousins. Classification follows where something came from, so the dolphin sits with the mammals.',
        s: 'Things that look alike are not always related. Groups follow where they came from.',
        term: { w: 'Ancestry', d: 'what something descended from, which is what the groups follow.' }
      },
      {
        tier: 3,
        t: 'DNA rearranged the groups',
        art: 'dna',
        labels: ['compare the code itself'],
        b: 'For two hundred years classification was done by eye. Comparing DNA instead showed that some groups built on appearance were wrong, and they were rebuilt. It also added a level above kingdom, because the simplest living things turned out to be two quite separate groups.',
        s: 'Looking at DNA showed some old groups were wrong, so they were sorted again.',
        term: { w: 'Evidence', d: 'groupings change when better evidence arrives. That is science working.' }
      },
      {
        tier: 3,
        t: 'Where viruses sit',
        art: 'virus',
        labels: ['not in any kingdom'],
        b: 'Viruses are left out of the kingdoms entirely. They carry genes, but they have no cells, do not respire and cannot copy themselves without hijacking something that can. Whether they count as alive is a question biologists still argue about.',
        s: 'Viruses are left out of the groups. They are not clearly alive and not clearly not.',
        term: { w: 'Edge case', d: 'something that does not fit the system, and is left outside it.' }
      },
      {
        tier: 1,
        t: 'Say it in one breath',
        art: 'checklist',
        labels: ['group · name · identify'],
        b: 'Living things sort into nested groups from kingdom down to species, every species gets a two-part Latin name, and a key of paired questions identifies one you have never seen. Groups follow ancestry, not looks.',
        s: 'Living things are sorted into groups. Each kind gets two names. A key helps you name one.',
        term: { w: 'Big idea', d: 'sort by what something is, not by what it looks like.' }
      }
    ],
    quiz: [
      { q: 'A mushroom belongs to which kingdom?', a: ['Fungi', 'Plants', 'Bacteria'], c: 0, why: 'It has no chlorophyll and makes no food, so it is not a plant.' },
      { q: 'In the name Panthera leo, Panthera is the…', a: ['Genus', 'Species', 'Kingdom'], c: 0, why: 'The first word is the genus, shared with close relatives like Panthera tigris.' },
      { q: 'Two animals are the same species if they can…', a: ['Breed and have fertile young', 'Live in the same place', 'Eat the same food'], c: 0, why: 'A mule is not fertile, so horses and donkeys stay two species.' },
      { q: 'A dichotomous key works by…', a: ['Offering two choices at each step', 'Listing every species alphabetically', 'Showing photographs to match'], c: 0, why: 'Each answer halves what is left, so a few steps narrow thousands to one.' },
      { q: 'Which of these is an invertebrate?', a: ['A spider', 'A frog', 'A sparrow'], c: 0, why: 'Frogs and sparrows are vertebrates. A spider has no backbone.' },
      { q: 'A whale is grouped with mammals because it…', a: ['Breathes air and feeds young on milk', 'Lives in the sea', 'Has a fish-like shape'], c: 0, why: 'Grouping follows what something is and where it came from, not its shape.' },
      { q: 'The order of the levels, widest first, is…', a: ['Kingdom, phylum, class, order, family, genus, species', 'Species, genus, kingdom, class', 'Class, kingdom, species, order'], c: 0, why: 'Each step down holds fewer things that are more alike.' },
      { q: 'Why are viruses not placed in a kingdom?', a: ['They have no cells and cannot copy themselves alone', 'They are too small to see', 'There are too many of them'], c: 0, why: 'Whether they are alive at all is still argued about.' },
      { q: 'Comparing DNA changed classification because it…', a: ['Showed some groups based on appearance were wrong', 'Made Latin names unnecessary', 'Proved all species are related equally'], c: 0, why: 'Better evidence arrived, so the groupings were rebuilt. That is science working.' },
      { q: 'Roughly what share of animal species are invertebrates?', a: ['About 97%', 'About 50%', 'About 10%'], c: 0, why: 'Vertebrates are the small minority, even though they are the ones we notice.' }
    ]
  },

  /* ── 26. transport in plants ──────────────────────── */
  {
    id: 'plant-transport',
    title: 'Water and food inside a plant',
    subject: 'Life science',
    grades: 'Grades 5–11',
    taught: 'UK: Transport in plants (KS3 Biology), Plant tissues and transport (GCSE Biology) · US: Structure and function (NGSS MS-LS1-2, 5-LS1-1) · Canada: Plants (Ontario Gr 3 and Gr 11 Biology)',
    blurb: 'How a plant with no heart lifts water to the top of a tree, and moves food the other way.',
    keywords: [
      'transport in plants', 'xylem', 'phloem', 'transpiration', 'translocation', 'stomata',
      'stoma', 'guard cell', 'guard cells', 'root hair', 'root hair cell', 'turgid', 'flaccid',
      'wilting', 'wilt', 'osmosis', 'transpiration stream', 'vascular', 'potometer',
      'xylen', 'floem', 'transperation', 'stomatta'
    ],
    example: {
      t: 'Why cut flowers drink',
      b: 'Put a white flower in water with food colouring and the petals turn that colour within a day. The dye travels up the same tubes the water uses. Cut the stem under water and it lasts longer, because no air bubble gets into the column.',
      spot: 'Look at the stem end of a bunch of flowers. The tiny dots are the tubes.'
    },
    scenes: [
      {
        tier: 1,
        t: 'No heart, and water still goes up',
        art: 'transpiration',
        labels: ['roots to leaves', 'no pump anywhere'],
        b: 'A tall tree lifts water a hundred metres into the air with nothing you could call a pump. No heart, no muscle, no moving part. The water goes up anyway, and working out how took a long time.',
        s: 'A tree has no heart. Water still gets all the way to the top leaves.',
        term: { w: 'Transport', d: 'moving water and food from where they are to where they are needed.' }
      },
      {
        tier: 1,
        t: 'Roots take the water in',
        art: 'tree',
        labels: ['water and minerals'],
        b: 'Water enters through the roots, with the dissolved minerals a plant needs to build itself. Roots spread further than people expect, often as wide underground as the branches above, because they are hunting water.',
        s: 'Water goes in through the roots. Minerals from the soil come in with it.',
        term: { w: 'Root', d: 'where water and minerals enter, and what holds the plant down.' }
      },
      {
        tier: 1,
        t: 'Two sets of pipes',
        art: 'xylemPhloem',
        labels: ['xylem up', 'phloem both ways'],
        b: 'A stem carries two separate sets of tubes. Xylem carries water and minerals upwards only. Phloem carries dissolved food from the leaves to wherever it is needed, up or down. They run side by side.',
        s: 'A stem has two sets of tubes. One carries water up. One carries food around.',
        term: { w: 'Xylem', d: 'the tubes carrying water and minerals, always upwards.' }
      },
      {
        tier: 2,
        t: 'Xylem is dead, and that helps',
        art: 'xylemPhloem',
        labels: ['hollow tubes', 'strengthened walls'],
        b: 'Xylem cells die as they form, lose their end walls and leave a hollow pipe. Dead and empty is exactly what a pipe should be: nothing is in the way. The walls are strengthened so the tube does not collapse under the pull.',
        s: 'Xylem tubes are dead and hollow. That is what makes them good pipes.',
        term: { w: 'Lignin', d: 'the stiffening in xylem walls that stops the tube collapsing.' }
      },
      {
        tier: 2,
        t: 'Phloem carries the food',
        art: 'leaf',
        labels: ['sugar from the leaves', 'to roots, fruit, buds'],
        b: 'Leaves make sugar, and the rest of the plant needs it. Phloem carries dissolved sugar from the leaves to roots, growing buds and ripening fruit. Unlike xylem, phloem cells are alive, and the movement takes energy. It is called translocation.',
        s: 'Leaves make sugar. Phloem carries it to the roots, the buds and the fruit.',
        term: { w: 'Phloem', d: 'the living tubes carrying dissolved food around the plant.' }
      },
      {
        tier: 2,
        t: 'Stomata are the holes in a leaf',
        art: 'stomata',
        labels: ['carbon dioxide in', 'water vapour out'],
        b: 'The underside of a leaf is covered in tiny holes called stomata. Carbon dioxide goes in through them for photosynthesis, and water vapour comes out. A plant cannot have one without the other: the hole that lets the gas in lets the water go.',
        s: 'A leaf has tiny holes underneath. Gas goes in through them and water goes out.',
        term: { w: 'Stoma', d: 'a tiny hole in a leaf. Many of them are stomata.' }
      },
      {
        tier: 2,
        t: 'Why a plant wilts',
        art: 'plantCell',
        labels: ['full cells hold it up', 'empty ones do not'],
        b: 'A plant with no bones stands up because each cell is full of water, pressing out against its wall like air in a tyre. Lose enough water and the pressure drops, the cells go soft, and the whole plant droops. Water it and it comes back up.',
        s: 'Plant cells full of water press out and hold the plant up. Empty cells let it droop.',
        term: { w: 'Turgid', d: 'a plant cell full of water, pressing against its wall.' }
      },
      {
        tier: 3,
        t: 'Evaporation pulls the whole column up',
        art: 'transpiration',
        labels: ['water out of the leaf', 'pulls the next one up'],
        b: 'Water evaporating from a leaf pulls on the water behind it. Water molecules stick to each other, so the whole column in the xylem is dragged up as one unbroken thread, all the way from the root. The sun does the work, not the plant.',
        s: 'Water leaving the leaf pulls the water behind it up. The whole line moves together.',
        term: { w: 'Transpiration stream', d: 'the unbroken pull of water from root to leaf.' }
      },
      {
        tier: 3,
        t: 'What makes it faster',
        art: 'sun',
        labels: ['hot, dry, windy, bright'],
        b: 'Four things speed transpiration up: heat, dry air, wind and light. Heat and dry air make evaporation easier, wind carries the vapour away before it builds up, and light opens the stomata. All four together is why plants struggle on a hot windy day.',
        s: 'Heat, dry air, wind and light all make a plant lose water faster.',
        term: { w: 'Rate', d: 'how fast water is lost. Change one thing and measure the difference.' }
      },
      {
        tier: 3,
        t: 'Guard cells open and shut the pore',
        art: 'stomata',
        labels: ['two cells, one hole'],
        b: 'Each stoma sits between two guard cells. Fill them with water and they bend apart and the hole opens; let the water out and they go slack and it shuts. Most plants shut their stomata at night, and in a drought they shut them in daylight too and accept less food.',
        s: 'Two cells sit either side of each hole. They bend to open it and shut it.',
        term: { w: 'Guard cell', d: 'one of the pair that opens and closes a stoma.' }
      },
      {
        tier: 3,
        t: 'Root hair cells and surface area',
        art: 'microscope',
        labels: ['long and thin', 'enormous total area'],
        b: 'Each root hair cell is drawn out into a long thin projection. One is nothing, but a plant has billions, and together they give a surface area far larger than the root itself. More surface touching the soil means more water getting in.',
        s: 'Root hairs are long and thin. A plant has billions, so a lot of water can get in.',
        term: { w: 'Surface area', d: 'how much is touching. More of it means faster absorption.' }
      },
      {
        tier: 1,
        t: 'Say it in one breath',
        art: 'checklist',
        labels: ['xylem up · phloem around'],
        b: 'Water comes in at the roots, rises through dead hollow xylem, and evaporates out of holes in the leaves, which is the pull that lifts it. Food travels the other way, through living phloem.',
        s: 'Water goes in at the roots and up to the leaves. Food goes from the leaves to the rest.',
        term: { w: 'Big idea', d: 'water up one set of pipes, food around the other set.' }
      }
    ],
    quiz: [
      { q: 'Xylem carries…', a: ['Water and minerals upwards', 'Sugar downwards', 'Oxygen to the roots'], c: 0, why: 'Phloem is the one carrying dissolved food, and it goes either way.' },
      { q: 'Phloem carries…', a: ['Dissolved food around the plant', 'Water upwards only', 'Air into the leaves'], c: 0, why: 'Sugar made in the leaves goes to roots, buds and fruit. That is translocation.' },
      { q: 'Water leaves a leaf mainly through the…', a: ['Stomata', 'Xylem', 'Roots'], c: 0, why: 'The same tiny holes that let carbon dioxide in let water vapour out.' },
      { q: 'What actually pulls water up a tall tree?', a: ['Evaporation from the leaves', 'A pump in the roots', 'The plant pushing from below'], c: 0, why: 'Water leaving the leaf drags the column behind it, because water sticks to itself.' },
      { q: 'Xylem cells are…', a: ['Dead and hollow', 'Alive and full', 'Filled with sugar'], c: 0, why: 'Dead and empty is exactly what a pipe should be: nothing is in the way.' },
      { q: 'A plant wilts because its cells…', a: ['Have lost water and stopped pressing outwards', 'Have been killed by the sun', 'Are full of too much sugar'], c: 0, why: 'Full cells press against their walls and hold the plant up, like air in a tyre.' },
      { q: 'Which pair of conditions speeds transpiration up most?', a: ['Hot and windy', 'Cold and still', 'Dark and damp'], c: 0, why: 'Heat helps evaporation and wind carries the vapour away before it builds up.' },
      { q: 'Guard cells do what?', a: ['Open and close a stoma', 'Carry water up the stem', 'Make sugar'], c: 0, why: 'Fill them with water and they bend apart, opening the hole between them.' },
      { q: 'Root hair cells are long and thin in order to…', a: ['Increase surface area', 'Store sugar', 'Hold the plant upright'], c: 0, why: 'More surface touching the soil means more water can get in.' },
      { q: 'Most plants close their stomata at night because…', a: ['There is no photosynthesis, so closing saves water', 'It is too cold for gases to move', 'The leaves are asleep'], c: 0, why: 'No light means no need for carbon dioxide, so the hole is pure water loss.' }
    ]
  },

  /* ── 27. the nervous system ───────────────────────── */
  {
    id: 'nervous-system',
    title: 'Nerves, signals and reflexes',
    subject: 'Life science',
    grades: 'Grades 5–12',
    taught: 'UK: The nervous system (GCSE Biology), Movement and senses (KS3) · US: Sensory receptors and information processing (NGSS MS-LS1-8, HS-LS1-3) · Canada: Body systems (Ontario Gr 5 and Gr 8), Biology (Gr 11)',
    blurb: 'How a message gets from your finger to your brain, and why pulling away happens first.',
    keywords: [
      'nervous system', 'nerve', 'nerves', 'neurone', 'neuron', 'neurons', 'neurones', 'reflex',
      'reflexes', 'reflex arc', 'synapse', 'synapses', 'receptor', 'receptors', 'stimulus',
      'response', 'effector', 'sensory', 'motor', 'relay', 'spinal cord', 'cns', 'myelin',
      'neurotransmitter', 'nervos system', 'reflecs', 'sinapse'
    ],
    example: {
      t: 'Why you drop a hot plate before it hurts',
      b: 'Your hand lets go before you feel the pain. The signal went to your spinal cord and straight back out to the muscle without waiting for your brain. The brain finds out a fraction of a second later, which is when it hurts.',
      spot: 'Notice the order next time: you have already moved, and then it stings.'
    },
    scenes: [
      {
        tier: 1,
        t: 'Messages, faster than thinking',
        art: 'neuron',
        labels: ['metres per second'],
        b: 'Your body runs a messaging system made of nerve cells, and it is quick: a signal crosses you in hundredths of a second. It is what lets you catch something falling, which thinking is far too slow for.',
        s: 'Nerves carry messages around your body very fast. Faster than you can think.',
        term: { w: 'Nervous system', d: 'the network of nerve cells that carries messages around you.' }
      },
      {
        tier: 1,
        t: 'A nerve cell is mostly a wire',
        art: 'neuron',
        labels: ['branches in', 'one long fibre out'],
        b: 'A neurone has branches at one end to collect signals, a long thin fibre to carry them, and branches at the other to pass them on. Some run the length of your leg: one cell, a metre long.',
        s: 'A nerve cell has branches at each end and a long thin middle. It works like a wire.',
        term: { w: 'Neurone', d: 'a nerve cell. It carries a signal from one end to the other.' }
      },
      {
        tier: 1,
        t: 'Receptor, nerve, muscle',
        art: 'reflexArc',
        labels: ['detect → carry → act'],
        b: 'Every response follows three steps. Something detects a change, which is the receptor. Nerves carry the message. Something acts on it, usually a muscle. Light, sound, heat and pressure all take this route.',
        s: 'Something notices a change. Nerves carry the news. A muscle does something about it.',
        term: { w: 'Receptor', d: 'the part that detects a change, such as heat on your skin.' }
      },
      {
        tier: 2,
        t: 'Three kinds of neurone',
        art: 'gears',
        labels: ['sensory · relay · motor'],
        b: 'Sensory neurones carry signals in from receptors. Relay neurones sit inside the spinal cord and brain and pass them on. Motor neurones carry the instruction out to a muscle. A message usually travels through all three in that order.',
        s: 'One kind carries the message in, one passes it on, and one carries it out to a muscle.',
        term: { w: 'Motor neurone', d: 'the nerve cell that carries an instruction out to a muscle.' }
      },
      {
        tier: 2,
        t: 'Central, and everything else',
        art: 'person',
        labels: ['brain and spinal cord', 'nerves everywhere else'],
        b: 'The brain and spinal cord together are the central nervous system, where decisions get made. Everything else is the nerves running out to the rest of you. The spinal cord is the trunk line, which is why damage to it cuts off everything below.',
        s: 'The brain and spinal cord decide. The other nerves carry messages to and from them.',
        term: { w: 'Central nervous system', d: 'the brain and spinal cord, where the deciding happens.' }
      },
      {
        tier: 2,
        t: 'The reflex arc skips the brain',
        art: 'reflexArc',
        labels: ['in, across, straight out'],
        b: 'In a reflex the signal goes in to the spinal cord, across one relay neurone, and straight back out to the muscle. The brain is not consulted. It is told afterwards, which is why your hand has already moved before you notice anything.',
        s: 'In a reflex the message goes to the spinal cord and straight back out. The brain is skipped.',
        term: { w: 'Reflex arc', d: 'the short path in and straight back out, missing the brain.' }
      },
      {
        tier: 2,
        t: 'Why skipping it is worth it',
        art: 'reflexArc',
        labels: ['shorter path, less time'],
        b: 'Every extra connection costs time. Going to the brain, deciding, and coming back adds a long detour, and for a hand on something hot that delay is damage. A reflex trades control for speed, which is why you cannot choose not to blink.',
        s: 'A shorter path is a faster path. For something hot, that time saved stops a burn.',
        term: { w: 'Reflex', d: 'a fast automatic response you do not decide to make.' }
      },
      {
        tier: 3,
        t: 'The gap between two nerve cells',
        art: 'synapse',
        labels: ['they do not touch'],
        b: 'Neurones do not actually join up. There is a tiny gap between them called a synapse, and the electrical signal cannot jump it. Something else has to carry the message across, which is the one slow step in an otherwise very fast system.',
        s: 'Nerve cells do not touch. There is a tiny gap between each one and the next.',
        term: { w: 'Synapse', d: 'the gap between two nerve cells.' }
      },
      {
        tier: 3,
        t: 'Chemical across, electrical again',
        art: 'synapse',
        labels: ['release · drift · trigger'],
        b: 'When a signal reaches the gap, the cell releases a chemical. It drifts across, lands on the next cell and sets off a fresh electrical signal there. Changing what happens at that gap is how most medicines that affect the brain work.',
        s: 'A chemical crosses the gap and starts the message again on the other side.',
        term: { w: 'Neurotransmitter', d: 'the chemical that carries a signal across a synapse.' }
      },
      {
        tier: 3,
        t: 'Myelin makes it faster',
        art: 'neuron',
        labels: ['insulated in sections'],
        b: 'Many nerve fibres are wrapped in a fatty sheath with gaps along it. The signal jumps between the gaps rather than crawling the whole length, which makes it many times faster. Losing that sheath is what makes some nerve conditions so disabling.',
        s: 'Some nerves are wrapped in a fatty layer. The signal jumps along and goes much faster.',
        term: { w: 'Myelin', d: 'the fatty wrapping that lets a signal jump along a nerve fibre.' }
      },
      {
        tier: 3,
        t: 'Nerves and hormones do different jobs',
        art: 'balance',
        labels: ['fast and brief', 'slow and lasting'],
        b: 'Your body has a second messaging system: hormones in the blood. Nerves are fast, aimed at one place and over quickly. Hormones are slow, go everywhere and last. Pulling your hand back is nerves. Growing taller is hormones.',
        s: 'Nerves are fast and go to one place. Hormones are slow and last much longer.',
        term: { w: 'Hormone', d: 'a chemical messenger carried in the blood. Slower, but longer lasting.' }
      },
      {
        tier: 1,
        t: 'Say it in one breath',
        art: 'checklist',
        labels: ['detect · carry · respond'],
        b: 'A receptor detects a change, neurones carry the signal to the spinal cord or brain, and a motor neurone carries the instruction out to a muscle. A reflex skips the brain, which is what makes it fast.',
        s: 'Something is noticed, nerves carry the news, and a muscle acts. A reflex skips the brain.',
        term: { w: 'Big idea', d: 'detect, carry, respond — and skip the brain when speed matters.' }
      }
    ],
    quiz: [
      { q: 'A nerve cell is called a…', a: ['Neurone', 'Synapse', 'Receptor'], c: 0, why: 'A neurone has branches at each end and a long fibre carrying the signal between them.' },
      { q: 'The central nervous system is made of the…', a: ['Brain and spinal cord', 'Brain and all the nerves', 'Nerves in the arms and legs'], c: 0, why: 'Everything else is the nerves running out to the rest of the body.' },
      { q: 'In a reflex, the signal…', a: ['Skips the brain', 'Goes to the brain first', 'Stays in the muscle'], c: 0, why: 'It goes in to the spinal cord, across a relay neurone, and straight back out.' },
      { q: 'Why is a reflex faster than a decision?', a: ['The path is shorter', 'The nerves are thicker', 'Muscles react faster to reflexes'], c: 0, why: 'Every extra connection costs time, and a reflex uses as few as possible.' },
      { q: 'The gap between two nerve cells is a…', a: ['Synapse', 'Receptor', 'Reflex arc'], c: 0, why: 'Neurones do not actually touch. There is a tiny gap at every junction.' },
      { q: 'How does a signal cross that gap?', a: ['A chemical drifts across', 'It jumps as a spark', 'The cells briefly touch'], c: 0, why: 'A neurotransmitter is released, lands on the next cell, and starts a fresh signal.' },
      { q: 'Which neurone carries the instruction out to a muscle?', a: ['Motor', 'Sensory', 'Relay'], c: 0, why: 'Sensory carries in, relay passes on, motor carries out.' },
      { q: 'Myelin makes a signal travel faster by…', a: ['Letting it jump along the fibre', 'Making the nerve shorter', 'Adding more neurones'], c: 0, why: 'The fatty sheath has gaps, and the signal jumps between them.' },
      { q: 'A part that acts on a message, usually a muscle, is called the…', a: ['Effector', 'Receptor', 'Stimulus'], c: 0, why: 'Receptor detects, effector acts. The message travels between them.' },
      { q: 'Compared with nerves, hormones are…', a: ['Slower but longer lasting', 'Faster and briefer', 'Identical in speed'], c: 0, why: 'Nerves are fast and aimed; hormones go everywhere in the blood and last.' }
    ]
  }

  ];

  window.TOPICS = (window.TOPICS || []).concat(T);
})();
