# syntax=docker/dockerfile:1.24@sha256:87999aa3d42bdc6bea60565083ee17e86d1f3339802f543c0d03998580f9cb89

FROM oven/bun:1.3.14-slim@sha256:d56a2534ffd262e92c12fd3249d3924d296d97086da773f821d7d0477435ea04 AS build

WORKDIR /app

EXPOSE 8080

ENV NODE_ENV=production
ENV HUSKY=0
ENV PORT=8080
ENV TZ=Asia/Tokyo
ENV WB_DOCKER=1

ARG ARCH
ENV ARCH=$ARCH

RUN apt-get update \
  && apt-get -y --no-install-recommends install ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY dist/package.json ./package.json
COPY dist/bun.lock ./bun.lock
COPY bunfig.toml ./

RUN NODE_ENV=development bun install --frozen-lockfile

COPY next.config.ts tsconfig.json ./
COPY src ./src

RUN bun run build \
  && rm -rf node_modules \
  && bun install --production --frozen-lockfile \
  && rm -rf .next/cache

FROM oven/bun:1.3.14-slim@sha256:d56a2534ffd262e92c12fd3249d3924d296d97086da773f821d7d0477435ea04

WORKDIR /app

ENV NODE_ENV=production
ENV HUSKY=0
ENV PORT=8080
ENV TZ=Asia/Tokyo
ENV WB_DOCKER=1

RUN apt-get update \
  && apt-get -y --no-install-recommends install ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/.next ./.next
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/src ./src

CMD ["bun", "./node_modules/next/dist/bin/next", "start"]
