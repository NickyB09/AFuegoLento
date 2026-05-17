import { z } from 'zod';

// Esquema para crear o editar insumos del inventario.
export const inventoryItemSchema = z.object({
  name: z.string().min(2).max(140),
  description: z.string().max(500).optional().or(z.literal('')),
  sku: z.string().min(2).max(80),
  unit: z.string().min(1).max(30),
  minimumStock: z.coerce.number().min(0),
  costPerUnit: z.coerce.number().min(0),
  supplierName: z.string().max(140).optional().or(z.literal('')),
  isActive: z.boolean().default(true),
});

// Esquema para entradas o salidas de stock sobre un insumo existente.
export const inventoryMovementSchema = z.object({
  movementType: z.enum(['in', 'out', 'adjustment']),
  quantity: z.coerce.number().positive(),
  note: z.string().max(500).optional().or(z.literal('')),
});
