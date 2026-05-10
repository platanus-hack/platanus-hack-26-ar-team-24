# knowAhuman Backend API - Frontend Integration Guide

## Base URL
```
Local Development: http://localhost:3000
```

## Authentication
- Usar JWT en header: `Authorization: Bearer <token>`
- Token expira en 7 días
- Obtener token en `/auth/register` o `/auth/login`

---

## MVP FLOW (Orden correcto)

### 1️⃣ REGISTRO Y LOGIN

#### POST /auth/register
**Body:**
```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "SecurePassword123",
  "user_type": "talent"  // or "founder"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "username": "username",
      "user_type": "talent",
      "created_at": "2026-05-09T07:30:00.000Z",
      "updated_at": "2026-05-09T07:30:00.000Z"
    }
  },
  "error": null,
  "timestamp": "2026-05-09T07:30:00.000Z"
}
```

#### POST /auth/login
**Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

**Response (200):** (igual que register)

---

### 2️⃣ CREAR PERFIL DE CANDIDATO (Talent User)

#### POST /profile/candidate
**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "bio": "Descripción personal de al menos 10 caracteres",
  "skills": ["TypeScript", "React", "Node.js"],
  "experience_years": 5,
  "technologies": ["TypeScript", "JavaScript", "Python"],
  "github_url": "https://github.com/username",
  "linkedin_url": "https://linkedin.com/in/username"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "candidate-uuid",
    "user_id": "user-uuid",
    "bio": "Descripción personal...",
    "skills": ["TypeScript", "React", "Node.js"],
    "experience_years": 5,
    "technologies": ["TypeScript", "JavaScript", "Python"],
    "github_url": "https://github.com/username",
    "linkedin_url": "https://linkedin.com/in/username",
    "ai_agent": null,
    "created_at": "2026-05-09T07:30:00.000Z",
    "updated_at": "2026-05-09T07:30:00.000Z"
  },
  "error": null,
  "timestamp": "2026-05-09T07:30:00.000Z"
}
```

#### GET /profile/candidate
**Headers:** `Authorization: Bearer <token>`

**Response (200):** (retorna el perfil del usuario actual)

#### PUT /profile/candidate
**Headers:** `Authorization: Bearer <token>`

**Body:** (mismo que POST, pero todos los campos son opcionales)

---

### 3️⃣ CREAR PERFIL DE STARTUP (Founder User)

#### POST /profile/startup
**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "name": "Nombre de la empresa",
  "description": "Descripción de la startup de al menos 20 caracteres. Explicar qué hace, su misión, etc.",
  "stack": ["TypeScript", "Python", "React"],
  "culture_values": ["Innovation", "Collaboration"]
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "startup-uuid",
    "user_id": "founder-uuid",
    "name": "Nombre de la empresa",
    "description": "Descripción...",
    "stack": ["TypeScript", "Python", "React"],
    "culture_values": ["Innovation", "Collaboration"],
    "recruiter_agent": null,
    "created_at": "2026-05-09T07:30:00.000Z",
    "updated_at": "2026-05-09T07:30:00.000Z"
  },
  "error": null,
  "timestamp": "2026-05-09T07:30:00.000Z"
}
```

#### GET /profile/startup
**Headers:** `Authorization: Bearer <token>`

**Response (200):** (retorna el perfil del usuario actual)

#### PUT /profile/startup
**Headers:** `Authorization: Bearer <token>`

**Body:** (mismo que POST, pero todos los campos son opcionales)

---

### 4️⃣ EJECUTAR MATCHING

#### POST /match/run
**Headers:** `Authorization: Bearer <token>`

**Body:** (vacío o `{}`)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "startup_id": "startup-uuid",
    "matches_count": 3,
    "matches": [
      {
        "id": "match-uuid",
        "candidate_id": "candidate-uuid",
        "startup_id": "startup-uuid",
        "match_score": 0.85,
        "summary": "Strong match between...",
        "reasons": [
          "2 matching skills: TypeScript, Python",
          "Strong professional experience",
          "Diverse technical background"
        ],
        "status": "pending",
        "created_at": "2026-05-09T07:30:00.000Z",
        "updated_at": "2026-05-09T07:30:00.000Z"
      }
    ]
  },
  "error": null,
  "timestamp": "2026-05-09T07:30:00.000Z"
}
```

---

### 5️⃣ OBTENER RESULTADOS DE MATCHING

#### GET /match/results
**Headers:** `Authorization: Bearer <token>`

**Query Params:** `?userId` (opcional, para obtener matches de otro usuario)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "matches": [
      {
        "id": "match-uuid",
        "candidate_id": "candidate-uuid",
        "startup_id": "startup-uuid",
        "match_score": 0.85,
        "summary": "Strong match...",
        "reasons": ["2 matching skills", "Strong experience"],
        "status": "pending",
        "created_at": "2026-05-09T07:30:00.000Z",
        "updated_at": "2026-05-09T07:30:00.000Z"
      }
    ]
  },
  "error": null,
  "timestamp": "2026-05-09T07:30:00.000Z"
}
```

---

## ENDPOINTS ADICIONALES

### Health Check (Sin autenticación)
#### GET /health
**Response (200):**
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2026-05-09T07:30:00.000Z",
    "uptime": 123.45
  },
  "error": null,
  "timestamp": "2026-05-09T07:30:00.000Z"
}
```

### Listar Usuarios (Sin autenticación)
#### GET /user/candidates
**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "user-uuid",
      "email": "talent@example.com",
      "username": "username",
      "user_type": "talent",
      "created_at": "2026-05-09T07:30:00.000Z",
      "updated_at": "2026-05-09T07:30:00.000Z"
    }
  ],
  "error": null,
  "timestamp": "2026-05-09T07:30:00.000Z"
}
```

#### GET /user/founders
**Response (200):** (mismo formato que candidates)

### GitHub Analysis (Mock)
#### POST /profile/github/analyze
**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "github_username": "username"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "github-uuid",
    "user_id": "user-uuid",
    "github_username": "username",
    "repositories": 25,
    "stars": 150,
    "languages": ["TypeScript", "JavaScript", "Python"],
    "analyzed_at": "2026-05-09T07:30:00.000Z"
  },
  "error": null,
  "timestamp": "2026-05-09T07:30:00.000Z"
}
```

### LinkedIn Analysis (Mock)
#### POST /profile/linkedin/analyze
**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "linkedin_url": "https://linkedin.com/in/username"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "linkedin-uuid",
    "user_id": "user-uuid",
    "linkedin_username": "username",
    "headline": "Senior Developer at Company",
    "company": "Company Inc",
    "analyzed_at": "2026-05-09T07:30:00.000Z"
  },
  "error": null,
  "timestamp": "2026-05-09T07:30:00.000Z"
}
```

### Update Match Status
#### PUT /match/status
**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "matchId": "match-uuid",
  "status": "accepted"  // or "rejected"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "match-uuid",
    "candidate_id": "candidate-uuid",
    "startup_id": "startup-uuid",
    "match_score": 0.85,
    "summary": "Strong match...",
    "reasons": ["2 matching skills"],
    "status": "accepted",
    "created_at": "2026-05-09T07:30:00.000Z",
    "updated_at": "2026-05-09T07:30:00.000Z"
  },
  "error": null,
  "timestamp": "2026-05-09T07:30:00.000Z"
}
```

### Generate Candidate Agent
#### POST /ai/candidate-agent
**Headers:** `Authorization: Bearer <token>`

**Body:** (vacío o `{}`)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "agent": "CandidateAgent_uuid",
    "message": "Candidate AI Agent generated"
  },
  "error": null,
  "timestamp": "2026-05-09T07:30:00.000Z"
}
```

### Generate Recruiter Agent
#### POST /ai/recruiter-agent
**Headers:** `Authorization: Bearer <token>`

**Body:** (vacío o `{}`)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "agent": "RecruiterAgent_uuid",
    "message": "Recruiter AI Agent generated"
  },
  "error": null,
  "timestamp": "2026-05-09T07:30:00.000Z"
}
```

---

## CÓDIGOS DE ERROR

| Código | Significado |
|--------|------------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request (validación fallida) |
| 401 | Unauthorized (token inválido/expirado) |
| 404 | Not Found |
| 500 | Internal Server Error |

**Formato de error:**
```json
{
  "success": false,
  "data": null,
  "error": "Descripción del error",
  "details": {
    "field": "Error specific message"
  },
  "timestamp": "2026-05-09T07:30:00.000Z"
}
```

---

## VALIDACIONES

### Candidate Profile
- `bio`: Mínimo 10 caracteres
- `skills`: Array de strings
- `experience_years`: Número entero
- `technologies`: Array de strings

### Startup Profile
- `name`: String requerido
- `description`: Mínimo 20 caracteres
- `stack`: Array de strings, mínimo 1
- `culture_values`: Array de strings (opcional)

### Auth
- `email`: Email válido, único
- `password`: Mínimo 8 caracteres
- `username`: String requerido
- `user_type`: "talent" o "founder"

---

## EJEMPLO COMPLETO: FLUJO MVP

```javascript
// 1. Register como talent
const registerRes = await fetch('http://localhost:3000/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'alice@example.com',
    username: 'alice_dev',
    password: 'SecurePass123',
    user_type: 'talent'
  })
});
const { data: { token, user } } = await registerRes.json();
const talentToken = token;

// 2. Create candidate profile
await fetch('http://localhost:3000/profile/candidate', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${talentToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    bio: 'Senior developer with AI experience',
    skills: ['TypeScript', 'Python'],
    experience_years: 5,
    technologies: ['TypeScript', 'Python'],
    github_url: 'https://github.com/alice',
    linkedin_url: 'https://linkedin.com/in/alice'
  })
});

// 3. Register como founder
const founderRes = await fetch('http://localhost:3000/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'bob@startup.com',
    username: 'bob_founder',
    password: 'SecurePass123',
    user_type: 'founder'
  })
});
const { data: { token: founderToken } } = await founderRes.json();

// 4. Create startup profile
await fetch('http://localhost:3000/profile/startup', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${founderToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'TechAI Inc',
    description: 'Building AI solutions for enterprise customers worldwide',
    stack: ['TypeScript', 'Python', 'React'],
    culture_values: ['Innovation', 'Collaboration']
  })
});

// 5. Run matching
const matchRes = await fetch('http://localhost:3000/match/run', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${founderToken}`,
    'Content-Type': 'application/json'
  }
});
const { data: { matches } } = await matchRes.json();

// 6. Get results
const resultsRes = await fetch('http://localhost:3000/match/results', {
  headers: {
    'Authorization': `Bearer ${founderToken}`
  }
});
const { data: { matches: allMatches } } = await resultsRes.json();
console.log(allMatches);
```

---

## NOTAS IMPORTANTES

1. **Token Expiration**: Tokens expiran en 7 días. Implementar refresh si es necesario.
2. **CORS**: Backend está configurado para aceptar requests desde `http://localhost:3001` en desarrollo.
3. **Match Score**: Rango 0.00 a 1.00 (0% a 100% compatible)
4. **Data Persistance**: Todos los datos se guardan en Supabase PostgreSQL con RLS policies
5. **RLS Policies**: Users solo ven sus propios datos de perfil, pero pueden leer todos los perfiles públicos
