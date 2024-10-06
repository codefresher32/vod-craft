ARG NODE_VERSION=20.10.0
ARG PLATFORM=linux/amd64

# Base image
FROM --platform=${PLATFORM} node:${NODE_VERSION}-alpine AS base

RUN apk update && apk add --no-cache libc6-compat ffmpeg

RUN npm install turbo typescript --global

# Prune pull-push service
FROM base AS pruner

WORKDIR /app

COPY . .

RUN turbo prune --scope=@vod-craft/pull-push-service --docker

# Build the project
FROM base AS builder

WORKDIR /app

# Copy package.json's of isolated subworkspace
COPY --from=pruner /app/out/json/ .

# First install the dependencies (as they change less often)
RUN npm ci --omit=dev

# Copy source code of isolated subworkspace
COPY --from=pruner /app/out/full/ .

COPY --from=pruner /app/tsconfig.base.json .

RUN turbo build --filter=@vod-craft/pull-push-service

# Final image
FROM base AS runner

USER node

WORKDIR /app

# Copy built code
COPY --from=builder /app .

CMD ["node", "services/pull-push/dist/PullPushLiveStream.js"]
