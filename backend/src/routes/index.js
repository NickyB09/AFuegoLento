import { Router } from 'express';

import authRoutes from '../modules/auth/routes/auth.routes.js';
import menuRoutes from '../modules/menu/routes/menu.routes.js';
import reservationsRoutes from '../modules/reservations/routes/reservations.routes.js';
import usersRoutes from '../modules/users/routes/users.routes.js';

const router = Router();

router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'AFuegoLento API is running',
    timestamp: new Date().toISOString(),
  });
});

router.get('/content', (req, res) => {
  res.json({
    success: true,
    data: {
      brand: {
        name: 'AFuegoLento',
        claim: 'Una experiencia editorial para reservas gastronómicas memorables.',
        description:
          'Restaurante gourmet de inspiración Michelin donde el tiempo, la técnica y el detalle construyen una experiencia íntima.',
      },
      contact: {
        phone: '+57 300 000 0000',
        email: 'reservas@afuegolento.local',
        address: 'Calle de las Brasas 45, Bogotá, Colombia',
        hours: 'Martes a sábado · 6:00 PM a 11:00 PM',
        mapEmbedUrl: 'https://maps.google.com/?q=4.7110,-74.0721&z=15&output=embed',
      },
    },
  });
});

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/menu', menuRoutes);
router.use('/reservations', reservationsRoutes);

export default router;
