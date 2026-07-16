# syntax=docker/dockerfile:1
# Multi-stage build for the Gamblock-AI Next.js website.
# NEXT_PUBLIC_* values are inlined at build time, so public website settings
# are passed as build args. Runtime env handles non-public vars only.

# ---- Dependencies stage ----
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# ---- Build stage ----
FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Public website settings are baked into the client bundle at build time.
# A production image must never silently fall back to a browser-local backend.
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID=
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_CLIENT_ID
ENV NEXT_TELEMETRY_DISABLED=1

RUN test -n "$NEXT_PUBLIC_API_URL" \
  && case "$NEXT_PUBLIC_API_URL" in http://*|https://*) ;; *) exit 1 ;; esac \
  && npm run build

# ---- Runtime stage ----
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

# Copy the standalone server, static assets, and public folder.
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=build --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=15s \
  CMD wget -qO- --tries=1 --spider http://localhost:3000/ || exit 1

CMD ["node", "server.js"]
