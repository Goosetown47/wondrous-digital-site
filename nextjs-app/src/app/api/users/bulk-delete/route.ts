import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { sanitizeInput } from '@/lib/sanitization';

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const { data: platformAccount } = await supabase
      .from('account_users')
      .select('role')
      .eq('user_id', user.id)
      .eq('account_id', '00000000-0000-0000-0000-000000000000')
      .single();

    if (!platformAccount || platformAccount.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Get the user IDs to delete
    const body = await request.json();
    const { userIds } = body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: 'No users specified for deletion' },
        { status: 400 }
      );
    }

    // Sanitize user IDs (UUID length is 36 chars)
    const sanitizedUserIds = userIds.map((id: string) => sanitizeInput(id, 36));

    // Don't allow deleting yourself
    if (sanitizedUserIds.includes(user.id)) {
      return NextResponse.json(
        { error: 'You cannot delete your own account' },
        { status: 400 }
      );
    }

    // Delete users using Supabase Admin API
    // This will cascade delete all related records (account_users, profiles, etc.)
    const supabaseAdmin = await createSupabaseServerClient();
    
    const deletePromises = sanitizedUserIds.map(userId => 
      supabaseAdmin.auth.admin.deleteUser(userId)
    );

    const results = await Promise.allSettled(deletePromises);
    
    // Count successful deletions
    const successCount = results.filter(result => result.status === 'fulfilled').length;
    const failedCount = results.filter(result => result.status === 'rejected').length;

    if (failedCount > 0) {
      console.error(`Failed to delete ${failedCount} users`);
    }

    return NextResponse.json({ 
      success: true,
      deletedCount: successCount,
      failedCount: failedCount,
      message: `Successfully deleted ${successCount} user${successCount !== 1 ? 's' : ''}${failedCount > 0 ? `, ${failedCount} failed` : ''}`
    });

  } catch (error) {
    console.error('Bulk delete users error:', error);
    return NextResponse.json(
      { error: 'Failed to delete users' },
      { status: 500 }
    );
  }
}