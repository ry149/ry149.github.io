/* Roland Yang — Portfolio. No build step, no dependencies. */
(function () {
  'use strict';

  const PROJECTS = window.PROJECTS || [];
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const CJK = /[㐀-鿿]/;

  const ICON = {
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7M8 7h9v9"/></svg>',
    left: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>',
    right: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>',
    back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>',
  };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  /* Paragraphs: blank line = new paragraph; tag Chinese ones for nicer line-height. */
  function paras(text) {
    return String(text || '')
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p) => `<p${CJK.test(p) && cjkRatio(p) > 0.3 ? ' lang="zh-Hant"' : ''}>${esc(p).replace(/\n/g, '<br>')}</p>`)
      .join('');
  }
  function cjkRatio(s) {
    const m = s.match(/[㐀-鿿]/g);
    return m ? m.length / s.replace(/\s/g, '').length : 0;
  }

  /* ---------- Header shadow on scroll ---------- */
  const header = $('.site-header');
  if (header) {
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Reveal on scroll ---------- */
  const revealIO = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries) => {
        entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); revealIO.unobserve(e.target); } });
      }, { rootMargin: '0px 0px -8% 0px' })
    : null;
  function reveal(root = document) {
    $$('.reveal:not(.in)', root).forEach((el) => (revealIO ? revealIO.observe(el) : el.classList.add('in')));
  }

  /* ---------- Lazy autoplay for looping clips ---------- */
  const loopIO = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          const v = e.target;
          if (e.isIntersecting) {
            if (!v.src && v.dataset.src) v.src = v.dataset.src;
            const p = v.play(); if (p && p.catch) p.catch(() => {});
          } else if (!v.paused) v.pause();
        });
      }, { rootMargin: '200px' })
    : null;
  function wireLoops(root = document) {
    $$('video[data-loop]', root).forEach((v) => {
      if (loopIO) loopIO.observe(v); else { v.src = v.dataset.src; v.play(); }
    });
  }

  /* ==========================================================
     HOME
     ========================================================== */
  function renderHome() {
    const grid = $('#grid');
    if (!grid) return;
    grid.innerHTML = PROJECTS.map((p, i) => `
      <a class="card reveal" href="project.html?p=${encodeURIComponent(p.slug)}" data-cat="${esc(p.category)}" style="transition-delay:${(i % 3) * 70}ms">
        <div class="thumb"><img src="${esc(p.cover)}" alt="${esc(p.title)}" loading="${i < 3 ? 'eager' : 'lazy'}" width="960" height="960"></div>
        <div class="info">
          <div><h3>${esc(p.title)}</h3><div class="meta">${esc(p.category)}${p.year ? ' · ' + esc(p.year) : ''}</div></div>
          <span class="arrow">${ICON.arrow}</span>
        </div>
      </a>`).join('');

    // Filters
    const cats = ['All'];
    PROJECTS.forEach((p) => { if (p.category && !cats.includes(p.category)) cats.push(p.category); });
    const filters = $('#filters');
    filters.innerHTML = cats.map((c) => {
      const n = c === 'All' ? PROJECTS.length : PROJECTS.filter((p) => p.category === c).length;
      return `<button type="button" data-cat="${esc(c)}" aria-pressed="${c === 'All'}">${esc(c)}<span class="count">${n}</span></button>`;
    }).join('');
    filters.addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      const cat = b.dataset.cat;
      $$('button', filters).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      $$('.card', grid).forEach((c) => {
        c.classList.toggle('hidden', cat !== 'All' && c.dataset.cat !== cat);
        c.classList.add('in');
      });
    });
    reveal();
  }

  /* ==========================================================
     PROJECT
     ========================================================== */
  function mediaHTML(m) {
    const ratio = `aspect-ratio:${m.w}/${m.h}`;
    if (m.type === 'image') {
      return `<div class="media"><img src="${esc(m.src)}" width="${m.w}" height="${m.h}" loading="lazy" decoding="async" alt="" data-zoom></div>`;
    }
    if (m.type === 'loop') {
      return `<div class="media" style="${ratio}"><video data-loop data-src="${esc(m.src)}" muted loop playsinline preload="none" width="${m.w}" height="${m.h}"></video></div>`;
    }
    return `<div class="media" style="${ratio}"><video controls controlslist="nodownload" disablepictureinpicture playsinline preload="none" poster="${esc(m.poster)}" src="${esc(m.src)}" width="${m.w}" height="${m.h}"></video></div>`;
  }

  function blockHTML(b) {
    switch (b.type) {
      case 'section':
        return `<div class="blk blk-section reveal"><h2>${esc(b.title)}</h2>${b.text ? `<p>${esc(b.text).replace(/\n/g, '<br>')}</p>` : ''}</div>`;
      case 'label':
        return `<h3 class="blk blk-label reveal">${esc(b.text).replace(/\n/g, '<br>')}</h3>`;
      case 'text':
        return `<div class="blk prose reveal">${paras(b.text)}</div>`;
      case 'tags':
        return `<div class="blk tags reveal">${b.items.map((t) => `<span class="chip">${esc(t)}</span>`).join('')}</div>`;
      case 'credits':
        return `<div class="blk credits reveal">${b.items.map(([k, v]) => `<div><b>${esc(k)}</b><span>${esc(v).replace(/\n/g, '<br>')}</span></div>`).join('')}</div>`;
      case 'media': {
        const items = b.items || [];
        const cap = b.caption ? `<figcaption>${esc(b.caption)}</figcaption>` : '';
        if (items.length === 1) return `<figure class="blk reveal">${mediaHTML(items[0])}${cap}</figure>`;
        const cols = Math.min(items.length, items.length === 4 ? 2 : items.length > 4 ? 3 : items.length);
        return `<figure class="blk reveal"><div class="gallery" style="--cols:${cols}">${items.map(mediaHTML).join('')}</div>${cap}</figure>`;
      }
      default:
        return '';
    }
  }

  function renderProject() {
    const root = $('#project');
    if (!root) return;
    const slug = new URLSearchParams(location.search).get('p');
    const idx = PROJECTS.findIndex((p) => p.slug === slug);
    if (idx < 0) { location.replace('index.html#work'); return; }
    const p = PROJECTS[idx];
    document.title = `${p.title} — Roland Yang`;

    const meta = [
      ['Role', p.role], ['Client', p.client], ['Date', p.date || p.year], ['Type', p.category],
      ['Link', p.link ? `<a href="${esc(p.link)}" target="_blank" rel="noopener">${esc(p.link.replace(/^https?:\/\//, '').replace(/\/$/, ''))}</a>` : ''],
    ].filter(([, v]) => v);

    const prev = PROJECTS[(idx - 1 + PROJECTS.length) % PROJECTS.length];
    const next = PROJECTS[(idx + 1) % PROJECTS.length];

    root.innerHTML = `
      <section class="project-hero">
        <a class="back" href="index.html#work">${ICON.back} All work</a>
        <div class="eyebrow">${esc(p.category)}${p.year ? ' · ' + esc(p.year) : ''}</div>
        <h1>${esc(p.title)}</h1>
        <dl class="meta-grid">${meta.map(([k, v]) => `<div><dt>${k}</dt><dd>${k === 'Link' ? v : esc(v)}</dd></div>`).join('')}</dl>
        ${p.description ? `<div class="intro-text"><div class="label">Overview</div><div class="prose">${paras(p.description)}</div></div>` : ''}
      </section>
      <section class="blocks">${(p.blocks || []).map(blockHTML).join('')}</section>
      <nav class="pager" aria-label="More projects">
        <a class="prev" href="project.html?p=${encodeURIComponent(prev.slug)}"><small>← Previous</small><strong>${esc(prev.title)}</strong></a>
        <a class="next" href="project.html?p=${encodeURIComponent(next.slug)}"><small>Next →</small><strong>${esc(next.title)}</strong></a>
      </nav>`;

    // Only one video with sound plays at a time
    root.addEventListener('play', (e) => {
      if (e.target.tagName !== 'VIDEO' || e.target.hasAttribute('data-loop')) return;
      $$('video[controls]', root).forEach((v) => { if (v !== e.target) v.pause(); });
    }, true);

    wireLoops(root);
    reveal(root);
    initLightbox($$('img[data-zoom]', root));
  }

  /* ---------- Lightbox ---------- */
  function initLightbox(imgs) {
    if (!imgs.length) return;
    const lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.innerHTML = `<img alt=""><button class="lb-close" aria-label="Close">${ICON.close}</button>
      <button class="lb-prev" aria-label="Previous">${ICON.left}</button><button class="lb-next" aria-label="Next">${ICON.right}</button>
      <div class="lb-count"></div>`;
    document.body.appendChild(lb);
    const img = $('img', lb);
    let i = 0;
    const show = (n) => {
      i = (n + imgs.length) % imgs.length;
      img.src = imgs[i].currentSrc || imgs[i].src;
      $('.lb-count', lb).textContent = `${i + 1} / ${imgs.length}`;
    };
    const open = (n) => { show(n); lb.classList.add('open'); document.body.style.overflow = 'hidden'; $('.lb-close', lb).focus(); };
    const close = () => { lb.classList.remove('open'); document.body.style.overflow = ''; imgs[i].focus?.(); };
    imgs.forEach((el, n) => el.addEventListener('click', () => open(n)));
    $('.lb-close', lb).addEventListener('click', close);
    $('.lb-prev', lb).addEventListener('click', () => show(i - 1));
    $('.lb-next', lb).addEventListener('click', () => show(i + 1));
    lb.addEventListener('click', (e) => { if (e.target === lb) close(); });
    document.addEventListener('keydown', (e) => {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(i - 1);
      if (e.key === 'ArrowRight') show(i + 1);
    });
  }

  /* ==========================================================
     RESUME — "selected work" thumbnails pulled from project data
     ========================================================== */
  function renderResumeWorks() {
    const el = $('#resume-works');
    if (!el) return;
    el.innerHTML = PROJECTS.map((p) => `
      <a class="work-link" href="project.html?p=${encodeURIComponent(p.slug)}">
        <img src="${esc(p.cover)}" alt="" loading="lazy">
        <div><strong>${esc(p.title)}</strong><span>${esc(p.category)}${p.year ? ' · ' + esc(p.year) : ''}</span></div>
      </a>`).join('');
  }

  /* ---------- Boot ---------- */
  const yr = $('#year'); if (yr) yr.textContent = new Date().getFullYear();
  // Email is assembled here so address-harvesting bots don't find it in the HTML.
  $$('a[data-u][data-d]').forEach((a) => {
    const addr = `${a.dataset.u}@${a.dataset.d}`;
    a.href = `mailto:${addr}`;
    if (a.hasAttribute('data-show')) a.textContent = addr;
  });
  // Discourage casual "Save image / Save video as…" (not real protection, see README).
  document.addEventListener('contextmenu', (e) => {
    if (e.target.closest('.media, .lightbox, .hero-media, .thumb')) e.preventDefault();
  });
  document.addEventListener('dragstart', (e) => {
    if (e.target.closest('.media, .lightbox, .thumb')) e.preventDefault();
  });
  const reel = $('#reel');
  if (reel && window.matchMedia('(prefers-reduced-motion: reduce)').matches) { reel.removeAttribute('autoplay'); reel.pause(); }
  renderHome();
  renderProject();
  renderResumeWorks();
  wireLoops();
  reveal();
  $$('[data-print]').forEach((b) => b.addEventListener('click', () => window.print()));
})();
