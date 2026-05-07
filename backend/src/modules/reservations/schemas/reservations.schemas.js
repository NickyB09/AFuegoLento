import { z } from 'zod';

const uuidLike = z.string().regex(/^[0-9a-fA-F-]{36}$/);

export const createReservationSchema = z.object({
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
