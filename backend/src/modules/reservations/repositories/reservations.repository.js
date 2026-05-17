import { pool } from '../../../db/pool.js';

// Repositorio con lógica de lectura, disponibilidad y escritura de reservas.
export const reservationsRepository = {
  async listTableTypes() {
    const result = await pool.query('SELECT * FROM table_types ORDER BY capacity_max ASC, name ASC');
    return result.rows;
  },

  async listUserReservations(userId) {
    const result = await pool.query(
      `SELECT r.*, tt.name AS table_type_name, t.code AS table_code, de.name AS experience_name
       FROM reservations r
       LEFT JOIN table_types tt ON tt.id = r.table_type_id
       LEFT JOIN tables t ON t.id = r.table_id
       LEFT JOIN dining_experiences de ON de.id = r.dining_experience_id
       WHERE r.user_id = $1
       ORDER BY r.reservation_date DESC, r.reservation_time DESC`,
      [userId],
    );
    return result.rows;
  },

  async listAllReservations() {
    const result = await pool.query(
      `SELECT r.*, u.name AS user_name, u.email AS user_email, tt.name AS table_type_name, t.code AS table_code, de.name AS experience_name
       FROM reservations r
       INNER JOIN users u ON u.id = r.user_id
       LEFT JOIN table_types tt ON tt.id = r.table_type_id
       LEFT JOIN tables t ON t.id = r.table_id
       LEFT JOIN dining_experiences de ON de.id = r.dining_experience_id
       ORDER BY r.reservation_date DESC, r.reservation_time DESC`,
    );
    return result.rows;
  },

  async findTableTypeById(id) {
    const result = await pool.query('SELECT * FROM table_types WHERE id = $1 LIMIT 1', [id]);
    return result.rows[0] || null;
  },

  async findExperienceById(id) {
    const result = await pool.query('SELECT * FROM dining_experiences WHERE id = $1 LIMIT 1', [id]);
    return result.rows[0] || null;
  },

  async findAvailableTable({ reservationDate, reservationTime, guestCount, tableTypeId, excludeReservationId = null }) {
    const values = [reservationDate, reservationTime, guestCount];
    let typeFilter = '';
    let exclusionFilter = '';

    if (tableTypeId) {
      values.push(tableTypeId);
      typeFilter = ` AND t.table_type_id = $${values.length}`;
    }

    if (excludeReservationId) {
      values.push(excludeReservationId);
      exclusionFilter = ` AND r.id <> $${values.length}`;
    }

    const result = await pool.query(
      `SELECT t.*, tt.name AS table_type_name
       FROM tables t
       INNER JOIN table_types tt ON tt.id = t.table_type_id
       WHERE t.is_active = TRUE
         AND t.seats >= $3
         ${typeFilter}
         AND NOT EXISTS (
           SELECT 1
           FROM reservations r
           WHERE r.table_id = t.id
             AND r.reservation_date = $1
             AND r.reservation_time = $2
             AND r.status IN ('pending', 'confirmed')
             ${exclusionFilter}
         )
       ORDER BY t.seats ASC, t.code ASC
       LIMIT 1`,
      values,
    );

    return result.rows[0] || null;
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

  async updateReservation(id, payload) {
    const result = await pool.query(
      `UPDATE reservations
       SET reservation_date = $2,
           reservation_time = $3,
           guest_count = $4,
           table_type_id = $5,
           table_id = $6,
           dining_experience_id = $7,
           allergies = $8,
           dietary_restrictions = $9,
           special_occasion = $10,
           guest_notes = $11,
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [
        id,
        payload.reservationDate,
        payload.reservationTime,
        payload.guestCount,
        payload.tableTypeId || null,
        payload.tableId || null,
        payload.diningExperienceId || null,
        payload.allergies || null,
        payload.dietaryRestrictions || null,
        payload.specialOccasion || null,
        payload.guestNotes || null,
      ],
    );
    return result.rows[0] || null;
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

  async updateReservationStatus(id, status) {
    const result = await pool.query(
      `UPDATE reservations
       SET status = $2, updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id, status],
    );
    return result.rows[0] || null;
  },
};
