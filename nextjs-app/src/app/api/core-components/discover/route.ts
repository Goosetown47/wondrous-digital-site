import { NextResponse } from 'next/server';
import { ComponentScanner } from '@/lib/component-scanner';

/**
 * API endpoint to discover components in the file system
 * This runs on the server since we need file system access
 */
export async function GET() {
  try {
    const scanner = new ComponentScanner();
    const discovered = await scanner.scanComponents();

    // Separate registered and unregistered
    const registered = discovered.filter(c => c.isRegistered);
    const unregistered = discovered.filter(c => !c.isRegistered);

    return NextResponse.json({
      registered,
      unregistered,
      total: discovered.length
    });
  } catch (error) {
    console.error('Error discovering components:', error);
    return NextResponse.json(
      { error: 'Failed to discover components' },
      { status: 500 }
    );
  }
}