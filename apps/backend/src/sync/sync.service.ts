import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SalesService } from '../sales/sales.service';
import { ShiftsService } from '../shifts/shifts.service';
import { SyncPushDto } from './dto/sync-push.dto';

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly salesService: SalesService,
    private readonly shiftsService: ShiftsService,
  ) {}

  async processPush(dto: SyncPushDto) {
    const syncedShifts: string[] = [];
    const syncedSales: string[] = [];
    const errors: { id: string; error: string }[] = [];

    // 1. Sincronizar turnos primero para que las ventas encuentren su shiftId
    if (dto.shifts && dto.shifts.length > 0) {
      for (const shiftDto of dto.shifts) {
        try {
          if (shiftDto.id) {
            const existing = await this.prisma.shift.findUnique({
              where: { id: shiftDto.id },
            });
            if (existing) {
              syncedShifts.push(existing.id);
              continue;
            }
          }
          const created = await this.shiftsService.create(shiftDto);
          syncedShifts.push(created.id);
        } catch (err) {
          this.logger.error(`Error syncing shift ${shiftDto.id}:`, err);
          errors.push({
            id: shiftDto.id || 'unknown-shift',
            error: err instanceof Error ? err.message : 'Unknown error',
          });
        }
      }
    }

    // 2. Sincronizar ventas
    if (dto.sales && dto.sales.length > 0) {
      for (const saleDto of dto.sales) {
        try {
          const sale = await this.salesService.create(saleDto);
          syncedSales.push(sale.id);
        } catch (err) {
          this.logger.error(`Error syncing sale ${saleDto.id}:`, err);
          errors.push({
            id: saleDto.id || 'unknown-sale',
            error: err instanceof Error ? err.message : 'Unknown error',
          });
        }
      }
    }

    return {
      status: errors.length === 0 ? 'success' : 'partial_success',
      syncedShifts,
      syncedSales,
      errors,
      serverTimestamp: new Date().toISOString(),
    };
  }

  async processPull(lastPulledAt?: string) {
    const dateFilter = lastPulledAt ? new Date(lastPulledAt) : new Date(0);

    const [categories, products] = await Promise.all([
      this.prisma.category.findMany({
        where: {
          updatedAt: { gte: dateFilter },
        },
      }),
      this.prisma.product.findMany({
        where: {
          updatedAt: { gte: dateFilter },
        },
        include: {
          category: {
            select: { id: true, name: true },
          },
        },
      }),
    ]);

    return {
      serverTimestamp: new Date().toISOString(),
      categories,
      products,
    };
  }
}
