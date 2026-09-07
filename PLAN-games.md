# Plan: Two New Games — Still klokka & Hva er klokken om...?

## Summary

Two new games added as separate sidebar pages, following the exact same architecture as the existing Quiz (quiz.js). Each game gets its own JS file, shares CSS classes from style.css, and reuses shared.js utilities.

**Files to create:** `setclock.js`, `futuretime.js`
**Files to modify:** `index.html`, `style.css`
**Files unchanged:** `shared.js`, `now.js`, `quiz.js`

---

## Game 1: "Still klokka" (Set the Clock)

### Concept

Norwegian text prompt (e.g., "Still klokken til kvart over tre") → user adjusts a clock to match → submits with "Sjekk" button.

### State

```js
var setclock = {
    level: 1,
    clockMode: "analog",
    streak: 0,
    streakGoal: 3,
    unlockedLevel: 1,
    targetHour: null,
    targetMinute: null,
    currentHour: 12,
    currentMinute: 0,
    active: false
};
```

### Level config

Reuse the same `levelConfig` structure as quiz.js (levels 1-5 with same minutes/describe functions).

```js
var setclockLevelConfig = {
    1: { label: "Nivå 1 – heltimer",
         minutes: [0],
         describe: function(h, m) { return hourName(h); } },
    2: { label: "Nivå 2 – + halv",
         minutes: [0, 30],
         describe: function(h, m) { return norwegianForTime(new Date(2026,0,1,h,m)); } },
    3: { label: "Nivå 3 – + kvart",
         minutes: [0, 15, 30, 45],
         describe: function(h, m) { return norwegianForTime(new Date(2026,0,1,h,m)); } },
    4: { label: "Nivå 4 – alle 5 min",
         minutes: [0,5,10,15,20,25,30,35,40,45,50,55],
         describe: function(h, m) { return norwegianForTime(new Date(2026,0,1,h,m)); } },
    5: { label: "Nivå 5 – omtrentlig",
         minutes: [2,3,4,5,6,7,8,9,10,11,12,13,14,16,17,18,19,20,21,22,26,27,28,29,31,32,33,34,37,38,39,40,41,42,43,44,46,47,48,49,50,51,52,53],
         describe: function(h, m) { return norwegianApproximate(h, m); } }
};
```

### Sub-screens

1. **Start form** (`#setclock-start`): Level selector (1-5), clock mode (Analog/Digital/Begge), Start button
2. **Active game** (`#setclock-active`): Prompt text, interactive clock, up/down buttons, "Sjekk" button
3. **Success overlay** (`#setclock-success`): "Bra!" + next level / repeat / menu buttons

### Interactive clock (analog mode)

- Canvas with hour/minute hands drawn at `currentHour:currentMinute`
- Drag support: user touches/clicks a hand, drags to rotate. Snap to 5-minute increments.
- Fallback: up/down buttons always available
- No seconds hand (same as quiz clock)

### Up/down buttons

- `▲ ▼` for hour (wraps 0-23)
- `▲ ▼` for minutes (steps of 5, wraps 0-55)

### Start position

Random time, within ±3 hours of target (avoids excessive clicking), snapped to 5-minute increments.

### Submission

"Sjekk" button compares `currentHour:currentMinute` vs `targetHour:targetMinute`.
- Correct → green flash on clock area, streak++
- Wrong → red flash, show correct time briefly, streak=0
- Same 1.2s delay pattern as quiz before next question or success screen

### Clock rendering

Reuse `drawQuizClock()` from quiz.js (parameterized canvas, no seconds hand). For digital mode, display `HH:MM` text. For "begge", show both.

---

## Game 2: "Hva er klokken om...?" (What time is it in...?)

### Concept

Show a fixed start time on a clock → ask "Hva er klokken om X?" → user picks from 4 multiple choice answers (mix of digital times and Norwegian text).

### State

```js
var futuretime = {
    level: 1,
    clockMode: "analog",
    streak: 0,
    streakGoal: 3,
    unlockedLevel: 1,
    startHour: null,
    startMinute: null,
    offsetMinutes: null,
    correctAnswer: "",
    active: false
};
```

### Level config (offset types)

Same progression as Game 1: hours → half → quarter → 5-min → approximate.

```js
var futureLevelConfig = {
    1: { label: "Nivå 1 – timer",
         offsets: [60, 120, 180, 240, 300, 360] },  // 1-6 hours
    2: { label: "Nivå 2 – + halvtime",
         offsets: [30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330, 360] },  // +30min steps
    3: { label: "Nivå 3 – + kvarter",
         offsets: [15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180] },  // +15min steps
    4: { label: "Nivå 4 – alle 5 min",
         offsets: [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90] },  // 5-min steps, up to 90min
    5: { label: "Nivå 5 – omtrentlig",
         offsets: [2,3,4,5,6,7,8,9,10,11,12,13,14,16,17,18,19,20,21,22,26,27,28,29,31,32,33,34,37,38,39,40,41,42,43,44,46,47,48,49,50,51,52,53] }  // approximate offsets
};
```

### Offset text helpers (new functions in futuretime.js)

```js
function hourOffsetText(min) {
    var hours = min / 60;
    if (hours === 1) return "en time";
    return hours + " timer";
}

function offsetText(min) {
    // Returns Norwegian text for common offsets:
    // 5 → "fem minutter", 15 → "et kvarter", 30 → "en halvtime",
    // 45 → "tre kvarter", 60 → "en time", etc.
    // For level 4, use exact minute descriptions.
    // For level 5, use approximate descriptions.
}

function approximateOffsetText(min) {
    // e.g. "om en times tid", "om litt mer enn en halvtime"
    // Reuses logic similar to approximateRemaining() in now.js
}
```

### Question generation

1. Pick random start time (hour 0-23, minute from allowed set for level)
2. Pick random offset from level's allowed offsets
3. Calculate target time: `(startMinutes + offset) % 1440`
4. Generate correct answer — randomly as digital time (`pad(targetH) + ":" + pad(targetM)`) or Norwegian text (`norwegianForTime(targetDate)`)
5. Generate 3 distractor times (nearby valid times for the level)
6. Shuffle all 4 options

### Sub-screens

1. **Start form** (`#future-start`): Level selector, clock mode, Start button
2. **Active game** (`#future-active`): Clock showing start time, question text, 4 option buttons
3. **Success overlay** (`#future-success`): Same pattern as quiz

### Question display

- Clock showing the fixed start time (analog, digital, or both based on mode)
- Text: `"Hva er klokken om {offsetText}?"`
- 4 option buttons in 2x2 grid (reuse `.quiz-option` class)

### Answer checking

Same pattern as quiz — disable buttons, green/red flash, 1.2s delay, streak/level progression.

---

## CSS Changes (style.css)

Add new classes for the set-clock game's interactive elements:

| Selector | Purpose |
|---|---|
| `.setclock-prompt` | Large Norwegian text prompt |
| `.setclock-controls` | Flex row for hour/minute up/down buttons |
| `.setclock-btn-group` | Vertical stack: label + ▲ + value + ▼ |
| `.setclock-value` | Large display of current hour or minute |
| `.setclock-check` | "Sjekk" button (reuse `#quiz-start-btn` style) |
| `.future-question` | Question text styling |

Most styling reuses existing `.quiz-option`, `.level-btn`, `.mode-btn`, `.streak-dot`, `.quiz-header`, `.quiz-clock-area`, `.quiz-success` classes.

---

## HTML Changes (index.html)

### Sidebar — add 2 new nav items:

```html
<div class="nav-item" data-page="setclock" onclick="showPage('setclock')">Still klokka</div>
<div class="nav-item" data-page="future" onclick="showPage('future')">Hva er klokken om?</div>
```

### New page divs

`#page-setclock` and `#page-future` following the exact same 3-widget pattern as `#page-quiz`:

```html
<!-- Page: Still klokka -->
<div class="page" id="page-setclock">
    <div class="widgets">
        <div class="widget" id="setclock-start">...</div>      <!-- Start form -->
        <div class="widget" id="setclock-active" style="display:none;">...</div>  <!-- Active game -->
        <div class="widget quiz-success" id="setclock-success" style="display:none;">...</div>  <!-- Success -->
    </div>
</div>

<!-- Page: Hva er klokken om...? -->
<div class="page" id="page-future">
    <div class="widgets">
        <div class="widget" id="future-start">...</div>         <!-- Start form -->
        <div class="widget" id="future-active" style="display:none;">...</div>   <!-- Active game -->
        <div class="widget quiz-success" id="future-success" style="display:none;">...</div>  <!-- Success -->
    </div>
</div>
```

### Script tags — add at bottom:

```html
<script src="setclock.js"></script>
<script src="futuretime.js"></script>
```

---

## File Change Summary

| File | Change |
|---|---|
| `index.html` | +2 nav items, +2 page divs (~50 lines each), +2 script tags |
| `style.css` | +~30 lines for set-clock controls and future-question styling |
| `setclock.js` | **New file** ~250 lines — game logic, drag handler, button handlers |
| `futuretime.js` | **New file** ~280 lines — game logic, offset text helpers, question gen |
| `shared.js` | No changes |
| `quiz.js` | No changes |
| `now.js` | No changes |

---

## Key Design Decisions

1. **Drag on analog:** Touch/mouse drag on the canvas. Detect which hand is closer to the touch point, then rotate that hand. Snap to 5-minute increments. This is the most complex piece — about 60 lines of event handling.

2. **Random start in Game 1:** Generate target first, then pick a random start within ±3 hours (±180 minutes), snapped to 5-minute increments.

3. **Mixed answer formats in Game 2:** Randomly assign ~50% as digital times, ~50% as Norwegian text per question. The correct answer format is also random.

4. **Reuse over duplication:** Both games reuse `drawQuizClock()`, `.quiz-option`, `.level-btn`, `.mode-btn`, `.streak-dot`, `.quiz-header`, `.quiz-clock-area`, `.quiz-success` classes, and the streak/level progression pattern from quiz.js.

5. **Streak persistence:** Progress resets on page reload (same as existing quiz). Can add localStorage persistence later if desired.

---

## Flow Diagrams

### Game 1: Still klokka

```
Start form -> [Start]
  -> Q1: user adjusts clock -> [Sjekk]
    -> correct -> streak 1/3 -> Q2
      -> correct -> streak 2/3 -> Q3
        -> correct -> streak 3/3 -> Success! Next level unlocked
          -> [Fortsett] -> Q4 (same level)
          -> [Nivå] -> back to start (level unlocked)
        -> wrong -> streak 0 -> Q4
      -> wrong -> streak 0 -> Q3
    -> wrong -> streak 0 -> Q2
```

### Game 2: Hva er klokken om...?

```
Start form -> [Start]
  -> Q1: "Hva er klokken om en time?" -> pick answer
    -> correct -> streak 1/3 -> Q2
      -> correct -> streak 2/3 -> Q3
        -> correct -> streak 3/3 -> Success! Next level unlocked
          -> [Fortsett] -> Q4 (same level)
          -> [Nivå] -> back to start (level unlocked)
        -> wrong -> streak 0 -> Q4
      -> wrong -> streak 0 -> Q3
    -> wrong -> streak 0 -> Q2
```
