import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ShiftInfo } from '../types';
import { useTheme } from '../theme/ThemeContext';

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
  const { theme, isDark, toggleTheme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
      <View style={styles.leftRow}>
        <TouchableOpacity style={styles.menuButton} onPress={onToggleSidebar}>
          <Ionicons name="menu" size={26} color={theme.text} />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={[styles.appTitle, { color: theme.text }]}>MerchantFlow POS</Text>
          <Text style={[styles.terminalBadge, { backgroundColor: theme.primaryLight, color: theme.primary }]}>
            Terminal #01
          </Text>
        </View>
      </View>

      <View style={styles.rightRow}>
        {/* Switch Global Modo Nocturno / Oscuro */}
        <View style={[styles.themeSwitchContainer, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}>
          <Ionicons
            name={isDark ? 'moon' : 'sunny'}
            size={16}
            color={isDark ? '#818CF8' : '#F59E0B'}
            style={{ marginRight: 6 }}
          />
          <Text style={[styles.themeLabel, { color: theme.textMuted }]}>
            {isDark ? 'Oscuro' : 'Claro'}
          </Text>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: '#CBD5E1', true: '#3B82F6' }}
            thumbColor={isDark ? '#FFFFFF' : '#FFFFFF'}
            style={Platform.OS === 'web' ? { transform: [{ scale: 0.8 }], marginLeft: 4 } : { marginLeft: 4 }}
          />
        </View>

        {/* Botón de Turno */}
        <TouchableOpacity
          style={[styles.shiftButton, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}
          onPress={onOpenShiftModal}
        >
          <View
            style={[
              styles.statusDot,
              { backgroundColor: activeShift?.isActive ? '#10B981' : '#F59E0B' },
            ]}
          />
          <Text style={[styles.shiftCashierName, { color: theme.textMuted }]}>
            {activeShift?.isActive ? activeShift.cashierName : 'Turno sin abrir'}
          </Text>
          <Ionicons name="chevron-down" size={14} color={theme.textSubtle} style={{ marginLeft: 4 }} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 58,
    borderBottomWidth: 1,
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
  },
  terminalBadge: {
    fontSize: 11,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontWeight: '700',
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  themeSwitchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  themeLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  shiftButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
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
  },
});
