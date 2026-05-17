import { app } from './app.js';
import { env } from './config/env.js';
import { pool } from './db/pool.js';
import { initDb } from './db/init.js';

// Espera a que PostgreSQL acepte conexiones antes de continuar con el arranque.
async function waitForDb(retries = 10, delayMs = 3000) {
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      await pool.query('SELECT 1');
      return;
    } catch (error) {
      if (attempt === retries) throw error;
      console.log(`Database not ready (attempt ${attempt}/${retries}), retrying...`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

// Inicializa base de datos, semillas y luego deja el servidor escuchando.
async function bootstrap() {
  await waitForDb();
  await initDb();

  app.listen(env.port, () => {
    console.log(`Backend running on http://localhost:${env.port}`);
  });
}

bootstrap().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});
