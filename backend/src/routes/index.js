import { Router } from 'express';

import authRoutes from '../modules/auth/routes/auth.routes.js';
import inventoryRoutes from '../modules/inventory/routes/inventory.routes.js';
import menuRoutes from '../modules/menu/routes/menu.routes.js';
import reservationsRoutes from '../modules/reservations/routes/reservations.routes.js';
import tablesRoutes from '../modules/tables/routes/tables.routes.js';
import usersRoutes from '../modules/users/routes/users.routes.js';

const router = Router();

// Endpoint liviano para comprobar disponibilidad de la API.
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'AFuegoLento API is running',
    timestamp: new Date().toISOString(),
  });
});

// Contenido editorial inicial que la landing puede consumir sin autenticación.
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

// Agrupa rutas por dominio para mantener un backend modular.
router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/menu', menuRoutes);
router.use('/reservations', reservationsRoutes);
router.use('/tables', tablesRoutes);
router.use('/inventory', inventoryRoutes);

export default router;
