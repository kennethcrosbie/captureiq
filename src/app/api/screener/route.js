import { NextResponse } from 'next/server';
import { screenForARC } from '../../../lib/gemini';

/**
 * POST /api/screener
 * Screen a complete edit for ARC compliance.
 *
 * Body: { titleId: string, videoUri: string, mimeType?: string, deliveryChannel: string, audienceTarget?: string }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { titleId, videoUri, mimeType, deliveryChannel, audienceTarget } = body;

    if (!titleId || !videoUri || !deliveryChannel) {
      return NextResponse.json(
        { error: 'titleId, videoUri, and deliveryChannel are required' },
        { status: 400 }
      );
    }

    const result = await screenForARC({
      titleId,
      videoUri,
      mimeType,
      deliveryChannel,
      audienceTarget,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Screener API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
