import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { encryptJson } from '../utils/crypto.js';
import { ethers } from 'ethers';
import { getProvider, getWallet } from '../utils/chain.js';
import { createHash } from 'node:crypto';

const UpsertBody = z.object({
  data: z.record(z.any())
});

const PersonalInfoNftAbi = [
  "function mint(address to, bytes32 dataHash) returns (uint256)"
];

export async function profileRoutes(app: FastifyInstance) {
  app.post('/', { preHandler: app.requireAuth }, async (req: any, reply) => {
    const { data } = UpsertBody.parse(req.body);

    const encrypted = encryptJson(app.env.PII_MASTER_KEY_BASE64, data);

    const dataHashHex = createHash('sha256').update(encrypted).digest('hex');
    const dataHashBytes32 = ("0x" + dataHashHex) as `0x${string}`;

    const row = await app.db.personalInfo.upsert({
      where: { userId: req.user.userId },
      update: { encryptedJson: encrypted, dataHash: dataHashBytes32, status: "PENDING" },
      create: { userId: req.user.userId, encryptedJson: encrypted, dataHash: dataHashBytes32, status: "PENDING" }
    });

    if (!app.env.MINTER_PRIVATE_KEY || !app.env.PERSONALINFO_NFT_ADDRESS) {
      return reply.send({
        ok: true,
        profile: row,
        mint: { skipped: true, reason: "MINTER_OR_CONTRACT_NOT_SET" }
      });
    }

    const provider = getProvider(app.env.BSC_RPC_URL);
    const wallet = getWallet(app.env.MINTER_PRIVATE_KEY, app.env.BSC_RPC_URL);
    const contract = new ethers.Contract(app.env.PERSONALINFO_NFT_ADDRESS, PersonalInfoNftAbi, wallet);

    try {
      const tx = await contract.mint(req.user.address, dataHashBytes32);
      await provider.waitForTransaction(tx.hash, 1);

      await app.db.personalInfo.update({
        where: { id: row.id },
        data: { status: "MINTED", nftTxHash: tx.hash, nftTokenId: null }
      });

      return reply.send({ ok: true, txHash: tx.hash, status: "MINTED" });
    } catch (e: any) {
      req.log.error(e);
      return reply.code(500).send({ ok: false, error: "MINT_FAILED" });
    }
  });

  app.get('/status', { preHandler: app.requireAuth }, async (req: any, reply) => {
    const row = await app.db.personalInfo.findUnique({ where: { userId: req.user.userId } });
    return reply.send({ profile: row });
  });
}
