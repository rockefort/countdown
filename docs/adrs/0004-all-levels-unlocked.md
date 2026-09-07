# ADR-0004: All Levels Unlocked From Start

## Status

Accepted (supersedes ADR-0003's locking behavior)

## Context

Originally, games locked higher levels behind a streak of 3 correct answers (`unlockedLevel` starting at 1). This was intended as a reward/progression mechanic. In practice it frustrated learners who wanted to practice a specific level directly.

## Decision

Set `unlockedLevel: 5` for all games so **no level is locked** — every level (1-5) is selectable from the start form from the first render.

Applies to:
- `quiz.js` — `quiz.unlockedLevel = 5`
- `setclock.js` — `setclock.unlockedLevel = 5`
- `futuretime.js` — `futuretime.unlockedLevel = 5`

The streak system (ADR-0003) is retained for the success/reward screen, but it no longer gates access to levels.

## Consequences

- Learners can jump directly to any difficulty.
- The `.level-btn.locked` styling and lock-check logic remain in the code but never trigger since all levels are always unlocked.
- Omitting the lock-check simplification for now keeps the code defensive if locking is re-enabled later.
