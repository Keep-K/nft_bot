import { FastifyInstance } from 'fastify';

export async function registerAuth(app: FastifyInstance) {
  app.decorate('requireAuth', async (req: any, reply: any) => {
    try {
      await req.jwtVerify();
    } catch {
      return reply.code(401).send({ error: 'UNAUTHORIZED' });
    }
  });
}

declare module 'fastify' {
  interface FastifyInstance {
    requireAuth: any;
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { userId: string; address: string; sessionId: string };
    user: { userId: string; address: string; sessionId: string };
  }
}
