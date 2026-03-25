// ==================== GUEST NAME FROM URL ====================
function normalizeGuestName(value: string): string {
  return value
    .replace(/[+_]/g, ' ')
    .replace(/%20/gi, ' ')
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getGuestNameFromHash(): string | null {
  const hash = window.location.hash.replace(/^#/, '').trim();

  if (!hash) {
    return null;
  }

  const hashParams = new URLSearchParams(hash);
  const keys = ['to', 'guest', 'nama', 'tamu', 'untuk'];

  for (const key of keys) {
    const value = hashParams.get(key);

    if (value) {
      return normalizeGuestName(value);
    }
  }

  return normalizeGuestName(hash);
}

function getGuestNameFromPath(): string | null {
  const segments = window.location.pathname
    .split('/')
    .map((segment) => segment.trim())
    .filter(Boolean);

  const lastSegment = segments[segments.length - 1];

  if (!lastSegment || lastSegment.toLowerCase() === 'index.html' || lastSegment.includes('.')) {
    return null;
  }

  return normalizeGuestName(lastSegment);
}

function getGuestNameFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search);
  const keys = ['to', 'guest', 'nama', 'tamu', 'untuk'];

  for (const key of keys) {
    const value = params.get(key);

    if (value) {
      const normalized = normalizeGuestName(value);

      if (normalized) {
        return normalized;
      }
    }
  }

  return getGuestNameFromHash() ?? getGuestNameFromPath();
}

function setGuestName(): void {
  const guestName = getGuestNameFromUrl();
  const guestNameElements = document.querySelectorAll<HTMLElement>('[data-guest-name]');
  const guestNameHint = document.getElementById('guestNameHint');

  if (guestName) {
    guestNameElements.forEach((element) => {
      element.textContent = guestName;
    });

    document.title = `Undangan Pernikahan untuk ${guestName}`;
    guestNameHint?.classList.add('hidden');
  } else {
    guestNameElements.forEach((element) => {
      element.textContent = 'Nama Tamu';
    });

    document.title = 'Undangan Pernikahan - Romeo & Juliet';
    guestNameHint?.classList.remove('hidden');
  }
}

// ==================== OPEN INVITATION ====================
function setupOpenButton(): void {
  const btnOpen = document.getElementById('btnOpen');
  const cover = document.getElementById('cover');
  const mainContent = document.getElementById('mainContent');

  if (!btnOpen || !cover || !mainContent) return;

  btnOpen.addEventListener('click', () => {
    cover.classList.add('open');
    mainContent.classList.remove('hidden');
    document.body.style.overflow = 'auto';

    // Remove cover from DOM after animation
    setTimeout(() => {
      cover.style.display = 'none';
    }, 800);

    // Trigger fade-in animations
    setTimeout(() => {
      observeFadeElements();
    }, 300);
  });

  // Lock scroll when cover is shown
  document.body.style.overflow = 'hidden';
}

// ==================== COUNTDOWN TIMER ====================
function startCountdown(): void {
  const weddingDate = new Date('2026-06-20T08:00:00+07:00').getTime();

  function update(): void {
    const now = new Date().getTime();
    const diff = weddingDate - now;

    if (diff <= 0) {
      setCountdownValue('days', '0');
      setCountdownValue('hours', '0');
      setCountdownValue('minutes', '0');
      setCountdownValue('seconds', '0');
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    setCountdownValue('days', String(days));
    setCountdownValue('hours', String(hours));
    setCountdownValue('minutes', String(minutes));
    setCountdownValue('seconds', String(seconds));
  }

  update();
  setInterval(update, 1000);
}

function setCountdownValue(id: string, value: string): void {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

// ==================== SCROLL FADE-IN ====================
function observeFadeElements(): void {
  const fadeElements = document.querySelectorAll('.fade-in');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    fadeElements.forEach((el) => observer.observe(el));
  } else {
    // Fallback: show all
    fadeElements.forEach((el) => el.classList.add('visible'));
  }
}

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', () => {
  setGuestName();
  setupOpenButton();
  startCountdown();
});
