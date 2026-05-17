import { Router } from 'express';

import { authenticate } from '../../../middlewares/authenticate.js';
import { requireRole } from '../../../middlewares/requireRole.js';
import { reservationsController } from '../controllers/reservations.controller.js';

const router = Router();

// Expone reservas públicas mínimas y operaciones privadas de usuario/admin.
router.get('/table-types', reservationsController.tableTypes);
router.post('/', authenticate, reservationsController.create);
router.patch('/:id', authenticate, reservationsController.update);
router.get('/mine', authenticate, reservationsController.listMine);
router.get('/admin', authenticate, requireRole('admin'), reservationsController.listAll);
router.patch('/:id/status', authenticate, requireRole('admin'), reservationsController.updateStatus);
router.patch('/:id/cancel', authenticate, reservationsController.cancel);

export default router;
