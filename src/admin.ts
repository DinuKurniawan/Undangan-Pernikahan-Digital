interface CreateInviteResponse {
  inviteLink?: string;
  inviteToken?: string;
  guestName?: string;
  error?: string;
}

function normalizeGuestName(value: string): string {
  return value
    .replace(/\s+/g, ' ')
    .trim();
}

function setAdminStatus(message: string, tone: 'info' | 'success' | 'error'): void {
  const status = document.getElementById('adminStatus');

  if (!status) {
    return;
  }

  status.textContent = message;
  status.className = `admin-status ${tone}`;
}

function copyInviteLink(): void {
  const inviteLinkInput = document.getElementById('inviteLink') as HTMLInputElement | null;

  if (!inviteLinkInput?.value) {
    return;
  }

  if (!navigator.clipboard?.writeText) {
    setAdminStatus('Browser ini tidak mendukung salin otomatis. Silakan salin manual.', 'error');
    return;
  }

  navigator.clipboard.writeText(inviteLinkInput.value).then(
    () => {
      setAdminStatus('Link undangan berhasil disalin.', 'success');
    },
    () => {
      setAdminStatus('Gagal menyalin link. Silakan salin manual.', 'error');
    }
  );
}

function setupAdminPage(): void {
  const form = document.getElementById('adminInviteForm') as HTMLFormElement | null;
  const adminKeyInput = document.getElementById('adminKey') as HTMLInputElement | null;
  const guestNameInput = document.getElementById('adminGuestName') as HTMLInputElement | null;
  const inviteLinkInput = document.getElementById('inviteLink') as HTMLInputElement | null;
  const generatedInviteBox = document.getElementById('generatedInviteBox');
  const copyButton = document.getElementById('copyInviteLink');

  if (!form || !adminKeyInput || !guestNameInput || !inviteLinkInput || !generatedInviteBox || !copyButton) {
    return;
  }

  form.addEventListener('submit', async (event: Event) => {
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

      const payload = await response.json() as CreateInviteResponse;

      if (!response.ok || !payload.inviteLink) {
        throw new Error(payload.error ?? 'Gagal membuat link undangan.');
      }

      inviteLinkInput.value = payload.inviteLink;
      generatedInviteBox.classList.remove('hidden');
      setAdminStatus(`Link aman untuk ${payload.guestName ?? guestName} berhasil dibuat.`, 'success');
    } catch (error) {
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
