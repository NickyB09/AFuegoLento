// Restringe el acceso a roles específicos una vez authenticate ya cargó
// la información del usuario en req.user.
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    next();
  };
}
