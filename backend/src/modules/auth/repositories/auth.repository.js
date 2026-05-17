import crypto from 'crypto';

import { pool } from '../../../db/pool.js';

// Los tokens sensibles se hashean antes de guardarse para no persistirlos en claro.
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// Repositorio de autenticación y sesión.
export const authRepository = {
  async findUserByEmail(email) {
    const result = await pool.query('SELECT * FROM users WHERE email = $1 LIMIT 1', [email.toLowerCase()]);
    return result.rows[0] || null;
  },

  async findUserById(id) {
    const result = await pool.query(
      'SELECT id, name, email, phone, role, created_at, updated_at FROM users WHERE id = $1 LIMIT 1',
      [id],
    );
    return result.rows[0] || null;
  },

  async createUser({ id, name, email, passwordHash, phone, role = 'user' }) {
    const result = await pool.query(
      `INSERT INTO users (id, name, email, password_hash, phone, role)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, email, phone, role, created_at, updated_at`,
      [id, name, email.toLowerCase(), passwordHash, phone || null, role],
    );

    return result.rows[0];
  },

  async storeRefreshToken({ id, userId, token, expiresAt }) {
    const tokenHash = hashToken(token);
    await pool.query(
      `INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at)
       VALUES ($1, $2, $3, $4)`,
      [id, userId, tokenHash, expiresAt],
    );
  },

  async findRefreshToken(token) {
    const tokenHash = hashToken(token);
    const result = await pool.query(
      `SELECT rt.id AS refresh_token_id, rt.user_id, rt.expires_at, rt.revoked_at, u.id AS id, u.name, u.email, u.phone, u.role
       FROM refresh_tokens rt
       INNER JOIN users u ON u.id = rt.user_id
       WHERE rt.token_hash = $1 AND rt.revoked_at IS NULL
       LIMIT 1`,
      [tokenHash],
    );
    return result.rows[0] || null;
  },

  async revokeRefreshToken(token) {
    const tokenHash = hashToken(token);
    await pool.query('UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = $1 AND revoked_at IS NULL', [tokenHash]);
  },

  async revokeAllRefreshTokensForUser(userId) {
    await pool.query('UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = $1 AND revoked_at IS NULL', [userId]);
  },

  async createPasswordResetToken({ id, userId, token, expiresAt }) {
    const tokenHash = hashToken(token);
    await pool.query('UPDATE password_reset_tokens SET used_at = NOW() WHERE user_id = $1 AND used_at IS NULL', [userId]);
    await pool.query(
      `INSERT INTO password_reset_tokens (id, user_id, token_hash, expires_at)
       VALUES ($1, $2, $3, $4)`,
      [id, userId, tokenHash, expiresAt],
    );
  },

  async findPasswordResetToken(token) {
    const tokenHash = hashToken(token);
    const result = await pool.query(
      `SELECT prt.*, u.id AS user_id, u.name, u.email, u.role
       FROM password_reset_tokens prt
       INNER JOIN users u ON u.id = prt.user_id
       WHERE prt.token_hash = $1 AND prt.used_at IS NULL
       LIMIT 1`,
      [tokenHash],
    );
    return result.rows[0] || null;
  },

  async markPasswordResetTokenUsed(id) {
    await pool.query('UPDATE password_reset_tokens SET used_at = NOW() WHERE id = $1', [id]);
  },

  async updateUserPassword(userId, passwordHash) {
    await pool.query('UPDATE users SET password_hash = $2, updated_at = NOW() WHERE id = $1', [userId, passwordHash]);
  },
};
