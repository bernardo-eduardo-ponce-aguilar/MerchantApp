import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { SyncService } from './sync.service';
import { SyncPushDto } from './dto/sync-push.dto';

@ApiTags('Sync Protocol')
@Controller('sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Post('sales')
  @ApiOperation({ summary: 'Push: Sincronizar lote de ventas y turnos originados offline (Outbox)' })
  @ApiResponse({ status: 200, description: 'Lote procesado exitosamente' })
  pushSales(@Body() dto: SyncPushDto) {
    return this.syncService.processPush(dto);
  }

  @Get('pull')
  @ApiOperation({ summary: 'Pull: Delta Sync de catálogo y precios para terminales POS' })
  @ApiQuery({
    name: 'last_pulled_at',
    required: false,
    description: 'Timestamp ISO8601 de la última sincronización',
  })
  pullDelta(@Query('last_pulled_at') lastPulledAt?: string) {
    return this.syncService.processPull(lastPulledAt);
  }
}
