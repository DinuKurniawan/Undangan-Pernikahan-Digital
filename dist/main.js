"use strict";
function getWeddingConfig() {
    return window.WEDDING_CONFIG;
}
function applyWeddingConfig() {
    const config = getWeddingConfig();
    if (!config?.eventDate) {
        return;
    }
    const eventDate = new Date(`${config.eventDate}T00:00:00+07:00`);
    if (Number.isNaN(eventDate.getTime())) {
        return;
    }
    const coverDate = new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }).format(eventDate).replace(/\//g, ' . ');
    const fullDate = new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(eventDate);
    const footerDate = new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(eventDate);
    setTextContent('[data-wedding-cover-date]', coverDate);
    setTextContent('[data-wedding-footer-date]', footerDate);
    setTextContent('[data-wedding-full-date]', fullDate, true);
    if (config.akadTime) {
        setTextContent('[data-akad-time]', config.akadTime);
    }
    if (config.receptionTime) {
        setTextContent('[data-reception-time]', config.receptionTime);
    }
}
function setTextContent(selector, value, multiple = false) {
    if (multiple) {
        document.querySelectorAll(selector).forEach((element) => {
            element.textContent = value;
        });
        return;
    }
    const element = document.querySelector(selector);
    if (element) {
        element.textContent = value;
    }
}
function setGuestNameText(name) {
    const guestNameElements = document.querySelectorAll('[data-guest-name]');
    guestNameElements.forEach((element) => {
        element.textContent = name;
    });
}
function setGuestHint(message, tone) {
    const guestNameHint = document.getElementById('guestNameHint');
    if (!guestNameHint) {
        return;
    }
    guestNameHint.textContent = message;
    guestNameHint.className = `guest-name-hint ${tone}`;
}
async function resolveGuestName() {
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
        const payload = await response.json();
        if (!response.ok || !payload.guestName) {
            throw new Error(payload.error ?? 'Link undangan tidak valid.');
        }
        setGuestNameText(payload.guestName);
        document.title = `Undangan Pernikahan untuk ${payload.guestName}`;
        setGuestHint('Nama tamu berhasil diverifikasi dari backend undangan.', 'info');
    }
    catch (error) {
        setGuestNameText('Tamu Undangan');
        document.title = 'Undangan Pernikahan - Romeo & Juliet';
        setGuestHint(error instanceof Error ? error.message : 'Link undangan tidak valid.', 'error');
    }
}
function setupOpenButton() {
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
function getCountdownTarget() {
    const fallbackTarget = new Date('2026-03-31T08:00:00+07:00').getTime();
    const configuredTarget = getConfiguredCountdownTarget();
    if (configuredTarget) {
        return configuredTarget;
    }
    const firstEventCard = document.querySelector('.event-card');
    if (!firstEventCard) {
        return fallbackTarget;
    }
    const dateText = firstEventCard.querySelector('.event-date')?.textContent?.trim() ?? '';
    const timeText = firstEventCard.querySelector('.event-time')?.textContent?.trim() ?? '';
    const parsedTarget = parseIndonesianEventDate(dateText, timeText);
    return parsedTarget ?? fallbackTarget;
}
function getConfiguredCountdownTarget() {
    const config = getWeddingConfig();
    if (!config?.eventDate || !config.akadTime) {
        return null;
    }
    const timeMatch = config.akadTime.match(/(\d{1,2}):(\d{2})/);
    if (!timeMatch) {
        return null;
    }
    const hourValue = timeMatch[1].padStart(2, '0');
    const minuteValue = timeMatch[2];
    return new Date(`${config.eventDate}T${hourValue}:${minuteValue}:00+07:00`).getTime();
}
function parseIndonesianEventDate(dateText, timeText) {
    const months = {
        januari: '01',
        februari: '02',
        maret: '03',
        april: '04',
        mei: '05',
        juni: '06',
        juli: '07',
        agustus: '08',
        september: '09',
        oktober: '10',
        november: '11',
        desember: '12'
    };
    const normalizedDate = dateText
        .toLowerCase()
        .replace(/,/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    const dateMatch = normalizedDate.match(/(\d{1,2})\s+([a-z]+)\s+(\d{4})/i);
    const timeMatch = timeText.match(/(\d{1,2}):(\d{2})/);
    if (!dateMatch || !timeMatch) {
        return null;
    }
    const [, day, monthName, year] = dateMatch;
    const month = months[monthName];
    if (!month) {
        return null;
    }
    const dayValue = day.padStart(2, '0');
    const hourValue = timeMatch[1].padStart(2, '0');
    const minuteValue = timeMatch[2];
    return new Date(`${year}-${month}-${dayValue}T${hourValue}:${minuteValue}:00+07:00`).getTime();
}
function startCountdown() {
    const weddingDate = getCountdownTarget();
    function update() {
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
function setCountdownValue(id, value) {
    const el = document.getElementById(id);
    if (el) {
        el.textContent = value;
    }
}
function observeFadeElements() {
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
    applyWeddingConfig();
    void resolveGuestName();
    setupOpenButton();
    startCountdown();
});
//# sourceMappingURL=main.js.map