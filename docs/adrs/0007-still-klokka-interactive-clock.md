# ADR-0007: Still klokka — Interactive Clock Setting

## Status

Accepted

## Context

"Still klokka" requires the learner to set a clock to match a Norwegian text prompt (e.g. "Still klokken til kvart over tre"). The hardest part is the input method for manipulating the clock hands, which must work on both mouse and touch.

## Decision

The interactive clock supports **two input methods**:

1. **Drag on the analog canvas (primary)** — the learner touches/clicks the clock and drags a hand to rotate it:
   - On pointer-down, detect which hand (hour or minute) is closer to the tap point.
   - While dragging, convert the pointer angle to a hand angle.
   - **Snap to 5-minute increments** for the minute hand (avoids mid-minute positions that would be unrepresentable in Norwegian).
   - Hour hand follows the corresponding hour-of-day position.
2. **Up/down buttons (always available as fallback)** — `▲`/`▼` for hour (wraps 0-23) and minute (steps of 5, wraps 0-55). Remain available even in analog mode so drag is never the only path.

### Start position

Each question generates a target time first, then picks a random start within **±3 hours** (±180 minutes) of the target, snapped to 5-minute increments. This avoids excessive clicking/dragging while still requiring meaningful adjustment.

### Submission feedback

The "Sjekk" button compares `currentHour:currentMinute` vs `targetHour:targetMinute`:
- Correct → green flash on the clock area, streak++
- Wrong → red flash, then briefly display the correct time, streak=0
- Same 1.2s delay pattern as the quiz before advancing

## Consequences

- Touch and mouse both fully supported without extra libraries (uses pointer/touch + mouse events).
- The ±3-hour start window balances effort vs. triviality.
- 5-minute snapping keeps the analog position always representable as exact Norwegian time.
