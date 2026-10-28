import { Category, Product } from '../types';

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'all', name: 'Todos', icon: 'grid-outline' },
  { id: 'bebidas', name: 'Bebidas', icon: 'wine-outline' },
  { id: 'alimentos', name: 'Alimentos', icon: 'fast-food-outline' },
  { id: 'cafeteria', name: 'Cafetería', icon: 'cafe-outline' },
  { id: 'postres', name: 'Postres & Dulces', icon: 'ice-cream-outline' },
  { id: 'abarrotes', name: 'Abarrotes', icon: 'basket-outline' },
];

export const INITIAL_PRODUCTS: Product[] = [
  { id: 'p1', categoryId: 'bebidas', name: 'Agua Mineral 600ml', code: '7501001', basePrice: 18.0 },
  { id: 'p2', categoryId: 'bebidas', name: 'Refresco Cola 500ml', code: '7501002', basePrice: 22.0 },
  { id: 'p3', categoryId: 'bebidas', name: 'Jugo Natural Naranja', code: '7501003', basePrice: 35.0 },
  { id: 'p4', categoryId: 'cafeteria', name: 'Café Americano 12oz', code: '7502001', basePrice: 32.0 },
  { id: 'p5', categoryId: 'cafeteria', name: 'Cappuccino Vainilla', code: '7502002', basePrice: 48.0 },
  { id: 'p6', categoryId: 'alimentos', name: 'Torta de Jamón & Queso', code: '7503001', basePrice: 55.0 },
  { id: 'p7', categoryId: 'alimentos', name: 'Hamburguesa Clásica', code: '7503002', basePrice: 85.0 },
  { id: 'p8', categoryId: 'alimentos', name: 'Sandwich Integral Pavo', code: '7503003', basePrice: 62.0 },
  { id: 'p9', categoryId: 'postres', name: 'Rebanada Pastel Chocolate', code: '7504001', basePrice: 45.0 },
  { id: 'p10', categoryId: 'postres', name: 'Muffin de Arándanos', code: '7504002', basePrice: 30.0 },
  { id: 'p11', categoryId: 'abarrotes', name: 'Papas Fritas 150g', code: '7505001', basePrice: 24.5 },
  { id: 'p12', categoryId: 'abarrotes', name: 'Galletas de Avena', code: '7505002', basePrice: 20.0 },
];
