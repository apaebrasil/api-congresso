# syntax=docker/dockerfile:1

##### Stage 0: base
FROM node:22-alpine AS base
WORKDIR /app

##### Stage 1: deps — instala TODAS as deps (precisa de dev pra compilar TS)
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

##### Stage 2: builder — compila o TypeScript
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

##### Stage 3: prod-deps — instala SÓ as deps de produção
FROM base AS prod-deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

##### Stage 4: runner — imagem final
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package.json .

USER node
EXPOSE 3000
CMD ["node", "dist/index.js"]