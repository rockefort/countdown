let lastTarget = null;

const backgrounds = [];

function setRandomBackground() {
    document.body.style.backgroundImage = undefined;
}

//setRandomBackground();

// --------------------------
// Klokke-widget
// --------------------------

function updateClock() {
    let d = new Date();
    document.getElementById("clock").innerText =
        pad(d.getHours()) + ":" + pad(d.getMinutes()) + " - " +
        norwegianForTime(roundToNearestFiveMinutes(d));
}

setInterval(updateClock, 1000);
updateClock();

// --------------------------
// Dropdown
// --------------------------

function addOption(date) {
    let option = document.createElement("option");
    option.text =
        pad(date.getHours()) + ":" + pad(date.getMinutes()) + " - " +
        norwegianForTime(date);
    option.value = date.toISOString();
    document.getElementById("timeSelect").appendChild(option);
}

function createDropdown() {
    let select = document.getElementById("timeSelect");
    select.innerHTML = "";

    let start = ceilToFiveMinutes(new Date());

    // neste to timer - hvert 5 min
    let end = new Date(start.getTime() + 120 * 60000);

    let option = document.createElement("option");
    option.text = "";
    option.value = "";
    document.getElementById("timeSelect").appendChild(option);

    for (let d = new Date(start); d <= end; d.setMinutes(d.getMinutes() + 5)) {
        addOption(new Date(d));
    }

    let sep = document.createElement("option");
    sep.text = "──────────";
    sep.disabled = true;
    select.appendChild(sep);

    // Deretter halvtimer
    let half = new Date(start);
    if (half.getMinutes() < 30) {
        half.setMinutes(30);
    } else {
        half.setHours(half.getHours() + 1);
        half.setMinutes(0);
    }

    for (let i = 0; i < 12; i++) {
        addOption(new Date(half));
        half.setMinutes(half.getMinutes() + 30);
    }
}

createDropdown();

// --------------------------
// Countdown
// --------------------------

function setCountdown() {
    let select = document.getElementById("timeSelect");
    let option = select.options[select.selectedIndex];

    localStorage.setItem(
        "countdown",
        JSON.stringify({
            timestamp: option.value,
            description: option.text
        })
    );

    updateCountdown();
    updateTargetDigital();
}

function updateCountdown() {
    let raw = localStorage.getItem("countdown");
    if (!raw) return;

    let data = JSON.parse(raw);
    let target = new Date(data.timestamp);
    let diff = target - new Date();

    if (diff <= 0) {
        document.getElementById("remaining").innerText = "Nå";
        document.getElementById("approximate").innerText = "";
        return;
    }

    // TOTALT antall minutter
    let minutes = Math.floor(diff / 60000);

    let hours = Math.floor(minutes / 60);
    let mins = minutes % 60;

    document.getElementById("target").innerText = data.description;

    document.getElementById("remaining").innerText =
        hours + " t " + mins + " min igjen";

    document.getElementById("approximate").innerText =
        approximateRemaining(minutes);
}

function approximateRemaining(minutes) {
    let hours = Math.floor(minutes / 60);
    let rest = minutes % 60;

    // 5, 10, 15, 20, 30 og 45 er presise punkter.
    // På hver side av 30, 45 og 60: "litt mer enn / litt mindre enn".
    // Midtpunkt mellom 30 og 45 er 37.5, 23 og 31 er symmetriske rundt 30, 38 og 46 rundt 45.
    let quarters;
    if (rest < 2.5)          quarters = 0;
    else if (rest < 7.5)     quarters = 1;   // 5
    else if (rest < 12.5)    quarters = 2;   // 10
    else if (rest < 17.5)    quarters = 3;   // 15
    else if (rest < 22.5)    quarters = 4;   // 20
    else if (rest < 30)      quarters = 5;   // litt mindre enn en halvtime
    else if (rest < 30.5)    quarters = 6;   // en halvtime (30)
    else if (rest < 38)      quarters = 7;   // litt mer enn en halvtime
    else if (rest < 45)      quarters = 8;   // litt mindre enn tre kvarter
    else if (rest < 45.5)    quarters = 9;   // tre kvarter (45)
    else if (rest < 53)      quarters = 10;  // litt mer enn tre kvarter
    else                     quarters = 11;  // litt mindre enn en time

    let result = "";

    if (hours === 1) {
        result += "1 time";
    }
    else if (hours > 1) {
        result += hours + " timer";
    }

    if (quarters > 0 && hours > 0) {
        result += " og ";
    }

    switch (quarters) {
        case 1:
            result += "fem minutter";
            break;
        case 2:
            result += "ti minutter";
            break;
        case 3:
            result += "ett kvarter";
            break;
        case 4:
            result += "tjue minutter";
            break;
        case 5:
            result += "nesten en halvtime";
            break;
        case 6:
            result += "en halvtime";
            break;
        case 7:
            result += "litt mer enn en halvtime";
            break;
        case 8:
            result += "nesten tre kvarter";
            break;
        case 9:
            result += "tre kvarter";
            break;
        case 10:
            result += "litt mer enn tre kvarter";
            break;
        case 11:
            result += "nesten en time";
            break;
    }

    if (hours === 0 && quarters === 0) {
        return "Om noen minutter";
    }

    return result.charAt(0).toUpperCase() + result.slice(1);
}

function drawAnalogClock() {
    const canvas = document.getElementById("analogClock");
    const ctx = canvas.getContext("2d");
    const r = canvas.width / 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(r, r);

    // Clock face
    ctx.beginPath();
    ctx.arc(0, 0, r - 5, 0, Math.PI * 2);
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Numbers 1-12
    ctx.font = "20px -apple-system";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.strokeStyle = "pink";
    ctx.fillStyle = "pink";

    for (let i = 1; i <= 12; i++) {
        let angle = i * Math.PI / 6 - Math.PI / 2;
        let x = Math.cos(angle) * (r - 18);
        let y = Math.sin(angle) * (r - 18);
        ctx.fillText(i.toString(), x, y);
    }

    // Hands
    let now = new Date();

    let seconds = now.getSeconds();
    let minutes = now.getMinutes() + seconds / 60;
    let hours = (now.getHours() % 12) + minutes / 60;

    ctx.strokeStyle = "red";
    drawHand(ctx, hours * Math.PI / 6, r * 0.55, 7);

    ctx.strokeStyle = "#30D158";
    drawHand(ctx, minutes * Math.PI / 30, r * 0.73, 4);

    // Optional seconds hand
    ctx.strokeStyle = "#111166";   // iOS system green
    drawHand(ctx, seconds * Math.PI / 30, r * 0.70, 2);

    // Center dot
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

function drawTargetClock(minutesFromMidnight) {
    const canvas = document.getElementById("targetClock");
    const ctx = canvas.getContext("2d");
    const r = canvas.width / 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(r, r);

    ctx.strokeStyle = "white";
    ctx.fillStyle = "white";
    ctx.lineWidth = 2;

    // klokkehus
    ctx.beginPath();
    ctx.arc(0, 0, r - 5, 0, Math.PI * 2);
    ctx.stroke();

    // tall
    ctx.font = "20px -apple-system";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    for (let i = 1; i <= 12; i++) {
        let angle = i * Math.PI / 6 - Math.PI / 2;
        ctx.fillText(i, Math.cos(angle) * (r - 18), Math.sin(angle) * (r - 18));
    }

    let hours = (minutesFromMidnight / 60) % 12;
    let minutes = minutesFromMidnight % 60;

    ctx.strokeStyle = "red";
    drawHand(ctx, hours * Math.PI / 6, r * 0.45, 7);

    ctx.strokeStyle = "#30D158";
    drawHand(ctx, minutes * Math.PI / 30, r * 0.7, 4);

    // senter
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

function animateTargetClock() {
    updateTargetDigital();

    let raw = localStorage.getItem("countdown");
    if (!raw) return;

    let data = JSON.parse(raw);
    let target = new Date(data.timestamp);
    let now = new Date();

    let startMinutes = now.getHours() * 60 + now.getMinutes();
    let endMinutes = target.getHours() * 60 + target.getMinutes();

    // if target is before now (past midnight), sweep forward across midnight
    if (endMinutes < startMinutes) {
        endMinutes += 1440;
    }

    /*
        Timeline:

        0-3000ms:
            stå stille på nå

        3000-9000ms:
            animasjon

        9000-12000ms:
            stå stille på mål
    */

    const cycle = 12000;

    let elapsed = Date.now() % cycle;
    let displayMinutes;

    if (elapsed < 3000) {
        // start pause
        displayMinutes = startMinutes;
    }
    else if (elapsed < 9000) {
        // bevegelse
        let t = (elapsed - 3000) / 6000;
        let eased = easeInOut(t);
        displayMinutes = startMinutes + (endMinutes - startMinutes) * eased;
    }
    else {
        // mål pause
        displayMinutes = endMinutes;
    }

    drawTargetClock(displayMinutes);
    updateAnimatedDigital(displayMinutes);

    requestAnimationFrame(animateTargetClock);
}

function updateAnimatedDigital(minutes) {
    let h = Math.floor(minutes / 60) % 24;
    let m = Math.floor(minutes % 60);

    document.getElementById("targetDigital").innerText =
        String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0");
}

function easeInOut(t) {
    return t * t * (3 - 2 * t);
}

animateTargetClock();

function updateTargetDigital() {
    let raw = localStorage.getItem("countdown");
    if (!raw) return;

    // Nothing changed since last update
    if (raw === lastTarget) return;

    // Remember this version
    lastTarget = raw;

    let data = JSON.parse(raw);
    let target = new Date(data.timestamp);

    document.getElementById("targetDigital").innerText =
        target.toLocaleTimeString("no-NO", {
            hour: "2-digit",
            minute: "2-digit"
        });

    document.getElementById("targetDigitalText").innerText =
        data.description;
}

setInterval(() => {
    updateClock();
    drawAnalogClock();
}, 1000);

drawAnalogClock();

updateCountdown();
