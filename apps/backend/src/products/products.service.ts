import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProductDto) {
    const existing = await this.prisma.product.findUnique({
      where: { code: dto.code },
    });
    if (existing) {
      throw new ConflictException(`Ya existe un producto con el código ${dto.code}`);
    }

    return this.prisma.product.create({
      data: {
        ...(dto.id ? { id: dto.id } : {}),
        name: dto.name,
        code: dto.code,
        basePrice: dto.basePrice,
        cost: dto.cost ?? 0,
        stock: dto.stock ?? 0,
        trackStock: dto.trackStock ?? true,
        categoryId: dto.categoryId,
      },
      include: { category: true },
    });
  }

  async findAll(params?: { categoryId?: string; search?: string }) {
    const { categoryId, search } = params || {};
    return this.prisma.product.findMany({
      where: {
        isActive: true,
        ...(categoryId ? { categoryId } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { code: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: {
        category: {
          select: { id: true, name: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!product) {
      throw new NotFoundException(`Producto con id ${id} no encontrado`);
    }

    return product;
  }

  async findByCode(code: string) {
    const product = await this.prisma.product.findUnique({
      where: { code },
      include: { category: true },
    });

    if (!product) {
      throw new NotFoundException(`Producto con código ${code} no encontrado`);
    }

    return product;
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.findOne(id);
    return this.prisma.product.update({
      where: { id },
      data: dto,
      include: { category: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
