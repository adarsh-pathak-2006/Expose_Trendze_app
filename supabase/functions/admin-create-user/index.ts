import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
      return jsonResponse({ error: 'Only active admins can create accounts.' }, 403);
    }

    const body = await request.json();
    const role = body?.role === 'admin' ? 'admin' : 'customer';
    const fullName = String(body?.fullName ?? '').trim();
    const email = String(body?.email ?? '').trim().toLowerCase();
    const password = String(body?.password ?? '');
    const phone = String(body?.phone ?? '').trim() || null;
    const companyName = String(body?.companyName ?? '').trim() || null;
    const country = String(body?.country ?? '').trim() || null;

    if (!fullName || !email || !password) {
      return jsonResponse({ error: 'Full name, email, and password are required.' }, 400);
    }

    if (password.length < 6) {
      return jsonResponse({ error: 'Password must be at least 6 characters long.' }, 400);
    }

    if (role === 'customer' && !companyName) {
      return jsonResponse({ error: 'Company name is required for customer accounts.' }, 400);
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey);

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
      if (role === 'admin') {
        const { error: profileError } = await adminClient.from('admins').upsert(
          {
            user_id: userId,
            full_name: fullName,
            email,
            phone,
            is_active: true,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' },
        );

        if (profileError) {
          throw new Error(profileError.message);
        }
      } else {
        const { error: profileError } = await adminClient.from('customers').upsert(
          {
            user_id: userId,
            full_name: fullName,
            email,
            phone,
            company_name: companyName,
            country,
            is_active: true,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' },
        );

        if (profileError) {
          throw new Error(profileError.message);
        }
      }
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
  } catch (error) {
    return jsonResponse(
      {
        error: error instanceof Error ? error.message : 'Unexpected error.',
      },
      500,
    );
  }
});

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}
