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
import { ShiftInfo } from '../types';
import { useTheme } from '../theme/ThemeContext';

interface ShiftModalProps {
  visible: boolean;
  activeShift: ShiftInfo | null;
  onStartShift: (cashierName: string, initialCash: number) => void;
  onResumeShift: () => void;
  onCloseShift?: () => void;
}

export const ShiftModal: React.FC<ShiftModalProps> = ({
  visible,
  activeShift,
  onStartShift,
  onResumeShift,
  onCloseShift,
}) => {
  const { theme } = useTheme();
  const { height, width } = useWindowDimensions();
  const [cashierName, setCashierName] = useState(activeShift?.cashierName || 'Cajero Principal');
  const [initialCash, setInitialCash] = useState(
    activeShift ? activeShift.initialCash.toString() : '500.00'
  );

  const handleStart = () => {
    const cash = parseFloat(initialCash) || 0;
    onStartShift(cashierName.trim() || 'Cajero 1', cash);
  };

  const isLandscapeMobile = height < 500;
  const modalHeight = isLandscapeMobile ? height * 0.94 : Math.min(height * 0.85, 540);
  const modalWidth = Math.min(width * 0.94, 460);

  return (
    <Modal visible={visible} transparent animationType="fade">
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
          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.header}>
              <View style={[styles.iconCircle, { backgroundColor: theme.primaryLight }]}>
                <Ionicons name="cash-outline" size={24} color={theme.primary} />
              </View>
              <Text style={[styles.title, { color: theme.text }]}>Control de Turno de Caja</Text>
              <Text style={[styles.subtitle, { color: theme.textSubtle }]}>
                {activeShift?.isActive
                  ? 'Existe un turno activo registrado en esta terminal'
                  : 'Inicia tu turno de caja para comenzar las operaciones del día'}
              </Text>
            </View>

            {activeShift?.isActive ? (
              <View style={[styles.activeShiftBox, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}>
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: theme.textSubtle }]}>Cajero en turno:</Text>
                  <Text style={[styles.infoValue, { color: theme.text }]}>{activeShift.cashierName}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: theme.textSubtle }]}>Fondo inicial:</Text>
                  <Text style={[styles.infoValue, { color: theme.text }]}>${activeShift.initialCash.toFixed(2)}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: theme.textSubtle }]}>Apertura:</Text>
                  <Text style={[styles.infoValue, { color: theme.text }]}>{activeShift.startedAt}</Text>
                </View>

                <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: theme.primary }]} onPress={onResumeShift}>
                  <Ionicons name="play" size={18} color="#FFF" style={{ marginRight: 6 }} />
                  <Text style={styles.primaryBtnText}>Retomar Turno Activo</Text>
                </TouchableOpacity>

                {onCloseShift && (
                  <TouchableOpacity style={[styles.secondaryBtn, { borderColor: theme.border, backgroundColor: theme.surface }]} onPress={onCloseShift}>
                    <Text style={[styles.secondaryBtnText, { color: theme.textSubtle }]}>Cerrar Turno Anterior</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <View style={styles.form}>
                <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>Nombre del Cajero / Operador</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border, color: theme.text }]}
                  value={cashierName}
                  onChangeText={setCashierName}
                  placeholder="Ej. Juan Pérez"
                  placeholderTextColor={theme.textSubtle}
                />

                <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>Fondo Inicial de Caja ($ MXN)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border, color: theme.text }]}
                  value={initialCash}
                  onChangeText={setInitialCash}
                  keyboardType="numeric"
                  placeholder="0.00"
                  placeholderTextColor={theme.textSubtle}
                />

                <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: theme.primary }]} onPress={handleStart}>
                  <Ionicons name="log-in-outline" size={20} color="#FFF" style={{ marginRight: 6 }} />
                  <Text style={styles.primaryBtnText}>Aperturar / Empezar Turno</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    ...Platform.select({
      web: {
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
      },
      default: {
        elevation: 8,
      },
    }),
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 3,
    lineHeight: 16,
  },
  form: {
    marginTop: 2,
  },
  activeShiftBox: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  infoLabel: {
    fontSize: 13,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    marginTop: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    fontSize: 14,
  },
  primaryBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 11,
    borderRadius: 8,
    marginTop: 14,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  secondaryBtn: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 9,
    alignItems: 'center',
    marginTop: 8,
  },
  secondaryBtnText: {
    fontWeight: '600',
    fontSize: 13,
  },
});
