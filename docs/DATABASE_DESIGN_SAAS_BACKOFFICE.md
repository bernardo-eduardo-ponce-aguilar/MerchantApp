# Diseño de Base de Datos Multitenant: SaaS Admin & Backoffice

Este documento describe la arquitectura de base de datos relacional (PostgreSQL) para el ecosistema **MerchantApp**, estructurada en dos niveles administrativos principales:
1. **SaaS Admin:** Control maestro de suscripciones, licenciamiento de terminales (cajas) por tienda y enrolamiento de hardware.
2. **Backoffice Tienda (Tenant):** Administración operativa del negocio (catálogo, precios, descuentos, personalización de tickets y esquema de impuestos, dashboard de cortes de caja, transacciones y control de cajeros con PIN).

---

## 🏛️ Diagrama Entidad-Relación (ERD)

```mermaid
erDiagram
    %% SaaS Admin Core
    TENANTS ||--o{ POS_TERMINALS : owns
    TENANTS ||--o{ TENANT_USERS : employs
    TENANTS ||--o{ CATEGORIES : manages
    TENANTS ||--o{ PRODUCTS : owns
    TENANTS ||--o{ DISCOUNTS : offers
    TENANTS ||--o{ STORE_SETTINGS : configures
    TENANTS ||--o{ SHIFTS : tracks
    TENANTS ||--o{ TRANSACTIONS : processes

    POS_TERMINALS ||--o{ DEVICE_BINDINGS : registers
    POS_TERMINALS ||--o{ SHIFTS : operates_on

    %% Backoffice Store Core
    CATEGORIES ||--o{ PRODUCTS : groups
    TENANT_USERS ||--o{ SHIFTS : opens_closes
    SHIFTS ||--o{ TRANSACTIONS : contains
    TRANSACTIONS ||--o{ TRANSACTION_ITEMS : includes
    TRANSACTIONS ||--o{ TRANSACTION_PAYMENTS : receives_multiple
    SHIFTS ||--o{ CASH_CUTS : produces

    TENANTS {
        uuid id PK
        string business_name
        string legal_tax_id "RFC/NIF"
        string email UK
        string password_hash
        int allowed_terminals_count "Cajas contratadas"
        string status "TRIAL, ACTIVE, SUSPENDED"
        timestamp created_at
    }

    POS_TERMINALS {
        uuid id PK
        uuid tenant_id FK
        string terminal_number "Ej. Caja 01"
        string enrollment_key UK "Código único de vinculación"
        string status "ACTIVE, INACTIVE, REVOKED"
    }

    DEVICE_BINDINGS {
        uuid id PK
        uuid terminal_id FK
        string device_uuid UK "Hardware UUID / Android ID"
        string device_model "Ej. Sunmi V2 / Tablet Samsung"
        string os_version "Android 13 / Chrome 120"
        string app_version "1.0.0"
        string ip_address
        string mac_address
        timestamp paired_at
        timestamp last_active_at
    }

    STORE_SETTINGS {
        uuid id PK
        uuid tenant_id FK
        string store_display_name
        string receipt_header_text
        string receipt_footer_text
        string logo_url
        string currency_symbol "MXN, USD"
        string tax_scheme "GENERAL_PUBLIC, ITEMIZED_TAX"
        boolean display_tax_breakdown_on_receipt "Desglosar IVA o cobrar neto"
        decimal tax_percentage "16.0"
        boolean enable_orders_kitchen "Flujo comandas opcional"
        string primary_theme_color
    }

    TENANT_USERS {
        uuid id PK
        uuid tenant_id FK
        string full_name
        string email UK
        string password_hash
        string role "STORE_ADMIN, SUPERVISOR, CASHIER"
        string cashier_pin "Hash seguro de 4 o 6 digitos"
        boolean is_active
    }

    TRANSACTIONS {
        uuid id PK
        uuid tenant_id FK
        uuid shift_id FK
        uuid terminal_id FK
        string transaction_folio "FOL-10023"
        decimal subtotal
        decimal discount_total
        boolean is_tax_itemized "Si se desglosó impuesto"
        decimal taxes_total "0.00 en ventas a publico en general"
        decimal total
        decimal total_received "Suma de todos los pagos"
        decimal change_given "Cambio entregado"
        string payment_status "PAID, REFUNDED, CANCELLED"
        timestamp created_at
    }

    TRANSACTION_PAYMENTS {
        uuid id PK
        uuid transaction_id FK
        int payment_sequence "Orden del abono"
        string method "EFECTIVO, TARJETA_DEBITO, TARJETA_CREDITO, TRANSFERENCIA, VALES"
        decimal amount_tendered "Entregado por el cliente"
        decimal amount_applied "Aplicado a la cuenta"
        decimal change_amount "Cambio generado"
        string reference_auth "Autorización bancaria"
        string terminal_lot_number
    }
```

---

## 💳 1. Alternancia de Múltiples Formas de Pago en una Transacción (Pagos Mixtos)

En operaciones reales de punto de venta, un cliente puede pagar una cuenta combinando diferentes métodos (ejemplo: cuenta total de \$1,000 MXN pagada con \$400 en Efectivo y \$600 con Tarjeta de Débito, o con \$800 en Transferencia y \$500 en Efectivo recibiendo \$300 de cambio).

### Tabla `transaction_payments`
Cada transacción en `transactions` puede contener uno o más registros en `transaction_payments`:
- `id`: UUID (PK).
- `transaction_id`: UUID (FK a `transactions`).
- `payment_sequence`: Entero secuencial que indica el orden en el que se fueron recibiendo los abonos (1, 2, 3...).
- `method`: Tipo de forma de pago (`EFECTIVO`, `TARJETA_DEBITO`, `TARJETA_CREDITO`, `TRANSFERENCIA`, `VALES`, `OTRO`).
- `amount_tendered`: Cantidad entregada o procesada por el cliente para este método.
- `amount_applied`: Cantidad efectiva que cubre el saldo de la venta.
- `change_amount`: Si el método es `EFECTIVO` y `amount_tendered > amount_applied`, se almacena aquí el cambio/vuelto originado por este pago.
- `reference_auth`: Folio de autorización o voucher bancario devuelto por la pasarela/terminal de tarjeta.

**Regla de Integridad:**
$$\sum \text{amount\_applied} = \text{transactions.total}$$
$$\sum \text{amount\_tendered} = \text{transactions.total\_received}$$
$$\sum \text{change\_amount} = \text{transactions.change\_given}$$

---

## 🧾 2. Esquema de Impuestos Personalizable: Público General vs Desglose Tributario

Muchos comercios (cafeterías, abarrotes, fondas, tiendas de conveniencia) comercializan productos con **precio final neto** y emiten comprobantes simplificados a **Público en General**, consolidando una factura global al final del día/mes sin calcular ni desglosar IVA en cada ticket individual. Otros comercios sí requieren desglosar subtotal e IVA por venta.

### En `store_settings`:
- **`tax_scheme`:**
  - `'GENERAL_PUBLIC'` *(Predeterminado)*: Las ventas se registran y cobran a precio neto cerrado.
  - `'ITEMIZED_TAX'`: El sistema calcula y segrega el subtotal base y el porcentaje de impuesto.
- **`display_tax_breakdown_on_receipt` (Boolean):**
  - Si es `false`: En la pantalla del POS y en el ticket térmico impreso solo se imprime:
    ```text
    Subtotal:           $150.00
    Descuento:           -$0.00
    TOTAL A PAGAR:      $150.00
    (Venta a Público en General)
    ```
  - Si es `true`: Se imprime el desglose formal:
    ```text
    Subtotal:           $129.31
    IVA (16%):           $20.69
    TOTAL A PAGAR:      $150.00
    ```

### En `transactions`:
- `is_tax_itemized`: Booleano guardado como snapshot histórico de si esa venta particular mostró o desglosó impuestos.
- `taxes_total`: Monto de impuesto calculado (`0.00` cuando la tienda opera en régimen simplificado / público en general).
