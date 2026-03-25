const crypto = require('crypto');

function base64UrlEncode(value) {
  return Buffer.from(value)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function base64UrlDecode(value) {
  const normalized = value
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const padding = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4));

  return Buffer.from(`${normalized}${padding}`, 'base64').toString('utf8');
}

function normalizeGuestName(value) {
  return String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim();
}

function getRequiredEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Environment variable ${name} belum diatur.`);
  }

  return value;
}

function signPayload(payload, secret) {
  return crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function createInviteToken(guestName) {
  const normalizedGuestName = normalizeGuestName(guestName);

  if (!normalizedGuestName) {
    throw new Error('Nama tamu wajib diisi.');
  }

  const secret = getRequiredEnv('INVITE_SECRET');
  const payload = JSON.stringify({
    guestName: normalizedGuestName,
    issuedAt: Date.now()
  });
  const encodedPayload = base64UrlEncode(payload);
  const signature = signPayload(encodedPayload, secret);

  return `${encodedPayload}.${signature}`;
}

function verifyInviteToken(token) {
  if (!token || typeof token !== 'string') {
    return null;
  }

  const [encodedPayload, signature] = token.split('.');

  if (!encodedPayload || !signature) {
    return null;
  }

  const secret = getRequiredEnv('INVITE_SECRET');
  const expectedSignature = signPayload(encodedPayload, secret);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (actualBuffer.length !== expectedBuffer.length) {
    return null;
  }

  if (!crypto.timingSafeEqual(actualBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const parsed = JSON.parse(base64UrlDecode(encodedPayload));
    const guestName = normalizeGuestName(parsed.guestName);

    if (!guestName) {
      return null;
    }

    return {
      guestName
    };
  } catch {
    return null;
  }
}

function isValidAdminKey(adminKey) {
  const expected = getRequiredEnv('ADMIN_KEY');
  const actualBuffer = Buffer.from(String(adminKey ?? ''));
  const expectedBuffer = Buffer.from(expected);

  if (actualBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(actualBuffer, expectedBuffer);
}

module.exports = {
  createInviteToken,
  isValidAdminKey,
  normalizeGuestName,
  verifyInviteToken
};
