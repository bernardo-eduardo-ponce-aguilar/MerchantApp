import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateProductDto {
  @ApiPropertyOptional({ description: 'UUID opcional provisto por el cliente POS' })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiProperty({ example: 'Coca Cola 600ml' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '7501055310884', description: 'Código de barras o SKU único' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 18.0, description: 'Precio de venta al público' })
  @IsNumber()
  @Min(0)
  basePrice: number;

  @ApiPropertyOptional({ example: 12.0, description: 'Costo del producto' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  cost?: number;

  @ApiPropertyOptional({ example: 50, description: 'Stock inicial (aplica si trackStock es true)' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  stock?: number;

  @ApiPropertyOptional({
    example: true,
    default: true,
    description: 'Indica si se controla y descuenta inventario (false para servicios o alimentos preparados al momento)',
  })
  @IsBoolean()
  @IsOptional()
  trackStock?: boolean;

  @ApiPropertyOptional({ description: 'ID de la categoría a la que pertenece' })
  @IsUUID()
  @IsOptional()
  categoryId?: string;
}
