import { pool } from '../../../db/pool.js';

// Repositorio para lectura pública y administración del menú.
export const menuRepository = {
  async listCategories() {
    const result = await pool.query('SELECT * FROM menu_categories ORDER BY sort_order ASC, name ASC');
    return result.rows;
  },

  async listExperiences() {
    const result = await pool.query('SELECT * FROM dining_experiences WHERE is_active = TRUE ORDER BY created_at ASC');
    return result.rows;
  },

  async listAllExperiences() {
    const result = await pool.query('SELECT * FROM dining_experiences ORDER BY created_at ASC');
    return result.rows;
  },

  async listItems() {
    const result = await pool.query(
      `SELECT mi.*, mc.name AS category_name, de.name AS experience_name
       FROM menu_items mi
       LEFT JOIN menu_categories mc ON mc.id = mi.category_id
       LEFT JOIN dining_experiences de ON de.id = mi.experience_id
       WHERE mi.is_available = TRUE
       ORDER BY mi.created_at ASC`,
    );
    return result.rows;
  },

  async listAllItems() {
    const result = await pool.query(
      `SELECT mi.*, mc.name AS category_name, de.name AS experience_name
       FROM menu_items mi
       LEFT JOIN menu_categories mc ON mc.id = mi.category_id
       LEFT JOIN dining_experiences de ON de.id = mi.experience_id
       ORDER BY mi.created_at ASC`,
    );
    return result.rows;
  },

  async createCategory({ id, name, description, sortOrder }) {
    const result = await pool.query(
      `INSERT INTO menu_categories (id, name, description, sort_order)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [id, name, description || null, sortOrder ?? 0],
    );
    return result.rows[0];
  },

  async updateCategory(id, { name, description, sortOrder }) {
    const result = await pool.query(
      `UPDATE menu_categories
       SET name = $2, description = $3, sort_order = $4, updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id, name, description || null, sortOrder ?? 0],
    );
    return result.rows[0] || null;
  },

  async deleteCategory(id) {
    const result = await pool.query('DELETE FROM menu_categories WHERE id = $1 RETURNING id', [id]);
    return result.rows[0] || null;
  },

  async createExperience({ id, name, description, price, isActive }) {
    const result = await pool.query(
      `INSERT INTO dining_experiences (id, name, description, price, is_active)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [id, name, description || null, price, isActive],
    );
    return result.rows[0];
  },

  async updateExperience(id, { name, description, price, isActive }) {
    const result = await pool.query(
      `UPDATE dining_experiences
       SET name = $2, description = $3, price = $4, is_active = $5, updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id, name, description || null, price, isActive],
    );
    return result.rows[0] || null;
  },

  async deleteExperience(id) {
    const result = await pool.query('DELETE FROM dining_experiences WHERE id = $1 RETURNING id', [id]);
    return result.rows[0] || null;
  },

  async createItem({ id, categoryId, experienceId, name, description, price, imageUrl, isAvailable }) {
    const result = await pool.query(
      `INSERT INTO menu_items (id, category_id, experience_id, name, description, price, image_url, is_available)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [id, categoryId || null, experienceId || null, name, description || null, price, imageUrl || null, isAvailable],
    );
    return result.rows[0];
  },

  async updateItem(id, { categoryId, experienceId, name, description, price, imageUrl, isAvailable }) {
    const result = await pool.query(
      `UPDATE menu_items
       SET category_id = $2, experience_id = $3, name = $4, description = $5, price = $6, image_url = $7, is_available = $8, updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id, categoryId || null, experienceId || null, name, description || null, price, imageUrl || null, isAvailable],
    );
    return result.rows[0] || null;
  },

  async deleteItem(id) {
    const result = await pool.query('DELETE FROM menu_items WHERE id = $1 RETURNING id', [id]);
    return result.rows[0] || null;
  },
};
