"use strict";
function normalizeGuestName(value) {
    return value
        .replace(/\s+/g, ' ')
        .trim();
}
function setAdminStatus(message, tone) {
    const status = document.getElementById('adminStatus');
    if (!status) {
        return;
    }
    status.textContent = message;
    status.className = `admin-status ${tone}`;
}
function copyInviteLink() {
    const inviteLinkInput = document.getElementById('inviteLink');
    if (!inviteLinkInput?.value) {
        return;
    }
    if (!navigator.clipboard?.writeText) {
        setAdminStatus('Browser ini tidak mendukung salin otomatis. Silakan salin manual.', 'error');
        return;
    }
    navigator.clipboard.writeText(inviteLinkInput.value).then(() => {
        setAdminStatus('Link undangan berhasil disalin.', 'success');
    }, () => {
        setAdminStatus('Gagal menyalin link. Silakan salin manual.', 'error');
    });
}
function setupAdminPage() {
    const form = document.getElementById('adminInviteForm');
    const adminKeyInput = document.getElementById('adminKey');
    const guestNameInput = document.getElementById('adminGuestName');
    const inviteLinkInput = document.getElementById('inviteLink');
    const generatedInviteBox = document.getElementById('generatedInviteBox');
    const copyButton = document.getElementById('copyInviteLink');
    if (!form || !adminKeyInput || !guestNameInput || !inviteLinkInput || !generatedInviteBox || !copyButton) {
        return;
    }
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const adminKey = adminKeyInput.value.trim();
        const guestName = normalizeGuestName(guestNameInput.value);
        if (!adminKey) {
            setAdminStatus('Masukkan ADMIN_KEY terlebih dahulu.', 'error');
            return;
        }
        if (!guestName) {
            setAdminStatus('Masukkan nama tamu terlebih dahulu.', 'error');
            return;
        }
        setAdminStatus('Membuat link undangan aman...', 'info');
        try {
            const response = await fetch('/api/create-invite', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json'
                },
                body: JSON.stringify({
                    adminKey,
                    guestName,
                    baseUrl: window.location.origin
                })
            });
            const payload = await response.json();
            if (!response.ok || !payload.inviteLink) {
                throw new Error(payload.error ?? 'Gagal membuat link undangan.');
            }
            inviteLinkInput.value = payload.inviteLink;
            generatedInviteBox.classList.remove('hidden');
            setAdminStatus(`Link aman untuk ${payload.guestName ?? guestName} berhasil dibuat.`, 'success');
        }
        catch (error) {
            generatedInviteBox.classList.add('hidden');
            inviteLinkInput.value = '';
            setAdminStatus(error instanceof Error ? error.message : 'Gagal membuat link undangan.', 'error');
        }
    });
    copyButton.addEventListener('click', copyInviteLink);
}
document.addEventListener('DOMContentLoaded', () => {
    setupAdminPage();
});
//# sourceMappingURL=admin.js.map