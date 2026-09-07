# ADR-0001: SPA Sidebar Navigation for Games

## Status

Accepted

## Context

The app originally was a single-page widget ("Nå") showing the current time and a countdown. New learning games (Quiz, Still klokka, Hva er klokken om) were added over time and needed a way to switch between them.

## Decision

Use a single-page application (SPA) with a fixed left sidebar navigation. Each feature lives in its own top-level `.page` div, toggled by a global `showPage(name)` function in `shared.js`:

```js
function showPage(name) {
    document.querySelectorAll('.page').forEach(function(p) {
        p.classList.toggle('active', p.id === 'page-' + name);
    });
    document.querySelectorAll('.nav-item').forEach(function(n) {
        n.classList.toggle('active', n.dataset.page === name);
    });
}
```

Nav items carry a `data-page` attribute matching the corresponding `#page-{name}` div.

## Consequences

- Pages must be **top-level siblings** of `.content` — nesting pages inside other pages breaks `showPage()` because it only queries top-level `.page` elements.
- Each page is independently styled and scripted; shared styles live in `style.css`, shared utilities (time formatting, clock drawing) live in `shared.js`.
- No routing library or framework dependency.
