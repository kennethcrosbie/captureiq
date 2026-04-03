// ============================================
// CaptureIQ — Google Drive Integration
// ============================================
// Handles file browsing, uploading, and metadata management
// using Google Drive as the storage backend.

import { google } from 'googleapis';

/**
 * Create an authenticated Drive client.
 * Uses OAuth2 for user-level access.
 */
function getDriveClient(accessToken) {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  auth.setCredentials({ access_token: accessToken });
  return google.drive({ version: 'v3', auth });
}

/**
 * List video files in the CaptureIQ Drive folder.
 *
 * @param {string} accessToken - User's OAuth access token
 * @param {Object} options
 * @param {string} options.folderId - Drive folder ID to browse
 * @param {string} options.titleFilter - Filter by title tag in description
 * @param {number} options.pageSize - Number of results (default 50)
 * @returns {Array} List of video files with metadata
 */
export async function listFootage(accessToken, { folderId, titleFilter, pageSize = 50 } = {}) {
  const drive = getDriveClient(accessToken);

  const targetFolder = folderId || process.env.GOOGLE_DRIVE_FOLDER_ID;

  let query = `'${targetFolder}' in parents and trashed = false and (mimeType contains 'video/')`;

  if (titleFilter) {
    query += ` and fullText contains '${titleFilter}'`;
  }

  try {
    const response = await drive.files.list({
      q: query,
      pageSize,
      fields: 'nextPageToken, files(id, name, mimeType, size, createdTime, modifiedTime, thumbnailLink, description, properties, videoMediaMetadata)',
      orderBy: 'modifiedTime desc',
    });

    return {
      success: true,
      files: response.data.files.map(file => ({
        id: file.id,
        name: file.name,
        mimeType: file.mimeType,
        size: file.size,
        createdAt: file.createdTime,
        modifiedAt: file.modifiedTime,
        thumbnail: file.thumbnailLink,
        description: file.description,
        // Custom properties we set during analysis
        title: file.properties?.captureiq_title || null,
        analyzed: file.properties?.captureiq_analyzed === 'true',
        arcStatus: file.properties?.captureiq_arc_status || null,
        // Video metadata from Drive
        duration: file.videoMediaMetadata?.durationMillis
          ? Math.round(file.videoMediaMetadata.durationMillis / 1000)
          : null,
        width: file.videoMediaMetadata?.width || null,
        height: file.videoMediaMetadata?.height || null,
      })),
      nextPageToken: response.data.nextPageToken,
    };
  } catch (error) {
    console.error('Drive list failed:', error);
    return { success: false, error: error.message, files: [] };
  }
}

/**
 * Upload a video file to the CaptureIQ Drive folder.
 *
 * @param {string} accessToken - User's OAuth access token
 * @param {Object} params
 * @param {ReadableStream} params.fileStream - The file data
 * @param {string} params.fileName - Original filename
 * @param {string} params.mimeType - File MIME type
 * @param {string} params.titleId - Associated game title
 * @param {string} params.description - File description
 * @returns {Object} Uploaded file metadata
 */
export async function uploadFootage(accessToken, { fileStream, fileName, mimeType, titleId, description }) {
  const drive = getDriveClient(accessToken);

  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

  try {
    const response = await drive.files.create({
      requestBody: {
        name: fileName,
        mimeType,
        description: description || `CaptureIQ upload — ${titleId}`,
        parents: [folderId],
        properties: {
          captureiq_title: titleId,
          captureiq_analyzed: 'false',
          captureiq_uploaded_at: new Date().toISOString(),
        },
      },
      media: {
        mimeType,
        body: fileStream,
      },
      fields: 'id, name, mimeType, size, webViewLink',
    });

    return {
      success: true,
      file: {
        id: response.data.id,
        name: response.data.name,
        mimeType: response.data.mimeType,
        size: response.data.size,
        webViewLink: response.data.webViewLink,
      },
    };
  } catch (error) {
    console.error('Drive upload failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Save analysis results as metadata on the Drive file.
 * Stores a summary in file properties and the full report as a companion JSON file.
 *
 * @param {string} accessToken - User's OAuth access token
 * @param {string} fileId - Drive file ID
 * @param {Object} analysis - The analysis results from Gemini
 * @returns {Object} Update confirmation
 */
export async function saveAnalysis(accessToken, fileId, analysis) {
  const drive = getDriveClient(accessToken);

  try {
    // Update file properties with summary flags
    await drive.files.update({
      fileId,
      requestBody: {
        properties: {
          captureiq_analyzed: 'true',
          captureiq_analyzed_at: new Date().toISOString(),
          captureiq_shot_count: String(analysis.shotCount || 0),
          captureiq_arc_status: analysis.overallStatus || 'pending',
        },
      },
    });

    // Save full analysis as a companion JSON file
    const jsonFileName = `${fileId}_analysis.json`;
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

    // Check if analysis file already exists
    const existing = await drive.files.list({
      q: `name = '${jsonFileName}' and '${folderId}' in parents and trashed = false`,
      fields: 'files(id)',
    });

    const analysisData = JSON.stringify(analysis, null, 2);

    if (existing.data.files.length > 0) {
      // Update existing analysis file
      await drive.files.update({
        fileId: existing.data.files[0].id,
        media: {
          mimeType: 'application/json',
          body: analysisData,
        },
      });
    } else {
      // Create new analysis file
      await drive.files.create({
        requestBody: {
          name: jsonFileName,
          mimeType: 'application/json',
          parents: [folderId],
        },
        media: {
          mimeType: 'application/json',
          body: analysisData,
        },
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Save analysis failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get the Google Cloud Storage URI for a Drive file.
 * Needed for Gemini's file-based analysis.
 *
 * @param {string} accessToken - User's OAuth access token
 * @param {string} fileId - Drive file ID
 * @returns {string} URI that Gemini can process
 */
export async function getFileUri(accessToken, fileId) {
  // For Gemini to analyze Drive files, we need to use the
  // Google AI File API to upload/reference the file.
  // This returns a URI in the format: https://generativelanguage.googleapis.com/...
  //
  // In the POC phase, we'll use direct file upload to Gemini's File API.
  // In production, this would use GCS URIs for better performance.

  return `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
}
