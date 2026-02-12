/**
 * API Route: Generate Alerts
 * 
 * Triggers alert generation job.
 * Supports both hourly batch processing and full portfolio processing.
 * 
 * GET /api/jobs/generate-alerts - Process current hour's batch
 * GET /api/jobs/generate-alerts?batch=14 - Process specific hour (0-23)
 * GET /api/jobs/generate-alerts?all=true - Process all properties (legacy)
 */

import { NextResponse } from 'next/server';
import { generateAlertsForBatch, generateAllAlerts } from '@/lib/jobs/generate-alerts';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const batchParam = searchParams.get('batch');
    const allParam = searchParams.get('all');

    // Legacy mode: process all properties at once
    if (allParam === 'true') {
      console.log('[API] Triggering full portfolio alert generation (legacy mode)...');
      const result = await generateAllAlerts();
      
      if (result.success) {
        return NextResponse.json({
          success: true,
          message: `Successfully generated ${result.totalAlerts} alerts for all properties`,
          data: result,
        });
      } else {
        return NextResponse.json({
          success: false,
          message: 'Failed to generate alerts',
          error: result.error,
        }, { status: 500 });
      }
    }

    // Batch mode: process specific hour or current hour
    const batchSlot = batchParam ? parseInt(batchParam, 10) : undefined;
    
    if (batchSlot !== undefined && (batchSlot < 0 || batchSlot > 23)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid batch slot. Must be between 0 and 23.',
      }, { status: 400 });
    }

    console.log(`[API] Triggering hourly batch alert generation (slot: ${batchSlot ?? 'current'})...`);
    
    const result = await generateAlertsForBatch(batchSlot);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Successfully generated ${result.totalAlerts} alerts for ${result.propertiesProcessed} properties in batch ${result.batchSlot}`,
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
