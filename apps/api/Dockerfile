# This Dockerfile is optimized for production builds using turbo prune and pnpm
FROM node:18-alpine AS base

# Install pnpm
RUN npm install -g pnpm@8

# Prune the workspace for the API app
FROM base AS pruner
WORKDIR /app
COPY . .
RUN npx turbo prune @gitops-ziichat-app/api --docker

# Install dependencies
FROM base AS installer
WORKDIR /app

# Copy pruned workspace
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml

# Install dependencies
RUN pnpm install --frozen-lockfile --prod=false

# Copy source code
COPY --from=pruner /app/out/full/ .

# Build the application
RUN pnpm build --filter=@gitops-ziichat-app/api

# Production image
FROM node:18-alpine AS runner
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 hono

# Copy built application
COPY --from=installer --chown=hono:nodejs /app/apps/api/dist ./
COPY --from=installer --chown=hono:nodejs /app/apps/api/package.json ./package.json

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Switch to non-root user
USER hono

# Start the application
CMD ["node", "index.js"]

