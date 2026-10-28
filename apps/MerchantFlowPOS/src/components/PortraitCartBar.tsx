import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

interface PortraitCartBarProps {
  itemCount: number;
  total: number;
  onOpenCartModal: () => void;
  onOpenCheckout: () => void;
}

export const PortraitCartBar: React.FC<PortraitCartBarProps> = ({
  itemCount,
  total,
  onOpenCartModal,
  onOpenCheckout,
}) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
      {/* Botón miniatura de carrito para ver detalle */}
      <TouchableOpacity
        style={[styles.cartSummaryButton, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}
        activeOpacity={0.7}
        onPress={onOpenCartModal}
      >
        <View style={[styles.badgeIconContainer, { backgroundColor: theme.primaryLight }]}>
          <Ionicons name="cart" size={20} color={theme.primary} />
          {itemCount > 0 && (
            <View style={[styles.badge, { backgroundColor: theme.danger }]}>
              <Text style={styles.badgeText}>{itemCount}</Text>
            </View>
          )}
        </View>

        <View style={styles.summaryTextContainer}>
          <Text style={[styles.summaryItemCount, { color: theme.textSubtle }]}>
            {itemCount} {itemCount === 1 ? 'ítem' : 'ítems'} en orden
          </Text>
          <Text style={[styles.summaryTotal, { color: theme.text }]}>
            ${total.toFixed(2)}
          </Text>
        </View>

        <Ionicons name="chevron-up" size={18} color={theme.textSubtle} style={{ marginLeft: 6 }} />
      </TouchableOpacity>

      {/* Botón directo de cobrar */}
      <TouchableOpacity
        style={[
          styles.checkoutButton,
          { backgroundColor: itemCount === 0 ? theme.borderSubtle : theme.success },
        ]}
        disabled={itemCount === 0}
        activeOpacity={0.8}
        onPress={onOpenCheckout}
      >
        <Ionicons name="cash-outline" size={20} color="#FFFFFF" style={{ marginRight: 6 }} />
        <Text style={styles.checkoutText}>Cobrar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 68,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 10,
  },
  cartSummaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  badgeIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  summaryTextContainer: {
    flex: 1,
    marginLeft: 10,
  },
  summaryItemCount: {
    fontSize: 11,
    fontWeight: '500',
  },
  summaryTotal: {
    fontSize: 16,
    fontWeight: '800',
  },
  checkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    height: '100%',
  },
  checkoutText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
