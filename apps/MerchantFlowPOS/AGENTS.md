# Agent Guidelines - MerchantFlowPOS

Este documento define la arquitectura, convenciones y directrices de trabajo para los agentes de IA y desarrolladores en `MerchantFlowPOS`. Personaliza este archivo según evolucione la aplicación.

---

## 1. Contexto y Propósito de la Aplicación
`MerchantFlowPOS` es la aplicación de Punto de Venta (POS) del ecosistema MerchantFlow.
- **Enfoque:** Diseñada para terminales táctiles (Android tablets, dispositivos POS dedicados y navegadores web).
- **Prioridad de UI:** Layout responsive con soporte primordial para orientación **Landscape / Apaisado** (pantalla dividida para catálogo y carrito/checkout) y adaptación fluida a smartphones en vertical.

---

## 2. Stack Tecnológico
- **Framework:** Expo SDK (~58) / React Native 0.88 / React 19.
- **Web Support:** `react-native-web` (exportación estática a `dist/`).
- **Iconografía:** `@expo/vector-icons`.
- **Tipado:** TypeScript estricto (`tsc --noEmit`).
- **Móvil & Cloud Build:** Expo Application Services (EAS Build).

---

## 3. Estructura de Carpetas
```text
apps/MerchantFlowPOS/
├── assets/             # Recursos estáticos e iconos adaptativos
├── src/
│   ├── components/     # Componentes modulares (Cart, Catalog, Header, Layouts)
│   ├── data/           # Datos estáticos, mocks y fixtures
│   ├── theme/          # Paleta de colores, espaciados y tipografía unificada
│   └── types/          # Interfaces y contratos de TypeScript
├── App.tsx             # Punto de entrada
├── app.json            # Configuración de Expo (package: com.merchantflow.pos)
├── eas.json            # Configuración de perfiles de compilación EAS
└── package.json        # Dependencias y scripts
```

---

## 4. Convenciones de Desarrollo
1. **Regla de oro de Expo:**
   - Para instalar dependencias compatibles con el SDK, usar siempre:
     ```bash
     npx expo install <package>
     ```
2. **TypeScript Estricto:**
   - Evitar el uso de `any`. Definir siempre interfaces claras en `src/types/`.
   - Antes de considerar una tarea completada, validar:
     ```bash
     npx tsc --noEmit
     ```
3. **Continuous Native Generation (CNG):**
   - No crear carpetas `android/` o `ios/` manuales. Toda configuración nativa se gestiona en `app.json` y config plugins.

---

## 5. Estrategia de Ramas Git y Flujo de Trabajo
El proyecto sigue un modelo basado en dos ramas principales: `main` y `preview`. Queda prohibido el push directo a cualquiera de las dos.

### Jerarquía de Ramas
- **`main` (Producción):** Representa el código estable en producción.
  - Genera el artefacto final: **`.aab`** (Android App Bundle) para Google Play Store.
  - Solo recibe cambios mediante Pull Request (PR) provenientes exclusivamente de `preview`.
- **`preview` (Staging / Pruebas):** Rama integradora para control de calidad y pruebas en dispositivos reales.
  - Genera el artefacto de prueba: **`.apk`** descargable para instalación directa en terminales POS físicas o emuladores.
  - Solo recibe cambios mediante PR aprobados de ramas temporales.
- **Ramas temporales (`feature/*`, `fix/*`, `chore/*`):**
  - Se originan a partir de `preview` (o `main` para hotfixes críticos).
  - Al completar la tarea, se abre un Pull Request con destino a `preview`.

### Flujo Operativo (Step-by-Step)
```text
[feature/mi-funcionalidad] ---> (PR con checks) ---> [preview] (Build APK de prueba)
                                                          │
                                                    (PR validado)
                                                          ▼
                                                       [main] (Build AAB Producción)
```

1. **Crear rama:** `git checkout preview && git pull && git checkout -b feature/nombre-tarea`
2. **Desarrollo y pruebas locales:** `npx tsc --noEmit`
3. **Pull Request a `preview`:** Se ejecutan los gates de CI (Lint, Typecheck).
4. **Merge a `preview`:** El pipeline compila automáticamente el **APK** de prueba en EAS.
5. **Validación en hardware POS:** Se prueba el APK en la terminal.
6. **Pull Request de `preview` a `main`:** Se autoriza el release.
7. **Merge a `main`:** El pipeline genera el bundle final **AAB** para distribución a tiendas.

---

## 6. Pipeline CI/CD y Estrategia de Builds Android
- **Workflow:** `.github/workflows/merchantflow-pos.yml`
- **Quality Gates requeridos:**
  - `npm ci` (Instalación limpia de dependencias)
  - `npx tsc --noEmit` (Gate de TypeScript sin errores)
- **Estrategia por Rama:**
  - **Rama `preview`:** Dispara compilación EAS con perfil `preview` generando un **`.apk`** instalable directamente en dispositivos y terminales de prueba.
  - **Rama `main`:** Dispara compilación EAS con perfil `production` generando un **`.aab`** (Android App Bundle) para distribución en Google Play.
- **Secreto:** Requiere `EXPO_TOKEN` configurado en GitHub Secrets.

---

## 7. Personalizaciones del Proyecto
<!-- Añade aquí tus notas personalizadas, endpoints de APIs o reglas de negocio futuras -->
- [ ] Conexión a pasarela de cobros / lector de tarjetas.
- [ ] Sincronización offline-first de transacciones.
