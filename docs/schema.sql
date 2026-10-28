-- ==============================================================================
-- MERCHANTAPP - ESQUEMA RELACIONAL POSTGRESQL (SAAS ADMIN + BACKOFFICE TIENDAS)
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 1. SAAS ADMIN (Super Administración y Aprovisionamiento)
-- ==============================================================================

-- Tenants (Tiendas con cuenta única y credenciales maestras)
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_name VARCHAR(150) NOT NULL,
    legal_tax_id VARCHAR(30),
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    allowed_terminals_count INT NOT NULL DEFAULT 1,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('TRIAL', 'ACTIVE', 'SUSPENDED', 'CANCELLED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Cajas / Terminales contratadas por la tienda
CREATE TABLE pos_terminals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    terminal_number VARCHAR(50) NOT NULL, -- Ej: 'Caja 01 - Mostrador'
    enrollment_key VARCHAR(64) UNIQUE NOT NULL, -- Código único de vinculación del dispositivo
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'REVOKED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_tenant_terminal_number UNIQUE (tenant_id, terminal_number)
);

-- Correlación con el Hardware y Dispositivo Físico
CREATE TABLE device_bindings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    terminal_id UUID NOT NULL REFERENCES pos_terminals(id) ON DELETE CASCADE,
    device_uuid VARCHAR(100) NOT NULL, -- Android ID / Hardware UUID / Browser Fingerprint
    device_model VARCHAR(100), -- Ej: 'Sunmi V2 PRO', 'Samsung Galaxy Tab A8'
    os_version VARCHAR(50), -- Ej: 'Android 13'
    app_version VARCHAR(30) NOT NULL, -- '1.0.0'
    ip_address INET,
    mac_address VARCHAR(50),
    paired_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_terminal_device UNIQUE (terminal_id, device_uuid)
);

-- ==============================================================================
-- 2. BACKOFFICE TIENDA (Gestión, Catálogo, Usuarios y Personalización)
-- ==============================================================================

-- Usuarios de tienda y Cajeros
CREATE TABLE tenant_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(150),
    password_hash VARCHAR(255),
    role VARCHAR(20) NOT NULL CHECK (role IN ('STORE_ADMIN', 'SUPERVISOR', 'CASHIER')),
    cashier_pin VARCHAR(255), -- Hash del PIN (4 a 6 dígitos) para abrir o retomar turno en POS
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_tenant_user_email UNIQUE (tenant_id, email)
);

-- Personalización de la Tienda y Tickets Térmicos
CREATE TABLE store_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID UNIQUE NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    store_display_name VARCHAR(150),
    receipt_header_text TEXT,
    receipt_footer_text TEXT,
    logo_url TEXT,
    currency_symbol VARCHAR(10) NOT NULL DEFAULT 'MXN',
    tax_percentage DECIMAL(5,2) NOT NULL DEFAULT 16.00,
    enable_orders_kitchen BOOLEAN NOT NULL DEFAULT FALSE,
    primary_theme_color VARCHAR(20) DEFAULT '#2563EB',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Categorías de Productos
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(50) DEFAULT 'grid-outline',
    sort_order INT DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Catálogo de Productos
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    sku VARCHAR(60),
    barcode VARCHAR(60),
    name VARCHAR(150) NOT NULL,
    description TEXT,
    current_price DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    cost_price DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    stock INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_tenant_barcode ON products (tenant_id, barcode);
CREATE INDEX idx_products_tenant_category ON products (tenant_id, category_id);

-- Descuentos y Promociones
CREATE TABLE discounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    code VARCHAR(50),
    name VARCHAR(120) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('PERCENTAGE', 'FIXED_AMOUNT')),
    value DECIMAL(10,2) NOT NULL,
    min_purchase_amount DECIMAL(12,2) DEFAULT 0.00,
    valid_from TIMESTAMPTZ,
    valid_until TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 3. OPERACIÓN DE CAJA, TURNOS, CORTES Y TRANSACCIONES
-- ==============================================================================

-- Turnos de Caja
CREATE TABLE shifts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    terminal_id UUID NOT NULL REFERENCES pos_terminals(id),
    cashier_user_id UUID NOT NULL REFERENCES tenant_users(id),
    opening_cash DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    expected_cash DECIMAL(12,2),
    counted_cash DECIMAL(12,2),
    difference DECIMAL(12,2),
    opened_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    closed_at TIMESTAMPTZ,
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'CLOSED'))
);

CREATE INDEX idx_shifts_tenant_status ON shifts (tenant_id, status);

-- Transacciones / Ventas
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    shift_id UUID NOT NULL REFERENCES shifts(id),
    terminal_id UUID NOT NULL REFERENCES pos_terminals(id),
    transaction_folio VARCHAR(50) NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL,
    discount_total DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    taxes_total DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    total DECIMAL(12,2) NOT NULL,
    total_received DECIMAL(12,2) NOT NULL,
    change_given DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    payment_status VARCHAR(20) NOT NULL DEFAULT 'PAID' CHECK (payment_status IN ('PAID', 'REFUNDED', 'CANCELLED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_transactions_tenant_date ON transactions (tenant_id, created_at);
CREATE INDEX idx_transactions_shift ON transactions (shift_id);

-- Detalle de Productos por Venta
CREATE TABLE transaction_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_name_snapshot VARCHAR(150) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price_original DECIMAL(12,2) NOT NULL,
    unit_price_adjusted DECIMAL(12,2) NOT NULL,
    item_discount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    line_total DECIMAL(12,2) NOT NULL
);

-- Métodos de Pago por Venta (Mixtos)
CREATE TABLE transaction_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    method VARCHAR(30) NOT NULL CHECK (method IN ('EFECTIVO', 'TARJETA', 'TRANSFERENCIA')),
    amount DECIMAL(12,2) NOT NULL,
    reference_auth VARCHAR(100) -- Folio de autorización voucher
);

-- Cortes de Caja (Dashboard y Auditoría Financiera)
CREATE TABLE cash_cuts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    shift_id UUID NOT NULL REFERENCES shifts(id),
    supervisor_user_id UUID REFERENCES tenant_users(id),
    total_sales_cash DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    total_sales_card DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    total_sales_transfer DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    total_sales DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    cash_withdrawals DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    cash_deposits DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    final_cash_in_drawer DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    cut_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
