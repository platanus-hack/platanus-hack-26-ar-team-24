# OpenClaw Runtime Deployment

## Objetivo

Desplegar un servicio propio de OpenClaw que:

- persista `openclaw.json` y workspaces
- permita agregar agentes por API
- exponga la UI y el gateway de OpenClaw en el mismo dominio

## Servicios

### `openclaw-runtime`

- raíz del servicio: `openclaw/`
- build: `Dockerfile`
- puerto público: `8080`
- volumen: montar en `/data`

Variables mínimas:

```env
PORT=8080
ADMIN_API_TOKEN=<token-interno>
OPENCLAW_GATEWAY_TOKEN=<token-openclaw>
OPENCLAW_PUBLIC_BASE_URL=https://tu-servicio.up.railway.app
OPENCLAW_GATEWAY_PORT=18789
OPENCLAW_GATEWAY_BIND=loopback
OPENCLAW_STATE_DIR=/data/.openclaw
OPENCLAW_WORKSPACE_ROOT=/data/workspaces
OPENCLAW_DEFAULT_MODEL=openai/gpt-4o-mini
OPENAI_API_KEY=<si-usan-openai>
```

### `back`

- raíz del servicio: `back/`
- puerto público: `4000`
- si es solo backend interno para el frontend, no necesita volumen

Variables mínimas:

```env
PORT=4000
OPENCLAW_RUNTIME_URL=https://tu-servicio-openclaw.up.railway.app
OPENCLAW_ADMIN_API_TOKEN=<mismo-token-interno>
```

## Flujo de operación

1. El backend recibe una solicitud para crear un agente.
2. El backend llama `POST /admin/agents` en `openclaw-runtime`.
3. `openclaw-runtime` crea el workspace en `/data/workspaces/<agent-id>`.
4. Actualiza `/data/.openclaw/agents.json`.
5. Valida la config con `openclaw config validate`.
6. OpenClaw sigue corriendo con la config persistida en el volumen.

## Endpoints útiles

### Runtime

- `GET /health`
- `GET /admin/config`
- `GET /admin/agents`
- `POST /admin/agents`
- `POST /admin/workspaces`
- `POST /admin/agents/:id/message`
- `POST /admin/config/validate`

### Backend

- `GET /health`
- `GET /agents`
- `POST /agents`
- `POST /agents/:id/message`
- `POST /conversations/run`

## curl de prueba

```bash
curl -X POST http://localhost:8080/admin/agents \
  -H "Authorization: Bearer change-me-admin-token" \
  -H "Content-Type: application/json" \
  -d '{"id":"support-bot","skills":["github"]}'
```
