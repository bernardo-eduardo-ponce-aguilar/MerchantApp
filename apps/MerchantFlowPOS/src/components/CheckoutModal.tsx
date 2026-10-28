import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PaymentMethodType, PaymentEntry } from '../types';

interface CheckoutModalProps {
  visible: boolean;
  totalAmount: number;
  onClose: () => void;
  onFinishSale: (payments: PaymentEntry[], totalReceived: number, change: number) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  visible,
  totalAmount,
  onClose,
  onFinishSale,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>('EFECTIVO');
  const [cashReceived, setCashReceived] = useState(totalAmount.toString());
  const [payments, setPayments] = useState<PaymentEntry[]>([]);

  // Update initial cash when modal becomes visible or total changes
  React.useEffect(() => {
    if (visible) {
      setCashReceived(totalAmount > 0 ? totalAmount.toString() : '');
      setPayments([]);
    }
  }, [visible, totalAmount]);

  const currentEntered = parseFloat(cashReceived) || 0;

  // Calculamos montos cubiertos
  const totalAlreadyPaid = payments.reduce((acc, p) => acc + p.amountReceived, 0);
  const totalReceivedCombined = totalAlreadyPaid + currentEntered;
  const covered = Math.min(totalReceivedCombined, totalAmount);
  const remaining = Math.max(0, totalAmount - totalReceivedCombined);
  const change = Math.max(0, totalReceivedCombined - totalAmount);

  const handleQuickCash = (amount: number) => {
    setCashReceived(amount.toString());
  };

  const handleAddPaymentPartial = () => {
    if (currentEntered <= 0) return;
    setPayments([...payments, { method: selectedMethod, amountReceived: currentEntered }]);
    setCashReceived('');
  };

  const handleComplete = () => {
    const finalPayments = [...payments];
    if (currentEntered > 0) {
      finalPayments.push({ method: selectedMethod, amountReceived: currentEntered });
    }
    onFinishSale(finalPayments, totalReceivedCombined, change);
  };

  const quickAmounts = [50, 100, 200, 500, 1000];

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Cobro de Transacción</Text>
              <Text style={styles.subtitle}>Selecciona método y registra el pago</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Gran Total a Pagar */}
          <View style={styles.totalBanner}>
            <Text style={styles.totalLabel}>TOTAL A PAGAR</Text>
            <Text style={styles.totalValue}>${totalAmount.toFixed(2)}</Text>
          </View>

          <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
            {/* Métodos de Pago */}
            <Text style={styles.sectionTitle}>Método de Pago</Text>
            <View style={styles.methodsRow}>
              {(['EFECTIVO', 'TARJETA', 'TRANSFERENCIA'] as PaymentMethodType[]).map((m) => {
                const isSelected = selectedMethod === m;
                const iconName =
                  m === 'EFECTIVO'
                    ? 'cash-outline'
                    : m === 'TARJETA'
                    ? 'card-outline'
                    : 'phone-portrait-outline';
                return (
                  <TouchableOpacity
                    key={m}
                    style={[styles.methodCard, isSelected && styles.methodCardActive]}
                    onPress={() => setSelectedMethod(m)}
                  >
                    <Ionicons
                      name={iconName as any}
                      size={22}
                      color={isSelected ? '#2563EB' : '#64748B'}
                    />
                    <Text
                      style={[styles.methodText, isSelected && styles.methodTextActive]}
                    >
                      {m}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Input Cantidad Recibida */}
            <Text style={styles.sectionTitle}>Cantidad Recibida ($ MXN)</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={styles.amountInput}
                value={cashReceived}
                onChangeText={setCashReceived}
                keyboardType="numeric"
                placeholder="0.00"
              />
            </View>

            {/* Botones de efectivo rápido si es efectivo */}
            {selectedMethod === 'EFECTIVO' && (
              <View style={styles.quickCashRow}>
                <TouchableOpacity
                  style={styles.quickCashBtnExact}
                  onPress={() => handleQuickCash(remaining > 0 ? remaining : totalAmount)}
                >
                  <Text style={styles.quickCashExactText}>Exacto</Text>
                </TouchableOpacity>
                {quickAmounts.map((amt) => (
                  <TouchableOpacity
                    key={amt}
                    style={styles.quickCashBtn}
                    onPress={() => handleQuickCash(amt)}
                  >
                    <Text style={styles.quickCashText}>${amt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Pagos parciales registrados */}
            {payments.length > 0 && (
              <View style={styles.paymentsList}>
                <Text style={styles.sectionTitle}>Abonos Registrados</Text>
                {payments.map((p, idx) => (
                  <View key={idx} style={styles.paymentRowItem}>
                    <Text style={styles.paymentRowMethod}>{p.method}:</Text>
                    <Text style={styles.paymentRowAmt}>${p.amountReceived.toFixed(2)}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Desglose de Estado de Pago (Cubierto, Faltante, Cambio) */}
            <View style={styles.summaryBreakdown}>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Total Recibido:</Text>
                <Text style={styles.breakdownValue}>${totalReceivedCombined.toFixed(2)}</Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Monto Cubierto:</Text>
                <Text style={[styles.breakdownValue, { color: '#059669' }]}>
                  ${covered.toFixed(2)}
                </Text>
              </View>

              {remaining > 0 ? (
                <View style={[styles.breakdownRow, styles.alertRow]}>
                  <Text style={[styles.breakdownLabel, styles.alertText]}>
                    FALTANTE POR CUBRIR:
                  </Text>
                  <Text style={[styles.breakdownValue, styles.alertValue]}>
                    ${remaining.toFixed(2)}
                  </Text>
                </View>
              ) : (
                <View style={[styles.breakdownRow, styles.changeRow]}>
                  <Text style={[styles.breakdownLabel, styles.changeLabel]}>CAMBIO (VUELTO):</Text>
                  <Text style={[styles.breakdownValue, styles.changeValue]}>
                    ${change.toFixed(2)}
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>

          {/* Footer de Acciones */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.finishBtn,
                remaining > 0 && styles.finishBtnDisabled,
              ]}
              disabled={remaining > 0}
              onPress={handleComplete}
            >
              <Ionicons name="checkmark-circle" size={22} color="#FFF" style={{ marginRight: 8 }} />
              <Text style={styles.finishBtnText}>
                {remaining > 0 ? `Faltan $${remaining.toFixed(2)}` : 'Cobrar e Imprimir Ticket'}
              </Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 500,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  totalBanner: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 11,
    color: '#94A3B8',
    letterSpacing: 1,
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    marginBottom: 8,
    marginTop: 4,
  },
  methodsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  methodCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodCardActive: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  methodText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 4,
  },
  methodTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  currencySymbol: {
    fontSize: 22,
    fontWeight: '700',
    color: '#64748B',
    marginRight: 6,
  },
  amountInput: {
    flex: 1,
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
    paddingVertical: 8,
  },
  quickCashRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 14,
  },
  quickCashBtnExact: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickCashExactText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  quickCashBtn: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quickCashText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  paymentsList: {
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  paymentRowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  paymentRowMethod: {
    fontSize: 12,
    color: '#64748B',
  },
  paymentRowAmt: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
  },
  summaryBreakdown: {
    backgroundColor: '#F8FAFC',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginVertical: 6,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  breakdownLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  alertRow: {
    backgroundColor: '#FEF2F2',
    padding: 8,
    borderRadius: 6,
    marginTop: 4,
    marginBottom: 0,
  },
  alertText: {
    color: '#DC2626',
    fontWeight: '700',
  },
  alertValue: {
    color: '#DC2626',
    fontWeight: '800',
    fontSize: 16,
  },
  changeRow: {
    backgroundColor: '#ECFDF5',
    padding: 8,
    borderRadius: 6,
    marginTop: 4,
    marginBottom: 0,
  },
  changeLabel: {
    color: '#059669',
    fontWeight: '700',
  },
  changeValue: {
    color: '#059669',
    fontWeight: '800',
    fontSize: 18,
  },
  footer: {
    marginTop: 16,
  },
  finishBtn: {
    backgroundColor: '#16A34A',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 10,
  },
  finishBtnDisabled: {
    backgroundColor: '#94A3B8',
  },
  finishBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
