import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CartItem } from '../types';
import { useTheme } from '../theme/ThemeContext';

interface TransactionCartModalProps {
  visible: boolean;
  onClose: () => void;
  items: CartItem[];
  onIncrementQty: (cartItemId: string) => void;
  onDecrementQty: (cartItemId: string) => void;
  onRemoveItem: (cartItemId: string) => void;
  onEditItem: (item: CartItem) => void;
  onClearCart: () => void;
  onOpenCheckout: () => void;
}

export const TransactionCartModal: React.FC<TransactionCartModalProps> = ({
  visible,
  onClose,
  items,
  onIncrementQty,
  onDecrementQty,
  onRemoveItem,
  onEditItem,
  onClearCart,
  onOpenCheckout,
}) => {
  const { theme } = useTheme();

  if (!visible) return null;

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
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={[styles.modalCard, { backgroundColor: theme.surface }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <View>
              <Text style={[styles.headerTitle, { color: theme.text }]}>Detalle de la Transacción</Text>
              <Text style={[styles.itemCountText, { color: theme.textSubtle }]}>
                {totalItemCount} {totalItemCount === 1 ? 'artículo' : 'artículos'} agregados
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              {items.length > 0 && (
                <TouchableOpacity onPress={onClearCart} style={[styles.clearBtn, { backgroundColor: theme.dangerLight }]}>
                  <Ionicons name="trash-outline" size={18} color={theme.danger} />
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color={theme.textSubtle} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Lista de productos */}
          <ScrollView style={styles.itemList} showsVerticalScrollIndicator={false}>
            {items.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="cart-outline" size={54} color={theme.borderSubtle} />
                <Text style={[styles.emptyText, { color: theme.textSubtle }]}>La orden está vacía</Text>
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

                      <TouchableOpacity
                        style={styles.editBtn}
                        onPress={() => onEditItem(item)}
                      >
                        <Ionicons name="create-outline" size={18} color={theme.primary} />
                      </TouchableOpacity>
                    </View>

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

          {/* Footer */}
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
              onPress={() => {
                onClose();
                onOpenCheckout();
              }}
            >
              <Ionicons name="cash-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.checkoutBtnText}>Proceder al Cobro (${total.toFixed(2)})</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    maxHeight: '85%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    paddingBottom: 24,
    display: 'flex',
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  itemCountText: {
    fontSize: 12,
  },
  clearBtn: {
    padding: 6,
    borderRadius: 6,
  },
  closeBtn: {
    padding: 4,
  },
  itemList: {
    padding: 16,
    maxHeight: 360,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 15,
    marginTop: 8,
    fontWeight: '600',
  },
  cartItemCard: {
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  itemMainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemName: {
    fontSize: 14,
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
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  qtyValue: {
    paddingHorizontal: 8,
    fontSize: 14,
    fontWeight: '700',
  },
  itemTotalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemTotalText: {
    fontSize: 15,
    fontWeight: '700',
  },
  summaryFooter: {
    paddingHorizontal: 16,
    paddingTop: 12,
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
