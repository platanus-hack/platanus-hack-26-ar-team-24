import { supabaseClient } from '../config/supabase.js';
import { User, HttpError } from '../types/index.js';

export const userService = {
  async getUserById(id: string): Promise<User> {
    const { data, error } = await supabaseClient
      .from('users')
      .select('id, email, username, user_type, created_at, updated_at')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new HttpError('User not found', 404);
    }

    return data;
  },

  async getUserProfile(id: string): Promise<User> {
    return this.getUserById(id);
  },

  async updateUserProfile(
    id: string,
    updates: Partial<User>
  ): Promise<User> {
    const { data, error } = await supabaseClient
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw new HttpError('Failed to update user', 500);
    }

    return data;
  },

  async getAllCandidates(): Promise<User[]> {
    const { data, error } = await supabaseClient
      .from('users')
      .select('*')
      .eq('user_type', 'talent');

    if (error) {
      throw new HttpError('Failed to fetch candidates', 500);
    }

    return data || [];
  },

  async getAllFounders(): Promise<User[]> {
    const { data, error } = await supabaseClient
      .from('users')
      .select('*')
      .eq('user_type', 'founder');

    if (error) {
      throw new HttpError('Failed to fetch founders', 500);
    }

    return data || [];
  },
};
