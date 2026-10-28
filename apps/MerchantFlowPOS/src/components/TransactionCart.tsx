import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CartItem } from '../types';

interface TransactionCartProps {
  items: CartItem[];
  onIncrementQty: (cartItemId: string) => void;
  onDecrementQty: (cartItemId: string) => void;
  onRemoveItem: (cartItemId: string) => void;
  onEditItem: (item: CartItem) => void;
  onClearCart: () => void;
  onOpenCheckout: () => void;
}

export const TransactionCart: React.FC<TransactionCartProps> = ({
  items,
  onIncrementQty,
  onDecrementQty,
  onRemoveItem,
  onEditItem,
  onClearCart,
  onOpenCheckout,
}) => {
  const subtotal = items.reduce(
    (acc, it) => acc + it.unitPrice * it.quantity,
    0
  );
  const discountTotal = items.reduce(
    (acc, it) => acc + it.discount * it.quantity,
    0
  );
  const total = Math.max(0, subtotal - discountTotal);
  const totalItemCount = items.reduce((acc, it) => acc + it.quantity, 0);

  return (
    <View style={styles.container}>
      {/* Encabezado del ticket de venta */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Transacción en Curso</Text>
          <Text style={styles.itemCountText}>
            {totalItemCount} {totalItemCount === 1 ? 'artículo' : 'artículos'}
          </Text>
        </View>
        {items.length > 0 && (
          <TouchableOpacity onPress={onClearCart} style={styles.clearBtn}>
            <Ionicons name="trash-outline" size={18} color="#EF4444" />
          </TouchableOpacity>
        )}
      </View>

      {/* Lista de productos agregados */}
      <ScrollView style={styles.itemList} showsVerticalScrollIndicator={false}>
        {items.length === 0 ? (
          <View style={styles.emptyCartContainer}>
            <Ionicons name="cart-outline" size={54} color="#CBD5E1" />
            <Text style={styles.emptyCartText}>La venta está vacía</Text>
            <Text style={styles.emptyCartSub}>
              Selecciona productos del catálogo para comenzar
            </Text>
          </View>
        ) : (
          items.map((item) => {
            const itemSubtotal = item.unitPrice * item.quantity;
            const itemDiscount = item.discount * item.quantity;
            const itemTotal = itemSubtotal - itemDiscount;

            return (
              <View key={item.cartItemId} style={styles.cartItemCard}>
                <View style={styles.itemMainRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemName}>{item.product.name}</Text>
                    <View style={styles.itemPriceInfo}>
                      <Text style={styles.itemPriceText}>
                        ${item.unitPrice.toFixed(2)} c/u
                      </Text>
                      {item.discount > 0 && (
                        <Text style={styles.discountBadge}>
                          -${item.discount.toFixed(2)} dto.
                        </Text>
                      )}
                    </View>
                  </View>

                  {/* Botón para editar precio o descuento */}
                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => onEditItem(item)}
                  >
                    <Ionicons name="create-outline" size={18} color="#2563EB" />
                  </TouchableOpacity>
                </View>

                {/* Controles de cantidad y total del item */}
                <View style={styles.itemControlRow}>
                  <View style={styles.qtyControls}>
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => onDecrementQty(item.cartItemId)}
                    >
                      <Ionicons name="remove" size={16} color="#475569" />
                    </TouchableOpacity>
                    <Text style={styles.qtyValue}>{item.quantity}</Text>
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => onIncrementQty(item.cartItemId)}
                    >
                      <Ionicons name="add" size={16} color="#475569" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.itemTotalContainer}>
                    <Text style={styles.itemTotalText}>${itemTotal.toFixed(2)}</Text>
                    <TouchableOpacity
                      onPress={() => onRemoveItem(item.cartItemId)}
                      style={{ marginLeft: 8 }}
                    >
                      <Ionicons name="close" size={16} color="#94A3B8" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Resumen de cobro */}
      <View style={styles.summaryFooter}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
        </View>

        {discountTotal > 0 && (
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: '#059669' }]}>Descuentos</Text>
            <Text style={[styles.summaryValue, { color: '#059669' }]}>
              -${discountTotal.toFixed(2)}
            </Text>
          </View>
        )}

        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>TOTAL</Text>
          <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
        </View>

        <TouchableOpacity
          style={[styles.checkoutBtn, items.length === 0 && styles.checkoutBtnDisabled]}
          disabled={items.length === 0}
          onPress={onOpenCheckout}
        >
          <Ionicons name="cash-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.checkoutBtnText}>Cobrar (${total.toFixed(2)})</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 380,
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 1,
    borderLeftColor: '#E2E8F0',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  itemCountText: {
    fontSize: 12,
    color: '#64748B',
  },
  clearBtn: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#FEF2F2',
  },
  itemList: {
    flex: 1,
    padding: 12,
  },
  emptyCartContainer: {
    paddingVertical: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCartText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 12,
  },
  emptyCartSub: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  cartItemCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  itemMainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  itemPriceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 6,
  },
  itemPriceText: {
    fontSize: 12,
    color: '#64748B',
  },
  discountBadge: {
    fontSize: 10,
    color: '#059669',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    fontWeight: '600',
  },
  editBtn: {
    padding: 4,
  },
  itemControlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  qtyControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
  },
  qtyBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  qtyValue: {
    paddingHorizontal: 8,
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  itemTotalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemTotalText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  summaryFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  totalRow: {
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    alignItems: 'center',
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2563EB',
  },
  checkoutBtn: {
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 10,
  },
  checkoutBtnDisabled: {
    backgroundColor: '#94A3B8',
  },
  checkoutBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
