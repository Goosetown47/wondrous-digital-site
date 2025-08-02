import { Resend } from 'resend';
import { createAdminClient } from '@/lib/supabase/admin';
import { render } from '@react-email/components';
import type { ReactElement } from 'react';

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// Development mode flag
const isDevelopment = process.env.NODE_ENV === 'development';

export interface EmailOptions {
  to: string | string[];
  from?: string;
  subject: string;
  react?: ReactElement;
  html?: string;
  text?: string;
  replyTo?: string | string[];
  headers?: Record<string, string>;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
  tags?: Array<{
    name: string;
    value: string;
  }>;
}

export interface QueueEmailOptions extends Omit<EmailOptions, 'react'> {
  templateId?: string;
  templateData?: Record<string, unknown>;
  scheduledAt?: Date;
}

export interface EmailQueueItem {
  id: string;
  to_email: string;
  from_email: string;
  subject: string;
  body: string;
  template_id?: string;
  template_data?: Record<string, unknown>;
  status: 'pending' | 'processing' | 'sent' | 'failed';
  retry_count: number;
  max_retries: number;
  scheduled_at: string;
  sent_at?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Send an email immediately using Resend
 */
export async function sendEmail(options: EmailOptions): Promise<{
  success: boolean;
  data?: { id: string } | null;
  error?: string;
}> {
  try {
    // Convert React component to HTML if provided
    let html = options.html;
    if (options.react) {
      html = await render(options.react);
    }

    if (!html && !options.text) {
      throw new Error('Either html, text, or react content is required');
    }

    // In development, log to console instead of sending
    if (isDevelopment) {
      console.log('📧 Email (Development Mode):', {
        to: options.to,
        from: options.from || 'noreply@wondrousdigital.com',
        subject: options.subject,
        html: html?.substring(0, 200) + '...',
        text: options.text?.substring(0, 200) + '...',
      });
      return { success: true, data: { id: 'dev-' + Date.now() } };
    }

    // Send via Resend
    const { data, error } = await resend.emails.send({
      from: options.from || 'Wondrous Digital <noreply@wondrousdigital.com>',
      to: options.to,
      subject: options.subject,
      html,
      text: options.text,
      replyTo: options.replyTo,
      headers: options.headers,
      attachments: options.attachments,
      tags: options.tags,
    });

    if (error) {
      throw new Error(error.message);
    }

    return { success: true, data };
  } catch (error) {
    console.error('Failed to send email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Queue an email for asynchronous sending
 */
export async function queueEmail(options: QueueEmailOptions): Promise<{
  success: boolean;
  id?: string;
  error?: string;
}> {
  try {
    const supabase = createAdminClient();

    // Convert array of recipients to comma-separated string
    const toEmail = Array.isArray(options.to) ? options.to.join(',') : options.to;

    const { data, error } = await supabase
      .from('email_queue')
      .insert({
        to_email: toEmail,
        from_email: options.from || 'noreply@wondrousdigital.com',
        subject: options.subject,
        body: options.html || options.text || '',
        template_id: options.templateId,
        template_data: options.templateData || {},
        scheduled_at: options.scheduledAt?.toISOString() || new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { success: true, id: data.id };
  } catch (error) {
    console.error('Failed to queue email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Process pending emails from the queue
 */
export async function processEmailQueue(limit: number = 10): Promise<{
  processed: number;
  failed: number;
  errors: string[];
}> {
  const supabase = createAdminClient();
  const errors: string[] = [];
  let processed = 0;
  let failed = 0;

  try {
    // Get pending emails that are due to be sent
    const { data: emails, error: fetchError } = await supabase
      .from('email_queue')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_at', new Date().toISOString())
      .lt('retry_count', 3) // Max retries hardcoded
      .order('scheduled_at', { ascending: true })
      .limit(limit);

    if (fetchError) {
      throw fetchError;
    }

    if (!emails || emails.length === 0) {
      return { processed: 0, failed: 0, errors: [] };
    }

    // Process each email
    for (const email of emails) {
      try {
        // Update status to processing
        await supabase
          .from('email_queue')
          .update({ status: 'processing' })
          .eq('id', email.id);

        // Apply template if needed
        let subject = email.subject;
        let body = email.body;

        if (email.template_id && email.template_data) {
          const { data: template } = await supabase
            .from('email_templates')
            .select('*')
            .eq('id', email.template_id)
            .single();

          if (template) {
            subject = applyTemplate(template.subject_template, email.template_data);
            body = applyTemplate(template.body_template, email.template_data);
          }
        }

        // Send the email
        const result = await sendEmail({
          to: email.to_email.split(','),
          from: email.from_email,
          subject,
          html: body,
        });

        if (result.success) {
          // Mark as sent
          await supabase
            .from('email_queue')
            .update({
              status: 'sent',
              sent_at: new Date().toISOString(),
            })
            .eq('id', email.id);

          // Log successful delivery
          await supabase
            .from('email_logs')
            .insert({
              email_queue_id: email.id,
              provider: 'resend',
              provider_id: result.data?.id,
              status: 'delivered',
              delivered_at: new Date().toISOString(),
            });

          processed++;
        } else {
          throw new Error(result.error || 'Failed to send email');
        }
      } catch (emailError) {
        // Handle individual email failure
        const errorMessage = emailError instanceof Error ? emailError.message : 'Unknown error';
        errors.push(`Email ${email.id}: ${errorMessage}`);
        failed++;

        // Update retry count and status
        const newRetryCount = email.retry_count + 1;
        const status = newRetryCount >= email.max_retries ? 'failed' : 'pending';

        await supabase
          .from('email_queue')
          .update({
            status,
            retry_count: newRetryCount,
            error_message: errorMessage,
          })
          .eq('id', email.id);

        // Log failure
        await supabase
          .from('email_logs')
          .insert({
            email_queue_id: email.id,
            provider: 'resend',
            status: 'failed',
            metadata: { error: errorMessage },
          });
      }
    }
  } catch (error) {
    errors.push(`Queue processing error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return { processed, failed, errors };
}

/**
 * Apply template variables to a string
 */
function applyTemplate(template: string, data: Record<string, unknown>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    // eslint-disable-next-line security/detect-object-injection
    return data[key] !== undefined ? String(data[key]) : match;
  });
}

/**
 * Retry failed emails in the queue
 */
export async function retryFailedEmails(limit: number = 10): Promise<{
  retried: number;
  errors: string[];
}> {
  const supabase = createAdminClient();

  try {
    // Reset failed emails that haven't exceeded max retries
    const { data, error } = await supabase
      .from('email_queue')
      .update({
        status: 'pending',
        error_message: null,
      })
      .eq('status', 'failed')
      .lt('retry_count', 3) // Max retries hardcoded
      .select()
      .limit(limit);

    if (error) {
      throw error;
    }

    return {
      retried: data?.length || 0,
      errors: [],
    };
  } catch (error) {
    return {
      retried: 0,
      errors: [error instanceof Error ? error.message : 'Unknown error'],
    };
  }
}

/**
 * Get email queue statistics
 */
export async function getEmailQueueStats(): Promise<{
  pending: number;
  processing: number;
  sent: number;
  failed: number;
  total: number;
}> {
  const supabase = createAdminClient();

  try {
    const { error } = await supabase
      .from('email_queue')
      .select('status', { count: 'exact', head: true });

    if (error) {
      throw error;
    }

    // Get counts by status
    const stats = {
      pending: 0,
      processing: 0,
      sent: 0,
      failed: 0,
      total: 0,
    };

    // Query each status
    for (const status of ['pending', 'processing', 'sent', 'failed'] as const) {
      const { count } = await supabase
        .from('email_queue')
        .select('*', { count: 'exact', head: true })
        .eq('status', status);

      // eslint-disable-next-line security/detect-object-injection
      stats[status] = count || 0;
    }

    stats.total = stats.pending + stats.processing + stats.sent + stats.failed;

    return stats;
  } catch (error) {
    console.error('Failed to get email queue stats:', error);
    return {
      pending: 0,
      processing: 0,
      sent: 0,
      failed: 0,
      total: 0,
    };
  }
}