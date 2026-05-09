# KnowAHuman - AI-Mediated Talent-Startup Matching Platform

**Platanus Hack 26 | Team 24 | Buenos Aires | Track: 🛸 Future**

<img src="./project-logo.png" alt="AgentLink Logo" width="200" />

---

## 📋 Project Overview

KnowAHuman is an intelligent platform that bridges the gap between talented developers/professionals and innovative startups. Using AI-mediated matching, we connect job seekers with founder teams based on skill compatibility, experience levels, and technical alignment.

**Status:** MVP Backend ✅ Complete | Frontend 🔨 In Progress

---

## 👥 Team

- **Marcos Penon** ([@mpenon4](https://github.com/mpenon4))
- **Roman Pedro Meclazcke** ([@romanmeclazcke](https://github.com/romanmeclazcke))
- **Lautaro Guiglioni** ([@Lautaroguiglioni](https://github.com/Lautaroguiglioni))
- **Alejandro Cafaro** ([@AleCafaro](https://github.com/AleCafaro))
- **Luca Saboredo** ([@Lucasaboredo](https://github.com/Lucasaboredo))

Have fun! 🚀

## OpenClaw runtime

El repo ahora incluye:

- `openclaw/`: runtime desplegable con OpenClaw + API admin + proxy al gateway
- `back/`: backend mínimo para consumir el runtime

Flujo esperado:

`frontend local -> back local -> openclaw runtime`

Levantado local:

```bash
cp .env.example .env
docker compose up --build
```

Servicios:

- runtime OpenClaw: `http://localhost:8080`
- backend: `http://localhost:4000`

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- npm/yarn
- Git

### Backend Setup (✅ Completed)

```bash
cd services/api
npm install
npm run dev
# Runs on http://localhost:3000
```

### Frontend Setup (🔨 In Progress)

```bash
cd apps/web
npm install
npm run dev
# Runs on http://localhost:3001
```

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| **`CLAUDE.md`** | 🤖 Instructions for AI sessions |
| **`STATUS.md`** | 📊 Detailed project progress |
| **`services/api/FRONTEND_API_GUIDE.md`** | 🔗 Complete API documentation (START HERE) |
| **`services/api/README.md`** | ⚙️ Backend setup guide |
| **`services/api/database.sql`** | 🗄️ Database schema |

---

## 🎯 MVP Features

### Backend ✅
- User authentication (talent + founder roles)
- Candidate profile creation (skills, experience, tech stack)
- Startup profile creation (company info, tech stack, culture)
- Matching algorithm (skill overlap + experience + tech diversity)
- 19 REST API endpoints
- Supabase PostgreSQL database with RLS policies

### Frontend 🔨
- User registration & authentication UI
- Profile creation forms
- Matching results display
- Accept/reject matches
- User dashboards

---

## 🏗️ Architecture

```
AgentLink/
├── services/api/                          # Express + TypeScript Backend ✅
│   ├── src/
│   │   ├── controllers/                  # Request handlers
│   │   ├── services/                     # Business logic
│   │   ├── routes/                       # API endpoints
│   │   ├── middlewares/                  # Auth, validation, errors
│   │   ├── config/                       # Supabase, environment
│   │   ├── types/                        # TypeScript interfaces
│   │   └── utils/                        # JWT, bcrypt, validators
│   ├── FRONTEND_API_GUIDE.md             # ⭐ API Documentation
│   └── package.json
└── apps/web/                              # Next.js Frontend 🔨
    ├── app/
    ├── components/
    ├── lib/
    └── package.json
```

---

## 🔗 API Endpoints (19 Total)

### Authentication
```
POST /auth/register          # User registration
POST /auth/login             # User login
```

### User Profiles
```
POST   /profile/candidate    # Create talent profile
GET    /profile/candidate    # Get talent profile
PUT    /profile/candidate    # Update talent profile

POST   /profile/startup      # Create startup profile
GET    /profile/startup      # Get startup profile
PUT    /profile/startup      # Update startup profile
```

### Matching
```
POST   /match/run            # Run matching algorithm
GET    /match/results        # Get match results
PUT    /match/status         # Accept/reject match
```

### Analysis (Mock)
```
POST   /profile/github/analyze      # GitHub profile analysis
POST   /profile/linkedin/analyze    # LinkedIn profile analysis
```

### AI Services (Mock)
```
POST   /ai/candidate-agent         # Generate candidate agent
POST   /ai/recruiter-agent         # Generate recruiter agent
POST   /ai/compatibility-score     # Calculate compatibility
POST   /ai/generate-summary        # Generate match summary
```

### Browse
```
GET    /user/candidates     # List all talent users
GET    /user/founders       # List all founder users
GET    /health              # API health check
```

**⭐ See `services/api/FRONTEND_API_GUIDE.md` for complete endpoint documentation with request/response examples.**

---

## 🔐 Authentication

- **Type:** JWT (JSON Web Tokens)
- **Expiration:** 7 days
- **Hashing:** bcrypt
- **Header:** `Authorization: Bearer <token>`

---

## 🗄️ Database

- **Type:** PostgreSQL (Supabase)
- **Tables:** 8 (users, candidate_profiles, startup_profiles, opportunities, matches, ai_agents, github_profiles, linkedin_profiles)
- **Security:** Row-Level Security (RLS) policies
- **Status:** ✅ Schema created and tested

---

## 🎲 Matching Algorithm

```
Match Score = (Skill Overlap × 0.60) + (Experience Match × 0.20) + (Tech Match × 0.20)
Result Range: 0.00 to 1.00 (0% to 100%)
```

**Factors:**
- **Skills (60%):** Common skills between candidate and startup
- **Experience (20%):** Years of experience (0-1 scale)
- **Technology (20%):** Tech stack overlap

---

## 🔄 MVP Flow

### For Talent Users
1. Register with `user_type: "talent"`
2. Create candidate profile (bio, skills, experience, technologies, GitHub, LinkedIn)
3. Wait for founder to run matching
4. View match results (score, summary, reasons)
5. Accept or reject matches

### For Founder Users
1. Register with `user_type: "founder"`
2. Create startup profile (name, description, tech stack, culture values)
3. Run matching against all candidates
4. See match results sorted by score
5. Accept or reject candidates

---

## 🛠️ Tech Stack

### Backend
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** Supabase PostgreSQL
- **Auth:** JWT + bcrypt
- **Validation:** Zod
- **Security:** Helmet, CORS

### Frontend (Recommended)
- **Framework:** Next.js 14+
- **Language:** TypeScript
- **Styling:** Tailwind CSS / Shadcn UI
- **HTTP:** Fetch API / Axios
- **State:** React Context / Zustand
- **Forms:** React Hook Form + Zod

---

## 📖 For Frontend Developers

**Start here:** Read `services/api/FRONTEND_API_GUIDE.md`

This document contains:
- Base URL
- All endpoints with request/response examples
- Required headers and authentication
- Validation rules
- Error codes
- Complete MVP flow code example

---

## 🚀 Deployment

### Backend
- **Local:** `npm run dev` on port 3000
- **Production:** Ready for Railway, Render, or similar Node.js hosting

### Frontend
- **Local:** `npm run dev` on port 3001
- **Production:** Ready for Vercel

---

## 📝 Environment Variables

See `services/api/.env.example` for required variables.

Key variables:
```
SUPABASE_URL=<your-supabase-url>
SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_KEY=<service-key>
JWT_SECRET=<your-secret>
```

---

## 🎯 Project Phases

### Phase 1: MVP (Current ✅)
- [x] Backend REST API
- [x] User authentication
- [x] Profile management
- [x] Matching algorithm
- [ ] Frontend UI

### Phase 2: Real Integrations (Next)
- [ ] Real GitHub API integration
- [ ] LinkedIn profile scraping
- [ ] Real AI (OpenAI/Anthropic) integration
- [ ] Advanced matching

### Phase 3: Advanced Features
- [ ] Real-time chat/messaging
- [ ] ML-based matching
- [ ] User recommendations
- [ ] Advanced analytics

### Phase 4: Production
- [ ] Load testing
- [ ] Security audit
- [ ] Performance optimization
- [ ] Deployment

---

## 🤝 Contributing

1. Create a branch for your feature
2. Make changes
3. Test thoroughly
4. Submit PR with description
5. Coordinate with team before major changes

---

## 📞 Support

- **API Issues:** Check `FRONTEND_API_GUIDE.md`
- **Backend Issues:** See `services/api/README.md`
- **Questions:** Refer to `CLAUDE.md` and `STATUS.md`

---

## 📄 License

TBD - Platanus Hack 26 Project

---

## 🎉 Next Steps

1. ✅ Backend is complete and tested
2. 🔨 Frontend team: Read `FRONTEND_API_GUIDE.md`
3. 🔨 Frontend team: Set up Next.js project
4. 🔨 Frontend team: Start implementing UI
5. 🚀 Deploy when ready

**Everything is ready for frontend development!**

## Deploy en Railway

Producción se despliega como 2 servicios separados desde este mismo repo:

- `openclaw/`
- `back/`

No uses `docker-compose.yml` en Railway. Ese compose es solo para desarrollo local.

Guía rápida:

1. Crear un servicio con `Root Directory = openclaw`
2. Crear otro servicio con `Root Directory = back`
3. Montar un volumen en `/data` solo en `openclaw`
4. Configurar `OPENCLAW_RUNTIME_URL` de `back` apuntando a la URL pública de `openclaw`
