# 🚀 MerchantFlow Backend API

Backend centralizado desarrollado con **NestJS**, **Prisma ORM** y **PostgreSQL** (optimizado para **Neon Free Tier** y despliegues en **Google Cloud Run**).

---

## 🏗️ Arquitectura y Tecnologías

- **Framework:** [NestJS](https://nestjs.com/) (Modular, Inyección de dependencias, TypeScript estricto).
- **ORM:** [Prisma](https://www.prisma.io/) (PostgreSQL relacional, migraciones tipo-seguras).
- **Base de Datos:** PostgreSQL en **Neon** (Serverless Free Tier con SSL y Connection Pooling).
- **Documentación API:** Swagger / OpenAPI en `/docs`.
- **Contenedorización:** Docker Multi-stage ultra ligero, compatible con Google Cloud Run (`$PORT`, señales SIGTERM).
- **Monorepo:** Orquestado con **Turborepo** en la raíz.

---

## 🗄️ Esquema Relacional & Sincronización Offline-First

El backend implementa los modelos definidos en `docs/DATA_PERSISTENCE_STRATEGY.md`:

| Entidad | Descripción |
|---|---|
| `shifts` | Control de apertura, fondo inicial, ventas y cierre de turnos de caja |
| `categories` | Categorías de productos |
| `products` | Catálogo de productos, SKU/código de barra, precios y control de stock |
| `sales` | Tickets de venta con UUID cliente (soporte offline) y totales |
| `sale_items` | Detalle de líneas de venta y snapshots de precio histórico |
| `sale_payments` | Desglose por método de pago (`EFECTIVO`, `TARJETA`, `TRANSFERENCIA`) |

### Protocolo Sync:
- `POST /api/v1/sync/sales`: Sincronización Push idempotente por lotes desde terminales POS.
- `GET /api/v1/sync/pull?last_pulled_at=TIMESTAMP`: Sincronización Delta Pull para descargar cambios del catálogo.

---

## ⚙️ Conexión con Neon PostgreSQL (Free Tier)

1. Crea tu proyecto en [Neon.tech](https://neon.tech).
2. En el Dashboard de Neon, copia tu cadena de conexión (**Connection String**).
3. Asegúrate de seleccionar el modo **Pooled connection** (recomendado para Cloud Run y funciones sin estado).
4. Agrega tu cadena en `apps/backend/.env`:

```env
DATABASE_URL="postgresql://[usuario]:[password]@[endpoint-id]-pooler.[region].neon.tech/neondb?sslmode=require"
```

> ⚠️ **Importante con Neon:** Asegúrate de que el query parameter `?sslmode=require` esté presente al final de la URL para cumplir con el cifrado TLS obligatorio de Neon.

---

## 💻 Desarrollo Local

### 1. Instalación de dependencias:
```bash
# Desde la raíz del monorepo
npm install
```

### 2. Generar cliente Prisma y migrar:
```bash
cd apps/backend
npm run prisma:generate

# Para sincronizar el esquema con tu base de datos Neon:
npm run prisma:push

# Poblar catálogo demo:
npm run prisma:seed
```

### 3. Iniciar servidor en modo desarrollo:
```bash
npm run start:dev
```
- API Base: `http://localhost:3000/api/v1`
- Swagger UI: `http://localhost:3000/docs`
- Health check: `http://localhost:3000/health`

---

## 🐳 Pruebas Locales con Docker

### Opción A: Levantar todo con Docker Compose (API + Postgres local):
```bash
# Desde la raíz del repositorio
docker compose up --build
```
El backend estará disponible en `http://localhost:3000`.

### Opción B: Construir y correr solo el contenedor del backend:
```bash
# Construir imagen
docker build -t merchantflow-backend -f apps/backend/Dockerfile ./apps/backend

# Ejecutar con tu variable de Neon
docker run -p 3000:8080 -e DATABASE_URL="postgresql://user:pass@ep-xyz-pooler.neon.tech/neondb?sslmode=require" merchantflow-backend
```

---

## ☁️ Despliegue en Google Cloud Run

Cloud Run ejecuta contenedores sin estado que escalan a cero y escuchan en el puerto proveído por `$PORT` (por defecto `8080`).

### 1. Construir y enviar la imagen a Artifact Registry / Container Registry:
```bash
gcloud builds submit apps/backend --tag gcr.io/[PROJECT_ID]/merchantflow-backend:latest
```

### 2. Desplegar el servicio en Cloud Run:
```bash
gcloud run deploy merchantflow-backend \
  --image gcr.io/[PROJECT_ID]/merchantflow-backend:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars DATABASE_URL="postgresql://[user]:[pass]@[neon-host]-pooler.neon.tech/neondb?sslmode=require",NODE_ENV="production"
```

### 3. Características optimizadas para Cloud Run:
- **Port:** Configurado automáticamente para `$PORT` (0.0.0.0).
- **Graceful Shutdown:** `app.enableShutdownHooks()` intercepta `SIGTERM` para drenar conexiones activas de Prisma antes de terminar la instancia.
- **Connection Pooling:** Compatible con Neon pgbouncer para evitar saturación de conexiones en picos de escalado.
