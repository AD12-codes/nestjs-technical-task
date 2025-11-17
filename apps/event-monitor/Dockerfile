# Build stage
FROM node:22-alpine AS builder

RUN npm install -g pnpm@9

WORKDIR /app

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/event-monitor/package.json ./apps/event-monitor/

RUN pnpm install --frozen-lockfile

COPY apps/event-monitor ./apps/event-monitor
COPY tsconfig.base.json ./

RUN pnpm --filter event-monitor run build

# Production stage
FROM node:22-alpine AS production

RUN npm install -g pnpm@9

WORKDIR /app

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/event-monitor/package.json ./apps/event-monitor/

RUN pnpm install --frozen-lockfile --prod

COPY --from=builder /app/apps/event-monitor/dist ./apps/event-monitor/dist

ENV NODE_ENV=production

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "apps/event-monitor/dist/main.js"]
