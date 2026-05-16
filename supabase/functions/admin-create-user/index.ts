import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type Role = 'customer' | 'admin';

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const authHeader = request.headers.get('Authorization');

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
      throw new Error('Supabase environment variables are not configured for this function.');
    }

    if (!authHeader) {
      return jsonResponse({ error: 'Missing authorization header.' }, 401);
    }

    const callerClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });

    const {
      data: { user: caller },
      error: callerError,
    } = await callerClient.auth.getUser();

    if (callerError || !caller) {
      return jsonResponse({ error: 'Unable to verify the current admin session.' }, 401);
    }

    const { data: callerAdmin, error: callerAdminError } = await callerClient
      .from('admins')
      .select('id, is_active')
      .eq('user_id', caller.id)
      .maybeSingle();

    if (callerAdminError) {
      return jsonResponse({ error: callerAdminError.message }, 400);
    }

    if (!callerAdmin?.is_active) {
      return jsonResponse({ error: 'Only active admins can manage accounts.' }, 403);
    }

    const body = await safeParseJson(request);
    const action = String(body?.action ?? 'create');
    const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey);

    if (action === 'create') {
      return await handleCreate(adminClient, body);
    }

    if (action === 'update') {
      return await handleUpdate(adminClient, body, caller.id);
    }

    if (action === 'set_active') {
      return await handleSetActive(adminClient, body, caller.id);
    }

    if (action === 'delete') {
      return await handleDelete(adminClient, body, caller.id);
    }

    return jsonResponse({ error: `Unsupported action: ${action}` }, 400);
  } catch (error) {
    return jsonResponse(
      {
        error: error instanceof Error ? error.message : 'Unexpected error.',
      },
      500,
    );
  }
});

async function handleCreate(adminClient: ReturnType<typeof createClient>, body: Record<string, unknown>) {
  const role = normalizeRole(body.role);
  const fullName = String(body.fullName ?? '').trim();
  const email = String(body.email ?? '').trim().toLowerCase();
  const password = String(body.password ?? '');
  const phone = normalizeOptional(body.phone);
  const companyName = normalizeOptional(body.companyName);
  const country = normalizeOptional(body.country);

  const validationError = validateUserInput({ role, fullName, email, password, companyName, requirePassword: true });
  if (validationError) {
    return jsonResponse({ error: validationError }, 400);
  }

  const { data: createdUserData, error: createUserError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: { role },
    user_metadata: {
      role,
      full_name: fullName,
      phone,
      company_name: companyName,
      country,
    },
  });

  if (createUserError || !createdUserData.user) {
    return jsonResponse({ error: createUserError?.message ?? 'Unable to create the auth user.' }, 400);
  }

  const userId = createdUserData.user.id;

  try {
    await upsertProfile(adminClient, {
      userId,
      role,
      fullName,
      email,
      phone,
      companyName,
      country,
      isActive: true,
    });
  } catch (error) {
    await adminClient.auth.admin.deleteUser(userId);
    return jsonResponse(
      {
        error: error instanceof Error ? error.message : 'Unable to create the profile record.',
      },
      400,
    );
  }

  return jsonResponse({
    userId,
    role,
    email,
  });
}

async function handleUpdate(
  adminClient: ReturnType<typeof createClient>,
  body: Record<string, unknown>,
  callerUserId: string,
) {
  const userId = String(body.userId ?? '').trim();
  const role = normalizeRole(body.role);
  const fullName = String(body.fullName ?? '').trim();
  const email = String(body.email ?? '').trim().toLowerCase();
  const password = normalizeOptional(body.password);
  const phone = normalizeOptional(body.phone);
  const companyName = normalizeOptional(body.companyName);
  const country = normalizeOptional(body.country);
  const isActive = body.isActive !== false;

  if (!userId) {
    return jsonResponse({ error: 'User id is required.' }, 400);
  }

  const currentRole = await resolveUserRole(adminClient, userId);
  if (!currentRole) {
    return jsonResponse({ error: 'User profile not found.' }, 404);
  }

  const validationError = validateUserInput({
    role,
    fullName,
    email,
    password,
    companyName,
    requirePassword: false,
  });
  if (validationError) {
    return jsonResponse({ error: validationError }, 400);
  }

  const activeAdminCount = await countActiveAdmins(adminClient);
  const isCurrentlyActiveAdmin = currentRole === 'admin' && (await isActiveAdmin(adminClient, userId));
  const removingAdminAccess = currentRole === 'admin' && (!isActive || role !== 'admin');

  if (removingAdminAccess && isCurrentlyActiveAdmin && activeAdminCount <= 1) {
    return jsonResponse({ error: 'The last active admin account cannot be disabled or demoted.' }, 400);
  }

  if (callerUserId === userId && role !== 'admin') {
    return jsonResponse({ error: 'You cannot remove your own admin access.' }, 400);
  }

  const updatePayload: Record<string, unknown> = {
    email,
    app_metadata: { role },
    user_metadata: {
      role,
      full_name: fullName,
      phone,
      company_name: companyName,
      country,
    },
  };

  if (password) {
    updatePayload.password = password;
  }

  const { error: updateUserError } = await adminClient.auth.admin.updateUserById(userId, updatePayload);

  if (updateUserError) {
    return jsonResponse({ error: updateUserError.message }, 400);
  }

  try {
    await upsertProfile(adminClient, {
      userId,
      role,
      fullName,
      email,
      phone,
      companyName,
      country,
      isActive,
    });
  } catch (error) {
    return jsonResponse({ error: error instanceof Error ? error.message : 'Unable to update profile.' }, 400);
  }

  return jsonResponse({ userId, role, email });
}

async function handleSetActive(
  adminClient: ReturnType<typeof createClient>,
  body: Record<string, unknown>,
  callerUserId: string,
) {
  const userId = String(body.userId ?? '').trim();
  const isActive = Boolean(body.isActive);

  if (!userId) {
    return jsonResponse({ error: 'User id is required.' }, 400);
  }

  const role = await resolveUserRole(adminClient, userId);
  if (!role) {
    return jsonResponse({ error: 'User profile not found.' }, 404);
  }

  if (!isActive && role === 'admin') {
    const activeAdminCount = await countActiveAdmins(adminClient);
    const isTargetActiveAdmin = await isActiveAdmin(adminClient, userId);

    if (isTargetActiveAdmin && activeAdminCount <= 1) {
      return jsonResponse({ error: 'The last active admin account cannot be disabled.' }, 400);
    }

    if (callerUserId === userId) {
      return jsonResponse({ error: 'You cannot disable your own admin account.' }, 400);
    }
  }

  const table = role === 'admin' ? 'admins' : 'customers';
  const { error } = await adminClient
    .from(table)
    .update({
      is_active: isActive,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);

  if (error) {
    return jsonResponse({ error: error.message }, 400);
  }

  return jsonResponse({ userId, isActive });
}

async function handleDelete(
  adminClient: ReturnType<typeof createClient>,
  body: Record<string, unknown>,
  callerUserId: string,
) {
  const userId = String(body.userId ?? '').trim();

  if (!userId) {
    return jsonResponse({ error: 'User id is required.' }, 400);
  }

  const role = await resolveUserRole(adminClient, userId);
  if (!role) {
    return jsonResponse({ error: 'User profile not found.' }, 404);
  }

  if (role === 'admin') {
    const activeAdminCount = await countActiveAdmins(adminClient);
    const isTargetActiveAdmin = await isActiveAdmin(adminClient, userId);

    if (isTargetActiveAdmin && activeAdminCount <= 1) {
      return jsonResponse({ error: 'The last active admin account cannot be deleted.' }, 400);
    }

    if (callerUserId === userId) {
      return jsonResponse({ error: 'You cannot delete your own admin account.' }, 400);
    }
  }

  const { error: deleteAuthError } = await adminClient.auth.admin.deleteUser(userId);
  if (deleteAuthError) {
    return jsonResponse({ error: deleteAuthError.message }, 400);
  }

  return jsonResponse({ userId });
}

async function upsertProfile(
  adminClient: ReturnType<typeof createClient>,
  input: {
    userId: string;
    role: Role;
    fullName: string;
    email: string;
    phone: string | null;
    companyName: string | null;
    country: string | null;
    isActive: boolean;
  },
) {
  const now = new Date().toISOString();

  if (input.role === 'admin') {
    await adminClient.from('customers').delete().eq('user_id', input.userId);
    const { error } = await adminClient.from('admins').upsert(
      {
        user_id: input.userId,
        full_name: input.fullName,
        email: input.email,
        phone: input.phone,
        is_active: input.isActive,
        updated_at: now,
      },
      { onConflict: 'user_id' },
    );

    if (error) {
      throw new Error(error.message);
    }

    return;
  }

  await adminClient.from('admins').delete().eq('user_id', input.userId);
  const { error } = await adminClient.from('customers').upsert(
    {
      user_id: input.userId,
      full_name: input.fullName,
      email: input.email,
      phone: input.phone,
      company_name: input.companyName,
      country: input.country,
      is_active: input.isActive,
      updated_at: now,
    },
    { onConflict: 'user_id' },
  );

  if (error) {
    throw new Error(error.message);
  }
}

async function resolveUserRole(adminClient: ReturnType<typeof createClient>, userId: string): Promise<Role | null> {
  const [{ data: adminRow }, { data: customerRow }] = await Promise.all([
    adminClient.from('admins').select('user_id').eq('user_id', userId).maybeSingle(),
    adminClient.from('customers').select('user_id').eq('user_id', userId).maybeSingle(),
  ]);

  if (adminRow) {
    return 'admin';
  }

  if (customerRow) {
    return 'customer';
  }

  return null;
}

async function countActiveAdmins(adminClient: ReturnType<typeof createClient>) {
  const { count, error } = await adminClient
    .from('admins')
    .select('id', { count: 'exact', head: true })
    .eq('is_active', true);

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}

async function isActiveAdmin(adminClient: ReturnType<typeof createClient>, userId: string) {
  const { data, error } = await adminClient
    .from('admins')
    .select('user_id')
    .eq('user_id', userId)
    .eq('is_active', true)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return Boolean(data);
}

function validateUserInput(input: {
  role: Role;
  fullName: string;
  email: string;
  password: string | null;
  companyName: string | null;
  requirePassword: boolean;
}) {
  if (!input.fullName || !input.email) {
    return 'Full name and email are required.';
  }

  if (input.requirePassword && !input.password) {
    return 'Password is required.';
  }

  if (input.password && input.password.length < 6) {
    return 'Password must be at least 6 characters long.';
  }

  if (input.role === 'customer' && !input.companyName) {
    return 'Company name is required for customer accounts.';
  }

  return null;
}

function normalizeRole(value: unknown): Role {
  return value === 'admin' ? 'admin' : 'customer';
}

function normalizeOptional(value: unknown) {
  const normalized = String(value ?? '').trim();
  return normalized ? normalized : null;
}

async function safeParseJson(request: Request): Promise<Record<string, unknown>> {
  try {
    const parsed = await request.json();
    if (parsed && typeof parsed === 'object') {
      return parsed as Record<string, unknown>;
    }
    return {};
  } catch {
    return {};
  }
}

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}
