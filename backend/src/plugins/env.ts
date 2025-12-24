import { FastifyInstance } from 'fastify';
import { z } from 'zod';

const EnvSchema = z.object({
  PORT: z.string().default('8080'),
  NODE_ENV: z.string().default('development'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  JWT_SECRET: z.string().min(20),

  DATABASE_URL: z.string(),

  CHAIN_ID: z.string().default('97'),
  BSC_RPC_URL: z.string(),

  PERSONALINFO_NFT_ADDRESS: z.string().optional().default(''),
  PAYMENT_TOKEN_ADDRESS: z.string().optional().default(''),
  MERCHANT_RECEIVER_ADDRESS: z.string().optional().default(''),

  MINTER_PRIVATE_KEY: z.string().optional().default(''),

  PII_MASTER_KEY_BASE64: z.string().min(10),

  ENABLE_ALI: z.string().default('true'),
  ENABLE_AMAZON: z.string().default('false'),
  ENABLE_TEMU: z.string().default('false'),

  SIWE_DOMAIN: z.string().default('localhost'),
  SIWE_URI: z.string().default('http://localhost:3000')
});

export async function registerEnv(app: FastifyInstance) {
  const env = EnvSchema.parse(process.env);

  app.decorate('env', {
    ...env,
    CHAIN_ID: Number(env.CHAIN_ID),
    ENABLE_ALI: env.ENABLE_ALI === 'true',
    ENABLE_AMAZON: env.ENABLE_AMAZON === 'true',
    ENABLE_TEMU: env.ENABLE_TEMU === 'true'
  });
}

declare module 'fastify' {
  interface FastifyInstance {
    env: {
      PORT: string;
      NODE_ENV: string;
      CORS_ORIGIN: string;
      JWT_SECRET: string;

      DATABASE_URL: string;

      CHAIN_ID: number;
      BSC_RPC_URL: string;

      PERSONALINFO_NFT_ADDRESS: string;
      PAYMENT_TOKEN_ADDRESS: string;
      MERCHANT_RECEIVER_ADDRESS: string;

      MINTER_PRIVATE_KEY: string;

      PII_MASTER_KEY_BASE64: string;

      ENABLE_ALI: boolean;
      ENABLE_AMAZON: boolean;
      ENABLE_TEMU: boolean;

      SIWE_DOMAIN: string;
      SIWE_URI: string;
    };
  }
}
