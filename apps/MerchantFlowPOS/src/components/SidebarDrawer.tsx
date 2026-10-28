import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ShiftInfo } from '../types';
import { useTheme } from '../theme/ThemeContext';

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeShift: ShiftInfo | null;
  onOpenShiftModal: () => void;
  currentScreen: string;
  onSelectScreen: (screen: string) => void;
}

export const SidebarDrawer: React.FC<SidebarDrawerProps> = ({
  isOpen,
  onClose,
  activeShift,
  onOpenShiftModal,
  currentScreen,
  onSelectScreen,
}) => {
  const { theme } = useTheme();

  if (!isOpen) return null;

  const menuItems = [
    { id: 'pos', label: 'Punto de Venta / Caja', icon: 'cart-outline', tag: 'Principal' },
    { id: 'comandas', label: 'Comandas & Cocina', icon: 'restaurant-outline', tag: 'Opcional' },
    { id: 'shift', label: 'Control de Turno', icon: 'wallet-outline', tag: activeShift?.isActive ? 'Activo' : 'Cerrado' },
    { id: 'hardware', label: 'Impresoras (BT / USB)', icon: 'print-outline', tag: 'Hardware' },
    { id: 'settings', label: 'Configuración POS', icon: 'settings-outline', tag: '' },
  ];

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
      <View style={[styles.drawer, { backgroundColor: theme.surface }]}>
        <View style={[styles.drawerHeader, { borderBottomColor: theme.border }]}>
          <View style={styles.brandContainer}>
            <View style={[styles.brandIcon, { backgroundColor: theme.primary }]}>
              <Ionicons name="card" size={22} color="#FFF" />
            </View>
            <View>
              <Text style={[styles.brandTitle, { color: theme.text }]}>MerchantFlow</Text>
              <Text style={[styles.brandSubtitle, { color: theme.textSubtle }]}>Terminal POS v1.0</Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color={theme.textSubtle} />
          </TouchableOpacity>
        </View>

        {/* Info Cajero */}
        <View style={[styles.cashierBox, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}>
          <View style={[styles.avatar, { backgroundColor: theme.primaryLight }]}>
            <Ionicons name="person" size={20} color={theme.primary} />
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={[styles.cashierTitle, { color: theme.text }]}>
              {activeShift?.cashierName || 'Sin turno abierto'}
            </Text>
            <Text style={[styles.cashierStatus, { color: theme.success }]}>
              {activeShift?.isActive ? '● En turno activo' : '○ Turno no iniciado'}
            </Text>
          </View>
        </View>

        {/* Lista de viñetas de navegación */}
        <ScrollView style={styles.menuList}>
          <Text style={[styles.sectionHeader, { color: theme.textSubtle }]}>MÓDULOS DE OPERACIÓN</Text>
          {menuItems.map((item) => {
            const isSelected = currentScreen === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.menuItem,
                  isSelected && { backgroundColor: theme.primaryLight },
                ]}
                onPress={() => {
                  if (item.id === 'shift') {
                    onOpenShiftModal();
                  } else {
                    onSelectScreen(item.id);
                  }
                  onClose();
                }}
              >
                <Ionicons
                  name={item.icon as any}
                  size={20}
                  color={isSelected ? theme.primary : theme.textMuted}
                  style={{ marginRight: 12 }}
                />
                <Text
                  style={[
                    styles.menuText,
                    { color: isSelected ? theme.primary : theme.textMuted },
                    isSelected && styles.menuTextActive,
                  ]}
                >
                  {item.label}
                </Text>
                {item.tag ? (
                  <View
                    style={[
                      styles.tagBadge,
                      item.id === 'shift' && activeShift?.isActive
                        ? { backgroundColor: theme.successLight }
                        : { backgroundColor: theme.surfaceSubtle },
                    ]}
                  >
                    <Text
                      style={[
                        styles.tagText,
                        {
                          color:
                            item.id === 'shift' && activeShift?.isActive
                              ? theme.success
                              : theme.textSubtle,
                        },
                      ]}
                    >
                      {item.tag}
                    </Text>
                  </View>
                ) : null}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={[styles.drawerFooter, { borderTopColor: theme.border }]}>
          <TouchableOpacity
            style={[styles.shiftActionBtn, { backgroundColor: theme.primaryLight }]}
            onPress={() => { onOpenShiftModal(); onClose(); }}
          >
            <Ionicons name="swap-horizontal" size={18} color={theme.primary} />
            <Text style={[styles.shiftActionText, { color: theme.primary }]}>
              {activeShift?.isActive ? 'Gestionar / Cerrar Turno' : 'Iniciar Turno'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    flexDirection: 'row',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
  },
  drawer: {
    width: 320,
    height: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 16,
    display: 'flex',
    flexDirection: 'column',
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 45,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  brandSubtitle: {
    fontSize: 11,
  },
  closeBtn: {
    padding: 6,
  },
  cashierBox: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cashierTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  cashierStatus: {
    fontSize: 12,
    marginTop: 2,
  },
  menuList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginVertical: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  menuText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  menuTextActive: {
    fontWeight: '700',
  },
  tagBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '600',
  },
  drawerFooter: {
    padding: 16,
    borderTopWidth: 1,
  },
  shiftActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  shiftActionText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },
});
