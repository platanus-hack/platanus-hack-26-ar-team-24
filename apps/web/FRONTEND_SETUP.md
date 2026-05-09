# AgentLink Frontend - Setup & Testing Guide

## ✅ Status

Frontend is now ready for testing. Both backend and frontend dev servers are running:

- **Backend API:** http://localhost:3000
- **Frontend:** http://localhost:3001

## 📁 Project Structure

```
apps/web/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── page.tsx                  # Landing page
│   │   ├── layout.tsx                # Root layout with auth init
│   │   ├── (auth)/                   # Auth group
│   │   │   ├── register/page.tsx     # Registration form
│   │   │   └── login/page.tsx        # Login form
│   │   ├── (onboarding)/             # Onboarding group
│   │   │   ├── candidate/page.tsx    # Candidate profile creation
│   │   │   └── startup/page.tsx      # Startup profile creation
│   │   ├── (dashboard)/              # Dashboard group
│   │   │   ├── founder/page.tsx      # Founder dashboard + matching
│   │   │   └── talent/page.tsx       # Talent/candidate dashboard
│   │   └── matches/                  # (Future) Match details
│   ├── components/
│   │   ├── layout/                   # Layout components
│   │   ├── ui/                       # Reusable UI components
│   │   ├── matches/                  # Match-related components
│   │   ├── agent/                    # AI agent visualizations
│   │   └── chat/                     # Chat components (future)
│   ├── lib/
│   │   ├── api.ts                    # API client service
│   │   └── auth.ts                   # Auth state management
│   ├── hooks/
│   │   └── useAuth.ts                # Auth hook
│   ├── types/
│   │   └── api.ts                    # TypeScript type definitions
│   └── styles/
│       └── globals.css               # Global styles & animations
├── public/                           # Static assets
├── tailwind.config.ts                # TailwindCSS configuration
├── tsconfig.json                     # TypeScript config
├── next.config.js                    # Next.js config
├── package.json                      # Dependencies
└── .env.local                        # Environment variables
```

## 🚀 Implemented Features

### ✅ Landing Page
- Beautiful gradient hero section
- Two user paths: Talent & Founder
- Clear value proposition
- How AgentLink works explanation

### ✅ Authentication
- User registration with role selection (talent/founder)
- User login
- JWT token storage in localStorage
- Session persistence across page reloads
- Secure logout

### ✅ Talent Onboarding
- Bio (min 10 chars)
- Skills (array, interactive add/remove)
- Years of experience (0-20+)
- Technologies (array, interactive add/remove)
- GitHub URL (optional)
- LinkedIn URL (optional)
- Form validation

### ✅ Founder Onboarding
- Startup name
- Description (min 20 chars)
- Technology stack (array, interactive add/remove)
- Culture values (array, interactive add/remove)
- Form validation

### ✅ Talent Dashboard
- Profile display with all information
- Profile edit button
- Waiting for matches message
- Links to GitHub/LinkedIn profiles

### ✅ Founder Dashboard
- AI-powered matching button: "Buscar matches con agentes IA"
- Match results display with:
  - Match score (0-100%)
  - Summary (AI-generated text)
  - Reasons (list of why they match)
  - Accept/Reject buttons
- Error handling
- Loading states

### ✅ API Service Layer
- Singleton API client instance
- Automatic JWT token injection in requests
- Error handling
- All endpoints from FRONTEND_API_GUIDE.md implemented:
  - Auth: register, login
  - Profiles: candidate & startup CRUD
  - Matching: run matching, get results, update status
  - Public: list candidates/founders

## 🎨 Design System

### Colors
- **Primary:** Purple (#7c3aed)
- **Secondary:** Pink (#ec4899)
- **Background:** Dark Slate (#0f172a)
- **Text:** Light Slate (#e2e8f0)

### Styling
- TailwindCSS for utility-first CSS
- Dark mode by default
- Gradient accents for hero elements
- Smooth transitions and hover states
- Responsive design (mobile-first)

## 🔑 Key Components

### API Client (`src/lib/api.ts`)
- Singleton pattern for single API instance
- Automatic token management
- Request/response handling
- Error catching
- Typed responses using `@/types/api`

### Auth Management (`src/lib/auth.ts`)
- Non-React auth state management
- LocalStorage persistence
- Subscription-based state updates
- Works with Next.js server/client components

### Auth Hook (`src/hooks/useAuth.ts`)
- React hook to subscribe to auth state
- Returns current user, token, loading status
- Works in client components

## 🧪 Testing Flow

### Complete MVP Flow:

1. **Landing Page**
   - Open http://localhost:3001
   - Click "Busco sumarme a una startup" or "Busco gente para mi startup"

2. **Register as Talent**
   - Email: `talent@example.com`
   - Username: `talent_user`
   - Password: `SecurePass123`
   - User type: Talent
   - Click "Create Account"

3. **Create Candidate Profile**
   - Bio: "Senior developer with 5 years of experience in React and Node.js"
   - Experience: 5 years
   - Skills: React, Node.js, TypeScript, Python
   - Technologies: React, TypeScript, PostgreSQL
   - GitHub: https://github.com/example
   - LinkedIn: https://linkedin.com/in/example
   - Click "Create Profile"

4. **Login as Founder** (new browser tab or logout)
   - Register new account:
     - Email: `founder@example.com`
     - Username: `founder_user`
     - Password: `SecurePass123`
     - User type: Founder

5. **Create Startup Profile**
   - Name: "TechAI Inc"
   - Description: "Building AI solutions for enterprise customers worldwide"
   - Stack: React, Node.js, TypeScript, PostgreSQL, Python
   - Culture: Innovation, Collaboration, Transparency
   - Click "Create Startup Profile"

6. **Run Matching**
   - Click "🔍 Buscar matches con agentes IA"
   - See matches with scores, summaries, and reasons
   - Click "✓ Interested" or "✕ Pass"

## 🔧 Development

### Install Dependencies (if not already done)
```bash
cd apps/web
npm install
```

### Start Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
npm start
```

### Type Check
```bash
npm run type-check
```

## 📝 Environment Variables

Located in `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=AgentLink
```

Change `NEXT_PUBLIC_API_URL` for production deployment.

## 🐛 Troubleshooting

### Backend not responding
- Check if backend is running: `npm run dev` in `services/api/`
- Verify it's running on http://localhost:3000
- Check `.env` in backend has Supabase credentials

### Login/Register fails
- Check browser console for errors
- Verify backend is responding with `/health` endpoint
- Ensure token storage is enabled (localStorage)

### Profiles not saving
- Check backend logs for validation errors
- Verify all required fields are filled correctly
- Bio must be min 10 characters
- Startup description must be min 20 characters

### Matching shows no results
- Ensure both talent and founder profiles exist
- Run matching from founder dashboard
- Check backend logs for matching algorithm issues

## 🎯 Next Steps for Enhancement

1. **Match Details Page** (`/matches/:id`)
   - Full candidate/startup information
   - Contact/messaging interface

2. **Profile Editing**
   - Update candidate/startup profiles
   - Image uploads (future)

3. **Chat Integration**
   - Real-time messaging between matches
   - Notification system

4. **Advanced Features**
   - Match history
   - Saved candidates/startups
   - Search and filtering
   - User reviews/ratings

## 📚 API Reference

For complete API documentation, see:
`services/api/FRONTEND_API_GUIDE.md`

Key endpoints:
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /profile/candidate` - Create candidate profile
- `POST /profile/startup` - Create startup profile
- `POST /match/run` - Run AI matching
- `GET /match/results` - Get match results
- `PUT /match/status` - Update match status

## 🚀 Deployment Notes

### Frontend Deployment (Vercel)
```bash
# Set environment variables in Vercel dashboard:
NEXT_PUBLIC_API_URL=https://api.agentlink.com

# Deploy
git push origin main  # Auto-deploys on Vercel
```

### Backend Deployment
- Railway/Render recommended for Node.js
- Ensure Supabase credentials are in production `.env`
- Update CORS_ORIGIN to match frontend domain

---

**Status:** MVP Frontend ✅ Complete and Ready for Testing
**Last Updated:** 2026-05-09
