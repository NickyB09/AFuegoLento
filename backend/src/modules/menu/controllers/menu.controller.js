import crypto from 'crypto';

import { ApiError } from '../../../utils/apiError.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { menuRepository } from '../repositories/menu.repository.js';
import { categorySchema, experienceSchema, itemSchema } from '../schemas/menu.schemas.js';

// Controladores para lectura pública del menú y mantenimiento administrativo.
export const menuController = {
  list: asyncHandler(async (req, res) => {
    const [categories, items, experiences] = await Promise.all([
      menuRepository.listCategories(),
      menuRepository.listItems(),
      menuRepository.listExperiences(),
    ]);

    res.json({ success: true, data: { categories, items, experiences } });
  }),

  adminList: asyncHandler(async (req, res) => {
    const [categories, items, experiences] = await Promise.all([
      menuRepository.listCategories(),
      menuRepository.listAllItems(),
      menuRepository.listAllExperiences(),
    ]);

    res.json({ success: true, data: { categories, items, experiences } });
  }),

  createCategory: asyncHandler(async (req, res) => {
    const payload = categorySchema.parse(req.body);
    const category = await menuRepository.createCategory({ id: crypto.randomUUID(), ...payload });
    res.status(201).json({ success: true, message: 'Category created', data: category });
  }),

  updateCategory: asyncHandler(async (req, res) => {
    const payload = categorySchema.parse(req.body);
    const category = await menuRepository.updateCategory(req.params.id, payload);

    if (!category) {
      throw new ApiError(404, 'Category not found');
    }

    res.json({ success: true, message: 'Category updated', data: category });
  }),

  deleteCategory: asyncHandler(async (req, res) => {
    const category = await menuRepository.deleteCategory(req.params.id);

    if (!category) {
      throw new ApiError(404, 'Category not found');
    }

    res.json({ success: true, message: 'Category deleted' });
  }),

  createExperience: asyncHandler(async (req, res) => {
    const payload = experienceSchema.parse(req.body);
    const experience = await menuRepository.createExperience({ id: crypto.randomUUID(), ...payload });
    res.status(201).json({ success: true, message: 'Experience created', data: experience });
  }),

  updateExperience: asyncHandler(async (req, res) => {
    const payload = experienceSchema.parse(req.body);
    const experience = await menuRepository.updateExperience(req.params.id, payload);

    if (!experience) {
      throw new ApiError(404, 'Experience not found');
    }

    res.json({ success: true, message: 'Experience updated', data: experience });
  }),

  deleteExperience: asyncHandler(async (req, res) => {
    const experience = await menuRepository.deleteExperience(req.params.id);

    if (!experience) {
      throw new ApiError(404, 'Experience not found');
    }

    res.json({ success: true, message: 'Experience deleted' });
  }),

  createItem: asyncHandler(async (req, res) => {
    const payload = itemSchema.parse(req.body);
    const item = await menuRepository.createItem({ id: crypto.randomUUID(), ...payload });
    res.status(201).json({ success: true, message: 'Menu item created', data: item });
  }),

  updateItem: asyncHandler(async (req, res) => {
    const payload = itemSchema.parse(req.body);
    const item = await menuRepository.updateItem(req.params.id, payload);

    if (!item) {
      throw new ApiError(404, 'Menu item not found');
    }

    res.json({ success: true, message: 'Menu item updated', data: item });
  }),

  deleteItem: asyncHandler(async (req, res) => {
    const item = await menuRepository.deleteItem(req.params.id);

    if (!item) {
      throw new ApiError(404, 'Menu item not found');
    }

    res.json({ success: true, message: 'Menu item deleted' });
  }),
};
