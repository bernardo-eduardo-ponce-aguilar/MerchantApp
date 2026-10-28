# Estrategia de Persistencia de Datos y Sincronización

Este documento define la arquitectura y el ciclo de vida de persistencia para el ecosistema **MerchantApp**, abarcando tanto **MerchantFlowPOS** (terminal de venta rápida) como **MerchantFlowApp** (gestión y catálogo).

---

## 1. Principio Fundamental: Arquitectura Offline-First

Un sistema POS de ventas físicas no puede detener sus operaciones si la conexión a internet es inestable o nula. Por lo tanto, el sistema se basa en el principio **Offline-First**:

```mermaid
flowchart LR
    subgraph Terminal POS [MerchantFlowPOS Local]
        UI[UI / React Native] <--> LocalDB[(Base de Datos Local\nSQLite / WatermelonDB)]
        LocalDB <--> SyncQueue[Cola de Sincronización\nOutbox]
    end

    SyncQueue <-->|HTTPS / WebSockets\n(Cuando hay conexión)| CloudGateway[API Gateway / Backend]
    CloudGateway <--> CentralDB[(Base de Datos Central\nPostgreSQL)]

    subgraph App Administrador [MerchantFlowApp]
        AdminUI[Panel Administrativo] <--> CloudGateway
    end
```

---

## 2. Capa de Base de Datos Local (Terminal POS)

### Tecnología Recomendada:
- **`expo-sqlite` / `WatermelonDB`:**
  - Rendimiento nativo en Android (10,000+ registros consultables en milisegundos).
  - Compatible con React Native Web (usando adaptadores IndexedDB/LokiJS).
  - Soporte reactivo a través de Observables para que la UI se actualice automáticamente ante cambios.

### Modelado de Tablas Core:

1. **`shifts` (Turnos de Caja):**
   - `id`: UUID (String)
   - `cashier_name`: String
   - `initial_cash`: Float
   - `final_cash`: Float (nullable)
   - `opened_at`: ISO8601 Timestamp
   - `closed_at`: ISO8601 Timestamp (nullable)
   - `is_active`: Boolean
   - `sync_status`: Enum (`SYNCED`, `PENDING_SYNC`)

2. **`products` (Catálogo local):**
   - `id`: UUID
   - `category_id`: UUID
   - `name`: String
   - `code`: String (código de barra / SKU)
   - `base_price`: Float
   - `cost`: Float
   - `stock`: Integer
   - `updated_at`: ISO8601 Timestamp

3. **`sales` (Transacciones de Venta):**
   - `id`: UUID
   - `shift_id`: UUID
   - `subtotal`: Float
   - `discount_total`: Float
   - `total`: Float
   - `total_received`: Float
   - `change_given`: Float
   - `status`: Enum (`COMPLETED`, `CANCELLED`)
   - `created_at`: ISO8601 Timestamp
   - `sync_status`: Enum (`SYNCED`, `PENDING_SYNC`)

4. **`sale_items` (Detalle de Venta):**
   - `id`: UUID
   - `sale_id`: UUID
   - `product_id`: UUID
   - `product_name_snapshot`: String
   - `quantity`: Integer
   - `unit_price`: Float (precio al momento de la venta)
   - `unit_discount`: Float

5. **`sale_payments` (Desglose de Pago):**
   - `id`: UUID
   - `sale_id`: UUID
   - `method`: Enum (`EFECTIVO`, `TARJETA`, `TRANSFERENCIA`)
   - `amount`: Float

---

## 3. Proceso de Sincronización (Sync Protocol)

Para evitar colisiones y asegurar la integridad de la base de datos central (PostgreSQL):

### 3.1 Identificadores Universales (UUID v4)
- Todos los registros creados localmente (`sales`, `shifts`, etc.) usan **UUIDs generados por el cliente**. Esto elimina la necesidad de pedir IDs secuenciales al servidor mientras se opera offline.

### 3.2 Patrón Outbox (Bandeja de Salida Local)
1. Al cobrar una venta, la transacción se escribe atómicamente en SQLite con estado `sync_status = 'PENDING_SYNC'`.
2. Se genera un ticket térmico de inmediato (cero latencia de red).
3. Un worker de sincronización en segundo plano (`SyncWorker`) detecta registros pendientes:
   - Verifica conectividad a internet (`@react-native-community/netinfo`).
   - Envía el payload por lotes al endpoint `/api/v1/sync/sales`.
   - Al recibir confirmación `200 OK`, actualiza localmente a `sync_status = 'SYNCED'`.

### 3.3 Sincronización Bidireccional (Delta Sync):
- **Pull (Descarga):** El POS solicita al servidor `/api/v1/sync/pull?last_pulled_at=TIMESTAMP`.
  - Recibe únicamente productos, categorías y precios creados o modificados desde la última fecha.
- **Push (Subida):** El POS envía ventas cerradas, movimientos de caja y turnos finalizados.

---

## 4. Persistencia para la siguiente etapa (`Fase 1.5 - SQLite Implementation`)

En la siguiente etapa se creará el paquete o módulo:
`apps/MerchantFlowPOS/src/database/` con:
- `schema.ts`: Definición de tablas y migraciones.
- `database.ts`: Conexión de SQLite nativo / Web.
- `repositories/`:
  - `SaleRepository.ts` (Guardar venta, listar historial).
  - `ShiftRepository.ts` (Abrir turno, verificar turno activo, cerrar turno).
  - `ProductRepository.ts` (Lectura de catálogo rápido).
