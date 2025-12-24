import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';

import { registerEnv } from './plugins/env.js';
import { registerDb } from './plugins/db.js';
import { registerAuth } from './plugins/auth.js';

import { authRoutes } from './routes/auth.js';
import { profileRoutes } from './routes/profile.js';
import { shopRoutes } from './routes/shop.js';
import { orderRoutes } from './routes/orders.js';

const app = Fastify({ logger: true });

await registerEnv(app);
await app.register(cors, {
  origin: app.env.CORS_ORIGIN,
  credentials: true
});

await app.register(jwt, { secret: app.env.JWT_SECRET });
await registerDb(app);
await registerAuth(app);

app.get('/health', async () => ({ ok: true }));

app.register(authRoutes, { prefix: '/auth' });
app.register(profileRoutes, { prefix: '/profile' });
app.register(shopRoutes, { prefix: '/shop' });
app.register(orderRoutes, { prefix: '/orders' });

const port = Number(app.env.PORT || 8080);
await app.listen({ port, host: '0.0.0.0' });
