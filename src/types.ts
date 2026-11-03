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
  isLineEnd?: boolean;
  isLastWordInLine?: boolean;
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

// ---------------- Settings & Customization Types ----------------

export type ThemePresetId =
  | 'lime'
  | 'cyan'
  | 'purple'
  | 'amber'
  | 'crimson'
  | 'emerald'
  | 'white'
  | 'synthwave'
  | 'custom';

export type FontFamilyId = 'sans' | 'orbitron' | 'mono' | 'serif' | 'rounded';
export type FontWeight = 'normal' | 'medium' | 'semibold' | 'bold' | 'black';
export type TextTransform = 'none' | 'uppercase' | 'capitalize';
export type GlowIntensity = 'off' | 'subtle' | 'normal' | 'supernova' | 'hyperdrive';
export type BeaconStyle = 'reticle' | 'orb' | 'ring' | 'minimal';
export type StarDensity = 'off' | 'low' | 'medium' | 'high';
export type KineticTypographyStyle = 'cinematic' | 'banner' | 'floating' | 'y2k' | 'retro_crt' | 'warp';
export type KineticTypographySize = 'normal' | 'large' | 'huge';

export interface ConstellationSettings {
  // Colors
  themeId: ThemePresetId;
  primaryColor: string;
  glowColor: string;
  bgColor: string;
  pastColor: string;
  futureColor: string;

  // Font
  fontFamily: FontFamilyId;
  fontSize: number; // Base word font size in px (e.g. 13)
  fontWeight: FontWeight;
  textTransform: TextTransform;
  letterSpacing: number; // in em (e.g. 0.04)

  // Glow & Visuals
  glowIntensity: GlowIntensity;
  beaconStyle: BeaconStyle;
  starDensity: StarDensity;
  showProgressTrail: boolean;
  cameraSmoothness: number; // 0.03 (gentle) to 0.12 (snappy)

  // Kinetic Typography
  enableKineticTypography: boolean;
  kineticStyle: KineticTypographyStyle;
  kineticSize: KineticTypographySize;
  kineticWarp?: boolean;
  showNextLinePreview: boolean;
}

export interface ThemePreset {
  id: ThemePresetId;
  name: string;
  primary: string;
  glow: string;
  bg: string;
  past: string;
  future: string;
  badge: string;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'lime',
    name: 'Electric Lime',
    primary: '#d4ff3a',
    glow: '#d4ff3a',
    bg: '#0a0a0a',
    past: '#a4c442',
    future: '#6b7280',
    badge: 'Original',
  },
  {
    id: 'cyan',
    name: 'Cyber Cyan',
    primary: '#00f0ff',
    glow: '#00f0ff',
    bg: '#070f1a',
    past: '#38bdf8',
    future: '#64748b',
    badge: 'Popular',
  },
  {
    id: 'purple',
    name: 'Nebula Violet',
    primary: '#d946ef',
    glow: '#c084fc',
    bg: '#0f071a',
    past: '#c084fc',
    future: '#6b7280',
    badge: 'Cosmic',
  },
  {
    id: 'amber',
    name: 'Solar Gold',
    primary: '#fbbf24',
    glow: '#f59e0b',
    bg: '#120d04',
    past: '#fcd34d',
    future: '#78716c',
    badge: 'Warm',
  },
  {
    id: 'crimson',
    name: 'Mars Crimson',
    primary: '#ff3366',
    glow: '#f43f5e',
    bg: '#14050a',
    past: '#fb7185',
    future: '#71717a',
    badge: 'Vibrant',
  },
  {
    id: 'emerald',
    name: 'Matrix Emerald',
    primary: '#10b981',
    glow: '#34d399',
    bg: '#04140b',
    past: '#6ee7b7',
    future: '#6b7280',
    badge: 'Neon',
  },
  {
    id: 'white',
    name: 'Starlight White',
    primary: '#ffffff',
    glow: '#94a3b8',
    bg: '#08080c',
    past: '#cbd5e1',
    future: '#64748b',
    badge: 'Clean',
  },
  {
    id: 'synthwave',
    name: 'Synthwave',
    primary: '#ff2a85',
    glow: '#00e5ff',
    bg: '#0f051d',
    past: '#f472b6',
    future: '#64748b',
    badge: 'Retro',
  },
];

export const FONT_FAMILY_MAP: Record<
  FontFamilyId,
  { name: string; css: string; description: string }
> = {
  sans: {
    name: 'Modern Sans',
    css: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    description: 'Clean, legible modern interface typography',
  },
  orbitron: {
    name: 'Space Sci-Fi',
    css: '"Orbitron", "Eurostile", -apple-system, sans-serif',
    description: 'Futuristic geometric space exploration look',
  },
  mono: {
    name: 'Terminal Mono',
    css: '"JetBrains Mono", "Fira Code", monospace',
    description: 'Star catalog and celestial telemetry style',
  },
  serif: {
    name: 'Celestial Serif',
    css: '"Cinzel", Georgia, "Times New Roman", serif',
    description: 'Classical astrological atlas & mythology style',
  },
  rounded: {
    name: 'Modern Rounded',
    css: '"Outfit", -apple-system, BlinkMacSystemFont, sans-serif',
    description: 'Friendly contemporary rounded geometric look',
  },
};

export const DEFAULT_SETTINGS: ConstellationSettings = {
  themeId: 'crimson',
  primaryColor: '#ef4444',
  glowColor: '#ff3355',
  bgColor: '#07080b',
  pastColor: '#f87171',
  futureColor: '#6b7280',

  fontFamily: 'sans',
  fontSize: 13,
  fontWeight: 'bold',
  textTransform: 'none',
  letterSpacing: 0.04,

  glowIntensity: 'normal',
  beaconStyle: 'reticle',
  starDensity: 'medium',
  showProgressTrail: true,
  cameraSmoothness: 0.06,

  enableKineticTypography: true,
  kineticStyle: 'cinematic',
  kineticSize: 'large',
  showNextLinePreview: true,
};
