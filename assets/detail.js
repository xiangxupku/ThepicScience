/* detail.js — the deeper layer for each topic.
   The 12 scenes teach the idea. This is what a test actually asks on top of it: the
   formulas with every symbol spelled out, the mistakes people really lose marks on, a few
   things that go past the basics, and how the topic joins up with the others.

   formulas: { f, what }            the equation, then it said in words
   mistakes: { wrong, right }       what people believe, and what is actually true
   deeper:   { t, b }               a step beyond the twelve scenes
   links:    { id, why }            another topic in the library, and the connection */

window.DETAIL = {

  'acids-bases': {
    formulas: [
      { f: 'acid + base → salt + water', what: 'neutralisation. The H⁺ from the acid and the OH⁻ from the base join to make water, and whatever is left over is the salt.' },
      { f: 'acid + metal → salt + hydrogen', what: 'the fizzing is hydrogen. A lit splint held over it pops.' },
      { f: 'acid + carbonate → salt + water + CO₂', what: 'three products, not two. Bubble the gas through limewater and it turns milky.' },
      { f: 'pH 0 ── 7 ── 14, each step ×10', what: 'so pH 2 is a hundred times as acidic as pH 4, not twice as acidic.' }
    ],
    mistakes: [
      { wrong: 'Strong and concentrated mean the same thing.', right: 'Strong is how completely the acid releases its H⁺. Concentrated is how much acid is in the water. Concentrated vinegar is still a weak acid.' },
      { wrong: 'All bases are alkalis.', right: 'An alkali is a base that dissolves in water. Copper oxide is a base but not an alkali.' },
      { wrong: 'Neutral means nothing is in it.', right: 'Neutral means pH 7 — the H⁺ and OH⁻ balance. Salt water is neutral and far from empty.' }
    ],
    deeper: [
      { t: 'Picking the right indicator', b: 'Universal indicator gives you a pH but a vague endpoint. For a titration you want one that flips sharply: phenolphthalein, colourless in acid and pink in alkali.' },
      { t: 'Why antacids work', b: 'They are weak bases — usually carbonates or hydroxides — that neutralise excess stomach acid without pushing you past neutral. That is also why they fizz.' },
      { t: 'Acid rain, properly', b: 'Sulfur dioxide and nitrogen oxides from burning fuels dissolve in rain to make sulfuric and nitric acid. It dissolves limestone, strips nutrients from soil and kills fish in lakes below about pH 5.' }
    ],
    links: [
      { id: 'chemical-change', why: 'neutralisation is a chemical reaction, so mass is conserved in it' },
      { id: 'atoms', why: 'an acid is really about one loose electron-less hydrogen' },
      { id: 'body-systems', why: 'your stomach runs at pH 2 and your small intestine does not' }
    ]
  },

  'light-optics': {
    formulas: [
      { f: 'angle of incidence = angle of reflection', what: 'both measured from the normal — the dotted line at 90° to the surface — never from the surface itself.' },
      { f: 'speed of light = 300,000,000 m/s', what: 'in a vacuum. It slows in glass and water, and slowing is what makes it bend.' },
      { f: 'v = f × λ', what: 'light is a wave too, so speed = frequency × wavelength applies here as well.' }
    ],
    mistakes: [
      { wrong: 'Angles are measured from the mirror.', right: 'Always from the normal. Measuring from the mirror turns a 30° answer into 60° and loses the mark.' },
      { wrong: 'We see things because light leaves our eyes.', right: 'Light travels from a source, bounces off the object, and enters your eye. Nothing comes out of your eye.' },
      { wrong: 'A red object adds red to the light.', right: 'It absorbs the other colours and reflects red. Shine pure blue light on it and it looks black.' }
    ],
    deeper: [
      { t: 'Drawing a ray diagram that scores', b: 'Use a ruler, put arrows on every ray, draw the normal as a dashed line, and label the angles. Markers look for the arrows and the normal before they look at the angles.' },
      { t: 'Why total internal reflection has a limit', b: 'Past the critical angle — about 42° for glass — refraction cannot bend the ray enough to escape, so all of it reflects. Below that angle some light still gets out.' },
      { t: 'Real and virtual images', b: 'A mirror image is virtual: the light never actually goes there, so you cannot catch it on a screen. A convex lens can make a real image, which is how a projector works.' }
    ],
    links: [
      { id: 'waves', why: 'light is one band of the electromagnetic spectrum' },
      { id: 'body-systems', why: 'your eye is a lens, an aperture and a sensor' },
      { id: 'solar-system', why: 'eclipses are shadows, which only work because light goes straight' }
    ]
  },

  'solar-system': {
    formulas: [
      { f: 'rotation = 1 day · orbit = 1 year', what: 'spinning on its axis gives day and night. Going round the Sun gives the year. Two different motions, two different results.' },
      { f: 'axial tilt = 23.5°', what: 'the cause of the seasons. Distance from the Sun is not — we are closest in January.' },
      { f: '1 light year ≈ 9.5 trillion km', what: 'a distance, not a time. Light takes 8 minutes from the Sun and 4.2 years from the next star.' }
    ],
    mistakes: [
      { wrong: 'Summer happens when Earth is closer to the Sun.', right: 'It is the tilt. The southern hemisphere has summer in December while Earth is further from the Sun than in June.' },
      { wrong: 'The Moon has a permanently dark side.', right: 'It has a far side we never see, because it keeps one face toward us. Every part of it gets sunlight during the month.' },
      { wrong: 'There is no gravity in space.', right: 'Gravity is what holds the orbits. Astronauts float because they are falling around Earth at the same rate as their spacecraft.' }
    ],
    deeper: [
      { t: 'Why the Moon shows the same face', b: 'Earth’s gravity has slowed the Moon’s spin until one rotation takes exactly one orbit. That is tidal locking, and most large moons do it.' },
      { t: 'Why eclipses are rare', b: 'The Moon’s orbit is tilted about 5° to Earth’s, so usually its shadow misses us entirely. They only line up at the crossing points.' },
      { t: 'Looking back in time', b: 'Light takes time to arrive, so every telescope is a time machine. Looking at a galaxy a billion light years away shows it as it was a billion years ago.' }
    ],
    links: [
      { id: 'forces-motion', why: 'an orbit is gravity plus sideways speed, nothing more' },
      { id: 'light-optics', why: 'shadows, eclipses and telescopes are all optics' },
      { id: 'energy', why: 'the Sun is the energy source for almost everything on Earth' }
    ]
  },

  'evolution': {
    formulas: [
      { f: 'variation → competition → survival → inheritance', what: 'the four steps, in order. Every evolution answer is really one of these four being asked about.' },
      { f: 'over 99% of species are extinct', what: 'extinction is the normal outcome, not a failure of the theory.' }
    ],
    mistakes: [
      { wrong: 'Individuals evolve during their lives.', right: 'Populations evolve across generations. A giraffe cannot stretch its neck and pass that on; giraffes with longer necks simply left more offspring.' },
      { wrong: 'Evolution has a goal, or makes things better.', right: 'It has no direction. It only tracks whatever survives in the conditions of the moment, and conditions change.' },
      { wrong: 'Humans evolved from monkeys.', right: 'We share a common ancestor with them. We are cousins on the same tree, not descendants.' }
    ],
    deeper: [
      { t: 'Why the peppered moth is the standard example', b: 'Soot darkened the trees, dark moths were suddenly camouflaged and pale ones were eaten, so dark forms went from rare to common in decades. Clean Air Acts reversed it.' },
      { t: 'What "fittest" really means', b: 'Not strongest or fastest — best fitted to the current conditions. In a drought the fittest finch is the one whose beak matches the seeds that are left.' },
      { t: 'Evidence stacked up', b: 'Fossils in age order, matching bone structures across species, embryos that look alike early on, and DNA similarity that puts every species on one tree. They all agree.' }
    ],
    links: [
      { id: 'genetics', why: 'mutation and inheritance supply the variation selection acts on' },
      { id: 'ecosystems', why: 'the environment is what does the selecting' },
      { id: 'microbes-disease', why: 'antibiotic resistance is evolution you can watch in a week' }
    ]
  },

  'mixtures': {
    formulas: [
      { f: 'solute + solvent = solution', what: 'the thing that dissolves, the liquid doing it, and the result.' },
      { f: 'insoluble solid → filter · dissolved solid → evaporate · the liquid → distil', what: 'the decision tree for almost every separation question.' },
      { f: 'pure = one sharp melting point', what: 'a mixture melts over a range. That is the purity test with no equipment.' }
    ],
    mistakes: [
      { wrong: 'Filtering separates salt from water.', right: 'Dissolved salt passes straight through the paper. Filtering only catches what did not dissolve.' },
      { wrong: 'Dissolving is a chemical change.', right: 'It is physical. Nothing new is made, which is why evaporating gets your salt back unchanged.' },
      { wrong: 'Pure means clean or healthy.', right: 'In chemistry it means one single substance. Pure water, pure sodium and pure arsenic are all pure.' }
    ],
    deeper: [
      { t: 'Reading a solubility curve', b: 'Grams of solute per 100 g of water, plotted against temperature. Above the line it cannot all dissolve; cool a saturated solution and the excess drops out as crystals.' },
      { t: 'Fractional distillation', b: 'Several liquids with different boiling points separate up a column: the lowest boiling point reaches the top first. It is how crude oil becomes petrol, diesel and tar.' },
      { t: 'Chromatography with numbers', b: 'Rf = distance moved by the spot ÷ distance moved by the solvent. The same substance gives the same Rf in the same solvent, which is how samples get identified.' }
    ],
    links: [
      { id: 'states-of-matter', why: 'every separation method is a phase change put to work' },
      { id: 'chemical-change', why: 'the physical half of the physical-or-chemical question' },
      { id: 'water-cycle', why: 'rain is distillation happening on a planetary scale' }
    ]
  },

  'microbes-disease': {
    formulas: [
      { f: 'pathogen → transmission → infection → response', what: 'the chain. Break it anywhere and the disease stops spreading.' },
      { f: 'antibiotics: bacteria yes, viruses no', what: 'viruses hide inside your own cells and lack the structures antibiotics attack.' },
      { f: 'barrier → white blood cell → memory', what: 'the three layers of defence, in the order they act.' }
    ],
    mistakes: [
      { wrong: 'Antibiotics will help a cold or flu.', right: 'Those are viral. Taking antibiotics does nothing for you and helps resistant bacteria spread.' },
      { wrong: 'A vaccine gives you the disease in small doses.', right: 'It gives a dead, weakened or partial pathogen — enough to learn from, not enough to infect you.' },
      { wrong: 'All microbes are germs.', right: 'The vast majority are harmless or essential. Your gut bacteria, bread yeast and yoghurt cultures are all microbes.' }
    ],
    deeper: [
      { t: 'Why the second exposure is easier', b: 'Memory cells persist for years. On a second meeting the right antibody is produced in hours rather than days, so you often never notice being infected.' },
      { t: 'Herd immunity has a threshold', b: 'The more infectious the disease, the higher the share of immune people needed. Measles needs about 95 per cent, which is why small drops in uptake cause outbreaks.' },
      { t: 'Why handwashing beats rinsing', b: 'Soap molecules have a water-loving end and an oil-loving end, so they lift the greasy film microbes cling to and let it rinse away. Time matters because that lifting is not instant.' }
    ],
    links: [
      { id: 'cells', why: 'bacteria are cells without a nucleus; viruses are not cells at all' },
      { id: 'evolution', why: 'antibiotic resistance is natural selection on a timescale you can see' },
      { id: 'body-systems', why: 'the immune system runs through your blood and lymph' }
    ]
  },

  'magnetism': {
    formulas: [
      { f: 'like poles repel · opposite poles attract', what: 'and you can never have one pole alone. Cut a magnet in half and each half grows a new pair.' },
      { f: 'field lines run N → S outside the magnet', what: 'arrows always that way, lines never cross, and closer together means stronger.' },
      { f: 'more turns + more current + iron core = stronger electromagnet', what: 'the three variables worth testing, one at a time.' }
    ],
    mistakes: [
      { wrong: 'All metals are magnetic.', right: 'Only iron, steel, nickel and cobalt. Aluminium, copper and gold are not, which is how recycling plants sort cans.' },
      { wrong: 'A compass points to the North Pole.', right: 'It points to the magnetic north pole, which drifts and is not in the same place as the geographic one.' },
      { wrong: 'A motor and a generator are different machines.', right: 'They are the same machine run in opposite directions. Current in gives motion out; motion in gives current out.' }
    ],
    deeper: [
      { t: 'Why an iron core helps so much', b: 'Iron contains tiny magnetic domains pointing in random directions. The coil’s field swings them into line, and their added fields can multiply the strength many times over.' },
      { t: 'Induction needs change', b: 'A magnet sitting still next to a coil induces nothing. The field has to be changing — moving the magnet, moving the coil, or switching the current — which is why generators spin.' },
      { t: 'Earth’s field flips', b: 'Rock hardening at a mid-ocean ridge records the field direction of the time. Those stripes show the poles have reversed many times, and they helped prove seafloor spreading.' }
    ],
    links: [
      { id: 'circuits', why: 'an electromagnet is a circuit, so V = I × R still sets the current' },
      { id: 'energy', why: 'generators are how almost all our electricity is actually made' },
      { id: 'plate-tectonics', why: 'magnetic stripes on the seafloor are evidence the plates move' }
    ]
  }
,
  'photosynthesis': {
    formulas: [
      { f: '6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂', what: 'six carbon dioxide plus six water, using light energy, gives one glucose plus six oxygen. Light and chlorophyll go above the arrow because they are conditions, not ingredients.' },
      { f: 'glucose + oxygen → CO₂ + water', what: 'respiration, which is this same equation run backwards. Both happen in a plant at once.' }
    ],
    mistakes: [
      { wrong: 'Plants only respire at night.', right: 'Plants respire every second of their lives. In daylight photosynthesis simply runs faster, so the plant gives out more oxygen than it takes in.' },
      { wrong: 'Plants get their food from the soil.', right: 'Soil gives minerals like nitrates. The actual food — glucose — is built from air and water using light.' },
      { wrong: 'Photosynthesis happens all over the plant.', right: 'Almost all of it is in the leaves, inside the chloroplasts. Roots have none at all.' }
    ],
    deeper: [
      { t: 'It happens in two stages, in two places', b: 'The light-dependent stage runs in the thylakoid membranes and splits water. The Calvin cycle runs in the stroma around them and builds the sugar. Only the first stage needs light directly.' },
      { t: 'Why the rate graph flattens out', b: 'Increase light and the rate climbs, then levels off — because something else has become the limiting factor, usually carbon dioxide or temperature. That plateau is the point of the whole experiment.' },
      { t: 'Why leaves turn red and gold', b: 'In autumn the plant breaks chlorophyll down and reclaims the nitrogen. The orange and yellow pigments were there all along, just hidden under the green.' }
    ],
    links: [
      { id: 'ecosystems', why: 'this is the doorway every joule of food energy comes through' },
      { id: 'cells', why: 'the chloroplast is the part doing the work' },
      { id: 'chemical-change', why: 'it is a chemical reaction, so mass is conserved here too' }
    ]
  },

  'cells': {
    formulas: [
      { f: 'magnification = image size ÷ actual size', what: 'rearrange it to find the real size of something you measured on a photograph. Keep both measurements in the same units first.' },
      { f: 'total magnification = eyepiece × objective', what: 'a ×10 eyepiece with a ×40 objective gives ×400.' }
    ],
    mistakes: [
      { wrong: 'Plant cells have a wall instead of a membrane.', right: 'They have both. The membrane still does the controlling; the wall outside it only holds the shape.' },
      { wrong: 'Every cell has a nucleus.', right: 'Bacteria do not, and neither do mature red blood cells — which is what makes room for more haemoglobin.' },
      { wrong: 'Cells are all roughly the same size.', right: 'A nerve cell can be a metre long. What limits most cells is surface area compared with volume.' }
    ],
    deeper: [
      { t: 'Why cells stay small', b: 'Double a cell’s width and its volume grows eight times while its surface only grows four. Past a certain size it cannot get materials in fast enough, so it divides instead of growing.' },
      { t: 'How things actually cross the membrane', b: 'Diffusion moves particles from high to low concentration. Osmosis is the same thing for water. Active transport pushes the other way and costs energy from the mitochondria.' },
      { t: 'Stem cells', b: 'Some cells have not specialised yet and can still become any type. That is why they matter in medicine.' }
    ],
    links: [
      { id: 'genetics', why: 'the DNA in that nucleus is the instruction set' },
      { id: 'body-systems', why: 'cells make tissues, tissues make organs' },
      { id: 'photosynthesis', why: 'chloroplasts are where a plant cell makes food' }
    ]
  },

  'states-of-matter': {
    formulas: [
      { f: 'density = mass ÷ volume', what: 'measured in g/cm³ or kg/m³. It is why ice floats: the same mass takes up more space.' }
    ],
    mistakes: [
      { wrong: 'Particles get bigger when you heat something.', right: 'The particles are unchanged. They move faster and spread further apart, which is what makes the substance expand.' },
      { wrong: 'The bubbles in boiling water are air.', right: 'They are water vapour — the liquid turning to gas inside itself. That is the difference between boiling and evaporating.' },
      { wrong: 'Evaporation and boiling are the same thing.', right: 'Evaporation happens at the surface at any temperature. Boiling happens throughout the liquid, at one fixed temperature.' }
    ],
    deeper: [
      { t: 'The flat bit on a heating graph', b: 'While ice melts, the temperature does not move even though heat keeps going in. That energy is breaking the forces between particles, not speeding them up. It is called latent heat.' },
      { t: 'Melting and boiling points identify a substance', b: 'Pure water melts at 0 °C and boils at 100 °C. A sample that melts over a range instead of at one temperature is a mixture.' },
      { t: 'Gas pressure', b: 'Gas particles push by bouncing off the walls. Squeeze them into less space, or heat them so they hit harder, and the pressure goes up.' }
    ],
    links: [
      { id: 'water-cycle', why: 'the whole cycle is phase changes on a planetary scale' },
      { id: 'chemical-change', why: 'melting and boiling are the classic physical changes' },
      { id: 'energy', why: 'heating is energy transfer, and particle speed is kinetic energy' }
    ]
  },

  'water-cycle': {
    formulas: [
      { f: '97% salt water · 2% frozen · under 1% usable', what: 'the split of all the water on Earth. That last figure is the one worth remembering in an answer about water shortages.' }
    ],
    mistakes: [
      { wrong: 'Clouds are made of water vapour.', right: 'Water vapour is invisible. A cloud is already liquid droplets — condensation has happened.' },
      { wrong: 'Rain falls because clouds get too heavy.', right: 'Individual droplets grow by joining together until the rising air can no longer hold one up. It is per droplet, not per cloud.' },
      { wrong: 'The water cycle makes new water.', right: 'It moves the same water around. Nothing is created, which is why the rain today is ancient.' }
    ],
    deeper: [
      { t: 'Where the energy comes from', b: 'Evaporating water absorbs a lot of heat, and condensing releases it again higher up. Hurricanes are that released heat driving a storm.' },
      { t: 'Groundwater and aquifers', b: 'Rain that soaks in can sit underground for thousands of years. Pump it out faster than rain refills it and the ground itself can sink.' },
      { t: 'Why the coast is milder', b: 'Water heats and cools far more slowly than land, so places near the sea have cooler summers and warmer winters than places inland.' }
    ],
    links: [
      { id: 'states-of-matter', why: 'evaporation and condensation are the phase changes behind it' },
      { id: 'ecosystems', why: 'rainfall is what decides which ecosystem a place gets' },
      { id: 'plate-tectonics', why: 'running water is the main thing wearing mountains back down' }
    ]
  },

  'atoms': {
    formulas: [
      { f: 'atomic number = number of protons', what: 'and in a neutral atom it is the number of electrons too.' },
      { f: 'mass number = protons + neutrons', what: 'so neutrons = mass number − atomic number. That subtraction is a guaranteed exam question.' },
      { f: 'electron shells: 2, 8, 8', what: 'how many fit in each shell going outwards, for the first twenty elements.' }
    ],
    mistakes: [
      { wrong: 'An atom is a solid ball.', right: 'It is almost entirely empty space. If the nucleus were a marble, the nearest electrons would be a kilometre away.' },
      { wrong: 'Ions are atoms with extra neutrons.', right: 'Ions have gained or lost electrons. Change the neutrons and you get an isotope, which is a different thing.' },
      { wrong: 'The periodic table is ordered by mass.', right: 'It is ordered by proton number. Mendeleev got a few pairs the other way round precisely because he used mass.' }
    ],
    deeper: [
      { t: 'Why group 1 gets more reactive going down', b: 'Sodium, potassium, rubidium — the outer electron sits further from the nucleus each time, so it is held more loosely and given away more eagerly.' },
      { t: 'Why group 7 does the opposite', b: 'These need to gain an electron, and a smaller atom pulls one in more strongly. So fluorine at the top is the most reactive.' },
      { t: 'Carbon dating', b: 'Carbon-14 decays at a fixed rate, halving every 5,730 years. Measure how much is left in something that was once alive and you get its age.' }
    ],
    links: [
      { id: 'chemical-change', why: 'bonding and reactions are all about those outer electrons' },
      { id: 'circuits', why: 'a current is those loose outer electrons on the move' },
      { id: 'energy', why: 'chemical energy is stored in the bonds between atoms' }
    ]
  },

  'forces-motion': {
    formulas: [
      { f: 'F = m × a', what: 'force in newtons, mass in kilograms, acceleration in m/s². Rearranges to a = F ÷ m.' },
      { f: 'weight = m × g', what: 'g is about 9.8 N/kg on Earth. A 50 kg student weighs about 490 N.' },
      { f: 'speed = distance ÷ time', what: 'and acceleration = change in velocity ÷ time taken.' }
    ],
    mistakes: [
      { wrong: 'A moving object needs a constant force to keep moving.', right: 'It keeps moving on its own. Force is only needed to change the motion — that is the first law, and friction is what hides it on Earth.' },
      { wrong: 'Heavier things fall faster.', right: 'Without air resistance they fall together. A hammer and a feather were dropped on the moon to prove it.' },
      { wrong: 'Action and reaction forces cancel out.', right: 'They act on two different objects, so they never cancel. Only forces on the same object can balance.' }
    ],
    deeper: [
      { t: 'Free-body diagrams', b: 'Draw the object as a dot and every force as an arrow from it. Longer arrow means bigger force. Most force questions become obvious once you have drawn one.' },
      { t: 'Terminal velocity, properly', b: 'A skydiver accelerates, air resistance grows with speed, and when it equals weight the forces balance. No acceleration means a steady speed, not a stop.' },
      { t: 'Momentum', b: 'Momentum = mass × velocity, and the total in a crash is the same before and after. It is why crumple zones work: they stretch the change over more time, so the force is smaller.' }
    ],
    links: [
      { id: 'energy', why: 'work is force times distance, so these two topics are the same story' },
      { id: 'body-systems', why: 'muscles pulling on bones are forces on levers' },
      { id: 'plate-tectonics', why: 'enormous slow forces, building until the rock gives' }
    ]
  },

  'energy': {
    formulas: [
      { f: 'KE = ½ × m × v²', what: 'kinetic energy in joules. Because velocity is squared, doubling your speed quadruples the energy — which is the whole argument for speed limits.' },
      { f: 'GPE = m × g × h', what: 'gravitational store, in joules: mass × 9.8 × height.' },
      { f: 'efficiency = useful energy ÷ total energy × 100', what: 'as a percentage. It can never be over 100.' },
      { f: 'power = energy ÷ time', what: 'in watts. One watt is one joule per second.' }
    ],
    mistakes: [
      { wrong: 'Energy gets used up.', right: 'It is transferred and spreads out, usually as heat. The total never changes — it just ends up somewhere useless.' },
      { wrong: 'Heat and temperature are the same.', right: 'Temperature is how fast the particles move. Heat is the energy that flows from hot to cold. A bath at 40 °C holds far more energy than a cup at 90 °C.' },
      { wrong: 'Renewable means there is an endless supply right now.', right: 'It means it refills as fast as we use it. A calm day still gives you no wind power.' }
    ],
    deeper: [
      { t: 'Sankey diagrams', b: 'Arrows drawn to scale: the width shows how much energy goes each way. The wasted branch is almost always heat, and its width is the inefficiency.' },
      { t: 'Specific heat capacity', b: 'How much energy it takes to raise 1 kg by 1 °C. Water’s is unusually high, which is why it is used in radiators and why the sea moderates climate.' },
      { t: 'Where it all ends up', b: 'Follow any energy chain far enough and it finishes as low-grade heat spread through the surroundings. That one-way drift is why perpetual motion cannot work.' }
    ],
    links: [
      { id: 'forces-motion', why: 'work done by a force is energy transferred' },
      { id: 'circuits', why: 'a circuit is an energy delivery system' },
      { id: 'photosynthesis', why: 'the start of nearly every energy chain on Earth' }
    ]
  },

  'circuits': {
    formulas: [
      { f: 'V = I × R', what: 'volts = amps × ohms. Rearranges to I = V ÷ R and R = V ÷ I.' },
      { f: 'P = V × I', what: 'power in watts. It is how appliance ratings and fuse sizes are worked out.' },
      { f: 'series: V splits, I is the same', what: 'parallel is the mirror image — V is the same across each branch, and the current splits between them.' }
    ],
    mistakes: [
      { wrong: 'Current is used up by the bulb.', right: 'The same current that goes in comes back out. What gets used is energy, not charge.' },
      { wrong: 'The battery supplies the current.', right: 'It supplies the voltage — the push. How much current flows depends on the resistance as well.' },
      { wrong: 'Electrons zoom round the circuit at light speed.', right: 'Individual electrons drift slowly, millimetres per second. The effect travels almost instantly because they all start moving together.' }
    ],
    deeper: [
      { t: 'The rules worth memorising', b: 'Series: add the resistances, current is the same everywhere, voltages add to the supply. Parallel: total resistance is less than the smallest branch, and every branch gets the full voltage.' },
      { t: 'Why houses are wired in parallel', b: 'Everything gets the full 230 V, everything switches independently, and one failure does not darken the house.' },
      { t: 'Fuses and ratings', b: 'A fuse is a deliberately weak wire. Work out the current with I = P ÷ V and choose the next fuse size up.' }
    ],
    links: [
      { id: 'atoms', why: 'current is the outer electrons of metal atoms, moving' },
      { id: 'energy', why: 'voltage is energy given to each unit of charge' },
      { id: 'body-systems', why: 'nerves carry signals electrically too, just chemically triggered' }
    ]
  },

  'ecosystems': {
    formulas: [
      { f: 'about 10% passes to the next level', what: 'the rest is spent living or lost as heat. Four levels up and you have almost nothing left — which is why food chains are short.' }
    ],
    mistakes: [
      { wrong: 'The arrows point at what gets eaten.', right: 'They point at the eater, because they follow the energy. Drawing them backwards loses the mark every time.' },
      { wrong: 'Removing a predator is good for the prey.', right: 'Prey numbers boom, then strip their own food supply and crash. The classic graph is two wobbling lines, not one rising one.' },
      { wrong: 'Energy cycles round an ecosystem.', right: 'Energy flows through and leaves as heat. It is matter — carbon, nitrogen, water — that cycles.' }
    ],
    deeper: [
      { t: 'Three kinds of pyramid', b: 'Numbers can look wrong — one oak tree feeding thousands of insects gives an upside-down pyramid. Biomass usually fixes it. Energy pyramids are never upside down.' },
      { t: 'The carbon cycle', b: 'Photosynthesis takes carbon out of the air, respiration and decay put it back, and burning fossil fuels adds carbon that was locked away for millions of years.' },
      { t: 'Invasive species', b: 'A species with no predators in a new place multiplies unchecked and outcompetes natives. Cane toads and grey squirrels are the standard examples.' }
    ],
    links: [
      { id: 'photosynthesis', why: 'the producers at the bottom of every chain' },
      { id: 'water-cycle', why: 'one of the matter cycles running through the ecosystem' },
      { id: 'genetics', why: 'variation is what natural selection acts on' }
    ]
  },

  'chemical-change': {
    formulas: [
      { f: 'mass of reactants = mass of products', what: 'conservation of mass. If a reaction looks lighter afterwards, a gas escaped.' },
      { f: 'acid + base → salt + water', what: 'neutralisation. With a metal you also get hydrogen; with a carbonate you also get carbon dioxide.' },
      { f: 'pH 0 ──── 7 ──── 14', what: 'acid, neutral, base. Each step is a tenfold change in strength, so pH 3 is ten times as acidic as pH 4.' }
    ],
    mistakes: [
      { wrong: 'Burning destroys mass.', right: 'The gases float away. Seal the whole thing in a jar and the mass is identical.' },
      { wrong: 'Dissolving is a chemical change.', right: 'Salt in water is a physical change — evaporate the water and the salt comes straight back.' },
      { wrong: 'Bubbles always mean a chemical reaction.', right: 'Boiling makes bubbles too. The test is whether the gas is a new substance.' }
    ],
    deeper: [
      { t: 'Collision theory', b: 'Reactions happen when particles collide hard enough. Heat, concentration, surface area and catalysts all work by making collisions more frequent or more energetic.' },
      { t: 'Energy level diagrams', b: 'Exothermic reactions finish lower than they started and release the difference. Endothermic ones finish higher. The hump in between is the activation energy.' },
      { t: 'Reactions have signatures', b: 'A lit splint pops for hydrogen. Limewater turns milky for carbon dioxide. A glowing splint relights in oxygen. Those three come up constantly.' }
    ],
    links: [
      { id: 'atoms', why: 'a reaction is atoms swapping partners' },
      { id: 'states-of-matter', why: 'the physical half of the physical-or-chemical question' },
      { id: 'energy', why: 'exothermic and endothermic are energy transfers' }
    ]
  },

  'plate-tectonics': {
    formulas: [
      { f: 'plates move 2–10 cm a year', what: 'about the speed fingernails grow. Over a million years that is tens of kilometres.' },
      { f: 'each magnitude step is ×10 shaking', what: 'and roughly 32 times the energy. Magnitude 7 is not slightly worse than 6.' }
    ],
    mistakes: [
      { wrong: 'The plates float on liquid magma.', right: 'The mantle is solid rock. It flows, but over thousands of years — like extremely stiff tar, not a sea of lava.' },
      { wrong: 'Continents drift across the ocean floor.', right: 'The continent and the seafloor are parts of the same moving plate. Nothing ploughs through anything.' },
      { wrong: 'Volcanoes only happen at plate edges.', right: 'Mostly true, but hotspots like Hawaii sit in the middle of a plate, over a plume rising from deep down.' }
    ],
    deeper: [
      { t: 'The evidence, which is the real exam question', b: 'Coastlines that fit, matching fossils on both sides of an ocean, matching rock ages, mirrored magnetic stripes on the seafloor, and now GPS that measures the movement directly.' },
      { t: 'Seafloor spreading and magnetic stripes', b: 'New crust records Earth’s magnetic direction as it hardens. The field flips every so often, so the seafloor carries matching striped patterns on both sides of a ridge.' },
      { t: 'Why the Pacific has a Ring of Fire', b: 'Dense ocean plate is diving under lighter continental plate all the way around it, which gives deep trenches, volcanoes and the biggest earthquakes.' }
    ],
    links: [
      { id: 'waves', why: 'seismic waves are how we read the inside of the Earth' },
      { id: 'water-cycle', why: 'weathering and erosion undo what tectonics builds' },
      { id: 'energy', why: 'all of it is heat escaping from inside the planet' }
    ]
  },

  'body-systems': {
    formulas: [
      { f: 'breathing ≠ respiration', what: 'breathing moves air in and out. Respiration is the chemical reaction in every cell that releases the energy.' },
      { f: 'glucose + oxygen → CO₂ + water + energy', what: 'aerobic respiration. Without enough oxygen you get lactic acid instead, which is the burn in your legs.' }
    ],
    mistakes: [
      { wrong: 'Veins always carry deoxygenated blood.', right: 'The pulmonary vein carries oxygen-rich blood from the lungs to the heart. Vessels are named by direction, not by what they carry.' },
      { wrong: 'Breathing and respiration are the same word for the same thing.', right: 'They are different processes, and mixing them up is one of the most commonly lost marks in biology.' },
      { wrong: 'The heart sits on the left.', right: 'It is roughly central, tilted to the left. The left side is the one you feel because it pumps hardest.' }
    ],
    deeper: [
      { t: 'Double circulation', b: 'Blood goes through the heart twice per lap: once to the lungs at low pressure, once to the body at high pressure. Two circuits is what lets mammals stay so active.' },
      { t: 'Surface area, again', b: 'Alveoli, villi and capillaries all solve the same problem — get an enormous surface into a small space. Lungs hold roughly a tennis court of it.' },
      { t: 'Enzymes do the digesting', b: 'Amylase on starch, protease on protein, lipase on fat. Each works best at body temperature and its own pH, which is why the stomach is acidic and the small intestine is not.' }
    ],
    links: [
      { id: 'cells', why: 'every system is specialised cells doing one job well' },
      { id: 'energy', why: 'respiration is the energy transfer that powers all of it' },
      { id: 'photosynthesis', why: 'it supplies the oxygen and the glucose you run on' }
    ]
  },

  'genetics': {
    formulas: [
      { f: '46 chromosomes = 23 pairs', what: 'in a human body cell. Sex cells have 23 single ones, so a fertilised egg is back to 46.' },
      { f: 'Bb × Bb → 3 : 1', what: 'three showing the dominant trait to one recessive. Bb × bb gives 1 : 1, and bb × bb gives all recessive.' },
      { f: 'XX female, XY male', what: 'the father’s sex cell decides, because only he can pass on a Y.' }
    ],
    mistakes: [
      { wrong: 'Dominant means the trait is more common.', right: 'It only means it shows when present. Having six fingers is dominant and rare; blood group O is recessive and everywhere.' },
      { wrong: 'A Punnett square predicts what will happen.', right: 'It gives the probability for each birth. Four children do not have to come out 3 : 1, in the same way four coin flips need not be two heads.' },
      { wrong: 'You inherit more from one parent.', right: 'Exactly half your chromosomes come from each — though mitochondrial DNA comes only from your mother.' }
    ],
    deeper: [
      { t: 'Genotype, phenotype, allele', b: 'Allele is one version of a gene. Genotype is the pair you carry. Phenotype is what shows. Getting these three words right is half the marks in a genetics answer.' },
      { t: 'Inherited, or just environmental?', b: 'Eye colour is inherited. A scar is not. Height is both — genes set the range, food decides where in it you land.' },
      { t: 'Mutation to evolution', b: 'Mutations create variation, the environment favours some variants, and over many generations the population shifts. That is natural selection, and it needs nothing more than these two ideas.' }
    ],
    links: [
      { id: 'cells', why: 'the nucleus is where all of this is stored' },
      { id: 'ecosystems', why: 'variation is the raw material natural selection works on' },
      { id: 'body-systems', why: 'genes are the instructions for building every one of those organs' }
    ]
  },

  'waves': {
    formulas: [
      { f: 'v = f × λ', what: 'speed = frequency × wavelength. Speed in m/s, frequency in hertz, wavelength in metres.' },
      { f: 'light: 300,000,000 m/s · sound: about 340 m/s', what: 'in air. Sound is faster in water and faster again in solids, because the particles are closer together.' },
      { f: 'echo: distance = (v × t) ÷ 2', what: 'halved, because the sound went there and came back.' }
    ],
    mistakes: [
      { wrong: 'Waves carry matter along with them.', right: 'They carry energy. A duck on a wave bobs up and down and stays put.' },
      { wrong: 'A louder sound is a higher pitch.', right: 'Loudness is amplitude, pitch is frequency. Turning up the volume does not change the note.' },
      { wrong: 'Sound travels fastest in air.', right: 'It is slowest in gases. Closer particles pass the vibration on faster, so solids win.' }
    ],
    deeper: [
      { t: 'The electromagnetic spectrum in order', b: 'Radio, microwave, infrared, visible, ultraviolet, X-ray, gamma. Wavelength shrinks and energy rises as you go along, which is why the right-hand end is the dangerous one.' },
      { t: 'Why refraction bends light', b: 'One side of the wave enters the new material and slows before the other, so the whole wave swings round. Same reason a shopping trolley veers when one wheel hits gravel.' },
      { t: 'Using echoes to see', b: 'Bats, ships and ultrasound scanners all send a pulse and time its return. The same trick reads a baby, a shoal of fish or the seabed.' }
    ],
    links: [
      { id: 'plate-tectonics', why: 'seismic waves are how the inside of the Earth was mapped' },
      { id: 'energy', why: 'a wave is energy on the move' },
      { id: 'body-systems', why: 'ears and eyes are wave detectors' }
    ]
  },

  'respiration': {
    formulas: [
      { f: 'C\u2086H\u2081\u2082O\u2086 + 6O\u2082 \u2192 6CO\u2082 + 6H\u2082O', what: 'aerobic respiration: one glucose plus six oxygen gives six carbon dioxide plus six water, and releases energy. The energy is not written in the equation because it is released, not made.' },
      { f: 'glucose \u2192 lactic acid', what: 'anaerobic respiration in a muscle. Far less energy comes out, because the glucose is not broken all the way down.' },
      { f: 'glucose \u2192 ethanol + CO\u2082', what: 'anaerobic respiration in yeast, which is called fermentation. It is why bread rises.' }
    ],
    mistakes: [
      { wrong: 'Respiration is breathing.', right: 'Breathing moves air with muscles. Respiration is a chemical reaction inside every cell. Breathing supplies the oxygen that respiration needs, which is the only reason they are connected.' },
      { wrong: 'Plants photosynthesise and animals respire.', right: 'Plants do both, every second. In daylight photosynthesis runs faster, so the plant gives out oxygen overall, but it never stops respiring.' },
      { wrong: 'Respiration makes energy.', right: 'Energy cannot be made. It was already in the bonds of the glucose, put there by photosynthesis. Respiration releases it and transfers it to ATP.' }
    ],
    deeper: [
      { t: 'Where the energy actually comes from', b: 'Breaking bonds takes energy in; making bonds gives energy out. In respiration the bonds that form in carbon dioxide and water are stronger than the ones broken in glucose and oxygen, and the difference is what gets released. That is the whole accounting.' },
      { t: 'Why aerobic gives so much more', b: 'Anaerobic respiration releases roughly two ATP per glucose. Aerobic releases somewhere near thirty. Oxygen is what lets the glucose be broken all the way down to carbon dioxide, and almost all of the energy is in those last steps.' },
      { t: 'Measuring it', b: 'A respirometer measures how fast small living things use oxygen. Soda lime soaks up the carbon dioxide they produce, so the gas volume falls by exactly the oxygen used, and a drop of liquid in a tube moves to show it.' }
    ],
    links: [
      { id: 'photosynthesis', why: 'the same equation, run the other way' },
      { id: 'cells', why: 'mitochondria are where most of it happens' },
      { id: 'body-systems', why: 'lungs and blood exist to deliver the oxygen' }
    ]
  },

  'cell-division': {
    formulas: [
      { f: '2n \u2192 2n + 2n', what: 'mitosis: a cell with a full set, 2n, gives two cells each with a full set. In humans 2n is 46.' },
      { f: '2n \u2192 n + n + n + n', what: 'meiosis: one cell with a full set gives four cells with half a set, n. In humans n is 23.' },
      { f: 'n + n \u2192 2n', what: 'fertilisation: two half sets join to make a full set again, which is why meiosis has to halve first.' }
    ],
    mistakes: [
      { wrong: 'Meiosis makes two cells.', right: 'Meiosis divides twice but copies the DNA only once, so one cell gives four. Mitosis is the one that gives two.' },
      { wrong: 'The cell splits and then copies its DNA.', right: 'The copying happens first, during interphase. Splitting before copying would leave one of the two cells with no instructions at all.' },
      { wrong: 'Identical twins come from meiosis.', right: 'Identical twins come from one fertilised egg splitting by mitosis, which is why they are identical. Meiosis is what made the egg and the sperm, and it guarantees difference.' }
    ],
    deeper: [
      { t: 'The stages have names', b: 'Prophase, metaphase, anaphase, telophase. Chromosomes condense, line up on the middle, get pulled apart, then new nuclei form. Metaphase is the one you see in photographs, because that is when the chromosomes are lined up and easiest to count.' },
      { t: 'Crossing over', b: 'In the first division of meiosis, chromosome pairs lie alongside each other and swap matching pieces. A chromosome you pass on is therefore a mixture of the one from your mother and the one from your father, not a copy of either.' },
      { t: 'Stem cells', b: 'A stem cell divides by mitosis but its daughters can become any of several cell types. That is what makes them useful medically and what makes them different from an ordinary dividing cell, which can only produce more of itself.' }
    ],
    links: [
      { id: 'genetics', why: 'meiosis is where the shuffling in inheritance happens' },
      { id: 'cells', why: 'the chromosomes being shared out live in the nucleus' },
      { id: 'evolution', why: 'variation from meiosis is what selection acts on' }
    ]
  },

  'enzymes': {
    formulas: [
      { f: 'enzyme + substrate \u2192 enzyme-substrate complex \u2192 enzyme + products', what: 'the enzyme appears on both sides, which is the whole point: it is not used up, so it goes round again.' },
      { f: 'rate = amount of product \u00f7 time', what: 'how an enzyme experiment is measured. Gas collected per minute, or the time taken for a colour to change.' }
    ],
    mistakes: [
      { wrong: 'Enzymes are killed by heat.', right: 'An enzyme was never alive. Heat denatures it: the folds shake apart and the active site loses its shape. Say denatured, not killed.' },
      { wrong: 'A denatured enzyme recovers when it cools.', right: 'The change is permanent. This is why a boiled egg never goes runny again and why biological washing powder must be used on a cool wash.' },
      { wrong: 'More enzyme always means a faster reaction.', right: 'Only until the substrate runs short. Once every substrate molecule is already being worked on, adding more enzyme changes nothing, and the graph flattens.' }
    ],
    deeper: [
      { t: 'Induced fit', b: 'Lock and key is the picture taught first, and it is slightly wrong. The active site is flexible and changes shape a little as the substrate arrives, closing around it. This explains why some enzymes accept a small family of similar molecules rather than exactly one.' },
      { t: 'What the enzyme is really doing', b: 'Every reaction needs a push to get started, called the activation energy. An enzyme does not supply energy; it holds the molecules in the right position so that much less of a push is needed. The reaction would happen anyway, just far too slowly to be any use.' },
      { t: 'Reading the temperature graph', b: 'The rising part and the falling part have different causes. Going up, warmth makes molecules collide more often. Coming down, the enzyme is being destroyed. That is why the curve is not symmetrical and why the fall is so much steeper than the rise.' }
    ],
    links: [
      { id: 'body-systems', why: 'digestion is enzymes doing their job' },
      { id: 'acids-bases', why: 'each enzyme has a pH it works best at' },
      { id: 'chemical-change', why: 'an enzyme is a catalyst, which is a chemistry idea' }
    ]
  },

  'classification': {
    formulas: [
      { f: 'Genus species', what: 'the binomial name. Genus takes a capital letter, species does not, and both are written in italics or underlined. Homo sapiens, Panthera leo.' },
      { f: 'kingdom \u2192 phylum \u2192 class \u2192 order \u2192 family \u2192 genus \u2192 species', what: 'the levels, widest to narrowest. Each step holds fewer things that are more alike.' }
    ],
    mistakes: [
      { wrong: 'A whale is a fish because it lives in the sea and is shaped like one.', right: 'A whale breathes air, is warm-blooded and feeds its young on milk, so it is a mammal. Classification follows ancestry, not appearance.' },
      { wrong: 'Mushrooms are plants.', right: 'Fungi are their own kingdom. They have no chlorophyll and make no food of their own, feeding instead on material that is already there.' },
      { wrong: 'A species is just a kind of animal.', right: 'A species is defined by breeding: members can produce young that are themselves fertile. A mule is not fertile, so horses and donkeys remain two species.' }
    ],
    deeper: [
      { t: 'Three domains above the kingdoms', b: 'Comparing genetic material showed that the organisms once lumped together as simple single cells are actually two groups as different from each other as either is from us. A level above kingdom was added: Bacteria, Archaea and Eukarya.' },
      { t: 'Convergent evolution', b: 'A dolphin, a shark and an extinct ichthyosaur all share a streamlined body with fins, because the sea sets the same problem to anything that swims fast. Similar solutions from unrelated ancestors is called convergence, and it is exactly the trap that classification by appearance falls into.' },
      { t: 'Why species counts keep changing', b: 'When DNA shows that what was called one species is really three that never interbreed, the count rises without anything new being found. Much of the growth in named species is this kind of splitting, not discovery.' }
    ],
    links: [
      { id: 'evolution', why: 'the groups are a family tree, so they follow descent' },
      { id: 'ecosystems', why: 'you cannot count biodiversity without naming things first' },
      { id: 'microbes-disease', why: 'bacteria, fungi and viruses sit in very different places' }
    ]
  },

  'plant-transport': {
    formulas: [
      { f: 'rate of transpiration = distance moved \u00f7 time', what: 'how a potometer measures it. A bubble travels along a tube as the plant draws water up, and you time how far it goes.' },
      { f: 'water potential: high \u2192 low', what: 'water always moves from where there is more of it to where there is less. That one rule drives entry at the root and loss at the leaf.' }
    ],
    mistakes: [
      { wrong: 'The roots pump water up the plant.', right: 'There is no pump. Evaporation from the leaves pulls the column up, and water sticks to itself well enough to be pulled as one thread. Root pressure exists but is far too weak to reach the top of a tree.' },
      { wrong: 'Xylem and phloem both carry water up.', right: 'Xylem carries water and minerals upwards only. Phloem carries dissolved sugar, and it goes wherever the sugar is needed, which is often downwards.' },
      { wrong: 'Transpiration is a waste of water the plant would avoid if it could.', right: 'It is the unavoidable cost of opening stomata to let carbon dioxide in, and the plant uses the pull to lift water and minerals. A plant that sealed itself would not starve of water, it would starve of carbon dioxide.' }
    ],
    deeper: [
      { t: 'Why the column does not snap', b: 'Water molecules attract each other strongly, which is called cohesion, and they also cling to the xylem walls, which is adhesion. Together these hold a thread of water under tension across a hundred metres. Let an air bubble in and the thread breaks, which is why cut flowers are trimmed under water.' },
      { t: 'The compromise a plant cannot escape', b: 'Open stomata means carbon dioxide in and water out. Shut means neither. A plant in a drought shuts them and accepts that photosynthesis stops, because dying of thirst is faster than dying of hunger. Desert plants open theirs at night instead.' },
      { t: 'Measuring with a potometer', b: 'A leafy shoot is sealed into a tube of water with an air bubble in it. As the shoot transpires it draws water up and the bubble moves. Change one condition at a time, wind or humidity or light, and time the bubble over the same distance.' }
    ],
    links: [
      { id: 'photosynthesis', why: 'stomata open for carbon dioxide, and water leaves through them' },
      { id: 'cells', why: 'turgid cells are what hold a plant up' },
      { id: 'water-cycle', why: 'transpiration is one of the ways water gets back into the air' }
    ]
  },

  'nervous-system': {
    formulas: [
      { f: 'stimulus \u2192 receptor \u2192 sensory neurone \u2192 relay \u2192 motor neurone \u2192 effector \u2192 response', what: 'the full path. A reflex uses exactly this, with the relay neurone in the spinal cord and no detour to the brain.' },
      { f: 'speed = distance \u00f7 time', what: 'how nerve conduction speed is measured, and why a myelinated fibre at 100 m/s beats an unmyelinated one at about 1 m/s.' }
    ],
    mistakes: [
      { wrong: 'Nerve cells touch each other.', right: 'They do not. There is a gap at every junction, and a chemical has to carry the signal across it. That gap is the synapse.' },
      { wrong: 'A reflex is just a very fast decision.', right: 'There is no decision. The signal never reaches the conscious part of the brain before the muscle has acted, which is why you cannot choose to stop blinking when something comes at your eye.' },
      { wrong: 'The signal travels along a nerve as electricity, like a wire.', right: 'It is electrical, but it is not a current flowing. It is a wave of charge moving across the membrane, regenerated the whole way along, which is why it does not fade over a metre.' }
    ],
    deeper: [
      { t: 'Why the gap is there at all', b: 'A gap looks like a design fault until you notice what it allows. Signals can only cross one way, many cells can feed into one, and the strength of the connection can be turned up or down. Learning is largely changes at synapses.' },
      { t: 'Saltatory conduction', b: 'Myelin insulates the fibre except at regular gaps. The signal regenerates only at those gaps and effectively jumps between them, which is both much faster and much cheaper in energy than regenerating it continuously.' },
      { t: 'Two systems, one body', b: 'Nerves and hormones both carry messages. Nerves are electrical, fast, aimed at one target and short-lived. Hormones are chemical, slow, carried everywhere in the blood and long-lasting. Pulling your hand from a flame is nerves; puberty is hormones.' }
    ],
    links: [
      { id: 'body-systems', why: 'the nervous system is one of the systems that run you' },
      { id: 'light-optics', why: 'the eye is the receptor that feeds it' },
      { id: 'waves', why: 'the ear turns a sound wave into a nerve signal' }
    ]
  }
,

  'simple-machines': {
    formulas: [
      { f: 'mechanical advantage = load \u00f7 effort', what: 'how many times the machine multiplies your force. Lift 300 N with 60 N of effort and the advantage is 5. It has no units \u2014 it is one force divided by another.' },
      { f: 'work = force \u00d7 distance', what: 'work in joules, force in newtons, distance in metres moved along the direction of the force. A machine cannot change the work, only how it is split.' },
      { f: 'efficiency = useful work out \u00f7 work in \u00d7 100%', what: 'always under 100%, because friction turns some of the input into heat.' }
    ],
    mistakes: [
      { wrong: 'A machine gives you extra energy.', right: 'It gives you extra force, and charges you distance for it. Work in equals work out, minus whatever friction takes.' },
      { wrong: 'A pulley always reduces the force you need.', right: 'A single fixed pulley only changes the direction. You need a moving pulley, or several, before the force drops.' },
      { wrong: 'A screw is not a simple machine.', right: 'It is an inclined plane wrapped round a cylinder. Each turn moves it forward by the distance between threads.' }
    ],
    deeper: [
      { t: 'The three classes of lever', b: 'First class has the fulcrum in the middle, like a seesaw. Second class has the load in the middle, like a wheelbarrow. Third class has the effort in the middle, like tweezers or your own forearm \u2014 which loses force but gains speed and range.' },
      { t: 'Why your arm is a bad lever on purpose', b: 'Your bicep attaches very close to your elbow, so it pulls with a mechanical advantage well below one. You pay several times the force you lift. What you buy is speed: a small muscle movement swings your hand a long way, fast.' },
      { t: 'Gears as levers that keep going', b: 'A gear ratio is mechanical advantage that does not run out at the end of a stroke. Twelve teeth driving thirty-six gives three times the turning force at a third of the speed, which is exactly the trade a lever makes.' }
    ],
    links: [
      { id: 'forces-motion', why: 'a machine is a way of rearranging forces' },
      { id: 'energy', why: 'efficiency is an energy question' },
      { id: 'body-systems', why: 'your bones and muscles are levers' }
    ]
  },

  'sound': {
    formulas: [
      { f: 'speed = distance \u00f7 time', what: 'speed in metres per second, distance in metres, time in seconds. Count the seconds between lightning and thunder and multiply by 330 to get the distance in metres.' },
      { f: 'v = f \u00d7 \u03bb', what: 'speed equals frequency times wavelength. Frequency in hertz, wavelength in metres. In the same material the speed is fixed, so a higher frequency must mean a shorter wave.' }
    ],
    mistakes: [
      { wrong: 'Loud and high mean the same thing.', right: 'Loudness is amplitude, how big the vibration is. Pitch is frequency, how often it vibrates. A deep note can be deafening and a high note can be a whisper.' },
      { wrong: 'Sound travels fastest through air because air is thin.', right: 'The opposite. Sound needs particles to pass the vibration on, and the closer they are packed the faster it goes. Steel beats water beats air.' },
      { wrong: 'You hear an echo because the sound gets louder.', right: 'An echo is the same sound arriving later, having bounced off something. If the surface is close enough you cannot tell the two apart.' }
    ],
    deeper: [
      { t: 'Compressions and rarefactions', b: 'A sound wave is not a wiggle, it is a squeeze. The source pushes particles together into a compression, then pulls back leaving a rarefaction. That alternating pressure travels outwards while each particle only jiggles on the spot \u2014 which is what makes it a longitudinal wave.' },
      { t: 'Why two instruments differ on the same note', b: 'A string never vibrates only at its main frequency; it also vibrates in halves, thirds and so on, adding quieter higher notes called harmonics. The mix is different for every instrument, and that mix is timbre.' },
      { t: 'How loud is too loud', b: 'The decibel scale is logarithmic: every 10 dB is ten times the energy. 85 dB over hours damages the hair cells in your inner ear, and those cells do not grow back. That is why the damage is permanent.' }
    ],
    links: [
      { id: 'waves', why: 'sound is one kind of wave' },
      { id: 'nervous-system', why: 'the ear turns a wave into a nerve signal' },
      { id: 'states-of-matter', why: 'how closely packed the particles are decides the speed' }
    ]
  },

  'heat-transfer': {
    formulas: [
      { f: 'conduction \u00b7 convection \u00b7 radiation', what: 'the three routes. Conduction through touching particles, convection by a moving fluid carrying its heat with it, radiation as infrared waves needing nothing at all.' },
      { f: 'energy = mass \u00d7 heat capacity \u00d7 temperature change', what: 'why a bath holds more energy than a spark while being far cooler. Heat capacity is how much energy one kilogram needs to warm by one degree, and water\'s is unusually high.' }
    ],
    mistakes: [
      { wrong: 'Cold travels into warm things.', right: 'There is no such thing as cold moving. Heat flows from hotter to colder, and the cold object is simply what is left when energy leaves.' },
      { wrong: 'Metal is colder than wood in the same room.', right: 'They are the same temperature. Metal conducts heat out of your hand far faster, and the sensation you call cold is that heat leaving you.' },
      { wrong: 'A vacuum flask stops all heat loss.', right: 'The vacuum stops conduction and convection, which both need particles. Radiation crosses a vacuum perfectly well, which is why the inside is silvered to reflect it.' }
    ],
    deeper: [
      { t: 'Why convection currents loop', b: 'Warming a fluid makes it expand, so the same mass takes more space and the density drops. Less dense fluid floats upwards, cooler fluid sinks to take its place, and the loop keeps going as long as the heat does. It is buoyancy, driven by temperature.' },
      { t: 'Emitters and absorbers are the same surfaces', b: 'A matt black surface is the best absorber of radiation and also the best emitter. A shiny silver one is poor at both. That is why a radiator is painted and a vacuum flask is mirrored \u2014 the same physics, used two opposite ways.' },
      { t: 'Why coastal places have milder weather', b: 'Water\'s heat capacity is about four times that of soil, so the sea warms and cools far more slowly than land. Living next to that much thermal inertia smooths out the extremes in both directions.' }
    ],
    links: [
      { id: 'energy', why: 'heat is energy on the move' },
      { id: 'states-of-matter', why: 'conduction depends on how particles are arranged' },
      { id: 'weather-climate', why: 'convection drives wind and cloud' }
    ]
  },

  'density-buoyancy': {
    formulas: [
      { f: '\u03c1 = m \u00f7 V', what: 'density equals mass divided by volume. Mass in grams, volume in cubic centimetres, density in g/cm\u00b3. Water is 1 g/cm\u00b3, which is the number everything floats or sinks against.' },
      { f: 'upthrust = weight of fluid displaced', what: 'Archimedes\' principle. Push aside two newtons of water and the water pushes back with two newtons, whatever the object is made of.' }
    ],
    mistakes: [
      { wrong: 'Heavy things sink and light things float.', right: 'A log is heavier than a coin and floats. What matters is density \u2014 mass compared with the space it takes \u2014 not mass on its own.' },
      { wrong: 'A steel ship floats because it is hollow.', right: 'Nearly right, but say why: the hull plus the air it encloses has an average density below water. Fill it and that average rises above 1, which is what sinking a ship means.' },
      { wrong: 'Things weigh less in water because water pushes down less.', right: 'Water pushes up. Upthrust acts against weight, so the reading on a scale falls while the actual weight is unchanged.' }
    ],
    deeper: [
      { t: 'Floating is a balance, not a property', b: 'An object floats at the depth where the weight of water it pushes aside exactly equals its own weight. That is why a loaded ship sits lower: more weight needs more displaced water, so it sinks until it finds the new balance.' },
      { t: 'Why ice floating matters', b: 'Almost every substance is denser as a solid. Water is not: it expands by about nine per cent as it freezes, so ice floats. If it did not, lakes would freeze from the bottom up and very little could survive a winter in them.' },
      { t: 'Measuring an awkward shape', b: 'You cannot measure a stone with a ruler, so you use displacement: lower it into a full measuring cylinder and read how much the water rises. That rise is the volume, exactly. Weigh it, divide, and you have the density of something with no straight edges at all.' }
    ],
    links: [
      { id: 'states-of-matter', why: 'density is about how tightly particles are packed' },
      { id: 'forces-motion', why: 'upthrust and weight are forces in balance' },
      { id: 'plate-tectonics', why: 'continents float on the mantle for the same reason' }
    ]
  },

  'solutions': {
    formulas: [
      { f: 'solute + solvent = solution', what: 'the solute dissolves, the solvent does the dissolving, and the result is the solution. In salty water the salt is the solute and the water is the solvent.' },
      { f: 'concentration = mass of solute \u00f7 volume of solution', what: 'usually grams per cubic decimetre. Doubling the solute or halving the water both double the concentration.' },
      { f: 'mass of solution = mass of solute + mass of solvent', what: 'dissolving conserves mass. 50 g of water plus 5 g of sugar weighs 55 g, even though the sugar has vanished from sight.' }
    ],
    mistakes: [
      { wrong: 'Dissolved sugar has disappeared.', right: 'It has spread out between the water particles, too small to see. Weigh the glass before and after and the mass is identical.' },
      { wrong: 'Dissolving and melting are the same.', right: 'Melting needs only heat and one substance. Dissolving needs a second substance to dissolve into, and can happen stone cold.' },
      { wrong: 'You can filter salt out of salty water.', right: 'Dissolved particles pass straight through filter paper. You need evaporation to keep the salt, or distillation to keep the water.' }
    ],
    deeper: [
      { t: 'What saturated really means', b: 'At a given temperature a fixed amount of solvent can only hold so much solute. Once it is holding that much it is saturated, and anything more sits at the bottom. Warm it and the limit rises; cool it again and the excess comes back out as crystals.' },
      { t: 'Growing a crystal properly', b: 'Make a saturated solution while hot, filter it, then let it cool slowly undisturbed. Slow cooling gives a few large crystals, fast cooling gives many small ones. Hanging a seed crystal on a thread gives the solid somewhere to build on.' },
      { t: 'Distillation, and why the order matters', b: 'Heat salty water and the water boils off at 100 \u00b0C while the salt, which boils far higher, stays behind. Cool the vapour and you have pure water. It separates by boiling point, which is why it also works on mixtures of two liquids.' }
    ],
    links: [
      { id: 'mixtures', why: 'a solution is one kind of mixture' },
      { id: 'states-of-matter', why: 'dissolving is about particles moving between each other' },
      { id: 'chemical-change', why: 'dissolving is a physical change, not a chemical one' }
    ]
  },

  'materials-properties': {
    formulas: [
      { f: 'density = mass \u00f7 volume', what: 'one of the properties you measure when choosing a material. Light and strong is the combination aircraft are built on.' },
      { f: 'fair test: change one, measure one, keep the rest the same', what: 'the rule that turns an opinion about a material into evidence.' }
    ],
    mistakes: [
      { wrong: 'Transparent and translucent mean the same thing.', right: 'Transparent lets you see through clearly. Translucent lets light through but scatters it, so you see a glow and no detail \u2014 bathroom glass, or greaseproof paper.' },
      { wrong: 'All metals are magnetic.', right: 'Only iron, nickel, cobalt and alloys containing them. Aluminium, copper and gold are metals and not magnetic at all, which is how coin machines sort them.' },
      { wrong: 'Strong and hard are the same property.', right: 'Hard means difficult to scratch or dent. Strong means it takes a lot of force to break. Glass is hard and weak; rope is soft and strong.' }
    ],
    deeper: [
      { t: 'Why alloys beat pure metals', b: 'Pure metal atoms sit in neat layers that slide over each other easily, which is why pure iron is soft. Mixing in atoms of a different size disrupts the layers so they cannot slide, and the result is harder. Steel is iron with under two per cent carbon, and it changes everything.' },
      { t: 'Composites: picking two weaknesses that cancel', b: 'Concrete is strong when squeezed and weak when pulled. Steel is the reverse and is expensive. Reinforced concrete puts thin steel rods where the pulling happens and cheap concrete everywhere else, so each material only does what it is good at.' },
      { t: 'Choosing a material is always a trade-off', b: 'There is no best material, only the best one for a job and a budget. A saucepan wants high conductivity in the base and low conductivity in the handle, so it is built from two different materials on purpose.' }
    ],
    links: [
      { id: 'states-of-matter', why: 'properties come from how particles are arranged' },
      { id: 'magnetism', why: 'magnetic is a property only a few materials have' },
      { id: 'scientific-method', why: 'comparing materials means running a fair test' }
    ]
  },

  'weather-climate': {
    formulas: [
      { f: 'weather = now \u00b7 climate = the average over about 30 years', what: 'the distinction every exam asks about. One cold summer says nothing about climate; thirty of them say a great deal.' },
      { f: 'air pressure, measured in millibars', what: 'low pressure means rising air, cloud and rain. High pressure means sinking air and clearer skies. A falling barometer is the classic sign of weather on its way.' }
    ],
    mistakes: [
      { wrong: 'A cold winter disproves climate change.', right: 'Weather is one roll of the dice; climate is the loading of the dice. Warming makes extremes of both kinds more likely, and is measured over decades, not days.' },
      { wrong: 'The greenhouse effect is a bad thing.', right: 'Without it Earth would average about \u221218 \u00b0C and be uninhabitable. The problem is the extra we have added, not the effect itself.' },
      { wrong: 'Wind blows from cold places to hot places.', right: 'Wind blows from high pressure to low pressure. Warm air rising leaves low pressure behind it, so the flow is towards the heat, but pressure is what actually drives it.' }
    ],
    deeper: [
      { t: 'Why clouds form at a particular height', b: 'Rising air expands as the pressure drops, and expanding cools it. At the height where it cools to its dew point the vapour condenses onto dust, and that is where the cloud base sits \u2014 which is why the flat bottoms of cumulus clouds line up.' },
      { t: 'Fronts, and why they bring a change', b: 'A front is the boundary where two air masses meet. Warm air riding over cold gives a long slow band of rain; cold air shoving under warm gives a short violent burst. The order of cloud types overhead tells you which is coming.' },
      { t: 'Climate zones and the angle of the Sun', b: 'The tropics are hot because sunlight arrives near vertical all year. The poles are cold because the same beam spreads over far more ground. Everything between is a blend, which is why climate zones run in bands.' }
    ],
    links: [
      { id: 'water-cycle', why: 'evaporation and condensation are the engine of weather' },
      { id: 'heat-transfer', why: 'convection is what makes wind and cloud' },
      { id: 'seasons', why: 'the tilt sets the pattern the weather happens inside' }
    ]
  },

  'rock-cycle': {
    formulas: [
      { f: 'igneous \u2192 sedimentary \u2192 metamorphic \u2192 melt \u2192 igneous', what: 'the cycle, though any step can jump to any other. Weathering, burial, heat and pressure, melting, cooling.' },
      { f: 'law of superposition', what: 'in undisturbed layers, the oldest is at the bottom. It sounds obvious and it is the foundation of reading geological time.' }
    ],
    mistakes: [
      { wrong: 'Rocks and minerals are the same thing.', right: 'A mineral is one pure substance with its own crystal structure. A rock is a mixture of minerals. Granite is a rock made of quartz, feldspar and mica.' },
      { wrong: 'All rocks contain fossils.', right: 'Only sedimentary rocks, and only sometimes. Igneous rock has been molten and metamorphic rock has been cooked and squashed \u2014 nothing recognisable survives either.' },
      { wrong: 'Big crystals mean the rock is old.', right: 'Big crystals mean it cooled slowly, deep underground. A fast-cooled lava flow of the same age and chemistry has crystals too small to see.' }
    ],
    deeper: [
      { t: 'Reading the cooling rate in the crystals', b: 'Crystal size records time. Magma trapped kilometres down takes thousands of years to cool and grows crystals you can see across a room. The same melt erupting onto the surface chills in days, giving basalt, or in seconds in water, giving volcanic glass with no crystals at all.' },
      { t: 'Metamorphic banding', b: 'Heat and pressure never melt the rock \u2014 that would make it igneous. They recrystallise the minerals in place, and pressure from one direction lines the new crystals up at right angles to the squeeze. Those stripes are a fossil record of the direction the force came from.' },
      { t: 'How long the cycle takes', b: 'A grain of sand in a beach today may have been part of a mountain a hundred million years ago and will be part of a sedimentary rock long after. The cycle has no beginning and no end, and the same atoms have been round it many times.' }
    ],
    links: [
      { id: 'plate-tectonics', why: 'plate movement supplies the heat and pressure' },
      { id: 'erosion-weathering', why: 'wearing rock down is one whole arm of the cycle' },
      { id: 'evolution', why: 'fossils in sedimentary layers are the record of life' }
    ]
  },

  'erosion-weathering': {
    formulas: [
      { f: 'weathering = breaking in place \u00b7 erosion = carrying away', what: 'the distinction most marks are lost on. Freeze-thaw cracking a rock is weathering; the river taking the pieces is erosion.' },
      { f: 'faster water carries bigger particles', what: 'roughly, doubling the speed lets a river carry particles many times heavier. Slow it down and it drops the biggest first.' }
    ],
    mistakes: [
      { wrong: 'Weathering and erosion are two words for the same thing.', right: 'Weathering breaks rock where it stands. Erosion is the transport. A cliff can weather for centuries with nothing eroded until the sea arrives.' },
      { wrong: 'Water erodes rock by dissolving all of it.', right: 'Mostly it is mechanical: the water throws sand and pebbles at the rock. Dissolving is a separate process and only works on certain rocks, chiefly limestone.' },
      { wrong: 'Ice splits rock because ice is heavy.', right: 'Water expands by about nine per cent as it freezes. Trapped in a crack it has nowhere to go, so it pushes the crack wider every single night it freezes.' }
    ],
    deeper: [
      { t: 'Why glaciers carve U-shapes and rivers carve V-shapes', b: 'A river cuts a narrow channel at its lowest point and the sides slump into a V. A glacier fills the whole valley and grinds the floor and both walls at once, leaving a U with a flat bottom. The cross-section alone tells you which did the work.' },
      { t: 'Attrition and why beach pebbles are round', b: 'Transport is not gentle. Particles knock against each other and against the bed constantly, chipping off corners. The further a pebble has travelled, the rounder and smaller it is \u2014 which is why you can estimate how far material has come.' },
      { t: 'Soil takes centuries and leaves in a season', b: 'A centimetre of topsoil can take a hundred years to form from weathered rock and dead plants, and a single storm can strip it from a bare field. That mismatch is why soil conservation \u2014 roots, hedges, terraces \u2014 matters so much.' }
    ],
    links: [
      { id: 'rock-cycle', why: 'erosion feeds the sedimentary half of the cycle' },
      { id: 'water-cycle', why: 'moving water does most of the work' },
      { id: 'plate-tectonics', why: 'mountains rise while erosion wears them down' }
    ]
  },

  'moon-phases': {
    formulas: [
      { f: 'lunar month \u2248 29.5 days', what: 'one full cycle of phases. The Moon\'s orbit takes 27.3 days, but Earth has moved round the Sun meanwhile, so it takes two extra days to line up again.' },
      { f: 'phase = how much of the lit half you can see', what: 'half the Moon is always sunlit. The phase is the fraction of that lit half pointing your way.' }
    ],
    mistakes: [
      { wrong: 'Phases are Earth\'s shadow on the Moon.', right: 'That is an eclipse, and it is rare. Phases are about which part of the permanently lit half you are looking at from here.' },
      { wrong: 'The Moon does not rotate, because we see one face.', right: 'It rotates exactly once per orbit, which is why the same side faces us. That is tidal locking, and a Moon that did not rotate would show us every side.' },
      { wrong: 'There is a dark side of the Moon.', right: 'There is a far side, which gets just as much sunlight. At new moon, the far side is the one in full daylight.' }
    ],
    deeper: [
      { t: 'Why eclipses are rare', b: 'The Moon\'s orbit is tilted about five degrees to Earth\'s orbit round the Sun. Most months the shadow passes above or below, and only when the crossing points line up with new or full moon do you get an eclipse.' },
      { t: 'Two tides a day, not one', b: 'The Moon pulls the near ocean towards it, making one bulge. It also pulls the solid Earth away from the far ocean, leaving a second bulge on the opposite side. Earth rotates through both in a day, which is why high tide comes roughly twice.' },
      { t: 'Where the Moon came from', b: 'Moon rock is chemically very like Earth\'s mantle and short of iron and water. The best explanation is a collision early in Earth\'s history with a Mars-sized body, throwing out debris that gathered into the Moon.' }
    ],
    links: [
      { id: 'solar-system', why: 'the Moon is one body in a system of orbits' },
      { id: 'seasons', why: 'both come down to geometry and tilt' },
      { id: 'light-optics', why: 'moonlight is reflected sunlight' }
    ]
  },

  'seasons': {
    formulas: [
      { f: 'axial tilt = 23.5\u00b0', what: 'the angle between Earth\'s spin axis and the line square to its orbit. It stays pointing the same way all year, which is the whole reason seasons exist.' },
      { f: 'energy per square metre falls as the angle falls', what: 'the same beam of sunlight spread over a larger patch of ground delivers less to each part of it.' }
    ],
    mistakes: [
      { wrong: 'Summer happens when Earth is closer to the Sun.', right: 'Earth is actually closest in early January, during the northern winter. The distance barely changes; the tilt is what matters.' },
      { wrong: 'It is summer everywhere at once.', right: 'The hemispheres are always opposite. July is midsummer in Europe and midwinter in Australia, from the same tilt.' },
      { wrong: 'The tilt changes through the year to make seasons.', right: 'The tilt is fixed. What changes is where Earth is in its orbit, so the same fixed tilt leans towards the Sun in one half of the year and away in the other.' }
    ],
    deeper: [
      { t: 'Two effects, not one', b: 'A hemisphere tilted sunward gets sunlight at a steeper angle, so it is concentrated, and it also gets more hours of it. Both push the same way, which is why the difference between summer and winter is so large.' },
      { t: 'Seasonal lag', b: 'The longest day is in June but the hottest weeks are in July and August. Ground and sea keep gaining energy for as long as more arrives each day than leaves, so the peak temperature trails the peak sunlight by weeks.' },
      { t: 'Midnight sun and polar night', b: 'Inside the Arctic and Antarctic circles the tilt is enough that the Sun never sets in midsummer and never rises in midwinter. The further towards the pole, the longer each lasts \u2014 months at a time at the pole itself.' }
    ],
    links: [
      { id: 'solar-system', why: 'seasons come out of Earth\'s orbit and tilt' },
      { id: 'weather-climate', why: 'the seasons set the pattern weather happens inside' },
      { id: 'photosynthesis', why: 'day length drives when plants grow' }
    ]
  },

  'stars-galaxies': {
    formulas: [
      { f: '1 light year \u2248 9.5 trillion km', what: 'a distance, not a time: how far light travels in a year. Looking at a star 100 light years away is looking 100 years into the past.' },
      { f: 'hydrogen \u2192 helium + energy', what: 'nuclear fusion in a star\'s core. Four hydrogen nuclei become one helium nucleus, and the small amount of mass left over becomes the energy that makes it shine.' }
    ],
    mistakes: [
      { wrong: 'A light year is a long time.', right: 'It is a distance. The confusion is understandable and it costs marks every year.' },
      { wrong: 'Red stars are the hottest, because red means hot.', right: 'The opposite. Blue-white stars are hottest, red ones coolest \u2014 the same order as a gas flame, where the blue part is the hot part.' },
      { wrong: 'The stars in a constellation are near each other.', right: 'They only look close from here. They can be wildly different distances away and have nothing to do with one another.' }
    ],
    deeper: [
      { t: 'Where the elements came from', b: 'Fusion in ordinary stars builds elements up to iron. Everything heavier \u2014 gold, uranium \u2014 needs the extreme conditions of a supernova or colliding neutron stars. The calcium in your bones was made inside a star that died before the Sun existed.' },
      { t: 'What a galaxy actually is', b: 'A hundred billion or so stars held together by gravity, with gas, dust and dark matter, orbiting a common centre. Ours is a barred spiral about 100,000 light years across, and the Sun takes roughly 230 million years to go round once.' },
      { t: 'Evidence for the Big Bang', b: 'Distant galaxies are moving away, and the further off they are the faster they go, which points back to everything having been together. The clincher is the cosmic microwave background: a faint glow from every direction, the cooled-down heat of the early universe.' }
    ],
    links: [
      { id: 'solar-system', why: 'our star and its planets sit inside a galaxy' },
      { id: 'atoms', why: 'stars are where most elements were built' },
      { id: 'light-optics', why: 'everything we know about stars arrives as light' }
    ]
  },

  'life-cycles': {
    formulas: [
      { f: 'egg \u2192 larva \u2192 pupa \u2192 adult', what: 'complete metamorphosis, as in butterflies, beetles and flies. The young looks nothing like the adult and usually eats something different.' },
      { f: 'egg \u2192 nymph \u2192 adult', what: 'incomplete metamorphosis, as in grasshoppers and dragonflies. The nymph is a small wingless version that moults its way to adulthood.' }
    ],
    mistakes: [
      { wrong: 'A caterpillar grows wings inside the chrysalis.', right: 'Far more than that. Most of the caterpillar is broken down and rebuilt. What emerges is assembled from the pieces, not simply a caterpillar with wings added.' },
      { wrong: 'Seeds need light to germinate.', right: 'Most need only water, warmth and oxygen \u2014 they start underground in the dark. Light matters afterwards, once the shoot is up and photosynthesis begins.' },
      { wrong: 'All insects go through a pupa stage.', right: 'Only those with complete metamorphosis. A grasshopper hatches as a miniature adult and simply gets bigger.' }
    ],
    deeper: [
      { t: 'Why metamorphosis is worth the cost', b: 'A caterpillar eats leaves and a butterfly drinks nectar, so parent and offspring never compete for food. Splitting the life cycle into a growing stage and a breeding stage lets each be specialised for one job, and the pupa is the price of the rebuild.' },
      { t: 'Many young or few', b: 'A frog lays thousands of eggs and abandons them; an albatross raises one chick for months. Both work. The first bets on numbers, the second on care, and which wins depends on how dangerous the early stages are.' },
      { t: 'Dormancy as a way of waiting', b: 'A seed can pause for years until conditions are right, and some need frost or fire before they will start at all. That is not failure to germinate \u2014 it is a timer, set so the seedling appears in the season it can survive.' }
    ],
    links: [
      { id: 'cell-division', why: 'growth and rebuilding are mitosis' },
      { id: 'adaptations', why: 'a life cycle is itself an adaptation' },
      { id: 'photosynthesis', why: 'a seedling has to start feeding itself' }
    ]
  },

  'digestion': {
    formulas: [
      { f: 'big insoluble molecules \u2192 small soluble ones', what: 'the whole point of digestion. Starch to sugars, protein to amino acids, fat to fatty acids and glycerol \u2014 small enough to cross into the blood.' },
      { f: 'surface area \u00d7 time = how much you absorb', what: 'why the small intestine is metres long and lined with millions of villi, each covered in microvilli.' }
    ],
    mistakes: [
      { wrong: 'Food is absorbed in the stomach.', right: 'Almost nothing is. The stomach is a mixer and an acid bath; nearly all absorption happens further along, in the small intestine.' },
      { wrong: 'Bile digests fat.', right: 'Bile is not an enzyme and breaks nothing down. It emulsifies fat into tiny droplets, giving lipase far more surface to work on. It also neutralises stomach acid.' },
      { wrong: 'Fibre is useless because you cannot digest it.', right: 'That is exactly what makes it useful. It gives the gut muscles something to grip, so peristalsis keeps everything moving.' }
    ],
    deeper: [
      { t: 'Peristalsis, not gravity', b: 'Food does not fall down your oesophagus. Rings of muscle contract behind it in a travelling wave and squeeze it along, which is why you can swallow upside down and why astronauts can eat in orbit.' },
      { t: 'The acid problem', b: 'Stomach acid sits around pH 2, strong enough to denature protein and kill most swallowed microbes. The stomach survives it by producing a thick mucus layer and replacing its lining cells every few days.' },
      { t: 'Deficiency diseases', b: 'Some nutrients the body cannot make at all. Without vitamin C you cannot build collagen properly and get scurvy; without enough iron you cannot carry oxygen and get anaemia. A balanced diet is not a slogan, it is a list of things that have to come in from outside.' }
    ],
    links: [
      { id: 'enzymes', why: 'digestion is enzymes doing their job' },
      { id: 'body-systems', why: 'the gut is one system handing off to the blood' },
      { id: 'respiration', why: 'the glucose absorbed is what respiration burns' }
    ]
  },

  'adaptations': {
    formulas: [
      { f: 'variation \u2192 selection \u2192 inheritance \u2192 change', what: 'the four steps. Individuals differ, some survive better, survivors pass their features on, and the population shifts over generations.' },
      { f: 'surface area to volume ratio', what: 'why Arctic animals are rounder with short ears and desert animals are lean with large ones. Less surface for your volume means less heat lost.' }
    ],
    mistakes: [
      { wrong: 'Animals adapt during their lifetime because they need to.', right: 'An individual does not adapt. The population changes, because individuals that already happened to suit the conditions left more offspring.' },
      { wrong: 'Natural selection makes things perfect.', right: 'It makes them good enough to out-reproduce the alternatives available. Plenty of adaptations are clumsy compromises carried over from ancestors.' },
      { wrong: 'A cactus has spines to stop animals eating it.', right: 'That helps, but the main reason is water. Spines are leaves with almost no surface area, so almost nothing evaporates.' }
    ],
    deeper: [
      { t: 'Structural, behavioural, functional', b: 'Three kinds. Structural is the body \u2014 blubber, beak shape. Behavioural is what it does \u2014 migrating, hibernating. Functional is the chemistry inside \u2014 producing antifreeze proteins, or concentrating urine to save water.' },
      { t: 'Convergent evolution', b: 'Dolphins, sharks and the extinct ichthyosaurs all arrived at the same streamlined body with fins, from three unrelated ancestors. The environment sets the problem, and there are only so many good answers.' },
      { t: 'Specialist or generalist', b: 'A specialist is superb at one narrow way of living and helpless when it changes; a generalist is mediocre at many and survives almost anything. Pandas and rats are the textbook pair, and it explains which species are most at risk when habitats shift.' }
    ],
    links: [
      { id: 'evolution', why: 'adaptations are what natural selection produces' },
      { id: 'ecosystems', why: 'an adaptation is a fit to a particular place' },
      { id: 'genetics', why: 'variation has to be heritable to count' }
    ]
  },

  'scientific-method': {
    formulas: [
      { f: 'independent \u00b7 dependent \u00b7 control', what: 'the one you change, the one you measure, and all the ones you hold still. Name all three before you start and the experiment designs itself.' },
      { f: 'mean = total \u00f7 number of readings', what: 'why you repeat. One reading can be a fluke; an average of five is evidence, and the spread tells you how much to trust it.' }
    ],
    mistakes: [
      { wrong: 'A hypothesis is a guess.', right: 'It is a prediction you could prove wrong. "Plants grow better in light" can be tested; "plants like light" cannot.' },
      { wrong: 'Throw away results that do not fit.', right: 'Investigate them. An anomaly is sometimes a mistake and sometimes the discovery. Deleting it quietly is the one thing that is not science.' },
      { wrong: 'If the results disprove your hypothesis, the experiment failed.', right: 'A disproved hypothesis is a real result and often more useful than a confirmed one. The experiment only fails if it was not a fair test.' }
    ],
    deeper: [
      { t: 'Accuracy and precision are different', b: 'Accurate means close to the true value. Precise means your repeats agree with each other. A badly zeroed scale gives precise readings that are all wrong by the same amount \u2014 which is why you check an instrument against something known.' },
      { t: 'Why a control group exists', b: 'Without something to compare against you cannot tell your effect from what would have happened anyway. Giving half the plants fertiliser and half none is what lets you say the fertiliser did it, rather than the weather.' },
      { t: 'Peer review, and why it is not optional', b: 'Before a result is accepted, other scientists check the method and try to repeat it. Most mistakes are honest, and a single unrepeated result is a lead rather than a fact. Science is set up on the assumption that everyone, including you, can be wrong.' }
    ],
    links: [
      { id: 'materials-properties', why: 'comparing materials is a fair test' },
      { id: 'enzymes', why: 'enzyme experiments are built on controlled variables' },
      { id: 'evolution', why: 'a theory is what survives repeated testing' }
    ]
  }

};
