# Grill-Me Quiz Feature — Implementation Plan

## Overview

All changes in `index.html`. Three additions: CSS, HTML, JS. No existing functions modified — `norwegianForTime()` and `approximateRemaining()` are reused directly.

---

## 1. CSS (~50 lines)

Added to the `<style>` block. Matches the existing dark-glass widget aesthetic.

| Selector | Purpose |
|---|---|
| `.quiz-options` | 2x2 grid for answer buttons |
| `.quiz-option` | Answer button — dark glass, white text, large tap target |
| `.quiz-option:hover` | Subtle white highlight |
| `.quiz-option.correct` | Green (#30D158) background flash |
| `.quiz-option.wrong` | Red (#ff3b30) background flash |
| `.quiz-option:disabled` | Dimmed, pointer-events none during feedback |
| `.quiz-header` | Flex row — level badge left, streak dots right |
| `.streak-dot` | 12px circle — filled = achieved, hollow = pending |
| `.level-btn` | Level selector — dark background, white text |
| `.level-btn.active` | Pink accent border (matches theme) |
| `.level-btn.locked` | Gray, opacity 0.4, cursor not-allowed |
| `.mode-btn` | Clock mode toggle |
| `.mode-btn.active` | Pink accent |
| `.quiz-success` | Centered success card overlay |
| `.quiz-clock-area` | Flex container for analog canvas + digital text |

---

## 2. HTML: Replace `page-quiz` (lines 318-326)

Three sub-sections, toggled by JS:

### A. Start form (`#quiz-start`)

```
Grill meg!

Nivaa:  [1] [2] [3] [4] [5]
        ^active  ^locked (grayed, no click)

Klokke: [Analog] [Digital] [Begge]

            [ Start ]
```

Level buttons 2-5 have class `locked` initially. Unlocked dynamically as streaks are achieved.

### B. Quiz view (`#quiz-active`, hidden)

```
+--------------------------------------+
|  Nivaa 1          ● ● ○  / 3        |
|                                      |
|     [ canvas / digital clock ]       |
|                                      |
|  +----------+  +----------+         |
|  |  tolv    |  |  to      |         |
|  +----------+  +----------+         |
|  +----------+  +----------+         |
|  |  tre     |  |  fire    |         |
|  +----------+  +----------+         |
+--------------------------------------+
```

### C. Success overlay (`#quiz-success`, hidden)

```
+------------------------------+
|         Bra!                 |
|   Du kan na nivaa 2!        |
|                              |
|   [ Fortsett ]  [ Nivaa ]    |
+------------------------------+
```

---

## 3. JavaScript (~250 lines)

Added after existing clock/countdown functions (~line 1151).

### State

```js
var quiz = {
    level: 1,
    clockMode: "analog",
    streak: 0,
    streakGoal: 3,
    unlockedLevel: 1,
    targetHour: null,
    targetMinute: null,
    correctAnswer: "",
    active: false
};
```

### Level config

```js
var levelConfig = {
    1: { label: "Nivaa 1 - heltimer",
         minutes: [0],
         describe: function(h, m) { return hourName(h); } },
    2: { label: "Nivaa 2 - + halv",
         minutes: [0, 30],
         describe: function(h, m) { return norwegianForTime(new Date(2026,0,1,h,m)); } },
    3: { label: "Nivaa 3 - + kvart",
         minutes: [0, 15, 30, 45],
         describe: function(h, m) { return norwegianForTime(new Date(2026,0,1,h,m)); } },
    4: { label: "Nivaa 4 - alle 5 min",
         minutes: [0,5,10,15,20,25,30,35,40,45,50,55],
         describe: function(h, m) { return norwegianForTime(new Date(2026,0,1,h,m)); } },
    5: { label: "Nivaa 5 - omtrentlig",
         minutes: [2,3,4,5,6,7,8,9,10,11,12,13,14,16,17,18,19,20,21,22,26,27,28,29,31,32,33,34,37,38,39,40,41,42,43,44,46,47,48,49,50,51,52,53],
         describe: function(h, m) { return norwegianApproximate(m); } }
};
```

### Level 5 helper: `norwegianApproximate(minute)`

Wraps the existing `approximateRemaining()` but strips the hour prefix, returning only the minute-level description ("nesten en halvtime", "litt mer enn tre kvarter", etc.).

```js
function norwegianApproximate(minute) {
    var full = approximateRemaining(minute);
    // approximateRemaining returns "N time(r) og <minutes>"
    // or just "<minutes>" when < 60
    // Strip the hour prefix:
    var idx = full.indexOf(" og ");
    if (idx !== -1) return full.slice(idx + 4);
    if (full.startsWith("Om ")) return "nesten null";  // fallback for 0-2 min
    return full;
}
```

Valid minute ranges per bucket (from `approximateRemaining` lines 764-775):

| Bucket | Minutes | Norwegian text |
|---|---|---|
| 5 | 26-29 | nesten en halvtime |
| 6 | 30 | en halvtime |
| 7 | 31-34 | litt mer enn en halvtime |
| 8 | 37-40 | nesten tre kvarter |
| 9 | 45 | tre kvarter |
| 10 | 46-49 | litt mer enn tre kvarter |
| 11 | 50-53 | nesten en time |

Plus exact anchors: 5, 10, 15, 20 (fem/ti minutter, kvarter, tjue minutter).

### Distractor generation

```js
function generateDistractors(correctText, level) {
    // Collect all valid descriptions for this level
    var allDescriptions = [];
    var seen = {};
    for (var h = 0; h < 24; h++) {
        for (var i = 0; i < levelConfig[level].minutes.length; i++) {
            var m = levelConfig[level].minutes[i];
            var desc = levelConfig[level].describe(h, m);
            if (desc && desc !== correctText && !seen[desc]) {
                seen[desc] = true;
                allDescriptions.push(desc);
            }
        }
    }
    // Shuffle and pick 3
    shuffle(allDescriptions);
    return allDescriptions.slice(0, 3);
}
```

### Core functions

| Function | Purpose |
|---|---|
| `generateQuestion()` | Pick random hour (0-23), random valid minute for level. Get correct text via `levelConfig[level].describe()`. Generate 3 distractors. Shuffle 4 options. |
| `showQuestion()` | Render clock via `drawQuizClock()`, inject 4 option buttons, update streak dots + level badge. |
| `checkAnswer(btn, selected)` | If correct: green flash on btn, increment streak. If wrong: red flash on btn, highlight correct button green, reset streak. Disable all buttons. After 1.2s delay, check if streakGoal met -> `onStreakGoal()`, else `showQuestion()`. |
| `onStreakGoal()` | If `level < 5`: show success overlay, unlock next level button in start form, increment `unlockedLevel`. If level 5: show "fullfort!" message. |
| `drawQuizClock(canvasId, hour, minute)` | Draws clock at given time. Analog: canvas with hour+minute hands (no seconds). Digital: div with HH:MM. Begge: both. Reuses `drawHand()` utility. |
| `showStart()` | Hide quiz view, show start form. Update locked/unlocked state of level buttons. |
| `startQuiz()` | Read level + clockMode from form, reset streak, hide start, show quiz, call `showQuestion()`. |
| `continueQuiz()` | Hide success overlay, call `showQuestion()`. |
| `shuffle(arr)` | Fisher-Yates shuffle. |
| `initQuizNav()` | Bind click handlers for level-btn and mode-btn selection. Called once on page load. |

### `drawQuizClock` detail

Similar to existing `drawTargetClock` but parameterized:

```js
function drawQuizClock(canvasId, hour, minute) {
    var canvas = document.getElementById(canvasId);
    var ctx = canvas.getContext("2d");
    var r = canvas.width / 2;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(r, r);
    // Clock face (white circle)
    // Numbers 1-12 (pink)
    // Hour hand: (hour%12 + minute/60) * PI/6
    // Minute hand: minute * PI/30
    // Center dot
    ctx.restore();
}
```

No seconds hand — cleaner for quiz. Same visual style as existing clocks.

---

## 4. Flow diagram

```
Start form -> [Start]
  -> Q1: correct -> streak 1/3 -> Q2
    -> correct -> streak 2/3 -> Q3
      -> correct -> streak 3/3 -> Success! Next level unlocked
        -> [Fortsett] -> Q4 (same level)
        -> [Nivaa] -> back to start (level 2 now clickable)
      -> wrong -> streak 0 -> Q4
    -> wrong -> streak 0 -> Q3
  -> wrong -> streak 0 -> Q2
```

---

## 5. File change summary

| Location | Change |
|---|---|
| `<style>` block (before `</style>`, line 212) | Insert ~50 lines of quiz CSS |
| `page-quiz` div (lines 318-326) | Replace 9 lines -> ~55 lines of HTML |
| After `animateTargetClock()` / before `easeInOut()` (~line 1290) | Insert ~250 lines of quiz JS |
| Existing functions | **No changes** — `numbers`, `hourName`, `norwegianForTime`, `approximateRemaining`, `drawHand` all reused as-is |
