import crypto from 'crypto';

import { ApiError } from '../../../utils/apiError.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { inventoryRepository } from '../repositories/inventory.repository.js';
import { inventoryItemSchema, inventoryMovementSchema } from '../schemas/inventory.schemas.js';

// Controladores administrativos para el inventario del restaurante.
export const inventoryController = {
  list: asyncHandler(async (req, res) => {
    const [items, recentMovements] = await Promise.all([
      inventoryRepository.listItems(),
      inventoryRepository.listMovements(),
    ]);

    res.json({ success: true, data: { items, recentMovements } });
  }),

  itemMovements: asyncHandler(async (req, res) => {
    const item = await inventoryRepository.findItemById(req.params.id);
    if (!item) {
      throw new ApiError(404, 'Inventory item not found');
    }

    const movements = await inventoryRepository.listMovements(req.params.id);
    res.json({ success: true, data: { item, movements } });
  }),

  create: asyncHandler(async (req, res) => {
    const payload = inventoryItemSchema.parse(req.body);
    const item = await inventoryRepository.createItem({ id: crypto.randomUUID(), ...payload });
    res.status(201).json({ success: true, message: 'Inventory item created', data: item });
  }),

  update: asyncHandler(async (req, res) => {
    const payload = inventoryItemSchema.parse(req.body);
    const item = await inventoryRepository.updateItem(req.params.id, payload);

    if (!item) {
      throw new ApiError(404, 'Inventory item not found');
    }

    res.json({ success: true, message: 'Inventory item updated', data: item });
  }),

  remove: asyncHandler(async (req, res) => {
    const item = await inventoryRepository.deleteItem(req.params.id);

    if (!item) {
      throw new ApiError(404, 'Inventory item not found');
    }

    res.json({ success: true, message: 'Inventory item deleted' });
  }),

  move: asyncHandler(async (req, res) => {
    const payload = inventoryMovementSchema.parse(req.body);
    const item = await inventoryRepository.applyMovement({
      id: crypto.randomUUID(),
      itemId: req.params.id,
      movementType: payload.movementType,
      quantity: payload.quantity,
      note: payload.note,
      performedByUserId: req.user.sub,
    });

    if (!item) {
      throw new ApiError(404, 'Inventory item not found');
    }

    res.json({ success: true, message: 'Inventory movement applied', data: item });
  }),
};
