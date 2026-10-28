import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
  Platform,
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
  const { height } = useWindowDimensions();

  if (!sale) return null;

  return (
    <Modal visible={!!sale} transparent animationType="fade">
      <View style={styles.overlay}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.surface,
              maxHeight: height > 500 ? '90%' : '96%',
            },
          ]}
        >
          <ScrollView
            showsVerticalScrollIndicator={true}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Ticket Header */}
            <View style={styles.ticketHeader}>
              <Text style={[styles.storeName, { color: theme.text }]}>MERCHANTFLOW STORE</Text>
              <Text style={[styles.ticketMeta, { color: theme.textSubtle }]}>
                Ticket de Venta #{sale.id.slice(-6)}
              </Text>
              <Text style={[styles.ticketDate, { color: theme.textSubtle }]}>{sale.timestamp}</Text>
            </View>

            <View style={[styles.dividerDashed, { borderBottomColor: theme.border }]} />

            {/* Ticket Items */}
            <View style={styles.itemsList}>
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
            </View>

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
                  <Text style={[styles.summaryValue, { color: theme.success }]}>
                    -${sale.discountTotal.toFixed(2)}
                  </Text>
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
          </ScrollView>
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
    padding: 10,
  },
  card: {
    borderRadius: 12,
    width: '100%',
    maxWidth: 380,
    overflow: 'hidden',
  },
  scrollContent: {
    padding: 16,
  },
  ticketHeader: {
    alignItems: 'center',
    marginBottom: 8,
  },
  storeName: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1,
  },
  ticketMeta: {
    fontSize: 11,
    marginTop: 2,
  },
  ticketDate: {
    fontSize: 10,
    marginTop: 1,
  },
  dividerDashed: {
    borderBottomWidth: 1,
    borderStyle: 'dashed',
    marginVertical: 8,
  },
  itemsList: {
    gap: 4,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  itemName: {
    fontSize: 12,
    fontWeight: '500',
  },
  itemDiscountText: {
    fontSize: 10,
  },
  itemTotal: {
    fontSize: 12,
    fontWeight: '600',
  },
  totalSection: {
    gap: 3,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontSize: 11,
  },
  summaryValue: {
    fontSize: 11,
    fontWeight: '600',
  },
  grandTotalLabel: {
    fontSize: 14,
    fontWeight: '800',
  },
  grandTotalValue: {
    fontSize: 15,
    fontWeight: '800',
  },
  paymentSection: {
    gap: 3,
  },
  paymentMethod: {
    fontSize: 11,
  },
  paymentAmount: {
    fontSize: 11,
    fontWeight: '600',
  },
  changeLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  changeAmount: {
    fontSize: 13,
    fontWeight: '800',
  },
  printerStatusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    marginTop: 10,
    gap: 6,
  },
  printerStatusText: {
    fontSize: 10,
    flex: 1,
    fontWeight: '500',
  },
  newSaleBtn: {
    paddingVertical: 11,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  newSaleBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
