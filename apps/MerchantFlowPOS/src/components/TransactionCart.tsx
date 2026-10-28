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
import { useTheme } from '../theme/ThemeContext';

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
  const { theme } = useTheme();

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
    <View style={[styles.container, { backgroundColor: theme.surface, borderLeftColor: theme.border }]}>
      {/* Encabezado del ticket de venta */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <View>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Transacción en Curso</Text>
          <Text style={[styles.itemCountText, { color: theme.textSubtle }]}>
            {totalItemCount} {totalItemCount === 1 ? 'artículo' : 'artículos'}
          </Text>
        </View>
        {items.length > 0 && (
          <TouchableOpacity onPress={onClearCart} style={[styles.clearBtn, { backgroundColor: theme.dangerLight }]}>
            <Ionicons name="trash-outline" size={18} color={theme.danger} />
          </TouchableOpacity>
        )}
      </View>

      {/* Lista de productos agregados */}
      <ScrollView style={styles.itemList} showsVerticalScrollIndicator={false}>
        {items.length === 0 ? (
          <View style={styles.emptyCartContainer}>
            <Ionicons name="cart-outline" size={54} color={theme.borderSubtle} />
            <Text style={[styles.emptyCartText, { color: theme.textSubtle }]}>La venta está vacía</Text>
            <Text style={[styles.emptyCartSub, { color: theme.textSubtle }]}>
              Selecciona productos del catálogo para comenzar
            </Text>
          </View>
        ) : (
          items.map((item) => {
            const itemSubtotal = item.unitPrice * item.quantity;
            const itemDiscount = item.discount * item.quantity;
            const itemTotal = itemSubtotal - itemDiscount;

            return (
              <View
                key={item.cartItemId}
                style={[
                  styles.cartItemCard,
                  { backgroundColor: theme.surfaceSubtle, borderColor: theme.border },
                ]}
              >
                <View style={styles.itemMainRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.itemName, { color: theme.text }]}>{item.product.name}</Text>
                    <View style={styles.itemPriceInfo}>
                      <Text style={[styles.itemPriceText, { color: theme.textSubtle }]}>
                        ${item.unitPrice.toFixed(2)} c/u
                      </Text>
                      {item.discount > 0 && (
                        <Text style={[styles.discountBadge, { backgroundColor: theme.successLight, color: theme.success }]}>
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
                    <Ionicons name="create-outline" size={18} color={theme.primary} />
                  </TouchableOpacity>
                </View>

                {/* Controles de cantidad y total del item */}
                <View style={styles.itemControlRow}>
                  <View style={[styles.qtyControls, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => onDecrementQty(item.cartItemId)}
                    >
                      <Ionicons name="remove" size={16} color={theme.textMuted} />
                    </TouchableOpacity>
                    <Text style={[styles.qtyValue, { color: theme.text }]}>{item.quantity}</Text>
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => onIncrementQty(item.cartItemId)}
                    >
                      <Ionicons name="add" size={16} color={theme.textMuted} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.itemTotalContainer}>
                    <Text style={[styles.itemTotalText, { color: theme.text }]}>${itemTotal.toFixed(2)}</Text>
                    <TouchableOpacity
                      onPress={() => onRemoveItem(item.cartItemId)}
                      style={{ marginLeft: 8 }}
                    >
                      <Ionicons name="close" size={16} color={theme.textSubtle} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Resumen de cobro */}
      <View style={[styles.summaryFooter, { borderTopColor: theme.border, backgroundColor: theme.surface }]}>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: theme.textSubtle }]}>Subtotal</Text>
          <Text style={[styles.summaryValue, { color: theme.text }]}>${subtotal.toFixed(2)}</Text>
        </View>

        {discountTotal > 0 && (
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: theme.success }]}>Descuentos</Text>
            <Text style={[styles.summaryValue, { color: theme.success }]}>
              -${discountTotal.toFixed(2)}
            </Text>
          </View>
        )}

        <View style={[styles.summaryRow, styles.totalRow, { borderTopColor: theme.border }]}>
          <Text style={[styles.totalLabel, { color: theme.text }]}>TOTAL</Text>
          <Text style={[styles.totalValue, { color: theme.primary }]}>${total.toFixed(2)}</Text>
        </View>

        <TouchableOpacity
          style={[
            styles.checkoutBtn,
            { backgroundColor: items.length === 0 ? theme.borderSubtle : theme.primary },
          ]}
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
    borderLeftWidth: 1,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  itemCountText: {
    fontSize: 12,
  },
  clearBtn: {
    padding: 6,
    borderRadius: 6,
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
    marginTop: 12,
  },
  emptyCartSub: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  cartItemCard: {
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
  },
  itemMainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemName: {
    fontSize: 13,
    fontWeight: '600',
  },
  itemPriceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 6,
  },
  itemPriceText: {
    fontSize: 12,
  },
  discountBadge: {
    fontSize: 10,
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
    borderWidth: 1,
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
  },
  itemTotalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemTotalText: {
    fontSize: 14,
    fontWeight: '700',
  },
  summaryFooter: {
    padding: 16,
    borderTopWidth: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 13,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  totalRow: {
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    alignItems: 'center',
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '800',
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  checkoutBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 10,
  },
  checkoutBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
