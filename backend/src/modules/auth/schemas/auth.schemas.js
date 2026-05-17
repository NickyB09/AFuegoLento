import { z } from 'zod';

// Valida el alta de nuevos usuarios finales.
export const registerSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.email(),
  password: z.string().min(8).max(100),
  phone: z.string().max(30).optional().or(z.literal('')),
});

// Valida credenciales de acceso.
export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(100),
});

// Valida refresh token entregado por el cliente.
export const refreshSchema = z.object({
  refreshToken: z.string().min(10),
});

// Valida la solicitud de recuperación de contraseña.
export const forgotPasswordSchema = z.object({
  email: z.email(),
});

// Valida el uso del token de restablecimiento y la nueva contraseña.
export const resetPasswordSchema = z.object({
  token: z.string().min(10),
  newPassword: z.string().min(8).max(100),
});
