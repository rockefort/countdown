// --------------------------
// Grill-Me Quiz
// --------------------------

var quiz = {
    level: 1,
    clockMode: "analog",
    streak: 0,
    streakGoal: 3,
    unlockedLevel: 5,
    targetHour: null,
    targetMinute: null,
    correctAnswer: "",
    active: false
};

var levelConfig = {
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

function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = arr[i];
        arr[i] = arr[j];
        arr[j] = tmp;
    }
    return arr;
}

function generateDistractors(correctText, level) {
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
    shuffle(allDescriptions);
    return allDescriptions.slice(0, 3);
}

function generateQuestion() {
    var cfg = levelConfig[quiz.level];
    var h = Math.floor(Math.random() * 24);
    var m = cfg.minutes[Math.floor(Math.random() * cfg.minutes.length)];
    var correct = cfg.describe(h, m);
    var distractors = generateDistractors(correct, quiz.level);
    var options = shuffle([correct].concat(distractors));
    quiz.targetHour = h;
    quiz.targetMinute = m;
    quiz.correctAnswer = correct;
    return { hour: h, minute: m, options: options, correct: correct };
}

function drawQuizClock(canvasId, hour, minute) {
    var canvas = document.getElementById(canvasId);
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

function showQuestion() {
    var q = generateQuestion();
    var clockArea = document.getElementById("quiz-clock-area");
    clockArea.innerHTML = "";

    if (quiz.clockMode === "analog" || quiz.clockMode === "begge") {
        var c = document.createElement("canvas");
        c.id = "quiz-canvas";
        c.width = 220;
        c.height = 220;
        clockArea.appendChild(c);
        drawQuizClock("quiz-canvas", q.hour, q.minute);
    }

    if (quiz.clockMode === "digital" || quiz.clockMode === "begge") {
        var d = document.createElement("div");
        d.className = "big";
        d.textContent = pad(q.hour) + ":" + pad(q.minute);
        clockArea.appendChild(d);
    }

    var optDiv = document.getElementById("quiz-options");
    optDiv.innerHTML = "";
    q.options.forEach(function(opt) {
        var btn = document.createElement("button");
        btn.className = "quiz-option";
        btn.textContent = opt;
        btn.onclick = function() { checkAnswer(btn, opt); };
        optDiv.appendChild(btn);
    });

    document.getElementById("quiz-level-badge").textContent = levelConfig[quiz.level].label;

    var dotsDiv = document.getElementById("quiz-streak-dots");
    dotsDiv.innerHTML = "";
    for (var i = 0; i < quiz.streakGoal; i++) {
        var dot = document.createElement("span");
        dot.className = "streak-dot" + (i < quiz.streak ? " filled" : "");
        dotsDiv.appendChild(dot);
    }
}

function checkAnswer(btn, selected) {
    var buttons = document.querySelectorAll("#quiz-options .quiz-option");
    buttons.forEach(function(b) { b.disabled = true; });

    if (selected === quiz.correctAnswer) {
        btn.classList.add("correct");
        quiz.streak++;
    } else {
        btn.classList.add("wrong");
        buttons.forEach(function(b) {
            if (b.textContent === quiz.correctAnswer) b.classList.add("correct");
        });
        quiz.streak = 0;
    }

    var dotsDiv = document.getElementById("quiz-streak-dots");
    dotsDiv.innerHTML = "";
    for (var i = 0; i < quiz.streakGoal; i++) {
        var dot = document.createElement("span");
        dot.className = "streak-dot" + (i < quiz.streak ? " filled" : "");
        dotsDiv.appendChild(dot);
    }

    setTimeout(function() {
        if (quiz.streak >= quiz.streakGoal) {
            onStreakGoal();
        } else {
            showQuestion();
        }
    }, 1200);
}

function onStreakGoal() {
    document.getElementById("quiz-active").style.display = "none";
    var success = document.getElementById("quiz-success");
    success.style.display = "flex";

    var nextBtn = document.getElementById("quiz-next-btn");
    var repeatBtn = document.getElementById("quiz-repeat-btn");
    var menuBtn = document.getElementById("quiz-level-btn");

    if (quiz.level < 5) {
        document.getElementById("quiz-success-msg").textContent =
            "Du kan nå nivå " + (quiz.level + 1) + "!";
        nextBtn.style.display = "";
        repeatBtn.style.display = "";
        menuBtn.style.display = "";
    } else {
        document.getElementById("quiz-success-msg").textContent =
            "Du klarte alle nivåene! Fullført!";
        nextBtn.style.display = "none";
        repeatBtn.style.display = "";
        menuBtn.style.display = "";
    }
}

function showStart() {
    document.getElementById("quiz-start").style.display = "";
    document.getElementById("quiz-active").style.display = "none";
    document.getElementById("quiz-success").style.display = "none";
    quiz.active = false;

    var btns = document.querySelectorAll("#level-row .level-btn");
    btns.forEach(function(btn) {
        var lvl = parseInt(btn.dataset.level);
        if (lvl <= quiz.unlockedLevel) {
            btn.classList.remove("locked");
        } else {
            btn.classList.add("locked");
        }
        btn.classList.toggle("active", lvl === quiz.level);
    });
}

function startQuiz() {
    quiz.streak = 0;
    quiz.active = true;
    document.getElementById("quiz-start").style.display = "none";
    document.getElementById("quiz-active").style.display = "";
    document.getElementById("quiz-success").style.display = "none";
    showQuestion();
}

function nextLevel() {
    document.getElementById("quiz-success").style.display = "none";
    document.getElementById("quiz-active").style.display = "";
    quiz.level = Math.min(quiz.level + 1, 5);
    quiz.streak = 0;
    showQuestion();
}

function repeatLevel() {
    document.getElementById("quiz-success").style.display = "none";
    document.getElementById("quiz-active").style.display = "";
    quiz.streak = 0;
    showQuestion();
}

function initQuizNav() {
    document.querySelectorAll("#level-row .level-btn").forEach(function(btn) {
        btn.addEventListener("click", function() {
            if (btn.classList.contains("locked")) return;
            document.querySelectorAll("#level-row .level-btn").forEach(function(b) {
                b.classList.remove("active");
            });
            btn.classList.add("active");
            quiz.level = parseInt(btn.dataset.level);
        });
    });

    document.querySelectorAll("#mode-row .mode-btn").forEach(function(btn) {
        btn.addEventListener("click", function() {
            document.querySelectorAll("#mode-row .mode-btn").forEach(function(b) {
                b.classList.remove("active");
            });
            btn.classList.add("active");
            quiz.clockMode = btn.dataset.mode;
        });
    });

    document.getElementById("quiz-start-btn").addEventListener("click", startQuiz);
    document.getElementById("quiz-next-btn").addEventListener("click", nextLevel);
    document.getElementById("quiz-repeat-btn").addEventListener("click", repeatLevel);
    document.getElementById("quiz-level-btn").addEventListener("click", showStart);
}

initQuizNav();
showStart();
