import { z } from 'zod';

const uuidLike = z.string().regex(/^[0-9a-fA-F-]{36}$/);

// Estructura base compartida para crear o editar reservas.
const reservationPayloadSchema = z.object({
  reservationDate: z.iso.date(),
  reservationTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/),
  guestCount: z.coerce.number().int().min(1).max(12),
  tableTypeId: z.union([uuidLike, z.literal(''), z.null(), z.undefined()]),
  diningExperienceId: z.union([uuidLike, z.literal(''), z.null(), z.undefined()]),
  allergies: z.string().max(500).optional().or(z.literal('')),
  dietaryRestrictions: z.string().max(500).optional().or(z.literal('')),
  specialOccasion: z.string().max(160).optional().or(z.literal('')),
  guestNotes: z.string().max(600).optional().or(z.literal('')),
});

// Valida reservas creadas por clientes autenticados.
export const createReservationSchema = reservationPayloadSchema;

// Permite editar una reserva existente reutilizando las mismas reglas base.
export const updateReservationSchema = reservationPayloadSchema;

// Permite que administración ajuste el estado de una reserva existente.
export const updateReservationStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'finalized', 'cancelled']),
});
