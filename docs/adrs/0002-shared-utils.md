# ADR-0002: Shared Utils in shared.js

## Status

Accepted

## Context

The "Nå" widget formats Norwegian clock times and draws analog clocks. As games were added, they all needed the same time-formatting and clock-drawing logic. Duplicating it per game would create drift and bugs.

## Decision

Centralize shared, framework-independent utilities in `shared.js`. Each game imports/reuses these directly without modification.

Key reusable functions:

| Function | Purpose |
|---|---|
| `hourName(h)` | Norwegian hour name (0-11 → "tolv"–"elleve") |
| `norwegianForTime(date)` | Exact Norwegian time text (e.g. "kvart over tre") |
| `norwegianApproximate(hour, minute)` | Approximate time text ("litt mer enn en halvtime") |
| `roundToNearestFiveMinutes`, `ceilToFiveMinutes` | Minute rounding helpers |
| `pad(n)` | Zero-pad a number to 2 digits |
| `drawHand(ctx, angle, length, width)` | Draw a single clock hand |

## Consequences

- Fix a bug in time formatting once and all games benefit.
- Games remain small and focused on their own logic.
- `shared.js` must not depend on any particular page's DOM; it's pure logic + canvas helpers.
