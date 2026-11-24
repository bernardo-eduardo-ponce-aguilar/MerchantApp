import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

export enum PaymentMethodEnum {
  EFECTIVO = 'EFECTIVO',
  TARJETA = 'TARJETA',
  TRANSFERENCIA = 'TRANSFERENCIA',
}

export class CreateSaleItemDto {
  @ApiPropertyOptional({ description: 'ID del item si se generó en cliente' })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({ description: 'ID del producto en catálogo' })
  @IsUUID()
  @IsOptional()
  productId?: string;

  @ApiProperty({ example: 'Coca Cola 600ml' })
  @IsString()
  @IsNotEmpty()
  productNameSnapshot: string;

  @ApiProperty({ example: 2 })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ example: 18.0 })
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiPropertyOptional({ example: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  unitDiscount?: number;
}

export class CreateSalePaymentDto {
  @ApiPropertyOptional({ description: 'ID del pago si se generó en cliente' })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiProperty({ enum: PaymentMethodEnum, example: PaymentMethodEnum.EFECTIVO })
  @IsEnum(PaymentMethodEnum)
  method: PaymentMethodEnum;

  @ApiProperty({ example: 50.0 })
  @IsNumber()
  @Min(0)
  amount: number;
}

export class CreateSaleDto {
  @ApiPropertyOptional({ description: 'UUID de la venta generado offline por la terminal POS' })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiProperty({ description: 'UUID del turno de caja en el que se efectuó la venta' })
  @IsUUID()
  @IsNotEmpty()
  shiftId: string;

  @ApiProperty({ example: 36.0 })
  @IsNumber()
  @Min(0)
  subtotal: number;

  @ApiPropertyOptional({ example: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  discountTotal?: number;

  @ApiProperty({ example: 36.0 })
  @IsNumber()
  @Min(0)
  total: number;

  @ApiProperty({ example: 50.0 })
  @IsNumber()
  @Min(0)
  totalReceived: number;

  @ApiPropertyOptional({ example: 14.0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  changeGiven?: number;

  @ApiProperty({ type: [CreateSaleItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSaleItemDto)
  items: CreateSaleItemDto[];

  @ApiProperty({ type: [CreateSalePaymentDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSalePaymentDto)
  payments: CreateSalePaymentDto[];

  @ApiPropertyOptional({ description: 'Timestamp de creación en cliente (ISO 8601)' })
  @IsOptional()
  createdAt?: string;
}
