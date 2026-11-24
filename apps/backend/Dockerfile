# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Instalar OpenSSL necesario para Prisma en Alpine
RUN apk add --no-cache openssl

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

COPY . .

RUN npx prisma generate
RUN npm run build

# Stage 2: Production runner (Cloud Run compatible)
FROM node:22-alpine AS runner

WORKDIR /app

RUN apk add --no-cache openssl

ENV NODE_ENV=production
ENV PORT=8080

# Usuario sin privilegios
USER node

# Copiar dependencias y artefactos compilados
COPY --chown=node:node --from=builder /app/package*.json ./
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/prisma ./prisma
COPY --chown=node:node --from=builder /app/dist ./dist

EXPOSE 8080

# Healthcheck para Docker local y orquestadores
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT}/health || exit 1

CMD ["node", "dist/main"]
