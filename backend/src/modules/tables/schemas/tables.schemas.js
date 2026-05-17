import { z } from 'zod';

// Esquema para definir tipos de mesa reservables por capacidad.
export const tableTypeSchema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().max(500).optional().or(z.literal('')),
  capacityMin: z.coerce.number().int().min(1).max(24),
  capacityMax: z.coerce.number().int().min(1).max(24),
}).refine((payload) => payload.capacityMax >= payload.capacityMin, {
  message: 'capacityMax must be greater than or equal to capacityMin',
  path: ['capacityMax'],
});

// Esquema para mesas físicas administradas por el staff.
export const tableSchema = z.object({
  tableTypeId: z.string().uuid(),
  code: z.string().min(1).max(50),
  seats: z.coerce.number().int().min(1).max(24),
  isActive: z.boolean().default(true),
});
