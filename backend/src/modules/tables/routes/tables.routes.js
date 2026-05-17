import { Router } from 'express';

import { authenticate } from '../../../middlewares/authenticate.js';
import { requireRole } from '../../../middlewares/requireRole.js';
import { tablesController } from '../controllers/tables.controller.js';

const router = Router();

// Rutas públicas y administrativas relacionadas con la configuración de mesas.
router.get('/types', tablesController.listTypes);
router.get('/admin', authenticate, requireRole('admin'), tablesController.adminList);
router.post('/types', authenticate, requireRole('admin'), tablesController.createType);
router.patch('/types/:id', authenticate, requireRole('admin'), tablesController.updateType);
router.delete('/types/:id', authenticate, requireRole('admin'), tablesController.deleteType);
router.post('/', authenticate, requireRole('admin'), tablesController.createTable);
router.patch('/:id', authenticate, requireRole('admin'), tablesController.updateTable);
router.delete('/:id', authenticate, requireRole('admin'), tablesController.deleteTable);

export default router;
