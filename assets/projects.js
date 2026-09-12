/* projects.js — one real, doable science project per topic.
   Household materials only, nothing sharp, nothing on fire. Each one is a fair test:
   a question, a thing you change, and a thing you measure. */

window.PROJECTS = {

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
