import type { Session } from '@supabase/supabase-js';

import { mockAdminProfile, mockCustomerProfile } from './mockData';
import { hasSupabaseConfig, supabase } from './supabase';
import type { AppRole, UserProfile } from '../types/order';

export async function getCurrentSession(): Promise<Session | null> {
  if (!hasSupabaseConfig || !supabase) {
    return {
      access_token: 'demo-token',
      refresh_token: 'demo-refresh',
      expires_in: 3600,
      token_type: 'bearer',
      user: {
        id: mockCustomerProfile.userId,
        app_metadata: {},
        user_metadata: { full_name: mockCustomerProfile.fullName },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      },
    } as Session;
  }

  const { data, error } = await supabase.auth.getSession();
  if (error) {
    throw error;
  }

  return data.session;
}

export async function signIn(email: string, password: string, variant: AppRole) {
  if (!hasSupabaseConfig || !supabase) {
    if (
      variant === 'customer' &&
      email.toLowerCase() === mockCustomerProfile.email.toLowerCase() &&
      password === 'demo1234'
    ) {
      return getCurrentSession();
    }

    if (
      variant === 'admin' &&
      email.toLowerCase() === mockAdminProfile.email.toLowerCase() &&
      password === 'admin1234'
    ) {
      const baseSession = await getCurrentSession();
      return {
        ...baseSession,
        user: {
          ...baseSession!.user,
          id: mockAdminProfile.userId,
          app_metadata: {},
          user_metadata: { full_name: mockAdminProfile.fullName },
        },
      } as Session;
    }

    throw new Error(
      variant === 'customer'
        ? 'Use demo customer credentials: ava.sterling@et-demo.com / demo1234'
        : 'Use demo admin credentials: admin@et-demo.com / admin1234',
    );
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    throw error;
  }

  return data.session;
}

export async function signOut() {
  if (!hasSupabaseConfig || !supabase) {
    return;
  }

  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
}

export async function requestPasswordReset(email: string) {
  if (!hasSupabaseConfig || !supabase) {
    return;
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) {
    throw error;
  }
}

export async function fetchProfile(expectedRole?: AppRole): Promise<UserProfile> {
  if (!hasSupabaseConfig || !supabase) {
    return expectedRole === 'admin' ? mockAdminProfile : mockCustomerProfile;
  }

  const session = await getCurrentSession();
  const userId = session?.user.id;
  if (!userId) {
    throw new Error('No active session found.');
  }

  const [
    { data: adminData, error: adminLookupError },
    { data: customerData, error: customerLookupError },
  ] = await Promise.all([
    supabase
      .from('admins')
      .select('id, user_id, full_name, email, phone, is_active')
      .eq('user_id', userId)
      .maybeSingle(),
    supabase
      .from('customers')
      .select('id, user_id, full_name, email, phone, company_name, country, is_active')
      .eq('user_id', userId)
      .maybeSingle(),
  ]);

  if (adminLookupError) {
    throw adminLookupError;
  }

  if (customerLookupError) {
    throw customerLookupError;
  }

  if (adminData && customerData) {
    throw new Error('This auth user is linked to both admin and customer profiles. Resolve the data conflict first.');
  }

  if (adminData) {
    if (expectedRole && expectedRole !== 'admin') {
      throw new Error('This account is registered as an admin, not a customer.');
    }

    return {
      id: adminData.id,
      userId: adminData.user_id,
      fullName: adminData.full_name,
      email: adminData.email,
      role: 'admin',
      phone: adminData.phone ?? undefined,
      isActive: adminData.is_active,
      companyName: 'Expose Trendze',
    };
  }

  if (!customerData) {
    throw new Error(
      expectedRole === 'admin'
        ? 'This auth user is not linked in the admins table.'
        : 'This auth user is not linked in the customers table.',
    );
  }

  if (expectedRole && expectedRole !== 'customer') {
    throw new Error('This account is registered as a customer, not an admin.');
  }

  return {
    id: customerData.id,
    userId: customerData.user_id,
    fullName: customerData.full_name,
    email: customerData.email,
    role: 'customer',
    phone: customerData.phone ?? undefined,
    companyName: customerData.company_name ?? undefined,
    country: customerData.country ?? undefined,
    isActive: customerData.is_active,
  };
}
