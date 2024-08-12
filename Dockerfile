FROM node:20-alpine AS base

# mostly inspired from https://github.com/BretFisher/node-docker-good-defaults/blob/main/Dockerfile & https://github.com/remix-run/example-trellix/blob/main/Dockerfile

# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@9.5.0 --activate
# Set the store dir to a folder that is not in the project
RUN pnpm config set store-dir ~/.pnpm-store
RUN pnpm fetch

# 1. Install all dependencies including dev dependencies
FROM base AS deps

USER node
# WORKDIR now sets correct permissions if you set USER first so `USER node` has permissions on the `/app` directory
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY --chown=node:node package.json pnpm-lock.yaml* ./

USER root
RUN pnpm install --frozen-lockfile --prefer-offline

# 2. Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps --chown=node:node /app/node_modules ./node_modules

COPY --chown=node:node . .

# This app does not have any public environment variables, so we don't need to copy any .env files here
# Environment variables should be provided when creating the container (e.g. through CLI args or a docker-compose file)

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN pnpm build

# 3. Production image, copy all the files and run next
FROM base AS runner
USER node
WORKDIR /app

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME='0.0.0.0'
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder --chown=node:node /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

CMD ["node", "server.js"]