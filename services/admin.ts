import { hasSupabaseConfig, supabase } from './supabase';
import type { AppRole } from '../types/order';

export type ManagedUserInput = {
  role: AppRole;
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  companyName?: string;
  country?: string;
};

type ManagedUserResponse = {
  userId: string;
  role: AppRole;
  email: string;
};

export async function createManagedUser(input: ManagedUserInput): Promise<ManagedUserResponse> {
  if (!hasSupabaseConfig || !supabase) {
    return {
      userId: `demo-${Date.now()}`,
      role: input.role,
      email: input.email,
    };
  }

  const { data, error } = await supabase.functions.invoke('admin-create-user', {
    body: input,
  });

  if (error) {
    throw error;
  }

  if (!data?.userId) {
    throw new Error('User creation did not return a valid response.');
  }

  return data as ManagedUserResponse;
}
