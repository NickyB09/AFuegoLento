import { app } from './app.js';
import { env } from './config/env.js';
import { pool } from './db/pool.js';
import { initDb } from './db/init.js';

// Espera a que PostgreSQL acepte conexiones antes de inicializar tablas/semillas.
async function waitForDb(retries = 30, delayMs = 3000) {
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      await pool.query('SELECT 1');
      return;
    } catch (error) {
      if (attempt === retries) throw error;
      console.log(`Database not ready (attempt ${attempt}/${retries}): ${error.message}`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

// Abre primero el puerto HTTP para que Render detecte el servicio.
// Luego inicializa la base de datos en segundo plano.
async function bootstrap() {
  app.listen(env.port, () => {
    console.log(`Backend running on http://localhost:${env.port}`);
  });

  try {
    await waitForDb();
    await initDb();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database', error);

    if (env.nodeEnv !== 'production') {
      process.exit(1);
    }
  }
}

bootstrap().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});
