# syntax=docker/dockerfile:1

##### Stage 0: base — só prepara o pnpm via Corepack
FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

##### Stage 1: deps — instala TODAS as deps (precisa de dev pra compilar TS)
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

##### Stage 2: builder — compila o TypeScript
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

##### Stage 3: prod-deps — instala SÓ as deps de produção (imagem final enxuta)
FROM base AS prod-deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

##### Stage 4: runner — imagem final, sem build tools, sem devDependencies
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package.json .

USER node
EXPOSE 3000
CMD ["node", "dist/main.js"]