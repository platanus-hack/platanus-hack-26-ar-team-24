# API Architecture Blueprint

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND / CLIENTS                       │
│                  (Next.js, React Native, etc)                │
└────────────────────────┬────────────────────────────────────┘
                         │
                    HTTP Requests
                         │
          ┌──────────────┴──────────────┐
          │                             │
    ┌─────▼──────┐            ┌────────▼──────┐
    │ CORS Layer │            │  Morgan Logs  │
    │  (Helmet)  │            │  (Monitoring) │
    └─────┬──────┘            └────────┬──────┘
          │                             │
          └──────────────┬──────────────┘
                         │
            ┌────────────▼────────────┐
            │   Routes Layer          │
            │  (/auth, /user, etc)    │
            └────────────┬────────────┘
                         │
    ┌────────────────────┼────────────────────┐
    │                    │                    │
┌───▼────────┐   ┌──────▼────────┐   ┌──────▼──────┐
│   Auth     │   │ Validation    │   │    Auth     │
│ Middleware │   │ Middleware    │   │  (JWT)      │
└───┬────────┘   └──────┬────────┘   └──────┬──────┘
    │                    │                   │
    └────────────────────┼───────────────────┘
                         │
            ┌────────────▼────────────┐
            │   Controllers Layer     │
            │  (Handle HTTP Logic)    │
            └────────────┬────────────┘
                         │
    ┌────────────────────┼──────────────────────┐
    │                    │                      │
┌───▼──────────┐  ┌──────▼──────────┐  ┌──────▼────────┐
│Auth Service  │  │ User Service    │  │Chat Service   │
│              │  │                 │  │               │
│• register()  │  │• getUserById()  │  │• saveMessage()│
│• login()     │  │• getProfile()   │  │• getMessages()│
│              │  │• updateProfile()│  │               │
└───┬──────────┘  └──────┬──────────┘  └──────┬────────┘
    │                    │                     │
    │              ┌─────┴──────┐              │
    │              │            │              │
    │         ┌────▼──────┐    │              │
    │         │ AI Service│    │              │
    │         │            │    │              │
    │         │• analyze() │    │              │
    │         │• generate()│    │              │
    │         │• score()   │    │              │
    │         └────┬───────┘    │              │
    │              │            │              │
    └──────────────┼────────────┴──────────────┘
                   │
                   │ Query/Insert/Update/Delete
                   │
        ┌──────────▼───────────┐
        │  Supabase Client    │
        │  (Database Layer)    │
        └──────────┬───────────┘
                   │
            ┌──────▼───────┐
            │  PostgreSQL  │
            │   (Remote)   │
            │              │
            │  • users     │
            │  • messages  │
            │  • vectors   │
            └──────────────┘
```

## Request Flow Example: User Registration

```
1. CLIENT
   POST /auth/register
   {
     "email": "user@example.com",
     "password": "secure123",
     "username": "john_doe"
   }

2. MIDDLEWARE STACK
   ├─ app.json()           → Parse JSON
   ├─ helmet()             → Security headers
   ├─ cors()               → Check origin
   ├─ morgan()             → Log request
   └─ validateRequest()    → Zod validation

3. ROUTE HANDLER
   → Routes: authRoutes.ts
   → POST /auth/register route found
   → Controller: authController.register()

4. CONTROLLER
   → Extract body: req.body
   → Call: authService.register(input)

5. SERVICE (Business Logic)
   → Check if email exists (query database)
   → If exists: throw HttpError(400)
   → Hash password with bcrypt
   → Generate UUID for user
   → Insert user into database
   → Generate JWT token
   → Return { token, user }

6. RESPONSE
   ├─ Status: 201 (Created)
   └─ Body:
      {
        "success": true,
        "data": {
          "token": "eyJhbGc...",
          "user": {
            "id": "uuid",
            "email": "user@example.com",
            "username": "john_doe",
            "created_at": "2024-01-01T00:00:00Z",
            "updated_at": "2024-01-01T00:00:00Z"
          }
        },
        "error": null,
        "timestamp": "2024-01-01T00:00:00Z"
      }

7. ERROR HANDLING (if any step fails)
   → Error caught in try/catch
   → Check if HttpError instance
   → If HttpError: use statusCode
   → If other: return 500
   → Response with error message
```

## Data Flow: Protected Endpoint (Get Profile)

```
1. CLIENT REQUEST
   GET /user/profile
   Headers: {
     "Authorization": "Bearer <jwt_token>"
   }

2. ROUTING & MIDDLEWARE
   → Routes: userRoutes.ts
   → authMiddleware applied

3. AUTH MIDDLEWARE
   ├─ Extract token from Authorization header
   ├─ Call: verifyToken(token)
   ├─ If invalid: return 401 error
   ├─ If valid: decode payload
   └─ Attach user to req: req.user = { id, email, iat, exp }

4. CONTROLLER
   → Check: if (!req.user) → 401 error
   → Call: userService.getUserProfile(req.user.id)

5. SERVICE
   → Query: FROM users WHERE id = req.user.id
   ├─ If not found: throw HttpError(404)
   ├─ If error: throw HttpError(500)
   └─ Return user object

6. RESPONSE (200 OK)
   {
     "success": true,
     "data": { /* user object */ },
     "error": null,
     "timestamp": "..."
   }
```

## Database Schema Relationships

```
┌─────────────────────────────────────────────┐
│                  USERS                      │
├─────────────────────────────────────────────┤
│ id (UUID) ◄── PRIMARY KEY                   │
│ email (VARCHAR) ◄── UNIQUE INDEX            │
│ username (VARCHAR)                          │
│ password_hash (VARCHAR)                     │
│ created_at (TIMESTAMP)                      │
│ updated_at (TIMESTAMP)                      │
└────────────▲────────────────────────────────┘
             │
        ONE-TO-MANY
             │
    ┌────────┴──────────────────────────┐
    │                                   │
┌───┴──────────────────────────────────┐│
│        CHAT_MESSAGES                 ││
├────────────────────────────────────────┤
│ id (UUID) ◄── PRIMARY KEY             │
│ user_id (UUID) ◄── FOREIGN KEY        │
│ content (TEXT)                         │
│ created_at (TIMESTAMP) ◄── INDEX      │
└───────────────────────────────────────┘
```

## Service Layer Pattern

Each service contains reusable business logic:

```typescript
// services/userService.ts
export const userService = {
  // Pure business logic, no HTTP concerns
  async getUserById(id: string): Promise<User> {
    // 1. Query database
    // 2. Handle errors
    // 3. Return data or throw HttpError
  },

  async updateUserProfile(id: string, updates: Partial<User>): Promise<User> {
    // 1. Validate data
    // 2. Update database
    // 3. Return updated user
  },
}

// controllers/userController.ts
export const userController = {
  async getProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      // 1. Check authentication
      // 2. Call service
      // 3. Return HTTP response
      const user = await userService.getUserProfile(req.user.id);
      sendSuccess(res, user, 200);
    } catch (error) {
      // Handle error and send response
    }
  },
}

// routes/userRoutes.ts
router.get('/profile', authMiddleware, userController.getProfile);
```

## Middleware Order (Important!)

```
app.use(helmet());              // 1. Security headers first
app.use(cors());                // 2. CORS configuration
app.use(morgan());              // 3. Logging
app.use(express.json());        // 4. Parse JSON
app.use(express.urlencoded());  // 5. Parse form data

// Routes with embedded middleware
app.use('/auth', authRoutes);   // validateRequest middleware
app.use('/user', userRoutes);   // authMiddleware applied

// Error handling MUST be last
app.use(notFoundHandler);       // 6. 404 handler
app.use(errorHandler);          // 7. Global error handler
```

## Error Handling Flow

```
┌──────────────────┐
│   Code Throws    │
│  HttpError       │
│  or Error        │
└────────┬─────────┘
         │
    ┌────▼─────┐
    │ Caught?  │
    └────┬─────┘
         │
    ┌────▼───────────────────┐
    │ Is HttpError?          │
    ├────────────────────────┤
    │ YES: Use statusCode    │
    │ NO:  Return 500        │
    └────┬───────────────────┘
         │
    ┌────▼───────────────────┐
    │ Send Error Response    │
    ├────────────────────────┤
    │ {                      │
    │   "success": false,    │
    │   "data": null,        │
    │   "error": "msg",      │
    │   "timestamp": "..."   │
    │ }                      │
    └────────────────────────┘
```

## Validation Flow

```
┌────────────────┐
│  Incoming      │
│  Request Body  │
└────────┬───────┘
         │
    ┌────▼─────────────────────┐
    │ validateRequest          │
    │ (Zod middleware)         │
    └────┬─────────────────────┘
         │
    ┌────▼──────────────────────┐
    │ Parse with Zod Schema    │
    └────┬──────────────────────┘
         │
    ┌────▼────┐
    │ Valid?  │
    └────┬────┘
         │
    ┌────┴────────┬──────────────┐
    │             │              │
   YES           NO
    │             │
    │      ┌──────▼─────────┐
    │      │ Validation     │
    │      │ Error (422)    │
    │      │ {              │
    │      │   errors: {    │
    │      │     field: msg │
    │      │   }            │
    │      │ }              │
    │      └────────────────┘
    │
┌───▼────────────┐
│ Continue to    │
│ Controller     │
└────────────────┘
```

## Environment Variables Map

```
.env
├─ PORT                      → Server port (default 3000)
├─ NODE_ENV                  → 'development' or 'production'
│
├─ JWT_SECRET                → Secret key for JWT signing
├─ JWT_EXPIRES_IN            → Token expiry (e.g., '7d')
│
├─ SUPABASE_URL              → Database server URL
├─ SUPABASE_ANON_KEY         → Public API key
├─ SUPABASE_SERVICE_KEY      → Private service key (optional)
│
├─ OPENAI_API_KEY            → For OpenAI integration
├─ ANTHROPIC_API_KEY         → For Anthropic integration
│
├─ CORS_ORIGIN               → Allowed frontend origin
└─ REDIS_URL                 → Optional caching (future)
```

## Development vs Production

```
DEVELOPMENT
├─ npm run dev              ← Hot reload with ts-node-dev
├─ Morgan logs: 'dev'       ← Detailed console output
├─ Source maps enabled      ← Easy debugging
├─ Error stack traces       ← Full details
└─ CORS: localhost:3001     ← Frontend dev server

PRODUCTION
├─ npm start                ← Run compiled JS
├─ Morgan logs: 'combined'  ← Apache format
├─ No source maps           ← Smaller files
├─ Error stack hidden       ← Security
└─ CORS: production domain  ← Real domain
```

## Integration Points

### With Frontend
```
Frontend (http://localhost:3001)
      ↓
  HTTP requests
      ↓
API (http://localhost:3000)
      ↓
  JWT tokens in headers
  Standard JSON responses
```

### With AI Service
```
API Endpoints:
├─ POST /ai/analyze       ← Send content for analysis
├─ POST /ai/personality   ← Generate personality from profile
└─ POST /ai/compatibility ← Score two agents

Returns:
{
  "analysis": "...",
  "confidence": 0.85,
  "metadata": { ... }
}
```

### With Database
```
Services make queries:
├─ SELECT (read)
├─ INSERT (create)
├─ UPDATE (modify)
└─ DELETE (remove)

All through Supabase client:
supabaseClient
  .from('table_name')
  .select/insert/update/delete()
```

## Testing a Complete Flow

```bash
# 1. Register user
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123","username":"test"}'

# Response:
# {
#   "success": true,
#   "data": { "token": "...", "user": {...} },
#   "error": null
# }

# 2. Use token to get profile
TOKEN="<token_from_response>"
curl -X GET http://localhost:3000/user/profile \
  -H "Authorization: Bearer $TOKEN"

# 3. Send a chat message
curl -X POST http://localhost:3000/chat/message \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content":"Hello world"}'

# 4. Analyze content
curl -X POST http://localhost:3000/ai/analyze \
  -H "Content-Type: application/json" \
  -d '{"content":"Some text","context":"optional"}'
```

---

This architecture ensures:
✅ Clear separation of concerns
✅ Easy to test (services are pure)
✅ Easy to extend (add new services)
✅ Type-safe (TypeScript throughout)
✅ Production-ready (proper error handling)
✅ Scalable (modular design)
