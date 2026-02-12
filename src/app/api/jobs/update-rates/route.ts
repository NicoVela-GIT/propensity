/**
 * API Route: Update Mortgage Rates
 * 
 * Triggers the weekly mortgage rate update job.
 * Fetches latest rates from FRED API and stores in database.
 * 
 * GET /api/jobs/update-rates
 */

import { NextResponse } from 'next/server';
import { updateMortgageRates } from '@/lib/jobs/update-mortgage-rates';

export async function GET() {
  try {
    console.log('[API] Triggering mortgage rate update job...');
    
    const result = await updateMortgageRates();
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Successfully updated ${result.updatesCount} mortgage rates`,
        data: result,
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Failed to update mortgage rates',
        error: result.error,
      }, { status: 500 });
    }
  } catch (error) {
    console.error('[API] Error in update-rates route:', error);
    
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
