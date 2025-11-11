import { PrismaClient } from './src/generated/prisma/client';

const prisma = new PrismaClient();

async function addSampleImages() {
  const orderId = 'ab7e8cf8-dc36-4545-b645-f90ee607a273';

  // Check if order exists
  const order = await prisma.radiologyOrder.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    console.log('❌ Order not found:', orderId);
    await prisma.$disconnect();
    return;
  }

  console.log('✅ Found order:', order.orderNumber);

  // Check existing images
  const existing = await prisma.imagingAsset.findMany({
    where: { radiologyOrderId: orderId },
  });

  if (existing.length > 0) {
    console.log('ℹ️  Order already has', existing.length, 'images');
    await prisma.$disconnect();
    return;
  }

  const sampleImages = [
    {
      uri: 'https://via.placeholder.com/800x600/0066CC/FFFFFF?text=USG+Whole+Abdomen+1',
      mimeType: 'image/png',
    },
    {
      uri: 'https://via.placeholder.com/800x600/0099FF/FFFFFF?text=USG+Whole+Abdomen+2',
      mimeType: 'image/png',
    },
    {
      uri: 'https://via.placeholder.com/800x600/00CCFF/FFFFFF?text=USG+Whole+Abdomen+3',
      mimeType: 'image/png',
    },
  ];

  for (const img of sampleImages) {
    await prisma.imagingAsset.create({
      data: {
        radiologyOrderId: orderId,
        uri: img.uri,
        mimeType: img.mimeType,
      },
    });
    console.log('✅ Added image:', img.uri);
  }

  await prisma.$disconnect();
  console.log('🎉 Done!');
}

addSampleImages().catch(console.error);

