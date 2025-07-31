import { createSupabaseServerClient } from '@/lib/supabase/server';
import { hasPermission, requirePermission } from './index';
import type { Permission } from './constants';

/**
 * Server-side permission check helper
 * Use this in API routes and server components
 */
export async function serverHasPermission(
  userId: string,
  accountId: string,
  permission: Permission | string
): Promise<boolean> {
  const supabaseClient = createSupabaseServerClient();
  return hasPermission(userId, accountId, permission, supabaseClient);
}

/**
 * Server-side require permission helper
 */
export async function serverRequirePermission(
  userId: string,
  accountId: string,
  permission: Permission | string
): Promise<void> {
  const supabaseClient = createSupabaseServerClient();
  return requirePermission(userId, accountId, permission, supabaseClient);
}