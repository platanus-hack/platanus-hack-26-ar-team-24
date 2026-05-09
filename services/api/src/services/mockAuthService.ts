import { v4 as uuidv4 } from 'uuid';
import { hashPassword, comparePassword } from '../utils/bcrypt.js';
import { generateToken } from '../utils/jwt.js';
import { User, AuthResponse, HttpError, UserType } from '../types/index.js';
import { RegisterInput, LoginInput } from '../utils/validators.js';

// In-memory storage for demo purposes
const mockUsers: Map<string, any> = new Map();

export const mockAuthService = {
  async register(input: RegisterInput): Promise<AuthResponse> {
    const { email, password, username, user_type } = input;

    // Check if email exists
    for (const user of mockUsers.values()) {
      if (user.email === email) {
        throw new HttpError('Email already registered', 400);
      }
    }

    const hashedPassword = await hashPassword(password);
    const userId = uuidv4();
    const now = new Date().toISOString();

    const user: any = {
      id: userId,
      email,
      username,
      user_type,
      password_hash: hashedPassword,
      created_at: now,
      updated_at: now,
    };

    // Store in memory
    mockUsers.set(userId, user);
    console.log(`✅ Mock user created: ${email} (${user_type})`);

    const token = generateToken({
      id: userId,
      email,
      user_type,
    });

    const returnUser: User = {
      id: userId,
      email,
      username,
      user_type,
      created_at: now,
      updated_at: now,
    };

    return { token, user: returnUser };
  },

  async login(input: LoginInput): Promise<AuthResponse> {
    const { email, password } = input;

    let foundUser = null;
    for (const user of mockUsers.values()) {
      if (user.email === email) {
        foundUser = user;
        break;
      }
    }

    if (!foundUser) {
      throw new HttpError('Invalid credentials', 401);
    }

    const passwordMatch = await comparePassword(password, foundUser.password_hash);

    if (!passwordMatch) {
      throw new HttpError('Invalid credentials', 401);
    }

    const token = generateToken({
      id: foundUser.id,
      email: foundUser.email,
      user_type: foundUser.user_type,
    });

    const user: User = {
      id: foundUser.id,
      email: foundUser.email,
      username: foundUser.username,
      user_type: foundUser.user_type as UserType,
      created_at: foundUser.created_at,
      updated_at: foundUser.updated_at,
    };

    return { token, user };
  },
};
