# Roland Yang — Portfolio

Static website: plain HTML / CSS / JS, no build step, no dependencies.
All images and videos are stored locally in `assets/` (mirrored from the old Carbonmade site).

```
index.html        Home: hero reel, project grid with filters, contact
project.html      Project page (renders ?p=<slug> from js/data.js)
resume.html       Resume (button saves it as PDF via the browser's print dialog)
css/style.css     All styles (colors at the top under :root)
js/data.js        ALL project content: edit this to add / change projects
js/app.js         Rendering, filters, lightbox, lazy video
assets/work/<slug>/   Project images and videos
assets/img/           Hero reel, profile photo, logos, share image
```

## Preview locally

Double-click `index.html`, or run a local server:

```powershell
python -m http.server 8080
```

then open http://localhost:8080

## Add a project

1. Put media in `assets/work/<new-slug>/` (a square `cover.webp`/`.jpg` plus images/videos).
2. Copy an existing entry in `js/data.js` and edit it. Block types:
   - `{ "type": "section", "title": "...", "text": "..." }`: big sub-heading
   - `{ "type": "label", "text": "..." }`: small heading
   - `{ "type": "text", "text": "para 1\n\npara 2" }`
   - `{ "type": "tags", "items": ["Idea", "Modeling"] }`
   - `{ "type": "media", "items": [ { "type": "image", "src": "...", "w": 1920, "h": 1080 } ], "caption": "..." }`
     media item types: `image`, `video` (needs `poster`), `loop` (silent autoplay mp4)
   - `{ "type": "credits", "items": [["Director", "Name"], ...] }`

## Media protection

Everything on a public website can be downloaded; these measures only reduce the value of what is taken.

- Published media is reduced: images max 1600 px wide, videos 540p, with a small "© Roland Yang" watermark bottom-left.
- Full-resolution originals are kept **only on this computer** in `_originals/` (git-ignored, never uploaded).
  Back that folder up somewhere else too.
- New media: export at web size and add a watermark before putting it in `assets/work/`.
- The email address is assembled by JavaScript (`data-u` / `data-d` attributes) so spam bots can't read it from the HTML.
- Right-click save and the video download button are disabled. This only stops casual visitors.

## Publish

Live at https://rolandyang.com (domain on Cloudflare, DNS only) from the repo `ry149/ry149.github.io` (GitHub Pages, branch `main`).
To update: commit and push to `main`; the site rebuilds in about a minute. Keep each file under 100 MB.

If the site address changes, update `og:image` in the three HTML files to the new absolute URL
(currently `https://rolandyang.com/assets/img/og.jpg`) so link previews show the image.
