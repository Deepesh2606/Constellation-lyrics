export interface TimedWord {
  text: string;
  startTime: number; // in milliseconds
  endTime: number; // in milliseconds
  duration: number;
}

export interface ParsedLine {
  lineIndex: number;
  timeMs: number;
  endTime: number;
  text: string;
  words: TimedWord[];
}

export interface ConstellationNode {
  id: string;
  lineIndex: number;
  wordIndex: number;
  text: string;
  startTime: number;
  endTime: number;
  x: number;
  y: number;
  prevNodeId?: string;
  prevNode?: { x: number; y: number; startTime: number; endTime: number };
}

export interface AmbientStar {
  x: number;
  y: number;
  r: number;
  baseOpacity: number;
  speed: number;
  phase: number;
}

export interface TrackInfo {
  title: string;
  artist: string;
  album: string;
  durationMs: number;
  uri: string;
  coverUrl?: string;
  presetLrc?: string;
}

export interface LRCLibSearchResult {
  id: number;
  trackName: string;
  artistName: string;
  albumName: string;
  duration: number;
  syncedLyrics: string | null;
  plainLyrics: string | null;
}
