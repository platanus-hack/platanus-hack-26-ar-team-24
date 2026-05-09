# OpenClaw Runtime

Runtime desplegable para OpenClaw con dos responsabilidades:

- levantar el gateway de OpenClaw dentro del contenedor
- exponer una API de administración para crear agentes y workspaces

## Variables

```env
PORT=8080
ADMIN_API_TOKEN=change-me-admin-token
OPENCLAW_GATEWAY_TOKEN=change-me-gateway-token
OPENCLAW_PUBLIC_BASE_URL=http://localhost:8080
OPENCLAW_GATEWAY_PORT=18789
OPENCLAW_GATEWAY_BIND=loopback
OPENCLAW_STATE_DIR=/data/.openclaw
OPENCLAW_WORKSPACE_ROOT=/data/workspaces
OPENCLAW_DEFAULT_MODEL=openai/gpt-4o-mini
OPENAI_API_KEY=
```

## API

Todas las rutas `/admin/*` requieren:

```txt
Authorization: Bearer <ADMIN_API_TOKEN>
```

Rutas principales:

- `GET /health`
- `GET /admin/config`
- `GET /admin/agents`
- `POST /admin/agents`
- `POST /admin/workspaces`
- `POST /admin/agents/:id/message`
- `POST /admin/config/validate`

Payload ejemplo para crear un agente:

```json
{
  "id": "support-bot",
  "model": "openai/gpt-4o-mini",
  "skills": ["github", "gmail"]
}
```

## Flujo

1. El runtime genera `/data/.openclaw/openclaw.json`
2. Mantiene `/data/.openclaw/agents.json`
3. Crea workspaces en `/data/workspaces/<agent-id>`
4. Valida config con `openclaw config validate`
5. Expone OpenClaw en el mismo puerto público vía proxy HTTP/WebSocket

## Railway

Desplegalo como un servicio separado con:

- `Root Directory`: `openclaw/`
- `Dockerfile Path`: `Dockerfile`
- volumen montado en `/data`
- `PORT`: `8080`

Variables recomendadas:

```env
PORT=8080
ADMIN_API_TOKEN=<token-interno>
OPENCLAW_GATEWAY_TOKEN=<token-openclaw>
OPENCLAW_PUBLIC_BASE_URL=https://tu-servicio-openclaw.up.railway.app
OPENCLAW_GATEWAY_PORT=18789
OPENCLAW_GATEWAY_BIND=loopback
OPENCLAW_STATE_DIR=/data/.openclaw
OPENCLAW_WORKSPACE_ROOT=/data/workspaces
OPENCLAW_DEFAULT_MODEL=openai/gpt-4o-mini
OPENAI_API_KEY=<si-usan-openai>
```

`OPENCLAW_ADMIN_API_TOKEN` sigue siendo aceptado como alias de compatibilidad para `ADMIN_API_TOKEN`, pero en Railway conviene configurar `ADMIN_API_TOKEN` como nombre principal.
