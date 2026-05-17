// Esta clase representa errores controlados de negocio o validación.
// Permite adjuntar un código HTTP para que el middleware global responda
// con el estado correcto sin tratar el error como una caída interna.
export class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
}
