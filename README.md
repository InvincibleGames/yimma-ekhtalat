# يمّه اختلط! — Yimma Ekhtalat!
A Bahraini heritage-inspired touch sorting game by **Invincible Games**.

## Play
GitHub Pages: https://invinciblegames.github.io/yimma-ekhtalat/

## Features
- Finger/mouse sweeping controls (no sticks)
- Five sorting worlds: grains, spices, sweets, craft items and sea treasures
- Score, combos, timed rounds, level progression and local browser save
- No server, database or build step needed

## Deployment
Static site at repository root. GitHub Actions workflow in `.github/workflows/pages.yml` deploys `main` to GitHub Pages once **Settings → Pages → Build and deployment → Source: GitHub Actions** is enabled.

## Image note
`menu_art.svg` is a lightweight heritage-themed vector replacement for the original large `menu_art.jpg`. The game logic and finger-touch mechanics come from the latest existing HTML edition. To restore the original artwork later, add `menu_art.jpg` to this repository and change the CSS image reference in `index.html`.
