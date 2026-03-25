function setGuestNameText(name: string): void {
  const guestNameElements = document.querySelectorAll<HTMLElement>('[data-guest-name]');

  guestNameElements.forEach((element) => {
    element.textContent = name;
  });
}

function setGuestHint(message: string, tone: 'info' | 'error'): void {
  const guestNameHint = document.getElementById('guestNameHint');

  if (!guestNameHint) {
    return;
  }

  guestNameHint.textContent = message;
  guestNameHint.className = `guest-name-hint ${tone}`;
}

async function resolveGuestName(): Promise<void> {
  const inviteToken = new URLSearchParams(window.location.search).get('invite');

  if (!inviteToken) {
    setGuestNameText('Nama Tamu');
    document.title = 'Undangan Pernikahan - Romeo & Juliet';
    setGuestHint('Link undangan aman harus dibuat dari halaman admin dan berisi token invite.', 'info');
    return;
  }

  setGuestHint('Memuat data tamu undangan...', 'info');

  try {
    const response = await fetch(`/api/guest?invite=${encodeURIComponent(inviteToken)}`, {
      headers: {
        Accept: 'application/json'
      }
    });

    const payload = await response.json() as { guestName?: string; error?: string };

    if (!response.ok || !payload.guestName) {
      throw new Error(payload.error ?? 'Link undangan tidak valid.');
    }

    setGuestNameText(payload.guestName);
    document.title = `Undangan Pernikahan untuk ${payload.guestName}`;
    setGuestHint('Nama tamu berhasil diverifikasi dari backend undangan.', 'info');
  } catch (error) {
    setGuestNameText('Tamu Undangan');
    document.title = 'Undangan Pernikahan - Romeo & Juliet';
    setGuestHint(error instanceof Error ? error.message : 'Link undangan tidak valid.', 'error');
  }
}

function setupOpenButton(): void {
  const btnOpen = document.getElementById('btnOpen');
  const cover = document.getElementById('cover');
  const mainContent = document.getElementById('mainContent');

  if (!btnOpen || !cover || !mainContent) {
    return;
  }

  btnOpen.addEventListener('click', () => {
    cover.classList.add('open');
    mainContent.classList.remove('hidden');
    document.body.style.overflow = 'auto';

    setTimeout(() => {
      cover.style.display = 'none';
    }, 800);

    setTimeout(() => {
      observeFadeElements();
    }, 300);
  });

  document.body.style.overflow = 'hidden';
}

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

  if (el) {
    el.textContent = value;
  }
}

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
    return;
  }

  fadeElements.forEach((el) => el.classList.add('visible'));
}

document.addEventListener('DOMContentLoaded', () => {
  void resolveGuestName();
  setupOpenButton();
  startCountdown();
});
