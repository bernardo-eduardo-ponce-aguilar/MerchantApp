import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class UpdateProductDto {
  @ApiPropertyOptional({ example: 'Coca Cola 600ml No Retornable' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: '7501055310884' })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiPropertyOptional({ example: 19.5 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  basePrice?: number;

  @ApiPropertyOptional({ example: 13.0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  cost?: number;

  @ApiPropertyOptional({ example: 60 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  stock?: number;

  @ApiPropertyOptional({ example: false, description: 'Modificar si controla o no inventario' })
  @IsBoolean()
  @IsOptional()
  trackStock?: boolean;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
