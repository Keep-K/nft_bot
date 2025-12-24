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
  origin: (origin, cb) => {
    // CORS_ORIGIN을 쉼표로 구분하여 여러 origin 허용
    const allowedOrigins = (app.env.CORS_ORIGIN || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    
    // 개발 환경에서는 모든 origin 허용
    if (app.env.NODE_ENV === 'development') {
      return cb(null, true);
    }
    
    // origin이 없으면 (같은 도메인 요청) 허용
    if (!origin) {
      return cb(null, true);
    }
    
    // 허용 목록에 있으면 해당 origin 반환 (하나만)
    if (allowedOrigins.includes(origin)) {
      return cb(null, origin);
    }
    
    return cb(new Error('Not allowed by CORS'), false);
  },
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
