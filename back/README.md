# Back

Backend mínimo para consumir el runtime remoto de OpenClaw.

## Variables

```env
PORT=4000
OPENCLAW_RUNTIME_URL=http://localhost:8080
OPENCLAW_ADMIN_API_TOKEN=change-me-admin-token
```

## Endpoints

- `GET /health`
- `GET /agents`
- `POST /agents`
- `POST /workspaces`
- `POST /agents/:id/message`
- `POST /conversations/run`
