const {
  createInviteToken,
  isValidAdminKey,
  normalizeGuestName
} = require('./_lib/invite');

module.exports = (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method tidak diizinkan.' });
    return;
  }

  try {
    const { adminKey, guestName, baseUrl } = req.body ?? {};
    const normalizedGuestName = normalizeGuestName(guestName);

    if (!isValidAdminKey(adminKey)) {
      res.status(401).json({ error: 'ADMIN_KEY tidak valid.' });
      return;
    }

    if (!normalizedGuestName) {
      res.status(400).json({ error: 'Nama tamu wajib diisi.' });
      return;
    }

    const inviteToken = createInviteToken(normalizedGuestName);
    const safeBaseUrl = typeof baseUrl === 'string' && /^https?:\/\//i.test(baseUrl)
      ? baseUrl.replace(/\/$/, '')
      : '';

    res.status(200).json({
      guestName: normalizedGuestName,
      inviteToken,
      inviteLink: `${safeBaseUrl || ''}/?invite=${encodeURIComponent(inviteToken)}`
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Terjadi kesalahan server.'
    });
  }
};
