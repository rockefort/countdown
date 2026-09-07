// --------------------------
// Hva er klokken om...? (What time is it in...?)
// --------------------------

var futuretime = {
    level: 1,
    clockMode: "analog",
    streak: 0,
    streakGoal: 3,
    unlockedLevel: 5,
    startHour: null,
    startMinute: null,
    offsetMinutes: null,
    correctAnswer: "",
    active: false
};

var futureLevelConfig = {
    1: { label: "Nivå 1 – timer",
         offsets: [60, 120, 180, 240, 300, 360] },
    2: { label: "Nivå 2 – + halvtime",
         offsets: [30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330, 360] },
    3: { label: "Nivå 3 – + kvarter",
         offsets: [15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180] },
    4: { label: "Nivå 4 – alle 5 min",
         offsets: [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90] },
    5: { label: "Nivå 5 – omtrentlig",
         offsets: [2,3,4,5,6,7,8,9,10,11,12,13,14,16,17,18,19,20,21,22,26,27,28,29,31,32,33,34,37,38,39,40,41,42,43,44,46,47,48,49,50,51,52,53] }
};

function hourOffsetText(min) {
    var hours = min / 60;
    if (hours === 1) return "en time";
    return hours + " timer";
}

function offsetText(min) {
    if (min === 5) return "fem minutter";
    if (min === 10) return "ti minutter";
    if (min === 15) return "et kvarter";
    if (min === 20) return "tjue minutter";
    if (min === 25) return "fem og tjue minutter";
    if (min === 30) return "en halvtime";
    if (min === 35) return "fem og tretti minutter";
    if (min === 40) return "førti minutter";
    if (min === 45) return "tre kvarter";
    if (min === 50) return "femti minutter";
    if (min === 55) return "fem og femti minutter";
    if (min === 60) return "en time";
    if (min < 60) return min + " minutter";
    return hourOffsetText(min);
}

function approximateOffsetText(min) {
    if (min < 5) return "om litt";
    if (min < 8) return "om omtrent fem minutter";
    if (min < 12) return "om omtrent ti minutter";
    if (min < 17) return "om omtrent et kvarter";
    if (min < 23) return "om omtrent tjue minutter";
    if (min < 28) return "om omtrent en halvtime";
    if (min < 32) return "om omtrent en halvtime";
    if (min < 38) return "om litt mer enn en halvtime";
    if (min < 42) return "om omtrent tre kvarter";
    if (min < 48) return "om omtrent tre kvarter";
    if (min < 52) return "om omtrent femti minutter";
    if (min < 58) return "om nesten en time";
    if (min < 65) return "om omtrent en time";
    if (min < 95) return "om omtrent en time og en halvtime";
    return "om omtrent " + hourOffsetText(Math.round(min / 60) * 60);
}

function futureTimeText(min) {
    var cfg = futureLevelConfig[futuretime.level];
    if (futuretime.level === 5) {
        return approximateOffsetText(min);
    }
    return "om " + offsetText(min);
}

function drawFutureClock(canvasId, hour, minute) {
    var canvas = document.getElementById(canvasId);
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var r = canvas.width / 2;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(r, r);

    ctx.beginPath();
    ctx.arc(0, 0, r - 5, 0, Math.PI * 2);
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = "20px -apple-system";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "pink";

    for (var i = 1; i <= 12; i++) {
        var angle = i * Math.PI / 6 - Math.PI / 2;
        ctx.fillText(i.toString(), Math.cos(angle) * (r - 18), Math.sin(angle) * (r - 18));
    }

    var hours12 = hour % 12 + minute / 60;
    var mins = minute;

    ctx.strokeStyle = "red";
    drawHand(ctx, hours12 * Math.PI / 6, r * 0.55, 7);
    ctx.strokeStyle = "#30D158";
    drawHand(ctx, mins * Math.PI / 30, r * 0.73, 4);

    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();

    ctx.restore();
}

function generateFutureQuestion() {
    var cfg = futureLevelConfig[futuretime.level];
    var allowedMinutes = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
    var startH = Math.floor(Math.random() * 24);
    var startM = allowedMinutes[Math.floor(Math.random() * allowedMinutes.length)];
    var offset = cfg.offsets[Math.floor(Math.random() * cfg.offsets.length)];

    futuretime.startHour = startH;
    futuretime.startMinute = startM;
    futuretime.offsetMinutes = offset;

    var totalStart = startH * 60 + startM;
    var totalTarget = (totalStart + offset) % 1440;
    var targetH = Math.floor(totalTarget / 60);
    var targetM = totalTarget % 60;

    var useDigital = Math.random() < 0.5;
    var correct;
    if (useDigital) {
        correct = pad(targetH) + ":" + pad(targetM);
    } else {
        correct = norwegianForTime(new Date(2026, 0, 1, targetH, targetM));
    }

    futuretime.correctAnswer = correct;

    var distractors = generateFutureDistractors(targetH, targetM, correct, useDigital);
    var options = shuffle([correct].concat(distractors));

    return {
        startHour: startH,
        startMinute: startM,
        offset: offset,
        question: futureTimeText(offset),
        options: options,
        correct: correct
    };
}

function generateFutureDistractors(targetH, targetM, correct, useDigital) {
    var distractors = [];
    var seen = {};
    seen[correct] = true;

    var cfg = futureLevelConfig[futuretime.level];
    var nearbyOffsets = cfg.offsets.slice(0);
    shuffle(nearbyOffsets);

    for (var i = 0; i < nearbyOffsets.length && distractors.length < 3; i++) {
        var off = nearbyOffsets[i];
        if (off === futuretime.offsetMinutes) continue;

        var totalStart = futuretime.startHour * 60 + futuretime.startMinute;
        var totalTarget = (totalStart + off) % 1440;
        var tH = Math.floor(totalTarget / 60);
        var tM = totalTarget % 60;

        var text;
        if (useDigital) {
            text = pad(tH) + ":" + pad(tM);
        } else {
            text = norwegianForTime(new Date(2026, 0, 1, tH, tM));
        }

        if (!seen[text]) {
            seen[text] = true;
            distractors.push(text);
        }
    }

    while (distractors.length < 3) {
        var rH = Math.floor(Math.random() * 24);
        var rM = [0, 15, 30, 45][Math.floor(Math.random() * 4)];
        var text;
        if (useDigital) {
            text = pad(rH) + ":" + pad(rM);
        } else {
            text = norwegianForTime(new Date(2026, 0, 1, rH, rM));
        }
        if (!seen[text]) {
            seen[text] = true;
            distractors.push(text);
        }
    }

    return distractors;
}

function renderFutureClockArea() {
    var clockArea = document.getElementById("future-clock-area");
    if (!clockArea) return;
    clockArea.innerHTML = "";

    if (futuretime.clockMode === "analog" || futuretime.clockMode === "begge") {
        var c = document.createElement("canvas");
        c.id = "future-canvas";
        c.width = 220;
        c.height = 220;
        clockArea.appendChild(c);
        drawFutureClock("future-canvas", futuretime.startHour, futuretime.startMinute);
    }

    if (futuretime.clockMode === "digital" || futuretime.clockMode === "begge") {
        var d = document.createElement("div");
        d.className = "big";
        d.textContent = pad(futuretime.startHour) + ":" + pad(futuretime.startMinute);
        clockArea.appendChild(d);
    }
}

function futureShowQuestion() {
    var q = generateFutureQuestion();
    renderFutureClockArea();

    document.getElementById("future-question-text").textContent = q.question;

    var optDiv = document.getElementById("future-options");
    optDiv.innerHTML = "";
    q.options.forEach(function(opt) {
        var btn = document.createElement("button");
        btn.className = "quiz-option";
        btn.textContent = opt;
        btn.onclick = function() { futureCheckAnswer(btn, opt); };
        optDiv.appendChild(btn);
    });

    document.getElementById("future-level-badge").textContent = futureLevelConfig[futuretime.level].label;

    var dotsDiv = document.getElementById("future-streak-dots");
    dotsDiv.innerHTML = "";
    for (var i = 0; i < futuretime.streakGoal; i++) {
        var dot = document.createElement("span");
        dot.className = "streak-dot" + (i < futuretime.streak ? " filled" : "");
        dotsDiv.appendChild(dot);
    }
}

function futureCheckAnswer(btn, selected) {
    var buttons = document.querySelectorAll("#future-options .quiz-option");
    buttons.forEach(function(b) { b.disabled = true; });

    if (selected === futuretime.correctAnswer) {
        btn.classList.add("correct");
        futuretime.streak++;
    } else {
        btn.classList.add("wrong");
        buttons.forEach(function(b) {
            if (b.textContent === futuretime.correctAnswer) b.classList.add("correct");
        });
        futuretime.streak = 0;
    }

    var dotsDiv = document.getElementById("future-streak-dots");
    dotsDiv.innerHTML = "";
    for (var i = 0; i < futuretime.streakGoal; i++) {
        var dot = document.createElement("span");
        dot.className = "streak-dot" + (i < futuretime.streak ? " filled" : "");
        dotsDiv.appendChild(dot);
    }

    setTimeout(function() {
        if (futuretime.streak >= futuretime.streakGoal) {
            futureOnStreakGoal();
        } else {
            futureShowQuestion();
        }
    }, 1200);
}

function futureOnStreakGoal() {
    document.getElementById("future-active").style.display = "none";
    var success = document.getElementById("future-success");
    success.style.display = "flex";
    showConfetti();

    var nextBtn = document.getElementById("future-next-btn");
    var repeatBtn = document.getElementById("future-repeat-btn");
    var menuBtn = document.getElementById("future-level-btn");

    if (futuretime.level < 5) {
        document.getElementById("future-success-msg").textContent =
            "Du kan nå nivå " + (futuretime.level + 1) + "!";
        nextBtn.style.display = "";
        repeatBtn.style.display = "";
        menuBtn.style.display = "";
    } else {
        document.getElementById("future-success-msg").textContent =
            "Du klarte alle nivåene! Fullført!";
        nextBtn.style.display = "none";
        repeatBtn.style.display = "";
        menuBtn.style.display = "";
    }
}

function futureShowStart() {
    document.getElementById("future-start").style.display = "";
    document.getElementById("future-active").style.display = "none";
    document.getElementById("future-success").style.display = "none";
    futuretime.active = false;

    var btns = document.querySelectorAll("#future-level-row .level-btn");
    btns.forEach(function(btn) {
        var lvl = parseInt(btn.dataset.level);
        if (lvl <= futuretime.unlockedLevel) {
            btn.classList.remove("locked");
        } else {
            btn.classList.add("locked");
        }
        btn.classList.toggle("active", lvl === futuretime.level);
    });
}

function futureStartGame() {
    futuretime.streak = 0;
    futuretime.active = true;
    document.getElementById("future-start").style.display = "none";
    document.getElementById("future-active").style.display = "";
    document.getElementById("future-success").style.display = "none";
    futureShowQuestion();
}

function futureNextLevel() {
    document.getElementById("future-success").style.display = "none";
    document.getElementById("future-active").style.display = "";
    futuretime.level = Math.min(futuretime.level + 1, 5);
    futuretime.streak = 0;
    futureShowQuestion();
}

function futureRepeatLevel() {
    document.getElementById("future-success").style.display = "none";
    document.getElementById("future-active").style.display = "";
    futuretime.streak = 0;
    futureShowQuestion();
}

function initFutureNav() {
    document.querySelectorAll("#future-level-row .level-btn").forEach(function(btn) {
        btn.addEventListener("click", function() {
            if (btn.classList.contains("locked")) return;
            document.querySelectorAll("#future-level-row .level-btn").forEach(function(b) {
                b.classList.remove("active");
            });
            btn.classList.add("active");
            futuretime.level = parseInt(btn.dataset.level);
        });
    });

    document.querySelectorAll("#future-mode-row .mode-btn").forEach(function(btn) {
        btn.addEventListener("click", function() {
            document.querySelectorAll("#future-mode-row .mode-btn").forEach(function(b) {
                b.classList.remove("active");
            });
            btn.classList.add("active");
            futuretime.clockMode = btn.dataset.mode;
        });
    });

    document.getElementById("future-start-btn").addEventListener("click", futureStartGame);
    document.getElementById("future-next-btn").addEventListener("click", futureNextLevel);
    document.getElementById("future-repeat-btn").addEventListener("click", futureRepeatLevel);
    document.getElementById("future-level-btn").addEventListener("click", futureShowStart);
}

initFutureNav();
futureShowStart();
