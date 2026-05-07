import { pool } from '../../../db/pool.js';

export const usersRepository = {
  async updateProfile(userId, { name, phone }) {
    const result = await pool.query(
      `UPDATE users
       SET name = $2, phone = $3, updated_at = NOW()
       WHERE id = $1
       RETURNING id, name, email, phone, role, created_at, updated_at`,
      [userId, name, phone || null],
    );

    return result.rows[0] || null;
  },
};
