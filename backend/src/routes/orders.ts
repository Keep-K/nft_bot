import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ethers } from 'ethers';
import { getProvider, ensureTxConfirmed } from '../utils/chain.js';

const CreateOrderBody = z.object({
  vendor: z.enum(["ALI", "AMAZON", "TEMU"]),
  productUrl: z.string().url(),
  amount: z.string().min(1)
});

const SubmitPaymentBody = z.object({
  txHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/)
});

const ERC20_ABI = [
  "event Transfer(address indexed from, address indexed to, uint256 value)"
];

export async function orderRoutes(app: FastifyInstance) {
  app.post('/', { preHandler: app.requireAuth }, async (req: any, reply) => {
    const { vendor, productUrl, amount } = CreateOrderBody.parse(req.body);

    if (vendor === "AMAZON" && !app.env.ENABLE_AMAZON) return reply.code(503).send({ error: "AMAZON_UPDATING" });
    if (vendor === "TEMU" && !app.env.ENABLE_TEMU) return reply.code(503).send({ error: "TEMU_UPDATING" });
    if (vendor === "ALI" && !app.env.ENABLE_ALI) return reply.code(503).send({ error: "ALI_DISABLED" });

    if (!app.env.PAYMENT_TOKEN_ADDRESS || !app.env.MERCHANT_RECEIVER_ADDRESS) {
      return reply.code(500).send({ error: "PAYMENT_CONFIG_MISSING" });
    }

    const order = await app.db.order.create({
      data: {
        userId: req.user.userId,
        vendor,
        productUrl,
        amount,
        tokenAddress: app.env.PAYMENT_TOKEN_ADDRESS.toLowerCase(),
        receiver: app.env.MERCHANT_RECEIVER_ADDRESS.toLowerCase(),
        status: "PENDING_PAYMENT"
      }
    });

    return reply.send({ order });
  });

  app.post('/:id/submit-payment', { preHandler: app.requireAuth }, async (req: any, reply) => {
    const id = req.params.id as string;
    const { txHash } = SubmitPaymentBody.parse(req.body);

    const order = await app.db.order.findFirst({ where: { id, userId: req.user.userId } });
    if (!order) return reply.code(404).send({ error: "ORDER_NOT_FOUND" });
    if (order.status === "PAID") return reply.send({ ok: true, status: "PAID" });

    const dup = await app.db.order.findFirst({ where: { paymentTx: txHash } });
    if (dup) return reply.code(400).send({ error: "TX_ALREADY_USED" });

    const provider = getProvider(app.env.BSC_RPC_URL);
    const confirmed = await ensureTxConfirmed(provider, txHash, 1);
    if (!confirmed.ok) return reply.code(400).send({ error: confirmed.reason });

    const receipt = confirmed.receipt;

    const iface = new ethers.Interface(ERC20_ABI);
    let matched = false;

    for (const log of receipt.logs) {
      if (log.address.toLowerCase() !== order.tokenAddress.toLowerCase()) continue;
      try {
        const parsed = iface.parseLog({ topics: log.topics as string[], data: log.data });
        if (parsed?.name !== "Transfer") continue;

        const from = (parsed.args.from as string).toLowerCase();
        const to = (parsed.args.to as string).toLowerCase();
        const value = (parsed.args.value as bigint);

        if (
          from === req.user.address.toLowerCase() &&
          to === order.receiver.toLowerCase() &&
          value === BigInt(order.amount)
        ) {
          matched = true;
          break;
        }
      } catch {}
    }

    if (!matched) {
      await app.db.order.update({ where: { id }, data: { status: "FAILED" } });
      return reply.code(400).send({ error: "PAYMENT_NOT_MATCHED" });
    }

    await app.db.order.update({
      where: { id },
      data: { status: "PAID", paymentTx: txHash, paidAt: new Date() }
    });

    return reply.send({ ok: true, status: "PAID" });
  });

  app.get('/me', { preHandler: app.requireAuth }, async (req: any, reply) => {
    const orders = await app.db.order.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' }
    });
    return reply.send({ orders });
  });
}
