import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  StyleSheet,
  StatusBar,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { Header } from './src/components/Header';
import { SidebarDrawer } from './src/components/SidebarDrawer';
import { ProductCatalog } from './src/components/ProductCatalog';
import { TransactionCart } from './src/components/TransactionCart';
import { PortraitCartBar } from './src/components/PortraitCartBar';
import { TransactionCartModal } from './src/components/TransactionCartModal';
import { ShiftModal } from './src/components/ShiftModal';
import { EditItemModal } from './src/components/EditItemModal';
import { CheckoutModal } from './src/components/CheckoutModal';
import { ReceiptModal } from './src/components/ReceiptModal';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS } from './src/data/initialData';
import {
  Category,
  Product,
  CartItem,
  ShiftInfo,
  PaymentEntry,
  CompletedSale,
} from './src/types';

function POSAppContent() {
  const { theme, isDark } = useTheme();
  const { width, height } = useWindowDimensions();

  // Detección reactiva de orientación: Landscape (ancho >= alto) vs Portrait
  const isLandscape = width >= height;

  // Estado de Turno de Caja (Onboarding directo en caja)
  const [activeShift, setActiveShift] = useState<ShiftInfo | null>(null);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState<boolean>(true);

  // Estado de Navegación Lateral
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [currentScreen, setCurrentScreen] = useState<string>('pos');

  // Catálogo y Búsqueda
  const [categories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [products] = useState<Product[]>(INITIAL_PRODUCTS);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Carrito de Transacción
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [editingItem, setEditingItem] = useState<CartItem | null>(null);
  const [isCartModalOpen, setIsCartModalOpen] = useState<boolean>(false);

  // Checkout y Ticket
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [lastCompletedSale, setLastCompletedSale] = useState<CompletedSale | null>(null);

  // Manejadores de Turno
  const handleStartShift = (cashierName: string, initialCash: number) => {
    const newShift: ShiftInfo = {
      cashierName,
      initialCash,
      startedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isActive: true,
    };
    setActiveShift(newShift);
    setIsShiftModalOpen(false);
  };

  const handleResumeShift = () => {
    setIsShiftModalOpen(false);
  };

  const handleCloseShift = () => {
    setActiveShift(null);
  };

  // Manejadores de Catálogo / Carrito
  const handleAddProduct = (product: Product) => {
    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (it) => it.product.id === product.id && it.unitPrice === product.basePrice && it.discount === 0
      );

      if (existingIndex >= 0) {
        const updated = [...prevItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1,
        };
        return updated;
      }

      const newItem: CartItem = {
        cartItemId: `${product.id}-${Date.now()}`,
        product,
        quantity: 1,
        unitPrice: product.basePrice,
        discount: 0,
      };
      return [...prevItems, newItem];
    });
  };

  const handleIncrementQty = (cartItemId: string) => {
    setCartItems((prev) =>
      prev.map((it) =>
        it.cartItemId === cartItemId ? { ...it, quantity: it.quantity + 1 } : it
      )
    );
  };

  const handleDecrementQty = (cartItemId: string) => {
    setCartItems((prev) =>
      prev
        .map((it) =>
          it.cartItemId === cartItemId ? { ...it, quantity: it.quantity - 1 } : it
        )
        .filter((it) => it.quantity > 0)
    );
  };

  const handleRemoveItem = (cartItemId: string) => {
    setCartItems((prev) => prev.filter((it) => it.cartItemId !== cartItemId));
  };

  const handleSaveItemEdit = (
    cartItemId: string,
    newPrice: number,
    newDiscount: number
  ) => {
    setCartItems((prev) =>
      prev.map((it) =>
        it.cartItemId === cartItemId
          ? { ...it, unitPrice: newPrice, discount: newDiscount }
          : it
      )
    );
  };

  // Totales
  const subtotal = cartItems.reduce((acc, it) => acc + it.unitPrice * it.quantity, 0);
  const discountTotal = cartItems.reduce((acc, it) => acc + it.discount * it.quantity, 0);
  const totalAmount = Math.max(0, subtotal - discountTotal);
  const totalItemCount = cartItems.reduce((acc, it) => acc + it.quantity, 0);

  const handleFinishSale = (
    payments: PaymentEntry[],
    totalReceived: number,
    change: number
  ) => {
    const sale: CompletedSale = {
      id: `VTA-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      items: [...cartItems],
      subtotal,
      discountTotal,
      total: totalAmount,
      payments,
      totalReceived,
      changeGiven: change,
    };

    setLastCompletedSale(sale);
    setCartItems([]);
    setIsCheckoutOpen(false);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.surface }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Barra Superior con botón hamburguesa y Switch de Tema Oscuro */}
      <Header
        onToggleSidebar={() => setIsSidebarOpen(true)}
        activeShift={activeShift}
        onOpenShiftModal={() => setIsShiftModalOpen(true)}
      />

      {/* Contenido Principal de Caja (POS) */}
      <View
        style={[
          styles.posContainer,
          { backgroundColor: theme.background },
          isLandscape ? styles.posContainerLandscape : styles.posContainerPortrait,
        ]}
      >
        {/* Catálogo con categorías y buscador */}
        <ProductCatalog
          categories={categories}
          products={products}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
          searchQuery={searchQuery}
          onChangeSearchQuery={setSearchQuery}
          onAddProduct={handleAddProduct}
        />

        {/* En modo Landscape: Panel lateral fijo del Carrito */}
        {isLandscape && (
          <TransactionCart
            items={cartItems}
            onIncrementQty={handleIncrementQty}
            onDecrementQty={handleDecrementQty}
            onRemoveItem={handleRemoveItem}
            onEditItem={(item) => setEditingItem(item)}
            onClearCart={() => setCartItems([])}
            onOpenCheckout={() => setIsCheckoutOpen(true)}
          />
        )}
      </View>

      {/* En modo Portrait (rotación deshabilitada): Barra inferior miniatura con total, conteo y pase a cobro */}
      {!isLandscape && (
        <PortraitCartBar
          itemCount={totalItemCount}
          total={totalAmount}
          onOpenCartModal={() => setIsCartModalOpen(true)}
          onOpenCheckout={() => setIsCheckoutOpen(true)}
        />
      )}

      {/* Modal responsivo del carrito para modo vertical/portrait */}
      <TransactionCartModal
        visible={isCartModalOpen && !isLandscape}
        onClose={() => setIsCartModalOpen(false)}
        items={cartItems}
        onIncrementQty={handleIncrementQty}
        onDecrementQty={handleDecrementQty}
        onRemoveItem={handleRemoveItem}
        onEditItem={(item) => setEditingItem(item)}
        onClearCart={() => setCartItems([])}
        onOpenCheckout={() => setIsCheckoutOpen(true)}
      />

      {/* Menú Lateral Colapsable */}
      <SidebarDrawer
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeShift={activeShift}
        onOpenShiftModal={() => setIsShiftModalOpen(true)}
        currentScreen={currentScreen}
        onSelectScreen={setCurrentScreen}
      />

      {/* Modal Onboarding / Control de Turno */}
      <ShiftModal
        visible={isShiftModalOpen}
        activeShift={activeShift}
        onStartShift={handleStartShift}
        onResumeShift={handleResumeShift}
        onCloseShift={handleCloseShift}
      />

      {/* Modal de Edición de Precios / Descuentos por producto */}
      <EditItemModal
        visible={!!editingItem}
        item={editingItem}
        onClose={() => setEditingItem(null)}
        onSave={handleSaveItemEdit}
      />

      {/* Modal de Cobro & Métodos de Pago */}
      <CheckoutModal
        visible={isCheckoutOpen}
        totalAmount={totalAmount}
        onClose={() => setIsCheckoutOpen(false)}
        onFinishSale={handleFinishSale}
      />

      {/* Modal de Ticket Térmico Generado */}
      <ReceiptModal
        sale={lastCompletedSale}
        onClose={() => setLastCompletedSale(null)}
      />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <POSAppContent />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  posContainer: {
    flex: 1,
  },
  posContainerLandscape: {
    flexDirection: 'row',
  },
  posContainerPortrait: {
    flexDirection: 'column',
  },
});
