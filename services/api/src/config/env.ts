import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',

  jwt: {
    secret: process.env.JWT_SECRET || 'dev_secret_key_change_in_production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  supabase: {
    url: process.env.SUPABASE_URL || '',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
    serviceKey: process.env.SUPABASE_SERVICE_KEY || '',
  },

  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
  },

  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY || '',
  },

  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
  },

  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },

  isDevelopment: process.env.NODE_ENV !== 'production',
  isProduction: process.env.NODE_ENV === 'production',
};

export const validateConfig = () => {
  const required = [
    'JWT_SECRET',
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0 && config.isProduction) {
    throw new Error(`Missing required env variables: ${missing.join(', ')}`);
  }
};
