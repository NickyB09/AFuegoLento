import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

import { env } from '../config/env.js';
import { hashPassword } from '../utils/password.js';
import { pool } from './pool.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const schemaPath = path.resolve(__dirname, '../../sql/001_init.sql');

// Ejecuta el esquema SQL idempotente del proyecto.
async function runSchema() {
  const sql = await fs.readFile(schemaPath, 'utf8');
  await pool.query(sql);
}

// Inserta datos base para que el MVP pueda usarse apenas arranca.
async function seedData() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const categoriesCount = await client.query('SELECT COUNT(*)::int AS count FROM menu_categories');
    if (categoriesCount.rows[0].count === 0) {
      await client.query(`
        INSERT INTO menu_categories (id, name, description, sort_order)
        VALUES
          ('11111111-1111-1111-1111-111111111111', 'Degustación', 'Experiencias de autor para quienes buscan un recorrido completo.', 1),
          ('22222222-2222-2222-2222-222222222222', 'Entradas', 'Aperturas delicadas y estacionales.', 2),
          ('33333333-3333-3333-3333-333333333333', 'Fondos', 'Platos centrales de cocción lenta y profundidad aromática.', 3),
          ('44444444-4444-4444-4444-444444444444', 'Postres', 'Cierres ligeros y memorables.', 4)
      `);
    }

    const experiencesCount = await client.query('SELECT COUNT(*)::int AS count FROM dining_experiences');
    if (experiencesCount.rows[0].count === 0) {
      await client.query(`
        INSERT INTO dining_experiences (id, name, description, price, is_active)
        VALUES
          ('55555555-5555-5555-5555-555555555555', 'Recorrido Fuego Lento', 'Menú degustación de 7 tiempos con narrativa estacional.', 120.00, TRUE),
          ('66666666-6666-6666-6666-666666666666', 'Maridaje de la Casa', 'Selección de vinos y fermentos para acompañar la experiencia.', 68.00, TRUE)
      `);
    }

    const itemsCount = await client.query('SELECT COUNT(*)::int AS count FROM menu_items');
    if (itemsCount.rows[0].count === 0) {
      await client.query(`
        INSERT INTO menu_items (id, category_id, experience_id, name, description, price, image_url, is_available)
        VALUES
          ('77777777-7777-7777-7777-777777777771', '22222222-2222-2222-2222-222222222222', NULL, 'Ostra templada', 'Ostra, beurre blanc cítrico y aceite de hierbas.', 18.00, NULL, TRUE),
          ('77777777-7777-7777-7777-777777777772', '33333333-3333-3333-3333-333333333333', NULL, 'Cordero braseado', 'Cocción lenta, zanahoria asada y reducción de vino.', 42.00, NULL, TRUE),
          ('77777777-7777-7777-7777-777777777773', '44444444-4444-4444-4444-444444444444', NULL, 'Texturas de cacao', 'Cremoso, bizcocho aireado y sal de oliva.', 16.00, NULL, TRUE),
          ('77777777-7777-7777-7777-777777777774', '11111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555', 'Recorrido Fuego Lento', 'Selección curada de siete tiempos.', 120.00, NULL, TRUE)
      `);
    }

    const tableTypesCount = await client.query('SELECT COUNT(*)::int AS count FROM table_types');
    if (tableTypesCount.rows[0].count === 0) {
      await client.query(`
        INSERT INTO table_types (id, name, description, capacity_min, capacity_max)
        VALUES
          ('88888888-8888-8888-8888-888888888881', 'Interior para 2', 'Mesa íntima en salón principal.', 1, 2),
          ('88888888-8888-8888-8888-888888888882', 'Interior para 4', 'Mesa central para pequeños grupos.', 3, 4),
          ('88888888-8888-8888-8888-888888888883', 'Privada para 6', 'Espacio reservado para celebraciones especiales.', 5, 6)
      `);
    }

    const tablesCount = await client.query('SELECT COUNT(*)::int AS count FROM tables');
    if (tablesCount.rows[0].count === 0) {
      await client.query(`
        INSERT INTO tables (id, table_type_id, code, seats, is_active)
        VALUES
          ('99999999-9999-9999-9999-999999999991', '88888888-8888-8888-8888-888888888881', 'A1', 2, TRUE),
          ('99999999-9999-9999-9999-999999999992', '88888888-8888-8888-8888-888888888882', 'B1', 4, TRUE),
          ('99999999-9999-9999-9999-999999999993', '88888888-8888-8888-8888-888888888883', 'P1', 6, TRUE)
      `);
    }

    const inventoryCount = await client.query('SELECT COUNT(*)::int AS count FROM inventory_items');
    if (inventoryCount.rows[0].count === 0) {
      await client.query(`
        INSERT INTO inventory_items (
          id, name, description, sku, unit, current_stock,
          minimum_stock, cost_per_unit, supplier_name, is_active
        ) VALUES
          ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Mantequilla clarificada', 'Base para salsas y terminaciones.', 'INS-GHEE-001', 'litros', 8, 3, 11.50, 'Lácteos Andinos', TRUE),
          ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'Cordero importado', 'Corte principal para fondos.', 'INS-LAMB-001', 'kilogramos', 18, 10, 24.00, 'Carnes de Autor', TRUE),
          ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', 'Cacao origen Tumaco', 'Usado en postres y ganaches.', 'INS-COCOA-001', 'kilogramos', 6, 4, 15.75, 'Casa Cacao', TRUE)
      `);

      await client.query(`
        INSERT INTO inventory_movements (id, item_id, movement_type, quantity, note, performed_by_user_id)
        VALUES
          ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'in', 8, 'Stock inicial del sistema', NULL),
          ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'in', 18, 'Stock inicial del sistema', NULL),
          ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb3', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', 'in', 6, 'Stock inicial del sistema', NULL)
      `);
    }

    if (env.adminEmail && env.adminPassword && env.adminName) {
      const existingAdmin = await client.query('SELECT id FROM users WHERE email = $1 LIMIT 1', [env.adminEmail.toLowerCase()]);

      if (existingAdmin.rowCount === 0) {
        const passwordHash = await hashPassword(env.adminPassword);
        await client.query(
          `INSERT INTO users (id, name, email, password_hash, phone, role)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [crypto.randomUUID(), env.adminName, env.adminEmail.toLowerCase(), passwordHash, null, 'admin'],
        );
      }
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Punto único de inicialización de base de datos al arrancar la API.
export async function initDb() {
  await runSchema();
  await seedData();
}
