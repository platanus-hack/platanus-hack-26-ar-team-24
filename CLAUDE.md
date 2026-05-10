# CLAUDE.md - Instrucciones para sesiones futuras

## Contexto del Proyecto

**Nombre:** knowAhuman
**Descripción:** Plataforma AI-mediated para conectar talentos (job seekers) con startups founders
**Track:** 🛸 Future
**Estado:** Backend MVP completamente funcional ✅ | Frontend en desarrollo 🔨

## Arquitectura

```
platanus-hack-26-ar-team-24/
├── services/api/                      # Express + TypeScript Backend ✅ STABLE
│   ├── src/
│   │   ├── controllers/              # Route handlers
│   │   ├── services/                 # Business logic
│   │   ├── routes/                   # API endpoints
│   │   ├── middlewares/              # Auth, validation, error handling
│   │   ├── config/                   # Supabase, environment
│   │   ├── types/                    # TypeScript interfaces
│   │   └── utils/                    # JWT, bcrypt, validators
│   ├── database.sql                  # Supabase schema (already executed)
│   ├── FRONTEND_API_GUIDE.md        # ⭐ Frontend API documentation
│   └── package.json
└── apps/web/                         # Next.js Frontend 🔨 IN PROGRESS
```

## Estado Actual

### ✅ COMPLETADO (Backend)

- Express.js + TypeScript REST API
- JWT Authentication (7-day tokens)
- Supabase PostgreSQL database
- 8 tables with RLS policies
- Candidate profiles (talent users)
- Startup profiles (founder users)
- Matching algorithm (skill + experience + tech overlap)
- All MVP endpoints operational
- Comprehensive API documentation (FRONTEND_API_GUIDE.md)

### 🔨 EN DESARROLLO (Frontend)

- React/Next.js UI
- User authentication flows
- Profile creation forms
- Matching results display
- Agent/AI visualizations

## Cómo Continuar

### Para el Equipo Frontend

1. **Leer primero:**
   - `/services/api/FRONTEND_API_GUIDE.md` ← ⭐ COMIENZA AQUÍ
   - Este archivo (CLAUDE.md)

2. **Entender el flujo MVP:**
   ```
   1. Register talent user → /auth/register
   2. Create candidate profile → /POST /profile/candidate
   3. Register founder user → /auth/register
   4. Create startup profile → /POST /profile/startup
   5. Run matching → /POST /match/run
   6. View results → /GET /match/results
   ```

3. **Backend está corriendo en:**
   ```
   http://localhost:3000
   ```

4. **Base URL para requests:**
   ```
   const API_URL = 'http://localhost:3000'
   ```

5. **Headers para requests protegidos:**
   ```javascript
   {
     'Authorization': `Bearer ${token}`,
     'Content-Type': 'application/json'
   }
   ```

### Cambios No Permitidos

⛔ **NO HAGAS:**
- Refactorizar el backend grandes cambios (está estable)
- Cambiar nombres de rutas
- Cambiar estructura de requests/responses
- Agregar features nuevas al backend sin coordinación

✅ **SÍ PUEDES:**
- Implementar frontend
- Agregar features en el frontend
- Hacer bug fixes en backend si es necesario
- Mejorar documentación

## Servicios Externos

### Supabase
- **URL:** https://zzwfvorthznbkpgsidrq.supabase.co
- **Status:** ✅ Conectado y funcionando
- **Credenciales:** En `/services/api/.env` (NO TRACKEAR)
- **Schema:** Ya ejecutado (ver `database.sql`)

### Database
- **Tipo:** PostgreSQL (Supabase)
- **Tablas:** users, candidate_profiles, startup_profiles, opportunities, matches, ai_agents, github_profiles, linkedin_profiles
- **RLS:** Configurado (Row-Level Security policies)

## Stack Técnico

### Backend ✅
- **Framework:** Express.js
- **Language:** TypeScript
- **Auth:** JWT (jsonwebtoken)
- **DB:** Supabase PostgreSQL
- **Validation:** Zod
- **Hashing:** bcrypt
- **Security:** Helmet, CORS

### Frontend 🔨
- **Framework:** Next.js/React
- **Language:** TypeScript
- **Styling:** TBD
- **HTTP Client:** TBD (fetch/axios)
- **State Management:** TBD

## Endpoints Principales

### Auth (Sin protección)
```
POST /auth/register
POST /auth/login
```

### Profiles (Protegidos)
```
POST /profile/candidate
GET /profile/candidate
PUT /profile/candidate

POST /profile/startup
GET /profile/startup
PUT /profile/startup
```

### Matching (Protegidos)
```
POST /match/run
GET /match/results
PUT /match/status
```

**⭐ VER FORMATO COMPLETO EN:** `services/api/FRONTEND_API_GUIDE.md`

## Instrucciones para Desplegar Backend Localmente

```bash
cd services/api

# Install dependencies
npm install

# Set up .env (copiar .env.example y agregar credenciales)
cp .env.example .env
# Editar .env con credenciales de Supabase

# Run development server
npm run dev

# Server runs on http://localhost:3000
```

## Variables de Entorno Necesarias

```
# Backend (.env en services/api/)
PORT=3000
NODE_ENV=development
JWT_SECRET=<your-secret>
JWT_EXPIRES_IN=7d
SUPABASE_URL=https://zzwfvorthznbkpgsidrq.supabase.co
SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_KEY=<service-key>
CORS_ORIGIN=http://localhost:3001
```

## Validaciones Importantes

### Candidate Profile
- `bio`: Min 10 chars
- `skills`: Array of strings
- `experience_years`: Integer
- `technologies`: Array of strings

### Startup Profile
- `name`: String required
- `description`: Min 20 chars ⚠️
- `stack`: Array, min 1 element
- `culture_values`: Array optional

### Auth
- `email`: Valid email, unique
- `password`: Min 8 chars
- `username`: String required
- `user_type`: "talent" | "founder"

## Algoritmo de Matching

```javascript
match_score = 
  skillMatch (60%) +        // Common skills between candidate and startup
  experienceMatch (20%) +   // Years of experience (0-1 scale)
  techMatch (20%)           // Tech stack overlap

Result: 0.00 to 1.00 (0% to 100%)
```

## Flujos de Usuario

### Talent User
1. Register con `user_type: "talent"`
2. Create candidate profile (bio, skills, experience, tech, github, linkedin)
3. View matches cuando founder ejecuta matching
4. Accept/reject matches

### Founder User
1. Register con `user_type: "founder"`
2. Create startup profile (name, description, stack, culture)
3. Run matching against all candidates
4. See results with match scores
5. Accept/reject candidates

## Debugging

### Backend logs
- Revisa output de `npm run dev`
- Busca "Server running on http://localhost:3000"

### Database errors
- Revisa RLS policies en Supabase console
- Verifica que las tablas existan: `SELECT * FROM information_schema.tables WHERE table_schema = 'public';`

### Token issues
- Token expira en 7 días
- Siempre incluir Bearer en header: `Authorization: Bearer <token>`

## Próximas Fases (Después del MVP)

1. **GitHub Integration Real:** Reemplazar mock con GitHub API
2. **LinkedIn Integration Real:** Scraping o API de LinkedIn
3. **AI Integration Real:** OpenAI/Anthropic para scoring (actualmente determinístico)
4. **Advanced Matching:** ML-based compatibility scoring
5. **Chat/Messaging:** Real-time communication between users
6. **Deployment:** Production environment setup

## Documentación Adicional

- `services/api/FRONTEND_API_GUIDE.md` ← START HERE for API details
- `services/api/README.md` ← Backend setup guide
- `services/api/database.sql` ← Database schema
- `platanus-hack-project.json` ← Project metadata

## Contacto/Notas

- Backend completado por: Luca Saboredo
- Estado: Stable, ready for frontend integration
- Cualquier pregunta sobre API: Ver FRONTEND_API_GUIDE.md
- Last updated: 2026-05-09

---

**IMPORTANTE:** Antes de hacer cambios significativos al backend, coordina con Luca. El backend está estable y listo para que frontend lo consuma tal como está.
