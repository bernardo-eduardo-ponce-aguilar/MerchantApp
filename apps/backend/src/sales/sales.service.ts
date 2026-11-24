import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { PaymentMethod, SaleStatus, SyncStatus } from '@prisma/client';

@Injectable()
export class SalesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSaleDto) {
    // Si ya existe por reintento offline idempotente
    if (dto.id) {
      const existing = await this.prisma.sale.findUnique({
        where: { id: dto.id },
        include: { items: true, payments: true },
      });
      if (existing) {
        return existing;
      }
    }

    const shift = await this.prisma.shift.findUnique({
      where: { id: dto.shiftId },
    });
    if (!shift) {
      throw new NotFoundException(`El turno con id ${dto.shiftId} no existe`);
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Crear Venta
      const sale = await tx.sale.create({
        data: {
          ...(dto.id ? { id: dto.id } : {}),
          shiftId: dto.shiftId,
          subtotal: dto.subtotal,
          discountTotal: dto.discountTotal ?? 0,
          total: dto.total,
          totalReceived: dto.totalReceived,
          changeGiven: dto.changeGiven ?? 0,
          status: SaleStatus.COMPLETED,
          syncStatus: SyncStatus.SYNCED,
          ...(dto.createdAt ? { createdAt: new Date(dto.createdAt) } : {}),
          items: {
            create: dto.items.map((item) => ({
              ...(item.id ? { id: item.id } : {}),
              productId: item.productId,
              productNameSnapshot: item.productNameSnapshot,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              unitDiscount: item.unitDiscount ?? 0,
            })),
          },
          payments: {
            create: dto.payments.map((p) => ({
              ...(p.id ? { id: p.id } : {}),
              method: p.method as unknown as PaymentMethod,
              amount: p.amount,
            })),
          },
        },
        include: {
          items: true,
          payments: true,
        },
      });

      // 2. Descontar stock para productos que lleven control de inventario (trackStock === true)
      for (const item of dto.items) {
        if (item.productId) {
          await tx.product.updateMany({
            where: { id: item.productId, trackStock: true },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });
        }
      }

      return sale;
    });
  }

  async findAll(params?: { shiftId?: string; take?: number }) {
    const { shiftId, take = 50 } = params || {};
    return this.prisma.sale.findMany({
      where: {
        ...(shiftId ? { shiftId } : {}),
      },
      include: {
        items: true,
        payments: true,
        shift: {
          select: { id: true, cashierName: true, isActive: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: Math.min(take, 100),
    });
  }

  async findOne(id: string) {
    const sale = await this.prisma.sale.findUnique({
      where: { id },
      include: {
        items: true,
        payments: true,
        shift: true,
      },
    });

    if (!sale) {
      throw new NotFoundException(`Venta con id ${id} no encontrada`);
    }

    return sale;
  }

  async cancel(id: string) {
    const sale = await this.findOne(id);
    if (sale.status === SaleStatus.CANCELLED) {
      throw new BadRequestException('Esta venta ya se encuentra cancelada');
    }

    return this.prisma.$transaction(async (tx) => {
      // Revertir inventario solo para productos con control de stock
      for (const item of sale.items) {
        if (item.productId) {
          await tx.product.updateMany({
            where: { id: item.productId, trackStock: true },
            data: {
              stock: {
                increment: item.quantity,
              },
            },
          });
        }
      }

      return tx.sale.update({
        where: { id },
        data: { status: SaleStatus.CANCELLED },
        include: { items: true, payments: true },
      });
    });
  }
}
