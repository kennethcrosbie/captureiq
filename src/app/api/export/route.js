import { NextResponse } from 'next/server';
import { generatePremiereXML, generateEDL, generateCSV } from '../../../lib/export';

/**
 * POST /api/export
 * Generate a timeline export file (XML, EDL, or CSV) from cut data.
 *
 * Body: {
 *   format: 'xml' | 'edl' | 'csv',
 *   sequenceName: string,
 *   sourceFile: string,
 *   fps: number (optional, default 23.976),
 *   cuts: Array<{ shotNumber, timecodeIn, timecodeOut, duration, description, notes }>
 * }
 *
 * Returns the generated file as a downloadable response.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { format, sequenceName, sourceFile, fps, cuts } = body;

    if (!format || !cuts || !cuts.length) {
      return NextResponse.json(
        { error: 'format and cuts array are required' },
        { status: 400 }
      );
    }

    let content, contentType, extension;

    switch (format) {
      case 'xml':
        content = generatePremiereXML({
          sequenceName: sequenceName || 'CaptureIQ Export',
          sourceFile: sourceFile || 'source.mp4',
          fps: fps || 23.976,
          cuts,
        });
        contentType = 'application/xml';
        extension = 'xml';
        break;

      case 'edl':
        content = generateEDL({
          sequenceName: sequenceName || 'CaptureIQ Export',
          sourceFile: sourceFile || 'source.mp4',
          fps: fps || 23.976,
          cuts,
        });
        contentType = 'text/plain';
        extension = 'edl';
        break;

      case 'csv':
        content = generateCSV({ cuts });
        contentType = 'text/csv';
        extension = 'csv';
        break;

      default:
        return NextResponse.json(
          { error: `Unknown format: ${format}. Use xml, edl, or csv.` },
          { status: 400 }
        );
    }

    const filename = `${(sequenceName || 'CaptureIQ_Export').replace(/\s+/g, '_')}.${extension}`;

    return new NextResponse(content, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Export generation failed' },
      { status: 500 }
    );
  }
}
