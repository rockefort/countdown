# ADR-0005: Clock Display Modes (Analog / Digital / Begge)

## Status

Accepted

## Context

Learners have different preferences and skill levels for reading analog vs digital clocks. Reading an analog clock face is harder than reading `HH:MM`. All games present a clock that the learner must read (or set).

## Decision

Each game exposes a **clock mode** selector on its start form with three options:

- **Analog** — render an analog clock face (canvas with hour+minute hands, no seconds hand).
- **Digital** — render `HH:MM` text.
- **Begge** — render both side by side.

The mode is stored per-game (`clockMode` in each game's state object) and respected every time a question is rendered.

### Analog clock rules

- No seconds hand (cleaner for a still reading task).
- Hour hand position accounts for the fractional minute (`hour % 12 + minute/60`).
- Visual style matches existing clocks: white face, pink numerals, red hour hand, green minute hand, white center dot.

## Consequences

- Consistent look and interaction across all three games.
- Learners can choose the presentation that fits them; teachers can guide students toward analog.
- The mode is per-game and persists for the lifetime of the page load only (resets on reload, same as all game state).
