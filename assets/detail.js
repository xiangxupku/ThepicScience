/* detail.js — the deeper layer for each topic.
   The 12 scenes teach the idea. This is what a test actually asks on top of it: the
   formulas with every symbol spelled out, the mistakes people really lose marks on, a few
   things that go past the basics, and how the topic joins up with the others.

   formulas: { f, what }            the equation, then it said in words
   mistakes: { wrong, right }       what people believe, and what is actually true
   deeper:   { t, b }               a step beyond the twelve scenes
   links:    { id, why }            another topic in the library, and the connection */

window.DETAIL = {

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
  }
};
