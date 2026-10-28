# MerchantApp 🚀

**MerchantApp** es un ecosistema integral de Punto de Venta (POS) y gestión comercial modular y adaptable, desarrollado con **React Native** para despliegue multiplataforma (Android nativo y Web en línea).

---

## 🏗️ Arquitectura y Separación de Proyectos

Para optimizar los pipelines de **CI/CD independientes**, despliegues aislados y mantenimiento sin acoplamiento, las aplicaciones están separadas en proyectos frontend independientes:

```text
MerchantFlow/
├── apps/
│   ├── MerchantFlowPOS/   # Terminal POS táctil (Android / Web) - ✅ Versión activa
│   └── MerchantFlowApp/   # Aplicación operativa y administrativa
├── .github/workflows/
│   ├── merchantflow-pos.yml # CI/CD automatizado independiente para POS
│   └── merchantflow-app.yml # CI/CD automatizado independiente para App de Gestión
├── docs/
│   └── DATA_PERSISTENCE_STRATEGY.md # Arquitectura Offline-First y Base de Datos
└── README.md
```

> 💡 **Nota sobre Repositorios:** Si se prefiere dividir físicamente en dos repositorios de GitHub independientes (`MerchantFlowPOS.git` y `MerchantFlowApp.git`), cada carpeta dentro de `apps/` ya cuenta con su propio `package.json`, TypeScript, configuración Expo y dependencias aisladas para ser movidas a su propio repo de forma inmediata.

---

## 🗄️ Persistencia de Datos & Sincronización en la Nube

Para garantizar que el punto de venta funcione sin interrupciones incluso sin conexión a internet, se definió una arquitectura **Offline-First**:
- **Base de Datos Local:** Implementación en SQLite / WatermelonDB en el cliente.
- **Patrón Outbox:** Registro instantáneo de ventas con estado `PENDING_SYNC` y subida asíncrona mediante workers al detectar red.
- **Consultas Delta Sync:** Descarga incremental de cambios en catálogo y precios.
- Consulta los detalles completos del esquema relacional y protocolos en [DATA_PERSISTENCE_STRATEGY.md](file:///c:/Users/Usuario/Documents/personal_devs/MerchantFlow/docs/DATA_PERSISTENCE_STRATEGY.md).

---

## 🖥️ Módulo `MerchantFlowPOS` (Terminal de Punto de Venta)

Ubicado en `apps/MerchantFlowPOS/`, implementa el prototipo funcional de la terminal de cobro.

### 🚀 Flujo de Onboarding & Operación Directa en Caja
1. **Arranque Inmediato en Caja:**
   - La aplicación inicia directamente en la interfaz de caja.
   - Presenta un modal inicial de **Control de Turno**, permitiendo **"Empezar turno"** (ingresando cajero y fondo inicial) o **"Retomar turno activo"** si ya había uno abierto.
2. **Panel Lateral Colapsable (Menú de Hamburguesa):**
   - Accionable desde la esquina superior izquierda.
   - Incluye viñetas de navegación:
     - 🛒 *Punto de Venta / Caja (Principal)*
     - 🍽️ *Comandas & Cocina (Flujo opcional)*
     - 💼 *Control de Turno (Estado de apertura/cierre)*
     - 🖨️ *Impresoras (Bluetooth / USB)*
     - ⚙️ *Configuración POS*
3. **Catálogo Intuitivo y Selección de Productos:**
   - Filtro horizontal dinámico por **categorías** (Bebidas, Alimentos, Cafetería, Postres, Abarrotes, etc.).
   - **Buscador en tiempo real** por nombre o código de barra.
   - Al tocar cualquier producto, se añade automáticamente al carrito/transacción sumando cantidades.
4. **Edición Flexible de Precios y Descuentos:**
   - Cada producto en el carrito cuenta con un botón de edición para ajustar el **precio unitario** o aplicar un **descuento** en vivo para la venta actual.
5. **Simulación de Cobro y Métodos de Pago:**
   - Opciones de pago: `EFECTIVO`, `TARJETA`, `TRANSFERENCIA`.
   - Botones rápidos de denominaciones y pago exacto.
   - Cálculo y visualización en tiempo real de:
     - **Monto cubierto**
     - **Faltante por cubrir** (bloquea la finalización si no está saldado)
     - **Cambio / Vuelto**
   - Al completar el cobro, se emite una simulación de **ticket de venta térmico** con desglose completo.

---

## 🏃 Instrucciones para Ejecutar `MerchantFlowPOS`

### Prerrequisitos
- Node.js (v18+)
- npm o yarn

### Pasos
1. Entrar en la carpeta de la app:
   ```bash
   cd apps/MerchantFlowPOS
   ```
2. Ejecutar en versión Web:
   ```bash
   npm run web
   ```
3. Ejecutar en Android:
   ```bash
   npm run android
   ```

---

## 🗺️ Roadmap de Periféricos & Hardware

- [x] **Prototipo Core POS:** Flujo de turno, catálogo, carrito dinámico, ajuste de precios, pagos mixtos y cambio.
- [ ] **Fase 1: Impresión Térmica:** Conexión nativa con impresoras ESC/POS vía Bluetooth Low Energy / Serial USB.
- [ ] **Fase 2: Lectores de Código de Barra:** Detección de dispositivos USB HID / Bluetooth y escáner por cámara.
- [ ] **Fase 3: MerchantFlowApp:** Panel administrativo centralizado.
