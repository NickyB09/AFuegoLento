import { Router } from 'express';

import { authenticate } from '../../../middlewares/authenticate.js';
import { usersController } from '../controllers/users.controller.js';

const router = Router();

// Exposición del perfil del usuario autenticado.
router.patch('/me', authenticate, usersController.updateProfile);

export default router;
