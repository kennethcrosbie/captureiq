// ============================================
// CaptureIQ — Gemini API Integration
// ============================================
// This module handles all communication with Google's Gemini API
// for video analysis, footage intelligence, and ARC compliance screening.

import { GoogleGenerativeAI } from '@google/generative-ai';
import { TITLE_CONFIGS, ARC_CATEGORIES, DELIVERY_CHANNELS } from './constants';

// Initialize the Gemini client (server-side only)
let genAI = null;

function getClient() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured. Add it to your .env.local file.');
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

/**
 * Analyze a video clip for title-specific footage intelligence.
 * Sends the video to Gemini with a prompt tailored to the title's metadata fields.
 *
 * @param {Object} params
 * @param {string} params.titleId - The title key (e.g., 'nba-2k26', 'borderlands-4')
 * @param {string} params.videoUri - Google Cloud Storage URI or Drive file reference
 * @param {string} params.mimeType - Video MIME type (e.g., 'video/mp4')
 * @returns {Object} Structured analysis with per-shot intelligence
 */
export async function analyzeFootage({ titleId, videoUri, mimeType = 'video/mp4' }) {
  const client = getClient();
  const model = client.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const titleConfig = TITLE_CONFIGS[titleId];
  if (!titleConfig) {
    throw new Error(`Unknown title: ${titleId}. Available: ${Object.keys(TITLE_CONFIGS).join(', ')}`);
  }

  const fieldList = titleConfig.fields.join(', ');

  const prompt = `You are an expert video analyst for ${titleConfig.label} game footage.

Analyze this video clip and break it down shot-by-shot. For each shot, provide:

1. **Timecode**: Start and end time (HH:MM:SS:FF)
2. **Shot Type**: Close-up, Medium, Wide, Establishing, etc.
3. **Duration**: Length in seconds
4. **Title-Specific Intelligence**: For each shot, identify the following fields:
   ${titleConfig.fields.map((f, i) => `${i + 1}. ${f}`).join('\n   ')}
5. **Content Flags**: Note any content that may require ARC compliance review:
   - Violence (blood, weapons, impacts)
   - Sexual content
   - Alcohol/drug references
   - Offensive language (if audio present)
   - Cultural/religious sensitivity

Return your analysis as JSON with this structure:
{
  "totalDuration": "string",
  "shotCount": number,
  "shots": [
    {
      "shotNumber": number,
      "timecodeIn": "string",
      "timecodeOut": "string",
      "duration": number,
      "shotType": "string",
      "description": "string",
      "intel": {
        ${titleConfig.fields.map(f => `"${f.toLowerCase().replace(/[\/\s]+/g, '_')}": "string"`).join(',\n        ')}
      },
      "contentFlags": {
        "violence": { "detected": boolean, "severity": "none|low|medium|high", "details": "string" },
        "sexualContent": { "detected": boolean, "severity": "none|low|medium|high", "details": "string" },
        "alcoholDrugs": { "detected": boolean, "severity": "none|low|medium|high", "details": "string" },
        "language": { "detected": boolean, "severity": "none|low|medium|high", "details": "string" },
        "sensitivity": { "detected": boolean, "severity": "none|low|medium|high", "details": "string" }
      }
    }
  ],
  "overallSummary": "string",
  "keyMoments": ["string"]
}`;

  try {
    const result = await model.generateContent([
      prompt,
      {
        fileData: {
          fileUri: videoUri,
          mimeType: mimeType,
        },
      },
    ]);

    const response = result.response;
    const text = response.text();

    // Extract JSON from the response (Gemini sometimes wraps it in markdown)
    const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || [null, text];
    const analysis = JSON.parse(jsonMatch[1]);

    return {
      success: true,
      titleId,
      titleLabel: titleConfig.label,
      analyzedAt: new Date().toISOString(),
      ...analysis,
    };
  } catch (error) {
    console.error('Gemini analysis failed:', error);
    return {
      success: false,
      error: error.message,
      titleId,
      titleLabel: titleConfig.label,
    };
  }
}

/**
 * Screen a complete edit for ARC compliance based on delivery channel.
 *
 * @param {Object} params
 * @param {string} params.titleId - The title key
 * @param {string} params.videoUri - Video URI
 * @param {string} params.mimeType - Video MIME type
 * @param {string} params.deliveryChannel - Target delivery channel ID
 * @param {string} params.audienceTarget - Target audience description
 * @returns {Object} ARC compliance report
 */
export async function screenForARC({ titleId, videoUri, mimeType = 'video/mp4', deliveryChannel, audienceTarget }) {
  const client = getClient();
  const model = client.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const titleConfig = TITLE_CONFIGS[titleId];
  const channel = DELIVERY_CHANNELS.find(c => c.id === deliveryChannel);

  if (!titleConfig || !channel) {
    throw new Error('Invalid title or delivery channel');
  }

  const prompt = `You are an ESRB Advertising Review Council (ARC) compliance expert.

Analyze this ${titleConfig.label} video edit for ARC compliance. The edit is intended for:
- **Delivery Channel**: ${channel.label} — ${channel.desc}
- **Channel Rules**: ${channel.rules}
- **Game Rating**: ${titleConfig.esrbRating}
- **Target Audience**: ${audienceTarget || 'General audience'}

Check for ALL of the following ARC Section II.B content categories:

${ARC_CATEGORIES.map(cat => `**${cat.label}** (${cat.arcRef}): ${cat.desc}`).join('\n')}

Also check technical compliance (Section VI.E):
1. Rating slate presence (must be 50% screen height, minimum 2 seconds)
2. Rating icon overlay (15% screen height for general audience placements)
3. First 4 seconds must be clean of restricted content
4. Content descriptors must be displayed

Return your analysis as JSON:
{
  "overallStatus": "pass" | "fail" | "warning",
  "deliveryChannel": "${channel.id}",
  "gameTitle": "${titleConfig.label}",
  "gameRating": "${titleConfig.esrbRating}",
  "audienceTarget": "${audienceTarget || 'General audience'}",
  "contentFlags": [
    {
      "category": "string (from ARC categories)",
      "severity": "critical" | "warning" | "info",
      "timecode": "string",
      "description": "string",
      "arcRef": "string (section reference)",
      "recommendation": "string"
    }
  ],
  "technicalChecks": [
    {
      "check": "string",
      "status": "pass" | "fail" | "warning",
      "details": "string",
      "arcRef": "string"
    }
  ],
  "summary": "string",
  "preclearanceRecommended": boolean
}`;

  try {
    const result = await model.generateContent([
      prompt,
      {
        fileData: {
          fileUri: videoUri,
          mimeType: mimeType,
        },
      },
    ]);

    const response = result.response;
    const text = response.text();

    const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || [null, text];
    const report = JSON.parse(jsonMatch[1]);

    return {
      success: true,
      screenedAt: new Date().toISOString(),
      ...report,
    };
  } catch (error) {
    console.error('ARC screening failed:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}
