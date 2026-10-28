import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PaymentMethodType, PaymentEntry } from '../types';
import { useTheme } from '../theme/ThemeContext';

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
  const { theme } = useTheme();
  const { height, width } = useWindowDimensions();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>('EFECTIVO');
  const [cashReceived, setCashReceived] = useState(totalAmount.toString());
  const [payments, setPayments] = useState<PaymentEntry[]>([]);

  React.useEffect(() => {
    if (visible) {
      setCashReceived(totalAmount > 0 ? totalAmount.toString() : '');
      setPayments([]);
    }
  }, [visible, totalAmount]);

  const currentEntered = parseFloat(cashReceived) || 0;
  const totalAlreadyPaid = payments.reduce((acc, p) => acc + p.amountReceived, 0);
  const totalReceivedCombined = totalAlreadyPaid + currentEntered;
  const covered = Math.min(totalReceivedCombined, totalAmount);
  const remaining = Math.max(0, totalAmount - totalReceivedCombined);
  const change = Math.max(0, totalReceivedCombined - totalAmount);

  const handleQuickCash = (amount: number) => {
    setCashReceived(amount.toString());
  };

  const handleComplete = () => {
    const finalPayments = [...payments];
    if (currentEntered > 0) {
      finalPayments.push({ method: selectedMethod, amountReceived: currentEntered });
    }
    onFinishSale(finalPayments, totalReceivedCombined, change);
  };

  const quickAmounts = [50, 100, 200, 500, 1000];

  // Calculamos la altura disponible para el modal:
  // En móviles apaisados (height < 500px), usamos casi toda la altura para que el scroll tenga espacio real.
  const isLandscapeMobile = height < 500;
  const modalHeight = isLandscapeMobile ? height * 0.94 : Math.min(height * 0.88, 620);
  const modalWidth = Math.min(width * 0.94, 520);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.surface,
              height: modalHeight,
              width: modalWidth,
            },
          ]}
        >
          {/* Header fijo superior */}
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: theme.text }]}>Cobro de Transacción</Text>
              <Text style={[styles.subtitle, { color: theme.textSubtle }]}>
                Selecciona método y registra el pago
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={theme.textSubtle} />
            </TouchableOpacity>
          </View>

          {/* Banner compacto del total */}
          <View style={styles.totalBanner}>
            <Text style={styles.totalLabel}>TOTAL A PAGAR</Text>
            <Text style={styles.totalValue}>${totalAmount.toFixed(2)}</Text>
          </View>

          {/* ScrollView con flex: 1 para ocupar todo el espacio entre el banner y el botón de cobrar */}
          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
            keyboardShouldPersistTaps="handled"
          >
            {/* Métodos de Pago */}
            <Text style={[styles.sectionTitle, { color: theme.textSubtle }]}>Método de Pago</Text>
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
                    style={[
                      styles.methodCard,
                      { backgroundColor: theme.surfaceSubtle, borderColor: theme.border },
                      isSelected && { borderColor: theme.primary, backgroundColor: theme.primaryLight },
                    ]}
                    onPress={() => setSelectedMethod(m)}
                  >
                    <Ionicons
                      name={iconName as any}
                      size={20}
                      color={isSelected ? theme.primary : theme.textSubtle}
                    />
                    <Text
                      style={[
                        styles.methodText,
                        { color: isSelected ? theme.primary : theme.textSubtle },
                        isSelected && styles.methodTextActive,
                      ]}
                    >
                      {m}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Input Cantidad Recibida */}
            <Text style={[styles.sectionTitle, { color: theme.textSubtle }]}>
              Cantidad Recibida ($ MXN)
            </Text>
            <View style={[styles.inputContainer, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}>
              <Text style={[styles.currencySymbol, { color: theme.textSubtle }]}>$</Text>
              <TextInput
                style={[styles.amountInput, { color: theme.text }]}
                value={cashReceived}
                onChangeText={setCashReceived}
                keyboardType="numeric"
                placeholder="0.00"
                placeholderTextColor={theme.textSubtle}
              />
            </View>

            {/* Botones de efectivo rápido si es efectivo */}
            {selectedMethod === 'EFECTIVO' && (
              <View style={styles.quickCashRow}>
                <TouchableOpacity
                  style={[styles.quickCashBtnExact, { backgroundColor: theme.primary }]}
                  onPress={() => handleQuickCash(remaining > 0 ? remaining : totalAmount)}
                >
                  <Text style={styles.quickCashExactText}>Exacto</Text>
                </TouchableOpacity>
                {quickAmounts.map((amt) => (
                  <TouchableOpacity
                    key={amt}
                    style={[styles.quickCashBtn, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}
                    onPress={() => handleQuickCash(amt)}
                  >
                    <Text style={[styles.quickCashText, { color: theme.textMuted }]}>${amt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Pagos parciales registrados */}
            {payments.length > 0 && (
              <View style={[styles.paymentsList, { backgroundColor: theme.surfaceSubtle }]}>
                <Text style={[styles.sectionTitle, { color: theme.textSubtle }]}>Abonos Registrados</Text>
                {payments.map((p, idx) => (
                  <View key={idx} style={styles.paymentRowItem}>
                    <Text style={[styles.paymentRowMethod, { color: theme.textSubtle }]}>{p.method}:</Text>
                    <Text style={[styles.paymentRowAmt, { color: theme.text }]}>${p.amountReceived.toFixed(2)}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Desglose de Estado de Pago (Cubierto, Faltante, Cambio) */}
            <View style={[styles.summaryBreakdown, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}>
              <View style={styles.breakdownRow}>
                <Text style={[styles.breakdownLabel, { color: theme.textSubtle }]}>Total Recibido:</Text>
                <Text style={[styles.breakdownValue, { color: theme.text }]}>${totalReceivedCombined.toFixed(2)}</Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={[styles.breakdownLabel, { color: theme.textSubtle }]}>Monto Cubierto:</Text>
                <Text style={[styles.breakdownValue, { color: theme.success }]}>
                  ${covered.toFixed(2)}
                </Text>
              </View>

              {remaining > 0 ? (
                <View style={[styles.breakdownRow, styles.alertRow, { backgroundColor: theme.dangerLight }]}>
                  <Text style={[styles.breakdownLabel, { color: theme.danger, fontWeight: '700' }]}>
                    FALTANTE POR CUBRIR:
                  </Text>
                  <Text style={[styles.breakdownValue, { color: theme.danger, fontWeight: '800', fontSize: 16 }]}>
                    ${remaining.toFixed(2)}
                  </Text>
                </View>
              ) : (
                <View style={[styles.breakdownRow, styles.changeRow, { backgroundColor: theme.successLight }]}>
                  <Text style={[styles.breakdownLabel, { color: theme.success, fontWeight: '700' }]}>
                    CAMBIO (VUELTO):
                  </Text>
                  <Text style={[styles.breakdownValue, { color: theme.success, fontWeight: '800', fontSize: 18 }]}>
                    ${change.toFixed(2)}
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>

          {/* Footer fijo con botón Cobrar siempre anclado */}
          <View style={[styles.footer, { borderTopColor: theme.border, backgroundColor: theme.surface }]}>
            <TouchableOpacity
              style={[
                styles.finishBtn,
                { backgroundColor: theme.success },
                remaining > 0 && { backgroundColor: theme.borderSubtle },
              ]}
              disabled={remaining > 0}
              onPress={handleComplete}
            >
              <Ionicons name="checkmark-circle" size={20} color="#FFF" style={{ marginRight: 8 }} />
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
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  card: {
    borderRadius: 16,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    ...Platform.select({
      web: {
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
      },
      default: {
        elevation: 10,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  closeBtn: {
    padding: 4,
  },
  totalBanner: {
    backgroundColor: '#1E293B',
    paddingVertical: 7,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 11,
    color: '#94A3B8',
    letterSpacing: 1,
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 19,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 6,
    marginTop: 4,
  },
  methodsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  methodCard: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodText: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 3,
  },
  methodTextActive: {
    fontWeight: '700',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '700',
    marginRight: 6,
  },
  amountInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    paddingVertical: 6,
  },
  quickCashRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  quickCashBtnExact: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickCashExactText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  quickCashBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  quickCashText: {
    fontSize: 11,
    fontWeight: '600',
  },
  paymentsList: {
    padding: 8,
    borderRadius: 8,
    marginBottom: 10,
  },
  paymentRowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  paymentRowMethod: {
    fontSize: 12,
  },
  paymentRowAmt: {
    fontSize: 12,
    fontWeight: '600',
  },
  summaryBreakdown: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginVertical: 4,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  breakdownLabel: {
    fontSize: 12,
  },
  breakdownValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  alertRow: {
    padding: 6,
    borderRadius: 6,
    marginTop: 4,
    marginBottom: 0,
  },
  changeRow: {
    padding: 6,
    borderRadius: 6,
    marginTop: 4,
    marginBottom: 0,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  finishBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 11,
    borderRadius: 10,
  },
  finishBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
