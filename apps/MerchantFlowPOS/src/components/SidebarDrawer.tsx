import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ShiftInfo } from '../types';

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
      <View style={styles.drawer}>
        <View style={styles.drawerHeader}>
          <View style={styles.brandContainer}>
            <View style={styles.brandIcon}>
              <Ionicons name="card" size={22} color="#FFF" />
            </View>
            <View>
              <Text style={styles.brandTitle}>MerchantFlow</Text>
              <Text style={styles.brandSubtitle}>Terminal POS v1.0</Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* Info Cajero */}
        <View style={styles.cashierBox}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={20} color="#2563EB" />
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.cashierTitle}>
              {activeShift?.cashierName || 'Sin turno abierto'}
            </Text>
            <Text style={styles.cashierStatus}>
              {activeShift?.isActive ? '● En turno activo' : '○ Turno no iniciado'}
            </Text>
          </View>
        </View>

        {/* Lista de viñetas de navegación */}
        <ScrollView style={styles.menuList}>
          <Text style={styles.sectionHeader}>MÓDULOS DE OPERACIÓN</Text>
          {menuItems.map((item) => {
            const isSelected = currentScreen === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.menuItem, isSelected && styles.menuItemActive]}
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
                  color={isSelected ? '#2563EB' : '#475569'}
                  style={{ marginRight: 12 }}
                />
                <Text style={[styles.menuText, isSelected && styles.menuTextActive]}>
                  {item.label}
                </Text>
                {item.tag ? (
                  <View
                    style={[
                      styles.tagBadge,
                      item.id === 'shift' && activeShift?.isActive
                        ? styles.tagSuccess
                        : styles.tagDefault,
                    ]}
                  >
                    <Text
                      style={[
                        styles.tagText,
                        item.id === 'shift' && activeShift?.isActive && styles.tagTextSuccess,
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

        <View style={styles.drawerFooter}>
          <TouchableOpacity style={styles.shiftActionBtn} onPress={() => { onOpenShiftModal(); onClose(); }}>
            <Ionicons name="swap-horizontal" size={18} color="#2563EB" />
            <Text style={styles.shiftActionText}>
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
    backgroundColor: '#FFFFFF',
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
    borderBottomColor: '#F1F5F9',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  brandSubtitle: {
    fontSize: 11,
    color: '#64748B',
  },
  closeBtn: {
    padding: 6,
  },
  cashierBox: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cashierTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  cashierStatus: {
    fontSize: 12,
    color: '#059669',
    marginTop: 2,
  },
  menuList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
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
  menuItemActive: {
    backgroundColor: '#EFF6FF',
  },
  menuText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#334155',
    flex: 1,
  },
  menuTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
  tagBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  tagDefault: {
    backgroundColor: '#F1F5F9',
  },
  tagSuccess: {
    backgroundColor: '#DCFCE7',
  },
  tagText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
  },
  tagTextSuccess: {
    color: '#16A34A',
  },
  drawerFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  shiftActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
  },
  shiftActionText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
  },
});
