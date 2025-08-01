import { NextResponse } from 'next/server';
import { getEmailQueueStats } from '@/lib/services/email';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET() {
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
    
    // Get email queue statistics
    const stats = await getEmailQueueStats();
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Failed to get email queue stats:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get email queue stats',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}