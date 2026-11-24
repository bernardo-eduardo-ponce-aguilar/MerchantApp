import { Controller, Get, Post, Body, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ShiftsService } from './shifts.service';
import { CreateShiftDto } from './dto/create-shift.dto';
import { CloseShiftDto } from './dto/close-shift.dto';

@ApiTags('Shifts')
@Controller('shifts')
export class ShiftsController {
  constructor(private readonly shiftsService: ShiftsService) {}

  @Post()
  @ApiOperation({ summary: 'Abrir un nuevo turno de caja' })
  @ApiResponse({ status: 201, description: 'Turno abierto' })
  create(@Body() createShiftDto: CreateShiftDto) {
    return this.shiftsService.create(createShiftDto);
  }

  @Get('active')
  @ApiOperation({ summary: 'Obtener el turno de caja actualmente activo' })
  getActive() {
    return this.shiftsService.getActive();
  }

  @Get()
  @ApiOperation({ summary: 'Listar historial de turnos' })
  findAll() {
    return this.shiftsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de un turno por UUID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.shiftsService.findOne(id);
  }

  @Post(':id/close')
  @ApiOperation({ summary: 'Cerrar un turno de caja' })
  close(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() closeShiftDto: CloseShiftDto,
  ) {
    return this.shiftsService.close(id, closeShiftDto);
  }
}
