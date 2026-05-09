# Development Guide

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:
- Get `SUPABASE_URL` from Supabase project settings
- Get `SUPABASE_ANON_KEY` from Supabase project API keys
- Get `SUPABASE_SERVICE_KEY` from service role key (optional, for admin operations)
- Generate a strong `JWT_SECRET` (e.g., using `openssl rand -base64 32`)

### 3. Setup Supabase Database
1. Go to your Supabase project
2. Navigate to SQL Editor
3. Run the script from `database.sql`
4. Verify tables were created in the "Databases" section

### 4. Start Development Server
```bash
npm run dev
```

Server will start on `http://localhost:3000`

## Architecture Overview

### Layers

1. **Routes** - Define HTTP endpoints
2. **Controllers** - Handle request/response
3. **Services** - Business logic
4. **Database** - Supabase client
5. **Utils** - Helpers (JWT, validation, hashing)
6. **Middlewares** - Auth, validation, error handling
7. **Types** - TypeScript interfaces

### Flow Example: Login Request

```
POST /auth/login
  ↓
authRoutes → validateRequest
  ↓
authController.login()
  ↓
authService.login()
  ↓
Supabase (read user, verify password)
  ↓
Generate JWT token
  ↓
Response: { token, user }
```

## File Organization

```
src/
├── controllers/      # Request handlers
│   ├── authController.ts
│   ├── userController.ts
│   ├── chatController.ts
│   └── aiController.ts
├── routes/          # Route definitions
│   ├── authRoutes.ts
│   ├── userRoutes.ts
│   ├── chatRoutes.ts
│   ├── aiRoutes.ts
│   └── healthRoutes.ts
├── services/        # Business logic (REUSABLE)
│   ├── authService.ts
│   ├── userService.ts
│   ├── chatService.ts
│   └── aiService.ts
├── middlewares/     # Request processing
│   ├── auth.ts
│   ├── errorHandler.ts
│   └── validation.ts
├── config/          # Configuration
│   ├── env.ts
│   └── supabase.ts
├── utils/           # Helpers
│   ├── jwt.ts
│   ├── bcrypt.ts
│   ├── response.ts
│   └── validators.ts
├── types/           # TypeScript interfaces
│   └── index.ts
├── app.ts          # Express setup
└── server.ts       # Server entry point
```

## Key Concepts

### Services (Business Logic)
- No direct HTTP concerns
- Reusable by multiple controllers
- Handle database operations
- Throw HttpError for specific status codes

Example:
```typescript
// authService.ts
export const authService = {
  async login(input: LoginInput): Promise<AuthResponse> {
    // Logic here
  }
}

// authController.ts
export const authController = {
  async login(req: Request, res: Response): Promise<void> {
    const result = await authService.login(req.body);
    sendSuccess(res, result);
  }
}
```

### Error Handling
- Throw HttpError with statusCode for custom responses
- Global errorHandler catches all errors
- Response always includes { success, data, error, timestamp }

Example:
```typescript
const httpError: HttpError = new Error('User not found');
httpError.statusCode = 404;
throw httpError;
```

### Validation
- Use Zod schemas for input validation
- validateRequest middleware handles parsing
- Returns 422 on validation failure

Example:
```typescript
// validators.ts
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// routes
router.post('/login', validateRequest(loginSchema), authController.login);
```

### Authentication
- JWT tokens in Authorization header
- authMiddleware validates and attaches user to request
- optionalAuth for optional authentication

Example:
```typescript
// Protected route
router.get('/profile', authMiddleware, userController.getProfile);

// In controller
const userId = req.user.id;
```

## Adding New Features

### 1. Add Database Table
Update `database.sql` with new table definition.

### 2. Add Types
```typescript
// src/types/index.ts
export interface MyEntity {
  id: string;
  // fields...
}
```

### 3. Add Validator
```typescript
// src/utils/validators.ts
export const myEntitySchema = z.object({
  // schema...
});
```

### 4. Add Service
```typescript
// src/services/myService.ts
export const myService = {
  async getMyEntity(id: string): Promise<MyEntity> {
    // business logic
  }
}
```

### 5. Add Controller
```typescript
// src/controllers/myController.ts
export const myController = {
  async getMyEntity(req: Request, res: Response): Promise<void> {
    const result = await myService.getMyEntity(req.params.id);
    sendSuccess(res, result);
  }
}
```

### 6. Add Routes
```typescript
// src/routes/myRoutes.ts
router.get('/:id', myController.getMyEntity);
```

### 7. Register Routes
```typescript
// src/app.ts
import myRoutes from './routes/myRoutes.js';
app.use('/my-endpoint', myRoutes);
```

## Common Tasks

### Add Protected Endpoint
```typescript
router.post(
  '/create',
  authMiddleware,
  validateRequest(schema),
  controller.create
);
```

### Connect to Supabase
```typescript
import { supabaseClient } from '../config/supabase.js';

const { data, error } = await supabaseClient
  .from('table_name')
  .select('*')
  .eq('id', id)
  .single();
```

### Return Error
```typescript
const error: HttpError = new Error('Something went wrong');
error.statusCode = 400;
throw error;
```

### Return Success
```typescript
sendSuccess(res, data, 200); // or 201 for creation
```

## Testing Endpoints

### Using cURL
```bash
# Register
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"secure123","username":"john"}'

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"secure123"}'

# Protected endpoint
curl -X GET http://localhost:3000/user/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Using Postman
1. Create POST request to `http://localhost:3000/auth/login`
2. Set body as JSON with email and password
3. Copy token from response
4. Create GET request to protected endpoint
5. Set Authorization header: `Bearer YOUR_TOKEN`

## Debugging

### Enable verbose logging
```bash
DEBUG=* npm run dev
```

### Check what's in request
```typescript
console.log('Body:', req.body);
console.log('Headers:', req.headers);
console.log('Params:', req.params);
```

### Verify JWT token
```typescript
import { verifyToken } from '../utils/jwt.js';
const payload = verifyToken(token);
console.log('Token payload:', payload);
```

## Performance Tips

1. **Add database indexes** - Use indexed fields in WHERE clauses
2. **Limit query results** - Use `.limit()` in Supabase queries
3. **Cache frequently accessed data** - Consider Redis for future
4. **Use connection pooling** - Supabase handles this
5. **Batch operations** - Insert multiple rows at once

## Deployment Checklist

- [ ] All env variables set in hosting platform
- [ ] Database tables created in Supabase
- [ ] JWT_SECRET is a strong random string
- [ ] CORS_ORIGIN matches frontend URL
- [ ] Database backups configured
- [ ] Error logging service configured
- [ ] Run `npm run build` without errors
- [ ] Test all endpoints in production environment

## Getting Help

- Check error messages in console
- Review corresponding service/controller
- Check Supabase dashboard for data issues
- Verify JWT token hasn't expired
- Check CORS configuration if frontend requests fail
