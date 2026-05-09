# Frontend Integration Guide

Esta guía documenta el backend de `back/`, que actúa como puente entre el frontend y OpenClaw.

## Base URL

En local, este servicio corre por defecto en:

```txt
http://localhost:4000
```

## Idea General

El flujo principal es:

1. El frontend crea un agente representando a un usuario con `POST /agents`.
2. El backend crea el agente en OpenClaw, lo perfila y devuelve un `agent.id`.
3. El frontend guarda ese `agentId` para reutilizarlo en futuras acciones.
4. Luego el frontend puede:
   - listar agentes,
   - inspeccionar los archivos del agente,
   - correr una conversación entre dos agentes,
   - ejecutar matchmaking de un agente contra otros.

## Persistencia en Frontend

Este backend no maneja cookies ni sesiones por sí mismo.

Si quieren recordar qué agente pertenece al usuario actual, el frontend debería guardar el `agent.id` en alguno de estos lugares:

- cookie
- `localStorage`
- estado persistido de la app

Recomendación simple:

- guardar `agentId` en cookie o `localStorage` después de `POST /agents`
- reenviar ese `agentId` cuando el usuario quiera volver a ejecutar su agente

Ejemplo de clave:

```txt
activeAgentId
```

## Formato de Errores

Si algo falla, el servicio responde con:

```json
{
  "error": "Unexpected error"
}
```

En varios casos el mensaje real también puede venir detallado dentro de `error`.

## Endpoints

### `GET /health`

Sirve para validar que el backend está vivo.

#### Response

```json
{
  "ok": true,
  "runtimeUrl": "http://localhost:8080"
}
```

---

### `GET /agents`

Lista los agentes existentes en OpenClaw.

#### Response

```json
{
  "agents": [
    { "id": "sofia-8f2ab3c1" },
    { "id": "mati-21ab77de" }
  ]
}
```

#### Uso típico en frontend

- poblar selector de agentes
- mostrar agentes disponibles para conversar o hacer matching

---

### `GET /agents/:id/files`

Devuelve los archivos internos que usa OpenClaw para definir la personalidad del agente.

#### Params

- `id`: `agentId`

#### Response

```json
{
  "agentId": "sofia-8f2ab3c1",
  "workspace": "/workspace/path",
  "files": {
    "IDENTITY.md": "# Identity\n...",
    "SOUL.md": "# sofia-8f2ab3c1 Persona\n...",
    "USER.md": "# User Profile\n...",
    "AGENTS.md": "# sofia-8f2ab3c1\n..."
  }
}
```

#### Uso típico en frontend

- debug
- pantalla de perfil del agente
- explicar cómo fue perfilado

---

### `POST /agents`

Crea un nuevo agente perfilado a partir de la información del usuario.

#### Request body

```json
{
  "user": {
    "name": "Sofia",
    "age": 28,
    "location": "Buenos Aires",
    "bio": "Product engineer enfocada en AI aplicada a recruiting.",
    "personal": {
      "values": ["honestidad", "autonomia"],
      "goals": ["construir productos utiles"]
    },
    "social": {
      "communicationStyle": "directa pero calida",
      "interests": ["startups", "cine", "running"]
    },
    "professional": {
      "role": "Founding engineer",
      "skills": ["TypeScript", "Node.js", "LLMs"]
    },
    "extra": {
      "availability": "full-time"
    }
  }
}
```

#### Campos

- `user.name`: obligatorio
- `user.age`: opcional, string o number
- `user.location`: opcional
- `user.bio`: opcional
- `user.personal`: opcional, objeto libre
- `user.social`: opcional, objeto libre
- `user.professional`: opcional, objeto libre
- `user.extra`: opcional, objeto libre

#### Response exitosa

```json
{
  "agent": {
    "id": "sofia-a13c5b72"
  },
  "grading": {
    "overallScore": 0.84,
    "personalScore": 0.82,
    "socialScore": 0.79,
    "professionalScore": 0.91,
    "summary": "Perfil con foco en producto y ejecucion.",
    "personalitySummary": "Es directa, curiosa y valora autonomia con impacto.",
    "strengths": ["ownership", "claridad", "aprendizaje rapido"],
    "risks": ["impaciencia con burocracia"],
    "interests": ["startups", "ai", "producto"],
    "conversationStyle": "casual, directa y concreta",
    "values": ["honestidad", "impacto", "autonomia"]
  }
}
```

#### Qué hace internamente

1. Genera un `agentId` basado en el nombre del usuario.
2. Crea ese agente en OpenClaw.
3. Usa el agente `grader` para perfilar al usuario.
4. Escribe archivos como `IDENTITY.md`, `SOUL.md`, `USER.md` y `AGENTS.md`.
5. Devuelve el `agent.id` listo para usar.

#### Qué debe hacer el frontend después

Guardar `response.agent.id`.

Ejemplo:

```ts
const agentId = response.agent.id;
localStorage.setItem("activeAgentId", agentId);
```

#### Nota importante

Si el body no matchea el schema esperado, hoy el backend devuelve la lista de agentes existentes con status `201` en vez de un error de validación. El frontend debería enviar siempre el body correcto y no asumir que toda respuesta `201` implica creación real de un agente.

---

### `POST /conversations/run`

Corre una conversación entre dos agentes y pide a un agente juez que evalúe si hay compatibilidad.

#### Request body

```json
{
  "agentA": "sofia-a13c5b72",
  "agentB": "mati-21ab77de",
  "openingMessage": "Quiero que conversen para ver si tendria sentido que trabajen juntos en una startup de recruiting con AI.",
  "turnsPerAgent": 2,
  "maxRounds": 3,
  "thinking": "minimal"
}
```

#### Campos

- `agentA`: obligatorio
- `agentB`: obligatorio y debe ser distinto de `agentA`
- `openingMessage`: obligatorio
- `turnsPerAgent`: opcional, entero entre `1` y `5`
- `maxRounds`: opcional, entero entre `1` y `10`
- `thinking`: opcional, uno de `off | minimal | low | medium | high`

#### Response

```json
{
  "conversationId": "de305d54-75b4-431b-adb2-eb6b9e546014",
  "agentA": "sofia-a13c5b72",
  "agentB": "mati-21ab77de",
  "turnsPerAgent": 2,
  "maxRounds": 3,
  "judgeAgentId": "judge",
  "compatibility": {
    "done": true,
    "score": 0.78,
    "outcome": "match",
    "summary": "Hay alineacion fuerte en estilo de trabajo e intereses.",
    "sharedInterests": ["startups", "ai", "producto"],
    "reasons": ["ambos valoran velocidad", "interes mutuo genuino"]
  },
  "transcript": [
    {
      "speaker": "sofia-a13c5b72",
      "text": "Me interesa construir producto con impacto real.",
      "round": 1,
      "turn": 1
    },
    {
      "speaker": "mati-21ab77de",
      "text": "Yo priorizo equipos chicos y mucha autonomia.",
      "round": 1,
      "turn": 2
    }
  ]
}
```

#### Uso típico en frontend

- pantalla de compatibilidad entre dos usuarios
- simulación de charla entre candidato y founder
- mostrar score, razones y transcript

---

### `POST /agents/:id/matchmake`

Ejecuta matchmaking del agente indicado contra otros agentes existentes en OpenClaw.

#### Params

- `id`: `agentId` del agente base

#### Request body

```json
{
  "purpose": "Encontrar founders compatibles para construir una startup de AI recruiting.",
  "turnsPerAgent": 2,
  "maxRounds": 3,
  "thinking": "minimal",
  "limit": 10,
  "minScore": 0.65
}
```

#### Campos

- `purpose`: obligatorio
- `turnsPerAgent`: opcional, `1` a `5`
- `maxRounds`: opcional, `1` a `10`
- `thinking`: opcional
- `limit`: opcional, máximo `50`
- `minScore`: opcional, número entre `0` y `1`

#### Response

```json
{
  "agentId": "sofia-a13c5b72",
  "purpose": "Encontrar founders compatibles para construir una startup de AI recruiting.",
  "evaluatedCandidates": 8,
  "returnedMatches": 3,
  "matches": [
    {
      "candidateId": "mati-21ab77de",
      "conversationId": "7f1b9d90-5d0b-4c45-84a4-0eb8de99d111",
      "compatibility": {
        "done": true,
        "score": 0.81,
        "outcome": "match",
        "summary": "Buena alineacion en ritmo y objetivos.",
        "sharedInterests": ["AI", "startups"],
        "reasons": ["complemento de skills", "expectativas similares"]
      },
      "transcript": []
    }
  ],
  "failures": []
}
```

#### Cómo elige candidatos

El backend:

- lista todos los agentes disponibles
- excluye `main`, `grader`, `judge` y el agente origen
- evalúa compatibilidad uno por uno
- devuelve solo los que superan `minScore`
- ordena resultados de mayor a menor score

#### Uso típico en frontend

- pantalla de discover
- ranking de matches
- recomendación automática de conexiones

## Flujos Recomendados para Frontend

### Flujo 1: alta de usuario y creación de agente

1. El usuario completa onboarding.
2. El frontend llama `POST /agents`.
3. El frontend guarda `response.agent.id`.
4. El frontend redirige a dashboard usando ese `agentId` persistido.

### Flujo 2: ejecutar el agente actual contra otro agente

1. Leer `activeAgentId` desde cookie o `localStorage`.
2. Elegir otro agente desde `GET /agents`.
3. Llamar `POST /conversations/run` con `agentA = activeAgentId` y `agentB = otherAgentId`.
4. Mostrar `compatibility` y `transcript`.

### Flujo 3: matchmaking automático

1. Leer `activeAgentId`.
2. Llamar `POST /agents/:id/matchmake`.
3. Renderizar la lista `matches`.

## Ejemplos de Fetch

### Crear agente

```ts
const response = await fetch("http://localhost:4000/agents", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    user: {
      name: "Sofia",
      location: "Buenos Aires",
      bio: "Me gusta construir productos con AI.",
      professional: {
        role: "Engineer",
        skills: ["TypeScript", "Node.js"]
      }
    }
  })
});

const data = await response.json();
const agentId = data.agent.id;
localStorage.setItem("activeAgentId", agentId);
```

### Correr conversación

```ts
const agentA = localStorage.getItem("activeAgentId");

const response = await fetch("http://localhost:4000/conversations/run", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    agentA,
    agentB: "mati-21ab77de",
    openingMessage: "Hablen para evaluar si deberian trabajar juntos.",
    turnsPerAgent: 2,
    maxRounds: 3,
    thinking: "minimal"
  })
});

const result = await response.json();
```

### Matchmaking

```ts
const agentId = localStorage.getItem("activeAgentId");

const response = await fetch(`http://localhost:4000/agents/${agentId}/matchmake`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    purpose: "Encontrar cofounders o hires compatibles para una startup de AI.",
    minScore: 0.65,
    limit: 10
  })
});

const result = await response.json();
```

## Observaciones Importantes

- No hay autenticación en este backend.
- No hay cookies manejadas por servidor.
- El identificador clave para reutilizar un agente es `agent.id`.
- El endpoint `POST /agents` ignora un `id` enviado por el cliente y genera uno nuevo desde `user.name`.
- `POST /conversations/run` asegura que `agentA` y `agentB` existan antes de conversar.
- `POST /agents/:id/matchmake` puede tardar más que los otros endpoints porque evalúa varios agentes.

## Recomendación de UI

Como mínimo el frontend debería persistir:

```ts
type SessionState = {
  activeAgentId: string;
  activeAgentName?: string;
};
```

Con eso ya pueden:

- reconstruir el agente actual al recargar la app
- relanzar conversaciones
- pedir matchmaking sin recrear el agente
