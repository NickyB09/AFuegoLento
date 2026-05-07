import crypto from 'crypto';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { menuRepository } from '../repositories/menu.repository.js';
import { categorySchema, experienceSchema, itemSchema } from '../schemas/menu.schemas.js';

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
    res.json({ success: true, message: 'Category updated', data: category });
  }),

  deleteCategory: asyncHandler(async (req, res) => {
    await menuRepository.deleteCategory(req.params.id);
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
    res.json({ success: true, message: 'Experience updated', data: experience });
  }),

  deleteExperience: asyncHandler(async (req, res) => {
    await menuRepository.deleteExperience(req.params.id);
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
    res.json({ success: true, message: 'Menu item updated', data: item });
  }),

  deleteItem: asyncHandler(async (req, res) => {
    await menuRepository.deleteItem(req.params.id);
    res.json({ success: true, message: 'Menu item deleted' });
  }),
};
