import { z } from 'zod';

const uuidLike = z.string().regex(/^[0-9a-fA-F-]{36}$/);
const optionalUuid = z.union([uuidLike, z.literal(''), z.null(), z.undefined()]);

export const categorySchema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().max(500).optional().or(z.literal('')),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

export const experienceSchema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().max(500).optional().or(z.literal('')),
  price: z.coerce.number().positive(),
  isActive: z.boolean().default(true),
});

export const itemSchema = z.object({
  categoryId: optionalUuid,
  experienceId: optionalUuid,
  name: z.string().min(2).max(160),
  description: z.string().max(600).optional().or(z.literal('')),
  price: z.coerce.number().positive(),
  imageUrl: z.union([z.url(), z.literal(''), z.null(), z.undefined()]),
  isAvailable: z.boolean().default(true),
});
