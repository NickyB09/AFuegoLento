// Envuelve controladores async para reenviar errores al middleware global
// sin repetir try/catch en cada endpoint.
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
