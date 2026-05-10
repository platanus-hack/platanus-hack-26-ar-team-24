-- knowAhuman - Database Schema
-- AI-powered platform for connecting talent with startups
-- Run this script in Supabase SQL Editor

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) NOT NULL,
  user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('talent', 'founder')),
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create candidate_profiles table (for talent users)
CREATE TABLE IF NOT EXISTS public.candidate_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  bio TEXT NOT NULL,
  skills TEXT[] NOT NULL,
  experience_years INTEGER NOT NULL,
  technologies TEXT[] DEFAULT '{}',
  github_url VARCHAR(255),
  linkedin_url VARCHAR(255),
  ai_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create startup_profiles table (for founder users)
CREATE TABLE IF NOT EXISTS public.startup_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  stack TEXT[] NOT NULL,
  culture_values TEXT[] DEFAULT '{}',
  recruiter_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create opportunities table (roles/positions at startups)
CREATE TABLE IF NOT EXISTS public.opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID NOT NULL REFERENCES public.startup_profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  required_skills TEXT[] NOT NULL,
  required_experience INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create matches table (compatibility results)
CREATE TABLE IF NOT EXISTS public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES public.candidate_profiles(id) ON DELETE CASCADE,
  startup_id UUID NOT NULL REFERENCES public.startup_profiles(id) ON DELETE CASCADE,
  match_score DECIMAL(3,2) NOT NULL,
  summary TEXT NOT NULL,
  reasons TEXT[] NOT NULL DEFAULT '{}',
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(candidate_id, startup_id)
);

-- Create ai_agents table
CREATE TABLE IF NOT EXISTS public.ai_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  agent_type VARCHAR(20) NOT NULL CHECK (agent_type IN ('candidate', 'recruiter')),
  profile_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create github_profiles table
CREATE TABLE IF NOT EXISTS public.github_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  github_username VARCHAR(255) NOT NULL,
  repositories INTEGER DEFAULT 0,
  stars INTEGER DEFAULT 0,
  languages TEXT[] DEFAULT '{}',
  analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create linkedin_profiles table
CREATE TABLE IF NOT EXISTS public.linkedin_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  linkedin_username VARCHAR(255) NOT NULL,
  headline VARCHAR(255),
  company VARCHAR(255),
  analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_user_type ON public.users(user_type);
CREATE INDEX IF NOT EXISTS idx_candidate_profiles_user_id ON public.candidate_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_startup_profiles_user_id ON public.startup_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_startup_id ON public.opportunities(startup_id);
CREATE INDEX IF NOT EXISTS idx_matches_candidate_id ON public.matches(candidate_id);
CREATE INDEX IF NOT EXISTS idx_matches_startup_id ON public.matches(startup_id);
CREATE INDEX IF NOT EXISTS idx_matches_created_at ON public.matches(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_agents_owner_id ON public.ai_agents(owner_id);
CREATE INDEX IF NOT EXISTS idx_github_profiles_user_id ON public.github_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_linkedin_profiles_user_id ON public.linkedin_profiles(user_id);

-- Enable RLS (Row Level Security)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.startup_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.github_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.linkedin_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can read own data"
  ON public.users
  FOR SELECT
  USING (auth.uid()::text = id::text);

-- RLS Policies for candidate_profiles
CREATE POLICY "Users can read candidate profiles"
  ON public.candidate_profiles
  FOR SELECT
  USING (true);

CREATE POLICY "Users can manage own candidate profile"
  ON public.candidate_profiles
  FOR ALL
  USING (auth.uid()::text = user_id::text);

-- RLS Policies for startup_profiles
CREATE POLICY "Users can read startup profiles"
  ON public.startup_profiles
  FOR SELECT
  USING (true);

CREATE POLICY "Users can manage own startup profile"
  ON public.startup_profiles
  FOR ALL
  USING (auth.uid()::text = user_id::text);

-- RLS Policies for opportunities
CREATE POLICY "Users can read opportunities"
  ON public.opportunities
  FOR SELECT
  USING (true);

CREATE POLICY "Founders can manage own opportunities"
  ON public.opportunities
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.startup_profiles
      WHERE startup_profiles.id = opportunities.startup_id
      AND startup_profiles.user_id = auth.uid()::text
    )
  );

-- RLS Policies for matches
CREATE POLICY "Users can read their matches"
  ON public.matches
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.candidate_profiles
      WHERE candidate_profiles.id = matches.candidate_id
      AND candidate_profiles.user_id = auth.uid()::text
    )
    OR
    EXISTS (
      SELECT 1 FROM public.startup_profiles
      WHERE startup_profiles.id = matches.startup_id
      AND startup_profiles.user_id = auth.uid()::text
    )
  );

CREATE POLICY "System can create matches"
  ON public.matches
  FOR INSERT
  WITH CHECK (true);
