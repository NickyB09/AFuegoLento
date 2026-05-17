import { Router } from 'express';

import { authenticate } from '../../../middlewares/authenticate.js';
import { requireRole } from '../../../middlewares/requireRole.js';
import { menuController } from '../controllers/menu.controller.js';

const router = Router();

// Rutas públicas del menú y operaciones privadas del panel admin.
router.get('/', menuController.list);
router.get('/admin', authenticate, requireRole('admin'), menuController.adminList);
router.post('/categories', authenticate, requireRole('admin'), menuController.createCategory);
router.patch('/categories/:id', authenticate, requireRole('admin'), menuController.updateCategory);
router.delete('/categories/:id', authenticate, requireRole('admin'), menuController.deleteCategory);
router.post('/experiences', authenticate, requireRole('admin'), menuController.createExperience);
router.patch('/experiences/:id', authenticate, requireRole('admin'), menuController.updateExperience);
router.delete('/experiences/:id', authenticate, requireRole('admin'), menuController.deleteExperience);
router.post('/items', authenticate, requireRole('admin'), menuController.createItem);
router.patch('/items/:id', authenticate, requireRole('admin'), menuController.updateItem);
router.delete('/items/:id', authenticate, requireRole('admin'), menuController.deleteItem);

export default router;
