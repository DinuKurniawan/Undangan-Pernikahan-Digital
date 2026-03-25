"use strict";
// ==================== GUEST NAME FROM URL ====================
function normalizeGuestName(value) {
    return value
        .replace(/[+_]/g, ' ')
        .replace(/%20/gi, ' ')
        .replace(/-/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/\b\w/g, (char) => char.toUpperCase());
}
function getGuestNameFromHash() {
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
function getGuestNameFromPath() {
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
function getGuestNameFromUrl() {
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
function setGuestName() {
    const guestName = getGuestNameFromUrl();
    const guestNameElements = document.querySelectorAll('[data-guest-name]');
    const guestNameHint = document.getElementById('guestNameHint');
    if (guestName) {
        guestNameElements.forEach((element) => {
            element.textContent = guestName;
        });
        document.title = `Undangan Pernikahan untuk ${guestName}`;
        guestNameHint?.classList.add('hidden');
    }
    else {
        guestNameElements.forEach((element) => {
            element.textContent = 'Nama Tamu';
        });
        document.title = 'Undangan Pernikahan - Romeo & Juliet';
        guestNameHint?.classList.remove('hidden');
    }
}
function getDefaultBaseUrl() {
    if (window.location.protocol !== 'http:' && window.location.protocol !== 'https:') {
        return '';
    }
    if (/\/index\.html$/i.test(window.location.pathname)) {
        const sanitizedPath = window.location.pathname
            .replace(/\/index\.html$/i, '')
            .replace(/\/$/, '');
        return `${window.location.origin}${sanitizedPath}`;
    }
    return window.location.origin;
}
function sanitizeBaseUrl(value) {
    const trimmed = value.trim();
    if (!trimmed) {
        return null;
    }
    try {
        const normalizedValue = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
        const url = new URL(normalizedValue);
        const sanitizedPath = url.pathname
            .replace(/\/index\.html$/i, '')
            .replace(/\/$/, '');
        return `${url.origin}${sanitizedPath}`;
    }
    catch {
        return null;
    }
}
function createGuestSlug(guestName) {
    return guestName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}
function buildGuestLinks(baseUrl, guestName) {
    const encodedGuestName = encodeURIComponent(guestName);
    const slug = createGuestSlug(guestName);
    return {
        queryLink: `${baseUrl}/?to=${encodedGuestName}`,
        prettyLink: `${baseUrl}/${slug}`
    };
}
function setGeneratorStatus(message, tone) {
    const status = document.getElementById('generatorStatus');
    if (!status) {
        return;
    }
    status.textContent = message;
    status.className = `generator-status ${tone}`;
}
function copyText(text, successMessage) {
    if (!navigator.clipboard?.writeText) {
        setGeneratorStatus('Browser ini tidak mendukung salin otomatis. Silakan salin manual dari kotak link.', 'error');
        return;
    }
    navigator.clipboard.writeText(text).then(() => {
        setGeneratorStatus(successMessage, 'success');
    }, () => {
        setGeneratorStatus('Gagal menyalin link. Silakan salin manual dari kotak link.', 'error');
    });
}
function setupLinkGenerator() {
    const form = document.getElementById('linkGeneratorForm');
    const baseUrlInput = document.getElementById('baseUrlInput');
    const guestLinkNameInput = document.getElementById('guestLinkName');
    const generatedLinks = document.getElementById('generatedLinks');
    const generatedQueryLink = document.getElementById('generatedQueryLink');
    const generatedPrettyLink = document.getElementById('generatedPrettyLink');
    const copyQueryLinkButton = document.getElementById('copyQueryLink');
    const copyPrettyLinkButton = document.getElementById('copyPrettyLink');
    if (!form ||
        !baseUrlInput ||
        !guestLinkNameInput ||
        !generatedLinks ||
        !generatedQueryLink ||
        !generatedPrettyLink ||
        !copyQueryLinkButton ||
        !copyPrettyLinkButton) {
        return;
    }
    const defaultBaseUrl = getDefaultBaseUrl();
    if (defaultBaseUrl) {
        baseUrlInput.value = defaultBaseUrl;
    }
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const sanitizedBaseUrl = sanitizeBaseUrl(baseUrlInput.value) ?? defaultBaseUrl;
        const guestName = normalizeGuestName(guestLinkNameInput.value);
        if (!sanitizedBaseUrl) {
            setGeneratorStatus('Isi URL website Anda dulu, misalnya https://undanganmu.vercel.app.', 'error');
            return;
        }
        if (!guestName) {
            setGeneratorStatus('Isi nama tamu terlebih dahulu.', 'error');
            return;
        }
        const links = buildGuestLinks(sanitizedBaseUrl, guestName);
        generatedQueryLink.value = links.queryLink;
        generatedPrettyLink.value = links.prettyLink;
        generatedLinks.classList.remove('hidden');
        setGeneratorStatus(`Link undangan untuk ${guestName} berhasil dibuat.`, 'success');
    });
    copyQueryLinkButton.addEventListener('click', () => {
        if (generatedQueryLink.value) {
            copyText(generatedQueryLink.value, 'Link standar berhasil disalin.');
        }
    });
    copyPrettyLinkButton.addEventListener('click', () => {
        if (generatedPrettyLink.value) {
            copyText(generatedPrettyLink.value, 'Link cantik Vercel berhasil disalin.');
        }
    });
}
// ==================== OPEN INVITATION ====================
function setupOpenButton() {
    const btnOpen = document.getElementById('btnOpen');
    const cover = document.getElementById('cover');
    const mainContent = document.getElementById('mainContent');
    if (!btnOpen || !cover || !mainContent)
        return;
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
function startCountdown() {
    const weddingDate = new Date('2026-06-20T08:00:00+07:00').getTime();
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
    if (el)
        el.textContent = value;
}
// ==================== SCROLL FADE-IN ====================
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
    }
    else {
        // Fallback: show all
        fadeElements.forEach((el) => el.classList.add('visible'));
    }
}
// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', () => {
    setGuestName();
    setupLinkGenerator();
    setupOpenButton();
    startCountdown();
});
//# sourceMappingURL=main.js.map