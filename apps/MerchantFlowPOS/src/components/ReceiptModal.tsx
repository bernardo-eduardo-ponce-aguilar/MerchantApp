import React, { useState } from 'react';
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

interface ReceiptModalProps {
  sale: CompletedSale | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ sale, onClose }) => {
  if (!sale) return null;

  return (
    <Modal visible={!!sale} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Ticket Header */}
          <View style={styles.ticketHeader}>
            <Text style={styles.storeName}>MERCHANTFLOW STORE</Text>
            <Text style={styles.ticketMeta}>Ticket de Venta #{sale.id.slice(-6)}</Text>
            <Text style={styles.ticketDate}>{sale.timestamp}</Text>
          </View>

          <View style={styles.dividerDashed} />

          {/* Ticket Items */}
          <ScrollView style={styles.itemsList}>
            {sale.items.map((item) => (
              <View key={item.cartItemId} style={styles.itemRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemName}>
                    {item.quantity}x {item.product.name}
                  </Text>
                  {item.discount > 0 && (
                    <Text style={styles.itemDiscountText}>
                      Dto: -${(item.discount * item.quantity).toFixed(2)}
                    </Text>
                  )}
                </View>
                <Text style={styles.itemTotal}>
                  ${((item.unitPrice - item.discount) * item.quantity).toFixed(2)}
                </Text>
              </View>
            ))}
          </ScrollView>

          <View style={styles.dividerDashed} />

          {/* Totales */}
          <View style={styles.totalSection}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal:</Text>
              <Text style={styles.summaryValue}>${sale.subtotal.toFixed(2)}</Text>
            </View>
            {sale.discountTotal > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Descuentos:</Text>
                <Text style={styles.summaryValue}>-${sale.discountTotal.toFixed(2)}</Text>
              </View>
            )}
            <View style={[styles.summaryRow, { marginTop: 4 }]}>
              <Text style={styles.grandTotalLabel}>TOTAL:</Text>
              <Text style={styles.grandTotalValue}>${sale.total.toFixed(2)}</Text>
            </View>
          </View>

          <View style={styles.dividerDashed} />

          {/* Pagos Recibidos y Vuelto */}
          <View style={styles.paymentSection}>
            {sale.payments.map((p, index) => (
              <View key={index} style={styles.summaryRow}>
                <Text style={styles.paymentMethod}>Pago ({p.method}):</Text>
                <Text style={styles.paymentAmount}>${p.amountReceived.toFixed(2)}</Text>
              </View>
            ))}

            <View style={[styles.summaryRow, { marginTop: 4 }]}>
              <Text style={styles.changeLabel}>CAMBIO ENTREGADO:</Text>
              <Text style={styles.changeAmount}>${sale.changeGiven.toFixed(2)}</Text>
            </View>
          </View>

          <View style={styles.printerStatusBox}>
            <Ionicons name="print-outline" size={16} color="#059669" />
            <Text style={styles.printerStatusText}>
              Emisión de ticket térmico simulado con éxito (Bluetooth/USB)
            </Text>
          </View>

          <TouchableOpacity style={styles.newSaleBtn} onPress={onClose}>
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
    backgroundColor: '#FFFFFF',
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
    color: '#0F172A',
    letterSpacing: 1,
  },
  ticketMeta: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  ticketDate: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  dividerDashed: {
    borderBottomWidth: 1,
    borderBottomColor: '#CBD5E1',
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
    color: '#1E293B',
    fontWeight: '500',
  },
  itemDiscountText: {
    fontSize: 11,
    color: '#059669',
  },
  itemTotal: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
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
    color: '#64748B',
  },
  summaryValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
  },
  grandTotalLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  grandTotalValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2563EB',
  },
  paymentSection: {
    gap: 4,
  },
  paymentMethod: {
    fontSize: 12,
    color: '#475569',
  },
  paymentAmount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
  },
  changeLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#059669',
  },
  changeAmount: {
    fontSize: 14,
    fontWeight: '800',
    color: '#059669',
  },
  printerStatusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    padding: 10,
    borderRadius: 8,
    marginTop: 14,
    gap: 8,
  },
  printerStatusText: {
    fontSize: 11,
    color: '#065F46',
    flex: 1,
    fontWeight: '500',
  },
  newSaleBtn: {
    backgroundColor: '#2563EB',
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
