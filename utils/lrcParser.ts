
import { LrcLine } from '../types';

/**
 * Check if text contains SRT subtitle timing cues (e.g. 00:01:23,450 --> 00:01:26,890)
 */
export const isSrt = (content: string): boolean => {
  if (!content || typeof content !== 'string') return false;
  return /\d{1,2}:\d{2}:\d{2}[,.]\d{1,3}\s*-->\s*\d{1,2}:\d{2}:\d{2}[,.]\d{1,3}/.test(content);
};

/**
 * Parse an SRT formatted string into LrcLine[]
 */
export const parseSrt = (srtContent: string): LrcLine[] => {
  if (!srtContent || typeof srtContent !== 'string') return [];

  const clean = srtContent.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const blocks = clean.split(/\n\s*\n+/);
  const result: LrcLine[] = [];

  const timeRegex = /(\d{1,2}):(\d{2}):(\d{2})[,.](\d{1,3})\s*-->\s*(\d{1,2}):(\d{2}):(\d{2})[,.](\d{1,3})/;

  for (const block of blocks) {
    const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) continue;

    // Find the timing line (contains "-->")
    const timeLineIndex = lines.findIndex(l => l.includes('-->'));
    if (timeLineIndex === -1) continue;

    const match = lines[timeLineIndex].match(timeRegex);
    if (!match) continue;

    const hours = parseInt(match[1], 10) || 0;
    const minutes = parseInt(match[2], 10) || 0;
    const seconds = parseInt(match[3], 10) || 0;
    const msStr = match[4].padEnd(3, '0').slice(0, 3);
    const ms = parseInt(msStr, 10) || 0;

    const startSec = hours * 3600 + minutes * 60 + seconds + ms / 1000;

    // The lyric text lines follow the time line
    const textLines = lines.slice(timeLineIndex + 1);
    // Strip HTML/SSA styling tags e.g. <i>, <b>, <font ...>
    const cleanText = textLines
      .join(' ')
      .replace(/<[^>]+>/g, '')
      .replace(/\{[^}]+\}/g, '')
      .trim();

    if (cleanText.length > 0) {
      result.push({
        time: Math.round(startSec * 100) / 100,
        text: cleanText
      });
    }
  }

  return result.sort((a, b) => a.time - b.time);
};

/**
 * Convert parsed SRT or LrcLine[] to standard readable LRC string [mm:ss.xx] Lyric
 */
export const linesToLrcString = (lines: LrcLine[]): string => {
  return lines.map(line => {
    const totalSec = Math.max(0, line.time);
    const mins = Math.floor(totalSec / 60);
    const secs = Math.floor(totalSec % 60);
    const hundredths = Math.floor((totalSec % 1) * 100);
    const mm = String(mins).padStart(2, '0');
    const ss = String(secs).padStart(2, '0');
    const xx = String(hundredths).padStart(2, '0');
    return `[${mm}:${ss}.${xx}] ${line.text}`;
  }).join('\n');
};

/**
 * Converts raw SRT text to readable standard LRC format
 */
export const srtToLrc = (srtContent: string): string => {
  const parsed = parseSrt(srtContent);
  return linesToLrcString(parsed);
};

/**
 * Remove song section labels like [Verse 1], [Chorus], [Bridge], (Intro), etc.
 * Supports:
 * - Standalone section lines (e.g. "[Verse 1]", "Chorus:", "[Chorus - Singer]") -> removed
 * - Timestamped section-only lines (e.g. "[00:10.00] [Verse 1]") -> removed
 * - Timestamped lyrics with section headers (e.g. "[00:10.00] [Verse 1] Lời hát...") -> "[00:10.00] Lời hát..."
 * - Plain lyrics with section headers (e.g. "Verse 1: Lời hát...") -> "Lời hát..."
 */
export const removeSectionLabels = (content: string): { text: string; removedCount: number } => {
  if (!content || typeof content !== 'string') return { text: '', removedCount: 0 };

  const lines = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const sectionKeywords = '(?:verse|chorus|pre-?chorus|post-?chorus|bridge|intro|outro|hook|solo|guitar\\s+solo|interlude|instrumental|refrain|drop|break(?:down)?|coda|vamp|ad-?lib|spoken|điệp\\s*khúc|đoạn|lời|phần)';
  
  // Matches standalone section like [Verse 1], (Chorus), [Chorus: John], Verse 1:, Chorus - Female
  const standaloneRegex = new RegExp(`^\\s*(?:\\[|\\()?\\s*${sectionKeywords}(?:\\s*\\d+)?(?:\\s*[:–—\\-]\\s*[^\\n\\]\\)]*)?\\s*(?:\\]|\\))?\\s*:?\\s*$`, 'i');

  // Matches leading section tag within lyric line, e.g. [Verse 1] or (Chorus) or Verse 1:
  const leadingTagRegex = new RegExp(`^\\s*(?:\\[|\\()\\s*${sectionKeywords}(?:\\s*\\d+)?(?:\\s*[:–—\\-]\\s*[^\\n\\]\\)]*)?\\s*(?:\\]|\\))\\s*:?\\s*|^\\s*${sectionKeywords}\\s*\\d*\\s*:\\s*`, 'i');

  const timeRegex = /^((?:\[\d{1,2}:\d{2}(?:[.:,]\d{1,3})?\]\s*)+)(.*)$/;

  let removedCount = 0;
  const newLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      newLines.push(line);
      continue;
    }

    // Check if line is a timestamped line
    const timeMatch = trimmed.match(timeRegex);
    if (timeMatch) {
      const timestamps = timeMatch[1];
      let lyricPart = timeMatch[2].trim();

      // Check if lyric part is purely a section label e.g. [00:10.00] [Verse 1]
      if (standaloneRegex.test(lyricPart)) {
        removedCount++;
        // Remove this entire line as it only contained a section header
        continue;
      }

      // Check if lyricPart has a leading section tag e.g. [00:10.00] [Verse 1] Hello world
      if (leadingTagRegex.test(lyricPart)) {
        lyricPart = lyricPart.replace(leadingTagRegex, '').trim();
        removedCount++;
        newLines.push(`${timestamps}${lyricPart}`);
      } else {
        newLines.push(line);
      }
      continue;
    }

    // Line without timestamp:
    if (standaloneRegex.test(trimmed)) {
      removedCount++;
      // Drop the standalone section header line
      continue;
    }

    if (leadingTagRegex.test(trimmed)) {
      const stripped = trimmed.replace(leadingTagRegex, '').trim();
      removedCount++;
      newLines.push(stripped);
    } else {
      newLines.push(line);
    }
  }

  return {
    text: newLines.join('\n'),
    removedCount
  };
};

/**
 * Add a prefix to the start and a suffix to the end of each lyric line.
 * If the line has an LRC timestamp like [00:12.34] Lời câu hát,
 * the prefix is inserted immediately after the timestamp(s):
 * [00:12.34] {prefix}Lời câu hát{suffix}
 */
export const addPrefixSuffixToLines = (
  content: string,
  prefix: string,
  suffix: string,
  skipEmpty: boolean = true
): { text: string; modifiedCount: number } => {
  if (!content || typeof content !== 'string') return { text: '', modifiedCount: 0 };
  if (!prefix && !suffix) return { text: content, modifiedCount: 0 };

  const lines = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const timeRegex = /^((?:\[\d{1,2}:\d{2}(?:[.:,]\d{1,3})?\]\s*)+)(.*)$/;

  let modifiedCount = 0;
  const newLines = lines.map(line => {
    const trimmed = line.trim();
    if (!trimmed && skipEmpty) return line;

    const timeMatch = line.match(timeRegex);
    if (timeMatch) {
      const timestamps = timeMatch[1];
      const lyricText = timeMatch[2];
      if (skipEmpty && !lyricText.trim()) return line;
      modifiedCount++;
      return `${timestamps}${prefix}${lyricText}${suffix}`;
    }

    if (skipEmpty && !trimmed) return line;
    modifiedCount++;
    return `${prefix}${line}${suffix}`;
  });

  return {
    text: newLines.join('\n'),
    modifiedCount
  };
};

/**
 * Universal lyric parser supporting both LRC and SRT formats:
 * - Full SRT subtitle file format (e.g. 00:00:12,340 --> 00:00:15,670)
 * - [mm:ss.xx], [mm:ss.xxx], [m:ss.xx]
 * - [mm:ss:xx], [mm:ss,xx], [mm:ss]
 * - [hh:mm:ss.xx]
 * - Multiple timestamps per line: [00:12.34][00:45.67] Lyric text
 * - Metadata ID tags: [ti:...], [ar:...], [offset:...]
 * - Plain text fallback without timestamps (distributed evenly)
 */
export const parseLrc = (lrcContent: string, duration?: number): LrcLine[] => {
  if (!lrcContent || typeof lrcContent !== 'string') return [];

  // Check if content is SRT format
  if (isSrt(lrcContent)) {
    return parseSrt(lrcContent);
  }

  const normalized = lrcContent.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const rawLines = normalized.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  // Match global timestamps: e.g. [01:23.45], [1:23.4], [01:23:45], [01:23,45], [01:23], [01:02:03.45]
  const timeRegex = /\[(?:(\d{1,2}):)?(\d{1,2}):(\d{2})(?:[.:,](\d{1,3}))?\]/g;
  
  // Check global offset tag: [offset:+/-ms]
  let offsetSec = 0;
  const offsetMatch = normalized.match(/\[offset:\s*([+-]?\d+)\s*\]/i);
  if (offsetMatch) {
    const parsedOffset = parseInt(offsetMatch[1], 10);
    if (!isNaN(parsedOffset)) {
      offsetSec = parsedOffset / 1000;
    }
  }

  const result: LrcLine[] = [];
  let foundAnyTimestamp = false;

  rawLines.forEach(line => {
    // Skip pure metadata headers like [ti:Title], [ar:Artist], [al:Album], [by:...], [re:...]
    if (/^\[(ti|ar|al|by|offset|length|re|ve):/i.test(line)) {
      return;
    }

    const matches = Array.from(line.matchAll(timeRegex));
    if (matches && matches.length > 0) {
      foundAnyTimestamp = true;
      // Strip all timestamp brackets to get the actual lyric text
      const cleanText = line.replace(timeRegex, '').trim();
      
      matches.forEach(m => {
        let hours = 0;
        let minutes = 0;
        let seconds = 0;
        let ms = 0;

        if (m[1] !== undefined) {
          // Format has 3 units: hours:minutes:seconds
          hours = parseInt(m[1], 10) || 0;
          minutes = parseInt(m[2], 10) || 0;
          seconds = parseInt(m[3], 10) || 0;
        } else {
          // Format has 2 units: minutes:seconds
          minutes = parseInt(m[2], 10) || 0;
          seconds = parseInt(m[3], 10) || 0;
        }

        if (m[4]) {
          const rawMs = m[4];
          if (rawMs.length === 1) ms = parseInt(rawMs, 10) * 100;
          else if (rawMs.length === 2) ms = parseInt(rawMs, 10) * 10;
          else ms = parseInt(rawMs.substring(0, 3), 10);
        }

        let totalSeconds = hours * 3600 + minutes * 60 + seconds + ms / 1000 + offsetSec;
        totalSeconds = Math.max(0, totalSeconds);

        if (cleanText.length > 0) {
          result.push({
            time: Math.round(totalSeconds * 100) / 100,
            text: cleanText
          });
        }
      });
    }
  });

  // If no timestamps were found at all, treat as plain text lyrics
  if (!foundAnyTimestamp && rawLines.length > 0) {
    const textLines = rawLines.filter(l => !l.startsWith('[') && l.trim().length > 0);
    const count = textLines.length;
    if (count > 0) {
      const step = (duration && duration > 0) ? (duration / count) : 3.5;
      return textLines.map((text, i) => ({
        time: Math.round((i * step) * 100) / 100,
        text
      }));
    }
  }

  return result.sort((a, b) => a.time - b.time);
};

