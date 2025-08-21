import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe/config';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    
    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }
    
    // Return basic session info (email and metadata)
    return NextResponse.json({
      email: session.customer_email || session.customer_details?.email,
      tier: session.metadata?.tier,
      accountId: session.metadata?.account_id,
    });
    
  } catch (error) {
    console.error('Error fetching Stripe session:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch session',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}