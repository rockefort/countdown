# ADR-0006: Game Storage — One File Per Game, Shared CSS/JS

## Status

Accepted

## Context

The app grew to three interactive games plus the original "Nå" widget. They share visual language (dark glass widgets, pink accent, streak dots) and logic (Norwegian time text, clock drawing, streak/progression pattern).

## Decision

- **One JavaScript file per game** that owns its DOM and game logic: `quiz.js`, `setclock.js`, `futuretime.js`.
- **No framework** — plain vanilla JS with `var`-based state objects and imperative DOM manipulation (matching the existing codebase style).
- **Shared presentation** in `style.css` reused across games: `.quiz-option`, `.level-btn`, `.mode-btn`, `.streak-dot`, `.quiz-header`, `.quiz-clock-area`, `.quiz-success`, `.quiz-start-form`.
- **Reuse over duplication**: both new games reuse `drawQuizClock()`-style clock drawing and the streak/level progression pattern from quiz.js.
- **State is in-memory only** — progress resets on page reload. No persistence layer (localStorage could be added later).

## Consequences

- Adding a game = add a JS file + a nav item + a page div + possibly a few CSS classes; no changes to other games' files.
- CSS additions that are game-specific are prefixed (e.g. `.setclock-*`, `.future-question`) while generic classes stay unprefixed and shareable.
- The duplicated streak/progression code across the three files is an accepted trade-off for clarity and independence, per this ADR's "reuse over duplication" leaning (shared where it lives in shared.js/style.css, duplicated where it's per-game logic).
