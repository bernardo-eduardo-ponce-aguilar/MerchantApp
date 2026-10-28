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
import { CompletedSale } from '../types';
import { useTheme } from '../theme/ThemeContext';

interface ReceiptModalProps {
  sale: CompletedSale | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ sale, onClose }) => {
  const { theme } = useTheme();

  if (!sale) return null;

  return (
    <Modal visible={!!sale} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: theme.surface }]}>
          {/* Ticket Header */}
          <View style={styles.ticketHeader}>
            <Text style={[styles.storeName, { color: theme.text }]}>MERCHANTFLOW STORE</Text>
            <Text style={[styles.ticketMeta, { color: theme.textSubtle }]}>Ticket de Venta #{sale.id.slice(-6)}</Text>
            <Text style={[styles.ticketDate, { color: theme.textSubtle }]}>{sale.timestamp}</Text>
          </View>

          <View style={[styles.dividerDashed, { borderBottomColor: theme.border }]} />

          {/* Ticket Items */}
          <ScrollView style={styles.itemsList}>
            {sale.items.map((item) => (
              <View key={item.cartItemId} style={styles.itemRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.itemName, { color: theme.text }]}>
                    {item.quantity}x {item.product.name}
                  </Text>
                  {item.discount > 0 && (
                    <Text style={[styles.itemDiscountText, { color: theme.success }]}>
                      Dto: -${(item.discount * item.quantity).toFixed(2)}
                    </Text>
                  )}
                </View>
                <Text style={[styles.itemTotal, { color: theme.text }]}>
                  ${((item.unitPrice - item.discount) * item.quantity).toFixed(2)}
                </Text>
              </View>
            ))}
          </ScrollView>

          <View style={[styles.dividerDashed, { borderBottomColor: theme.border }]} />

          {/* Totales */}
          <View style={styles.totalSection}>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: theme.textSubtle }]}>Subtotal:</Text>
              <Text style={[styles.summaryValue, { color: theme.text }]}>${sale.subtotal.toFixed(2)}</Text>
            </View>
            {sale.discountTotal > 0 && (
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: theme.success }]}>Descuentos:</Text>
                <Text style={[styles.summaryValue, { color: theme.success }]}>-${sale.discountTotal.toFixed(2)}</Text>
              </View>
            )}
            <View style={[styles.summaryRow, { marginTop: 4 }]}>
              <Text style={[styles.grandTotalLabel, { color: theme.text }]}>TOTAL:</Text>
              <Text style={[styles.grandTotalValue, { color: theme.primary }]}>${sale.total.toFixed(2)}</Text>
            </View>
          </View>

          <View style={[styles.dividerDashed, { borderBottomColor: theme.border }]} />

          {/* Pagos Recibidos y Vuelto */}
          <View style={styles.paymentSection}>
            {sale.payments.map((p, index) => (
              <View key={index} style={styles.summaryRow}>
                <Text style={[styles.paymentMethod, { color: theme.textSubtle }]}>Pago ({p.method}):</Text>
                <Text style={[styles.paymentAmount, { color: theme.text }]}>${p.amountReceived.toFixed(2)}</Text>
              </View>
            ))}

            <View style={[styles.summaryRow, { marginTop: 4 }]}>
              <Text style={[styles.changeLabel, { color: theme.success }]}>CAMBIO ENTREGADO:</Text>
              <Text style={[styles.changeAmount, { color: theme.success }]}>${sale.changeGiven.toFixed(2)}</Text>
            </View>
          </View>

          <View style={[styles.printerStatusBox, { backgroundColor: theme.successLight }]}>
            <Ionicons name="print-outline" size={16} color={theme.success} />
            <Text style={[styles.printerStatusText, { color: theme.success }]}>
              Emisión de ticket térmico simulado con éxito (Bluetooth/USB)
            </Text>
          </View>

          <TouchableOpacity style={[styles.newSaleBtn, { backgroundColor: theme.primary }]} onPress={onClose}>
            <Text style={styles.newSaleBtnText}>Iniciar Siguiente Venta</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    borderRadius: 12,
    width: '100%',
    maxWidth: 380,
    padding: 20,
  },
  ticketHeader: {
    alignItems: 'center',
    marginBottom: 10,
  },
  storeName: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
  ticketMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  ticketDate: {
    fontSize: 11,
    marginTop: 2,
  },
  dividerDashed: {
    borderBottomWidth: 1,
    borderStyle: 'dashed',
    marginVertical: 10,
  },
  itemsList: {
    maxHeight: 180,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '500',
  },
  itemDiscountText: {
    fontSize: 11,
  },
  itemTotal: {
    fontSize: 13,
    fontWeight: '600',
  },
  totalSection: {
    gap: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontSize: 12,
  },
  summaryValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  grandTotalLabel: {
    fontSize: 15,
    fontWeight: '800',
  },
  grandTotalValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  paymentSection: {
    gap: 4,
  },
  paymentMethod: {
    fontSize: 12,
  },
  paymentAmount: {
    fontSize: 12,
    fontWeight: '600',
  },
  changeLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  changeAmount: {
    fontSize: 14,
    fontWeight: '800',
  },
  printerStatusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    marginTop: 14,
    gap: 8,
  },
  printerStatusText: {
    fontSize: 11,
    flex: 1,
    fontWeight: '500',
  },
  newSaleBtn: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  newSaleBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
