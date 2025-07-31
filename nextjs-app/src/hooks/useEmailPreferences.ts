import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/providers/auth-provider';
import { toast } from '@/components/ui/use-toast';

export interface EmailPreferences {
  user_id: string;
  marketing_emails: boolean;
  product_updates: boolean;
  security_alerts: boolean;
  billing_notifications: boolean;
  weekly_digest: boolean;
  created_at: string;
  updated_at: string;
}

export function useEmailPreferences() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['email-preferences', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      // First try to get existing preferences
      const { data, error } = await supabase
        .from('email_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // No preferences found, create default ones
        const { data: newData, error: insertError } = await supabase
          .from('email_preferences')
          .insert({
            user_id: user.id,
            marketing_emails: true,
            product_updates: true,
            security_alerts: true,
            billing_notifications: true,
            weekly_digest: true,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        return newData as EmailPreferences;
      }

      if (error) throw error;
      return data as EmailPreferences;
    },
    enabled: !!user?.id,
  });
}

export function useUpdateEmailPreferences() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<Omit<EmailPreferences, 'user_id' | 'created_at' | 'updated_at'>>) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('email_preferences')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data as EmailPreferences;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['email-preferences', user?.id], data);
    },
    onError: (error) => {
      console.error('Failed to update email preferences:', error);
    },
  });
}