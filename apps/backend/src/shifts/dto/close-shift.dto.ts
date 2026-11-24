import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export class CloseShiftDto {
  @ApiProperty({ example: 1850.5, description: 'Total de efectivo contado al cerrar turno' })
  @IsNumber()
  @Min(0)
  finalCash: number;
}
