# AFuegoLento

AFuegoLento es un monorepo full-stack para un restaurante gourmet con enfoque editorial. Hoy el proyecto queda con un **backend funcional**, un **frontend web responsive ya rediseñado en sus pantallas clave**, y una base clara para seguir con las vistas restantes sin rehacer la lógica de negocio.

## Quick path

1. Copia variables de entorno:
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```
2. Levanta el proyecto:
   ```bash
   docker compose up --build
   ```
3. Verifica backend:
   ```bash
   npm --workspace backend run smoke
   ```
4. Abre:
   - Frontend web: `http://localhost:8081`
   - API health: `http://localhost:4000/api/health`

## Supabase rápido

La forma más simple de conectar AFuegoLento con Supabase es **mantener el backend igual** y cambiar solo la conexión PostgreSQL:

1. Crea tu proyecto en Supabase.
2. En el dashboard, abre **Connect** y copia el **Session pooler** o **Transaction pooler**.
3. En `backend/.env` reemplaza:
   ```env
   DATABASE_URL=postgresql://postgres.xxxxx:[TU_PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   DATABASE_SSL=true
   ```
4. Arranca backend y frontend:
   ```bash
   docker compose up --build backend frontend
   ```
   o sin Docker:
   ```bash
   npm run dev:backend
   npm run dev:web
   ```

Con eso, el backend seguirá usando `pg`, pero ya persistiendo todo en Supabase.

## Estado actual

### Backend listo
- Registro, login, refresh token, logout y recuperación de contraseña
- Perfil del usuario autenticado
- Menú público y CRUD admin de categorías, platos y experiencias
- Reservas con validaciones reales de fecha, horario, capacidad y disponibilidad
- Edición y cancelación de reservas
- Estados de reserva: `pending`, `confirmed`, `finalized`, `cancelled`
- Tipos de mesa y mesas físicas
- Inventario con movimientos de stock e indicador de low stock
- PostgreSQL inicializado con esquema idempotente y datos semilla
- Smoke test para validar flujos principales
- Código backend comentado para facilitar mantenimiento

### Frontend listo hoy
- Home editorial responsive
- Drawer hamburguesa funcional
- CTA de reserva con control de autenticación
- Login y register rehechos con layout fullscreen y fondo cinematográfico
- Recovery/reset integrado en el flujo de auth
- Página de reservas conectada al backend
- Confirmación de reserva
- Mis reservas con acciones para editar y cancelar
- Ajustes de contraste, tipografía y CTA según referencias visuales

### Pendiente para próximas sesiones
- Seguir afinando pixel-perfect del frontend
- Completar vistas adicionales del menú/contacto/admin si se quiere un cierre visual más completo
- Integrar social login solo si se decide implementar OAuth real

## Qué implementamos hoy

## Frontend
- Se rehízo la landing/home con una estética más editorial y más cercana a las referencias del usuario.
- Se corrigió el menú para funcionar como drawer hamburguesa en vez de panel mal posicionado.
- Se volvió responsive el home, auth y las pantallas clave del flujo de reservas.
- Se rehicieron login y register con fondos fullscreen, mejor contraste y estructura más cercana a los mockups.
- Se eliminó el navbar superior en auth y se dejó acceso por hamburguesa.
- Se corrigieron botones, bordes y contrastes del hero, incluyendo `Ver menú`.
- Se ajustó el color de textos descriptivos del home para mantener una jerarquía visual consistente.

## Backend
- Se cerraron dominios faltantes: mesas e inventario.
- Se endureció el flujo de reservas con validaciones reales de negocio.
- Se añadió soporte para editar reservas sin bloquear la mesa por su propia ocupación.
- Se añadieron estados y acciones completas de reserva para usuario/admin.

## Documentación
- Se actualizó el README para reflejar el estado real del proyecto.
- Se mantuvo `docs/backend-api.md` como referencia principal de la API.
- Se añadió un resumen de continuidad de esta sesión en `docs/session-2026-05-16.md`.

## Stack

| Área | Tecnología |
|---|---|
| Frontend | Expo 54 + React Native Web |
| Backend | Node.js + Express 5 |
| Base de datos | PostgreSQL 16 |
| Auth | JWT access + refresh tokens persistidos |
| Infra local | Docker Compose |
| Estilo | Monorepo modular por dominios |

## Estructura

```text
AFuegoLento/
├── backend/
│   ├── scripts/
│   ├── sql/
│   └── src/
│       ├── config/
│       ├── db/
│       ├── middlewares/
│       ├── modules/
│       │   ├── auth/
│       │   ├── inventory/
│       │   ├── menu/
│       │   ├── reservations/
│       │   ├── tables/
│       │   └── users/
│       ├── routes/
│       └── utils/
├── frontend/
├── docs/
├── docker-compose.yml
└── package.json
```

## Backend por dominios

| Dominio | Qué resuelve | Rutas base |
|---|---|---|
| Auth | Sesión, refresh y recuperación de contraseña | `/api/auth/*` |
| Users | Perfil autenticado | `/api/users/*` |
| Menu | Menú público y CRUD admin | `/api/menu/*` |
| Reservations | Reservas del cliente y supervisión admin | `/api/reservations/*` |
| Tables | Tipos de mesa y mesas físicas | `/api/tables/*` |
| Inventory | Insumos y movimientos de stock | `/api/inventory/*` |
| Content | Datos base de marca/contacto para frontend | `/api/content` |

## Variables de entorno

### Backend

| Variable | Uso |
|---|---|
| `PORT` | Puerto HTTP del backend |
| `NODE_ENV` | Entorno de ejecución |
| `CLIENT_URL` | Origen permitido por CORS |
| `DATABASE_URL` | Conexión a PostgreSQL |
| `DATABASE_SSL` | Activa SSL para proveedores como Supabase |
| `JWT_ACCESS_SECRET` | Firma del access token |
| `JWT_REFRESH_SECRET` | Firma del refresh token |
| `JWT_ACCESS_EXPIRES_IN` | Vida del access token |
| `JWT_REFRESH_EXPIRES_IN` | Vida del refresh token |
| `ADMIN_NAME` | Nombre del admin semilla |
| `ADMIN_EMAIL` | Correo del admin semilla |
| `ADMIN_PASSWORD` | Password del admin semilla |

### Frontend

Usa `frontend/.env.example` para declarar la URL pública del backend. No hardcodees secretos ni endpoints de producción en componentes.

## Flujos principales

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `GET /api/auth/me`

### Reservas
- `GET /api/reservations/table-types`
- `POST /api/reservations`
- `PATCH /api/reservations/:id`
- `GET /api/reservations/mine`
- `GET /api/reservations/admin`
- `PATCH /api/reservations/:id/status`
- `PATCH /api/reservations/:id/cancel`

### Inventario
- `GET /api/inventory`
- `GET /api/inventory/:id/movements`
- `POST /api/inventory`
- `PATCH /api/inventory/:id`
- `POST /api/inventory/:id/movements`
- `DELETE /api/inventory/:id`

Más detalle en `docs/backend-api.md`.

## Desarrollo

### Con Docker

```bash
docker compose up --build
```

### Sin Docker

```bash
npm install
npm run dev:backend
npm run dev:web
```

### Verificación rápida

```bash
npm --workspace backend run db:check
npm --workspace backend run smoke
```

## Datos semilla

El backend crea automáticamente:
- categorías iniciales del menú
- experiencias gastronómicas
- platos base
- tipos de mesa y mesas físicas
- inventario de ejemplo
- usuario administrador si `ADMIN_*` está configurado

## Documentación adicional

- `docs/backend-api.md` — endpoints, payloads y reglas principales de la API
- `docs/session-2026-05-16.md` — resumen detallado de la sesión actual y continuidad
- `docs/deploy-production.md` — guía de despliegue productivo con Render + Vercel + Supabase

