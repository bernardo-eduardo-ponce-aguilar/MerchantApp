import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { CreateSaleDto } from '../../sales/dto/create-sale.dto';
import { CreateShiftDto } from '../../shifts/dto/create-shift.dto';

export class SyncPushDto {
  @ApiPropertyOptional({ type: [CreateShiftDto], description: 'Turnos generados offline para sincronizar' })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateShiftDto)
  shifts?: CreateShiftDto[];

  @ApiPropertyOptional({ type: [CreateSaleDto], description: 'Ventas generadas offline para sincronizar' })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateSaleDto)
  sales?: CreateSaleDto[];
}
