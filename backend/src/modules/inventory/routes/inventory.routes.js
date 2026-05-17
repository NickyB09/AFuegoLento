import { Router } from 'express';

import { authenticate } from '../../../middlewares/authenticate.js';
import { requireRole } from '../../../middlewares/requireRole.js';
import { inventoryController } from '../controllers/inventory.controller.js';

const router = Router();

// Todas las rutas de inventario son administrativas porque exponen stock y costos.
router.use(authenticate, requireRole('admin'));
router.get('/', inventoryController.list);
router.get('/:id/movements', inventoryController.itemMovements);
router.post('/', inventoryController.create);
router.patch('/:id', inventoryController.update);
router.delete('/:id', inventoryController.remove);
router.post('/:id/movements', inventoryController.move);

export default router;
