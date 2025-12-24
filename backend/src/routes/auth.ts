import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { randomBytes } from 'node:crypto';
import { SiweMessage } from 'siwe';

const GetNonceQuery = z.object({ address: z.string().min(10) });

const VerifyBody = z.object({
  address: z.string().min(10),
  message: z.string().min(10),
  signature: z.string().min(10)
});

export async function authRoutes(app: FastifyInstance) {
  app.get('/nonce', async (req, reply) => {
    const { address } = GetNonceQuery.parse(req.query);

    const checksum = address.toLowerCase();
    const user = await app.db.user.upsert({
      where: { address: checksum },
      update: {},
      create: { address: checksum }
    });

    const nonce = randomBytes(16).toString('hex');
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await app.db.authNonce.create({
      data: { nonce, expiresAt, userId: user.id }
    });

    return reply.send({ nonce, expiresAt });
  });

  app.post('/verify', async (req, reply) => {
    const body = VerifyBody.parse(req.body);
    const address = body.address.toLowerCase();

    const user = await app.db.user.findUnique({ where: { address } });
    if (!user) return reply.code(400).send({ error: 'USER_NOT_FOUND' });

    let siwe: SiweMessage;
    try {
      siwe = new SiweMessage(body.message);
    } catch {
      return reply.code(400).send({ error: 'INVALID_SIWE_MESSAGE' });
    }

    if (siwe.address.toLowerCase() !== address) {
      return reply.code(400).send({ error: 'ADDRESS_MISMATCH' });
    }
    if (Number(siwe.chainId) !== app.env.CHAIN_ID) {
      return reply.code(400).send({ error: 'CHAIN_MISMATCH' });
    }
    if (siwe.domain !== app.env.SIWE_DOMAIN) {
      return reply.code(400).send({ error: 'DOMAIN_MISMATCH' });
    }
    if (siwe.uri !== app.env.SIWE_URI) {
      return reply.code(400).send({ error: 'URI_MISMATCH' });
    }

    const nonceRow = await app.db.authNonce.findFirst({
      where: {
        userId: user.id,
        nonce: siwe.nonce,
        usedAt: null,
        expiresAt: { gt: new Date() }
      },
      orderBy: { expiresAt: 'desc' }
    });
    if (!nonceRow) return reply.code(400).send({ error: 'NONCE_INVALID_OR_EXPIRED' });

    const verified = await siwe.verify({ signature: body.signature });
    if (!verified.success) return reply.code(400).send({ error: 'SIGNATURE_INVALID' });

    await app.db.authNonce.update({ where: { id: nonceRow.id }, data: { usedAt: new Date() } });
    const session = await app.db.session.create({ data: { userId: user.id } });

    const token = await reply.jwtSign(
      { userId: user.id, address: user.address, sessionId: session.id },
      { expiresIn: '2h' }
    );

    return reply.send({ token, user: { id: user.id, address: user.address } });
  });

  app.post('/logout', { preHandler: app.requireAuth }, async (req: any, reply) => {
    await app.db.session.update({
      where: { id: req.user.sessionId },
      data: { revokedAt: new Date() }
    });
    return reply.send({ ok: true });
  });
}
