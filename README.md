# AFuegoLento

![Expo](https://img.shields.io/badge/Expo-54-000020?style=for-the-badge&logo=expo&logoColor=white)
![React Native Web](https://img.shields.io/badge/React_Native_Web-0.21-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Express](https://img.shields.io/badge/Express-5.2-000000?style=for-the-badge&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)

> Plataforma web para restaurante gourmet con enfoque en reservas, experiencia editorial y gestión básica de menú.
> AFuegoLento ya está montado como **MVP full-stack funcional** con frontend web, backend API y base de datos relacional.

---

## Estado actual

### Ya implementado
- Landing/Home inicial
- Menú dinámico conectado a base de datos
- Flujo de reservas con fecha, hora, comensales, tipo de mesa y notas
- Registro, login, refresh token, logout y recuperación/restablecimiento de contraseña
- Vista de cuenta del usuario y listado de reservas propias
- Sección de contacto/ubicación
- Panel admin básico para gestionar menú y revisar reservas
- Backend con Express, JWT y PostgreSQL
- Arranque local completo con Docker Compose

### Pendiente / siguiente foco
- Rediseño visual de la landing para volverla más editorial y premium
- Pulido de responsive, spacing y jerarquía tipográfica en auth
- Mejoras visuales de Register, Login y Recovery Access
- Evolución del panel admin y validaciones más finas para producción

---

## Arquitectura

AFuegoLento está organizado como un **monorepo full-stack** con frontend y backend desacoplados:

```text
AFuegoLento/
├── frontend/          # Expo + React Native Web
├── backend/           # Express + PostgreSQL + JWT
├── docker-compose.yml # Orquestación local
└── package.json       # Workspaces y scripts raíz
```

### Backend modular

```text
backend/src
├── config/
├── db/
├── middlewares/
├── modules/
│   ├── account/
│   ├── auth/
│   ├── menu/
│   ├── reservations/
│   ├── tables/
│   └── users/
├── routes/
└── utils/
```

### Frontend por features

```text
frontend/src
├── components/
├── constants/
├── features/
│   ├── account/
│   ├── app/
│   ├── auth/
│   ├── home/
│   ├── menu/
│   └── reservations/
├── services/
└── utils/
```

### Principios aplicados
- Monorepo simple para iterar rápido
- Separación frontend/backend con contratos HTTP claros
- Backend modular por dominio
- SQL directo con `pg` sin ORM
- Configuración por variables de entorno
- Experiencia centrada en conversión a reserva

---

## Stack

| Área | Tecnología |
|---|---|
| Frontend | Expo 54 + React Native Web + NativeWind/Tailwind |
| Backend | Node.js + Express 5 |
| Auth | JWT + refresh tokens |
| Base de datos | PostgreSQL |
| Acceso a datos | `pg` + SQL directo |
| Infra local | Docker Compose |
| Estilo UI | enfoque gourmet/editorial |

---

## Setup local

### Requisitos
- Node.js 20+
- npm 10+
- Docker Desktop o Docker Engine

### 1. Configurar variables de entorno

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

> Configura secretos reales antes de cualquier despliegue. No se deben versionar credenciales.

### 2. Levantar todo con Docker

```bash
docker compose up --build
```

Servicios disponibles:
- Frontend web: `http://localhost:8081`
- Backend API health: `http://localhost:4000/api/health`
- PostgreSQL: `localhost:5432`

### 3. Admin inicial opcional

Si defines estas variables en `backend/.env`, el backend crea automáticamente un admin si todavía no existe:

- `ADMIN_NAME`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

---

## Desarrollo sin Docker

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend web

```bash
cd frontend
npm install
npm run web
```

### Desde la raíz

```bash
npm run dev:backend
npm run dev:web
```

---

## Variables de entorno

### Backend

| Variable | Propósito |
|---|---|
| `PORT` | puerto del backend |
| `DATABASE_URL` o variables DB equivalentes | conexión a PostgreSQL |
| `JWT_SECRET` | secreto para firmar access tokens |
| `JWT_REFRESH_SECRET` | secreto para refresh tokens |
| `ADMIN_NAME` | nombre del admin semilla |
| `ADMIN_EMAIL` | email del admin semilla |
| `ADMIN_PASSWORD` | password del admin semilla |

### Frontend

Usa `frontend/.env.example` como base para la URL del backend y ajustes locales de ejecución.

---

## Qué incluye este MVP

### Experiencia pública
- Home / landing inicial
- Menú navegable con contenido dinámico
- Formulario de reservas
- Contacto y ubicación

### Experiencia de usuario
- Registro
- Inicio de sesión
- Recuperación de acceso
- Restablecimiento de contraseña
- Mi cuenta
- Mis reservas

### Experiencia admin básica
- Gestión de menú
- Visualización de reservas

---

## Endpoints / dominios principales

- `/api/auth/*` — autenticación y recuperación de acceso
- `/api/menu/*` — menú público y edición admin
- `/api/reservations/*` — creación y consulta de reservas
- `/api/account/*` — datos del usuario autenticado
- `/api/tables/*` — soporte de mesas/tipos de mesa
- `/api/users/*` — utilidades de usuarios/admin

> Los prefijos exactos pueden depender del router principal del backend, pero estos son los dominios funcionales ya implementados.

---

## Decisiones importantes

### 1. Monorepo por practicidad
Se eligió mantener frontend y backend en el mismo repositorio para acelerar iteración, onboarding y despliegue local.

### 2. SQL directo en vez de ORM
La capa de datos usa `pg` y SQL explícito para mantener simple la curva de aprendizaje y el control del esquema.

### 3. Docker como forma principal de arranque
El proyecto se dejó listo para levantar el stack completo local sin instalar PostgreSQL aparte.

### 4. Prioridad de producto: reservas
Toda la experiencia está pensada para que la reserva sea la conversión principal del sitio.

### 5. Dirección visual gourmet/editorial
El frontend no se plantea como dashboard frío, sino como experiencia premium y sensorial inspirada en restaurante fine dining.

---

## Notas de desarrollo

- El backend inicializa esquema y datos semilla automáticamente.
- La recuperación de contraseña devuelve token en la respuesta solo en entorno de desarrollo.
- Las reservas manejan una versión inicial de estados simples como `confirmed` y `cancelled`.
- En Docker para Expo Web se usa `--localhost` para evitar problemas de acceso desde navegador local.

---

## Comandos útiles

```bash
# levantar todo con rebuild
docker compose up --build

# bajar servicios y volúmenes
docker compose down -v

# backend en desarrollo
npm run dev:backend

# frontend web en desarrollo
npm run dev:web
```

---

## Roadmap inmediato

1. Rediseñar la landing/home con una dirección visual más fuerte
2. Mejorar responsive global
3. Pulir pantallas de auth
4. Aplicar el rediseño al frontend real
5. Endurecer validaciones y flujos admin para una siguiente versión

---

## Autor

**Nicolás Andrés Betancur Ardila**  
Software Engineer en formación con foco en producto, arquitectura y experiencia de usuario.
