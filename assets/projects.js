/* projects.js — one real, doable science project per topic.
   Household materials only, nothing sharp, nothing on fire. Each one is a fair test:
   a question, a thing you change, and a thing you measure. */

window.PROJECTS = {

  'acids-bases': {
    title: 'Red cabbage tells you the pH',
    question: 'Can one home-made indicator sort the acids from the bases in your kitchen?',
    days: 'Takes about an hour, plus 20 minutes of boiling',
    needs: ['Half a red cabbage, chopped', 'A pan and hot water (an adult for this part)', 'A sieve and a jug', 'Six clear glasses or jars', 'Things to test: lemon juice, vinegar, water, washing-up liquid, bicarbonate of soda solution, milk'],
    steps: [
      'Ask an adult to simmer the chopped cabbage in water for 15 minutes, then sieve it. Keep the purple liquid and let it cool.',
      'Put the same amount of each test liquid into its own glass, and label them.',
      'Add the same small amount of cabbage water to each one and swirl.',
      'Photograph all six side by side in the same light.',
      'Order them from most acidic to most basic by colour, and write your predicted pH for each.',
      'Check two of them against shop-bought pH paper if you have any.'
    ],
    look: 'Pink or red for acids, purple for neutral, blue or green for bases. Washing-up liquid often goes a startling green.',
    why: 'Red cabbage contains anthocyanin, a pigment whose molecule changes shape depending on how many hydrogen ions are around it. A different shape absorbs different colours of light, so you see a different colour.',
    fair: 'Same amount of indicator in every glass, same amount of liquid, and photograph them all together — colour judgement changes under different lighting.',
    stretch: 'Add bicarbonate of soda to a pink glass drop by drop and watch it travel through purple to blue. You have just done a titration.'
  },

  'light-optics': {
    title: 'Does the law of reflection actually hold?',
    question: 'Is the angle light leaves a mirror really equal to the angle it arrived at?',
    days: 'Takes about 45 minutes',
    needs: ['A small flat mirror', 'A torch, or a phone torch', 'Card and scissors to make a narrow slit', 'A protractor and a ruler', 'A large sheet of paper', 'A darkened room'],
    steps: [
      'Stand the mirror upright on the paper and draw a line along its base.',
      'Draw the normal: a line at exactly 90° to the mirror line, where the beam will hit.',
      'Cut a 2 mm slit in the card and hold it over the torch to make one narrow ray.',
      'Shine the ray at the mirror so it hits where the normal meets it. Mark two points along the incoming ray and two along the reflected one.',
      'Join the marks, then measure both angles from the normal with the protractor.',
      'Repeat for at least five different incoming angles and tabulate: angle in, angle out, difference.'
    ],
    look: 'The two angles should agree to within a degree or two every time. Your differences column should hover around zero with no pattern.',
    why: 'Light reflects so that the angle of incidence equals the angle of reflection, both measured from the normal. A smooth surface keeps the rays organised, which is why you get an image rather than a glow.',
    fair: 'Measure from the normal, never from the mirror. Keep the same slit and the same spot on the mirror, and repeat five times so one bad measurement is obvious.',
    stretch: 'Crinkle a piece of foil and shine the ray at that. The law still holds at every point, but the surface faces every direction, so you get scattering instead of an image.'
  },

  'solar-system': {
    title: 'A solar system you have to walk',
    question: 'How much empty space is there really between the planets?',
    days: 'Takes about 90 minutes, outdoors',
    needs: ['A long tape measure or a known pace length', 'Eight small labels or stones', 'A football for the Sun', 'A calculator', 'A long space: a field, playground or quiet street'],
    steps: [
      'Make the Sun a football, 22 cm across. That sets your scale at about 1 cm to 6.4 million km.',
      'Work out each planet distance at that scale: Mercury 9 m, Venus 17 m, Earth 23 m, Mars 36 m, Jupiter 122 m, Saturn 223 m, Uranus 449 m, Neptune 703 m.',
      'Put the football down and walk out each distance, dropping a labelled marker at each planet.',
      'At each marker, note what size the planet would be. Earth is a grain of sand, 2 mm across. Jupiter is a small marble.',
      'Walk back and photograph the view from Neptune toward the Sun.',
      'Write down how long it took you to walk the whole thing.'
    ],
    look: 'The four rocky planets fit in the first 40 metres. Then there is almost nothing for hundreds of metres. Nearly every textbook diagram is a lie about distance.',
    why: 'Diagrams squash the distances so the planets fit on a page. At true scale the solar system is overwhelmingly empty, which is why spacecraft take years to cross it.',
    fair: 'Not a fair test — it is a scale model. State your scale clearly and keep every distance on that same scale, including the planet sizes.',
    stretch: 'Work out where the nearest star would be at your scale. It is about 6,400 km away — roughly the far side of a continent.'
  },

  'evolution': {
    title: 'Bird beak buffet',
    question: 'Does one beak shape win at every food, or does each food favour a different beak?',
    days: 'Takes about an hour',
    needs: ['Tweezers, a teaspoon, chopsticks or a clothes peg — these are the beaks', 'Rice grains, dried beans, and water in a shallow dish — these are the foods', 'A cup per player, as the stomach', 'A stopwatch', 'A notebook'],
    steps: [
      'Put 30 rice grains in a tray. Give each player a different beak and 20 seconds to move as many as possible into their cup, one at a time.',
      'Record how many each beak collected.',
      'Repeat with the beans, then with water (count teaspoons moved, or weigh the cup).',
      'Swap beaks between players and repeat the whole set, so it is the beak being tested and not the person.',
      'Draw a bar chart with three groups of bars: one group per food, one bar per beak.',
      'Write a sentence predicting which beak would die out if only beans were left.'
    ],
    look: 'No beak wins everything. Tweezers dominate rice, the spoon dominates water, the peg handles beans. Each food has a different champion.',
    why: 'This is natural selection in twenty seconds. If the environment offers mostly one food, the birds whose beaks suit it eat more, survive better and leave more chicks — so the population shifts toward that beak shape.',
    fair: 'Same time limit, same number of items, one item at a time, and swap the beaks between people to remove the skill of the player.',
    stretch: 'Run a drought: replace the rice with beans halfway through and keep playing. Watch which beak suddenly has nothing to eat.'
  },

  'mixtures': {
    title: 'Pull a four-way mixture apart',
    question: 'Can you get back four separate substances from one jar of mess?',
    days: 'Takes about an hour, plus overnight drying',
    needs: ['Sand', 'Salt', 'Iron filings or steel wool snippets', 'Water', 'A magnet in a plastic bag', 'Filter paper or a coffee filter, and a funnel', 'Two jars and a saucer'],
    steps: [
      'Mix a spoon of sand, a spoon of salt and a pinch of iron filings in a dry jar. Photograph the mixture.',
      'Hold the bagged magnet over the mixture and lift out the iron. Peel the bag off to drop it cleanly into a dish.',
      'Add water and stir hard. The salt dissolves; the sand does not.',
      'Pour through the filter. The sand stays as residue; the salty water goes through.',
      'Pour the filtered water into a saucer and leave it somewhere warm overnight.',
      'In the morning, weigh or photograph all four recovered substances and compare with what you started with.'
    ],
    look: 'Four separate substances back, with no chemical reaction anywhere. The salt comes back as crystals, not powder.',
    why: 'Nothing in a mixture is chemically bonded, so each part keeps its own properties — magnetic, soluble, insoluble — and each property gives you a way to pull it out.',
    fair: 'Measure what you start with so you can say how much you recovered. Losing some is normal; say where you think it went.',
    stretch: 'Put the magnet in a bag before you use it and explain why. Then try recovering the water too, by distilling instead of evaporating.'
  },

  'microbes-disease': {
    title: 'Track an invisible infection',
    question: 'How far does one pair of unwashed hands spread something?',
    days: 'Takes about 45 minutes',
    needs: ['Fine glitter, or cinnamon', 'Hand lotion', 'Four or more willing people', 'A notebook', 'Soap, water and a sink', 'A timer'],
    steps: [
      'Patient zero rubs a little lotion on their hands, then a pinch of glitter. Nobody else is told who it is.',
      'Everyone mingles normally for three minutes: handshakes, passing a cup, touching door handles.',
      'Freeze. Photograph everyone’s hands and record who has glitter and how much.',
      'Map it: who shook hands with whom, and where the glitter ended up.',
      'Now test washing. One person rinses in cold water for 3 seconds, another uses soap for 20 seconds. Photograph both pairs of hands.',
      'Repeat the whole round with a rule that everyone washes properly first, and compare how far it spread.'
    ],
    look: 'Glitter reaches people who never touched patient zero — it travels through objects. A 3-second rinse barely works; 20 seconds with soap gets most of it.',
    why: 'Glitter behaves like a pathogen on skin: it moves by contact, including indirect contact through surfaces. Soap matters because it lifts the oily film that microbes cling to, which is why time and soap beat water alone.',
    fair: 'Same amount of glitter, same mingling time, and photograph hands under the same light. Change only the washing method between rounds.',
    stretch: 'Add one person who refuses to shake hands at all and see whether they stay clean. That is what isolating a case does.'
  },

  'magnetism': {
    title: 'How many paperclips can you lift?',
    question: 'Does adding more coils make an electromagnet stronger?',
    days: 'Takes about 45 minutes',
    needs: ['An iron nail, 8 cm or longer', 'About 2 m of thin insulated copper wire with the ends stripped', 'One 1.5 V battery in a holder', 'A pile of small steel paperclips', 'Sticky tape', 'A notebook'],
    steps: [
      'Wind 10 neat turns of wire round the nail, leaving both ends free. Tape them down.',
      'Touch the ends to the battery, dip the nail into the paperclips, lift, and count what comes up. Disconnect straight away.',
      'Repeat that count five times and take an average.',
      'Add more turns to make 20, then 30, then 40, and repeat the five counts each time.',
      'Plot a line graph: number of turns along the bottom, average paperclips up the side.',
      'Disconnect the battery and check that the nail drops nearly everything.'
    ],
    look: 'More turns lifts more clips, and the line climbs steeply at first then starts to flatten. Disconnecting drops the load almost completely.',
    why: 'Each turn of wire adds its own magnetic field, and inside the coil those fields line up and add together. The iron core concentrates them further. No current means no field, which is why it switches off.',
    fair: 'Same battery, same nail, same paperclips, same dipping depth. Change only the number of turns, and repeat five times because counting paperclips is noisy.',
    stretch: 'Let the battery go flat and run the test again. Then explain which variable changed, and why your graph is no longer comparable.'
  }
,
  'photosynthesis': {
    title: 'The leaf that lost its light',
    question: 'Does a leaf really need light to keep working?',
    days: 'Takes 4 days, about 10 minutes a day',
    needs: ['A living plant with big leaves (indoor or outdoor)', 'Aluminium foil', 'Two paper clips', 'A phone camera'],
    steps: [
      'Pick two healthy leaves on the same plant that both get the same sunlight.',
      'Wrap one leaf completely in foil and hold it shut with a paper clip. Leave the other one alone.',
      'Photograph both leaves on day 1, next to a ruler so the size is comparable.',
      'Leave the plant where it normally lives and water it as usual.',
      'On day 4, unwrap the foil and photograph both leaves again straight away.'
    ],
    look: 'The covered leaf should be paler, yellower or floppier than the uncovered one. The uncovered leaf should look unchanged.',
    why: 'Chlorophyll needs light to run photosynthesis. With no light the covered leaf could not make sugar, so it started breaking down its own chlorophyll — and green is the first thing to go.',
    fair: 'Same plant, same weather, same water. The only thing you changed was light.',
    stretch: 'Try covering only half of one leaf, so the line between covered and uncovered shows on a single leaf.'
  },

  'cells': {
    title: 'A cell you can hold',
    question: 'How do the parts of a cell fit together?',
    days: 'Takes about 45 minutes',
    needs: ['A zip-lock sandwich bag', 'Clear hair gel or thick cornflour-and-water mix', 'A plum, grape or bouncy ball', 'Dried beans, rice and a couple of buttons', 'Sticky labels and a marker'],
    steps: [
      'Half fill the bag with gel. That is the cytoplasm, and the bag itself is the cell membrane.',
      'Push the plum in near the middle. That is the nucleus.',
      'Add beans for mitochondria, rice for ribosomes and buttons for anything else you want to name.',
      'Seal the bag and lay it flat.',
      'Label every part with a sticky note saying what it is AND what it does.',
      'Make a second one inside a rectangular box or container to show a plant cell, and add a small water balloon for the vacuole.'
    ],
    look: 'The animal cell flops into a round-ish blob. The plant cell keeps the box shape because of its wall.',
    why: 'Structure matches function. A membrane is flexible because it has to let things through; a cell wall is stiff because its job is holding shape.',
    fair: 'This one is a model, not a test — so say clearly which parts are accurate and which are just the nearest household object.',
    stretch: 'Write one sentence per part explaining what would go wrong for the whole cell if that part stopped working.'
  },

  'states-of-matter': {
    title: 'The disappearing puddle race',
    question: 'What makes water evaporate faster?',
    days: 'Takes one day, checked every 2 hours',
    needs: ['Four identical saucers or jar lids', 'Water', 'A measuring spoon', 'A marker and paper', 'A warm spot, a cold spot and a breezy spot'],
    steps: [
      'Put exactly the same amount of water in all four saucers — measure it, do not guess.',
      'Put one in the sun, one in the shade, one in front of a fan, and one in the fridge.',
      'Every two hours, look at all four and rank them from driest to wettest.',
      'At the end of the day, measure what is left in each by tipping it back into the spoon.',
      'Draw a bar chart of how much water was lost in each spot.'
    ],
    look: 'Sun and fan should win easily. The fridge should barely change.',
    why: 'Evaporation happens when the fastest particles escape the surface. Heat gives more particles enough energy to leave, and moving air carries them away so fewer come back.',
    fair: 'Same saucer shape, same starting amount, same start time. Only the conditions changed.',
    stretch: 'Add a fifth saucer with the same water but a much wider dish, to test whether surface area matters.'
  },

  'water-cycle': {
    title: 'A water cycle in a bag',
    question: 'Can you watch the whole water cycle happen in one afternoon?',
    days: 'Set up in 10 minutes, watch over 2–3 hours',
    needs: ['A zip-lock freezer bag', 'Water', 'Blue food colouring (optional)', 'Sticky tape', 'A sunny window'],
    steps: [
      'Draw a sun, a cloud and a sea on the bag with a marker.',
      'Pour in about 3 cm of water, add a drop of colouring, and seal the bag tightly.',
      'Tape it to the inside of a sunny window, sea at the bottom.',
      'Check it every 30 minutes and photograph what you see.',
      'Label your photos with the stage names: evaporation, condensation, precipitation, collection.'
    ],
    look: 'Mist on the upper walls first, then droplets, then droplets running back down into the water at the bottom.',
    why: 'The sun heats the water so it evaporates. The cooler plastic higher up makes the vapour condense back into droplets, which grow heavy and run down. That is the whole cycle in one bag.',
    fair: 'Set up a second bag taped to a shaded window as a control, so you can prove the sun is what drives it.',
    stretch: 'Time how long the first droplets take to appear in the sunny bag versus the shaded one.'
  },

  'atoms': {
    title: 'Build the first ten elements',
    question: 'What actually changes from one element to the next?',
    days: 'Takes about an hour',
    needs: ['Modelling clay or plasticine in three colours', 'Ten paper plates or squares of card', 'A marker'],
    steps: [
      'Choose a colour for protons, one for neutrons and one for electrons. Write your key down.',
      'On plate 1, build hydrogen: 1 proton in the middle and 1 electron on a ring around it.',
      'Work up to plate 10, neon, adding one proton each time and matching neutrons and electrons.',
      'Draw the electron shells as rings: 2 electrons fit in the first, 8 in the second.',
      'Write the element name, symbol and atomic number on each plate.',
      'Lay all ten in a row and photograph them.'
    ],
    look: 'The first shell fills at helium, and the second shell fills at neon. Those two look complete and settled compared with the others.',
    why: 'The proton count is the element identity. The outer electrons decide how it reacts — which is why helium and neon, with full outer shells, react with almost nothing.',
    fair: 'Not a fair test, so present it as a model. Say what your model gets right and what it gets wrong (real atoms are mostly empty space, and electrons are not neat little balls).',
    stretch: 'Add lithium and sodium side by side and explain why they behave alike, using only the outer ring.'
  },

  'forces-motion': {
    title: 'Ramp race',
    question: 'Does a heavier car roll down a ramp faster?',
    days: 'Takes about 40 minutes',
    needs: ['Two toy cars the same size', 'Coins or blu-tack to add weight', 'A plank, tray or stiff card for a ramp', 'Books to raise the ramp', 'A tape measure and a stopwatch (a phone works)'],
    steps: [
      'Set the ramp on two books and mark a start line at the top and a finish line on the floor.',
      'Race car A down the ramp five times and record each time.',
      'Tape coins to car B until it is clearly heavier, then run it five times the same way.',
      'Work out the average time for each car.',
      'Now raise the ramp to four books and repeat both sets.'
    ],
    look: 'The heavier car should be about the same speed, not obviously faster. Raising the ramp should speed both of them up a lot.',
    why: 'A heavier car is pulled harder by gravity, but it also has more mass to get moving, and those two effects cancel. Steepness is what really changes the acceleration.',
    fair: 'Same ramp, same start line, same release (let go, never push). Repeat five times because one run is not evidence.',
    stretch: 'Tape sandpaper to the ramp and run it again to show what friction does.'
  },

  'energy': {
    title: 'Where does the bounce go?',
    question: 'Why does a dropped ball never bounce back to the same height?',
    days: 'Takes about 40 minutes',
    needs: ['Two or three different balls (tennis, ping-pong, rubber)', 'A tape measure taped to a wall', 'A phone that can film in slow motion (optional)', 'A hard floor'],
    steps: [
      'Tape the tape measure to the wall with zero on the floor.',
      'Drop the first ball from exactly 100 cm — drop it, never throw it.',
      'Record how high it comes back. Repeat five times and average.',
      'Repeat with each ball, always from 100 cm.',
      'Repeat the best ball from 50 cm and 150 cm.',
      'Work out bounce height as a percentage of drop height for every ball.'
    ],
    look: 'No ball reaches 100 percent. Each ball has its own fairly steady percentage, whatever the drop height.',
    why: 'Stored height energy becomes movement energy, but every bounce turns some of it into heat and sound. That energy is not destroyed — it has just spread out where you cannot use it.',
    fair: 'Same floor, same drop height, dropped not thrown, measured to the bottom of the ball each time.',
    stretch: 'Try the same ball on carpet and on tile and explain the difference using energy.'
  },

  'circuits': {
    title: 'What lets electricity through?',
    question: 'Which everyday materials are conductors?',
    days: 'Takes about 45 minutes',
    needs: ['A 1.5 V battery in a holder', 'A small torch bulb in a holder, or an LED', 'Three lengths of wire with bare ends (crocodile clips are easiest)', 'Test objects: a coin, a paper clip, a rubber band, a pencil lead, plastic, foil, a wooden lolly stick, a wet sponge'],
    steps: [
      'Build a circuit: battery to bulb to battery, and check the bulb lights.',
      'Now cut the loop by leaving a gap between two wire ends. The bulb should go out.',
      'Touch each test object across the gap, one at a time.',
      'Write down bright, dim or nothing for each object.',
      'Sort your objects into two lists, conductors and insulators, and look for what the conductors have in common.'
    ],
    look: 'Metals light the bulb brightly. Pencil lead lights it dimly. Rubber, wood and plastic do nothing.',
    why: 'Metals have electrons that are free to move, so charge flows. In insulators the electrons are held tightly. Pencil lead is graphite, a form of carbon that conducts, but not as well as metal — so the bulb is dim.',
    fair: 'Same battery and same bulb throughout, and touch the same two points every time.',
    stretch: 'Test tap water, then salty water. Explain the difference.'
  },

  'ecosystems': {
    title: 'One square metre',
    question: 'How much is living in a patch of ground you walk past every day?',
    days: 'Takes an hour outside, plus 30 minutes to draw it up',
    needs: ['String and four sticks or stones to mark a square', 'A tape measure', 'A notebook', 'A phone camera', 'A magnifying glass if you have one'],
    steps: [
      'Mark out a square metre of ground — grass, a flower bed, a patch of woodland.',
      'Sit still and watch for five minutes before you touch anything, and write down what moves.',
      'Count and photograph every different living thing you can find. Do not collect them, just record them.',
      'Note the non-living things too: sunlight, shade, water, soil type, litter.',
      'Repeat in a second, different square (a shady one, or a mown lawn) for comparison.',
      'Draw a food web linking everything you found, with arrows pointing toward the eater.'
    ],
    look: 'The messier, less-mown square almost always holds more kinds of living things.',
    why: 'More plant variety means more food and more places to shelter, so more species can fit in without competing for exactly the same niche.',
    fair: 'Same size square, same amount of time spent looking, same time of day.',
    stretch: 'Predict what happens to your food web if you remove one species, and explain the knock-on effects.'
  },

  'chemical-change': {
    title: 'Five changes, one question',
    question: 'Which of these changes made a brand new substance?',
    days: 'Takes about an hour',
    needs: ['Bicarbonate of soda and vinegar', 'An ice cube', 'A sheet of paper', 'Steel wool and a saucer of water', 'Salt and warm water', 'Five small containers, a notebook'],
    steps: [
      'Set up five stations, one per change. Photograph each one before you start.',
      'Station 1: a spoon of bicarb, then a splash of vinegar.',
      'Station 2: an ice cube left in a dish.',
      'Station 3: tear the paper into strips.',
      'Station 4: damp steel wool in a saucer, left for three days.',
      'Station 5: stir salt into warm water until it disappears.',
      'For every station, write down what you saw, then decide: physical or chemical, and give your reason.'
    ],
    look: 'Bubbles at station 1 and orange-brown flakes at station 4. Everything else only changes form.',
    why: 'A chemical change makes a new substance — a new gas, a new colour, heat or light. Melting, tearing and dissolving only rearrange what was already there, which is why they are easy to undo.',
    fair: 'Judge each station on evidence, not on what you expected. Write the evidence before the verdict.',
    stretch: 'Try to reverse each change. The ones you cannot undo are the chemical ones.'
  },

  'plate-tectonics': {
    title: 'Plate boundaries you can eat',
    question: 'What happens where two plates meet?',
    days: 'Takes about 30 minutes',
    needs: ['Graham crackers, digestive biscuits or crispbread', 'Icing, frosting or thick yoghurt', 'A plate', 'A small bowl of water'],
    steps: [
      'Spread a 1 cm layer of icing on the plate. That is the mantle — soft and slow-flowing.',
      'Lay two biscuits side by side on the icing, touching.',
      'Divergent: pull them slowly apart and watch the icing rise into the gap.',
      'Transform: push them past each other sideways and feel them catch, then jolt free.',
      'Convergent: dip one biscuit edge in water for two seconds, then push it under the dry one.',
      'Photograph each boundary and label it with a real place on Earth that does the same thing.'
    ],
    look: 'The jolt in the transform test is the best bit — that sudden release is exactly what an earthquake is.',
    why: 'The plates are stiff and the mantle beneath is not. Everything dramatic happens at the edges: new ground where they part, mountains and volcanoes where they meet, earthquakes where they scrape.',
    fair: 'This is a model, so name its limits — real plates take millions of years and are not made of biscuit.',
    stretch: 'Mark the Mid-Atlantic Ridge, the Himalayas and the San Andreas Fault on a world map and label which boundary each one is.'
  },

  'body-systems': {
    title: 'How fast does your heart pay you back?',
    question: 'How quickly does a pulse return to normal after exercise?',
    days: 'Takes about 40 minutes',
    needs: ['A stopwatch or phone', 'A notebook', 'A chair', 'Space to do star jumps', 'A willing family member or two'],
    steps: [
      'Sit still for two minutes, then count your pulse for 30 seconds and double it. That is your resting rate.',
      'Do star jumps for one minute.',
      'Take your pulse immediately, then again every minute for the next five minutes.',
      'Plot heart rate against time on a line graph, with a dotted line showing your resting rate.',
      'Repeat with two other people and put all three lines on the same graph.'
    ],
    look: 'Everyone spikes. The interesting difference is how fast the line comes back down to the dotted one.',
    why: 'Working muscles need more oxygen and produce more carbon dioxide, so the heart pumps faster to move blood quicker. Recovery time is a fair measure of fitness — fitter hearts return to resting sooner.',
    fair: 'Same exercise for the same length of time, same counting method, everyone sitting during recovery.',
    stretch: 'Count breaths per minute alongside pulse and show how the two systems rise and fall together.'
  },

  'genetics': {
    title: 'Trait survey',
    question: 'How do inherited traits spread through a family?',
    days: 'Takes about an hour, plus asking around',
    needs: ['A notebook or a printed tally sheet', 'At least 15 people to ask (family, class, team)', 'A mirror'],
    steps: [
      'Pick four traits that are easy to spot: attached or free earlobes, tongue rolling, a widow’s peak hairline, hitchhiker’s thumb.',
      'Record your own four traits first.',
      'Ask at least 15 people and tally each trait. Do not record anyone’s name.',
      'Turn each tally into a percentage and draw a bar chart.',
      'For one trait, ask a family group of three or more and draw a simple family tree.',
      'Use a Punnett square to show how two parents could produce a child with the recessive version.'
    ],
    look: 'The dominant version is usually more common, but not always — being dominant is not the same as being frequent.',
    why: 'You carry two alleles for each trait. A dominant allele shows even with one copy, so recessive traits can hide for a generation and reappear later.',
    fair: 'Ask everyone the same way and count honestly, including yourself. Keep the data anonymous.',
    stretch: 'Explain why some of these traits are really controlled by several genes, and why that makes the simple Punnett square only part of the story.'
  },

  'waves': {
    title: 'Seeing sound',
    question: 'What is actually moving when you hear something?',
    days: 'Takes about 40 minutes',
    needs: ['A big bowl', 'Cling film or a cut balloon', 'A rubber band', 'Uncooked rice or salt', 'A speaker or phone that plays a tone', 'A ruler'],
    steps: [
      'Stretch the cling film tightly over the bowl and hold it with the rubber band. It should be drum-tight.',
      'Sprinkle a thin layer of rice on top.',
      'Play a low tone near the bowl, fairly loud, and watch the rice.',
      'Turn the volume up and down and record what changes.',
      'Change the pitch from low to high and record what changes.',
      'Now hang a ruler over the edge of a table, twang it, and shorten the overhang bit by bit.'
    ],
    look: 'The rice jumps higher when it is louder, not when it is higher pitched. The shorter ruler vibrates faster and sounds higher.',
    why: 'Sound is a vibration travelling through air. Amplitude — the size of the vibration — is loudness. Frequency — how many vibrations per second — is pitch. The rice is showing you the air pushing on the film.',
    fair: 'Same bowl, same amount of rice, speaker the same distance away every time.',
    stretch: 'Film the rice in slow motion and count how the jumping changes between two clearly different notes.'
  }
};
