# MerchantApp 🚀

**MerchantApp** es un ecosistema integral de Punto de Venta (POS) y gestión comercial modular, moderno y adaptable. Está compuesto por aplicaciones frontend desarrolladas con **React Native** (móvil y web) y una **API REST centralizada** desarrollada con **NestJS**, **Prisma ORM** y **PostgreSQL (Neon)**.

---

## 🏛️ Arquitectura del Monorepo como Fuente de Verdad

El monorepo está orquestado mediante **npm workspaces** y **Turborepo** (`turbo.json`), permitiendo construir, probar y ejecutar de forma desacoplada tanto los clientes frontend como el backend:

```text
MerchantFlow/ (Raíz Monorepo)
├── apps/
│   ├── backend/            # [ACTIVO] API REST NestJS + Prisma ORM + PostgreSQL Neon (Cloud Run Ready)
│   ├── MerchantFlowPOS/    # [ACTIVO] Terminal de Punto de Venta (React Native / Android / Web)
│   └── MerchantFlowApp/    # [PENDIENTE] Backoffice administrativo / SaaS Web de Gestión
├── docs/
│   ├── DATABASE_DESIGN_SAAS_BACKOFFICE.md  # Diseño relacional multitenant y esquemas
│   ├── DATA_PERSISTENCE_STRATEGY.md        # Arquitectura Offline-First y Sync Protocol
│   └── schema.sql                          # DDL de PostgreSQL
├── docker-compose.yml      # Entorno de pruebas local contenedorizado
├── turbo.json              # Orquestador de builds y tareas concurrentes
├── package.json            # Scripts globales del monorepo
└── README.md
```

### 📦 Estado de las Aplicaciones del Ecosistema

| Proyecto | Ruta | Rol / Función | Estado Actual |
|---|---|---|---|
| **`MerchantFlowPOS`** | `apps/MerchantFlowPOS` | Terminal física y web de caja: catálogo, transacciones, cobros mixtos, turnos, soporte landscape/portrait y sincronización con backend. | ✅ **Activo y Conectado** |
| **`backend`** | `apps/backend` | API REST centralizada: control de turnos, catálogo, ventas, protocolo Sync Push/Pull idempotente, documentado con Swagger. | ✅ **Activo** |
| **`MerchantFlowApp`** | `apps/MerchantFlowApp` | Backoffice para administración de tiendas, configuración de impuestos, catálogo global, cortes de caja y personalización. | ⏳ **Pendiente para siguientes fases** |

---

## 🔄 Conexión de `MerchantFlowPOS` con el `backend`

`MerchantFlowPOS` implementa una arquitectura híbrida **Offline-First**:
1. **Health Check y Detección de Estado:**
   - En el encabezado ([`Header.tsx`](file:///c:/Users/Usuario/Documents/personal_devs/MerchantFlow/apps/MerchantFlowPOS/src/components/Header.tsx)) se muestra un distintivo en tiempo real: `En línea` (verde) u `Offline` (gris). Al tocar el distintivo, se puede disparar una sincronización manual inmediata.
2. **Pull (Descarga de Catálogo):**
   - Al iniciar, la app invoca `GET /api/v1/sync/pull` mediante [`ApiService.ts`](file:///c:/Users/Usuario/Documents/personal_devs/MerchantFlow/apps/MerchantFlowPOS/src/services/apiService.ts).
   - Si el backend está disponible, pobla el catálogo con los productos y categorías de la base de datos central.
   - Si no hay red, la terminal utiliza de forma transparente los datos locales preconfigurados sin interrumpir la operación.
3. **Push (Subida de Ventas y Turnos):**
   - Cuando se cobra una venta o se apertura un turno, se intenta enviar atómicamente a `POST /api/v1/sync/sales`.
   - Si la terminal pierde conectividad, la venta se almacena localmente en la cola de pendientes (`pendingSales`) y se actualiza el contador visual: `Sync (N)`. Al restaurar la conexión, se envían por lotes de forma idempotente.

---

## ⚡ Comandos del Monorepo

```bash
# 1. Instalar todas las dependencias del monorepo
npm install

# 2. Iniciar el Backend NestJS en desarrollo
npm run dev:backend
# URL: http://localhost:3000/api/v1
# Swagger Docs: http://localhost:3000/docs
# Health: http://localhost:3000/health

# 3. Iniciar la Terminal POS (MerchantFlowPOS)
cd apps/MerchantFlowPOS
npm run web       # Modo navegador
npm run android   # Dispositivo / Emulador Android

# 4. Pruebas con Docker Compose (Backend + PostgreSQL local)
docker compose up --build
```

---

## 🛠️ Variables de Entorno del POS (`MerchantFlowPOS`)

Para configurar la URL del backend en el cliente Expo:
```env
EXPO_PUBLIC_API_URL=http://localhost:3000/api/v1
```
*(Si pruebas en un celular físico vía Expo Go en la misma red Wi-Fi, puedes configurar la IP local de tu máquina, por ejemplo: `http://192.168.1.50:3000/api/v1`)*.
