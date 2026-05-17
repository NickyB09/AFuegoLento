import { pool } from '../../../db/pool.js';

// Repositorio para consultar y administrar tipos de mesa y mesas físicas.
export const tablesRepository = {
  async listTableTypes() {
    const result = await pool.query('SELECT * FROM table_types ORDER BY capacity_max ASC, name ASC');
    return result.rows;
  },

  async listTables() {
    const result = await pool.query(
      `SELECT t.*, tt.name AS table_type_name, tt.capacity_min, tt.capacity_max
       FROM tables t
       INNER JOIN table_types tt ON tt.id = t.table_type_id
       ORDER BY t.code ASC`,
    );
    return result.rows;
  },

  async createTableType({ id, name, description, capacityMin, capacityMax }) {
    const result = await pool.query(
      `INSERT INTO table_types (id, name, description, capacity_min, capacity_max)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [id, name, description || null, capacityMin, capacityMax],
    );
    return result.rows[0];
  },

  async updateTableType(id, { name, description, capacityMin, capacityMax }) {
    const result = await pool.query(
      `UPDATE table_types
       SET name = $2, description = $3, capacity_min = $4, capacity_max = $5, updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id, name, description || null, capacityMin, capacityMax],
    );
    return result.rows[0] || null;
  },

  async deleteTableType(id) {
    const result = await pool.query('DELETE FROM table_types WHERE id = $1 RETURNING id', [id]);
    return result.rows[0] || null;
  },

  async createTable({ id, tableTypeId, code, seats, isActive }) {
    const result = await pool.query(
      `INSERT INTO tables (id, table_type_id, code, seats, is_active)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [id, tableTypeId, code.trim().toUpperCase(), seats, isActive],
    );
    return result.rows[0];
  },

  async updateTable(id, { tableTypeId, code, seats, isActive }) {
    const result = await pool.query(
      `UPDATE tables
       SET table_type_id = $2, code = $3, seats = $4, is_active = $5, updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id, tableTypeId, code.trim().toUpperCase(), seats, isActive],
    );
    return result.rows[0] || null;
  },

  async deleteTable(id) {
    const result = await pool.query('DELETE FROM tables WHERE id = $1 RETURNING id', [id]);
    return result.rows[0] || null;
  },
};
