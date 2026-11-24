import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Cloud Run & Shutdown lifecycle
  app.enableShutdownHooks();

  // CORS
  const allowedOrigins = process.env.CORS_ORIGIN || '*';
  app.enableCors({
    origin: allowedOrigins === '*' ? true : allowedOrigins.split(','),
    credentials: true,
  });

  // Global validation pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  // API Prefix (excluyendo health checks para Cloud Run)
  app.setGlobalPrefix('api/v1', {
    exclude: ['health', 'health/ready'],
  });

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('MerchantFlow Backend API')
    .setDescription(
      'API centralizada para Punto de Venta (MerchantFlowPOS) y Panel Administrativo (MerchantFlowApp) con soporte Offline-First y Delta Sync.',
    )
    .setVersion('1.0')
    .addTag('Health', 'Sondas de salud y estado de la base de datos (Cloud Run)')
    .addTag('Sync Protocol', 'Protocolo de sincronización Outbox y Delta Sync')
    .addTag('Shifts', 'Control y arqueo de turnos de caja')
    .addTag('Categories', 'Catálogo de categorías de productos')
    .addTag('Products', 'Catálogo e inventario de productos')
    .addTag('Sales', 'Registro de tickets de venta y pagos')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    customSiteTitle: 'MerchantFlow API Docs',
  });

  // Cloud Run usa la variable PORT (por defecto 8080 en Cloud Run, 3000 local)
  // y requiere escuchar en '0.0.0.0'
  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');

  logger.log(`🚀 MerchantFlow Backend is running on: http://localhost:${port}`);
  logger.log(`📚 Swagger documentation available at: http://localhost:${port}/docs`);
}

bootstrap();
