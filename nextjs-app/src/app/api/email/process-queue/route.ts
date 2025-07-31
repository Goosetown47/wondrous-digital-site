import { NextRequest, NextResponse } from 'next/server';
import { processEmailQueue } from '@/lib/services/email';
import { createAdminClient } from '@/lib/supabase/admin';

// This API route can be called by a cron job or webhook
export async function POST(request: NextRequest) {
  try {
    // Verify the request is authorized
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    // If CRON_SECRET is set, require it for authorization
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get optional parameters from request body
    const body = await request.json().catch(() => ({}));
    const limit = body.limit || 10;
    
    // Process the email queue
    const result = await processEmailQueue(limit);
    
    // Log the results
    console.log('Email queue processed:', result);
    
    // If there were any errors, log them to the database
    if (result.errors.length > 0) {
      const supabase = createAdminClient();
      await supabase.from('audit_logs').insert({
        account_id: '00000000-0000-0000-0000-000000000000',
        user_id: '00000000-0000-0000-0000-000000000000', // System user
        action: 'email_queue_errors',
        resource_type: 'email_queue',
        metadata: {
          errors: result.errors,
          processed: result.processed,
          failed: result.failed,
        },
      });
    }
    
    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Failed to process email queue:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process email queue',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Also support GET for easy testing
export async function GET(request: NextRequest) {
  // In production, you might want to restrict this to development only
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Method not allowed in production' },
      { status: 405 }
    );
  }
  
  return POST(request);
}