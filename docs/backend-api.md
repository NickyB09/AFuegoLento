# Backend API de AFuegoLento

Esta guía resume las rutas principales del backend para que puedas conectar las vistas pendientes sin tener que abrir cada controlador.

## Base URL

```text
http://localhost:4000/api
```

## Convención de respuesta

### Respuesta exitosa
```json
{
  "success": true,
  "message": "Optional message",
  "data": {}
}
```

### Respuesta con error
```json
{
  "success": false,
  "message": "Human readable error",
  "errors": []
}
```

## Auth

### POST `/auth/register`
Crea un usuario y devuelve tokens.

```json
{
  "name": "Juan Camilo",
  "email": "juan@example.com",
  "password": "Secret123!",
  "phone": "3000000000"
}
```

### POST `/auth/login`
Inicia sesión.

```json
{
  "email": "juan@example.com",
  "password": "Secret123!"
}
```

### POST `/auth/refresh`
Rota el refresh token.

```json
{
  "refreshToken": "jwt"
}
```

### POST `/auth/forgot-password`
Genera token de reseteo.

```json
{
  "email": "juan@example.com"
}
```

### POST `/auth/reset-password`
Actualiza la contraseña desde token.

```json
{
  "token": "reset-token",
  "newPassword": "NuevaClave123!"
}
```

### GET `/auth/me`
Requiere bearer token.

## Users

### PATCH `/users/me`
Actualiza nombre y teléfono del usuario autenticado.

```json
{
  "name": "Juan Actualizado",
  "phone": "3111111111"
}
```

## Menu

### GET `/menu`
Devuelve categorías, platos públicos y experiencias activas.

### GET `/menu/admin`
Requiere admin. Devuelve también registros no visibles públicamente.

### POST `/menu/categories`
```json
{
  "name": "Bebidas",
  "description": "Fermentos y vinos",
  "sortOrder": 5
}
```

### POST `/menu/experiences`
```json
{
  "name": "Maridaje Reserva",
  "description": "Selección especial",
  "price": 95,
  "isActive": true
}
```

### POST `/menu/items`
```json
{
  "categoryId": "uuid",
  "experienceId": "",
  "name": "Ostra curada",
  "description": "Con beurre blanc",
  "price": 24,
  "imageUrl": "",
  "isAvailable": true
}
```

Las rutas `PATCH` y `DELETE` usan el mismo recurso con `:id`.

## Reservations

### GET `/reservations/table-types`
Lista las configuraciones reservables de mesa.

### POST `/reservations`
Requiere bearer token. La API valida:
- fecha futura
- horario entre 6:00 PM y 11:00 PM
- capacidad compatible con el tipo de mesa
- existencia de experiencia si se envía
- disponibilidad real de una mesa

```json
{
  "reservationDate": "2026-05-25",
  "reservationTime": "19:00",
  "guestCount": 2,
  "tableTypeId": "uuid",
  "diningExperienceId": "uuid",
  "allergies": "",
  "dietaryRestrictions": "",
  "specialOccasion": "Aniversario",
  "guestNotes": "Mesa tranquila"
}
```

### PATCH `/reservations/:id`
Requiere bearer token. Permite editar una reserva propia cuando el estado todavía lo admite. Revalida disponibilidad, horario, capacidad y experiencia.

Usa el mismo payload de creación.

### GET `/reservations/mine`
Devuelve reservas del usuario autenticado.

### GET `/reservations/admin`
Vista completa para admin.

### PATCH `/reservations/:id/status`
Solo admin.

```json
{
  "status": "confirmed"
}
```

### PATCH `/reservations/:id/cancel`
Cliente o admin.

Estados disponibles hoy:
- `pending`
- `confirmed`
- `finalized`
- `cancelled`

## Tables

### GET `/tables/types`
Lista tipos de mesa para construir formularios o filtros.

### GET `/tables/admin`
Requiere admin. Devuelve:
- `tableTypes`
- `tables`

### POST `/tables/types`
```json
{
  "name": "Terraza para 2",
  "description": "Vista exterior",
  "capacityMin": 1,
  "capacityMax": 2
}
```

### POST `/tables`
```json
{
  "tableTypeId": "uuid",
  "code": "T1",
  "seats": 2,
  "isActive": true
}
```

Las rutas `PATCH` y `DELETE` usan `:id`.

## Inventory

### GET `/inventory`
Requiere admin. Devuelve:
- `items`
- `recentMovements`

Cada item incluye `is_low_stock` calculado desde base de datos.

### GET `/inventory/:id/movements`
Requiere admin. Devuelve un insumo y su historial.

### POST `/inventory`
```json
{
  "name": "Cacao origen Tumaco",
  "description": "Uso en postres",
  "sku": "INS-COCOA-001",
  "unit": "kilogramos",
  "minimumStock": 4,
  "costPerUnit": 15.75,
  "supplierName": "Casa Cacao",
  "isActive": true
}
```

### POST `/inventory/:id/movements`
Requiere admin. Ajusta stock y registra trazabilidad.

```json
{
  "movementType": "out",
  "quantity": 2,
  "note": "Producción del servicio nocturno"
}
```

Valores permitidos para `movementType`:
- `in`
- `out`
- `adjustment`

## Smoke test

La prueba rápida del backend vive en:

```text
backend/scripts/smoke.mjs
```

Y se ejecuta con:

```bash
npm --workspace backend run smoke
```

Valida:
- health
- content
- menu
- register
- login
- create reservation
- my reservations
