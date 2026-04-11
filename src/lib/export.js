// ============================================
// CaptureIQ — Timeline Export (EDL / XML / CSV)
// ============================================
// Generates edit decision lists and timeline XML files
// that can be imported directly into Premiere Pro, DaVinci Resolve,
// Final Cut Pro, and other NLEs.

/**
 * Generate a Premiere Pro-compatible Final Cut Pro XML (v5).
 * Premiere imports FCP XML natively via File > Import.
 *
 * @param {Object} params
 * @param {string} params.sequenceName - Name of the sequence
 * @param {string} params.sourceFile - Source video filename
 * @param {number} params.fps - Frames per second (default 23.976)
 * @param {Array} params.cuts - Array of cut objects:
 *   { shotNumber, timecodeIn, timecodeOut, duration, description }
 * @returns {string} FCP XML string
 */
export function generatePremiereXML({ sequenceName, sourceFile, fps = 23.976, cuts }) {
  const timebase = Math.round(fps);
  const ntsc = fps !== Math.round(fps); // true for 23.976, 29.97

  // Convert timecode string "HH:MM:SS:FF" to frame number
  function tcToFrames(tc) {
    const parts = tc.split(':').map(Number);
    if (parts.length === 4) {
      return (parts[0] * 3600 + parts[1] * 60 + parts[2]) * timebase + parts[3];
    }
    // Handle "MM:SS" or seconds
    if (parts.length === 2) {
      return (parts[0] * 60 + parts[1]) * timebase;
    }
    return Math.round(parseFloat(tc) * timebase);
  }

  // Convert seconds to frame number
  function secondsToFrames(sec) {
    return Math.round(sec * timebase);
  }

  let timelinePosition = 0;
  let clipEntries = '';

  cuts.forEach((cut, i) => {
    const inFrame = tcToFrames(cut.timecodeIn || '0');
    const outFrame = cut.timecodeOut
      ? tcToFrames(cut.timecodeOut)
      : inFrame + secondsToFrames(cut.duration);
    const duration = outFrame - inFrame;

    clipEntries += `
          <clipitem id="clip-${i + 1}">
            <name>${cut.description || `Shot ${cut.shotNumber || i + 1}`}</name>
            <duration>${duration}</duration>
            <rate>
              <timebase>${timebase}</timebase>
              <ntsc>${ntsc ? 'TRUE' : 'FALSE'}</ntsc>
            </rate>
            <start>${timelinePosition}</start>
            <end>${timelinePosition + duration}</end>
            <in>${inFrame}</in>
            <out>${outFrame}</out>
            <file id="file-1">
              <name>${sourceFile}</name>
              <pathurl>file://localhost/${sourceFile}</pathurl>
              <rate>
                <timebase>${timebase}</timebase>
                <ntsc>${ntsc ? 'TRUE' : 'FALSE'}</ntsc>
              </rate>
              <media>
                <video>
                  <samplecharacteristics>
                    <width>1920</width>
                    <height>1080</height>
                  </samplecharacteristics>
                </video>
                <audio>
                  <samplecharacteristics>
                    <samplerate>48000</samplerate>
                    <depth>16</depth>
                  </samplecharacteristics>
                </audio>
              </media>
            </file>
            <sourcetrack>
              <mediatype>video</mediatype>
              <trackindex>1</trackindex>
            </sourcetrack>
          </clipitem>`;

    timelinePosition += duration;
  });

  const totalDuration = timelinePosition;

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE xmeml>
<xmeml version="5">
  <sequence>
    <name>${sequenceName}</name>
    <duration>${totalDuration}</duration>
    <rate>
      <timebase>${timebase}</timebase>
      <ntsc>${ntsc ? 'TRUE' : 'FALSE'}</ntsc>
    </rate>
    <media>
      <video>
        <format>
          <samplecharacteristics>
            <width>1920</width>
            <height>1080</height>
            <rate>
              <timebase>${timebase}</timebase>
              <ntsc>${ntsc ? 'TRUE' : 'FALSE'}</ntsc>
            </rate>
          </samplecharacteristics>
        </format>
        <track>
          <enabled>TRUE</enabled>
          <locked>FALSE</locked>${clipEntries}
        </track>
      </video>
      <audio>
        <track>
          <enabled>TRUE</enabled>
          <locked>FALSE</locked>
        </track>
      </audio>
    </media>
  </sequence>
</xmeml>`;
}

/**
 * Generate a CMX3600-format EDL (Edit Decision List).
 * Universally supported by all NLEs.
 *
 * @param {Object} params
 * @param {string} params.sequenceName - Name of the sequence
 * @param {string} params.sourceFile - Source video filename
 * @param {number} params.fps - Frames per second
 * @param {Array} params.cuts - Array of cut objects
 * @returns {string} EDL string
 */
export function generateEDL({ sequenceName, sourceFile, fps = 23.976, cuts }) {
  const timebase = Math.round(fps);

  function secondsToTC(totalSeconds) {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = Math.floor(totalSeconds % 60);
    const f = Math.round((totalSeconds % 1) * timebase);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}:${String(f).padStart(2, '0')}`;
  }

  function parseTCtoSeconds(tc) {
    const parts = tc.split(':').map(Number);
    if (parts.length === 4) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2] + parts[3] / timebase;
    }
    if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    }
    return parseFloat(tc);
  }

  let edl = `TITLE: ${sequenceName}\nFCM: NON-DROP FRAME\n\n`;
  let recordPosition = 0;

  cuts.forEach((cut, i) => {
    const editNum = String(i + 1).padStart(3, '0');
    const srcIn = cut.timecodeIn || secondsToTC(0);
    const srcInSec = parseTCtoSeconds(srcIn);
    const duration = cut.duration || (cut.timecodeOut ? parseTCtoSeconds(cut.timecodeOut) - srcInSec : 2);
    const srcOut = cut.timecodeOut || secondsToTC(srcInSec + duration);
    const recIn = secondsToTC(recordPosition);
    const recOut = secondsToTC(recordPosition + duration);

    edl += `${editNum}  ${sourceFile.substring(0, 8).toUpperCase().padEnd(8)} V     C        ${srcIn} ${srcOut} ${recIn} ${recOut}\n`;

    if (cut.description) {
      edl += `* FROM CLIP NAME: ${cut.description}\n`;
    }
    edl += `\n`;

    recordPosition += duration;
  });

  return edl;
}

/**
 * Generate a CSV shot list for spreadsheet import.
 *
 * @param {Object} params
 * @param {Array} params.cuts - Array of cut objects
 * @param {Object} params.intel - Optional per-shot intelligence data
 * @returns {string} CSV string
 */
export function generateCSV({ cuts, intel = {} }) {
  let csv = 'Shot,Timecode In,Timecode Out,Duration (s),Description,Notes\n';

  cuts.forEach((cut, i) => {
    const desc = (cut.description || '').replace(/,/g, ';').replace(/"/g, "'");
    const notes = (cut.notes || '').replace(/,/g, ';').replace(/"/g, "'");
    csv += `${cut.shotNumber || i + 1},${cut.timecodeIn || ''},${cut.timecodeOut || ''},${cut.duration || ''},"${desc}","${notes}"\n`;
  });

  return csv;
}

/**
 * Parse a Gemini edit suggestion response into structured cut data.
 * Extracts timeline information from natural language responses.
 *
 * @param {string} response - Gemini's edit suggestion text
 * @returns {Array} Parsed cut objects
 */
export function parseEditSuggestion(response) {
  // This will be enhanced with real Gemini structured output.
  // For now, extract from the mock table format.
  const cuts = [];
  const lines = response.split('\n');

  for (const line of lines) {
    // Match table rows like "| 00:00 | Shot #3 (Tip-off) | 1.5s | Quick tip-off |"
    const match = line.match(/\|\s*([\d:]+)\s*\|\s*(.+?)\s*\|\s*([\d.]+)s?\s*\|\s*(.+?)\s*\|/);
    if (match && !match[1].includes('TC') && !match[1].includes('--')) {
      cuts.push({
        timecodeIn: match[1].includes(':') ? match[1] : `00:${match[1]}`,
        description: match[2].trim(),
        duration: parseFloat(match[3]),
        notes: match[4].trim(),
      });
    }
  }

  return cuts;
}
