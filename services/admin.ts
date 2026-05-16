import { hasSupabaseConfig, supabase } from './supabase';
import type { AppRole } from '../types/order';

export type ManagedUser = {
  id: string;
  userId: string;
  role: AppRole;
  fullName: string;
  email: string;
  phone?: string;
  companyName?: string;
  country?: string;
  isActive: boolean;
  createdAt?: string;
};

export type ManagedUserInput = {
  role: AppRole;
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  companyName?: string;
  country?: string;
};

export type ManagedUserUpdateInput = {
  userId: string;
  role: AppRole;
  fullName: string;
  email: string;
  phone?: string;
  companyName?: string;
  country?: string;
  password?: string;
  isActive: boolean;
};

type ManagedUserResponse = {
  userId: string;
  role: AppRole;
  email: string;
};

let demoUsers: ManagedUser[] = [
  {
    id: 'customer-1',
    userId: 'demo-user',
    role: 'customer',
    fullName: 'Ava Sterling',
    email: 'ava.sterling@et-demo.com',
    phone: '+1 212 555 0149',
    companyName: 'Sterling Atelier',
    country: 'United States',
    isActive: true,
  },
  {
    id: 'admin-1',
    userId: 'demo-admin',
    role: 'admin',
    fullName: 'Shan Verma',
    email: 'admin@et-demo.com',
    phone: '+91 99999 11111',
    isActive: true,
  },
];

function normalizeManagedUsers(customers: any[] = [], admins: any[] = []): ManagedUser[] {
  const customerRows = customers.map(
    (entry: any) =>
      ({
        id: entry.id,
        userId: entry.user_id,
        role: 'customer',
        fullName: entry.full_name,
        email: entry.email,
        phone: entry.phone ?? undefined,
        companyName: entry.company_name ?? undefined,
        country: entry.country ?? undefined,
        isActive: entry.is_active,
        createdAt: entry.created_at ?? undefined,
      }) satisfies ManagedUser,
  );

  const adminRows = admins.map(
    (entry: any) =>
      ({
        id: entry.id,
        userId: entry.user_id,
        role: 'admin',
        fullName: entry.full_name,
        email: entry.email,
        phone: entry.phone ?? undefined,
        isActive: entry.is_active,
        createdAt: entry.created_at ?? undefined,
      }) satisfies ManagedUser,
  );

  return [...customerRows, ...adminRows].sort((a, b) => {
    const activeComparison = Number(b.isActive) - Number(a.isActive);
    if (activeComparison !== 0) {
      return activeComparison;
    }

    return a.fullName.localeCompare(b.fullName);
  });
}

async function invokeAdminMutation(body: Record<string, unknown>) {
  if (!hasSupabaseConfig || !supabase) {
    return null;
  }

  const { data, error } = await supabase.functions.invoke('admin-create-user', {
    body,
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function fetchManagedUsers(): Promise<ManagedUser[]> {
  if (!hasSupabaseConfig || !supabase) {
    return structuredClone(demoUsers);
  }

  const [
    { data: customers, error: customersError },
    { data: admins, error: adminsError },
  ] = await Promise.all([
    supabase
      .from('customers')
      .select('id, user_id, full_name, email, phone, company_name, country, is_active, created_at'),
    supabase
      .from('admins')
      .select('id, user_id, full_name, email, phone, is_active, created_at'),
  ]);

  if (customersError) {
    throw customersError;
  }

  if (adminsError) {
    throw adminsError;
  }

  return normalizeManagedUsers(customers ?? [], admins ?? []);
}

export async function createManagedUser(input: ManagedUserInput): Promise<ManagedUserResponse> {
  if (!hasSupabaseConfig || !supabase) {
    const newUser: ManagedUser = {
      id: `demo-row-${Date.now()}`,
      userId: `demo-${Date.now()}`,
      role: input.role,
      fullName: input.fullName,
      email: input.email,
      phone: input.phone,
      companyName: input.companyName,
      country: input.country,
      isActive: true,
    };
    demoUsers = [newUser, ...demoUsers];
    return {
      userId: newUser.userId,
      role: newUser.role,
      email: newUser.email,
    };
  }

  const data = await invokeAdminMutation({
    action: 'create',
    ...input,
  });

  if (!data?.userId) {
    throw new Error('User creation did not return a valid response.');
  }

  return data as ManagedUserResponse;
}

export async function updateManagedUser(input: ManagedUserUpdateInput): Promise<void> {
  if (!hasSupabaseConfig || !supabase) {
    demoUsers = demoUsers.map((entry) =>
      entry.userId === input.userId
        ? {
            ...entry,
            role: input.role,
            fullName: input.fullName,
            email: input.email,
            phone: input.phone,
            companyName: input.role === 'customer' ? input.companyName : undefined,
            country: input.role === 'customer' ? input.country : undefined,
            isActive: input.isActive,
          }
        : entry,
    );
    return;
  }

  await invokeAdminMutation({
    action: 'update',
    ...input,
  });
}

export async function setManagedUserActive(userId: string, isActive: boolean): Promise<void> {
  if (!hasSupabaseConfig || !supabase) {
    demoUsers = demoUsers.map((entry) => (entry.userId === userId ? { ...entry, isActive } : entry));
    return;
  }

  await invokeAdminMutation({
    action: 'set_active',
    userId,
    isActive,
  });
}

export async function deleteManagedUser(userId: string): Promise<void> {
  if (!hasSupabaseConfig || !supabase) {
    demoUsers = demoUsers.filter((entry) => entry.userId !== userId);
    return;
  }

  await invokeAdminMutation({
    action: 'delete',
    userId,
  });
}
