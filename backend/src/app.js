import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

import { env } from './config/env.js';
import routes from './routes/index.js';
import { errorHandler } from './middlewares/errorHandler.js';

// La aplicación Express se exporta separada del bootstrap para facilitar
// pruebas, reutilización y arranque limpio desde server.js.
export const app = express();

// Permite solicitudes del frontend configurado y el envío de credenciales.
app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  }),
);

// Añade headers de seguridad básicos.
app.use(helmet());

// Habilita parseo de JSON y cookies entrantes.
app.use(express.json());
app.use(cookieParser());

// Monta todas las rutas de negocio bajo /api.
app.use('/api', routes);

// Debe ir al final para capturar errores de cualquier módulo.
app.use(errorHandler);
