# Backend Setup - Hackathon Quick Start

## ✅ Installation Complete

The backend is fully initialized and ready to use!

## 📋 What's Included

- ✅ Express.js with TypeScript
- ✅ JWT Authentication
- ✅ Supabase integration (ready to connect)
- ✅ Password hashing with bcrypt
- ✅ Input validation with Zod
- ✅ Error handling middleware
- ✅ Standard API responses
- ✅ 6 core services (auth, user, chat, ai, health)
- ✅ Production-ready structure
- ✅ ESLint & Prettier configured

## 🚀 Get Started in 3 Steps

### Step 1: Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:
- `SUPABASE_URL` - Get from Supabase project settings
- `SUPABASE_ANON_KEY` - Get from API Keys section
- `JWT_SECRET` - Generate a strong secret (openssl rand -base64 32)

### Step 2: Setup Supabase Database

1. Go to your Supabase project SQL Editor
2. Copy & paste the contents of `database.sql`
3. Click "Run"
4. Verify tables appear in the Database section

### Step 3: Start Development Server

```bash
npm run dev
```

Server starts at **http://localhost:3000**

## 🧪 Quick Test

```bash
# Register
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","username":"testuser"}'

# You'll get back a token and user object
```

## 📚 Available Scripts

```bash
npm run dev          # Start dev server with auto-reload
npm run build        # Compile TypeScript
npm start            # Run production server
npm run type-check   # TypeScript type checking
npm run lint         # ESLint
npm run format       # Prettier
```

## 📖 Documentation

- **README.md** - Full API documentation with endpoints
- **DEVELOPMENT.md** - Architecture and how to add features
- **database.sql** - Database schema and setup

## 🔌 API Endpoints Ready

### Public Endpoints
- `POST /auth/register` - Create account
- `POST /auth/login` - Login
- `POST /ai/analyze` - Analyze content
- `GET /health` - Health check

### Protected Endpoints (need JWT token)
- `GET /user/profile` - Get user profile
- `PUT /user/profile` - Update profile
- `POST /chat/message` - Send message
- `GET /chat/messages` - Get messages
- `DELETE /chat/message/:id` - Delete message
- `POST /ai/personality` - Generate personality
- `POST /ai/compatibility` - Score compatibility

## 🏗️ Project Structure

```
services/api/
├── src/
│   ├── controllers/      # Handle requests
│   ├── services/         # Business logic
│   ├── routes/          # API endpoints
│   ├── middlewares/      # Auth, validation, errors
│   ├── config/          # Environment & database
│   ├── utils/           # JWT, hash, validation
│   ├── types/           # TypeScript interfaces
│   ├── app.ts          # Express configuration
│   └── server.ts       # Server startup
├── dist/               # Compiled JavaScript
├── database.sql        # DB schema
├── DEVELOPMENT.md      # Feature development guide
└── README.md          # Full documentation
```

## 🎯 Next Steps

1. **Setup Supabase** - Run `database.sql` in SQL Editor
2. **Test endpoints** - Use cURL or Postman to test
3. **Connect Frontend** - Frontend can now call these endpoints
4. **Integrate AI** - AI service can connect to `/ai/*` endpoints
5. **Add more features** - Follow DEVELOPMENT.md guide

## 🐛 Common Issues

**"Failed to connect to Supabase"**
- Check SUPABASE_URL and SUPABASE_ANON_KEY in .env
- Make sure Supabase project is active

**"Invalid token"**
- Token might be expired (7 days default)
- Make sure JWT_SECRET is set correctly

**"Port 3000 in use"**
- Change PORT in .env (e.g., PORT=3001)

**"Tables don't exist"**
- Run database.sql in Supabase SQL Editor
- Check that tables appear in Database section

## 📱 Mobile Ready

API is CORS-enabled and configured for mobile clients. Works with:
- React Native
- Flutter
- Native iOS/Android

Just update `CORS_ORIGIN` in .env

## 🚢 Deployment Ready

The API is ready to deploy to:
- **Vercel** (serverless)
- **Railway** (Node.js)
- **AWS** (Lambda or EC2)
- **Google Cloud Run**
- **Azure** (App Service)

All you need:
1. Set environment variables
2. Run `npm run build`
3. Deploy `dist/` folder

## 💡 Pro Tips

- **Hot reload** - Changes auto-reload in dev mode
- **Type safety** - Run `npm run type-check` before commits
- **Clean code** - Run `npm run format` to auto-fix formatting
- **Mock data** - Services are set up for easy mocking before AI integration

## 📞 Need Help?

Check the documentation files:
- **README.md** - API endpoint details
- **DEVELOPMENT.md** - Architecture and patterns
- **database.sql** - Database schema

## 🎉 You're All Set!

Your production-grade backend is ready. Time to ship! 🚀
