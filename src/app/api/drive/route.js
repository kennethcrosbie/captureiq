import { NextResponse } from 'next/server';
import { listFootage, saveAnalysis } from '../../../lib/drive';

/**
 * GET /api/drive?title=nba-2k26
 * List video files from the CaptureIQ Google Drive folder.
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const titleFilter = searchParams.get('title');

    // TODO: Get access token from auth session
    const accessToken = ''; // Will be populated once Google Auth is configured

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in with Google.' },
        { status: 401 }
      );
    }

    const result = await listFootage(accessToken, { titleFilter });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Drive API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/drive
 * Save analysis results to Drive.
 *
 * Body: { fileId: string, analysis: Object }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { fileId, analysis } = body;

    if (!fileId || !analysis) {
      return NextResponse.json(
        { error: 'fileId and analysis are required' },
        { status: 400 }
      );
    }

    // TODO: Get access token from auth session
    const accessToken = '';

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const result = await saveAnalysis(accessToken, fileId, analysis);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Drive save error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
