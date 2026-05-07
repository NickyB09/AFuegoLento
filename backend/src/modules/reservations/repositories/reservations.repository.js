import { pool } from '../../../db/pool.js';

export const reservationsRepository = {
  async listTableTypes() {
    const result = await pool.query('SELECT * FROM table_types ORDER BY capacity_max ASC, name ASC');
    return result.rows;
  },

  async listUserReservations(userId) {
    const result = await pool.query(
      `SELECT r.*, tt.name AS table_type_name, de.name AS experience_name
       FROM reservations r
       LEFT JOIN table_types tt ON tt.id = r.table_type_id
       LEFT JOIN dining_experiences de ON de.id = r.dining_experience_id
       WHERE r.user_id = $1
       ORDER BY r.reservation_date DESC, r.reservation_time DESC`,
      [userId],
    );
    return result.rows;
  },

  async listAllReservations() {
    const result = await pool.query(
      `SELECT r.*, u.name AS user_name, u.email AS user_email, tt.name AS table_type_name, de.name AS experience_name
       FROM reservations r
       INNER JOIN users u ON u.id = r.user_id
       LEFT JOIN table_types tt ON tt.id = r.table_type_id
       LEFT JOIN dining_experiences de ON de.id = r.dining_experience_id
       ORDER BY r.reservation_date DESC, r.reservation_time DESC`,
    );
    return result.rows;
  },

  async createReservation(payload) {
    const result = await pool.query(
      `INSERT INTO reservations (
        id, user_id, reservation_date, reservation_time, guest_count,
        table_type_id, table_id, dining_experience_id, status, allergies,
        dietary_restrictions, special_occasion, guest_notes
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10,
        $11, $12, $13
      ) RETURNING *`,
      [
        payload.id,
        payload.userId,
        payload.reservationDate,
        payload.reservationTime,
        payload.guestCount,
        payload.tableTypeId || null,
        payload.tableId || null,
        payload.diningExperienceId || null,
        payload.status,
        payload.allergies || null,
        payload.dietaryRestrictions || null,
        payload.specialOccasion || null,
        payload.guestNotes || null,
      ],
    );
    return result.rows[0];
  },

  async findReservationById(id) {
    const result = await pool.query('SELECT * FROM reservations WHERE id = $1 LIMIT 1', [id]);
    return result.rows[0] || null;
  },

  async cancelReservation(id) {
    const result = await pool.query(
      `UPDATE reservations SET status = 'cancelled', updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id],
    );
    return result.rows[0] || null;
  },
};
