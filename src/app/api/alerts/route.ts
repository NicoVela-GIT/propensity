/**
 * API Route: Alerts
 * 
 * Fetch active alerts for display in the UI.
 * 
 * GET /api/alerts - Get all active alerts
 */

import { NextResponse } from 'next/server';
import { getActiveAlerts } from '@/lib/supabase/repositories/alerts.repository';

export async function GET() {
  try {
    const alerts = await getActiveAlerts();
    
    return NextResponse.json({
      success: true,
      data: alerts,
      count: alerts.length,
    });
  } catch (error) {
    console.error('[API] Error fetching alerts:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch alerts',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

// Cache for 5 minutes
export const revalidate = 300;
