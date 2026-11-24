import { Module } from '@nestjs/common';
import { SyncService } from './sync.service';
import { SyncController } from './sync.controller';
import { SalesModule } from '../sales/sales.module';
import { ShiftsModule } from '../shifts/shifts.module';

@Module({
  imports: [SalesModule, ShiftsModule],
  controllers: [SyncController],
  providers: [SyncService],
})
export class SyncModule {}
