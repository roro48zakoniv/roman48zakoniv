// Файли Романа Горіна — interactions (v2)

(function () {
  'use strict';

  // ---------------- Hero slider ----------------
  const slider = document.getElementById('slider');
  const slides = Array.from(slider.querySelectorAll('.slide'));
  const dots = Array.from(slider.querySelectorAll('.dot'));
  let heroIdx = 0;
  let heroTimer = null;

  function showSlide(i) {
    heroIdx = (i + slides.length) % slides.length;
    slides.forEach((s, k) => s.classList.toggle('active', k === heroIdx));
    dots.forEach((d, k) => d.classList.toggle('active', k === heroIdx));
  }
  function startHero() {
    stopHero();
    heroTimer = setInterval(() => showSlide(heroIdx + 1), 5000);
  }
  function stopHero() {
    if (heroTimer) clearInterval(heroTimer);
    heroTimer = null;
  }
  document.getElementById('slidePrev').addEventListener('click', () => { showSlide(heroIdx - 1); startHero(); });
  document.getElementById('slideNext').addEventListener('click', () => { showSlide(heroIdx + 1); startHero(); });
  dots.forEach((d, i) => d.addEventListener('click', () => { showSlide(i); startHero(); }));
  slider.addEventListener('mouseenter', stopHero);
  slider.addEventListener('mouseleave', startHero);
  startHero();

  // Swipe gestures on slider (mobile)
  let touchStartX = null;
  slider.addEventListener('touchstart', (e) => { touchStartX = e.changedTouches[0].clientX; });
  slider.addEventListener('touchend', (e) => {
    if (touchStartX == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) showSlide(heroIdx + (dx < 0 ? 1 : -1));
    touchStartX = null;
  });

  // ---------------- Cards & filtering ----------------
  const grid = document.getElementById('grid');
  const allCards = Array.from(grid.querySelectorAll('.card'));
  const resultCount = document.getElementById('resultCount');
  const searchInput = document.getElementById('search');
  let currentFilter = 'all';

  function applyFilter() {
    const q = (searchInput.value || '').trim().toLowerCase();
    let visible = 0;
    allCards.forEach((card) => {
      const t = card.dataset.type;
      const name = (card.dataset.name || '').toLowerCase();
      const path = (card.dataset.path || '').toLowerCase();
      const matchType = currentFilter === 'all' || t === currentFilter;
      const matchQuery = !q || name.indexOf(q) !== -1 || path.indexOf(q) !== -1;
      const show = matchType && matchQuery;
      card.classList.toggle('hidden', !show);
      if (show) visible++;
    });
    resultCount.textContent = visible + ' елементів';
  }

  document.querySelectorAll('.filters .chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.filters .chip').forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      currentFilter = chip.dataset.filter;
      applyFilter();
    });
  });
  searchInput.addEventListener('input', applyFilter);

  // ---------------- Density toggle ----------------
  const densityBtn = document.getElementById('densityBtn');
  densityBtn.addEventListener('click', () => {
    const isCompact = grid.classList.toggle('compact');
    densityBtn.textContent = isCompact ? '⊞ просторо' : '⊞ компактно';
  });

  // ---------------- Shuffle ----------------
  document.getElementById('shuffleBtn').addEventListener('click', () => {
    const visible = allCards.filter((c) => !c.classList.contains('hidden'));
    for (let i = visible.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [visible[i], visible[j]] = [visible[j], visible[i]];
    }
    const frag = document.createDocumentFragment();
    visible.forEach((c) => frag.appendChild(c));
    grid.appendChild(frag);
  });

  // ---------------- Random meme (opens modal) ----------------
  document.getElementById('randomBtn').addEventListener('click', () => {
    const visible = allCards.filter((c) => !c.classList.contains('hidden') && c.dataset.type !== 'audio');
    const pool = visible.length ? visible : allCards.filter((c) => c.dataset.type !== 'audio');
    if (!pool.length) return;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    openModalForCard(pick);
  });

  // ---------------- Back to top ----------------
  const fab = document.getElementById('fab');
  document.getElementById('topBtn').addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  fab.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  window.addEventListener('scroll', () => {
    fab.hidden = window.scrollY < 600;
  });

  // ---------------- Copy buttons on cards ----------------
  function copyToClipboard(text, btn) {
    const ok = () => {
      if (!btn) return;
      const prev = btn.textContent;
      btn.textContent = '✓ скопійовано';
      btn.classList.add('ok');
      setTimeout(() => { btn.textContent = prev; btn.classList.remove('ok'); }, 1200);
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(ok).catch(() => fallback(text, ok));
    } else {
      fallback(text, ok);
    }
  }
  function fallback(text, after) {
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.left = '-9999px';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
    if (after) after();
  }
  grid.addEventListener('click', (e) => {
    const btn = e.target.closest('.copy-btn');
    if (!btn) return;
    e.stopPropagation();
    const card = btn.closest('.card');
    copyToClipboard(card.dataset.path || '', btn);
  });

  // ---------------- Modal ----------------
  const modal = document.getElementById('modal');
  const mStage = modal.querySelector('.m-stage');
  const mName = document.getElementById('mName');
  const mPath = document.getElementById('mPath');
  const mIndex = document.getElementById('mIndex');
  const mTotal = document.getElementById('mTotal');
  const mCopy = document.getElementById('mCopy');
  const mOpen = document.getElementById('mOpen');
  let modalList = [];
  let modalIdx = 0;

  function getCurrentList() {
    return allCards.filter((c) => !c.classList.contains('hidden') && c.dataset.type !== 'audio');
  }

  function renderModal() {
    const card = modalList[modalIdx];
    if (!card) return;
    const type = card.dataset.type;
    const src = card.dataset.src;
    const name = card.dataset.name;
    const path = card.dataset.path;

    mStage.innerHTML = '';
    if (type === 'image') {
      const img = document.createElement('img');
      img.src = src; img.alt = name;
      img.onerror = function () {
        mStage.innerHTML = '<div class="empty">не вдалося завантажити: ' + escapeHtml(path) + '</div>';
      };
      mStage.appendChild(img);
    } else if (type === 'video') {
      const v = document.createElement('video');
      v.src = src; v.controls = true; v.autoplay = true; v.playsInline = true;
      v.onerror = function () {
        mStage.innerHTML = '<div class="empty">відео недоступне: ' + escapeHtml(path) + '</div>';
      };
      mStage.appendChild(v);
    } else {
      const a = document.createElement('audio');
      a.src = src; a.controls = true; a.autoplay = true;
      a.onerror = function () {
        mStage.innerHTML = '<div class="empty">аудіо недоступне: ' + escapeHtml(path) + '</div>';
      };
      mStage.appendChild(a);
    }
    mName.textContent = name;
    mPath.textContent = path;
    mIndex.textContent = (modalIdx + 1);
    mTotal.textContent = modalList.length;
  }

  function openModalForCard(card) {
    modalList = getCurrentList();
    if (!modalList.length) modalList = allCards.filter((c) => c.dataset.type !== 'audio');
    const i = modalList.indexOf(card);
    modalIdx = i >= 0 ? i : 0;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    renderModal();
  }
  function closeModal() {
    modal.hidden = true;
    mStage.innerHTML = '';
    document.body.style.overflow = '';
  }
  function nextModal() { if (!modalList.length) return; modalIdx = (modalIdx + 1) % modalList.length; renderModal(); }
  function prevModal() { if (!modalList.length) return; modalIdx = (modalIdx - 1 + modalList.length) % modalList.length; renderModal(); }

  modal.querySelector('.m-close').addEventListener('click', closeModal);
  modal.querySelector('.m-prev').addEventListener('click', prevModal);
  modal.querySelector('.m-next').addEventListener('click', nextModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

  mCopy.addEventListener('click', () => copyToClipboard(mPath.textContent, mCopy));
  mOpen.addEventListener('click', () => {
    const card = modalList[modalIdx]; if (!card) return;
    window.open(card.dataset.src, '_blank');
  });

  // Touch swipe inside modal
  let mTouch = null;
  mStage.addEventListener('touchstart', (e) => { mTouch = e.changedTouches[0].clientX; });
  mStage.addEventListener('touchend', (e) => {
    if (mTouch == null) return;
    const dx = e.changedTouches[0].clientX - mTouch;
    if (Math.abs(dx) > 40) { if (dx < 0) nextModal(); else prevModal(); }
    mTouch = null;
  });

  // ---------------- Card click handlers ----------------
  grid.addEventListener('click', (e) => {
    if (e.target.closest('.copy-btn')) return;
    const card = e.target.closest('.card');
    if (!card) return;
    if (card.dataset.type === 'audio') return; // native controls only
    if (e.target.closest('audio') || e.target.closest('video')) return;
    openModalForCard(card);
  });

  // ---------------- Keyboard shortcuts ----------------
  document.addEventListener('keydown', (e) => {
    if (!modal.hidden) {
      if (e.key === 'Escape') { closeModal(); e.preventDefault(); }
      else if (e.key === 'ArrowRight') { nextModal(); e.preventDefault(); }
      else if (e.key === 'ArrowLeft') { prevModal(); e.preventDefault(); }
    } else {
      if (e.key === '/' && document.activeElement !== searchInput) {
        e.preventDefault(); searchInput.focus();
      } else if (e.key === 'ArrowRight' && document.activeElement === slider) {
        showSlide(heroIdx + 1);
      } else if (e.key === 'ArrowLeft' && document.activeElement === slider) {
        showSlide(heroIdx - 1);
      }
    }
  });

  function escapeHtml(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }

  // Initialize counts
  applyFilter();
})();
