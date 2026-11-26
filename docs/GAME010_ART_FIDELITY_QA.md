# GAME-010 Art Fidelity & Full Browser Build — Production Review
Date: 26 November 2026

## Scope confirmed against CEO-approved design
- Keep **exactly two baskets**, **two item types per stage**, six or fewer live objects, direct finger/mouse dragging. No sticks. World catalog of 23 categories across five worlds retained.
- Keep the approved **five painted background images** exactly unchanged.
- Update 23 item placeholders to original, individually illustrated SVG object sprites, stored in `latest/assets/items-v2/`. All sprites depict their actual category rather than an unrelated emoji.
- Show a category-specific item preview above each of the two active baskets. Two spacious targets remain visible.
- Keep the five worlds × five levels, achievements, progression, save, shop, score, sound and menus.

## Object-to-world mapping
- Kitchen: Rice, Lentil, Chickpea, MungBean, KidneyBean.
- Spice Market: Cardamom, Clove, Peppercorn, Coriander, StarAnise.
- Sweets Shop: PinkSweet, YellowSweet, GreenSweet, Chocolate, CandyBall.
- Crafts: BlueButton, RedButton, PearlBead, WoodBead.
- Pearl Diving Coast (ساحل الغوص): Pearl, SeaGlass, Shell, Stone.

## Objective evidence
- [Private-branch GitHub Actions ART-010 Run 45756463876](https://github.com/InvincibleGames/yimma-ekhtalat/actions/runs/45756463876): **success**.
- 23 individually named SVG asset endpoints **200 OK**, parse and decode in browser.
- All 25 levels complete and route the correct pair to two baskets.
- Desktop 1280×800 and mobile 390×844 screenshots captured for each of five worlds.
- Desktop mouse and simulated mobile touch sorting both passed.
- No observed browser page errors. Old live edition retained at /final/.
- Approved background files are not modified.

## Release limitations
- Artwork is custom vector reinterpretation, **not an exact reproduction of all earlier painted object concept masters**. CEO has not separately visually accepted the new 23 sprite illustrations.
- Mobile checks use browser touch-event simulation, not a physical phone.
- This is a complete playable **HTML/browser** game, not an independently certified Godot native/Windows build.
- Do not call the separately authored concept illustrations approved solely because QA passes.

## Release steps
- Merge validated ART-010 branch into main.
- GitHub Pages deploy workflow must succeed.
- Live Pages acceptance must succeed; new objects should load at /latest/assets/items-v2/*.svg.
- Invite CEO to play /latest/ and give visual feedback.
