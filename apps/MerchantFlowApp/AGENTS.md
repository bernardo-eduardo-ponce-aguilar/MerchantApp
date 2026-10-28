# Agent Guidelines - MerchantFlowApp

Este documento define la arquitectura, convenciones y directrices de trabajo para los agentes de IA y desarrolladores en `MerchantFlowApp`. Personaliza este archivo según evolucione la aplicación.

---

## 1. Contexto y Propósito de la Aplicación
`MerchantFlowApp` es la aplicación principal del comerciante / administrador (Backoffice y gestión de operaciones).
- **Enfoque:** Dashboard administrativo, métricas de ventas, inventario, configuración de comercios y reportería.
- **Plataformas objetivo:** Web y soporte móvil multi-plataforma.

---

## 2. Stack Tecnológico
- **Framework:** Expo SDK (~58) / React Native 0.88 / React 19.
- **Web Support:** `react-native-web` (exportación estática a `dist/`).
- **Tipado:** TypeScript estricto (`tsc --noEmit`).
- **Navegación:** Expo Router / React Navigation (según configuración del proyecto).

---

## 3. Estructura de Carpetas
```text
apps/MerchantFlowApp/
├── assets/             # Recursos estáticos, logos e iconografía
├── App.tsx             # Componente raíz / Entrada
├── app.json            # Metadatos del proyecto Expo
└── package.json        # Dependencias y scripts
```

---

## 4. Convenciones de Desarrollo
1. **Instalación de Dependencias:**
   - Usar siempre el CLI de Expo para garantizar compatibilidad con el SDK:
     ```bash
     npx expo install <package>
     ```
2. **TypeScript Estricto:**
   - Todo nuevo componente o módulo debe tener tipos definidos.
   - Ejecutar verificación de tipos antes de concluir tareas:
     ```bash
     npx tsc --noEmit
     ```
3. **Continuous Native Generation (CNG):**
   - Evitar crear directorios `android/` o `ios/` manuales. Las configuraciones nativas se definen en `app.json`.

---

## 5. Estrategia de Ramas Git y Flujo de Trabajo
El proyecto opera con dos ramas principales: `main` y `preview`. No se permite el push directo a ninguna de ellas.

### Jerarquía de Ramas
- **`main` (Producción Web):** Código estable en producción.
  - Artefacto final: Bundle estático optimizado para el entorno productivo de la plataforma Web (`app-web-dist`).
  - Solo recibe cambios mediante Pull Request (PR) provenientes de `preview`.
- **`preview` (Staging / Entorno de Pruebas Web):**
  - Artefacto de validación: Bundle web para desplegar en entorno de staging/preview (ej. Vercel Preview, Cloudflare Pages staging).
  - Solo recibe cambios mediante PR aprobados de ramas temporales.
- **Ramas temporales (`feature/*`, `fix/*`, `chore/*`):**
  - Se originan a partir de `preview`.
  - Al completarse el desarrollo, se crea un PR con destino a `preview`.

### Flujo Operativo (Step-by-Step)
```text
[feature/nueva-vista] ---> (PR con checks) ---> [preview] (Bundle Web Staging)
                                                     │
                                               (PR validado)
                                                     ▼
                                                  [main] (Bundle Web Producción)
```

1. **Crear rama:** `git checkout preview && git pull && git checkout -b feature/nombre-tarea`
2. **Desarrollo y pruebas locales:** `npx tsc --noEmit` y `npx expo export --platform web`
3. **Pull Request a `preview`:** El CI ejecuta los gates (Lint, Typecheck).
4. **Merge a `preview`:** Se genera y almacena el artefacto web de staging (`app-web-dist`).
5. **Aprobación de Release:** Se abre un Pull Request de `preview` hacia `main`.
6. **Merge a `main`:** Se genera el artefacto final de producción listo para el servidor web/CDN.

---

## 6. Pipeline CI/CD
- **Workflow:** `.github/workflows/merchantflow-app.yml`
- **Quality Gates requeridos:**
  - `npm ci`
  - `npx tsc --noEmit`
- **Artefactos generados:**
  - `app-web-dist`: Bundle web estático compilado con `npx expo export --platform web`, ubicado en `apps/MerchantFlowApp/dist/`.

---

## 7. Personalizaciones del Proyecto
<!-- Añade aquí tus notas personalizadas, endpoints de APIs o reglas de negocio futuras -->
- [ ] Implementar autenticación y gestión de sesiones de comerciantes.
- [ ] Conectar módulos de reportería y métricas en tiempo real.
