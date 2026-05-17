import { pool } from '../../../db/pool.js';

// Repositorio para catálogo de inventario y trazabilidad de movimientos.
export const inventoryRepository = {
  async listItems() {
    const result = await pool.query(
      `SELECT *, (current_stock <= minimum_stock) AS is_low_stock
       FROM inventory_items
       ORDER BY is_active DESC, name ASC`,
    );
    return result.rows;
  },

  async findItemById(id) {
    const result = await pool.query('SELECT * FROM inventory_items WHERE id = $1 LIMIT 1', [id]);
    return result.rows[0] || null;
  },

  async listMovements(itemId = null) {
    const query = itemId
      ? `SELECT im.*, u.name AS performed_by_name
         FROM inventory_movements im
         LEFT JOIN users u ON u.id = im.performed_by_user_id
         WHERE im.item_id = $1
         ORDER BY im.created_at DESC`
      : `SELECT im.*, u.name AS performed_by_name
         FROM inventory_movements im
         LEFT JOIN users u ON u.id = im.performed_by_user_id
         ORDER BY im.created_at DESC
         LIMIT 100`;

    const result = await pool.query(query, itemId ? [itemId] : []);
    return result.rows;
  },

  async createItem({ id, name, description, sku, unit, minimumStock, costPerUnit, supplierName, isActive }) {
    const result = await pool.query(
      `INSERT INTO inventory_items (
        id, name, description, sku, unit, current_stock,
        minimum_stock, cost_per_unit, supplier_name, is_active
      ) VALUES ($1, $2, $3, $4, $5, 0, $6, $7, $8, $9)
      RETURNING *`,
      [id, name, description || null, sku.trim().toUpperCase(), unit.trim(), minimumStock, costPerUnit, supplierName || null, isActive],
    );
    return result.rows[0];
  },

  async updateItem(id, { name, description, sku, unit, minimumStock, costPerUnit, supplierName, isActive }) {
    const result = await pool.query(
      `UPDATE inventory_items
       SET name = $2,
           description = $3,
           sku = $4,
           unit = $5,
           minimum_stock = $6,
           cost_per_unit = $7,
           supplier_name = $8,
           is_active = $9,
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id, name, description || null, sku.trim().toUpperCase(), unit.trim(), minimumStock, costPerUnit, supplierName || null, isActive],
    );
    return result.rows[0] || null;
  },

  async deleteItem(id) {
    const result = await pool.query('DELETE FROM inventory_items WHERE id = $1 RETURNING id', [id]);
    return result.rows[0] || null;
  },

  async applyMovement({ id, itemId, movementType, quantity, note, performedByUserId }) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const currentItemResult = await client.query(
        'SELECT * FROM inventory_items WHERE id = $1 FOR UPDATE',
        [itemId],
      );
      const currentItem = currentItemResult.rows[0] || null;

      if (!currentItem) {
        await client.query('ROLLBACK');
        return null;
      }

      const signedQuantity = movementType === 'out' ? quantity * -1 : quantity;
      const nextStock = Number(currentItem.current_stock) + Number(signedQuantity);

      if (nextStock < 0) {
        throw new Error('Insufficient stock for this movement');
      }

      await client.query(
        `UPDATE inventory_items
         SET current_stock = $2, updated_at = NOW()
         WHERE id = $1`,
        [itemId, nextStock],
      );

      await client.query(
        `INSERT INTO inventory_movements (id, item_id, movement_type, quantity, note, performed_by_user_id)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [id, itemId, movementType, quantity, note || null, performedByUserId || null],
      );

      const updatedItemResult = await client.query('SELECT * FROM inventory_items WHERE id = $1', [itemId]);

      await client.query('COMMIT');
      return updatedItemResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },
};
