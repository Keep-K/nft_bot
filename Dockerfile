FROM node:20-alpine

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl openssl-dev

WORKDIR /app

# Copy package files from backend directory
COPY backend/package.json backend/package-lock.json* ./
RUN npm ci || npm i

# Copy prisma schema and generate client
COPY backend/prisma ./prisma
RUN npx prisma generate

# Copy TypeScript config and source code
COPY backend/tsconfig.json ./
COPY backend/src ./src

# Build the application
RUN npm run build

ENV NODE_ENV=production
EXPOSE 8080
CMD ["node", "dist/server.js"]

