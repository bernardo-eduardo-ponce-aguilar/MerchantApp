import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ShiftInfo } from '../types';

interface HeaderProps {
  onToggleSidebar: () => void;
  activeShift: ShiftInfo | null;
  onOpenShiftModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  activeShift,
  onOpenShiftModal,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.leftRow}>
        <TouchableOpacity style={styles.menuButton} onPress={onToggleSidebar}>
          <Ionicons name="menu" size={26} color="#1E293B" />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.appTitle}>MerchantFlow POS</Text>
          <Text style={styles.terminalBadge}>Terminal #01</Text>
        </View>
      </View>

      <View style={styles.rightRow}>
        <TouchableOpacity style={styles.shiftButton} onPress={onOpenShiftModal}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: activeShift?.isActive ? '#10B981' : '#F59E0B' },
            ]}
          />
          <Text style={styles.shiftCashierName}>
            {activeShift?.isActive ? activeShift.cashierName : 'Turno sin abrir'}
          </Text>
          <Ionicons name="chevron-down" size={14} color="#64748B" style={{ marginLeft: 4 }} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 58,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuButton: {
    padding: 6,
    marginRight: 10,
    borderRadius: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  appTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  terminalBadge: {
    fontSize: 11,
    color: '#2563EB',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontWeight: '700',
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shiftButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  shiftCashierName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
});
