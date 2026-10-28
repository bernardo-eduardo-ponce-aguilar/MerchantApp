import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Category, Product } from '../types';
import { useTheme } from '../theme/ThemeContext';

interface ProductCatalogProps {
  categories: Category[];
  products: Product[];
  selectedCategoryId: string;
  onSelectCategory: (catId: string) => void;
  searchQuery: string;
  onChangeSearchQuery: (query: string) => void;
  onAddProduct: (product: Product) => void;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  categories,
  products,
  selectedCategoryId,
  onSelectCategory,
  searchQuery,
  onChangeSearchQuery,
  onAddProduct,
}) => {
  const { theme } = useTheme();
  const { width, height } = useWindowDimensions();
  const isLandscape = width >= height;

  // En Landscape se usan 3 o 4 columnas; en Portrait pantallas estrechas se usan 2 columnas
  const numColumns = isLandscape ? (width > 1000 ? 4 : 3) : (width > 600 ? 3 : 2);

  const filteredProducts = products.filter((prod) => {
    const matchesCategory =
      selectedCategoryId === 'all' || prod.categoryId === selectedCategoryId;
    const matchesSearch =
      prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Barra de búsqueda */}
      <View style={[styles.searchBarContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Ionicons name="search" size={20} color={theme.textSubtle} style={{ marginRight: 8 }} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Buscar producto por nombre o código de barra..."
          placeholderTextColor={theme.textSubtle}
          value={searchQuery}
          onChangeText={onChangeSearchQuery}
          clearButtonMode="while-editing"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => onChangeSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color={theme.textSubtle} />
          </TouchableOpacity>
        )}
      </View>

      {/* Selector de Categorías (Horizontal) */}
      <View style={styles.categoriesWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        >
          {categories.map((cat) => {
            const isSelected = cat.id === selectedCategoryId;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryPill,
                  {
                    backgroundColor: isSelected ? theme.primary : theme.surface,
                    borderColor: isSelected ? theme.primary : theme.border,
                  },
                ]}
                onPress={() => onSelectCategory(cat.id)}
              >
                <Ionicons
                  name={cat.icon as any}
                  size={16}
                  color={isSelected ? '#FFFFFF' : theme.textMuted}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={[
                    styles.categoryPillText,
                    { color: isSelected ? '#FFFFFF' : theme.textMuted },
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Grid de Productos Responsivo */}
      <FlatList
        key={numColumns} // Forzar re-render de FlatList cuando cambian las columnas
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        contentContainerStyle={styles.productsGrid}
        columnWrapperStyle={styles.columnWrapper}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="alert-circle-outline" size={48} color={theme.borderSubtle} />
            <Text style={[styles.emptyText, { color: theme.textSubtle }]}>
              No se encontraron productos en esta categoría
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.productCard,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
            activeOpacity={0.7}
            onPress={() => onAddProduct(item)}
          >
            <View style={[styles.productBadge, { backgroundColor: theme.surfaceSubtle }]}>
              <Text style={[styles.productCode, { color: theme.textSubtle }]}>{item.code}</Text>
            </View>
            <Text style={[styles.productName, { color: theme.text }]} numberOfLines={2}>
              {item.name}
            </Text>
            <View style={styles.productFooter}>
              <Text style={[styles.productPrice, { color: theme.text }]}>${item.basePrice.toFixed(2)}</Text>
              <View style={[styles.addIconCircle, { backgroundColor: theme.primaryLight }]}>
                <Ionicons name="add" size={18} color={theme.primary} />
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  categoriesWrapper: {
    marginBottom: 12,
  },
  categoriesList: {
    paddingRight: 10,
    gap: 8,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  categoryPillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  productsGrid: {
    paddingBottom: 20,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 10,
  },
  productCard: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    justifyContent: 'space-between',
    minHeight: 115,
  },
  productBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 6,
  },
  productCode: {
    fontSize: 10,
    fontWeight: '600',
  },
  productName: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  productFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  productPrice: {
    fontSize: 15,
    fontWeight: '700',
  },
  addIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    paddingVertical: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 10,
    fontSize: 14,
  },
});
