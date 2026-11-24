import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateShiftDto {
  @ApiPropertyOptional({ description: 'ID universal generado por el cliente POS (opcional)' })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiProperty({ example: 'Juan Pérez', description: 'Nombre del cajero' })
  @IsString()
  @IsNotEmpty()
  cashierName: string;

  @ApiProperty({ example: 500.0, description: 'Monto con el que abre la caja' })
  @IsNumber()
  @Min(0)
  initialCash: number;
}
