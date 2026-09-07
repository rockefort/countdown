# ADR-0003: Level Progression & Streak System

## Status

Accepted (superseded for locking by ADR-0004)

## Context

All three learning games (Quiz, Still klokka, Hva er klokken om) need difficulty progression and a reward mechanic to guide learners from basic to advanced clock-reading.

## Decision

Every game uses the same progression system:

- **5 levels**, each adding more minute increments to the allowed set:
  - Level 1: whole hours only (`[0]`)
  - Level 2: `[0, 30]`
  - Level 3: `[0, 15, 30, 45]`
  - Level 4: all 5-minute marks (`[0,5,...,55]`)
  - Level 5: approximate/ambiguous minute values requiring "omtrentlig" (approximate) language
- **Streak goal of 3**: the player must answer 3 correctly in a row.
- On a wrong answer, the streak resets to 0.
- Reaching the streak goal shows a success overlay with options to continue (next question, same level), play again, or return to the menu.

### Level config shape (per game)

```js
var levelConfig = {
    1: { label: "Nivå 1 – heltimer",
         minutes: [0],
         describe: function(h, m) { return hourName(h); } },
    // ... levels 2-5
};
```

Each game names its config distinctly to avoid global collision: `levelConfig` (quiz), `setclockLevelConfig`, `futureLevelConfig`.

## Consequences

- Consistent learner experience across all games.
- `unlockedLevel` state tracks which levels are playable (originally levels locked behind streaks — see ADR-0004).
