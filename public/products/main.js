const { animate, stagger } = anime;

const filterListEl = document.getElementById('filterList');
const gridEl = document.getElementById('productGrid');
const heroEl = document.getElementById('hero');
const hero3dEl = document.getElementById('hero3d');

const HERO_COLS = 10;
const HERO_ROWS = 6;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let activeCategory = 'all';

/* ---------------- render: filters ---------------- */
function renderFilters() {
  filterListEl.innerHTML = CATEGORIES.map((c) => `
    <button class="filter-btn${c.id === activeCategory ? ' active' : ''}" data-category="${c.id}" type="button">
      ${c.label}
    </button>
  `).join('');

  filterListEl.querySelectorAll('.filter-btn').forEach((btn) => {
    btn.addEventListener('click', () => onFilterClick(btn.dataset.category));
  });
}

function onFilterClick(categoryId) {
  if (categoryId === activeCategory) return;
  activeCategory = categoryId;

  filterListEl.querySelectorAll('.filter-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.category === categoryId);
  });

  animate('.filter-btn.active', {
    scale: [0.9, 1],
    duration: 380,
    ease: 'outElastic(1, .6)',
  });

  const cards = gridEl.querySelectorAll('.card');
  if (cards.length === 0) {
    renderGrid();
    return;
  }

  animate(cards, {
    opacity: [1, 0],
    translateY: [0, -14],
    scale: [1, 0.96],
    duration: 260,
    delay: stagger(25),
    ease: 'inQuad',
    onComplete: renderGrid,
  });
}

/* ---------------- render: product cards ---------------- */
function cardTemplate(p) {
  const categoryLabel = CATEGORIES.find((c) => c.id === p.category)?.label || '';

  let mediaHtml;
  if (p.image) {
    mediaHtml = `<div class="card-media"><img src="${p.image}" alt="${p.name} 구성도" loading="lazy" onerror="this.closest('.card-media').classList.add('is-empty');this.remove();this.closest('.card-media').textContent='${p.name}'"></div>`;
  } else if (p.logo) {
    mediaHtml = `<div class="card-media is-logo"><img src="${p.logo}" alt="${p.name} 로고" loading="lazy" onerror="this.closest('.card-media').classList.add('is-empty');this.remove();this.closest('.card-media').textContent='${p.name}'"></div>`;
  } else {
    mediaHtml = `<div class="card-media is-empty">${p.name}</div>`;
  }

  const logoBadge = p.logo
    ? `<div class="card-logo"><img src="${p.logo}" alt="" loading="lazy" onerror="this.parentElement.remove()"></div>`
    : '';

  return `
    <article class="card" data-id="${p.id}">
      ${mediaHtml}
      <div class="card-top">
        ${logoBadge}
        <span class="card-category">${categoryLabel}</span>
      </div>
      <h3 class="card-name">${p.name}</h3>
      <p class="card-tagline">${p.tagline}</p>
      <p class="card-desc">${p.desc}</p>
      <div class="card-features">
        ${p.features.map((f) => `<span class="chip">${f}</span>`).join('')}
      </div>
      <a class="card-link" href="${p.link}" target="_blank" rel="noopener">
        자세히 보기 <span class="arrow">→</span>
      </a>
    </article>
  `;
}

let firstRender = true;

function playCardEntrance(cards) {
  animate(cards, {
    opacity: [0, 1],
    translateY: [26, 0],
    scale: [0.96, 1],
    duration: 560,
    delay: stagger(60),
    ease: 'outExpo',
  });
}

function renderGrid() {
  const list = activeCategory === 'all'
    ? PRODUCTS
    : PRODUCTS.filter((p) => p.category === activeCategory);

  gridEl.innerHTML = list.map(cardTemplate).join('');

  const cards = gridEl.querySelectorAll('.card');
  cards.forEach((card) => bindCardHover(card));

  if (firstRender) {
    firstRender = false;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        playCardEntrance(gridEl.querySelectorAll('.card'));
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.1 });
    observer.observe(gridEl);
  } else {
    playCardEntrance(cards);
  }
}

function bindCardHover(card) {
  card.addEventListener('mouseenter', () => {
    animate(card, {
      translateY: -8,
      scale: 1.02,
      duration: 320,
      ease: 'outQuad',
    });
  });
  card.addEventListener('mouseleave', () => {
    animate(card, {
      translateY: 0,
      scale: 1,
      duration: 320,
      ease: 'outQuad',
    });
  });
}

/* ---------------- hero entrance ---------------- */
function playHeroIntro() {
  animate('.hero-title .line', {
    translateY: ['110%', '0%'],
    opacity: [0, 1],
    duration: 900,
    delay: stagger(140),
    ease: 'outExpo',
  });

  animate('[data-reveal]', {
    opacity: [0, 1],
    translateY: [16, 0],
    duration: 700,
    delay: stagger(120, { start: 400 }),
    ease: 'outQuad',
  });

  document.querySelectorAll('.stat-num').forEach((el, i) => {
    const target = Number(el.dataset.count);
    const counter = { value: 0 };
    animate(counter, {
      value: target,
      duration: 1400,
      delay: 700 + i * 120,
      ease: 'outExpo',
      onUpdate: () => {
        el.textContent = Math.round(counter.value);
      },
    });
  });
}

/* ---------------- hero 3D shatter grid ---------------- */
function buildHero3D() {
  if (!hero3dEl) return;

  const total = HERO_COLS * HERO_ROWS;
  const tilesHtml = [];
  for (let i = 0; i < total; i++) {
    const rx = (Math.random() * 260 - 130).toFixed(1);
    const ry = (Math.random() * 260 - 130).toFixed(1);
    const tz = (Math.random() * -320).toFixed(1);
    const targetOpacity = i % 5 === 0 ? 0.42 : 0.16;
    tilesHtml.push(
      `<div class="tile" data-target-opacity="${targetOpacity}" style="transform:rotateX(${rx}deg) rotateY(${ry}deg) translateZ(${tz}px) scale(.4);"></div>`
    );
  }
  hero3dEl.innerHTML = tilesHtml.join('');

  const tiles = hero3dEl.querySelectorAll('.tile');

  if (prefersReducedMotion) {
    tiles.forEach((tile) => {
      tile.style.transform = 'none';
      tile.style.opacity = tile.getAttribute('data-target-opacity');
    });
    return;
  }

  animate(tiles, {
    rotateX: 0,
    rotateY: 0,
    translateZ: 0,
    scale: 1,
    opacity: (el) => el.getAttribute('data-target-opacity'),
    duration: 1600,
    delay: stagger(16, { grid: [HERO_COLS, HERO_ROWS], from: 'center' }),
    ease: 'outExpo',
    onComplete: () => {
      animate(tiles, {
        rotateY: [
          { to: '6deg', duration: 2250, ease: 'inOutSine' },
          { to: '-6deg', duration: 4500, ease: 'inOutSine' },
          { to: '0deg', duration: 2250, ease: 'inOutSine' },
        ],
        delay: stagger(40, { grid: [HERO_COLS, HERO_ROWS], from: 'center' }),
        loop: true,
      });
    },
  });
}

function initHeroParallax() {
  if (!heroEl || !hero3dEl || prefersReducedMotion) return;

  heroEl.addEventListener('mousemove', (e) => {
    const rect = heroEl.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width - 0.5;
    const relY = (e.clientY - rect.top) / rect.height - 0.5;
    hero3dEl.style.transform = `rotateX(${(-relY * 14).toFixed(2)}deg) rotateY(${(relX * 18).toFixed(2)}deg)`;
  });
  heroEl.addEventListener('mouseleave', () => {
    hero3dEl.style.transform = 'rotateX(0deg) rotateY(0deg)';
  });
}

/* ---------------- scroll reveal for sections ---------------- */
function initScrollReveal() {
  const targets = document.querySelectorAll('[data-scroll-reveal]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      animate(entry.target, {
        opacity: [0, 1],
        translateY: [24, 0],
        duration: 700,
        ease: 'outExpo',
      });
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.2 });

  targets.forEach((el) => observer.observe(el));
}

/* ---------------- init ---------------- */
document.addEventListener('DOMContentLoaded', () => {
  renderFilters();
  renderGrid();
  buildHero3D();
  initHeroParallax();
  playHeroIntro();
  initScrollReveal();
});
