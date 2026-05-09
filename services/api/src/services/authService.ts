import { v4 as uuidv4 } from 'uuid';
import { hashPassword, comparePassword } from '../utils/bcrypt.js';
import { generateToken } from '../utils/jwt.js';
import { supabaseClient, supabaseAdmin } from '../config/supabase.js';
import { User, AuthResponse, HttpError, UserType } from '../types/index.js';
import { RegisterInput, LoginInput } from '../utils/validators.js';

export const authService = {
  async register(input: RegisterInput): Promise<AuthResponse> {
    const { email, password, username, user_type } = input;

    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      throw new HttpError('Email already registered', 400);
    }

    const hashedPassword = await hashPassword(password);
    const userId = uuidv4();

    const { error: insertError } = await supabaseAdmin.from('users').insert({
      id: userId,
      email,
      username,
      user_type,
      password_hash: hashedPassword,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (insertError) {
      throw new HttpError('Failed to create user', 500);
    }

    const user: User = {
      id: userId,
      email,
      username,
      user_type,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const token = generateToken({
      id: userId,
      email,
      user_type,
    });

    return { token, user };
  },

  async login(input: LoginInput): Promise<AuthResponse> {
    const { email, password } = input;

    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !data) {
      throw new HttpError('Invalid credentials', 401);
    }

    const passwordMatch = await comparePassword(password, data.password_hash);

    if (!passwordMatch) {
      throw new HttpError('Invalid credentials', 401);
    }

    const user: User = {
      id: data.id,
      email: data.email,
      username: data.username,
      user_type: data.user_type as UserType,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };

    const token = generateToken({
      id: data.id,
      email: data.email,
      user_type: data.user_type,
    });

    return { token, user };
  },
};
