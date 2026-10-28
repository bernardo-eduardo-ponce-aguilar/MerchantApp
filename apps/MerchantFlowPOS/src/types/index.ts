export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface Product {
  id: string;
  categoryId: string;
  name: string;
  code: string;
  basePrice: number;
  imageUrl?: string;
}

export interface CartItem {
  cartItemId: string;
  product: Product;
  quantity: number;
  unitPrice: number; // Modifiable price
  discount: number;  // Direct discount amount or percentage
}

export type PaymentMethodType = 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA';

export interface PaymentEntry {
  method: PaymentMethodType;
  amountReceived: number;
}

export interface ShiftInfo {
  cashierName: string;
  initialCash: number;
  startedAt: string;
  isActive: boolean;
}

export interface CompletedSale {
  id: string;
  timestamp: string;
  items: CartItem[];
  subtotal: number;
  discountTotal: number;
  total: number;
  payments: PaymentEntry[];
  totalReceived: number;
  changeGiven: number;
}
