import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

export async function registerDb(app: FastifyInstance) {
  const prisma = new PrismaClient();
  await prisma.$connect();

  app.decorate('db', prisma);

  app.addHook('onClose', async () => {
    await prisma.$disconnect();
  });
}

declare module 'fastify' {
  interface FastifyInstance {
    db: PrismaClient;
  }
}
