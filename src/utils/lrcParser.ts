import { ParsedLine, TimedWord } from '../types';

export function parseLrc(lrcText: string): ParsedLine[] {
  if (!lrcText || typeof lrcText !== 'string') return [];

  const lines = lrcText.split('\n');
  const parsedRaw: { timeMs: number; text: string }[] = [];
  const timeRegex = /\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\]/g;

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed) continue;

    // Check for timestamps
    const matches = [...trimmed.matchAll(timeRegex)];
    if (!matches.length) continue;

    // Extract text after stripping timestamps
    const text = trimmed.replace(timeRegex, '').trim();
    if (!text) continue;

    for (const m of matches) {
      const min = parseInt(m[1], 10);
      const sec = parseInt(m[2], 10);
      let ms = 0;
      if (m[3]) {
        ms = m[3].length === 2 ? parseInt(m[3], 10) * 10 : parseInt(m[3], 10);
      }
      const timeMs = min * 60000 + sec * 1000 + ms;
      parsedRaw.push({ timeMs, text });
    }
  }

  // Sort chronologically
  parsedRaw.sort((a, b) => a.timeMs - b.timeMs);

  // Group or spread timestamps across words
  const result: ParsedLine[] = [];

  parsedRaw.forEach((item, idx) => {
    const nextTime = idx < parsedRaw.length - 1 ? parsedRaw[idx + 1].timeMs : item.timeMs + 4000;
    const rawDiff = nextTime - item.timeMs;
    // Keep reasonable line duration bounds
    const lineDuration = Math.max(1200, Math.min(rawDiff > 0 ? rawDiff : 3500, 8000));

    const words = item.text.split(/\s+/).filter(Boolean);
    const wordCount = words.length || 1;

    const timedWords: TimedWord[] = words.map((w, wIdx) => {
      const startTime = item.timeMs + (wIdx / wordCount) * lineDuration;
      const endTime = item.timeMs + ((wIdx + 1) / wordCount) * lineDuration;
      return {
        text: w,
        startTime,
        endTime,
        duration: endTime - startTime,
      };
    });

    result.push({
      lineIndex: idx,
      timeMs: item.timeMs,
      endTime: nextTime,
      text: item.text,
      words: timedWords,
    });
  });

  return result;
}
