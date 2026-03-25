const { verifyInviteToken } = require('./_lib/invite');

module.exports = (req, res) => {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method tidak diizinkan.' });
    return;
  }

  try {
    const inviteToken = typeof req.query.invite === 'string' ? req.query.invite : '';
    const invite = verifyInviteToken(inviteToken);

    if (!invite) {
      res.status(404).json({ error: 'Link undangan tidak valid atau sudah rusak.' });
      return;
    }

    res.status(200).json({
      guestName: invite.guestName
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Terjadi kesalahan server.'
    });
  }
};
