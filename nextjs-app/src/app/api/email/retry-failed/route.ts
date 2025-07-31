import { NextRequest, NextResponse } from 'next/server';
import { retryFailedEmails } from '@/lib/services/email';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated and is a platform admin
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check if user is a platform admin
    const { data: adminCheck } = await supabase
      .from('account_users')
      .select('role')
      .eq('account_id', '00000000-0000-0000-0000-000000000000')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();
    
    if (!adminCheck) {
      return NextResponse.json(
        { error: 'Forbidden: Platform admin access required' },
        { status: 403 }
      );
    }
    
    // Get optional parameters from request body
    const body = await request.json().catch(() => ({}));
    const limit = body.limit || 10;
    
    // Retry failed emails
    const result = await retryFailedEmails(limit);
    
    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Failed to retry failed emails:', error);
    return NextResponse.json(
      { 
        error: 'Failed to retry failed emails',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}