// ==================== GUEST NAME FROM URL ====================
function getGuestNameFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search);
  const keys = ['to', 'guest', 'nama', 'tamu'];

  for (const key of keys) {
    const value = params.get(key);

    if (value) {
      const normalized = value.replace(/\s+/g, ' ').trim();

      if (normalized) {
        return normalized;
      }
    }
  }

  return null;
}

function setGuestName(): void {
  const guestName = getGuestNameFromUrl();
  const guestNameElements = document.querySelectorAll<HTMLElement>('[data-guest-name]');

  if (guestName) {
    guestNameElements.forEach((element) => {
      element.textContent = guestName;
    });

    document.title = `Undangan Pernikahan untuk ${guestName}`;
  }

  const wishNameInput = document.getElementById('wishName') as HTMLInputElement | null;

  if (wishNameInput && guestName) {
    wishNameInput.value = guestName;
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

// ==================== WISHES / UCAPAN ====================
interface Wish {
  name: string;
  message: string;
  attendance: string;
  timestamp: number;
}

function setupWishesForm(): void {
  const form = document.getElementById('wishesForm') as HTMLFormElement | null;
  if (!form) return;

  // Load existing wishes
  renderWishes();

  form.addEventListener('submit', (e: Event) => {
    e.preventDefault();

    const nameInput = document.getElementById('wishName') as HTMLInputElement;
    const messageInput = document.getElementById('wishMessage') as HTMLTextAreaElement;
    const attendanceInput = form.querySelector('input[name="attendance"]:checked') as HTMLInputElement;

    if (!nameInput.value.trim() || !messageInput.value.trim()) return;

    const wish: Wish = {
      name: nameInput.value.trim(),
      message: messageInput.value.trim(),
      attendance: attendanceInput?.value || 'hadir',
      timestamp: Date.now()
    };

    // Save to localStorage
    const wishes = getWishes();
    wishes.unshift(wish);
    localStorage.setItem('wedding_wishes', JSON.stringify(wishes));

    // Reset form (keep name)
    messageInput.value = '';

    renderWishes();
  });
}

function getWishes(): Wish[] {
  try {
    const data = localStorage.getItem('wedding_wishes');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function renderWishes(): void {
  const list = document.getElementById('wishesList');
  if (!list) return;

  const wishes = getWishes();

  if (wishes.length === 0) {
    list.innerHTML = '<p style="text-align:center;color:#999;font-size:0.9rem;">Belum ada ucapan. Jadilah yang pertama! 💌</p>';
    return;
  }

  const attendanceLabels: Record<string, string> = {
    hadir: '✅ Akan Hadir',
    tidak: '❌ Tidak Hadir',
    ragu: '🤔 Masih Ragu'
  };

  list.innerHTML = wishes.map((w) => `
    <div class="wish-card">
      <p class="wish-author">${escapeHtml(w.name)}</p>
      <p class="wish-text">${escapeHtml(w.message)}</p>
      <p class="wish-attendance">${attendanceLabels[w.attendance] || w.attendance}</p>
    </div>
  `).join('');
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', () => {
  setGuestName();
  setupOpenButton();
  startCountdown();
  setupWishesForm();
});
