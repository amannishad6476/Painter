import crypto from 'crypto';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

const JWT_SECRET =
  process.env.ADMIN_JWT_SECRET ||
  process.env.JWT_SECRET ||
  'munnalal_painter_secure_jwt_secret_2026_x87b';

/**
 * Base64 URL encode a string or buffer
 */
const base64UrlEncode = (input) => {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return buf
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
};

/**
 * Base64 URL decode to string
 */
const base64UrlDecode = (str) => {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf8');
};

/**
 * Verify a plaintext password against a stored PBKDF2 hash & salt.
 * Matches the browser crypto.subtle implementation (PBKDF2-SHA256, 100k iterations, 32 bytes).
 */
export const verifyPassword = (password, storedHash, storedSalt) => {
  if (!password || !storedHash || !storedSalt) return false;
  try {
    const saltBuf = Buffer.from(storedSalt, 'base64');
    const derived = crypto.pbkdf2Sync(password, saltBuf, 100000, 32, 'sha256');
    const calculatedHash = derived.toString('base64');
    return crypto.timingSafeEqual(
      Buffer.from(calculatedHash, 'utf8'),
      Buffer.from(storedHash, 'utf8')
    );
  } catch (err) {
    console.error('Password verification error:', err);
    return false;
  }
};

/**
 * Hash a password using PBKDF2-SHA256 with 100,000 iterations.
 * Generates a fresh random 16-byte salt.
 */
export const hashPassword = (password) => {
  const saltBuf = crypto.randomBytes(16);
  const derived = crypto.pbkdf2Sync(password, saltBuf, 100000, 32, 'sha256');
  return {
    hash: derived.toString('base64'),
    salt: saltBuf.toString('base64')
  };
};

/**
 * Generates an HMAC-SHA256 signed JWT token for the admin session.
 * Token expires in 24 hours.
 */
export const generateAdminToken = (payload = {}) => {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };

  const nowSec = Math.floor(Date.now() / 1000);
  const claims = {
    role: 'admin',
    iat: nowSec,
    exp: nowSec + 24 * 60 * 60, // 24 hours
    ...payload
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(claims));
  const data = `${encodedHeader}.${encodedPayload}`;

  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(data)
    .digest();
  const encodedSignature = base64UrlEncode(signature);

  return `${data}.${encodedSignature}`;
};

/**
 * Verifies an HMAC-SHA256 signed admin token.
 * Returns decoded payload if valid and unexpired, otherwise null.
 */
export const verifyAdminToken = (token) => {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const data = `${encodedHeader}.${encodedPayload}`;

  const expectedSignature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(data)
    .digest();
  const expectedEncodedSig = base64UrlEncode(expectedSignature);

  try {
    const isSigValid = crypto.timingSafeEqual(
      Buffer.from(encodedSignature, 'utf8'),
      Buffer.from(expectedEncodedSig, 'utf8')
    );
    if (!isSigValid) return null;

    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    const nowSec = Math.floor(Date.now() / 1000);

    if (payload.exp && payload.exp < nowSec) {
      return null; // Expired
    }

    if (payload.role !== 'admin') {
      return null; // Unauthorized role
    }

    return payload;
  } catch (err) {
    return null;
  }
};

/**
 * Express middleware to guard admin routes.
 * Expects header: Authorization: Bearer <token>
 */
export const requireAdminAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Admin authentication required.'
    });
  }

  const token = authHeader.substring(7).trim();
  const payload = verifyAdminToken(token);

  if (!payload) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Invalid or expired admin session token.'
    });
  }

  req.admin = payload;
  next();
};
