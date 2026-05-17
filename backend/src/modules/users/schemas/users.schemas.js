import { z } from 'zod';

// Permite al usuario actualizar su perfil básico sin tocar credenciales.
export const updateProfileSchema = z.object({
  name: z.string().min(2).max(120),
  phone: z.string().max(30).optional().or(z.literal('')),
});
