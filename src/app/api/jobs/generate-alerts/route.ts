/**
 * API Route: Generate Alerts
 * 
 * Triggers the daily alert generation job.
 * Generates all alert types and stores in database.
 * 
 * GET /api/jobs/generate-alerts
 */

import { NextResponse } from 'next/server';
import { generateAllAlerts } from '@/lib/jobs/generate-alerts';

export async function GET() {
  try {
    console.log('[API] Triggering alert generation job...');
    
    const result = await generateAllAlerts();
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Successfully generated ${result.totalAlerts} alerts`,
        data: result,
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Failed to generate alerts',
        error: result.error,
      }, { status: 500 });
    }
  } catch (error) {
    console.error('[API] Error in generate-alerts route:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

// Disable caching for this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;
