# ThepicScience

Take a picture of your teacher's whiteboard and get it back as a picture book, a narrated
video, a science project you can actually do, or a report outline to write from — pitched at
your grade, with a quiz built from that exact photo. Free, no account.

Built as one static web page: HTML, CSS and plain JavaScript. Nothing is uploaded anywhere —
the photo, the text reading and the narration all happen inside the browser.

## What it does

1. **📸 Take a picture.** Camera, file picker, drag and drop, or paste. Give it a video and it
   grabs a frame about a second in.
   The library covers **21 topics**, chosen to line up with what US, Canadian and UK schools
   actually teach. Each one carries a `taught` line naming the unit as your own curriculum
   usually calls it — "Optics (Ontario Gr 10)", "Waves (GCSE Physics)", "NGSS MS-PS4". That is
   the common unit name, not an official specification mapping.
2. **🤖 Read what you are learning.** The text on the board is read on your own device, matched
   to a topic, and the science words it recognised are listed for you. Photos get a light
   denoise first, which is worth a lot on a real phone shot — on a deliberately bad board
   photo it took the reader from 12 of 23 words to 23 of 23. A video is sampled at three
   points and all three frames are read. Those words steer the
   lesson: a page about stomata gets promoted into a four-page book if your board said
   "stomata". Tap any word to drop it.
3. **🎓 Sign in as your grade.** No name, no password, no email — you tap your grade and it is
   remembered on that device. It sets the wording (grades 3–5 get a short retelling of every
   idea and a slower voice; 9–12 gets the full text and harder questions), the default
   length, and how far into a topic the lesson goes — grades 3–5 never get the most advanced
   quarter of a topic, because leaving it out is better than watering it down. It also lists
   which topics that grade usually covers, so you can start there instead of a photo.
4. **📚 Pick what you need.** A picture book (4, 8 or 12 pages), a video, a **science project**
   with materials, steps and a write-up plan, or a **report outline** with sections, facts,
   vocabulary and a word-count target for your grade. Pages that came from your own board are
   badged.

   Every lesson ends with a real-world example — "where you see this" — as its own slide near
   the end of the video, a box on the last page of the picture book, and a section in the
   report. A bathroom mirror for the water cycle, one dead bulb in a string of fairy lights
   for series circuits, counting the seconds after lightning for waves.

   The video has **a presenter who talks**: a head-and-shoulders tile in the corner whose mouth
   moves only while an utterance is actually running, with blinking, a gentle head rock, and an
   eyebrow lift on each spoken word. The frame never sits still — dust drifts upward behind the
   artwork, the drawing has a slow camera move, and the scene title arrives as a lower third.

   It is graded like footage rather than a web page: a vignette darkens the corners, a fine
   film grain moves over the whole frame, a slow light sweep crosses it every thirteen
   seconds, every drawing casts a soft shadow so it sits in the scene instead of on top of
   it, and scenes push in from alternating sides rather than always the same one. All of it
   is CSS over the same SVG — nothing extra is downloaded, and `prefers-reduced-motion`
   still stops the lot.

   The narration is **rewritten before it is spoken**. A speech engine reads "6CO₂ + 6H₂O →
   C₆H₁₂O₆ + 6O₂" as noise; it now says "six carbon dioxide plus six water gives glucose plus
   six oxygen". Units, symbols, superscripts and dashes all get the same treatment, the
   captions still show the proper notation, and the app ranks the voices on your device and
   picks the smoothest one instead of whatever the browser hands over first.

   It is a real player, not a slideshow: a title slide, an example slide and a recap
   slide, a slow camera
   drift over each drawing, and **every one of the 74 drawings animates** — the sun's rays
   turn, rain falls, current runs round the circuit, the heart beats, particles jiggle faster
   in a gas than a solid. Captions **highlight each word as the voice says it**, driven by the
   speech engine's own word events rather than a timer. There is a clickable scene strip,
   fullscreen, and keyboard shortcuts: space to play, arrows to skip a scene, `F` for
   fullscreen, `C` for captions. None of it animates in the picture book, the exports or the
   printed pages, and `prefers-reduced-motion` switches all of it off.
   **👹 Escape the monster** is the fifth option. Something is chasing you down a dark path,
   drawn frame by frame on a canvas: parallax trees, a shadow with glowing eyes, and a student
   in a lab coat looking back over their shoulder. Every right answer is a burst of speed;
   every wrong one lets it close in. The chase **freezes while a wrong answer is explained**,
   because reading why you were wrong should not be the moment you get eaten. It is tuned so a
   perfect run still tightens from 46 m of head start down to about 18 m — and a "make it less
   scary" switch turns the shadow friendly and stops the screen shaking. No sound, no jump
   scares, nothing gory.
   **📐 Go deeper** sits under every lesson, folded away until you ask for it. It is the layer
   a test actually examines, and it is written per topic: the **formulas with every symbol
   spelled out** (`F = m × a` — force in newtons, mass in kilograms, acceleration in m/s²),
   the **mistakes people really lose marks on** shown as wrong-then-right pairs, **a few steps
   past the twelve scenes** (free-body diagrams, latent heat, Sankey diagrams, magnetic
   stripes on the seafloor), and **what the topic joins up with** — tap a link and you switch
   straight to that topic. It also goes into the report as its own sections, and into the
   downloads.
5. **❓ Quiz from that material.** Three questions to start with, drawn from the topic's bank of
   ten, plus fill-the-gap questions built out of the sentences on your photo. Ask again for a
   different three, or dig deeper for all ten.
6. **🧠 Learn from mistakes.** Every question knows which page answers it. A wrong answer turns
   into that page — drawing, explanation and key word — with a button to read it aloud and a
   button to jump to it in your lesson. Then it asks you **new** questions about that same
   idea, built from the page's own key word and text (four ways: definition to word, word to
   definition, the main point of the page, and fill the gap), followed by the original
   question so you can prove you have it. 577 of these are possible across the library, and
   `check.js` verifies every one of them is correct.

7. **⚡ Sparks, pets and eggs.** Answering well earns **sparks** — a made-up number that
   lives in `localStorage` on that one device. **There is no money anywhere in this app. You
   cannot buy sparks, and nothing asks for a card.** Sparks hatch eggs and level up pets.

   An egg costs **10 sparks** and hatches one of **50 pets**, drawn as SVG like everything
   else. The odds are printed on the machine before you spend anything: Common 50%, Rare 25%,
   Gold 14%, Legendary 7%, Mythic 3%, Impossible 1% — and a roll can only ever give you a pet
   you do not already have, so 50 eggs collects the set and a duplicate is impossible. Rarer
   pets hatch with a level head start (up to +6).

   Every pet is an **attacker (⚔)** or a **defender (🛡)** — 29 and 21 of them. Levelling
   goes to **20**, costing 6 sparks for the first level and 32% more each time, 3,645 sparks
   for a maxed pet. A defender unlocks a better hint every 4 levels: which page it came from,
   then the key word, then an option ruled out, then the sentence that answers it. An attacker
   unlocks a harder question to send every 5 levels, and one fed past 0.7 bite hits for two
   hearts instead of one.

8. **⚔ Duel a friend.** Two players, one device, one topic. On your attack your pet finds
   **three questions and you choose which one to send** — the stronger your attacker, the
   harder the three. A hand-over screen sits in between so the person answering never sees
   which one was picked. They get one hint from their own pet, then answer. Five hearts each,
   wrong answers cost one (or two against a strong attacker), and every question is retired
   once used. There is no internet matchmaking, because that would need a server.

Before making a video it also offers a one-tap search of YouTube, Khan Academy, Bilibili and
the web for your topic, because a real teacher on video often beats anything we can draw.

## Run it locally

Any static file server works. From this folder:

```bash
npx serve .
```

Then open the address it prints (usually http://localhost:3000).

Python works too:

```bash
python -m http.server 8123
```

You do need a server rather than double-clicking `index.html`, because the text reader
downloads a worker file and browsers block that on `file://`.

## Deploy to Vercel

```bash
npx vercel deploy --prod
```

It is a static site, so there is no build step and no framework to pick. `vercel.json` sets
clean URLs and a few safety headers. You can also drag this folder onto vercel.com/new.

## What is in here

| File | What it does |
| --- | --- |
| `index.html` | The whole page: four steps, book reader, video player, duel, quiz, pet shop |
| `assets/styles.css` | All styling, light and dark mode, print styles for the PDF export |
| `assets/app.js` | Flow, text reading, board matching, storyboard, player, quiz, exports |
| `assets/topics.js` | Science library, topics 1–7 |
| `assets/topics-b.js` | Science library, topics 8–14 |
| `assets/topics-c.js` | Science library, topics 15–17: acids, optics, space |
| `assets/topics-d.js` | Science library, topics 18–21: evolution, mixtures, microbes, magnetism |
| `assets/projects.js` | One hands-on project per topic: materials, steps, the science |
| `assets/chase.js` | The monster chase: canvas drawing, physics, and the balance numbers |
| `assets/pets.js` | The 50 pets: shapes, rarities, egg odds, levelling, and the hint ladder |
| `assets/duel.js` | The two-player duel: question difficulty, the three-way pick, hearts |
| `assets/detail.js` | The deeper layer per topic: formulas, misconceptions, links |
| `assets/art.js` | Every drawing, as SVG built in code so it works in dark mode |
| `vercel.json` | Static hosting config |
| `check.js` | Checks the library: run `node check.js` after editing any topic or project |
| `.claude/launch.json` | Local preview config for Claude Code |

## Adding a topic to the library

Copy an existing block in `assets/topics.js` and fill it in. The rules the app relies on:

- Exactly **12 scenes**, and exactly **four of each tier**. Tier 1 scenes are what a 4-page
  book shows, tier 1 + 2 make the 8-page version, all 12 make the long one. Keep a recap
  scene last — the app always keeps the final scene so short books still end properly.
- Every scene needs `b` (normal wording) **and** `s` (the grades 3–5 retelling, shorter and
  plainer). `s` is what the youngest band reads and hears.
- The topic needs an `example` — `{ t, b, spot }` — the everyday thing this science shows up
  in. Keep `b` plus `spot` under about 70 words so it narrates in roughly 20 seconds.
- `art` must name a drawing that exists in `assets/art.js`. `labels` is up to 3 short lines.
- `keywords` is what a photo gets matched against — include the misspellings and short forms
  students actually write on a board.
- `taught` names the unit as the US, Canadian and UK curricula usually label it. Keep it to
  the common name — do not claim an official specification code you have not checked.
- `quiz` is exactly **10 questions**, 3 options each, `c` is the index of the right answer.
  The app asks 3 at a time and rotates, and shows all 10 if the student digs deeper.
- Add a matching entry in `assets/detail.js` with the same topic id: at least one formula
  (each with `what` explaining every symbol), two `mistakes` as wrong/right pairs, two
  `deeper` items, and two `links` to other topic ids. `check.js` fails if a link points at a
  topic that does not exist.
- Add a matching entry in `assets/projects.js` with the same topic id. Household materials
  only, nothing hot or sharp, and it has to be a fair test: one thing changed, one measured.

## Tuning the chase

The numbers live in one `CFG` block at the top of `assets/chase.js`. Raising `baseClose` or
`ramp` makes it meaner; raising `boost` or `maxGap` makes it kinder. `CHASE.advance(seconds)`
runs the simulation without waiting for animation frames, which is how the balance above was
measured — a run with no answers is caught at about 13 seconds.

## Known limits

- Sparks and pets are stored in `localStorage` on that one device too, so they do not
  follow you to another computer and clearing site data clears them. They are not money
  and cannot be bought.
- The duel is hot-seat only: two people at one screen. Playing someone in another house
  would need a server to pass the moves through, and this app does not have one.
- The grade sign-in is stored in `localStorage` on that one device. There is no account, so
  nothing follows you to another computer — and nothing about you leaves the browser.
- The library covers 21 topics. Anything outside it is reported as "no topic matched" rather
  than guessed at.
- Text recognition needs the internet the first time, to fetch the reader. Everything after
  that works offline.
- Handwriting is much harder to read than printed text. Typed slides and textbook pages work
  best; for messy board writing, picking the topic by hand is faster.
- The fill-the-gap questions only appear when the photo gave us a clean, readable line of
  text. If it did not, you just get the library questions.
- Narration uses the voices already installed on your device, so the list differs between
  phones and computers. If a device has none, everything still works as text.
- The word-by-word caption highlight needs the browser to report speech word boundaries.
  Chrome and Edge do; where a browser does not, the caption simply shows without highlighting.
- The video lengths are targets, not promises: narration takes as long as it takes, and a
  slower voice or a younger grade stretches it. A "3 minute" video runs 3:00–3:25 depending on
  grade, and for grades 3–5 the "5 minute" option tops out around 4:00 because the most
  advanced pages are held back. The exact length always shows on the button before you build.
- Searching YouTube and Bilibili happens on their sites, in a new tab. Searching inside this
  page would need a paid API key, and a key shipped in a public web page is a key anyone can
  take.
