import { PrismaClient, PaymentMethod, SaleStatus, SyncStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Limpiar o asegurar categorías
  const categoriesData = [
    { name: 'Bebidas', description: 'Refrescos, aguas y jugos' },
    { name: 'Alimentos', description: 'Snacks, tortas y sándwiches' },
    { name: 'Cafetería', description: 'Café americano, capuchino y tés' },
    { name: 'Postres', description: 'Pasteles, galletas y helados' },
  ];

  const categories = [];
  for (const cat of categoriesData) {
    const existing = await prisma.category.findFirst({ where: { name: cat.name } });
    if (!existing) {
      const created = await prisma.category.create({ data: cat });
      categories.push(created);
    } else {
      categories.push(existing);
    }
  }

  const [bebidas, alimentos, cafeteria, postres] = categories;

  // 2. Catálogo de productos inicial
  const productsData = [
    {
      code: '7501055310884',
      name: 'Coca Cola 600ml',
      basePrice: 18.0,
      cost: 12.0,
      stock: 50,
      trackStock: true,
      categoryId: bebidas?.id,
    },
    {
      code: '7501011123456',
      name: 'Agua Mineral 500ml',
      basePrice: 15.0,
      cost: 8.0,
      stock: 40,
      trackStock: true,
      categoryId: bebidas?.id,
    },
    {
      code: 'CAF001',
      name: 'Café Americano 12oz (Preparado al momento)',
      basePrice: 35.0,
      cost: 10.0,
      stock: 0,
      trackStock: false,
      categoryId: cafeteria?.id,
    },
    {
      code: 'CAF002',
      name: 'Capuchino Vainilla 16oz (Preparado al momento)',
      basePrice: 48.0,
      cost: 16.0,
      stock: 0,
      trackStock: false,
      categoryId: cafeteria?.id,
    },
    {
      code: 'ALI001',
      name: 'Sándwich de Jamón y Queso (Cocina al momento)',
      basePrice: 45.0,
      cost: 22.0,
      stock: 0,
      trackStock: false,
      categoryId: alimentos?.id,
    },
    {
      code: 'POS001',
      name: 'Rebanada Pastel de Chocolate',
      basePrice: 40.0,
      cost: 18.0,
      stock: 15,
      trackStock: true,
      categoryId: postres?.id,
    },
  ];

  for (const prod of productsData) {
    await prisma.product.upsert({
      where: { code: prod.code },
      update: { trackStock: prod.trackStock },
      create: prod,
    });
  }

  // 3. Crear un turno demo si no existe alguno activo
  const activeShift = await prisma.shift.findFirst({ where: { isActive: true } });
  if (!activeShift) {
    await prisma.shift.create({
      data: {
        cashierName: 'Cajero Principal (Demo)',
        initialCash: 500.0,
        openedAt: new Date(),
        isActive: true,
        syncStatus: SyncStatus.SYNCED,
      },
    });
  }

  console.log('✅ Database seeded successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
