import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CartItem } from '../types';
import { useTheme } from '../theme/ThemeContext';

interface EditItemModalProps {
  visible: boolean;
  item: CartItem | null;
  onClose: () => void;
  onSave: (cartItemId: string, newPrice: number, newDiscount: number) => void;
}

export const EditItemModal: React.FC<EditItemModalProps> = ({
  visible,
  item,
  onClose,
  onSave,
}) => {
  const { theme } = useTheme();

  if (!item) return null;

  const [price, setPrice] = useState(item.unitPrice.toString());
  const [discount, setDiscount] = useState(item.discount.toString());

  const handleSave = () => {
    const parsedPrice = parseFloat(price) || 0;
    const parsedDiscount = parseFloat(discount) || 0;
    onSave(item.cartItemId, parsedPrice, parsedDiscount);
    onClose();
  };

  const finalUnitPrice = Math.max(0, (parseFloat(price) || 0) - (parseFloat(discount) || 0));

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: theme.surface }]}>
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: theme.text }]}>Ajustar Precio / Descuento</Text>
              <Text style={[styles.productName, { color: theme.textSubtle }]}>{item.product.name}</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.textSubtle} />
            </TouchableOpacity>
          </View>

          <View style={styles.body}>
            <Text style={[styles.label, { color: theme.textMuted }]}>Precio Unitario ($ MXN)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border, color: theme.text }]}
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
              placeholder="0.00"
              placeholderTextColor={theme.textSubtle}
            />
            <Text style={[styles.hint, { color: theme.textSubtle }]}>
              Precio base de catálogo: ${item.product.basePrice.toFixed(2)}
            </Text>

            <Text style={[styles.label, { marginTop: 14, color: theme.textMuted }]}>Descuento por Unidad ($ MXN)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border, color: theme.text }]}
              value={discount}
              onChangeText={setDiscount}
              keyboardType="numeric"
              placeholder="0.00"
              placeholderTextColor={theme.textSubtle}
            />

            <View style={[styles.previewBox, { backgroundColor: theme.primaryLight }]}>
              <Text style={[styles.previewLabel, { color: theme.primary }]}>Precio Neto por Unidad:</Text>
              <Text style={[styles.previewValue, { color: theme.primary }]}>${finalUnitPrice.toFixed(2)}</Text>
            </View>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity style={[styles.cancelBtn, { borderColor: theme.border }]} onPress={onClose}>
              <Text style={[styles.cancelBtnText, { color: theme.textSubtle }]}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.primary }]} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Aplicar Cambios</Text>
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
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    borderRadius: 14,
    width: '100%',
    maxWidth: 420,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
  },
  productName: {
    fontSize: 13,
    marginTop: 2,
  },
  body: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  hint: {
    fontSize: 11,
    marginTop: 4,
  },
  previewBox: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previewLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  previewValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  saveBtn: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
