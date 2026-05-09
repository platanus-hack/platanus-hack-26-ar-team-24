FROM node:24-bookworm-slim

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends dumb-init \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json* ./
RUN npm install -g openclaw@latest \
  && npm install

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

ENV NODE_ENV=production
ENV PORT=8080
ENV OPENCLAW_PUBLIC_BASE_URL=http://localhost:8080
ENV OPENCLAW_GATEWAY_PORT=18789
ENV OPENCLAW_GATEWAY_BIND=loopback
ENV OPENCLAW_STATE_DIR=/data/.openclaw
ENV OPENCLAW_WORKSPACE_ROOT=/data/workspaces

EXPOSE 8080

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]
