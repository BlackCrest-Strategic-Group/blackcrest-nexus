# syntax=docker/dockerfile:1

# Build the React/Vite frontend and install production Node dependencies
# for a single deployable BlackCrest container.
FROM node:22-bookworm-slim AS build

WORKDIR /app

ENV NODE_ENV=production

# Install backend dependencies first for better Docker layer caching.
COPY package*.json ./
RUN npm ci --omit=dev

# Install frontend dependencies and build static assets.
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm ci

COPY . .
RUN npm run build:frontend

# Runtime image. Keeps the final container smaller and avoids shipping
# frontend dev dependencies into enterprise deployments.
FROM node:22-bookworm-slim AS runtime

WORKDIR /app

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000

# curl is used only for the container healthcheck.
RUN apt-get update \
  && apt-get install -y --no-install-recommends curl \
  && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/server.js ./server.js
COPY --from=build /app/backend ./backend
COPY --from=build /app/server ./server
COPY --from=build /app/middleware ./middleware
COPY --from=build /app/routes ./routes
COPY --from=build /app/docs ./docs
COPY --from=build /app/dist ./dist

RUN mkdir -p /app/uploads \
  && chown -R node:node /app

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD curl -fsS http://127.0.0.1:${PORT}/api/health || exit 1

CMD ["node", "server.js"]
