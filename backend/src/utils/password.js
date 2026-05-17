import bcrypt from 'bcrypt';

// Se usa un costo moderado para balancear seguridad y tiempos de respuesta.
const SALT_ROUNDS = 12;

// Convierte una contraseña en un hash irreversible para almacenarla segura.
export function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

// Compara la contraseña plana contra el hash guardado en la base de datos.
export function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}
