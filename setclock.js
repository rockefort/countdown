// --------------------------
// Still klokka (Set the Clock)
// --------------------------

var setclock = {
    level: 1,
    clockMode: "analog",
    streak: 0,
    streakGoal: 3,
    unlockedLevel: 5,
    targetHour: null,
    targetMinute: null,
    currentHour: 12,
    currentMinute: 0,
    active: false
};

function timeOfDay(h) {
    if (h >= 0 && h < 6) return "på natten";
    if (h >= 6 && h < 12) return "om morgenen";
    if (h >= 12 && h < 18) return "på ettermiddagen";
    return "på kvelden";
}

var setclockLevelConfig = {
    1: { label: "Nivå 1 – heltimer",
         minutes: [0],
         describe: function(h, m) { return hourName(h) + " " + timeOfDay(h); } },
    2: { label: "Nivå 2 – + halv",
         minutes: [0, 30],
         describe: function(h, m) { return norwegianForTime(new Date(2026,0,1,h,m)) + " " + timeOfDay(h); } },
    3: { label: "Nivå 3 – + kvart",
         minutes: [0, 15, 30, 45],
         describe: function(h, m) { return norwegianForTime(new Date(2026,0,1,h,m)) + " " + timeOfDay(h); } },
    4: { label: "Nivå 4 – alle 5 min",
         minutes: [0,5,10,15,20,25,30,35,40,45,50,55],
         describe: function(h, m) { return norwegianForTime(new Date(2026,0,1,h,m)) + " " + timeOfDay(h); } },
    5: { label: "Nivå 5 – omtrentlig",
         minutes: [2,3,4,5,6,7,8,9,10,11,12,13,14,16,17,18,19,20,21,22,26,27,28,29,31,32,33,34,37,38,39,40,41,42,43,44,46,47,48,49,50,51,52,53],
         describe: function(h, m) { return norwegianApproximate(h, m) + " " + timeOfDay(h); } }
};

function drawSetClock(canvasId, hour, minute) {
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

function randomStart(targetH, targetM) {
    var cfg = setclockLevelConfig[setclock.level];
    var startM = cfg.minutes[Math.floor(Math.random() * cfg.minutes.length)];
    var startH = targetH;
    if (setclock.level === 1) {
        startH = (targetH + Math.floor(Math.random() * 5) - 2 + 24) % 24;
    } else {
        var offset = (Math.floor(Math.random() * 7) - 3) * 60;
        var totalStart = (targetH * 60 + targetM + offset + 1440) % 1440;
        startH = Math.floor(totalStart / 60) % 24;
        startM = cfg.minutes[Math.floor(Math.random() * cfg.minutes.length)];
    }
    return { hour: startH, minute: startM };
}

function generateSetClockQuestion() {
    var cfg = setclockLevelConfig[setclock.level];
    var h = Math.floor(Math.random() * 24);
    var m = cfg.minutes[Math.floor(Math.random() * cfg.minutes.length)];
    var correct = cfg.describe(h, m);
    setclock.targetHour = h;
    setclock.targetMinute = m;
    var start = randomStart(h, m);
    setclock.currentHour = start.hour;
    setclock.currentMinute = start.minute;
    return { hour: h, minute: m, prompt: correct };
}

function renderSetClockDisplay() {
    var clockArea = document.getElementById("setclock-clock-area");
    if (!clockArea) return;
    clockArea.innerHTML = "";

    if (setclock.clockMode === "analog" || setclock.clockMode === "begge") {
        var c = document.createElement("canvas");
        c.id = "setclock-canvas";
        c.width = 220;
        c.height = 220;
        clockArea.appendChild(c);
        drawSetClock("setclock-canvas", setclock.currentHour, setclock.currentMinute);
    }

    if (setclock.clockMode === "digital" || setclock.clockMode === "begge") {
        var d = document.createElement("div");
        d.className = "big";
        d.id = "setclock-digital";
        d.textContent = pad(setclock.currentHour) + ":" + pad(setclock.currentMinute);
        clockArea.appendChild(d);
    }
}

function updateSetClockDisplay() {
    var canvas = document.getElementById("setclock-canvas");
    if (canvas) {
        drawSetClock("setclock-canvas", setclock.currentHour, setclock.currentMinute);
    }
    var digital = document.getElementById("setclock-digital");
    if (digital) {
        digital.textContent = pad(setclock.currentHour) + ":" + pad(setclock.currentMinute);
    }
    document.getElementById("setclock-hour-value").textContent = pad(setclock.currentHour);
    document.getElementById("setclock-minute-value").textContent = pad(setclock.currentMinute);
}

function setClockShowQuestion() {
    var q = generateSetClockQuestion();
    document.getElementById("setclock-prompt").textContent = q.prompt;
    renderSetClockDisplay();
    updateSetClockDisplay();

    document.getElementById("setclock-level-badge").textContent = setclockLevelConfig[setclock.level].label;

    var dotsDiv = document.getElementById("setclock-streak-dots");
    dotsDiv.innerHTML = "";
    for (var i = 0; i < setclock.streakGoal; i++) {
        var dot = document.createElement("span");
        dot.className = "streak-dot" + (i < setclock.streak ? " filled" : "");
        dotsDiv.appendChild(dot);
    }
}

function setClockHourUp() {
    setclock.currentHour = (setclock.currentHour + 1) % 24;
    updateSetClockDisplay();
}

function setClockHourDown() {
    setclock.currentHour = (setclock.currentHour + 23) % 24;
    updateSetClockDisplay();
}

function setClockMinuteUp() {
    setclock.currentMinute = (setclock.currentMinute + 5) % 60;
    updateSetClockDisplay();
}

function setClockMinuteDown() {
    setclock.currentMinute = (setclock.currentMinute + 55) % 60;
    updateSetClockDisplay();
}

function checkSetClock() {
    var isCorrect = setclock.currentHour === setclock.targetHour && setclock.currentMinute === setclock.targetMinute;

    var clockArea = document.getElementById("setclock-clock-area");
    if (isCorrect) {
        clockArea.style.boxShadow = "0 0 30px 4px rgba(48,209,88,0.6)";
        clockArea.style.borderRadius = "16px";
        setclock.streak++;
    } else {
        clockArea.style.boxShadow = "0 0 30px 4px rgba(255,59,48,0.6)";
        clockArea.style.borderRadius = "16px";
        setclock.streak = 0;
        setTimeout(function() {
            setclock.currentHour = setclock.targetHour;
            setclock.currentMinute = setclock.targetMinute;
            updateSetClockDisplay();
        }, 600);
    }

    var dotsDiv = document.getElementById("setclock-streak-dots");
    dotsDiv.innerHTML = "";
    for (var i = 0; i < setclock.streakGoal; i++) {
        var dot = document.createElement("span");
        dot.className = "streak-dot" + (i < setclock.streak ? " filled" : "");
        dotsDiv.appendChild(dot);
    }

    setTimeout(function() {
        clockArea.style.boxShadow = "";
        if (setclock.streak >= setclock.streakGoal) {
            setClockOnStreakGoal();
        } else {
            setClockShowQuestion();
        }
    }, 1200);
}

function setClockOnStreakGoal() {
    document.getElementById("setclock-active").style.display = "none";
    var success = document.getElementById("setclock-success");
    success.style.display = "flex";
    showConfetti();

    var nextBtn = document.getElementById("setclock-next-btn");
    var repeatBtn = document.getElementById("setclock-repeat-btn");
    var menuBtn = document.getElementById("setclock-level-btn");

    if (setclock.level < 5) {
        document.getElementById("setclock-success-msg").textContent =
            "Du kan nå nivå " + (setclock.level + 1) + "!";
        nextBtn.style.display = "";
        repeatBtn.style.display = "";
        menuBtn.style.display = "";
    } else {
        document.getElementById("setclock-success-msg").textContent =
            "Du klarte alle nivåene! Fullført!";
        nextBtn.style.display = "none";
        repeatBtn.style.display = "";
        menuBtn.style.display = "";
    }
}

function setClockShowStart() {
    document.getElementById("setclock-start").style.display = "";
    document.getElementById("setclock-active").style.display = "none";
    document.getElementById("setclock-success").style.display = "none";
    setclock.active = false;

    var btns = document.querySelectorAll("#setclock-level-row .level-btn");
    btns.forEach(function(btn) {
        var lvl = parseInt(btn.dataset.level);
        if (lvl <= setclock.unlockedLevel) {
            btn.classList.remove("locked");
        } else {
            btn.classList.add("locked");
        }
        btn.classList.toggle("active", lvl === setclock.level);
    });
}

function setClockStartGame() {
    setclock.streak = 0;
    setclock.active = true;
    document.getElementById("setclock-start").style.display = "none";
    document.getElementById("setclock-active").style.display = "";
    document.getElementById("setclock-success").style.display = "none";
    setClockShowQuestion();
}

function setClockNextLevel() {
    document.getElementById("setclock-success").style.display = "none";
    document.getElementById("setclock-active").style.display = "";
    setclock.level = Math.min(setclock.level + 1, 5);
    setclock.streak = 0;
    setClockShowQuestion();
}

function setClockRepeatLevel() {
    document.getElementById("setclock-success").style.display = "none";
    document.getElementById("setclock-active").style.display = "";
    setclock.streak = 0;
    setClockShowQuestion();
}

function initSetClockNav() {
    document.querySelectorAll("#setclock-level-row .level-btn").forEach(function(btn) {
        btn.addEventListener("click", function() {
            if (btn.classList.contains("locked")) return;
            document.querySelectorAll("#setclock-level-row .level-btn").forEach(function(b) {
                b.classList.remove("active");
            });
            btn.classList.add("active");
            setclock.level = parseInt(btn.dataset.level);
        });
    });

    document.querySelectorAll("#setclock-mode-row .mode-btn").forEach(function(btn) {
        btn.addEventListener("click", function() {
            document.querySelectorAll("#setclock-mode-row .mode-btn").forEach(function(b) {
                b.classList.remove("active");
            });
            btn.classList.add("active");
            setclock.clockMode = btn.dataset.mode;
        });
    });

    document.getElementById("setclock-start-btn").addEventListener("click", setClockStartGame);
    document.getElementById("setclock-next-btn").addEventListener("click", setClockNextLevel);
    document.getElementById("setclock-repeat-btn").addEventListener("click", setClockRepeatLevel);
    document.getElementById("setclock-level-btn").addEventListener("click", setClockShowStart);
    document.getElementById("setclock-check-btn").addEventListener("click", checkSetClock);
    document.getElementById("setclock-hour-up").addEventListener("click", setClockHourUp);
    document.getElementById("setclock-hour-down").addEventListener("click", setClockHourDown);
    document.getElementById("setclock-minute-up").addEventListener("click", setClockMinuteUp);
    document.getElementById("setclock-minute-down").addEventListener("click", setClockMinuteDown);

    initSetClockDrag();
}

function initSetClockDrag() {
    var canvas = null;
    var dragging = false;
    var dragHand = null;

    function getAngleFromCenter(x, y, rect) {
        var cx = rect.width / 2;
        var cy = rect.height / 2;
        return Math.atan2(y - cy, x - cx);
    }

    function angleToMinute(angle) {
        var deg = (angle + Math.PI / 2) * 180 / Math.PI;
        if (deg < 0) deg += 360;
        var minute = Math.round(deg / 6) % 60;
        return minute;
    }

    function angleToHour(angle) {
        var deg = (angle + Math.PI / 2) * 180 / Math.PI;
        if (deg < 0) deg += 360;
        var hour12 = Math.round(deg / 30) % 12;
        return hour12;
    }

    function distToMinuteHand(x, y, rect) {
        var cx = rect.width / 2;
        var cy = rect.height / 2;
        var angle = setclock.currentMinute * Math.PI / 30 - Math.PI / 2;
        var handLen = rect.width / 2 * 0.73;
        var hx = cx + Math.cos(angle) * handLen;
        var hy = cy + Math.sin(angle) * handLen;
        return Math.sqrt((x - hx) * (x - hx) + (y - hy) * (y - hy));
    }

    function distToHourHand(x, y, rect) {
        var cx = rect.width / 2;
        var cy = rect.height / 2;
        var hour12 = setclock.currentHour % 12 + setclock.currentMinute / 60;
        var angle = hour12 * Math.PI / 6 - Math.PI / 2;
        var handLen = rect.width / 2 * 0.55;
        var hx = cx + Math.cos(angle) * handLen;
        var hy = cy + Math.sin(angle) * handLen;
        return Math.sqrt((x - hx) * (x - hx) + (y - hy) * (y - hy));
    }

    function onPointerDown(e) {
        var c = document.getElementById("setclock-canvas");
        if (!c) return;
        canvas = c;
        dragging = true;
        var rect = canvas.getBoundingClientRect();
        var x = (e.clientX || e.touches[0].clientX) - rect.left;
        var y = (e.clientY || e.touches[0].clientY) - rect.top;
        var dM = distToMinuteHand(x, y, rect);
        var dH = distToHourHand(x, y, rect);
        dragHand = (dM < dH) ? "minute" : "hour";
        e.preventDefault();
    }

    function onPointerMove(e) {
        if (!dragging || !canvas) return;
        var rect = canvas.getBoundingClientRect();
        var x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
        var y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
        var angle = getAngleFromCenter(x, y, rect);
        if (dragHand === "minute") {
            setclock.currentMinute = angleToMinute(angle);
            setclock.currentMinute = Math.round(setclock.currentMinute / 5) * 5;
            setclock.currentMinute = setclock.currentMinute % 60;
        } else {
            var hour12 = angleToHour(angle);
            setclock.currentHour = (setclock.currentHour % 12 === hour12)
                ? setclock.currentHour
                : Math.floor(setclock.currentHour / 12) * 12 + hour12;
        }
        updateSetClockDisplay();
    }

    function onPointerUp() {
        dragging = false;
        dragHand = null;
        canvas = null;
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("mousemove", onPointerMove);
    document.addEventListener("mouseup", onPointerUp);
    document.addEventListener("touchstart", onPointerDown, { passive: false });
    document.addEventListener("touchmove", onPointerMove, { passive: false });
    document.addEventListener("touchend", onPointerUp);
}

initSetClockNav();
setClockShowStart();
