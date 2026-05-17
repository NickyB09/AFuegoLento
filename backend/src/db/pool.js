import pg from 'pg';
import { env } from '../config/env.js';

const { Pool } = pg;

// Este pool reutiliza conexiones a PostgreSQL y evita abrir una nueva
// conexión por cada request.
export const pool = new Pool({
  connectionString: env.databaseUrl,
});
