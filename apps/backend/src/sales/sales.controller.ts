import { Controller, Get, Post, Body, Param, Query, Patch, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';

@ApiTags('Sales')
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar una nueva venta' })
  create(@Body() createSaleDto: CreateSaleDto) {
    return this.salesService.create(createSaleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Consultar listado de ventas' })
  @ApiQuery({ name: 'shiftId', required: false, description: 'Filtrar por turno' })
  findAll(@Query('shiftId') shiftId?: string) {
    return this.salesService.findAll({ shiftId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de una venta por UUID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.salesService.findOne(id);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancelar una venta y restablecer inventario' })
  cancel(@Param('id', ParseUUIDPipe) id: string) {
    return this.salesService.cancel(id);
  }
}
