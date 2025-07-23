# Base image
FROM node:18-alpine AS base
RUN npm install -g pnpm@8

# 1. Prune workspace for target
FROM base AS pruner
WORKDIR /app
COPY . .
RUN npx turbo prune @gitops-ziichat-app/api --docker

# 2. Install dependencies for pruned workspace
FROM base AS installer
WORKDIR /app

COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml

RUN pnpm install --frozen-lockfile

# Copy full source into final workspace
COPY --from=pruner /app/out/full/ .

# 💡 Log to verify package exists
RUN ls -la apps/api && cat apps/api/package.json

# 3. Build the API
RUN pnpm build --filter=@gitops-ziichat-app/api

# 4. Final production image
FROM node:18-alpine AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 hono

COPY --from=installer --chown=hono:nodejs /app/apps/api/dist ./
COPY --from=installer --chown=hono:nodejs /app/apps/api/package.json ./

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

USER hono
CMD ["node", "index.js"]
