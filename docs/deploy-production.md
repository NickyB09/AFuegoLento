# Deploy de producción · AFuegoLento

Este proyecto queda preparado para desplegarse con:

- **Frontend web:** Vercel
- **Backend API:** Render
- **Base de datos:** Supabase Postgres

## 1) Backend en Render

El repo ya incluye `render.yaml` en la raíz para que Render detecte la configuración base del servicio.

### Variables obligatorias en Render

Configura estas variables antes del primer deploy:

- `CLIENT_URL` → URL pública del frontend en Vercel
- `DATABASE_URL` → connection string del pooler de Supabase
- `ADMIN_NAME`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

### Variables ya definidas en `render.yaml`

- `NODE_ENV=production`
- `PORT=10000`
- `DATABASE_SSL=true`
- `JWT_ACCESS_SECRET` generado por Render
- `JWT_REFRESH_SECRET` generado por Render
- `JWT_ACCESS_EXPIRES_IN=15m`
- `JWT_REFRESH_EXPIRES_IN=7d`

### Pasos

1. Entra a Render.
2. Crea un **Blueprint** o un **Web Service** desde el repo `NickyB09/AFuegoLento`.
3. Si usas Blueprint, Render tomará `render.yaml`.
4. Completa las variables marcadas con `sync: false`.
5. Confirma que el servicio publique `https://TU_BACKEND.onrender.com/api/health`.

## 2) Frontend en Vercel

El frontend ya incluye `frontend/vercel.json`.

### Variable obligatoria en Vercel

- `EXPO_PUBLIC_API_URL` → `https://TU_BACKEND.onrender.com/api`

### Pasos

1. Entra a Vercel.
2. Importa el repo `NickyB09/AFuegoLento`.
3. En **Root Directory** selecciona `frontend`.
4. Agrega `EXPO_PUBLIC_API_URL`.
5. Deploy.

## 3) Base de datos en Supabase

Usa el **Session pooler** o **Transaction pooler** de Supabase y pégalo en:

- `DATABASE_URL`

Como el backend usa `pg` y el proyecto ya contempla Supabase, mantén:

- `DATABASE_SSL=true`

## 4) Orden recomendado

1. Deploy backend en Render
2. Copiar URL pública del backend
3. Configurar `EXPO_PUBLIC_API_URL` en Vercel
4. Deploy frontend en Vercel
5. Copiar URL pública del frontend
6. Actualizar `CLIENT_URL` en Render
7. Redeploy backend

## 5) Verificación post-deploy

### Backend

- `GET /api/health`
- `GET /api/content`
- `GET /api/menu`

### Frontend

- Home carga correctamente
- Registro/login funcionan
- Reserva crea registros reales
- Mis reservas lista resultados

## 6) Comandos útiles locales

```bash
npm --workspace backend run db:check
npm --workspace backend run smoke
cd frontend && npm run build:web
```
