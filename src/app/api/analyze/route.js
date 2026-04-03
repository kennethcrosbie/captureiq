import { NextResponse } from 'next/server';
import { analyzeFootage } from '../../../lib/gemini';

/**
 * POST /api/analyze
 * Analyze video footage using Gemini for title-specific intelligence.
 *
 * Body: { titleId: string, videoUri: string, mimeType?: string }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { titleId, videoUri, mimeType } = body;

    if (!titleId || !videoUri) {
      return NextResponse.json(
        { error: 'titleId and videoUri are required' },
        { status: 400 }
      );
    }

    const result = await analyzeFootage({ titleId, videoUri, mimeType });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Analysis API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
