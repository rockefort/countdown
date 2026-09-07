// --------------------------
// Fellesskap: side-navigasjon
// --------------------------

function showPage(name) {
    document.querySelectorAll('.page').forEach(function(p) {
        p.classList.toggle('active', p.id === 'page-' + name);
    });
    document.querySelectorAll('.nav-item').forEach(function(n) {
        n.classList.toggle('active', n.dataset.page === name);
    });
}

// --------------------------
// Norske klokkeslett
// --------------------------

const numbers = [
    "tolv",
    "ett",
    "to",
    "tre",
    "fire",
    "fem",
    "seks",
    "sju",
    "åtte",
    "ni",
    "ti",
    "elleve"
];

function hourName(h) {
    return numbers[h % 12];
}

function norwegianForTime(date) {
    let h = date.getHours();
    let m = date.getMinutes();

    switch (m) {
        case 0:
            return hourName(h) + " presis";
        case 5:
            return "fem over " + hourName(h);
        case 10:
            return "ti over " + hourName(h);
        case 15:
            return "kvart over " + hourName(h);
        case 20:
            return "ti på halv " + hourName(h + 1);
        case 25:
            return "fem på halv " + hourName(h + 1);
        case 30:
            return "halv " + hourName(h + 1);
        case 35:
            return "fem over halv " + hourName(h + 1);
        case 40:
            return "ti over halv " + hourName(h + 1);
        case 45:
            return "kvart på " + hourName(h + 1);
        case 50:
            return "ti på " + hourName(h + 1);
        case 55:
            return "fem på " + hourName(h + 1);
        default:
            return "";
    }
}

function norwegianApproximate(hour, minute) {
    var hh = hourName(hour);
    var nxt = hourName(hour + 1);
    if (minute < 3)          return "like over " + hh;
    else if (minute < 7.5)   return "fem minutter over " + hh;
    else if (minute < 12.5)  return "ti over " + hh;
    else if (minute < 17.5)  return "kvart over " + hh;
    else if (minute < 22.5)  return "ti på halv " + nxt;
    else if (minute < 30)    return "snart halv " + nxt;
    else if (minute < 30.5)  return "halv " + nxt;
    else if (minute < 37.5)  return "fem over halv " + nxt;
    else if (minute < 40)    return "snart ti over halv " + nxt;
    else if (minute < 42.5)  return "ti over halv " + nxt;
    else if (minute < 45)    return "snart kvart på " + nxt;
    else if (minute < 47.5)  return "kvart på " + nxt;
    else if (minute < 50)    return "snart ti på " + nxt;
    else if (minute < 52.5)  return "ti på " + nxt;
    else                        return "snart fem på " + nxt;
}

// always next 5-minute mark
function ceilToFiveMinutes(date) {
    let d = new Date(date);
    d.setSeconds(0);
    d.setMilliseconds(0);

    let minutes = d.getMinutes();
    let rounded = Math.ceil(minutes / 5) * 5;

    if (rounded === 60) {
        d.setHours(d.getHours() + 1);
        rounded = 0;
    }

    d.setMinutes(rounded);
    return d;
}

function roundToNearestFiveMinutes(date) {
    let d = new Date(date);
    let minutes = d.getMinutes();
    let rounded = Math.round(minutes / 5) * 5;

    if (rounded === 60) {
        d.setHours(d.getHours() + 1);
        rounded = 0;
    }

    d.setMinutes(rounded);
    d.setSeconds(0);
    d.setMilliseconds(0);
    return d;
}

function pad(n) {
    return n.toString().padStart(2, "0");
}

// --------------------------
// Klokke-canvas-hjelper
// --------------------------

function drawHand(ctx, angle, length, width) {
    ctx.beginPath();
    ctx.lineWidth = width;
    ctx.moveTo(0, 0);
    ctx.rotate(angle - Math.PI / 2);
    ctx.lineTo(length, 0);
    ctx.stroke();
    ctx.rotate(-(angle - Math.PI / 2));
}
