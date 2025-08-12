import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isAdminServer } from '@/lib/permissions/server-checks';
import { z } from 'zod';

// Validation schema for user creation
const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  full_name: z.string().min(1, 'Full name is required'),
  display_name: z.string().optional(),
  role: z.enum(['admin', 'staff', 'account_owner', 'user']),
  account_id: z.string().uuid().optional().nullable(), // Required for account_owner and user roles
  auto_confirm_email: z.boolean().default(true),
  send_welcome_email: z.boolean().default(false),
});

export async function OPTIONS() {
  return new Response(null, { status: 200 });
}

export async function POST(req: NextRequest) {
  console.log('🔍 [API/Users/Create] Creating new user...');
  console.log('🔍 [API/Users/Create] Request received at:', new Date().toISOString());
  
  const supabase = await createSupabaseServerClient();
  
  // Check authentication
  const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();
  if (authError || !currentUser) {
    console.log('❌ [API/Users/Create] Authentication failed');
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  console.log('🔍 [API/Users/Create] Authenticated user:', currentUser.email);

  // Check if user is admin
  const isAdmin = await isAdminServer(currentUser.id);
  if (!isAdmin) {
    console.log('❌ [API/Users/Create] Access denied - user is not admin');
    return NextResponse.json({ error: 'Access denied. Admin role required.' }, { status: 403 });
  }

  try {
    // Parse and validate request body
    const body = await req.json();
    
    // Clean up empty strings before validation
    const cleanedBody = {
      ...body,
      display_name: body.display_name || undefined,
      account_id: body.account_id || undefined,
    };
    
    const validatedData = createUserSchema.parse(cleanedBody);

    console.log('🔍 [API/Users/Create] Creating user with email:', validatedData.email);

    // Validate role-specific requirements
    if ((validatedData.role === 'account_owner' || validatedData.role === 'user') && !validatedData.account_id) {
      return NextResponse.json({ 
        error: 'Account ID is required for account_owner and user roles' 
      }, { status: 400 });
    }

    // Use admin client to create user
    let adminClient;
    try {
      adminClient = createAdminClient();
      console.log('✅ [API/Users/Create] Admin client created successfully');
    } catch (adminError) {
      console.error('❌ [API/Users/Create] Failed to create admin client:', adminError);
      return NextResponse.json({ 
        error: 'Failed to initialize admin client. Check SUPABASE_SERVICE_ROLE_KEY.' 
      }, { status: 500 });
    }

    // Use admin.createUser to create user without sending emails
    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email: validatedData.email,
      password: validatedData.password,
      email_confirm: validatedData.auto_confirm_email,
      user_metadata: {
        full_name: validatedData.full_name,
        display_name: validatedData.display_name || validatedData.full_name,
      }
    });

    if (createError) {
      console.error('❌ [API/Users/Create] Failed to create user:', {
        error: createError,
        message: createError.message,
        status: createError.status,
        code: createError.code,
      });
      
      // Check if user already exists
      if (createError.message?.includes('already registered')) {
        return NextResponse.json({ 
          error: 'A user with this email already exists' 
        }, { status: 409 });
      }
      
      return NextResponse.json({ 
        error: createError.message || 'Failed to create user', 
        details: createError.message,
        code: createError.code
      }, { status: 500 });
    }

    if (!newUser.user) {
      return NextResponse.json({ 
        error: 'User creation failed - no user returned' 
      }, { status: 500 });
    }

    console.log('✅ [API/Users/Create] User created in auth.users:', newUser.user.id);
    if (validatedData.auto_confirm_email) {
      console.log('✅ [API/Users/Create] Email auto-confirmed via createUser');
    }

    // Create user profile
    const { error: profileError } = await adminClient
      .from('user_profiles')
      .insert({
        user_id: newUser.user.id,
        display_name: validatedData.display_name || validatedData.full_name,
        avatar_url: null,
        phone: null,
        metadata: {},
      });

    if (profileError) {
      console.error('⚠️  [API/Users/Create] Failed to create user profile:', profileError);
      // Continue anyway - user is created but profile needs manual creation
    } else {
      console.log('✅ [API/Users/Create] User profile created successfully');
    }

    // Handle role assignment based on type
    if (validatedData.role === 'admin' || validatedData.role === 'staff') {
      // For platform roles, add to the platform account
      const PLATFORM_ACCOUNT_ID = '00000000-0000-0000-0000-000000000000';
      
      const { error: roleError } = await adminClient
        .from('account_users')
        .insert({
          account_id: PLATFORM_ACCOUNT_ID,
          user_id: newUser.user.id,
          role: validatedData.role,
        });

      if (roleError) {
        console.error('❌ [API/Users/Create] Failed to assign platform role:', roleError);
        return NextResponse.json({ 
          error: 'User created but role assignment failed', 
          details: roleError.message 
        }, { status: 500 });
      }

      console.log('✅ [API/Users/Create] Platform role assigned:', validatedData.role);
    } else if (validatedData.account_id) {
      // For account-level roles, first verify the account exists
      console.log('🔍 [API/Users/Create] Verifying account exists:', validatedData.account_id);
      
      const { data: accountCheck, error: accountError } = await adminClient
        .from('accounts')
        .select('id, name')
        .eq('id', validatedData.account_id)
        .single();
        
      if (accountError || !accountCheck) {
        console.error('❌ [API/Users/Create] Account not found:', {
          account_id: validatedData.account_id,
          error: accountError
        });
        // Clean up the created user since we can't assign them to the account
        await adminClient.auth.admin.deleteUser(newUser.user.id);
        return NextResponse.json({ 
          error: 'Invalid account ID provided', 
          details: 'The specified account does not exist'
        }, { status: 400 });
      }
      
      console.log('✅ [API/Users/Create] Account verified:', accountCheck.name);
      
      // Debug: Check if record already exists
      console.log('🔍 [API/Users/Create] Checking for existing account_users record...');
      const { data: existing, error: existingError } = await adminClient
        .from('account_users')
        .select('*')
        .eq('user_id', newUser.user.id)
        .eq('account_id', validatedData.account_id)
        .maybeSingle();
      
      if (existingError) {
        console.error('❌ [API/Users/Create] Error checking existing record:', existingError);
      } else if (existing) {
        console.log('⚠️  [API/Users/Create] Record already exists:', existing);
      } else {
        console.log('✅ [API/Users/Create] No existing record found, safe to insert');
      }
      
      // Debug: Test we can query the table
      const { count, error: countError } = await adminClient
        .from('account_users')
        .select('*', { count: 'exact', head: true });
      
      console.log('🔍 [API/Users/Create] Debug - account_users table access:', {
        count,
        error: countError
      });
      
      // Debug: Get a sample record to see structure
      const { data: sampleRecord } = await adminClient
        .from('account_users')
        .select('*')
        .limit(1)
        .single();
      
      if (sampleRecord) {
        console.log('🔍 [API/Users/Create] Sample account_users record structure:', Object.keys(sampleRecord));
      }
      
      // Add to the specified account with explicit joined_at
      console.log('🔍 [API/Users/Create] Assigning user to account...');
      const { error: roleError } = await adminClient
        .from('account_users')
        .insert({
          account_id: validatedData.account_id,
          user_id: newUser.user.id,
          role: validatedData.role,
          joined_at: new Date().toISOString(),
        });

      if (roleError) {
        console.error('❌ [API/Users/Create] Failed to assign account role:', {
          error: roleError,
          code: roleError.code,
          message: roleError.message,
          details: roleError.details,
          hint: roleError.hint,
          account_id: validatedData.account_id,
          user_id: newUser.user.id,
          role: validatedData.role
        });
        
        // Try upsert as fallback
        console.log('🔍 [API/Users/Create] Trying upsert as fallback...');
        const { error: upsertError } = await adminClient
          .from('account_users')
          .upsert({
            account_id: validatedData.account_id,
            user_id: newUser.user.id,
            role: validatedData.role,
            joined_at: new Date().toISOString(),
          }, {
            onConflict: 'account_id,user_id'
          });
          
        if (upsertError) {
          console.error('❌ [API/Users/Create] Upsert also failed:', {
            error: upsertError,
            code: upsertError.code,
            message: upsertError.message,
            details: upsertError.details,
            hint: upsertError.hint
          });
          
          // Clean up the created user since we couldn't assign them to the account
          await adminClient.auth.admin.deleteUser(newUser.user.id);
          
          return NextResponse.json({ 
            error: 'User created but account assignment failed', 
            details: upsertError.message || roleError.message,
            hint: upsertError.hint || roleError.hint || 'Check if account_users table constraints are satisfied'
          }, { status: 500 });
        } else {
          console.log('✅ [API/Users/Create] Upsert succeeded where insert failed!');
        }
      }

      console.log('✅ [API/Users/Create] Account role assigned:', validatedData.role);
    }

    // Send welcome email if requested
    if (validatedData.send_welcome_email) {
      try {
        // Use Supabase admin to send invite email
        const { error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(validatedData.email, {
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
        });
        
        if (inviteError) {
          console.error('⚠️  [API/Users/Create] Failed to send welcome email:', inviteError);
        } else {
          console.log('✅ [API/Users/Create] Welcome email sent');
        }
      } catch (emailError) {
        console.error('⚠️  [API/Users/Create] Error sending welcome email:', emailError);
        // Don't fail the whole operation if email fails
      }
    }

    // Log the user creation in audit logs
    await supabase
      .from('audit_logs')
      .insert({
        account_id: validatedData.account_id || '00000000-0000-0000-0000-000000000000',
        user_id: currentUser.id,
        action: 'user.created',
        resource_type: 'user',
        resource_id: newUser.user.id,
        metadata: {
          created_user_email: validatedData.email,
          created_user_role: validatedData.role,
          auto_confirmed: validatedData.auto_confirm_email,
          welcome_email_sent: validatedData.send_welcome_email,
        }
      });

    console.log('✅ [API/Users/Create] User creation completed successfully');

    const responseData = {
      success: true,
      user: {
        id: newUser.user.id,
        email: validatedData.email,
        full_name: validatedData.full_name,
        display_name: validatedData.display_name || validatedData.full_name,
        role: validatedData.role,
        email_confirmed: validatedData.auto_confirm_email,
      }
    };
    
    console.log('🔍 [API/Users/Create] Sending response:', responseData);
    return NextResponse.json(responseData);

  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ [API/Users/Create] Validation error:', error.issues);
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: error.issues 
      }, { status: 400 });
    }

    console.error('❌ [API/Users/Create] Unexpected error:', {
      error: error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error',
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}