# ThepicScience

Take a picture of your teacher's whiteboard and get it back as a picture book, a narrated
video, a science project you can actually do, or a report outline to write from — pitched at
your grade, with a quiz built from that exact photo. Free, no account.

Built as one static web page: HTML, CSS and plain JavaScript. Nothing is uploaded anywhere —
the photo, the text reading and the narration all happen inside the browser.

## What it does

1. **📸 Take up to ten pictures.** Camera, file picker, drag and drop, or paste — and the
   picker takes **ten photos at once**. A whiteboard rarely fits in one shot, so all of them
   are read one after another and joined into a single piece of text before the topic is
   matched. A strip of thumbnails shows what went in, and any one of them can be dropped if
   it came out blurred. Give it a video instead and it grabs three frames.
   The library covers **27 topics**, chosen to line up with what US, Canadian and UK schools
   actually teach. Thirteen of them are biology, because that is the subject a timetable
   spends the most weeks on. Each one carries a `taught` line naming the unit as your own curriculum
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
   drift over each drawing, and **every one of the 89 drawings animates** — the sun's rays
   turn, rain falls, current runs round the circuit, the heart beats, particles jiggle faster
   in a gas than a solid. Captions **highlight each word as the voice says it**, driven by the
   speech engine's own word events rather than a timer. There is a clickable scene strip,
   fullscreen, and keyboard shortcuts: space to play, arrows to skip a scene, `F` for
   fullscreen, `C` for captions. None of it animates in the picture book, the exports or the
   printed pages, and `prefers-reduced-motion` switches all of it off.
   **👹 Escape the monster** is the fifth option, and it is now a ladder of levels with a
   different monster and a different place in each. Everything is drawn frame by frame on a
   canvas, so a whole new world costs nothing to download.

   | Level | Where | What is after you | Chest |
   | --- | --- | --- | --- |
   | 1 | The dark wood | **Slime** — a heavy green thing that wobbles as it rolls | 10 ⚡ |
   | 2 | Deep space | **Alien** — tall, slow-striding, huge black eyes | 30 ⚡ |
   | 3 | The backrooms | **The long one** — yellow wallpaper, buzzing lights, no face | 50 ⚡ |
   | 4+ | Round again | the same three, each lap tighter | same |

   Get out alive and a chest drops. You open it yourself and the sparks go straight into your
   total, then the next level loads with the next monster — never the same one twice in a row.
   The level you reached is remembered.

   **The questions start short and get longer.** Every question is weighed by how many words
   you have to read and how deep into the topic it sits, and a run walks that scale from the
   bottom to the top — so a run opens with "Current is measured in…" and ends on a two-line
   calculation. Higher levels start further up the scale.

   Every right answer is a burst of speed; every wrong one lets it close in. The chase
   **freezes while a wrong answer is explained**, because reading why you were wrong should
   not be the moment you get eaten. `check.js` plays every level out and fails the build if
   any of them needs answers faster than one every 1.4 seconds.

   Spooky, never nasty. No sound, no jump scares, nothing gory, and "make it less scary"
   makes all three friendly: the slime smiles, the alien waves, and the long pale figure gets
   a face and a grin.

   **⏱ Speed run.** A clock runs in the corner to a tenth of a second, and it keeps going
   while you read an explanation — the pause is part of the cost. Your fastest escape on each
   level is kept on your own device and shown in a board under the chase. If the site has a
   durable score store there is a shared board too: the fastest twenty people per level, with
   whatever name they typed on their own device.
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
   question so you can prove you have it. 737 of these are possible across the library, and
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

8. **⚔ Duel, in teams, online or on one device.** Pick **1v1, 2v2, 3v3 or 4v4**, get a
   four-letter party code, and fill the seats.

   On your attack your pet finds **three questions and you choose which one to send** — the
   stronger your attacker, the harder the three. Someone on the other team answers it, with
   one hint from their own pet. Everyone attacks and everyone answers: each team keeps its own
   two pointers and both walk round the team. Hearts scale with team size (5, 7, 9, 11) so a
   4v4 does not end in two rounds, and every question retires once used.

   **Robots fill any empty seat.** A robot picks one of the three answers at random, so it
   gets one in three right — that is printed on its card, and `check.js` plays 120,000 of its
   answers to prove the rate. It picks which question to send at random too. A host on their
   own can start a 4v4 immediately and play seven robots.

   **Online** gives everyone a code to join from their own phone or laptop. It is
   *host-authoritative*: the host's device runs the rules and publishes what the screen should
   say, the guests render that and post back what they tapped. One copy of the rules means two
   screens cannot drift apart. The whole thing rides on one small serverless endpoint that
   stores a JSON document per code for half an hour — no accounts, no personal data, nothing
   kept afterwards.

   **On this device** needs no server at all: add the people sitting with you, pass it round,
   and a hand-over screen keeps the question hidden until it is their turn.

9. **🧑‍🔬 Your profile.** A chip in the top right corner of every page: your
   avatar, your name and your title. Tap it and the locker opens.

   You start with a plain lab coat and nothing else. **40 cosmetics** across six slots — who
   you are, a hat, a frame, a background, a badge and a title — and 34 of them are bought
   with sparks, 3,451 for the lot. Every one is drawn in code as SVG, so a hundred looks cost
   nothing to download and all of them work in dark mode. The locker previews each item on
   *your own* avatar before you pay for it.

   The avatar is drawn in the same paper tone as the mystery egg on purpose. It is an
   illustration of a scientist, not a picture of a person, so none of the cosmetics are
   about how you actually look — they turn you into a cat, a robot, an astronaut, a dragon.

   Your name is typed in, up to 16 characters, and kept in `localStorage` with everything
   else. No account, no email, nothing sent anywhere. The duel picks it up automatically as
   player one.

10. **🏅 Titles you cannot buy.** Ten of them, and no amount of sparks will get you one.
    Each waits until you have actually done the thing, then arrives with a message:

    | Title | How you get it |
    | --- | --- |
    | Scholar | Learn 5 different topics |
    | Collector | Find 10 pets |
    | Survivor | Escape the monster 3 times |
    | Duellist | Win 5 duels |
    | Spark Baron | Earn 1,000 sparks in total |
    | Pet Trainer | Raise any pet to level 20 |
    | Pet Master | Find all 50 pets |
    | Walking Wardrobe | Unlock every look in the locker |
    | **Master** | Learn every topic in the library |
    | **The Legend** | Earn every other title |

    They sit in the same Title slot as the bought ones, marked *earned* and priced *cannot be
    bought*, so the name under your avatar says what you did rather than what you spent.
    `check.js` proves each one fires at the top and stays shut at zero, and that The Legend
    collapses if any single other title is taken away.

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
| `index.html` | The whole page: four steps, book reader, video player, duel, quiz, shop, profile |
| `assets/styles.css` | All styling, light and dark mode, print styles for the PDF export |
| `assets/app.js` | Flow, text reading, board matching, storyboard, player, quiz, exports |
| `assets/topics.js` | Science library, topics 1–7 |
| `assets/topics-b.js` | Science library, topics 8–14 |
| `assets/topics-c.js` | Science library, topics 15–17: acids, optics, space |
| `assets/topics-d.js` | Science library, topics 18–21: evolution, mixtures, microbes, magnetism |
| `assets/topics-e.js` | Science library, topics 22–27: the six biggest gaps in the biology |
| `assets/projects.js` | One hands-on project per topic: materials, steps, the science |
| `assets/chase.js` | The chase: the running, the questions, the ramp, the clock, the chest |
| `assets/worlds.js` | The three places and the three monsters, with their chests and tuning |
| `assets/party.js` | Parties: team sizes, seating, codes, and the one-in-three robots |
| `assets/net.js` | The wire between devices in an online party |
| `api/party.js` | The one serverless file: a JSON document per party code, for 30 minutes |
| `api/scores.js` | The speed-run leaderboard, fastest twenty per level |
| `assets/pets.js` | The 50 pets: shapes, rarities, egg odds, levelling, and the hint ladder |
| `assets/profile.js` | Your avatar: 40 cosmetics in six slots, and the ten earned titles |
| `assets/duel.js` | The team duel: difficulty, the three-way pick, hearts, robots, turns |
| `assets/detail.js` | The deeper layer per topic: formulas, misconceptions, links |
| `assets/art.js` | Every drawing, as SVG built in code so it works in dark mode |
| `vercel.json` | Static hosting config |
| `check.js` | Checks the library: run `node check.js` after editing any topic or project |
| `.claude/launch.json` | Local preview config for Claude Code |

## What the biology covers

Biology is the subject school spends the most time on, and the library started with seven
life science topics against fourteen of everything else. These six closed the gaps that
matter, measured against what US, UK and Canadian courses set as whole units:

| Topic | Why it was missing a problem |
| --- | --- |
| **Respiration** | The partner to photosynthesis, and the one every library seems to skip. Aerobic and anaerobic, ATP, lactic acid, fermentation. |
| **Cell division** | Genetics gave mitosis and meiosis one scene between them. Now a topic: the cell cycle, why meiosis halves, why siblings differ. |
| **Enzymes** | A GCSE Biology chapter on its own, and absent entirely. Active site, lock and key, denaturing, optimum pH. |
| **Classifying living things** | Kingdoms, binomial names, dichotomous keys, and why a whale is not a fish. |
| **Water and food inside a plant** | Xylem, phloem, stomata, guard cells, and what actually pulls water up a tree. |
| **Nerves, signals and reflexes** | Body systems gave it one scene. Now neurones, the reflex arc, synapses and myelin. |

Each one follows the same rules as every other topic: twelve scenes, four of each tier, a
recap last, ten questions, an everyday example, a hands-on project and a go-deeper layer.
Fifteen new drawings came with them, and `check.js` validates all of it.

The projects are the usual household science: yeast and a balloon for respiration, marked
bean roots for cell division, fresh pineapple that will not let jelly set for enzymes, a
dichotomous key tested on a volunteer, dyed celery in front of a fan, and the ruler-drop
reaction test.

## Switching the online parts on

Everything except two things works as plain static files, offline, with no server. The two
exceptions are **online duels** and the **shared leaderboard**, which need somewhere for two
devices to leave messages for each other.

Both look for the same environment variables, and both fall back without them:

| Variable | Where it comes from |
| --- | --- |
| `KV_REST_API_URL` | Upstash for Redis, added from the Vercel dashboard |
| `KV_REST_API_TOKEN` | the same |

With them set, parties and scores are stored properly. Without them, each endpoint keeps a
plain `Map` inside the running function instead. That is fine for `vercel dev` and often fine
for two phones in the same minute, but a serverless function can be moved to a fresh instance
at any moment, which drops everything. The app is told which one is in use:

- the **Online** button says "works best if everyone joins within a few minutes" rather than
  claiming it is reliable, and
- the **shared leaderboard is hidden entirely** until the store is durable, because a board
  that forgets itself every few minutes is worse than no board. Your own best times are kept
  in `localStorage` and always work.

To turn it on: open the project in the Vercel dashboard, go to Storage, add Upstash for Redis
(there is a free tier), and redeploy. Nothing in the code needs changing.

## Finding a topic by hand

The search box under step 2 scores every topic rather than filtering on a substring. Each
word you type has to land somewhere, and a keyword that is exactly what you typed beats one
that merely contains it, which beats a passing mention in a blurb. Where two topics own the
same word outright — the water cycle and plant transport both list transpiration — the one
that lists it several ways wins, because that is the topic it is really about.

That matters more than it sounds with 27 topics: before, "dominant allele" found nothing at
all, because no single field contained that exact phrase.

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

## Tuning the chase, and adding a monster

Each world owns its own numbers, in its `tune` block in `assets/worlds.js`. Raising
`baseClose` or `ramp` makes that world meaner; raising `boost` or `maxGap` makes it kinder.
`WORLDS.tuneFor(level)` applies the per-lap tightening on top, capped so even lap five stays
winnable.

A new monster is a new entry in the `LIST` at the bottom of that file: an id, a name, a
bounty, a `tune`, a `scene(c, g, ground)` that paints the backdrop and a
`monsterArt(c, g, t, k)` that paints the creature with the ground at y = 0 and `k` running 0
(far away) to 1 (right behind you). `chase.js` needs no changes; `check.js` will pick the new
world up and play every level of it to check it is beatable.

Test seams, all used by the checks above: `CHASE.advance(seconds)` runs the simulation without
waiting for animation frames, `CHASE.forceAnswer(right)` answers the question on screen, and
`CHASE.plan(pool, level)` returns the order a pool would be asked in, which is how the
short-to-long ramp is verified.

## Known limits

- Sparks, pets and your profile are stored in `localStorage` on that one device too, so
  they do not follow you to another computer and clearing site data clears them. They are
  not money and cannot be bought.
- Your display name is never checked against anything. It is typed on your own device and
  shown only on your own screen, so there is nothing to moderate and nobody to clash with.
- Online duels poll the server about once a second rather than holding a connection open, so
  a move can take a second to appear on the other screen. A serverless function cannot keep a
  socket open, and a question-and-answer game is slow enough that it does not matter.
- If the host closes their tab, the duel stops for everyone: the host's device is the one
  running the rules. Guests go back to the lobby.
- A posted speed-run time is a number a browser sent. It is checked against what the level can
  physically allow and against the questions actually answered, so an obvious impossibility
  cannot sit at the top of the board, but there is no way to make it cheat-proof without a
  server that runs the game itself. It is a homework game, not a tournament.
- Ten pictures is the limit, and each is shrunk to 1600px before reading. Reading ten takes
  noticeably longer than reading one — the progress bar says which one it is on.
- The grade sign-in is stored in `localStorage` on that one device. There is no account, so
  nothing follows you to another computer — and nothing about you leaves the browser.
- The library covers 27 topics. Anything outside it is reported as "no topic matched" rather
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
