import { Category, Product, ShiftInfo, CompletedSale } from '../types';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS } from '../data/initialData';

// Configuración de URL base del Backend
// Permite sobreescritura mediante variable de entorno o localhost por defecto
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export class ApiService {
  private static baseUrl = API_BASE_URL;

  static setBaseUrl(url: string) {
    this.baseUrl = url.replace(/\/+$/, '');
  }

  static getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Health check para comprobar conectividad con el backend
   */
  static async checkHealth(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      // Usar endpoint de salud en el root o /api/v1
      const rootUrl = this.baseUrl.replace(/\/api\/v1$/, '');
      const response = await fetch(`${rootUrl}/health`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Pull Delta Sync: Obtiene categorías y catálogo actualizado desde el backend.
   * Si el backend no responde o no está disponible, hace fallback silencioso a los datos locales.
   */
  static async pullCatalog(lastPulledAt?: string): Promise<{
    categories: Category[];
    products: Product[];
    serverTimestamp?: string;
    isRemote: boolean;
  }> {
    try {
      const url = new URL(`${this.baseUrl}/sync/pull`);
      if (lastPulledAt) {
        url.searchParams.set('last_pulled_at', lastPulledAt);
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const res = await fetch(url.toString(), {
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();

      // Mapear categorías si vienen de la API
      const remoteCategories: Category[] = (data.categories || []).map(
        (c: any) => ({
          id: c.id,
          name: c.name,
          icon: c.icon || 'grid-outline',
        })
      );

      // Mapear productos si vienen de la API
      const remoteProducts: Product[] = (data.products || []).map((p: any) => ({
        id: p.id,
        categoryId: p.categoryId,
        name: p.name,
        code: p.barcode || p.sku || p.id.slice(0, 7),
        basePrice: Number(p.basePrice) || 0,
        imageUrl: p.imageUrl,
      }));

      return {
        categories:
          remoteCategories.length > 0 ? remoteCategories : INITIAL_CATEGORIES,
        products: remoteProducts.length > 0 ? remoteProducts : INITIAL_PRODUCTS,
        serverTimestamp: data.serverTimestamp,
        isRemote: true,
      };
    } catch {
      // Fallback a los datos locales preconfigurados (Offline-first)
      return {
        categories: INITIAL_CATEGORIES,
        products: INITIAL_PRODUCTS,
        isRemote: false,
      };
    }
  }

  /**
   * Push Sync: Envía lotes de ventas y turnos hacia el backend (/sync/sales)
   */
  static async pushSync(payload: {
    shifts?: ShiftInfo[];
    sales?: CompletedSale[];
  }): Promise<{
    status: 'success' | 'partial_success' | 'error';
    syncedSales: string[];
    syncedShifts: string[];
  }> {
    try {
      // Adaptar el formato de la venta al DTO que espera NestJS
      const formattedSales = (payload.sales || []).map((s) => ({
        id: s.id.startsWith('VTA-') ? undefined : s.id, // backend requiere UUID o lo genera si no es UUID
        shiftId: s.shiftId,
        subtotal: s.subtotal,
        discountTotal: s.discountTotal,
        total: s.total,
        totalReceived: s.totalReceived,
        changeGiven: s.changeGiven,
        items: s.items.map((it) => ({
          productId: it.product.id.startsWith('p') ? undefined : it.product.id,
          productNameSnapshot: it.product.name,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          unitDiscount: it.discount,
        })),
        payments: s.payments.map((p) => ({
          method: p.method,
          amount: p.amountReceived,
        })),
        createdAt: new Date().toISOString(),
      }));

      const formattedShifts = (payload.shifts || []).map((sh) => ({
        id: sh.id,
        cashierName: sh.cashierName,
        initialCash: sh.initialCash,
      }));

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(`${this.baseUrl}/sync/sales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shifts: formattedShifts,
          sales: formattedSales,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`Sync error: ${res.status}`);
      }

      const resData = await res.json();
      return {
        status: resData.status || 'success',
        syncedSales: resData.syncedSales || [],
        syncedShifts: resData.syncedShifts || [],
      };
    } catch {
      return {
        status: 'error',
        syncedSales: [],
        syncedShifts: [],
      };
    }
  }

  /**
   * Apertura de turno remota directa en el backend
   */
  static async createShift(
    cashierName: string,
    initialCash: number,
    shiftId?: string
  ): Promise<{ id: string } | null> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(`${this.baseUrl}/shifts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: shiftId,
          cashierName,
          initialCash,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        return await res.json();
      }
      return null;
    } catch {
      return null;
    }
  }
}
