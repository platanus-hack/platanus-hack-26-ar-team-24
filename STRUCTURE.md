# 🧠 Estructura del Proyecto — Platanus Hack 26

## Árbol completo

```
platanus-hack-26-ar-team-24/
│
├── apps/
│   └── web/                          ← 🎨 FRONTEND (Marcos + Lauti)
│       ├── public/
│       │   ├── icons/                ← Íconos PWA, favicon
│       │   └── images/               ← Assets estáticos
│       ├── src/
│       │   ├── app/
│       │   │   ├── (auth)/           ← Login, registro
│       │   │   ├── (dashboard)/      ← Home principal
│       │   │   ├── (onboarding)/     ← Onboarding del usuario (preguntas personalidad)
│       │   │   ├── agent/            ← Vista del agente IA personal
│       │   │   ├── matches/          ← Resultados de compatibilidad
│       │   │   ├── chat/             ← Chat entre usuarios matcheados
│       │   │   └── profile/          ← Perfil del usuario
│       │   ├── components/
│       │   │   ├── ui/               ← Botones, inputs, modals, cards genéricos
│       │   │   ├── layout/           ← Navbar, sidebar, footer
│       │   │   ├── agent/            ← Componentes del agente IA
│       │   │   ├── matches/          ← Cards de match, lista de compatibilidad
│       │   │   └── chat/             ← Burbujas de chat, input de mensaje
│       │   ├── hooks/                ← useAuth, useAgent, useMatches, etc.
│       │   ├── lib/                  ← Supabase client, fetchers, helpers
│       │   ├── styles/               ← Globals CSS, theme Tailwind
│       │   └── types/                ← Tipos locales del frontend
│       ├── next.config.js
│       ├── tailwind.config.js
│       └── package.json
│
├── services/
│   └── ai-engine/                    ← 🤖 IA (Román)
│       ├── src/
│       │   ├── agents/               ← Lógica de agentes IA (personalidad, emociones)
│       │   ├── compatibility/        ← Algoritmo de compatibilidad entre agentes
│       │   ├── embeddings/           ← Generación de embeddings (pgvector)
│       │   ├── prompts/              ← Templates de prompts para OpenAI
│       │   └── routes/               ← Endpoints de la API del servicio IA
│       ├── Dockerfile
│       └── package.json
│
├── supabase/                         ← 🔧 BACKEND (Luca + Ale)
│   ├── migrations/                   ← SQL: tablas, pgvector, RLS
│   ├── seed/                         ← Datos de prueba
│   └── functions/
│       ├── auth-hook/                ← Edge Function: post-registro
│       ├── on-match/                 ← Edge Function: notificar match
│       └── sync-profile/            ← Edge Function: sync perfil → embedding
│
├── packages/
│   └── shared/                       ← 📦 COMPARTIDO (todos)
│       ├── types/                    ← Interfaces: User, Agent, Match, Message
│       ├── utils/                    ← Helpers compartidos
│       └── constants/               ← Enums, config keys, rutas API
│
├── docs/                             ← 📄 Docs rápidos del equipo
├── .env.example
├── README.md
└── package.json                      ← Root workspace (npm/pnpm workspaces)
```

---

## 👥 División por equipo

| Módulo | Carpeta | Equipo | Responsables |
|--------|---------|--------|-------------|
| **Frontend** | `apps/web/` | Frontend | **Marcos** + **Lauti** |
| **Backend** | `supabase/` | Backend | **Luca** + **Ale** |
| **IA Engine** | `services/ai-engine/` | IA | **Román** |
| **Shared Types** | `packages/shared/` | Todos | Todos (coordinar) |

---

## 🔀 División interna sugerida

### Frontend — Marcos + Lauti
| Quién | Páginas | Componentes |
|-------|---------|-------------|
| **Marcos** | `(auth)`, `profile`, `(onboarding)` | `ui/`, `layout/` |
| **Lauti** | `agent`, `matches`, `chat`, `(dashboard)` | `agent/`, `matches/`, `chat/` |

### Backend — Luca + Ale
| Quién | Responsabilidad |
|-------|----------------|
| **Luca** | `migrations/` (schema SQL, pgvector, RLS policies) |
| **Ale** | `functions/` (Edge Functions: auth-hook, on-match, sync-profile) + `seed/` |

### IA — Román
| Módulo | Qué hace |
|--------|----------|
| `agents/` | Crear agente IA a partir del perfil del usuario |
| `compatibility/` | Conversación entre agentes, score de compatibilidad |
| `embeddings/` | Generar y guardar embeddings en pgvector |
| `prompts/` | Templates de OpenAI para cada tarea |
| `routes/` | API REST del servicio (deploy en Railway) |

---

## 🔗 Contratos entre módulos

```
Frontend ←→ Supabase (auth, DB, realtime)
Frontend ←→ AI Engine (POST /analyze, POST /match)
AI Engine ←→ Supabase (lee perfiles, escribe embeddings y matches)
Shared types ←→ Todos importan de acá
```

---

## 🚀 Cómo empezar

```bash
# 1. Frontend (Marcos/Lauti)
cd apps/web && npx create-next-app@latest . --ts --tailwind --app --src-dir

# 2. Backend (Luca/Ale)  
cd supabase && npx supabase init

# 3. IA (Román)
cd services/ai-engine && npm init -y && npm i express openai dotenv
```

---

## Regla de oro 🏆

> **Cada persona trabaja SOLO dentro de su carpeta.**  
> La única carpeta compartida es `packages/shared/`.  
> Si necesitás algo del otro módulo, definilo como tipo en `shared/types/` y coordiná.
