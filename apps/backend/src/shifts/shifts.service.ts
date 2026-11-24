import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateShiftDto } from './dto/create-shift.dto';
import { CloseShiftDto } from './dto/close-shift.dto';

@Injectable()
export class ShiftsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateShiftDto) {
    // Si ya hay un turno activo, se puede advertir o cerrar según regla de negocio
    const active = await this.getActive();
    if (active) {
      throw new BadRequestException(`Ya existe un turno activo para ${active.cashierName}`);
    }

    return this.prisma.shift.create({
      data: {
        ...(dto.id ? { id: dto.id } : {}),
        cashierName: dto.cashierName,
        initialCash: dto.initialCash,
        isActive: true,
      },
    });
  }

  async getActive() {
    return this.prisma.shift.findFirst({
      where: { isActive: true },
      include: {
        _count: {
          select: { sales: true },
        },
      },
    });
  }

  async close(id: string, dto: CloseShiftDto) {
    const shift = await this.prisma.shift.findUnique({
      where: { id },
      include: {
        sales: {
          include: { payments: true },
        },
      },
    });

    if (!shift) {
      throw new NotFoundException(`Turno con id ${id} no encontrado`);
    }

    if (!shift.isActive) {
      throw new BadRequestException('El turno ya se encuentra cerrado');
    }

    return this.prisma.shift.update({
      where: { id },
      data: {
        finalCash: dto.finalCash,
        closedAt: new Date(),
        isActive: false,
      },
    });
  }

  async findAll() {
    return this.prisma.shift.findMany({
      orderBy: { openedAt: 'desc' },
      take: 50,
      include: {
        _count: {
          select: { sales: true },
        },
      },
    });
  }

  async findOne(id: string) {
    const shift = await this.prisma.shift.findUnique({
      where: { id },
      include: {
        sales: {
          include: {
            items: true,
            payments: true,
          },
        },
      },
    });

    if (!shift) {
      throw new NotFoundException(`Turno con id ${id} no encontrado`);
    }

    return shift;
  }
}
