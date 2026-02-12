/**
 * API Route: Alert by ID
 * 
 * Fetch or update a specific alert.
 * 
 * GET /api/alerts/[id] - Get alert details
 * PATCH /api/alerts/[id] - Update alert state (mark read/dismissed)
 */

import { NextResponse } from 'next/server';
import { 
  getAlertById, 
  markAlertAsRead, 
  dismissAlert,
  undismissAlert 
} from '@/lib/supabase/repositories/alerts.repository';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const alert = await getAlertById(id);
    
    if (!alert) {
      return NextResponse.json({
        success: false,
        message: 'Alert not found',
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      data: alert,
    });
  } catch (error) {
    console.error('[API] Error fetching alert:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch alert',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action } = body;

    let result;

    switch (action) {
      case 'mark_read':
        result = await markAlertAsRead(id);
        break;
      case 'dismiss':
        result = await dismissAlert(id);
        break;
      case 'undismiss':
        result = await undismissAlert(id);
        break;
      default:
        return NextResponse.json({
          success: false,
          message: 'Invalid action. Use: mark_read, dismiss, or undismiss',
        }, { status: 400 });
    }
    
    return NextResponse.json({
      success: true,
      message: `Alert ${action} successfully`,
      data: result,
    });
  } catch (error) {
    console.error('[API] Error updating alert:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to update alert',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

// Disable caching for this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;
