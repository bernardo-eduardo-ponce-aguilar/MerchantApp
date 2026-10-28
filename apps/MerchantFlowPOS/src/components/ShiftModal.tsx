import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ShiftInfo } from '../types';

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
  const [cashierName, setCashierName] = useState(activeShift?.cashierName || 'Cajero Principal');
  const [initialCash, setInitialCash] = useState(
    activeShift ? activeShift.initialCash.toString() : '500.00'
  );

  const handleStart = () => {
    const cash = parseFloat(initialCash) || 0;
    onStartShift(cashierName.trim() || 'Cajero 1', cash);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Ionicons name="cash-outline" size={32} color="#2563EB" />
            </View>
            <Text style={styles.title}>Control de Turno de Caja</Text>
            <Text style={styles.subtitle}>
              {activeShift?.isActive
                ? 'Existe un turno activo registrado en esta terminal'
                : 'Inicia tu turno de caja para comenzar las operaciones del día'}
            </Text>
          </View>

          {activeShift?.isActive ? (
            <View style={styles.activeShiftBox}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Cajero en turno:</Text>
                <Text style={styles.infoValue}>{activeShift.cashierName}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Fondo inicial:</Text>
                <Text style={styles.infoValue}>${activeShift.initialCash.toFixed(2)}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Apertura:</Text>
                <Text style={styles.infoValue}>{activeShift.startedAt}</Text>
              </View>

              <TouchableOpacity style={styles.primaryBtn} onPress={onResumeShift}>
                <Ionicons name="play" size={18} color="#FFF" style={{ marginRight: 6 }} />
                <Text style={styles.primaryBtnText}>Retomar Turno Activo</Text>
              </TouchableOpacity>

              {onCloseShift && (
                <TouchableOpacity style={styles.secondaryBtn} onPress={onCloseShift}>
                  <Text style={styles.secondaryBtnText}>Cerrar Turno Anterior</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.form}>
              <Text style={styles.fieldLabel}>Nombre del Cajero / Operador</Text>
              <TextInput
                style={styles.input}
                value={cashierName}
                onChangeText={setCashierName}
                placeholder="Ej. Juan Pérez"
              />

              <Text style={styles.fieldLabel}>Fondo Inicial de Caja ($ MXN)</Text>
              <TextInput
                style={styles.input}
                value={initialCash}
                onChangeText={setInitialCash}
                keyboardType="numeric"
                placeholder="0.00"
              />

              <TouchableOpacity style={styles.primaryBtn} onPress={handleStart}>
                <Ionicons name="log-in-outline" size={20} color="#FFF" style={{ marginRight: 6 }} />
                <Text style={styles.primaryBtnText}>Aperturar / Empezar Turno</Text>
              </TouchableOpacity>
            </View>
          )}
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
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 480,
    padding: 24,
    ...Platform.select({
      web: {
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
      default: {
        elevation: 8,
      },
    }),
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  form: {
    marginTop: 4,
  },
  activeShiftBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: '#0F172A',
  },
  primaryBtn: {
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  secondaryBtn: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: '#FFF',
  },
  secondaryBtnText: {
    color: '#64748B',
    fontWeight: '600',
    fontSize: 14,
  },
});
