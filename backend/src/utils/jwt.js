import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

// Firma el token de acceso de corta duración usado en requests autenticados.
export function signAccessToken(payload) {
  return jwt.sign(payload, env.jwtAccessSecret, {
    expiresIn: env.jwtAccessExpiresIn,
  });
}

// Firma el refresh token persistido en base de datos para renovar sesión.
export function signRefreshToken(payload) {
  return jwt.sign(payload, env.jwtRefreshSecret, {
    expiresIn: env.jwtRefreshExpiresIn,
  });
}

// Verifica y decodifica access tokens enviados por el cliente.
export function verifyAccessToken(token) {
  return jwt.verify(token, env.jwtAccessSecret);
}

// Verifica y decodifica refresh tokens antes de rotarlos.
export function verifyRefreshToken(token) {
  return jwt.verify(token, env.jwtRefreshSecret);
}
