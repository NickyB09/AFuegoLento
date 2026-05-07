import { Router } from 'express';
import { authenticate } from '../../../middlewares/authenticate.js';
import { usersController } from '../controllers/users.controller.js';

const router = Router();

router.patch('/me', authenticate, usersController.updateProfile);

export default router;
