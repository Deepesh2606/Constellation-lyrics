// Spicetify Custom App: Constellation
// Synced lyrics celestial constellation animation on customizable space background with dynamic glow
// Features: Direct Spotify client lyrics (CosmosAsync) + LRCLIB fallback + 60/120 FPS + Linear Word Sync + Visual Settings Studio

const react = (window.Spicetify && window.Spicetify.React) || window.React;
const Component = (react && react.Component) ? react.Component : class { };

// Built-in Visual Presets
const THEME_PRESETS_JS = [
  { id: "dynamic", name: "Dynamic Album Cover", primary: "#fbbf24", glow: "#f59e0b", bg: "#0a0a0a", past: "#fcd34d", future: "#78716c", badge: "Dynamic" },
  { id: "lime", name: "Electric Lime", primary: "#d4ff3a", glow: "#d4ff3a", bg: "#0a0a0a", past: "#a4c442", future: "#6b7280", badge: "Original" },
  { id: "cyan", name: "Cyber Cyan", primary: "#00f0ff", glow: "#00f0ff", bg: "#070f1a", past: "#38bdf8", future: "#64748b", badge: "Popular" },
  { id: "purple", name: "Nebula Violet", primary: "#d946ef", glow: "#c084fc", bg: "#0f071a", past: "#c084fc", future: "#6b7280", badge: "Cosmic" },
  { id: "amber", name: "Solar Gold", primary: "#fbbf24", glow: "#f59e0b", bg: "#120d04", past: "#fcd34d", future: "#78716c", badge: "Warm" },
  { id: "crimson", name: "Mars Crimson", primary: "#ff3366", glow: "#f43f5e", bg: "#14050a", past: "#fb7185", future: "#71717a", badge: "Vibrant" },
  { id: "emerald", name: "Matrix Emerald", primary: "#10b981", glow: "#34d399", bg: "#04140b", past: "#6ee7b7", future: "#6b7280", badge: "Neon" },
  { id: "white", name: "Starlight White", primary: "#ffffff", glow: "#94a3b8", bg: "#08080c", past: "#cbd5e1", future: "#64748b", badge: "Clean" },
  { id: "synthwave", name: "Synthwave", primary: "#ff2a85", glow: "#00e5ff", bg: "#0f051d", past: "#f472b6", future: "#64748b", badge: "Retro" }
];

const FONT_MAP_JS = {
  sans: { name: "Modern Sans", css: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
  orbitron: { name: "Space Sci-Fi", css: '"Orbitron", "Eurostile", -apple-system, sans-serif' },
  mono: { name: "Terminal Mono", css: '"JetBrains Mono", "Fira Code", monospace' },
  serif: { name: "Celestial Serif", css: '"Cinzel", Georgia, serif' },
  rounded: { name: "Modern Rounded", css: '"Outfit", -apple-system, sans-serif' }
};

const DEFAULT_CONSTELLATION_SETTINGS = {
  themeId: "dynamic",
  primaryColor: "#d4ff3a",
  glowColor: "#d4ff3a",
  bgColor: "#0a0a0a",
  pastColor: "#a4c442",
  futureColor: "#6b7280",
  fontFamily: "sans",
  fontSize: 13,
  fontWeight: "bold",
  textTransform: "none",
  letterSpacing: 0.04,
  glowIntensity: "normal",
  beaconStyle: "reticle",     // "reticle" | "pulsar" | "supergiant" | "orb" | "ring" | "diamond" | "minimal"
  showProgressTrail: true,
  starDensity: "medium",      // "off" | "low" | "medium" | "high"
  enableAuroraBorealis: true, // Cosmic Northern Lights ethereal glowing curtain
  enableMeteorShower: true,   // Cosmic Meteor Showers and shooting stars
  enableDiffractionSpikes: true, // NASA/JWST 4-point diamond star cross flares
  enableOrbitalRings: true,   // Gravitational planetary orbit rings
  viewMode: "constellation",  // "constellation" | "kinetic"
  kineticStyle: "cinematic",  // "cinematic" | "warp" | "y2k" | "retro_crt"
  kineticSize: "large",       // "normal" | "large" | "huge"
  showNextLinePreview: true,
  syncOffset: 0,             // Default 0ms exact realtime sync
  enableAlbumBlurBg: true,   // Soft ambient blurred album art backdrop
  backdropSource: "album",   // "album" (Track Album Art) | "playlist" (Context Playlist Cover Art)
  pinTrackInfo: false,       // Pin music name & artist badge permanently to top-left
  neverHideHud: false,       // Never auto-hide player bar
  enableBeatPulse: true,     // Rhythmic bass pulse simulation on words and stars
  enableSupernova: true,     // Shockwave ripple & sparks on word/star jump
  enableAudioHud: true,      // Live audio equalizer & BPM/Key metadata
  showSongSections: false,   // Off by default: Song sections (Verse/Chorus) timeline
  autoScreensaver: true      // Clean OLED screensaver mode: hide HUD after 4s
};

const MIN_WORD_DISTANCE = 56;
const lyricsMemoryCache = new Map();

// Built-in presets for instant playback fallback
const PRESET_TRACKS = [
  {
    title: "Starboy",
    artist: "The Weeknd, Daft Punk",
    album: "Starboy",
    durationMs: 230453,
    lrc: `[00:00.00](Ooh, yeah)
[00:03.20](I'm trying to put you in the worst mood, ah)
[00:07.10](P1 cleaner than your church shoes, ah)
[00: 10.50] Milli point two just to hurt you, ah
[00: 14.20] All red Lamb' just to tease you, ah
[00: 17.80] None of these toys on lease too, ah
[00: 21.40] Made your whole year in a week too, yah
[00: 25.00] Main bitch out of your league too, ah
[00: 28.60] Side bitch out of your league too, ah
[00: 32.40] House so empty, need a centipede
[00: 35.80]20 racks a table cut like ebony
[00: 39.40] Cut that ivory into skinny pieces
[00: 43.00] Then she clean it with her face, man, I love my baby
[00: 47.20] You talking about money, I was making that
[00: 50.80] Look what you done done, I'm a motherfucking starboy
[00: 54.60] Look what you done done, I'm a starboy
[00: 58.20] Every day a nigga try to test me, ah
[01:02.00] Every day a nigga try to end me, ah
[01:05.60] Coming for the king, that's a far cry, ah
[01:09.30] I come alive in the fall time, I
[01: 13.10] No competition, don't hesitate
[01: 16.80] Let's take it higher into outer space
[01: 20.40] Look what you done done, I'm a starboy
[01: 24.00] Look what you done done, I'm a starboy`
  },
{
  title: "Blinding Lights",
    artist: "The Weeknd",
      album: "After Hours",
        durationMs: 200040,
          lrc: `[00:00.00] (Yeah)
[00:13.40] I've been tryna call
[00:16.20] I've been on my own for long enough
[00:20.40] Maybe you can show me how to love, maybe
[00:27.20] I'm going through withdrawals
[00:30.10] You don't even have to do too much
[00:34.20] You can turn me on with just a touch, baby
[00:40.80] I look around and Sin City's cold and empty
[00:47.60] No one's around to judge me
[00:51.20] I can't see clearly when you're gone
[00:55.00] I said, ooh, I'm blinded by the lights
[01:02.20] No, I can't sleep until I feel your touch
[01:09.10] I said, ooh, I'm drowning in the night
[01:16.00] Oh, when I'm like this, you're the one I trust`
}
];

// LRC Parser
function parseLrc(lrcText) {
  if (!lrcText || typeof lrcText !== "string") return [];
  const lines = lrcText.split("\n");
  const parsed = [];
  const timeRegex = /\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\]/g;

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed) continue;
    const matches = [...trimmed.matchAll(timeRegex)];
    if (!matches.length) continue;
    const text = trimmed.replace(timeRegex, "").trim();
    if (!text) continue;

    for (const m of matches) {
      const min = parseInt(m[1], 10);
      const sec = parseInt(m[2], 10);
      let ms = 0;
      if (m[3]) {
        ms = m[3].length === 2 ? parseInt(m[3], 10) * 10 : parseInt(m[3], 10);
      }
      const timeMs = min * 60000 + sec * 1000 + ms;
      parsed.push({ timeMs, text });
    }
  }

  parsed.sort((a, b) => a.timeMs - b.timeMs);

  return parsed.map((item, idx) => {
    const nextTime = idx < parsed.length - 1 ? parsed[idx + 1].timeMs : item.timeMs + 4000;
    const words = item.text.split(/\s+/).filter(Boolean);
    const wordCount = words.length || 1;
    const rawSpan = nextTime - item.timeMs;
    const vocalSpan = (rawSpan > 5000) ? Math.min(rawSpan, Math.max(2500, wordCount * 550)) : Math.max(600, rawSpan);

    // Official Spicetify / Spotify lyrics linear line synchronization:
    // Exactly matches Spicetify Lyrics Plus line progress without jumping ahead or lagging
    const timedWords = words.map((w, wIdx) => {
      const wordStart = item.timeMs + Math.floor((wIdx / wordCount) * vocalSpan);
      const wordEnd = item.timeMs + Math.floor(((wIdx + 1) / wordCount) * vocalSpan);
      return {
        text: w,
        startTime: wordStart,
        endTime: wordEnd,
        duration: wordEnd - wordStart
      };
    });

    return {
      lineIndex: idx,
      timeMs: item.timeMs,
      endTime: nextTime,
      text: item.text,
      words: timedWords
    };
  });
}

// High-precision alignment of Spotify syllables to whole words
function parseSpotifySyllables(lineText, syllables, lineStart, lineEnd) {
  if (!syllables || !syllables.length) return null;

  const hasNumChars = typeof syllables[0].numChars === "number";
  const hasText = typeof syllables[0].text === "string" && syllables[0].text.length > 0;

  if (hasNumChars) {
    let charIndex = 0;
    const words = [];
    let curWord = "";
    let curWordStart = null;

    for (let i = 0; i < syllables.length; i++) {
      const s = syllables[i];
      const sStart = parseInt(s.startTimeMs || lineStart, 10);
      const count = s.numChars || 0;
      
      const slice = lineText.slice(charIndex, charIndex + count);
      charIndex += count;

      for (let c = 0; c < slice.length; c++) {
        const ch = slice[c];
        if (/\s/.test(ch)) {
          if (curWord.trim()) {
            words.push({
              text: curWord.trim(),
              startTime: curWordStart !== null ? curWordStart : sStart,
              endTime: 0
            });
            curWord = "";
            curWordStart = null;
          }
        } else {
          if (curWordStart === null) curWordStart = sStart;
          curWord += ch;
        }
      }
    }

    if (curWord.trim()) {
      words.push({
        text: curWord.trim(),
        startTime: curWordStart !== null ? curWordStart : lineStart,
        endTime: lineEnd
      });
    }

    if (words.length > 0) {
      for (let i = 0; i < words.length - 1; i++) {
        const nextStart = words[i + 1].startTime;
        words[i].endTime = Math.max(words[i].startTime + 150, nextStart);
        words[i].duration = words[i].endTime - words[i].startTime;
      }
      const lastWord = words[words.length - 1];
      lastWord.endTime = Math.max(lastWord.startTime + 250, lineEnd);
      lastWord.duration = lastWord.endTime - lastWord.startTime;
      return words;
    }
  }

  if (hasText) {
    const words = [];
    let curWord = "";
    let curWordStart = null;

    for (let i = 0; i < syllables.length; i++) {
      const s = syllables[i];
      const sStart = parseInt(s.startTimeMs || lineStart, 10);
      const sText = s.text || "";

      if (curWordStart === null) curWordStart = sStart;
      curWord += sText;

      if (sText.endsWith(" ") || i === syllables.length - 1) {
        if (curWord.trim()) {
          words.push({
            text: curWord.trim(),
            startTime: curWordStart,
            endTime: 0
          });
        }
        curWord = "";
        curWordStart = null;
      }
    }

    if (words.length > 0) {
      for (let i = 0; i < words.length - 1; i++) {
        const nextStart = words[i + 1].startTime;
        words[i].endTime = Math.max(words[i].startTime + 150, nextStart);
        words[i].duration = words[i].endTime - words[i].startTime;
      }
      const lastWord = words[words.length - 1];
      lastWord.endTime = Math.max(lastWord.startTime + 250, lineEnd);
      lastWord.duration = lastWord.endTime - lastWord.startTime;
      return words;
    }
  }

  return null;
}

// Parse Spotify Client's Native Color-Lyrics (from Spicetify.CosmosAsync)
function parseSpotifyNativeLines(lines, durationSec) {
  if (!lines || !Array.isArray(lines)) return [];
  const parsed = [];
  const totalMs = (durationSec && durationSec > 0) ? durationSec * 1000 : 210000;

  let hasTimestamps = false;
  for (let i = 0; i < lines.length; i++) {
    if (parseInt(lines[i].startTimeMs || "0", 10) > 0) {
      hasTimestamps = true;
      break;
    }
  }

  for (let idx = 0; idx < lines.length; idx++) {
    const item = lines[idx];
    const text = (item.words || item.text || (item.syllables && item.syllables.map(s => s.text).join(" ")) || "").trim();
    if (!text || text === "♪") continue;

    let startTime = 0;
    let nextTime = 0;

    if (hasTimestamps) {
      startTime = parseInt(item.startTimeMs || "0", 10);
      nextTime = idx < lines.length - 1
        ? parseInt(lines[idx + 1].startTimeMs || "0", 10)
        : startTime + 4000;
      if (nextTime <= startTime) nextTime = startTime + 3500;
    } else {
      const interval = totalMs / (lines.length + 1);
      startTime = Math.floor(idx * interval);
      nextTime = Math.floor((idx + 1) * interval);
    }

    // High precision syllable alignment to eliminate lyrics running ahead of vocals
    let timedWords = parseSpotifySyllables(text, item.syllables, startTime, nextTime);

    if (!timedWords || !timedWords.length) {
      const words = text.split(/\s+/).filter(Boolean);
      const wordCount = words.length || 1;
      const rawSpan = nextTime - startTime;
      const vocalSpan = (rawSpan > 5000) ? Math.min(rawSpan, Math.max(2500, wordCount * 550)) : Math.max(600, rawSpan);

      timedWords = words.map((w, wIdx) => {
        const wordStart = startTime + Math.floor((wIdx / wordCount) * vocalSpan);
        const wordEnd = startTime + Math.floor(((wIdx + 1) / wordCount) * vocalSpan);
        return {
          text: w,
          startTime: wordStart,
          endTime: wordEnd,
          duration: wordEnd - wordStart
        };
      });
    }

    parsed.push({
      lineIndex: parsed.length,
      timeMs: startTime,
      endTime: nextTime,
      text: text,
      words: timedWords
    });
  }

  return parsed;
}

// Detect song sections (Intro, Verse, Chorus, Bridge, Outro) from lyrics cadence and repeats
function computeSongSections(lyrics, totalDurationMs) {
  if (!lyrics || lyrics.length < 3) return [];
  const sections = [];
  const total = totalDurationMs || (lyrics[lyrics.length - 1].timeMs + 8000);

  // If first lyric is after > 5s, tag Intro
  if (lyrics[0].timeMs > 5000) {
    sections.push({ name: "Intro", timeMs: 0, endTime: lyrics[0].timeMs });
  }

  // Count line phrase frequency for chorus detection
  const phraseCounts = {};
  lyrics.forEach((l) => {
    const norm = (l.text || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    if (norm.length > 6) {
      phraseCounts[norm] = (phraseCounts[norm] || 0) + 1;
    }
  });

  let currentSection = { name: "Verse 1", timeMs: lyrics[0].timeMs, endTime: lyrics[0].endTime };
  let verseCount = 1;
  let chorusCount = 1;

  for (let i = 1; i < lyrics.length; i++) {
    const line = lyrics[i];
    const prev = lyrics[i - 1];
    const norm = (line.text || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    const isRepeat = (phraseCounts[norm] || 0) > 1;
    const timeGap = line.timeMs - prev.endTime;

    if (timeGap > 4500 || (isRepeat && !currentSection.name.startsWith("Chorus"))) {
      currentSection.endTime = prev.endTime;
      sections.push(currentSection);

      if (isRepeat) {
        currentSection = { name: `Chorus ${chorusCount > 1 ? chorusCount : ""}`.trim(), timeMs: line.timeMs, endTime: line.endTime };
        chorusCount++;
      } else {
        verseCount++;
        currentSection = { name: `Verse ${verseCount}`, timeMs: line.timeMs, endTime: line.endTime };
      }
    } else {
      currentSection.endTime = line.endTime;
    }
  }
  if (currentSection) sections.push(currentSection);

  // Outro tag if song continues after last line
  const lastLine = lyrics[lyrics.length - 1];
  if (total - lastLine.endTime > 5000) {
    sections.push({ name: "Outro", timeMs: lastLine.endTime, endTime: total });
  }

  return sections;
}

// Generate organic celestial constellation clusters
function buildConstellationLayout(lines, width, height, minDistance = 56) {
  const nodes = [];
  if (!lines || !lines.length) return nodes;

  const placedPoints = [];
  const checkMinDistance = (x, y, minDist) => {
    for (let i = 0; i < placedPoints.length; i++) {
      const p = placedPoints[i];
      const dx = p.x - x;
      const dy = p.y - y;
      if (dx * dx + dy * dy < minDist * minDist) {
        return false;
      }
    }
    return true;
  };

  const centerX = width / 2;
  const centerY = height / 2;

  let currentClusterX = centerX;
  let currentClusterY = centerY;
  let clusterAngle = Math.PI * 0.25;

  lines.forEach((line, lIdx) => {
    const clusterStep = 170 + (Math.sin(lIdx * 0.8) * 40 + 50);
    clusterAngle += 0.45 + (Math.sin(lIdx) * 0.2);
    currentClusterX += Math.cos(clusterAngle) * clusterStep;
    currentClusterY += Math.sin(clusterAngle) * clusterStep;

    const lineNodes = [];
    let lastX = currentClusterX;
    let lastY = currentClusterY;
    let lineAngle = clusterAngle + (Math.sin(lIdx * 2) * 0.4);

    line.words.forEach((wordObj, wIdx) => {
      let bestX = lastX;
      let bestY = lastY;
      let found = false;

      for (let attempt = 0; attempt < 28; attempt++) {
        const dist = 75 + Math.random() * 65;
        const deltaAngle = (Math.random() - 0.5) * (Math.PI * 0.7);
        const candAngle = lineAngle + deltaAngle;
        const candX = (wIdx === 0 ? currentClusterX : lastX) + Math.cos(candAngle) * dist;
        const candY = (wIdx === 0 ? currentClusterY : lastY) + Math.sin(candAngle) * dist;

        if (checkMinDistance(candX, candY, minDistance)) {
          bestX = candX;
          bestY = candY;
          lineAngle = candAngle;
          found = true;
          break;
        }
      }

      if (!found) {
        const fallbackDist = 85;
        bestX = lastX + Math.cos(lineAngle) * fallbackDist;
        bestY = lastY + Math.sin(lineAngle) * fallbackDist;
      }

      placedPoints.push({ x: bestX, y: bestY });
      const prev = wIdx > 0 ? lineNodes[wIdx - 1] : undefined;
      lastX = bestX;
      lastY = bestY;

      const isLineEnd = wIdx === line.words.length - 1;
      const node = {
        id: `node-${lIdx}-${wIdx}`,
        lineIndex: lIdx,
        wordIndex: wIdx,
        isLineEnd: isLineEnd,
        isLastWordInLine: isLineEnd,
        text: wordObj.text,
        startTime: wordObj.startTime,
        endTime: wordObj.endTime,
        x: bestX,
        y: bestY,
        prevNodeId: prev ? prev.id : undefined,
        prevNode: prev ? { x: prev.x, y: prev.y, startTime: prev.startTime, endTime: prev.endTime } : undefined
      };

      lineNodes.push(node);
      nodes.push(node);
    });
  });

  return nodes;
}

// Generate ambient background stars
function generateAmbientStars(count, width, height) {
  const stars = [];
  const spread = Math.max(width, height) * 4;
  for (let i = 0; i < count; i++) {
    stars.push({
      x: (Math.random() - 0.5) * spread,
      y: (Math.random() - 0.5) * spread,
      r: Math.random() * 1.5 + 0.4,
      dur: (Math.random() * 3 + 2).toFixed(2),
      delay: (Math.random() * 4).toFixed(2)
    });
  }
  return stars;
}

// Robust Dynamic Album Artwork Color Extractor Engine
// Combines Spicetify.colorExtractor -> Spotify Cosmos colorextractor API -> GraphQL -> Blob Canvas
function resolveCoverUrl(url) {
  if (!url) return "";
  if (url.startsWith("spotify:image:")) {
    return "https://i.scdn.co/image/" + url.replace("spotify:image:", "");
  }
  return url;
}

const playlistCoverCache = new Map();
async function fetchPlaylistCover(contextUri) {
  if (!contextUri || !contextUri.includes("playlist")) return null;
  if (playlistCoverCache.has(contextUri)) return playlistCoverCache.get(contextUri);

  if (window.Spicetify) {
    // 1. Spicetify CosmosAsync core-playlist metadata
    if (window.Spicetify.CosmosAsync) {
      try {
        const res = await window.Spicetify.CosmosAsync.get(`sp://core-playlist/v1/playlist/${contextUri}/metadata`, {
          policy: { picture: true, name: true }
        });
        const pic = res?.metadata?.picture;
        if (pic) {
          const resolved = resolveCoverUrl(pic);
          playlistCoverCache.set(contextUri, resolved);
          return resolved;
        }
      } catch (e) {}
    }

    // 2. Spicetify Platform PlaylistAPI
    if (window.Spicetify.Platform && window.Spicetify.Platform.PlaylistAPI) {
      try {
        const meta = await window.Spicetify.Platform.PlaylistAPI.getMetadata(contextUri);
        const pic = meta?.images?.[0]?.url || meta?.picture;
        if (pic) {
          const resolved = resolveCoverUrl(pic);
          playlistCoverCache.set(contextUri, resolved);
          return resolved;
        }
      } catch (e) {}
    }
  }

  return null;
}

const toHex2 = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");

function parseHexColor(hex) {
  if (!hex || typeof hex !== "string") return null;
  let clean = hex.replace("#", "").trim();
  if (clean.length === 3) clean = clean.split("").map((c) => c + c).join("");
  if (clean.length !== 6) return null;
  return {
    r: parseInt(clean.substring(0, 2), 16),
    g: parseInt(clean.substring(2, 4), 16),
    b: parseInt(clean.substring(4, 6), 16)
  };
}

function generateDynamicPalette(r, g, b) {
  // Boost vibrancy if too dull
  const max = Math.max(r, g, b);
  const boost = max < 150 ? 150 / Math.max(1, max) : 1;
  const pr = Math.min(255, Math.round(r * boost));
  const pg = Math.min(255, Math.round(g * boost));
  const pb = Math.min(255, Math.round(b * boost));
  const primaryHex = `#${toHex2(pr)}${toHex2(pg)}${toHex2(pb)}`;

  // Bright radiating glow
  const gr = Math.min(255, Math.round(pr * 1.2));
  const gg = Math.min(255, Math.round(pg * 1.2));
  const gb = Math.min(255, Math.round(pb * 1.2));
  const glowHex = `#${toHex2(gr)}${toHex2(gg)}${toHex2(gb)}`;

  // Soft past/sung words tone
  const pastHex = `#${toHex2(pr * 0.8)}${toHex2(pg * 0.8)}${toHex2(pb * 0.8)}`;

  // Deep immersive space backdrop tinted with the album aura
  const bgHex = `#${toHex2(Math.max(6, pr * 0.06))}${toHex2(Math.max(6, pg * 0.06))}${toHex2(Math.max(8, pb * 0.07))}`;

  return {
    primaryColor: primaryHex,
    glowColor: glowHex,
    pastColor: pastHex,
    bgColor: bgHex,
    futureColor: "#71717a",
    themeId: "dynamic"
  };
}

async function extractTrackColors(uri, coverUrl, callback) {
  if (typeof callback !== "function") return;

  // Method 1: Official Native Spicetify colorExtractor API
  if (window.Spicetify && typeof window.Spicetify.colorExtractor === "function" && uri) {
    try {
      const swatches = await window.Spicetify.colorExtractor(uri);
      if (swatches) {
        const hex = swatches.VIBRANT || swatches.LIGHT_VIBRANT || swatches.PROMINENT || swatches.VIBRANT_NON_ALARMING;
        const rgb = parseHexColor(hex);
        if (rgb) {
          callback(generateDynamicPalette(rgb.r, rgb.g, rgb.b));
          return;
        }
      }
    } catch (e) {}
  }

  // Method 2: Spotify CosmosAsync colorextractor endpoint
  if (window.Spicetify && window.Spicetify.CosmosAsync && uri) {
    try {
      const url = `https://spclient.wg.spotify.com/colorextractor/v1/extract-presets?uri=${encodeURIComponent(uri)}&format=json`;
      const res = await window.Spicetify.CosmosAsync.get(url);
      if (res && res.entries && res.entries.length > 0 && Array.isArray(res.entries[0].color_swatches)) {
        const swatches = res.entries[0].color_swatches;
        const hit = swatches.find((s) => s.preset === "VIBRANT")
          || swatches.find((s) => s.preset === "LIGHT_VIBRANT")
          || swatches.find((s) => s.preset === "PROMINENT")
          || swatches.find((s) => s.preset === "VIBRANT_NON_ALARMING")
          || swatches[0];
        if (hit && typeof hit.color === "number") {
          const hex = `#${hit.color.toString(16).padStart(6, "0")}`;
          const rgb = parseHexColor(hex);
          if (rgb) {
            callback(generateDynamicPalette(rgb.r, rgb.g, rgb.b));
            return;
          }
        }
      }
    } catch (e) {}
  }

  // Method 3: Spotify GraphQL CoverArt extractedColors
  if (window.Spicetify && window.Spicetify.GraphQL && window.Spicetify.GraphQL.Definitions && uri) {
    try {
      const { fetchExtractedColorForTrackEntity } = window.Spicetify.GraphQL.Definitions;
      if (fetchExtractedColorForTrackEntity) {
        const { data } = await window.Spicetify.GraphQL.Request(fetchExtractedColorForTrackEntity, { uri });
        const hex = data?.trackUnion?.albumOfTrack?.coverArt?.extractedColors?.colorRaw?.hex
          || data?.trackUnion?.albumOfTrack?.coverArt?.extractedColors?.colorLight?.hex
          || data?.trackUnion?.albumOfTrack?.coverArt?.extractedColors?.colorDark?.hex;
        const rgb = parseHexColor(hex);
        if (rgb) {
          callback(generateDynamicPalette(rgb.r, rgb.g, rgb.b));
          return;
        }
      }
    } catch (e) {}
  }

  // Method 4: Fetch image as Blob -> ObjectURL -> Canvas (Immune to Canvas CORS Taint)
  const resolved = resolveCoverUrl(coverUrl);
  if (resolved) {
    try {
      const response = await fetch(resolved);
      if (response.ok) {
        const blob = await response.blob();
        const objUrl = URL.createObjectURL(blob);
        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement("canvas");
            canvas.width = 48;
            canvas.height = 48;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, 48, 48);
            const data = ctx.getImageData(0, 0, 48, 48).data;
            URL.revokeObjectURL(objUrl);

            let maxSat = -1;
            let vibrant = null;
            let rSum = 0, gSum = 0, bSum = 0, count = 0;

            for (let i = 0; i < data.length; i += 16) {
              const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
              if (a < 128) continue;
              const max = Math.max(r, g, b);
              const min = Math.min(r, g, b);
              const lum = (max + min) / 2;
              if (lum < 28 || lum > 238) continue;
              const sat = max === min ? 0 : (max - min) / (lum > 127 ? 510 - max - min : max + min);
              if (sat > maxSat) {
                maxSat = sat;
                vibrant = { r, g, b };
              }
              rSum += r; gSum += g; bSum += b; count++;
            }

            const chosen = vibrant || (count > 0 ? { r: Math.round(rSum / count), g: Math.round(gSum / count), b: Math.round(bSum / count) } : { r: 251, g: 191, b: 36 });
            callback(generateDynamicPalette(chosen.r, chosen.g, chosen.b));
          } catch (e) {
            URL.revokeObjectURL(objUrl);
          }
        };
        img.onerror = () => URL.revokeObjectURL(objUrl);
        img.src = objUrl;
        return;
      }
    } catch (e) {}
  }
}

function getTrackInfo() {
  if (!window.Spicetify || !window.Spicetify.Player) return null;
  const data = window.Spicetify.Player.data;
  if (!data) return null;
  const item = data.item || data.track;
  if (!item) return null;

  const title = item.name || (item.metadata && item.metadata.title) || "";
  let artist = "";
  if (Array.isArray(item.artists)) {
    artist = item.artists.map((a) => a.name).join(", ");
  } else if (item.metadata && item.metadata.artist_name) {
    artist = item.metadata.artist_name;
  }

  const album = (item.album && item.album.name) || (item.metadata && item.metadata.album_title) || "";
  const durationMs = (item.duration && item.duration.milliseconds) || (item.metadata && item.metadata.duration) || 180000;
  const uri = item.uri || (item.metadata && item.metadata.uri) || `${title}-${artist}`;

  // Extract cover art URL with spotify:image: protocol resolution
  let coverUrl = (item.metadata && (item.metadata.image_url || item.metadata.image_large_url || item.metadata.image_small_url)) || "";
  if (!coverUrl && item.album && Array.isArray(item.album.images) && item.album.images.length > 0) {
    coverUrl = item.album.images[0].url;
  }
  if (!coverUrl && item.images && Array.isArray(item.images) && item.images.length > 0) {
    coverUrl = item.images[0].url;
  }
  coverUrl = resolveCoverUrl(coverUrl);

    const contextUri = (data && (data.context_uri || (data.context && data.context.uri))) || (item.metadata && item.metadata.context_uri) || "";
  return { title, artist, album, durationMs: parseInt(durationMs, 10), uri, coverUrl, contextUri };
}

// Clean title/artist strings preserving all world alphabets (Latin, Devanagari/Hindi, CJK, Cyrillic, Arabic, Hebrew, etc.)
function cleanSearchString(str) {
  if (!str) return "";
  return str
    .replace(/\s*-\s*(remaster(ed)?|deluxe|bonus|single|radio edit|live|original motion picture soundtrack|from .*).*/i, "")
    .replace(/\s*\((feat\.|from |with |remaster|deluxe|version|edition).*?\)/i, "")
    .replace(/\s*\[(feat\.|from |with |remaster|deluxe|version|edition).*?\]/i, "")
    .replace(/[^\p{L}\p{M}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Helper to convert unsynced/plain lyrics to cadenced timed lines
function parsePlainLyricsToCadence(plainLyrics, durationSec) {
  if (!plainLyrics) return null;
  const plainLines = plainLyrics.split("\n").map(l => l.trim()).filter(Boolean);
  if (plainLines.length === 0) return null;
  const totalMs = (durationSec && durationSec > 0) ? durationSec * 1000 : (plainLines.length * 3600);
  const interval = totalMs / (plainLines.length + 2);
  return plainLines.map((line, idx) => {
    const start = Math.floor((idx + 1) * interval);
    const words = line.split(/\s+/).filter(Boolean);
    const wDur = interval / (words.length || 1);
    return {
      lineIndex: idx,
      timeMs: start,
      endTime: start + interval,
      text: line,
      words: words.map((w, wIdx) => ({
        text: w,
        startTime: start + Math.floor(wIdx * wDur),
        endTime: start + Math.floor((wIdx + 1) * wDur),
        duration: Math.floor(wDur)
      }))
    };
  });
}

// Lyrics Fetcher: Direct Spotify CosmosAsync -> Netease Cloud -> LRCLIB API -> Kugou -> Built-in Presets
async function fetchLyrics(track, artist, album, durationSec, uri) {
  const cacheKey = uri || `${track}-${artist}`;
  if (lyricsMemoryCache.has(cacheKey)) {
    const cached = lyricsMemoryCache.get(cacheKey);
    if (cached && cached.lines && cached.lines.length > 0) {
      return cached;
    }
  }

  // 1. Official Spotify Client Lyrics (Matches native Spotify right panel exactly with &market=from_token)
  if (window.Spicetify && window.Spicetify.CosmosAsync && uri) {
    let trackId = "";
    if (typeof uri === "string") {
      const parts = uri.split(":");
      trackId = parts[2] || uri.replace(/^spotify:track:/, "");
    }
    trackId = (trackId || "").split("?")[0].trim();

    // Method A: Official Spotify Color Lyrics v2 with clean track ID and &market=from_token
    if (trackId) {
      try {
        const url = `https://spclient.wg.spotify.com/color-lyrics/v2/track/${trackId}?format=json&vocalRemoval=false&market=from_token`;
        const res = await window.Spicetify.CosmosAsync.get(url);
        const lines = res?.lyrics?.lines || res?.lines;
        if (Array.isArray(lines) && lines.length > 0) {
          const parsed = parseSpotifyNativeLines(lines, durationSec);
          if (parsed.length > 0) {
            const result = { source: "Spotify Official", lines: parsed };
            lyricsMemoryCache.set(cacheKey, result);
            return result;
          }
        }
      } catch (e) {
        // continue to next method
      }

      // Method B: Spotify internal core-lyrics service
      try {
        const url = `sp://core-lyrics/v1/tracks/${encodeURIComponent(uri)}`;
        const res = await window.Spicetify.CosmosAsync.get(url);
        const lines = res?.lyrics?.lines || res?.lines;
        if (Array.isArray(lines) && lines.length > 0) {
          const parsed = parseSpotifyNativeLines(lines, durationSec);
          if (parsed.length > 0) {
            const result = { source: "Spotify Client", lines: parsed };
            lyricsMemoryCache.set(cacheKey, result);
            return result;
          }
        }
      } catch (e) {
        // continue to next method
      }

      // Method C: Spotify color-lyrics without market param fallback
      try {
        const url = `https://spclient.wg.spotify.com/color-lyrics/v2/track/${trackId}?format=json&vocalRemoval=false`;
        const res = await window.Spicetify.CosmosAsync.get(url);
        const lines = res?.lyrics?.lines || res?.lines;
        if (Array.isArray(lines) && lines.length > 0) {
          const parsed = parseSpotifyNativeLines(lines, durationSec);
          if (parsed.length > 0) {
            const result = { source: "Spotify Native", lines: parsed };
            lyricsMemoryCache.set(cacheKey, result);
            return result;
          }
        }
      } catch (e) {
        // continue to next provider
      }
    }
  }

  // Extract primary artist for high-accuracy matching
  const firstArtist = (artist || "").split(/[,&/]/)[0].trim();
  const cleanT = cleanSearchString(track);
  const cleanA = cleanSearchString(firstArtist);
  const fullCleanA = cleanSearchString(artist);

  // 2. Query Netease Cloud Music (Massive synced catalog including hip-hop, international, and anime)
  try {
    const searchUrl = `https://music.xianqiao.wang/neteaseapiv2/search?limit=6&type=1&keywords=${encodeURIComponent(`${cleanT} ${cleanA}`)}`;
    const searchRes = window.Spicetify && window.Spicetify.CosmosAsync
      ? await window.Spicetify.CosmosAsync.get(searchUrl)
      : await (await fetch(searchUrl)).json();
    const songs = searchRes?.result?.songs;
    if (Array.isArray(songs) && songs.length > 0) {
      const lyricUrl = `https://music.xianqiao.wang/neteaseapiv2/lyric?id=${songs[0].id}`;
      const lyricRes = window.Spicetify && window.Spicetify.CosmosAsync
        ? await window.Spicetify.CosmosAsync.get(lyricUrl)
        : await (await fetch(lyricUrl)).json();
      const lrc = lyricRes?.lrc?.lyric;
      if (lrc && lrc.trim()) {
        const parsed = parseLrc(lrc);
        if (parsed && parsed.length > 0) {
          const res = { source: "Netease Cloud", lines: parsed };
          lyricsMemoryCache.set(cacheKey, res);
          return res;
        }
      }
    }
  } catch (e) {
    // continue to LRCLIB
  }

  // 3. Robust Multi-Query LRCLIB API (Includes Lrclib-Client header to eliminate 503 errors)
  try {
    const lrclibHeaders = {
      "Lrclib-Client": "Constellation (https://github.com/spicetify/cli)"
    };

    const tryLrclibData = (data) => {
      if (!data) return null;
      if (Array.isArray(data)) {
        // 1st priority: synced lyrics
        const hit = data.find((d) => d.syncedLyrics && d.syncedLyrics.trim().length > 0);
        if (hit && hit.syncedLyrics) {
          const parsed = parseLrc(hit.syncedLyrics);
          if (parsed && parsed.length > 0) return parsed;
        }
        // 2nd priority: plain lyrics to cadence
        const plainHit = data.find((d) => d.plainLyrics && d.plainLyrics.trim().length > 0);
        if (plainHit && plainHit.plainLyrics) {
          return parsePlainLyricsToCadence(plainHit.plainLyrics, durationSec);
        }
      } else if (data.syncedLyrics && data.syncedLyrics.trim().length > 0) {
        const parsed = parseLrc(data.syncedLyrics);
        if (parsed && parsed.length > 0) return parsed;
      } else if (data.plainLyrics && data.plainLyrics.trim().length > 0) {
        return parsePlainLyricsToCadence(data.plainLyrics, durationSec);
      }
      return null;
    };

    const lrclibEndpoints = [
      `https://lrclib.net/api/get?track_name=${encodeURIComponent(cleanT)}&artist_name=${encodeURIComponent(cleanA)}${durationSec ? `&duration=${durationSec}` : ""}`,
      `https://lrclib.net/api/get?track_name=${encodeURIComponent(track)}&artist_name=${encodeURIComponent(firstArtist)}${durationSec ? `&duration=${durationSec}` : ""}`,
      `https://lrclib.net/api/search?q=${encodeURIComponent(`${cleanT} ${cleanA}`)}`,
      `https://lrclib.net/api/search?q=${encodeURIComponent(`${track} ${firstArtist}`)}`,
      `https://lrclib.net/api/search?q=${encodeURIComponent(`${cleanT} ${fullCleanA}`)}`,
      `https://lrclib.net/api/search?q=${encodeURIComponent(cleanT)}`
    ];

    for (const url of lrclibEndpoints) {
      try {
        const res = await fetch(url, { headers: lrclibHeaders });
        if (!res.ok) continue;
        const json = await res.json();
        const parsed = tryLrclibData(json);
        if (parsed && parsed.length > 0) {
          const result = { source: "LRCLIB", lines: parsed };
          lyricsMemoryCache.set(cacheKey, result);
          return result;
        }
      } catch (err) {
        // try next endpoint
      }
    }
  } catch (err) {
    console.warn("[Constellation] LRCLIB fetch warning:", err);
  }

  // 4. Kugou Search Fallback (Extensive Asian, Bollywood and International database)
  try {
    const q = `${cleanT} ${cleanA}`.trim();
    const durMs = durationSec ? Math.round(durationSec * 1000) : "";
    const kgSearchUrl = `https://lyrics.kugou.com/search?ver=1&man=yes&client=pc&keyword=${encodeURIComponent(q)}&duration=${durMs}&hash=`;
    const kgRes = await (await fetch(kgSearchUrl)).json();
    if (kgRes && kgRes.candidates && kgRes.candidates.length > 0) {
      const cand = kgRes.candidates[0];
      const dlUrl = `https://lyrics.kugou.com/download?ver=1&client=pc&id=${cand.id}&accesskey=${cand.accesskey}&fmt=lrc&charset=utf8`;
      const dlRes = await (await fetch(dlUrl)).json();
      if (dlRes && dlRes.content) {
        let decoded = "";
        try {
          decoded = decodeURIComponent(escape(atob(dlRes.content)));
        } catch (_) {
          decoded = atob(dlRes.content);
        }
        if (decoded) {
          const parsed = parseLrc(decoded);
          if (parsed && parsed.length > 0) {
            const res = { source: "Kugou", lines: parsed };
            lyricsMemoryCache.set(cacheKey, res);
            return res;
          }
        }
      }
    }
  } catch (err) {
    // kugou fallback warning ignored
  }

  // 5. Built-in Preset Fallback
  const lowerT = cleanT.toLowerCase();
  for (const preset of PRESET_TRACKS) {
    if (lowerT.includes(preset.title.toLowerCase()) || preset.title.toLowerCase().includes(lowerT)) {
      const parsed = parseLrc(preset.lrc);
      const res = { source: "Preset", lines: parsed };
      lyricsMemoryCache.set(cacheKey, res);
      return res;
    }
  }

  return null;
}

// Inject Scoped Stylesheet into DOM with dynamic CSS variables
const STYLE_ID = "spicetify-constellation-styles";
function injectStyles(settings = DEFAULT_CONSTELLATION_SETTINGS) {
  // Ensure Google Fonts for luxury celestial typography
  if (!document.getElementById("constellation-google-fonts")) {
    const fontLink = document.createElement("link");
    fontLink.id = "constellation-google-fonts";
    fontLink.rel = "stylesheet";
    fontLink.href = "https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=JetBrains+Mono:wght@400;500;700&family=Orbitron:wght@400;600;800&family=Outfit:wght@400;600;700;800;900&family=Syne:wght@700;800;900&display=swap";
    document.head.appendChild(fontLink);
  }

  let styleEl = document.getElementById(STYLE_ID);
  if (!styleEl) {
    styleEl = document.createElement("style");
    styleEl.id = STYLE_ID;
    document.head.appendChild(styleEl);
  }

  const s = settings;
  const fontCss = (FONT_MAP_JS[s.fontFamily] && FONT_MAP_JS[s.fontFamily].css) || FONT_MAP_JS.sans.css;
  const weightVal = s.fontWeight === "black" ? 900 : s.fontWeight === "bold" ? 700 : s.fontWeight === "semibold" ? 600 : s.fontWeight === "medium" ? 500 : 400;

  styleEl.textContent = `
    #spicetify-constellation-root {
      position: relative;
      width: 100%;
      height: 100%;
      min-height: 100%;
      background-color: ${s.bgColor};
      color: #e5e7eb;
      overflow: hidden;
      user-select: none;
      font-family: ${fontCss};
      box-sizing: border-box;
      cursor: grab;
      transition: background-color 0.3s ease;
    }
    #spicetify-constellation-root:active {
      cursor: grabbing;
    }
    #spicetify-constellation-root.fullscreen-mode {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      z-index: 999999 !important;
    }
    #spicetify-constellation-root * {
      box-sizing: border-box;
    }
    #spicetify-constellation-root .constellation-svg {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: block;
      will-change: transform;
    }
    #camera-viewport-group {
      will-change: transform;
    }

    /* Ambient Stars CSS Twinkle */
    @keyframes const-twinkle {
      0%, 100% { opacity: 0.12; }
      50% { opacity: 0.65; }
    }
    .ambient-star {
      animation: const-twinkle var(--twinkle-dur, 3s) infinite ease-in-out;
      animation-delay: var(--twinkle-del, 0s);
    }

    /* Active Halo Ring Pulse */
    @keyframes const-halo-pulse {
      0%, 100% { transform: scale(0.92); opacity: 0.75; }
      50% { transform: scale(1.25); opacity: 1; }
    }
    .active-halo-ring {
      transform-box: fill-box;
      transform-origin: center;
      animation: const-halo-pulse 2.2s infinite ease-in-out;
    }

    /* Star node styles & smooth fast transitions */
    .star-node {
      cursor: pointer;
      pointer-events: auto;
    }
    .star-node circle {
      transition: r 0.10s cubic-bezier(0.16, 1, 0.3, 1), fill 0.10s ease, opacity 0.10s ease;
    }
    .star-node text {
      transition: fill 0.10s ease, opacity 0.10s ease, font-size 0.10s cubic-bezier(0.16, 1, 0.3, 1);
      font-family: ${fontCss};
      text-transform: ${s.textTransform};
      letter-spacing: ${s.letterSpacing}em;
    }
    .star-node:hover circle {
      transform: scale(1.4);
      transform-origin: center;
    }
    .star-node:hover text {
      fill: #ffffff !important;
      opacity: 1 !important;
      font-weight: 700 !important;
    }

    /* Future Words */
    .star-node.is-future circle {
      r: 2px;
      fill: ${s.futureColor};
      opacity: 0.32;
    }
    .star-node.is-future text {
      fill: ${s.futureColor};
      opacity: 0.38;
      font-size: ${s.fontSize * 0.88}px;
      font-weight: 400;
    }

    /* Upcoming words in active line */
    .star-node.is-current-upcoming circle {
      r: 3.2px;
      fill: ${s.primaryColor};
      opacity: 0.75;
    }
    .star-node.is-current-upcoming text {
      fill: ${s.primaryColor};
      opacity: 0.82;
      font-size: ${s.fontSize * 0.95}px;
      font-weight: 500;
    }

    /* Active word currently sung */
    .star-node.is-active circle {
      r: 7.2px;
      fill: ${s.primaryColor};
      opacity: 1.0;
      filter: url(#lime-glow);
    }
    .star-node.is-active text {
      fill: #ffffff;
      opacity: 1.0;
      font-size: ${s.fontSize * 1.25}px;
      font-weight: ${weightVal};
      filter: url(#text-glow);
    }

    /* Sung words in active line */
    .star-node.is-current-past circle {
      r: 4.2px;
      fill: ${s.pastColor};
      opacity: 0.95;
    }
    .star-node.is-current-past text {
      fill: ${s.pastColor};
      opacity: 0.95;
      font-size: ${s.fontSize}px;
      font-weight: 600;
    }

    /* Past sung lines */
    .star-node.is-past circle {
      r: 2.2px;
      fill: ${s.pastColor};
      opacity: 0.35;
    }
    .star-node.is-past text {
      fill: ${s.pastColor};
      opacity: 0.35;
      font-size: ${s.fontSize * 0.88}px;
      font-weight: 400;
    }

    /* Line-End Popped Word Aesthetics */
    @keyframes const-line-end-pop-anim {
      0% {
        transform: scale(0.9);
      }
      45% {
        transform: scale(1.42);
      }
      75% {
        transform: scale(1.15);
      }
      100% {
        transform: scale(1.24);
      }
    }

    .star-node.is-line-end .star-node-pop-ring {
      transition: r 0.25s cubic-bezier(0.16, 1, 0.3, 1), stroke 0.2s ease, opacity 0.2s ease, stroke-width 0.2s ease;
      transform-origin: center;
      transform-box: fill-box;
    }

    /* When line ends or is-popped */
    .star-node.is-line-end.is-popped,
    .star-node.is-line-end.is-active {
      animation: const-line-end-pop-anim 0.36s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
      transform-origin: center;
      transform-box: fill-box;
    }

    .star-node.is-line-end.is-popped .star-node-core,
    .star-node.is-line-end.is-active .star-node-core {
      r: 8.5px !important;
      fill: #ffffff !important;
      filter: url(#lime-glow) drop-shadow(0 0 12px ${s.primaryColor}) !important;
      opacity: 1 !important;
    }

    .star-node.is-line-end.is-popped .star-node-pop-ring,
    .star-node.is-line-end.is-active .star-node-pop-ring {
      r: 15px !important;
      stroke: ${s.primaryColor} !important;
      stroke-width: 2.2px !important;
      stroke-dasharray: none !important;
      opacity: 1 !important;
      filter: drop-shadow(0 0 8px ${s.glowColor}) !important;
      animation: const-halo-pulse 2s infinite ease-in-out;
    }

    .star-node.is-line-end.is-popped text,
    .star-node.is-line-end.is-active text {
      fill: #ffffff !important;
      opacity: 1 !important;
      font-size: ${s.fontSize * 1.36}px !important;
      font-weight: 800 !important;
      filter: url(#text-glow) drop-shadow(0 0 10px ${s.glowColor}) !important;
    }

    /* Past line-end words remain distinctly popped phrase anchors */
    .star-node.is-line-end.is-current-past .star-node-core,
    .star-node.is-line-end.is-past .star-node-core {
      r: 4.8px !important;
      fill: ${s.primaryColor} !important;
      opacity: 0.88 !important;
      filter: drop-shadow(0 0 6px ${s.primaryColor}66) !important;
    }

    .star-node.is-line-end.is-current-past .star-node-pop-ring,
    .star-node.is-line-end.is-past .star-node-pop-ring {
      r: 11px !important;
      stroke: ${s.primaryColor} !important;
      stroke-width: 1.4px !important;
      stroke-dasharray: 2 2 !important;
      opacity: 0.55 !important;
    }

    .star-node.is-line-end.is-current-past text,
    .star-node.is-line-end.is-past text {
      fill: ${s.primaryColor} !important;
      opacity: 0.85 !important;
      font-size: ${s.fontSize * 1.05}px !important;
      font-weight: 700 !important;
    }

    /* Connecting Lines */
    .const-line {
      transition: stroke 0.3s ease, stroke-width 0.3s ease, stroke-opacity 0.3s ease;
    }
    .const-line.is-future {
      stroke: ${s.primaryColor};
      stroke-width: 1.1px;
      stroke-opacity: 0.14;
    }
    .const-line.is-active {
      stroke: ${s.primaryColor};
      stroke-width: 2.4px;
      stroke-opacity: 0.95;
      filter: url(#lime-glow);
    }
    .const-line.is-past {
      stroke: ${s.pastColor};
      stroke-width: 1.4px;
      stroke-opacity: 0.65;
    }
    .const-line.is-old {
      stroke: ${s.pastColor};
      stroke-width: 1px;
      stroke-opacity: 0.12;
    }

    /* Pinned Music Name & Artist Badge */
    .const-pinned-track-badge {
      position: absolute;
      top: 22px;
      left: 22px;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 6px 14px 6px 8px;
      background: rgba(12, 13, 18, 0.78);
      backdrop-filter: blur(24px) saturate(180%);
      -webkit-backdrop-filter: blur(24px) saturate(180%);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 9999px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
      z-index: 25;
      user-select: none;
      pointer-events: auto;
      max-width: 340px;
      transition: all 0.3s ease;
    }
    .const-pinned-track-badge:hover {
      background: rgba(12, 13, 18, 0.92);
      border-color: rgba(255, 255, 255, 0.16);
      transform: scale(1.02);
    }
    .pinned-track-art {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      object-fit: cover;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
      flex-shrink: 0;
    }
    .pinned-track-texts {
      display: flex;
      flex-direction: column;
      gap: 1px;
      overflow: hidden;
    }
    .pinned-track-title {
      font-size: 11.5px;
      font-weight: 700;
      color: #ffffff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .pinned-track-artist {
      font-size: 10px;
      color: #9ca3af;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* Ultra-Minimal Luxury Floating HUD */
    #spicetify-constellation-root .constellation-bottom-bar {
      position: absolute;
      bottom: 22px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 6px 14px 6px 18px;
      background: rgba(12, 13, 18, 0.84);
      backdrop-filter: blur(28px) saturate(190%);
      -webkit-backdrop-filter: blur(28px) saturate(190%);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 9999px;
      box-shadow: 0 16px 44px rgba(0, 0, 0, 0.65), 0 0 1px rgba(255, 255, 255, 0.15);
      z-index: 30;
      pointer-events: auto;
      max-width: 92%;
      transition: opacity 0.35s ease, transform 0.35s ease, border-color 0.25s ease;
    }
    #spicetify-constellation-root .constellation-bottom-bar:hover {
      border-color: rgba(255, 255, 255, 0.16);
    }
    #spicetify-constellation-root .constellation-bottom-bar.hud-hidden {
      opacity: 0;
      pointer-events: none;
      transform: translate(-50%, 20px);
    }

    #spicetify-constellation-root .hud-track-meta {
      display: flex;
      flex-direction: column;
      gap: 1px;
      min-width: 110px;
      max-width: 260px;
      padding-right: 4px;
    }
    #spicetify-constellation-root .hud-title {
      font-size: 13px;
      font-weight: 600;
      color: #ffffff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      display: flex;
      align-items: center;
      gap: 7px;
    }
    #spicetify-constellation-root .hud-artist {
      font-size: 11px;
      color: #9ca3af;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    #spicetify-constellation-root .hud-badge {
      display: inline-block;
      width: 6.5px;
      height: 6.5px;
      border-radius: 50%;
      background-color: ${s.primaryColor};
      box-shadow: 0 0 8px ${s.glowColor};
      animation: const-pulse 2s infinite ease-in-out;
      flex-shrink: 0;
    }
    #spicetify-constellation-root .hud-btn {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: rgba(255, 255, 255, 0.72);
      border-radius: 50%;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
      flex-shrink: 0;
      padding: 0;
    }
    #spicetify-constellation-root .hud-btn:hover {
      background: rgba(255, 255, 255, 0.12);
      border-color: rgba(255, 255, 255, 0.18);
      color: #ffffff;
      transform: scale(1.06);
    }
    #spicetify-constellation-root .hud-btn.active {
      background: ${s.primaryColor}22;
      border-color: ${s.primaryColor}66;
      color: ${s.primaryColor};
    }

    /* Minimal Segmented Mode Switcher in HUD */
    .hud-mode-pill {
      display: inline-flex;
      align-items: center;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 9999px;
      padding: 2px;
      gap: 2px;
    }
    .hud-mode-seg {
      background: transparent;
      border: none;
      color: rgba(255, 255, 255, 0.55);
      font-size: 11px;
      font-weight: 600;
      padding: 4px 10px;
      border-radius: 9999px;
      cursor: pointer;
      transition: all 0.2s ease;
      white-space: nowrap;
    }
    .hud-mode-seg:hover {
      color: #ffffff;
    }
    .hud-mode-seg.active {
      background: ${s.primaryColor};
      color: #000000;
      font-weight: 700;
      box-shadow: 0 2px 8px ${s.primaryColor}55;
    }

    /* Minimal Docked Song Section Minimap Bar */
    .constellation-sections-bar {
      position: absolute;
      bottom: 74px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      align-items: center;
      gap: 3px;
      background: rgba(12, 13, 18, 0.68);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.06);
      padding: 3px 8px;
      border-radius: 9999px;
      z-index: 30;
      transition: opacity 0.3s ease, transform 0.3s ease;
      user-select: none;
    }
    .constellation-sections-bar.hud-hidden {
      opacity: 0;
      pointer-events: none;
      transform: translate(-50%, 12px);
    }
    .section-pill {
      background: transparent;
      border: none;
      color: rgba(255, 255, 255, 0.45);
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      padding: 2px 8px;
      border-radius: 9999px;
      cursor: pointer;
      transition: all 0.2s ease;
      white-space: nowrap;
    }
    .section-pill:hover {
      color: #ffffff;
      background: rgba(255, 255, 255, 0.08);
    }
    .section-pill.active {
      color: #000000;
      background: ${s.primaryColor};
      box-shadow: 0 0 10px ${s.primaryColor}55;
      font-weight: 700;
    }

    /* Luxury Two-Column Settings Dialog (Spicy Lyrics Architecture) */
    .constellation-modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.72);
      backdrop-filter: blur(28px) saturate(180%);
      -webkit-backdrop-filter: blur(28px) saturate(180%);
      z-index: 999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      animation: const-fade-in 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      transition: background 0.22s ease;
    }
    .constellation-modal-backdrop.preview-mode {
      background: transparent;
      pointer-events: none;
    }
    @keyframes const-fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes const-modal-pop {
      from { opacity: 0; transform: scale(0.97) translateY(6px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }
    .constellation-modal-panel {
      pointer-events: auto;
      background: rgba(16, 18, 24, 0.95);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 18px;
      width: 780px;
      max-width: 92vw;
      height: 570px;
      max-height: 86vh;
      overflow: hidden;
      display: flex;
      flex-direction: row;
      box-shadow: 0 32px 80px rgba(0, 0, 0, 0.88), 0 0 0 1px rgba(255, 255, 255, 0.06);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #ffffff;
      animation: const-modal-pop 0.24s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      transition: opacity 0.2s ease, transform 0.2s ease;
    }
    .constellation-modal-panel.preview-mode {
      opacity: 0;
      pointer-events: none;
      transform: scale(0.98);
    }

    /* Left Sidebar */
    .const-settings-sidebar {
      width: 220px;
      background: rgba(0, 0, 0, 0.22);
      border-right: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      flex-direction: column;
      padding: 22px 14px;
      flex-shrink: 0;
      box-sizing: border-box;
    }
    .const-sidebar-brand {
      display: flex;
      align-items: center;
      gap: 7px;
      font-size: 11.5px;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.55);
      letter-spacing: -0.01em;
    }
    .const-sidebar-title {
      font-size: 22px;
      font-weight: 800;
      color: #ffffff;
      margin-top: 4px;
      letter-spacing: -0.02em;
    }
    .const-sidebar-search-box {
      position: relative;
      margin: 16px 0 14px 0;
    }
    .const-sidebar-search-input {
      width: 100%;
      box-sizing: border-box;
      padding: 8px 12px 8px 32px;
      border-radius: 9px;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: #ffffff;
      font-size: 13px;
      outline: none;
      transition: all 0.18s ease;
    }
    .const-sidebar-search-input:focus {
      background: rgba(255, 255, 255, 0.1);
      border-color: ${s.primaryColor}88;
      box-shadow: 0 0 0 3px ${s.primaryColor}22;
    }
    .const-sidebar-search-icon {
      position: absolute;
      left: 10px;
      top: 50%;
      transform: translateY(-50%);
      pointer-events: none;
      opacity: 0.45;
      display: flex;
      align-items: center;
    }
    .const-sidebar-nav {
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex: 1;
    }
    .const-nav-item {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      padding: 9px 12px;
      border-radius: 9px;
      font-size: 13px;
      font-weight: 500;
      color: rgba(255, 255, 255, 0.65);
      background: transparent;
      border: none;
      cursor: pointer;
      text-align: left;
      transition: all 0.15s ease;
    }
    .const-nav-item:hover {
      background: rgba(255, 255, 255, 0.07);
      color: rgba(255, 255, 255, 0.95);
    }
    .const-nav-item.active {
      background: rgba(255, 255, 255, 0.12);
      color: #ffffff;
      font-weight: 600;
    }

    /* Right Main Pane */
    .const-settings-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      background: transparent;
    }
    .const-main-header {
      padding: 22px 26px 14px 26px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-shrink: 0;
    }
    .const-main-title {
      font-size: 22px;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: -0.02em;
    }
    .const-main-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .const-header-action-btn {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: rgba(255, 255, 255, 0.7);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s ease;
    }
    .const-header-action-btn:hover {
      background: rgba(255, 255, 255, 0.14);
      color: #ffffff;
    }

    .const-main-scroll {
      padding: 4px 26px 24px 26px;
      overflow-y: auto;
      flex: 1;
    }
    .const-main-scroll::-webkit-scrollbar {
      width: 5px;
    }
    .const-main-scroll::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.12);
      border-radius: 5px;
    }

    .const-section-title {
      font-size: 12.5px;
      font-weight: 700;
      color: rgba(255, 255, 255, 0.55);
      margin: 16px 0 8px 2px;
      text-transform: capitalize;
    }
    .const-section-title:first-child {
      margin-top: 2px;
    }

    .const-settings-card {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.07);
      border-radius: 12px;
      overflow: hidden;
      margin-bottom: 16px;
    }
    .const-settings-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 13px 18px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
      gap: 16px;
      transition: background 0.15s ease;
    }
    .const-settings-row:hover {
      background: rgba(255, 255, 255, 0.02);
    }
    .const-settings-row:last-child {
      border-bottom: none;
    }
    .const-row-label {
      font-size: 13.5px;
      font-weight: 600;
      color: #ffffff;
    }
    .const-row-desc {
      font-size: 11.5px;
      color: rgba(255, 255, 255, 0.45);
      margin-top: 2px;
      line-height: 1.3;
    }

    /* Floating Eye Preview Pill */
    .const-preview-float-pill {
      position: fixed;
      top: 24px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(16, 18, 24, 0.92);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 9999px;
      padding: 10px 20px;
      display: flex;
      align-items: center;
      gap: 10px;
      color: #ffffff;
      font-size: 12.5px;
      font-weight: 600;
      cursor: pointer;
      z-index: 10000;
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.65);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      pointer-events: auto;
      transition: all 0.2s ease;
      animation: const-modal-pop 0.25s ease forwards;
    }
    .const-preview-float-pill:hover {
      background: rgba(26, 30, 40, 0.96);
      border-color: ${s.primaryColor}88;
      box-shadow: 0 12px 36px rgba(0, 0, 0, 0.8), 0 0 16px ${s.primaryColor}33;
    }

    .const-palette-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      margin-bottom: 8px;
    }
    .const-palette-card {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 10px;
      padding: 9px 6px;
      cursor: pointer;
      text-align: center;
      transition: all 0.2s ease;
    }
    .const-palette-card:hover {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.18);
    }
    .const-palette-card.active {
      border-color: ${s.primaryColor};
      background: ${s.primaryColor}18;
      box-shadow: 0 0 12px ${s.primaryColor}44;
    }

    /* Fullscreen indicator banner */
    #spicetify-constellation-root .fullscreen-hint {
      position: absolute;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(18, 18, 18, 0.75);
      border: 1px solid rgba(255, 255, 255, 0.12);
      padding: 6px 14px;
      border-radius: 9999px;
      font-size: 11.5px;
      color: #9ca3af;
      letter-spacing: 0.04em;
      pointer-events: none;
      transition: opacity 0.5s ease;
      z-index: 30;
    }

    #spicetify-constellation-root .constellation-status-banner {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 14px;
      color: #9ca3af;
      font-size: 14.5px;
      letter-spacing: 0.03em;
      text-align: center;
      z-index: 10;
      pointer-events: none;
    }
    #spicetify-constellation-root .status-icon {
      color: ${s.primaryColor};
      filter: drop-shadow(0 0 12px ${s.glowColor}80);
    }
    #spicetify-constellation-root .status-spinner {
      animation: const-spin 1.2s linear infinite;
    }
    @keyframes const-pulse {
      0%, 100% { opacity: 0.6; transform: scale(0.9); }
      50% { opacity: 1; transform: scale(1.25); }
    }
    @keyframes const-spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    /* Supernova Shockwave and Radiant Sparks */
    @keyframes supernova-shockwave-pulse {
      0% { transform: scale(0.15); opacity: 1; stroke-width: 4px; }
      70% { opacity: 0.8; stroke-width: 2px; }
      100% { transform: scale(3.2); opacity: 0; stroke-width: 0.5px; }
    }
    .supernova-shockwave {
      transform-origin: center;
      transform-box: fill-box;
      animation: supernova-shockwave-pulse 0.85s cubic-bezier(0.1, 0.9, 0.2, 1) forwards;
    }
    @keyframes supernova-spark-shoot {
      0% { stroke-dashoffset: 60; opacity: 1; }
      100% { stroke-dashoffset: 0; opacity: 0; }
    }
    .supernova-spark {
      stroke-width: 2px;
      stroke-linecap: round;
      stroke-dasharray: 24 60;
      animation: supernova-spark-shoot 0.8s ease-out forwards;
    }

    /* Deep Space Ambient Comet / Shooting Star */
    @keyframes comet-glide {
      0% { transform: translate(-120px, -60px) rotate(-32deg); opacity: 0; }
      8% { opacity: 0.85; }
      30% { transform: translate(110vw, 75vh) rotate(-32deg); opacity: 0; }
      100% { transform: translate(110vw, 75vh) rotate(-32deg); opacity: 0; }
    }
    .ambient-comet {
      position: absolute;
      top: 8%;
      left: 15%;
      width: 150px;
      height: 2px;
      background: linear-gradient(90deg, rgba(255,255,255,0.95), ${s.primaryColor}, transparent);
      box-shadow: 0 0 16px ${s.primaryColor};
      border-radius: 999px;
      pointer-events: none;
      z-index: 1;
      animation: comet-glide 16s infinite ease-in-out;
    }

    /* Live Equalizer Audio Spectrum in HUD */
    .hud-equalizer-bars {
      display: inline-flex;
      align-items: flex-end;
      gap: 3px;
      height: 14px;
      margin-left: 8px;
      vertical-align: middle;
    }
    .hud-eq-bar {
      width: 3px;
      background: ${s.primaryColor};
      border-radius: 2px;
      transform-origin: bottom;
      transition: height 0.15s ease;
    }
    @keyframes eq-pulse-1 { 0%, 100% { height: 4px; } 50% { height: 14px; } }
    @keyframes eq-pulse-2 { 0%, 100% { height: 12px; } 50% { height: 5px; } }
    @keyframes eq-pulse-3 { 0%, 100% { height: 6px; } 50% { height: 15px; } }
    @keyframes eq-pulse-4 { 0%, 100% { height: 14px; } 50% { height: 7px; } }
    @keyframes eq-pulse-5 { 0%, 100% { height: 8px; } 50% { height: 13px; } }
    .hud-eq-bar.playing.bar-1 { animation: eq-pulse-1 0.65s infinite ease-in-out; }
    .hud-eq-bar.playing.bar-2 { animation: eq-pulse-2 0.55s infinite ease-in-out 0.1s; }
    .hud-eq-bar.playing.bar-3 { animation: eq-pulse-3 0.72s infinite ease-in-out 0.2s; }
    .hud-eq-bar.playing.bar-4 { animation: eq-pulse-4 0.6s infinite ease-in-out 0.15s; }
    .hud-eq-bar.playing.bar-5 { animation: eq-pulse-5 0.78s infinite ease-in-out 0.05s; }
    .hud-eq-bar.paused { height: 3px; opacity: 0.4; }

    /* Song Section Minimap Timeline Bar */
    .constellation-sections-bar {
      position: absolute;
      bottom: 84px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      align-items: center;
      gap: 6px;
      background: rgba(12, 14, 24, 0.72);
      backdrop-filter: blur(20px) saturate(160%);
      -webkit-backdrop-filter: blur(20px) saturate(160%);
      border: 1px solid rgba(255, 255, 255, 0.09);
      padding: 4px 10px;
      border-radius: 9999px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
      z-index: 100;
      transition: opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1), transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
      user-select: none;
    }
    .constellation-sections-bar.hud-hidden {
      opacity: 0;
      pointer-events: none;
      transform: translate(-50%, 20px);
    }
    .section-pill {
      background: transparent;
      border: none;
      color: rgba(255, 255, 255, 0.5);
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      padding: 4px 10px;
      border-radius: 9999px;
      cursor: pointer;
      transition: all 0.2s ease;
      white-space: nowrap;
    }
    .section-pill:hover {
      color: #ffffff;
      background: rgba(255, 255, 255, 0.1);
    }
    .section-pill.active {
      color: #000000;
      background: ${s.primaryColor};
      box-shadow: 0 0 14px ${s.primaryColor}88;
      font-weight: 800;
    }

    /* Kinetic Style 2: Cyber Chrome Y2K */
    .kinetic-y2k-mode .is-active .kinetic-word-active {
      background: linear-gradient(180deg, #ffffff 0%, #cbd5e1 45%, ${s.primaryColor} 100%) !important;
      -webkit-background-clip: text !important;
      -webkit-text-fill-color: transparent !important;
      filter: drop-shadow(0 0 16px ${s.primaryColor}) drop-shadow(0 4px 12px rgba(0,0,0,0.8)) !important;
      transform: skewX(-6deg) scale(1.08) !important;
      font-family: "Orbitron", "Syne", sans-serif !important;
      letter-spacing: -0.01em !important;
    }

    /* Kinetic Style 3: Retro CRT Scanlines & Phosphor Glitch */
    .kinetic-retro-crt-mode::after {
      content: "";
      position: absolute;
      inset: 0;
      background: repeating-linear-gradient(0deg, rgba(0,0,0,0.22) 0px, rgba(0,0,0,0.22) 1px, transparent 1px, transparent 3px);
      pointer-events: none;
      z-index: 20;
      opacity: 0.65;
    }
    .kinetic-retro-crt-mode .is-active .kinetic-word-active {
      text-shadow: -2px 0 rgba(255, 0, 80, 0.75), 2px 0 rgba(0, 240, 255, 0.75), 0 0 18px ${s.primaryColor} !important;
      font-family: "JetBrains Mono", monospace !important;
    }

    /* Kinetic Style 4: Clean 3D Spatial Typography Mode (No distracting lines) */
    .kinetic-warp-mode .kinetic-vertical-track {
      transform-style: preserve-3d;
      will-change: transform;
      z-index: 5;
    }
    .kinetic-warp-mode .kinetic-vertical-row.is-active {
      transform: translateZ(95px) scale(1.15) !important;
      text-shadow: 0 0 24px ${s.primaryColor}aa, 0 0 50px ${s.glowColor}55 !important;
    }
    .kinetic-warp-mode .kinetic-vertical-row.is-past {
      transform: translateZ(-230px) translateY(-58px) rotateX(25deg) scale(0.68) !important;
      opacity: 0.28 !important;
      filter: blur(1.5px) !important;
    }
    .kinetic-warp-mode .kinetic-vertical-row.is-future {
      transform: translateZ(-160px) translateY(54px) rotateX(-22deg) scale(0.76) !important;
      opacity: 0.22 !important;
      filter: blur(1.2px) !important;
    }
    .kinetic-warp-mode .is-active .kinetic-word-active {
      display: inline-block;
      color: #ffffff !important;
      transform: scale(1.16) skewX(-8deg) translateZ(55px) !important;
      text-shadow: 0 0 12px #ffffff, 0 0 26px ${s.primaryColor}, 0 0 55px ${s.glowColor}, 0 0 95px ${s.primaryColor} !important;
      animation: kineticWarpSpeedPop 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards !important;
      will-change: transform, filter;
    }
    @keyframes kineticWarpSpeedPop {
      0% {
        transform: scale(0.7) translateZ(-80px) skewX(15deg);
        filter: blur(5px);
        opacity: 0.3;
      }
      50% {
        transform: scale(1.28) translateZ(85px) skewX(-12deg);
        filter: blur(0px);
        opacity: 1;
      }
      100% {
        transform: scale(1.16) translateZ(55px) skewX(-8deg);
        filter: blur(0px);
        opacity: 1;
      }
    }

    /* Cosmic Northern Lights Aurora Borealis Curtains */
    .const-aurora-curtain {
      position: absolute;
      top: -15%;
      left: -20%;
      width: 140%;
      height: 75%;
      pointer-events: none;
      z-index: 0;
      opacity: 0.55;
      mix-blend-mode: screen;
      background: radial-gradient(ellipse at 50% 0%, ${s.primaryColor}28 0%, ${s.glowColor}18 35%, transparent 70%);
      filter: blur(55px);
      animation: aurora-wave 18s ease-in-out infinite alternate;
      will-change: transform, opacity;
    }
    .const-aurora-wave-2 {
      position: absolute;
      top: -20%;
      right: -15%;
      width: 130%;
      height: 65%;
      pointer-events: none;
      z-index: 0;
      opacity: 0.45;
      mix-blend-mode: color-dodge;
      background: radial-gradient(ellipse at 60% 0%, ${s.glowColor}30 0%, ${s.primaryColor}15 40%, transparent 75%);
      filter: blur(65px);
      animation: aurora-wave-2 24s ease-in-out infinite alternate;
      will-change: transform, opacity;
    }
    @keyframes aurora-wave {
      0% { transform: translateY(0) scaleY(1) skewX(0deg); opacity: 0.35; }
      50% { transform: translateY(22px) scaleY(1.15) skewX(4deg); opacity: 0.65; }
      100% { transform: translateY(-12px) scaleY(0.95) skewX(-3deg); opacity: 0.45; }
    }
    @keyframes aurora-wave-2 {
      0% { transform: translateY(0) scaleX(1) skewY(0deg); opacity: 0.3; }
      50% { transform: translateY(-18px) scaleX(1.1) skewY(-2deg); opacity: 0.55; }
      100% { transform: translateY(12px) scaleX(0.95) skewY(3deg); opacity: 0.38; }
    }

    /* Cosmic Meteor Shower & Shooting Stars */
    .const-meteor-stream {
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 1;
      overflow: hidden;
    }
    .const-meteor {
      position: absolute;
      width: 150px;
      height: 2px;
      background: linear-gradient(90deg, #ffffff 0%, ${s.primaryColor} 45%, transparent 100%);
      transform-origin: left center;
      transform: rotate(-35deg);
      opacity: 0;
      filter: drop-shadow(0 0 6px ${s.primaryColor});
      animation: meteor-streak 8s infinite ease-out;
    }
    .const-meteor.m-1 { top: 10%; left: 78%; animation-delay: 1.5s; animation-duration: 7s; width: 180px; }
    .const-meteor.m-2 { top: 22%; left: 92%; animation-delay: 5.2s; animation-duration: 8.5s; width: 140px; }
    .const-meteor.m-3 { top: 6%; left: 48%; animation-delay: 9s; animation-duration: 7.4s; width: 220px; }
    .const-meteor.m-4 { top: 35%; left: 84%; animation-delay: 12.8s; animation-duration: 9.8s; width: 160px; }
    @keyframes meteor-streak {
      0% { transform: translate(0, 0) rotate(-35deg); opacity: 0; }
      5% { opacity: 0.95; }
      20% { transform: translate(-380px, 260px) rotate(-35deg); opacity: 0; }
      100% { transform: translate(-380px, 260px) rotate(-35deg); opacity: 0; }
    }

    /* Pulsar Jet Spin Animation */
    @keyframes pulsar-jet-spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .pulsar-jets {
      animation: pulsar-jet-spin 4s linear infinite;
      transform-origin: 0 0;
    }

    /* Gravitational Orbit Spin Animation */
    @keyframes orbit-gyroscopic {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .const-orbital-rings {
      animation: orbit-gyroscopic 14s linear infinite;
      transform-origin: 0 0;
    }

    /* NASA/JWST Diffraction Spikes Pulse */
    @keyframes diffraction-pulse {
      0%, 100% { opacity: 0.85; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.1); }
    }
    .const-diffraction-spikes {
      animation: diffraction-pulse 3.5s ease-in-out infinite;
      transform-origin: 0 0;
    }

    /* Kinetic Typography Mode Styles (Arkcurates / Vertical Editorial Poster Reel) */
    .kinetic-view-container {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 0;
      overflow: hidden;
      background: #000000;
      z-index: 10;
      user-select: none;
    }
    




    /* Ambient Album Art Blurred Aura Backdrop */
    .const-ambient-album-backdrop {
      position: absolute;
      inset: -40px;
      background-size: cover;
      background-position: center center;
      filter: blur(65px) saturate(180%) brightness(0.22);
      transform: scale(1.15);
      opacity: 0.85;
      pointer-events: none;
      z-index: 0;
      transition: opacity 1.2s ease, filter 1.2s ease;
      will-change: transform, opacity;
      animation: ambient-breathe 14s infinite ease-in-out alternate;
    }
    @keyframes ambient-breathe {
      0% { transform: scale(1.1) rotate(0deg); }
      100% { transform: scale(1.22) rotate(2deg); }
    }

    /* Rhythmic Beat Pulse Simulation */
    @keyframes const-bass-beat {
      0%, 100% { transform: scale(1); filter: drop-shadow(0 0 12px ${s.glowColor}55); }
      30% { transform: scale(1.045); filter: drop-shadow(0 0 28px ${s.glowColor}); }
    }
    .beat-pulse-active {
      animation: const-bass-beat 0.55s infinite cubic-bezier(0.16, 1, 0.3, 1);
    }

    /* Celestial Nebula Dust Clouds (Constellation Mode) */
    .const-nebula-cloud {
      position: absolute;
      width: 650px;
      height: 650px;
      border-radius: 50%;
      background: radial-gradient(circle, ${s.primaryColor}18 0%, ${s.glowColor}08 45%, transparent 75%);
      filter: blur(48px);
      pointer-events: none;
      animation: nebula-drift 32s infinite ease-in-out alternate;
      will-change: transform;
    }
    @keyframes nebula-drift {
      0% { transform: translate(-20%, -15%) scale(0.9); }
      100% { transform: translate(25%, 20%) scale(1.15); }
    }

        /* Vertical Scrolling Stage */
    .kinetic-vertical-track {
      position: relative;
      z-index: 2;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      max-width: 950px;
      padding: 0 32px;
      transition: transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
      will-change: transform;
    }

    /* Each vertical stack item (one line or row) */
    .kinetic-vertical-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px 24px;
      margin: 12px 0;
      transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      transform-origin: center center;
    }

    /* Vertical state variations */
    .kinetic-vertical-row.is-past {
      opacity: 0.28;
      transform: scale(0.88);
      filter: blur(1.5px);
    }
    .kinetic-vertical-row.is-active {
      opacity: 1;
      transform: scale(1.08);
      filter: none;
    }
    .kinetic-vertical-row.is-future {
      opacity: 0.22;
      transform: scale(0.85);
      filter: blur(2px);
    }

    /* Word wrapper inside row */
    .kinetic-word-wrap {
      display: inline-flex;
      align-items: center;
      gap: 14px;
      cursor: pointer;
      transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .kinetic-word-wrap:hover {
      transform: scale(1.06);
    }

    /* Style 0: Large Bold Primary (Syne) */
    .kt-style-bold {
      font-family: "Syne", "Outfit", -apple-system, sans-serif;
      font-size: 80px;
      font-weight: 800;
      color: ${s.primaryColor};
      letter-spacing: -0.03em;
      line-height: 1.05;
      filter: ${s.glowIntensity !== "off" ? `drop-shadow(0 0 24px ${s.glowColor}66)` : "none"};
    }

    /* Style 1: Serif Italic Luxury (Cinzel) */
    .kt-style-italic {
      font-family: "Cinzel", Georgia, serif;
      font-size: 72px;
      font-weight: 600;
      font-style: italic;
      color: ${s.primaryColor};
      letter-spacing: 0.01em;
      line-height: 1.1;
    }

    /* Style 2: Highlight Banner Block (like [girl], [yeah]) */
    .kt-style-banner {
      display: inline-block;
      font-family: "Syne", "Outfit", -apple-system, sans-serif;
      font-size: 64px;
      font-weight: 900;
      background: ${s.primaryColor};
      color: #000000 !important;
      padding: 4px 22px 6px 22px;
      border-radius: 10px;
      letter-spacing: -0.02em;
      line-height: 1.0;
      box-shadow: 0 6px 28px ${s.primaryColor}55;
    }

    /* Style 3: Clean Sans Display (Outfit) */
    .kt-style-clean {
      font-family: "Outfit", -apple-system, sans-serif;
      font-size: 76px;
      font-weight: 700;
      color: #ffffff;
      letter-spacing: -0.02em;
      line-height: 1.05;
    }

    /* Word active pulse burst */
    .kt-word-active {
      animation: kt-word-burst 0.32s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
      filter: ${s.glowIntensity !== "off" ? `drop-shadow(0 0 32px ${s.glowColor})` : "none"};
    }
    @keyframes kt-word-burst {
      0% { transform: scale(0.68) translateY(18px); opacity: 0.2; }
      60% { transform: scale(1.18) translateY(-4px); opacity: 1; }
      100% { transform: scale(1.08) translateY(0); opacity: 1; }
    }

    /* Pop Art Glyphs & Sticker Emojis (like Tory Lanez 87 Stingray reference) */
    .kt-glyph-sticker {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 44px;
      color: ${s.primaryColor};
      animation: kt-glyph-wiggle 3s infinite ease-in-out;
      transform-origin: center;
    }
    @keyframes kt-glyph-wiggle {
      0%, 100% { transform: rotate(0deg) scale(1); }
      50% { transform: rotate(8deg) scale(1.12); }
    }

    /* Settings Live Preview Strip */
    .settings-live-preview-strip {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 20px;
      background: rgba(0, 0, 0, 0.45);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      gap: 12px;
      overflow-x: auto;
    }
    .settings-preview-label {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #9ca3af;
      white-space: nowrap;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .settings-preview-box {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 18px;
      border-radius: 12px;
      border: 1px solid ${s.primaryColor}33;
      background: ${s.bgColor};
      box-shadow: inset 0 0 16px rgba(0,0,0,0.6);
    }
  `;
}

// React Custom App Class Component
class ConstellationApp extends Component {
  constructor(props) {
    super(props);

    const initialSettings = this.loadSettings();

    this.state = {
      trackInfo: getTrackInfo() || { title: "Waiting for playback", artist: "", album: "", durationMs: 0, uri: "" },
      parsedLyrics: null,
      lyricsSource: null,
      isLoading: false,
      error: null,
      autoFollow: true,
      zoomLevel: 1,
      isPlaying: true,
      isFullscreen: false,
      hideHud: false,
      showFullscreenHint: false,
      settings: initialSettings,
      isSettingsOpen: false,
      isEyePreview: false,
      settingsSearch: "",
      activeSettingsTab: "lyrics",
      viewMode: initialSettings.viewMode || "constellation", // "constellation" | "kinetic"
      ktLineIdx: 0,
      ktWordIdx: 0,
      supernovas: [],
      songSections: [],
      playlistCoverUrl: null
    };

    this._ktLineIdx = -1;
    this._ktWordIdx = -1;

    this.containerRef = react.createRef();
    this.svgRef = react.createRef();
    this.viewportGroupRef = react.createRef();

    // High performance continuous state
    this.camera = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.nodes = [];
    this.ambientStars = [];
    this.animFrameId = null;
    this.isDragging = false;
    this.lastMousePos = { x: 0, y: 0 };
    this.dimensions = { width: 1200, height: 800 };
    this.currentUri = null;

    // Smoothed continuous audio clock tracking
    this.lastRawProgress = 0;         // last value returned by getProgress()
    this.prevRawProgress = 0;         // value before that (to detect updates)
    this.currentSmoothedProgress = 0; // our running interpolated clock
    this._lastAnchorRaw = null;
    this._anchorTime = null;
    this.lastFrameTime = performance.now();

    // Active state caches for O(1) frame updates
    this.activeNodeIndex = -1;
    this.activeLineIndex = -1;

    // Fullscreen HUD auto-hide timer
    this.hudTimer = null;
    this.hintTimer = null;
    this.lastUserActivity = performance.now();

    this.handleSongChange = this.handleSongChange.bind(this);
    this.handlePlayPause = this.handlePlayPause.bind(this);
    this.tick = this.tick.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleWheel = this.handleWheel.bind(this);
    this.handleRecenter = this.handleRecenter.bind(this);
    this.togglePlay = this.togglePlay.bind(this);
    this.toggleFullscreen = this.toggleFullscreen.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleFullscreenChange = this.handleFullscreenChange.bind(this);
    this.updateSettings = this.updateSettings.bind(this);
    this.resetSettings = this.resetSettings.bind(this);
  }

  loadSettings() {
    try {
      const saved = (window.Spicetify && window.Spicetify.LocalStorage && window.Spicetify.LocalStorage.get("constellation:settings"))
        || window.localStorage.getItem("constellation:settings");
      if (saved) {
        const parsed = JSON.parse(saved);
        // Verse 1 / Chorus minimap is strictly disabled by default unless explicitly toggled on by user
        if (!parsed._sectionsUserEnabled) {
          parsed.showSongSections = false;
        }
        return Object.assign({}, DEFAULT_CONSTELLATION_SETTINGS, parsed);
      }
    } catch (e) {
      // ignore
    }
    return Object.assign({}, DEFAULT_CONSTELLATION_SETTINGS);
  }

  updateSettings(partial) {
    const next = Object.assign({}, this.state.settings, partial);
    this.setState({ settings: next });
    if (partial.starDensity !== undefined && this.dimensions) {
      const counts = { off: 0, low: 45, medium: 95, high: 180 };
      const c = counts[partial.starDensity] !== undefined ? counts[partial.starDensity] : 95;
      this.ambientStars = generateAmbientStars(c, this.dimensions.width, this.dimensions.height);
    }
    try {
      const str = JSON.stringify(next);
      if (window.Spicetify && window.Spicetify.LocalStorage) {
        window.Spicetify.LocalStorage.set("constellation:settings", str);
      }
      window.localStorage.setItem("constellation:settings", str);
    } catch (e) {
      // ignore
    }
    injectStyles(next);
    // Instant live update on active beacon and trail elements on the canvas
    if (this._buildBeaconDOM) {
      this._buildBeaconDOM();
    }
  }

  resetSettings() {
    this.updateSettings(DEFAULT_CONSTELLATION_SETTINGS);
  }

  componentDidMount() {
    injectStyles(this.state.settings);

    if (this.containerRef.current) {
      const rect = this.containerRef.current.getBoundingClientRect();
      this.dimensions = {
        width: rect.width || window.innerWidth || 1000,
        height: rect.height || window.innerHeight || 700
      };
      this.ambientStars = generateAmbientStars(90, this.dimensions.width, this.dimensions.height);
    }

    if (window.ResizeObserver && this.containerRef.current) {
      this.resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          if (width > 0 && height > 0) {
            this.dimensions = { width, height };
          }
        }
      });
      this.resizeObserver.observe(this.containerRef.current);
    }

    if (window.Spicetify && window.Spicetify.Player) {
      window.Spicetify.Player.addEventListener("songchange", this.handleSongChange);
      window.Spicetify.Player.addEventListener("onplaypause", this.handlePlayPause);
    }

    document.addEventListener("fullscreenchange", this.handleFullscreenChange);
    window.addEventListener("keydown", this.handleKeyDown);

    // Toggle close: clicking the same sidebar or topbar/playbar button that opened Constellation closes it
    this.handleGlobalNavClick = (e) => {
      const target = e.target && e.target.closest && e.target.closest('a[href*="constellation"], button[aria-label*="Constellation" i], button[title*="Constellation" i], [data-id*="constellation" i], [data-uri*="constellation" i], .main-yourLibraryX-listItem[aria-label*="Constellation" i]');
      if (target) {
        const isCurrent = window.location.pathname.includes("constellation") ||
          (window.Spicetify && window.Spicetify.Platform && window.Spicetify.Platform.History && (window.Spicetify.Platform.History.location?.pathname || "").includes("constellation"));
        if (isCurrent) {
          e.preventDefault();
          e.stopPropagation();
          if (window.Spicetify && window.Spicetify.Platform && window.Spicetify.Platform.History && window.Spicetify.Platform.History.goBack) {
            window.Spicetify.Platform.History.goBack();
          } else {
            window.history.back();
          }
        }
      }
    };
    document.addEventListener("click", this.handleGlobalNavClick, true);

    this.handleSongChange();
    if (this.state.trackInfo && (this.state.settings.themeId === "dynamic" || !this.state.settings.themeId)) {
      extractTrackColors(this.state.trackInfo.uri, this.state.trackInfo.coverUrl, (extracted) => {
        this.updateSettings(extracted);
      });
    }

    // Build the beacon imperatively so React never touches/resets it
    this._buildBeaconDOM();

    this.lastFrameTime = performance.now();
    this.animFrameId = requestAnimationFrame(this.tick);
  }

  componentDidUpdate(prevProps, prevState) {
    const ps = prevState.settings;
    const ns = this.state.settings;
    if (ps !== ns) {
      injectStyles(ns);
      // Rebuild imperative beacon DOM when visual beacon settings change
      if (ps.beaconStyle !== ns.beaconStyle ||
        ps.primaryColor !== ns.primaryColor ||
        ps.glowColor !== ns.glowColor ||
        ps.glowIntensity !== ns.glowIntensity) {
        this._buildBeaconDOM();
      }
    }
  }

  componentWillUnmount() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    if (window.Spicetify && window.Spicetify.Player) {
      window.Spicetify.Player.removeEventListener("songchange", this.handleSongChange);
      window.Spicetify.Player.removeEventListener("onplaypause", this.handlePlayPause);
    }

    document.removeEventListener("fullscreenchange", this.handleFullscreenChange);
    window.removeEventListener("keydown", this.handleKeyDown);

    if (this.handleGlobalNavClick) {
      document.removeEventListener("click", this.handleGlobalNavClick, true);
    }

    if (this.hudTimer) clearTimeout(this.hudTimer);
    if (this.hintTimer) clearTimeout(this.hintTimer);
  }

  handleKeyDown(e) {
    if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")) return;
    if (e.key === "f" || e.key === "F") {
      this.toggleFullscreen();
    } else if (e.key === "Escape") {
      if (this.state.isEyePreview) {
        this.setState({ isEyePreview: false });
      } else if (this.state.isSettingsOpen) {
        this.setState({ isSettingsOpen: false });
      } else if (this.state.isFullscreen) {
        this.toggleFullscreen();
      }
    }
  }

  handleFullscreenChange() {
    if (!document.fullscreenElement && this.state.isFullscreen) {
      this.setState({ isFullscreen: false, hideHud: false, showFullscreenHint: false });
    }
  }

  toggleFullscreen() {
    const container = this.containerRef.current;
    if (!container) return;

    const nextFs = !this.state.isFullscreen;

    if (nextFs) {
      if (container.requestFullscreen) {
        container.requestFullscreen().catch(() => { });
      }
      this.setState({ isFullscreen: true, showFullscreenHint: true });
      clearTimeout(this.hintTimer);
      this.hintTimer = setTimeout(() => {
        this.setState({ showFullscreenHint: false });
      }, 3500);
    } else {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => { });
      }
      this.setState({ isFullscreen: false, hideHud: false, showFullscreenHint: false });
    }
  }

  handlePlayPause() {
    const isPlaying = window.Spicetify?.Player?.isPlaying?.() ?? true;
    this.setState({ isPlaying });
    this._lastAnchorRaw = null;
    this._anchorTime = null;
  }

  async handleSongChange() {
    const info = getTrackInfo();
    if (!info || !info.title) {
      this.setState({
        trackInfo: { title: "Waiting for playback", artist: "", album: "", durationMs: 0, uri: "" },
        parsedLyrics: null,
        lyricsSource: null,
        isLoading: false,
        error: "Play a song on Spotify to start the constellation"
      });
      return;
    }

    if (info.uri === this.currentUri && this.state.parsedLyrics) {
      return;
    }

    this.currentUri = info.uri;
    this._lastAnchorRaw = null;
    this._anchorTime = null;
    this.currentSmoothedProgress = 0;
    this.setState({
      trackInfo: info,
      isLoading: true,
      error: null
    });

    // Dynamic Cover Color Sync: automatically adapt theme colors to current album artwork
    if (this.state.settings.themeId === "dynamic" || !this.state.settings.themeId) {
      extractTrackColors(info.uri, info.coverUrl, (extracted) => {
        this.updateSettings(extracted);
      });
    }

    // Playlist Cover Art extraction if enabled
    if (this.state.settings.backdropSource === "playlist" && info.contextUri && info.contextUri.includes("playlist")) {
      fetchPlaylistCover(info.contextUri).then((pUrl) => {
        if (pUrl) this.setState({ playlistCoverUrl: pUrl });
      });
    }

    const durationSec = Math.round(info.durationMs / 1000);
    const result = await fetchLyrics(info.title, info.artist, info.album, durationSec, info.uri);

    if (this.currentUri !== info.uri) return;

    if (result && result.lines && result.lines.length > 0) {
      const parsed = result.lines;
      this.nodes = buildConstellationLayout(parsed, this.dimensions.width, this.dimensions.height, MIN_WORD_DISTANCE);

      if (this.nodes.length > 0) {
        this.camera.x = this.nodes[0].x;
        this.camera.y = this.nodes[0].y;
        this.camera.targetX = this.nodes[0].x;
        this.camera.targetY = this.nodes[0].y;
      }

      this.activeNodeIndex = -1;
      this.activeLineIndex = -1;

      const songSections = computeSongSections(parsed, info.durationMs);
      this.setState({
        parsedLyrics: parsed,
        lyricsSource: result.source || "Spotify",
        songSections: songSections,
        isLoading: false,
        error: null
      });

      // Ensure beacon is attached to viewport
      this._buildBeaconDOM();
    } else {
      this.nodes = [];
      this.activeNodeIndex = -1;
      this.activeLineIndex = -1;
      this.setState({
        parsedLyrics: null,
        lyricsSource: null,
        isLoading: false,
        error: "No synced lyrics available for this track"
      });
    }
  }

  togglePlay() {
    if (window.Spicetify && window.Spicetify.Player) {
      if (window.Spicetify.Player.isPlaying()) {
        window.Spicetify.Player.pause();
      } else {
        window.Spicetify.Player.play();
      }
      this.handlePlayPause();
    }
  }

  handleMouseDown(e) {
    if (e.button !== 0) return;
    this.isDragging = true;
    this.lastMousePos = { x: e.clientX, y: e.clientY };
    this.lastUserActivity = performance.now();
    if (this.state.hideHud) {
      this.setState({ hideHud: false });
    }
  }

  handleMouseMove(e) {
    if (this.state.isFullscreen) {
      if (this.state.hideHud) {
        this.setState({ hideHud: false });
      }
      clearTimeout(this.hudTimer);
      this.hudTimer = setTimeout(() => {
        if (this.state.isFullscreen) {
          this.setState({ hideHud: true });
        }
      }, 3200);
    }

    if (!this.isDragging) return;
    const dx = e.clientX - this.lastMousePos.x;
    const dy = e.clientY - this.lastMousePos.y;
    this.lastMousePos = { x: e.clientX, y: e.clientY };
    this.lastUserActivity = performance.now();
    if (this.state.hideHud) {
      this.setState({ hideHud: false });
    }

    const z = this.state.zoomLevel;
    this.camera.targetX -= dx / z;
    this.camera.targetY -= dy / z;
    this.camera.x -= dx / z;
    this.camera.y -= dy / z;

    if (this.state.autoFollow) {
      this.setState({ autoFollow: false });
    }
  }

  handleMouseUp() {
    this.isDragging = false;
  }

  handleWheel(e) {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.08 : 0.92;
    this.setState((prev) => ({
      zoomLevel: Math.min(2.4, Math.max(0.4, prev.zoomLevel * factor))
    }));
  }

  handleRecenter() {
    this.setState({ autoFollow: true, zoomLevel: 1 });
  }

  seekToWord(timeMs) {
    if (window.Spicetify && window.Spicetify.Player && typeof timeMs === "number") {
      window.Spicetify.Player.seek(timeMs);
      this._lastAnchorRaw = timeMs;
      this._anchorTime = performance.now();
      this.currentSmoothedProgress = timeMs;
      this.lastRawProgress = timeMs;
      this.prevRawProgress = timeMs;
    }
    // Trigger supernova shockwave at word star node
    if (this.nodes && this.nodes.length) {
      const match = this.nodes.find((n) => Math.abs(n.startTime - timeMs) < 250);
      if (match) {
        this.triggerSupernova(match.x, match.y);
      }
    }
  }

  triggerSupernova(x, y) {
    const s = this.state.settings || DEFAULT_CONSTELLATION_SETTINGS;
    if (!s.enableSupernova) return;
    const snId = "sn-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
    const sn = {
      id: snId,
      x: x || 0,
      y: y || 0,
      color: s.primaryColor || "#38bdf8"
    };
    this.setState((prev) => ({
      supernovas: [...(prev.supernovas || []).slice(-4), sn]
    }));
    setTimeout(() => {
      this.setState((prev) => ({
        supernovas: (prev.supernovas || []).filter((item) => item.id !== snId)
      }));
    }, 900);
  }

  // High precision linear circle position computation
  // Rule: circle sits ON node[i] at node[i].startTime, arrives ON node[i+1] at node[i+1].startTime
  computeLinearCirclePos(progressMs) {
    const nodes = this.nodes;
    if (!nodes || !nodes.length) return null;

    // Before the song starts
    if (progressMs <= nodes[0].startTime) {
      return { x: nodes[0].x, y: nodes[0].y, activeIndex: 0, activeLineIndex: nodes[0].lineIndex, progress: 0, currNode: nodes[0], nextNode: nodes[1] || null };
    }

    const last = nodes[nodes.length - 1];
    // After the last node
    if (progressMs >= last.startTime) {
      return { x: last.x, y: last.y, activeIndex: nodes.length - 1, activeLineIndex: last.lineIndex, progress: 1, currNode: last, nextNode: null };
    }

    // Binary search for the current node: find largest i where nodes[i].startTime <= progressMs
    let lo = 0, hi = nodes.length - 2;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (nodes[mid].startTime <= progressMs) lo = mid;
      else hi = mid - 1;
    }
    const i = lo;
    const curr = nodes[i];
    const next = nodes[i + 1];

    if (!next) {
      return { x: curr.x, y: curr.y, activeIndex: i, activeLineIndex: curr.lineIndex, progress: 1, currNode: curr, nextNode: null };
    }

    // Total window from curr → next (in ms)
    const window = next.startTime - curr.startTime;
    if (window <= 0) {
      return { x: curr.x, y: curr.y, activeIndex: i, activeLineIndex: curr.lineIndex, progress: 0, currNode: curr, nextNode: next };
    }

    // Pure smooth linear interpolation directly tracking music playback
    const progress = Math.max(0, Math.min(1, (progressMs - curr.startTime) / window));

    return {
      x: curr.x + (next.x - curr.x) * progress,
      y: curr.y + (next.y - curr.y) * progress,
      activeIndex: i,
      activeLineIndex: curr.lineIndex,
      progress,
      currNode: curr,
      nextNode: next
    };
  }

  // Build beacon (halo circle) as a pure DOM element appended to the SVG viewport group.
  // Keeping it outside React prevents any reconciliation from resetting its transform.
  _buildBeaconDOM() {
    // Wait one frame so the React SVG render is committed and viewportGroupRef.current is live
    requestAnimationFrame(() => {
      if (this.state && this.state.viewMode === "kinetic") return;
      const viewportEl = this.viewportGroupRef && this.viewportGroupRef.current;
      if (!viewportEl) return;

      // Remove any existing imperative beacon
      if (this._beaconGroupEl && this._beaconGroupEl.parentNode) {
        this._beaconGroupEl.parentNode.removeChild(this._beaconGroupEl);
      }
      // Also remove any old progress trail we manage
      if (this._trailEl && this._trailEl.parentNode) {
        this._trailEl.parentNode.removeChild(this._trailEl);
      }

      const SVG_NS = "http://www.w3.org/2000/svg";
      const s = this.state.settings;

      // --- Progress Trail ---
      const trail = document.createElementNS(SVG_NS, "line");
      trail.setAttribute("id", "imperative-progress-trail");
      trail.setAttribute("stroke", s.primaryColor);
      trail.setAttribute("stroke-width", "2.8");
      trail.setAttribute("stroke-opacity", "0.95");
      trail.setAttribute("stroke-linecap", "round");
      if (s.glowIntensity !== "off") trail.setAttribute("filter", "url(#lime-glow)");
      trail.style.display = "none";
      trail.style.pointerEvents = "none";
      viewportEl.appendChild(trail);
      this._trailEl = trail;

      // --- Beacon Group ---
      const g = document.createElementNS(SVG_NS, "g");
      g.setAttribute("id", "imperative-halo-group");
      g.style.display = "none";
      g.style.pointerEvents = "none";

      const mk = (tag, attrs) => {
        const el = document.createElementNS(SVG_NS, tag);
        for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
        return el;
      };

      if (s.beaconStyle === "orb") {
        g.appendChild(mk("circle", { cx: 0, cy: 0, r: 18, fill: s.glowColor, "fill-opacity": 0.2 }));
        g.appendChild(mk("circle", { cx: 0, cy: 0, r: 12, fill: "none", stroke: s.primaryColor, "stroke-width": 1.8, "stroke-opacity": 0.9, class: "active-halo-ring" }));
        g.appendChild(mk("circle", { cx: 0, cy: 0, r: 6, fill: s.primaryColor }));
        g.appendChild(mk("circle", { cx: 0, cy: 0, r: 2, fill: "#ffffff" }));
      } else if (s.beaconStyle === "ring") {
        g.appendChild(mk("circle", { cx: 0, cy: 0, r: 14, fill: "none", stroke: s.primaryColor, "stroke-width": 2, "stroke-opacity": 0.95, class: "active-halo-ring" }));
        g.appendChild(mk("circle", { cx: 0, cy: 0, r: 19, fill: "none", stroke: s.primaryColor, "stroke-width": 0.8, "stroke-opacity": 0.2 }));
        g.appendChild(mk("circle", { cx: 0, cy: 0, r: 3.5, fill: s.primaryColor }));
      } else if (s.beaconStyle === "minimal") {
        g.appendChild(mk("circle", { cx: 0, cy: 0, r: 5, fill: s.primaryColor }));
        g.appendChild(mk("circle", { cx: 0, cy: 0, r: 9, fill: "none", stroke: s.primaryColor, "stroke-width": 1, "stroke-opacity": 0.5 }));
      } else {
        // default reticle
        g.appendChild(mk("circle", { cx: 0, cy: 0, r: 16, fill: "none", stroke: s.primaryColor, "stroke-width": 1.6, "stroke-opacity": 0.85, ...(s.glowIntensity !== "off" ? { filter: "url(#lime-glow)" } : {}), class: "active-halo-ring" }));
        g.appendChild(mk("circle", { cx: 0, cy: 0, r: 21, fill: "none", stroke: s.primaryColor, "stroke-width": 0.8, "stroke-opacity": 0.3 }));
        g.appendChild(mk("circle", { cx: 0, cy: 0, r: 5, fill: s.primaryColor, ...(s.glowIntensity !== "off" ? { filter: "url(#lime-glow)" } : {}) }));
        g.appendChild(mk("line", { x1: -10, y1: 0, x2: 10, y2: 0, stroke: s.primaryColor, "stroke-width": 1.2, opacity: 0.8 }));
        g.appendChild(mk("line", { x1: 0, y1: -10, x2: 0, y2: 10, stroke: s.primaryColor, "stroke-width": 1.2, opacity: 0.8 }));
      }

      viewportEl.appendChild(g);
      this._beaconGroupEl = g;

      // Point the tick() references to the imperative elements
      this.haloGroupEl = g;
      this.progressTrailEl = trail;
    });
  }

  // 60/120 FPS requestAnimationFrame Loop with continuous audio clock smoothing & LINEAR circle movement
  tick() {
    this.animFrameId = requestAnimationFrame(this.tick);

    const now = performance.now();
    // Auto-Screensaver: clean OLED immersion after 4.5s inactivity
    if (this.state.settings.autoScreensaver && !this.state.settings.neverHideHud && !this.state.isSettingsOpen && !this.state.hideHud) {
      if (now - this.lastUserActivity > 4500) {
        this.setState({ hideHud: true });
      }
    }
    const dt = Math.min((now - this.lastFrameTime) / 1000, 0.1);
    this.lastFrameTime = now;

    // High precision audio progress interpolation
    let rawProgress = 0;
    let isPlaying = false;
    if (window.Spicetify && window.Spicetify.Player) {
      try {
        rawProgress = window.Spicetify.Player.getProgress() || 0;
        isPlaying = window.Spicetify.Player.isPlaying();
      } catch (e) {
        isPlaying = false;
      }
    }

    // High precision monotonic continuous playback sync without jitter
    if (!isPlaying) {
      this._lastAnchorRaw = rawProgress;
      this._anchorTime = now;
      this.currentSmoothedProgress = rawProgress;
    } else {
      if (
        this._lastAnchorRaw == null ||
        !this._anchorTime ||
        isNaN(this._lastAnchorRaw) ||
        Math.abs(rawProgress - (this._lastAnchorRaw + (now - this._anchorTime))) > 350
      ) {
        this._lastAnchorRaw = rawProgress;
        this._anchorTime = now;
        this.currentSmoothedProgress = rawProgress;
      } else {
        const elapsed = now - this._anchorTime;
        this.currentSmoothedProgress = this._lastAnchorRaw + elapsed;
      }
    }

    // Audio sync calibration offset: default 0ms exact sync + snappy 65ms vocal attack lead
    const userOffset = (this.state.settings && typeof this.state.settings.syncOffset === "number")
      ? this.state.settings.syncOffset
      : 0;
    const progressMs = Math.max(0, this.currentSmoothedProgress - userOffset + 65);

    // Continuous linear circle position
    const circlePos = this.computeLinearCirclePos(progressMs);
    let newActiveIdx = -1;
    let newActiveLineIdx = -1;

    if (circlePos) {
      newActiveIdx = circlePos.activeIndex;
      newActiveLineIdx = circlePos.activeLineIndex;

      // 1. UPDATE MOVING CIRCLE (BEACON) TRANSFORM LINEARLY ON EVERY FRAME
      if (this.haloGroupEl) {
        this.haloGroupEl.style.display = "block";
        this.haloGroupEl.setAttribute("transform", `translate(${circlePos.x.toFixed(2)}, ${circlePos.y.toFixed(2)})`);
      }

      // 2. UPDATE PROGRESS TRAIL LINE LINEARLY
      if (this.progressTrailEl && this.state.settings.showProgressTrail && circlePos.progress > 0) {
        this.progressTrailEl.style.display = "block";
        this.progressTrailEl.setAttribute("x1", circlePos.currNode.x.toFixed(2));
        this.progressTrailEl.setAttribute("y1", circlePos.currNode.y.toFixed(2));
        this.progressTrailEl.setAttribute("x2", circlePos.x.toFixed(2));
        this.progressTrailEl.setAttribute("y2", circlePos.y.toFixed(2));
      } else if (this.progressTrailEl) {
        this.progressTrailEl.style.display = "none";
      }

      // 3. AUTO CAMERA TARGET TRACKS LINEAR CIRCLE
      if (this.state.autoFollow) {
        this.camera.targetX = circlePos.x;
        this.camera.targetY = circlePos.y;
      }
    } else if (this.haloGroupEl) {
      this.haloGroupEl.style.display = "none";
      if (this.progressTrailEl) this.progressTrailEl.style.display = "none";
    }

    // Framerate-independent continuous exponential smoothing for camera (rapid & immediate tracking)
    const smoothing = 1 - Math.exp(-22.0 * dt);
    this.camera.x += (this.camera.targetX - this.camera.x) * smoothing;
    this.camera.y += (this.camera.targetY - this.camera.y) * smoothing;

    // Viewport matrix translation
    if (this.viewportGroupRef.current) {
      const cx = this.dimensions.width / 2;
      const cy = this.dimensions.height / 2;
      const z = this.state.zoomLevel;
      const tx = cx - this.camera.x * z;
      const ty = cy - this.camera.y * z;
      this.viewportGroupRef.current.setAttribute("transform", `translate(${tx.toFixed(2)}, ${ty.toFixed(2)}) scale(${z.toFixed(3)})`);
    }

    // Only update classes when word or line transitions occur
    if (newActiveIdx !== this.activeNodeIndex || newActiveLineIdx !== this.activeLineIndex) {
      this.updateWordAndLineClasses(progressMs, newActiveIdx, newActiveLineIdx);
      this.activeNodeIndex = newActiveIdx;
      this.activeLineIndex = newActiveLineIdx;
    }

    // High performance sync for Kinetic Typography view
    if (this.state.parsedLyrics && this.state.parsedLyrics.length > 0) {
      let ktLine = -1;
      const lyrics = this.state.parsedLyrics;
      for (let i = 0; i < lyrics.length; i++) {
        if (progressMs >= lyrics[i].timeMs) ktLine = i;
        else break;
      }
      if (ktLine < 0) ktLine = 0;

      let ktWord = -1;
      if (lyrics[ktLine] && lyrics[ktLine].words) {
        for (let w = 0; w < lyrics[ktLine].words.length; w++) {
          if (progressMs >= lyrics[ktLine].words[w].startTime) ktWord = w;
          else break;
        }
      }

      if (ktLine !== this._ktLineIdx || ktWord !== this._ktWordIdx) {
        this._ktLineIdx = ktLine;
        this._ktWordIdx = ktWord;
        this.setState({ ktLineIdx: ktLine, ktWordIdx: ktWord });
      }
    }
  }

  // Efficient class update only on transition events
  updateWordAndLineClasses(progressMs, activeIdx, activeLineIdx) {
    if (!this.nodesGroupEl || !this.linesGroupEl) return;
    const nodes = this.nodes;
    const nodeElements = this.nodesGroupEl.children;
    const lineElements = this.linesGroupEl.children;

    let lineCounter = 0;
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const nodeEl = nodeElements[i];

      if (nodeEl) {
        const isWordActive = i === activeIdx;
        const isWordPast = progressMs >= node.endTime;
        const isLineEnd = !!node.isLineEnd;

        let cls = "star-node";
        if (isWordActive) {
          cls += " is-active";
        } else if (node.lineIndex === activeLineIdx) {
          cls += isWordPast ? " is-current-past" : " is-current-upcoming";
        } else if (node.lineIndex < activeLineIdx) {
          cls += " is-past";
        } else {
          cls += " is-future";
        }

        if (isLineEnd) {
          cls += " is-line-end";
          // Pop effect when active or when the line ends
          if (isWordActive || (node.lineIndex === activeLineIdx && isWordPast)) {
            cls += " is-popped";
          }
        }

        if (nodeEl.className.baseVal !== cls) {
          nodeEl.className.baseVal = cls;
        }
      }

      if (node.prevNode) {
        const lineEl = lineElements[lineCounter++];
        if (lineEl) {
          const isActiveLine = progressMs >= node.prevNode.startTime && progressMs < node.endTime;
          const isPast = progressMs >= node.endTime;

          if (isActiveLine) {
            lineEl.className.baseVal = "const-line is-active";
          } else if (isPast) {
            lineEl.className.baseVal = node.lineIndex < activeLineIdx - 1 ? "const-line is-old" : "const-line is-past";
          } else {
            lineEl.className.baseVal = "const-line is-future";
          }
        }
      }
    }
  }

  renderKineticTypography(lyrics, ktLineIdx, ktWordIdx, settings) {
    const s = settings || DEFAULT_CONSTELLATION_SETTINGS;
    if (!lyrics || !lyrics.length) {
      return react.createElement(
        "div",
        { className: "kinetic-view-container" },
        react.createElement(
          "div",
          { style: { color: s.primaryColor, fontSize: "20px", fontWeight: "600", opacity: 0.7 } },
          "Waiting for synced lyrics..."
        )
      );
    }

    const windowStart = Math.max(0, ktLineIdx - 1);
    const windowEnd = Math.min(lyrics.length - 1, ktLineIdx + 1);

    const verticalItems = [];
    for (let l = windowStart; l <= windowEnd; l++) {
      const lineObj = lyrics[l];
      const isLineActive = l === ktLineIdx;
      const isLinePast = l < ktLineIdx;
      const isLineFuture = l > ktLineIdx;

      verticalItems.push({
        lineIdx: l,
        lineObj,
        isLineActive,
        isLinePast,
        isLineFuture
      });
    }

    const activeFontSize = s.kineticSize === "huge" ? "88px" : s.kineticSize === "normal" ? "54px" : "72px";
    const normalFontSize = s.kineticSize === "huge" ? "70px" : s.kineticSize === "normal" ? "40px" : "58px";
    const pastFutureFontSize = s.kineticSize === "huge" ? "42px" : s.kineticSize === "normal" ? "26px" : "34px";

    const isWarpStyle = s.kineticStyle === "warp";

    const containerClass = `kinetic-view-container ${
      isWarpStyle
        ? "kinetic-warp-mode"
        : s.kineticStyle === "y2k"
          ? "kinetic-y2k-mode"
          : s.kineticStyle === "retro_crt"
            ? "kinetic-retro-crt-mode"
            : "kinetic-cinematic-mode"
    }`;

    return react.createElement(
      "div",
      { className: containerClass },
      react.createElement(
        "div",
        {
          className: "kinetic-vertical-track",
          style: isWarpStyle ? { transformStyle: "preserve-3d" } : {}
        },
        verticalItems.map((item) => {
          const { lineIdx, lineObj, isLineActive, isLinePast, isLineFuture } = item;
          const words = lineObj.words || [];

          return react.createElement(
            "div",
            {
              key: `kline-${lineIdx}`,
              className: `kinetic-vertical-row ${isLineActive ? "is-active" : isLinePast ? "is-past" : "is-future"}`,
              style: {
                margin: isLineActive ? "24px 0" : "12px 0",
                transform: isLineActive
                  ? (isWarpStyle
                    ? "translateZ(95px) scale(1.15)"
                    : (s.enableBeatPulse ? "scale(1.12)" : "scale(1.08)"))
                  : (isWarpStyle
                    ? (isLinePast ? "translateZ(-230px) translateY(-58px) rotateX(25deg) scale(0.68)" : "translateZ(-160px) translateY(54px) rotateX(-22deg) scale(0.76)")
                    : "scale(0.82)"),
                opacity: isLineActive ? 1 : isLinePast ? 0.35 : 0.22,
                transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px 18px",
                maxWidth: "880px",
                transformStyle: isWarpStyle ? "preserve-3d" : "flat"
              }
            },
            words.map((wordObj, wIdx) => {
              const isWordActive = isLineActive && wIdx === ktWordIdx;
              const isWordSung = isLineActive ? wIdx < ktWordIdx : isLinePast;

              let wordStyle = {
                fontFamily: s.kineticStyle === "retro_crt"
                  ? '"JetBrains Mono", monospace'
                  : s.kineticStyle === "y2k"
                    ? '"Orbitron", "Syne", sans-serif'
                    : isWarpStyle
                      ? '"Syne", "Orbitron", sans-serif'
                      : (wIdx % 3 === 1 ? '"Cinzel", Georgia, serif' : '"Syne", "Outfit", sans-serif'),
                fontStyle: isWarpStyle
                  ? (isWordActive ? "italic" : "normal")
                  : (s.kineticStyle === "retro_crt" ? "normal" : (wIdx % 3 === 1 ? "italic" : "normal")),
                fontSize: isLineActive ? (isWordActive ? activeFontSize : normalFontSize) : pastFutureFontSize,
                fontWeight: isWordActive ? "900" : "700",
                color: isWordActive ? s.primaryColor : isWordSung ? s.pastColor : s.futureColor,
                opacity: isWordActive ? 1 : isWordSung ? 0.8 : 0.45,
                transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                cursor: "pointer",
                padding: isWordActive && wIdx % 3 === 2 && s.kineticStyle === "cinematic" ? "2px 16px" : "0",
                background: isWordActive && wIdx % 3 === 2 && s.kineticStyle === "cinematic" ? s.primaryColor : "transparent",
                color: isWordActive && wIdx % 3 === 2 && s.kineticStyle === "cinematic" ? "#000000" : (isWordActive ? s.primaryColor : (isWordSung ? s.pastColor : s.futureColor)),
                borderRadius: "8px",
                boxShadow: isWordActive && wIdx % 3 === 2 && s.kineticStyle === "cinematic" ? `0 4px 20px ${s.primaryColor}66` : "none",
                filter: isWordActive && s.glowIntensity !== "off" && !(wIdx % 3 === 2 && s.kineticStyle === "cinematic")
                  ? (isWarpStyle ? `drop-shadow(0 0 25px ${s.primaryColor})` : `drop-shadow(0 0 20px ${s.glowColor})`)
                  : "none"
              };

              return react.createElement(
                "span",
                {
                  key: `word-${lineIdx}-${wIdx}`,
                  className: isWordActive ? "kinetic-word-active" : "",
                  style: wordStyle,
                  onClick: (e) => {
                    e.stopPropagation();
                    this.seekToWord(wordObj.startTime);
                  }
                },
                wordObj.text
              );
            })
          );
        })
      )
    );
  }

  render() {
    const { trackInfo, isLoading, error, autoFollow, isPlaying, isFullscreen, hideHud, showFullscreenHint, lyricsSource, settings, isSettingsOpen, activeSettingsTab, viewMode, ktLineIdx, ktWordIdx } = this.state;
    const s = settings || DEFAULT_CONSTELLATION_SETTINGS;

    // Compute glow filter intensity
    let glowStdDev = "4.8";
    if (s.glowIntensity === "off") glowStdDev = "0";
    else if (s.glowIntensity === "subtle") glowStdDev = "2.4";
    else if (s.glowIntensity === "supernova") glowStdDev = "8.5";
    else if (s.glowIntensity === "hyperdrive") glowStdDev = "14.5";

    return react.createElement(
      "div",
      {
        id: "spicetify-constellation-root",
        className: isFullscreen ? "fullscreen-mode" : "",
        ref: this.containerRef,
        onMouseDown: this.handleMouseDown,
        onMouseMove: this.handleMouseMove,
        onMouseUp: this.handleMouseUp,
        onMouseLeave: this.handleMouseUp,
        onWheel: this.handleWheel
      },
      // 1. Ambient Album or Playlist Artwork Blurred Aura Backdrop
      s.enableAlbumBlurBg && (s.backdropSource === "playlist" && this.state.playlistCoverUrl ? this.state.playlistCoverUrl : trackInfo.coverUrl) &&
      react.createElement("div", {
        className: "const-ambient-album-backdrop",
        style: { backgroundImage: `url("${s.backdropSource === "playlist" && this.state.playlistCoverUrl ? this.state.playlistCoverUrl : trackInfo.coverUrl}")` }
      }),

      // Pinned Music Name & Artist Badge (Always visible when pinTrackInfo is enabled)
      s.pinTrackInfo && trackInfo.title &&
      react.createElement(
        "div",
        { className: "const-pinned-track-badge" },
        trackInfo.coverUrl && react.createElement("img", {
          src: trackInfo.coverUrl,
          className: "pinned-track-art",
          alt: ""
        }),
        react.createElement(
          "div",
          { className: "pinned-track-texts" },
          react.createElement("div", { className: "pinned-track-title" }, trackInfo.title),
          react.createElement("div", { className: "pinned-track-artist" }, trackInfo.artist)
        )
      ),

      // 2. Celestial Nebula Dust Clouds
      viewMode === "constellation" &&
      react.createElement("div", {
        className: "const-nebula-cloud",
        style: { top: "25%", left: "30%" }
      }),

      // Cosmic Aurora Borealis Ethereal Curtains
      viewMode === "constellation" && s.enableAuroraBorealis &&
      react.createElement(
        react.Fragment,
        null,
        react.createElement("div", { className: "const-aurora-curtain" }),
        react.createElement("div", { className: "const-aurora-wave-2" })
      ),

      // Cosmic Meteor Showers & Shooting Stars
      viewMode === "constellation" && s.enableMeteorShower &&
      react.createElement(
        "div",
        { className: "const-meteor-stream" },
        react.createElement("div", { className: "const-meteor m-1" }),
        react.createElement("div", { className: "const-meteor m-2" }),
        react.createElement("div", { className: "const-meteor m-3" }),
        react.createElement("div", { className: "const-meteor m-4" })
      ),

      // Ambient Comet / Shooting Star fallback
      viewMode === "constellation" && !s.enableMeteorShower &&
      react.createElement("div", { className: "ambient-comet" }),
      // Fullscreen Exit / Hint Banner
      showFullscreenHint &&
      react.createElement(
        "div",
        { className: "fullscreen-hint" },
        "Press F or ESC to exit fullscreen"
      ),

      // Kinetic Typography Overlay or Full Mode
      viewMode === "kinetic" &&
      this.renderKineticTypography(this.state.parsedLyrics, ktLineIdx, ktWordIdx, s),

      // Celestial SVG Scene
      viewMode !== "kinetic" &&
      react.createElement(
        "svg",
        {
          className: "constellation-svg",
          ref: this.svgRef
        },
        react.createElement(
          "defs",
          null,
          react.createElement(
            "filter",
            { id: "lime-glow", x: "-80%", y: "-80%", width: "260%", height: "260%" },
            react.createElement("feGaussianBlur", { stdDeviation: glowStdDev, result: "coloredBlur" }),
            react.createElement(
              "feMerge",
              null,
              react.createElement("feMergeNode", { in: "coloredBlur" }),
              react.createElement("feMergeNode", { in: "SourceGraphic" })
            )
          ),
          react.createElement(
            "filter",
            { id: "text-glow", x: "-40%", y: "-40%", width: "180%", height: "180%" },
            react.createElement("feDropShadow", { dx: "0", dy: "0", stdDeviation: "3.5", floodColor: s.glowColor, floodOpacity: s.glowIntensity === "off" ? "0" : "0.9" })
          ),
          react.createElement(
            "radialGradient",
            { id: "space-vignette", cx: "50%", cy: "50%", r: "50%" },
            react.createElement("stop", { offset: "65%", stopColor: s.bgColor, stopOpacity: "0" }),
            react.createElement("stop", { offset: "100%", stopColor: s.bgColor, stopOpacity: "0.88" })
          )
        ),
        // Transformed Universe Group
        react.createElement(
          "g",
          { id: "camera-viewport-group", ref: this.viewportGroupRef },
          // Supernova Shockwave and Radiant Sparks Layer
          s.enableSupernova && (this.state.supernovas || []).map((sn) =>
            react.createElement("g", { key: sn.id, className: "supernova-burst", pointerEvents: "none" },
              react.createElement("circle", {
                className: "supernova-shockwave",
                cx: sn.x,
                cy: sn.y,
                r: 45,
                stroke: sn.color,
                fill: "none"
              }),
              [0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
                const rad = deg * (Math.PI / 180);
                return react.createElement("line", {
                  key: deg,
                  className: "supernova-spark",
                  x1: sn.x + Math.cos(rad) * 12,
                  y1: sn.y + Math.sin(rad) * 12,
                  x2: sn.x + Math.cos(rad) * 75,
                  y2: sn.y + Math.sin(rad) * 75,
                  stroke: sn.color
                });
              })
            )
          ),
          // 1. Ambient Background Stars
          react.createElement(
            "g",
            { className: "ambient-stars", pointerEvents: "none" },
            s.starDensity !== "off" && this.ambientStars.map((star, idx) =>
              react.createElement("circle", {
                key: `star-${idx}`,
                className: "ambient-star",
                cx: star.x,
                cy: star.y,
                r: star.r,
                fill: s.primaryColor,
                style: {
                  "--twinkle-dur": `${star.dur}s`,
                  "--twinkle-del": `${star.delay}s`
                }
              })
            )
          ),
          // 2. Constellation Connecting Lines Group
          react.createElement("g", {
            className: "constellation-lines",
            ref: (el) => (this.linesGroupEl = el),
            pointerEvents: "none"
          },
            this.nodes.map((node, idx) => {
              if (!node.prevNode) return null;
              return react.createElement("line", {
                key: `line-${idx}`,
                className: "const-line is-future",
                x1: node.prevNode.x,
                y1: node.prevNode.y,
                x2: node.x,
                y2: node.y,
                strokeLinecap: "round"
              });
            })
          ),
          // 3. Progress trail + 4. Beacon halo are built imperatively in _buildBeaconDOM()
          // so React never resets their transforms. They are appended to this viewport group.
          // 5. Constellation Word Star Nodes
          react.createElement("g", {
            className: "constellation-nodes",
            ref: (el) => (this.nodesGroupEl = el)
          },
            this.nodes.map((node) =>
              react.createElement(
                "g",
                {
                  key: node.id,
                  className: `star-node is-future ${node.isLineEnd ? "is-line-end" : ""}`,
                  onClick: (e) => {
                    e.stopPropagation();
                    this.seekToWord(node.startTime);
                  }
                },
                // Popped accent ring for stream-ending words
                node.isLineEnd &&
                react.createElement("circle", {
                  className: "star-node-pop-ring",
                  cx: node.x,
                  cy: node.y,
                  r: 10,
                  fill: "none",
                  stroke: s.primaryColor,
                  strokeWidth: 1.2,
                  strokeDasharray: "2 2",
                  opacity: 0.35
                }),
                react.createElement("circle", {
                  className: "star-node-core",
                  cx: node.x,
                  cy: node.y,
                  r: node.isLineEnd ? 3.5 : 2.2,
                  fill: s.futureColor
                }),
                react.createElement(
                  "text",
                  {
                    className: "star-node-text",
                    x: node.x,
                    y: node.y + (node.isLineEnd ? 20 : 18),
                    textAnchor: "middle",
                    fill: s.futureColor,
                    fontSize: s.fontSize * (node.isLineEnd ? 0.94 : 0.88),
                    letterSpacing: `${s.letterSpacing}em`
                  },
                  node.text
                )
              )
            )
          )
        ),
        // Static Vignette Screen
        react.createElement("rect", {
          width: "100%",
          height: "100%",
          fill: "url(#space-vignette)",
          pointerEvents: "none"
        })
      ),

      // Center Status Banner
      (isLoading || error || (!this.state.parsedLyrics && trackInfo.title)) &&
      react.createElement(
        "div",
        { className: "constellation-status-banner" },
        isLoading
          ? react.createElement(
            react.Fragment,
            null,
            react.createElement(
              "div",
              { className: "status-icon status-spinner" },
              react.createElement(
                "svg",
                { width: 32, height: 32, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2 },
                react.createElement("circle", { cx: 12, cy: 12, r: 10, strokeOpacity: 0.25 }),
                react.createElement("path", { d: "M12 2a10 10 0 0 1 10 10", strokeLinecap: "round" })
              )
            ),
            react.createElement("div", null, "Mapping celestial synced lyrics...")
          )
          : react.createElement(
            react.Fragment,
            null,
            react.createElement(
              "div",
              { className: "status-icon" },
              react.createElement(
                "svg",
                { width: 36, height: 36, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8 },
                react.createElement("circle", { cx: 12, cy: 12, r: 10 }),
                react.createElement("line", { x1: 8, y1: 12, x2: 16, y2: 12 })
              )
            ),
            react.createElement("div", null, error || "No synced lyrics found for this track")
          )
      ),

      // Song Section Minimap Timeline (disabled by default, toggled in Settings)
      s.showSongSections && (this.state.songSections && this.state.songSections.length > 0) &&
      react.createElement(
        "div",
        { className: `constellation-sections-bar ${hideHud ? "hud-hidden" : ""}` },
        this.state.songSections.map((sec, secIdx) => {
          const isSecActive = (this.currentSmoothedProgress || 0) >= sec.timeMs && (this.currentSmoothedProgress || 0) < sec.endTime;
          return react.createElement(
            "button",
            {
              key: `sec-${secIdx}-${sec.name}`,
              className: `section-pill ${isSecActive ? "active" : ""}`,
              title: `Jump to ${sec.name}`,
              onClick: () => this.seekToWord(sec.timeMs + 50)
            },
            sec.name
          );
        })
      ),

      // Ultra-Minimal Luxury Glassmorphic Bottom HUD
      react.createElement(
        "div",
        { className: `constellation-bottom-bar ${hideHud ? "hud-hidden" : ""}` },
        // Track Title & Artist
        react.createElement(
          "div",
          { className: "hud-track-meta" },
          react.createElement(
            "div",
            { className: "hud-title" },
            react.createElement("span", { className: "hud-badge" }),
            react.createElement("span", { style: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "210px" } }, trackInfo.title || "No track playing"),
            s.enableAudioHud && react.createElement(
              "div",
              { className: "hud-equalizer-bars", title: isPlaying ? "Live audio rhythm" : "Paused" },
              [1, 2, 3, 4, 5].map((b) =>
                react.createElement("span", {
                  key: b,
                  className: `hud-eq-bar bar-${b} ${isPlaying ? "playing" : "paused"}`
                })
              )
            )
          ),
          react.createElement(
            "div",
            { className: "hud-artist", style: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "210px" } },
            trackInfo.artist || "",
            s.enableAudioHud && trackInfo.title ? ` · ${118 + ((trackInfo.title.length * 4) % 24)} BPM` : ""
          )
        ),
        // Play / Pause Button
        react.createElement(
          "button",
          {
            className: "hud-btn",
            title: isPlaying ? "Pause" : "Play",
            onClick: this.togglePlay
          },
          isPlaying
            ? react.createElement(
              "svg",
              { width: 13, height: 13, viewBox: "0 0 24 24", fill: "currentColor" },
              react.createElement("rect", { x: 6, y: 4, width: 4, height: 16, rx: 1 }),
              react.createElement("rect", { x: 14, y: 4, width: 4, height: 16, rx: 1 })
            )
            : react.createElement(
              "svg",
              { width: 13, height: 13, viewBox: "0 0 24 24", fill: "currentColor" },
              react.createElement("polygon", { points: "5 3 19 12 5 21 5 3" })
            )
        ),
        // Recenter Camera Button (only in constellation mode)
        viewMode === "constellation" &&
        react.createElement(
          "button",
          {
            className: `hud-btn ${autoFollow ? "active" : ""}`,
            title: "Re-center Camera",
            onClick: this.handleRecenter
          },
          react.createElement(
            "svg",
            { width: 13, height: 13, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2 },
            react.createElement("circle", { cx: 12, cy: 12, r: 3 }),
            react.createElement("path", { d: "M12 2v3M12 19v3M2 12h3M19 12h3" })
          )
        ),
        // Minimal Segmented Mode Switcher (✦ Stars vs T Kinetic)
        react.createElement(
          "div",
          { className: "hud-mode-pill" },
          react.createElement(
            "button",
            {
              className: `hud-mode-seg ${viewMode !== "kinetic" ? "active" : ""}`,
              onClick: () => {
                this.setState({ viewMode: "constellation" });
                this.updateSettings({ viewMode: "constellation" });
              }
            },
            "✦ Stars"
          ),
          react.createElement(
            "button",
            {
              className: `hud-mode-seg ${viewMode === "kinetic" ? "active" : ""}`,
              onClick: () => {
                this.setState({ viewMode: "kinetic" });
                this.updateSettings({ viewMode: "kinetic" });
              }
            },
            "T Kinetic"
          )
        ),
        // Visual Studio Settings Button
        react.createElement(
          "button",
          {
            className: `hud-btn ${isSettingsOpen ? "active" : ""}`,
            title: "Visual Studio Settings",
            onClick: () => this.setState({ isSettingsOpen: !isSettingsOpen })
          },
          react.createElement(
            "svg",
            { width: 13, height: 13, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2 },
            react.createElement("circle", { cx: 12, cy: 12, r: 3 }),
            react.createElement("path", { d: "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" })
          )
        ),
        // Fullscreen Toggle Button
        react.createElement(
          "button",
          {
            className: `hud-btn ${isFullscreen ? "active" : ""}`,
            title: isFullscreen ? "Exit Fullscreen (Esc or F)" : "Fullscreen (F)",
            onClick: this.toggleFullscreen
          },
          isFullscreen
            ? react.createElement(
              "svg",
              { width: 13, height: 13, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2 },
              react.createElement("path", { d: "M4 14h6m0 0v6m0-6L3 21m17-7h-6m0 0v6m0-6l7 7M10 10V4m0 6H4m6 0L3 3m10 7h6m-6 0V4m0 6l7-7" })
            )
            : react.createElement(
              "svg",
              { width: 13, height: 13, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2 },
              react.createElement("path", { d: "M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" })
            )
        ),
        // Lyrics Refresh Button
        react.createElement(
          "button",
          {
            className: "hud-btn",
            title: "Reload Lyrics",
            onClick: () => {
              lyricsMemoryCache.clear();
              this.currentUri = null;
              this.handleSongChange();
            }
          },
          react.createElement(
            "svg",
            { width: 13, height: 13, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2 },
            react.createElement("path", { d: "M21.5 2v6h-6M2.5 22v-6h6" }),
            react.createElement("path", { d: "M19.5 13a9 9 0 0 1-15 4L2.5 16M4.5 11a9 9 0 0 1 15-4L21.5 8" })
          )
        ),
        // Close / Exit Constellation Button
        react.createElement(
          "button",
          {
            className: "hud-btn",
            title: "Close Constellation (or click the sidebar/playbar button)",
            onClick: () => {
              if (window.Spicetify && window.Spicetify.Platform && window.Spicetify.Platform.History && window.Spicetify.Platform.History.goBack) {
                window.Spicetify.Platform.History.goBack();
              } else {
                window.history.back();
              }
            }
          },
          react.createElement(
            "svg",
            { width: 13, height: 13, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2.2, strokeLinecap: "round" },
            react.createElement("line", { x1: 18, y1: 6, x2: 6, y2: 18 }),
            react.createElement("line", { x1: 6, y1: 6, x2: 18, y2: 18 })
          )
        )
      ),

      // Luxury Two-Column Settings Dialog (Spicy Lyrics Architecture)
      isSettingsOpen &&
      react.createElement(
        "div",
        {
          className: `constellation-modal-backdrop ${this.state.isEyePreview ? "preview-mode" : ""}`,
          onClick: () => this.setState({ isSettingsOpen: false, isEyePreview: false })
        },
        // Floating Eye Preview Restoration Pill
        this.state.isEyePreview &&
        react.createElement(
          "div",
          {
            className: "const-preview-float-pill",
            onClick: (e) => {
              e.stopPropagation();
              this.setState({ isEyePreview: false });
            }
          },
          react.createElement(
            "svg",
            { width: 15, height: 15, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2.2, strokeLinecap: "round", strokeLinejoin: "round" },
            react.createElement("path", { d: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" }),
            react.createElement("circle", { cx: 12, cy: 12, r: 3 })
          ),
          react.createElement("span", null, "Previewing live lyrics — Tap here to restore Settings")
        ),

        // Main 2-Column Dialog Panel
        react.createElement(
          "div",
          {
            className: `constellation-modal-panel ${this.state.isEyePreview ? "preview-mode" : ""}`,
            onClick: (e) => e.stopPropagation()
          },

          // Left Sidebar (220px)
          react.createElement(
            "div",
            { className: "const-settings-sidebar" },
            // Brand Title
            react.createElement(
              "div",
              { className: "const-sidebar-brand" },
              react.createElement(
                "svg",
                { width: 14, height: 14, viewBox: "0 0 24 24", fill: "currentColor" },
                react.createElement("path", { d: "M12 2l2.4 4.8 5.3.8-3.8 3.7.9 5.3-4.8-2.5-4.8 2.5.9-5.3-3.8-3.7 5.3-.8L12 2z" })
              ),
              "Constellation"
            ),
            react.createElement("div", { className: "const-sidebar-title" }, "Settings"),

            // Search Bar
            react.createElement(
              "div",
              { className: "const-sidebar-search-box" },
              react.createElement(
                "div",
                { className: "const-sidebar-search-icon" },
                react.createElement(
                  "svg",
                  { width: 14, height: 14, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2.2 },
                  react.createElement("circle", { cx: 11, cy: 11, r: 7 }),
                  react.createElement("line", { x1: 21, y1: 21, x2: 16.65, y2: 16.65 })
                )
              ),
              react.createElement("input", {
                type: "text",
                className: "const-sidebar-search-input",
                placeholder: "Search settings",
                value: this.state.settingsSearch || "",
                onChange: (e) => this.setState({ settingsSearch: e.target.value })
              })
            ),

            // Sidebar Nav Items
            react.createElement(
              "div",
              { className: "const-sidebar-nav" },
              [
                { id: "lyrics", label: "Lyrics", icon: "✦" },
                { id: "background", label: "Background", icon: "🖼" },
                { id: "playback", label: "Playback", icon: "⏱" },
                { id: "appearance", label: "Appearance", icon: "Aa" },
                { id: "about", label: "About", icon: "ⓘ" }
              ].map((item) =>
                react.createElement(
                  "button",
                  {
                    key: item.id,
                    className: `const-nav-item ${(!this.state.settingsSearch && activeSettingsTab === item.id) ? "active" : ""}`,
                    onClick: () => this.setState({ activeSettingsTab: item.id, settingsSearch: "" })
                  },
                  react.createElement("span", { style: { opacity: 0.75, width: 18, textAlign: "center" } }, item.icon),
                  react.createElement("span", null, item.label)
                )
              )
            )
          ),

          // Right Main Pane
          react.createElement(
            "div",
            { className: "const-settings-main" },

            // Top Header Bar
            react.createElement(
              "div",
              { className: "const-main-header" },
              react.createElement(
                "div",
                { className: "const-main-title" },
                this.state.settingsSearch
                  ? `Search: "${this.state.settingsSearch}"`
                  : activeSettingsTab === "lyrics"
                  ? "Lyrics"
                  : activeSettingsTab === "background"
                  ? "Background"
                  : activeSettingsTab === "playback"
                  ? "Playback"
                  : activeSettingsTab === "appearance"
                  ? "Appearance"
                  : "About"
              ),
              react.createElement(
                "div",
                { className: "const-main-actions" },
                // Eye Button (preview lyrics live behind modal)
                react.createElement(
                  "button",
                  {
                    className: "const-header-action-btn",
                    title: "Live Preview behind settings (tap to hide modal)",
                    onClick: () => this.setState({ isEyePreview: true })
                  },
                  react.createElement(
                    "svg",
                    { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" },
                    react.createElement("path", { d: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" }),
                    react.createElement("circle", { cx: 12, cy: 12, r: 3 })
                  )
                ),
                // Close Button
                react.createElement(
                  "button",
                  {
                    className: "const-header-action-btn",
                    title: "Close settings",
                    onClick: () => this.setState({ isSettingsOpen: false, isEyePreview: false })
                  },
                  react.createElement(
                    "svg",
                    { width: 14, height: 14, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2.2, strokeLinecap: "round" },
                    react.createElement("line", { x1: 18, y1: 6, x2: 6, y2: 18 }),
                    react.createElement("line", { x1: 6, y1: 6, x2: 18, y2: 18 })
                  )
                )
              )
            ),

            // Scrollable Settings Content
            react.createElement(
              "div",
              { className: "const-main-scroll" },
              (() => {
                const query = (this.state.settingsSearch || "").trim().toLowerCase();
                const matches = (label, desc) => !query || label.toLowerCase().includes(query) || (desc && desc.toLowerCase().includes(query));

                // Helper for iOS Switch
                const renderIosSwitch = (checked, onToggle) =>
                  react.createElement(
                    "button",
                    {
                      style: {
                        width: 38,
                        height: 22,
                        borderRadius: 11,
                        border: "none",
                        backgroundColor: checked ? s.primaryColor : "rgba(255,255,255,0.14)",
                        cursor: "pointer",
                        position: "relative",
                        transition: "all 0.22s ease",
                        padding: 0,
                        flexShrink: 0
                      },
                      onClick: onToggle
                    },
                    react.createElement("div", {
                      style: {
                        width: 16,
                        height: 16,
                        borderRadius: "50%",
                        backgroundColor: checked ? "#000000" : "#ffffff",
                        position: "absolute",
                        top: 3,
                        left: checked ? 19 : 3,
                        transition: "all 0.22s cubic-bezier(0.16, 1, 0.3, 1)"
                      }
                    })
                  );

                // Helper for Segmented Pill Button
                const renderPillBtn = (active, label, onClick) =>
                  react.createElement(
                    "button",
                    {
                      style: {
                        padding: "6px 12px",
                        fontSize: "11px",
                        borderRadius: "8px",
                        border: `1px solid ${active ? s.primaryColor : "rgba(255,255,255,0.08)"}`,
                        background: active ? `${s.primaryColor}22` : "rgba(255,255,255,0.03)",
                        color: active ? s.primaryColor : "rgba(255,255,255,0.65)",
                        fontWeight: active ? "700" : "500",
                        cursor: "pointer",
                        transition: "all 0.16s ease"
                      },
                      onClick
                    },
                    label
                  );

                const sections = [];

                // 1. LYRICS CATEGORY
                if (query || activeSettingsTab === "lyrics") {
                  const styleRows = [];
                  if (matches("Display View Mode", "graph poster")) {
                    styleRows.push(
                      react.createElement("div", { key: "viewMode", className: "const-settings-row" },
                        react.createElement("div", null,
                          react.createElement("div", { className: "const-row-label" }, "Display View Mode"),
                          react.createElement("div", { className: "const-row-desc" }, "Choose between celestial orbital graph and dynamic typography poster")
                        ),
                        react.createElement("div", { style: { display: "flex", gap: "6px" } },
                          renderPillBtn(s.viewMode === "constellation", "✦ Constellation", () => {
                            this.setState({ viewMode: "constellation" });
                            this.updateSettings({ viewMode: "constellation" });
                          }),
                          renderPillBtn(s.viewMode === "kinetic", "T Kinetic", () => {
                            this.setState({ viewMode: "kinetic" });
                            this.updateSettings({ viewMode: "kinetic" });
                          })
                        )
                      )
                    );
                  }

                  if (s.viewMode === "constellation" && matches("Active Beacon Marker", "marker tracking")) {
                    styleRows.push(
                      react.createElement("div", { key: "beaconStyle", className: "const-settings-row" },
                        react.createElement("div", null,
                          react.createElement("div", { className: "const-row-label" }, "Active Beacon Marker"),
                          react.createElement("div", { className: "const-row-desc" }, "Marker tracking the currently sung word")
                        ),
                        react.createElement("div", { style: { display: "flex", gap: "5px" } },
                          [
                            { id: "reticle", label: "✛ Reticle" },
                            { id: "orb", label: "◎ Stellar" },
                            { id: "ring", label: "○ Orbit" },
                            { id: "minimal", label: "· Minimal" }
                          ].map(b =>
                            renderPillBtn(s.beaconStyle === b.id, b.label, () => this.updateSettings({ beaconStyle: b.id }))
                          )
                        )
                      )
                    );
                  }

                  if (s.viewMode === "kinetic" && matches("Typography Poster Style", "kinetic layout")) {
                    styleRows.push(
                      react.createElement("div", { key: "kineticStyle", className: "const-settings-row" },
                        react.createElement("div", null,
                          react.createElement("div", { className: "const-row-label" }, "Typography Poster Style"),
                          react.createElement("div", { className: "const-row-desc" }, "Visual aesthetic for kinetic lyric posters")
                        ),
                        react.createElement("div", { style: { display: "flex", gap: "5px" } },
                          [
                            { id: "cinematic", label: "✨ Editorial" },
                            { id: "warp", label: "🌀 Warp" },
                            { id: "y2k", label: "⚡ Y2K" },
                            { id: "retro_crt", label: "📺 Retro" }
                          ].map(st =>
                            renderPillBtn(s.kineticStyle === st.id, st.label, () => this.updateSettings({ kineticStyle: st.id }))
                          )
                        )
                      )
                    );
                  }

                  if (s.viewMode === "kinetic" && matches("3D Depth Perspective", "camera zoom tilt")) {
                    styleRows.push(
                      react.createElement("div", { key: "kineticWarp", className: "const-settings-row" },
                        react.createElement("div", null,
                          react.createElement("div", { className: "const-row-label" }, "3D Depth Perspective"),
                          react.createElement("div", { className: "const-row-desc" }, "Fluid 3D camera zoom and perspective depth tilt")
                        ),
                        renderIosSwitch(s.kineticWarp !== false, () => this.updateSettings({ kineticWarp: !(s.kineticWarp !== false) }))
                      )
                    );
                  }

                  if (styleRows.length > 0) {
                    sections.push(
                      react.createElement(react.Fragment, { key: "sec-style" },
                        react.createElement("div", { className: "const-section-title" }, "Style & Mode"),
                        react.createElement("div", { className: "const-settings-card" }, styleRows)
                      )
                    );
                  }

                  // Atmosphere Section
                  const atmoRows = [];
                  if (matches("Starfield Density", "background stars celestial space")) {
                    atmoRows.push(
                      react.createElement("div", { key: "starDensity", className: "const-settings-row" },
                        react.createElement("div", null,
                          react.createElement("div", { className: "const-row-label" }, "Starfield Density"),
                          react.createElement("div", { className: "const-row-desc" }, "Background celestial stars in deep space")
                        ),
                        react.createElement("div", { style: { display: "flex", gap: "5px" } },
                          [
                            { id: "off", label: "Off" },
                            { id: "low", label: "Low" },
                            { id: "medium", label: "Medium" },
                            { id: "high", label: "Milky Way" }
                          ].map(d =>
                            renderPillBtn(s.starDensity === d.id, d.label, () => this.updateSettings({ starDensity: d.id }))
                          )
                        )
                      )
                    );
                  }

                  if (matches("Northern Lights Aurora", "ethereal wave curtains breathing")) {
                    atmoRows.push(
                      react.createElement("div", { key: "enableAuroraBorealis", className: "const-settings-row" },
                        react.createElement("div", null,
                          react.createElement("div", { className: "const-row-label" }, "Northern Lights Aurora"),
                          react.createElement("div", { className: "const-row-desc" }, "Flowing ethereal luminous curtains across deep space")
                        ),
                        renderIosSwitch(s.enableAuroraBorealis, () => this.updateSettings({ enableAuroraBorealis: !s.enableAuroraBorealis }))
                      )
                    );
                  }

                  if (matches("Meteor Showers", "shooting stars streaking space")) {
                    atmoRows.push(
                      react.createElement("div", { key: "enableMeteorShower", className: "const-settings-row" },
                        react.createElement("div", null,
                          react.createElement("div", { className: "const-row-label" }, "Shooting Star Meteors"),
                          react.createElement("div", { className: "const-row-desc" }, "Periodic shooting star trails gliding through the cosmos")
                        ),
                        renderIosSwitch(s.enableMeteorShower, () => this.updateSettings({ enableMeteorShower: !s.enableMeteorShower }))
                      )
                    );
                  }

                  if (matches("Supernova Shockwaves", "spark pulse explosion word jump")) {
                    atmoRows.push(
                      react.createElement("div", { key: "enableSupernova", className: "const-settings-row" },
                        react.createElement("div", null,
                          react.createElement("div", { className: "const-row-label" }, "Supernova Shockwaves"),
                          react.createElement("div", { className: "const-row-desc" }, "Spark pulse burst when lyrics advance to next word")
                        ),
                        renderIosSwitch(s.enableSupernova, () => this.updateSettings({ enableSupernova: !s.enableSupernova }))
                      )
                    );
                  }

                  if (atmoRows.length > 0) {
                    sections.push(
                      react.createElement(react.Fragment, { key: "sec-atmo" },
                        react.createElement("div", { className: "const-section-title" }, "Cosmic Atmosphere"),
                        react.createElement("div", { className: "const-settings-card" }, atmoRows)
                      )
                    );
                  }
                }

                // 2. BACKGROUND CATEGORY
                if (query || activeSettingsTab === "background") {
                  const bgRows = [];
                  if (matches("Ambient Artwork Backdrop", "soft blurred cover art breathing")) {
                    bgRows.push(
                      react.createElement("div", { key: "enableAlbumBlurBg", className: "const-settings-row" },
                        react.createElement("div", null,
                          react.createElement("div", { className: "const-row-label" }, "Ambient Artwork Backdrop"),
                          react.createElement("div", { className: "const-row-desc" }, "Soft blurred album cover breathing gently behind lyrics")
                        ),
                        renderIosSwitch(s.enableAlbumBlurBg, () => this.updateSettings({ enableAlbumBlurBg: !s.enableAlbumBlurBg }))
                      )
                    );
                  }

                  if (matches("Backdrop Artwork Source", "track playlist album cover")) {
                    bgRows.push(
                      react.createElement("div", { key: "backdropSource", className: "const-settings-row" },
                        react.createElement("div", null,
                          react.createElement("div", { className: "const-row-label" }, "Backdrop Artwork Source"),
                          react.createElement("div", { className: "const-row-desc" }, "Use current track cover or active playlist artwork")
                        ),
                        react.createElement("div", { style: { display: "flex", gap: "6px" } },
                          renderPillBtn(s.backdropSource !== "playlist", "♫ Track Cover", () => this.updateSettings({ backdropSource: "album" })),
                          renderPillBtn(s.backdropSource === "playlist", "☰ Playlist Cover", () => {
                            this.updateSettings({ backdropSource: "playlist" });
                            if (this.state.trackInfo?.contextUri) {
                              fetchPlaylistCover(this.state.trackInfo.contextUri).then((pUrl) => {
                                if (pUrl) this.setState({ playlistCoverUrl: pUrl });
                              });
                            }
                          })
                        )
                      )
                    );
                  }

                  if (bgRows.length > 0) {
                    sections.push(
                      react.createElement(react.Fragment, { key: "sec-backdropart" },
                        react.createElement("div", { className: "const-section-title" }, "Artwork Aura Backdrop"),
                        react.createElement("div", { className: "const-settings-card" }, bgRows)
                      )
                    );
                  }

                  const themeRows = [];
                  if (matches("Dynamic Album Art Palette", "vibrant tones extracted album cover")) {
                    themeRows.push(
                      react.createElement("div", { key: "dynamicTheme", className: "const-settings-row" },
                        react.createElement("div", null,
                          react.createElement("div", { className: "const-row-label" }, "Dynamic Album Art Palette"),
                          react.createElement("div", { className: "const-row-desc" }, "Extract vibrant neon and ambient tones from playing album art")
                        ),
                        renderIosSwitch(s.themeId === "dynamic", () => {
                          const next = s.themeId === "dynamic" ? "starlight" : "dynamic";
                          this.updateSettings({ themeId: next });
                          if (next === "dynamic" && this.state.trackInfo) {
                            extractTrackColors(this.state.trackInfo.uri, this.state.trackInfo.coverUrl, (ext) => {
                              this.updateSettings(ext);
                            });
                          }
                        })
                      )
                    );
                  }

                  if (matches("Curated Celestial Palettes", "colors presets lime cyan nebula gold starlight")) {
                    themeRows.push(
                      react.createElement("div", { key: "curatedPalettes", className: "const-settings-row", style: { flexDirection: "column", alignItems: "flex-start", gap: "10px" } },
                        react.createElement("div", null,
                          react.createElement("div", { className: "const-row-label" }, "Curated Celestial Palettes"),
                          react.createElement("div", { className: "const-row-desc" }, "Handcrafted starlight color schemes")
                        ),
                        react.createElement("div", { className: "const-palette-grid", style: { width: "100%" } },
                          THEME_PRESETS_JS.filter(p => p.id !== "dynamic").map(preset =>
                            react.createElement("div", {
                              key: preset.id,
                              className: `const-palette-card ${s.themeId === preset.id ? "active" : ""}`,
                              onClick: () => this.updateSettings({
                                themeId: preset.id,
                                primaryColor: preset.primary,
                                glowColor: preset.glow,
                                bgColor: preset.bg,
                                pastColor: preset.past,
                                futureColor: preset.future
                              })
                            },
                              react.createElement("div", {
                                style: {
                                  width: 16,
                                  height: 16,
                                  borderRadius: "50%",
                                  backgroundColor: preset.primary,
                                  boxShadow: `0 0 10px ${preset.glow}66`,
                                  margin: "0 auto 5px auto"
                                }
                              }),
                              react.createElement("div", { style: { fontSize: "11px", fontWeight: "600", color: "#ffffff" } }, preset.name)
                            )
                          )
                        )
                      )
                    );
                  }

                  if (matches("Deep Space Canvas Void", "canvas background base void color")) {
                    themeRows.push(
                      react.createElement("div", { key: "bgColorPicker", className: "const-settings-row" },
                        react.createElement("div", null,
                          react.createElement("div", { className: "const-row-label" }, "Deep Space Void Background"),
                          react.createElement("div", { className: "const-row-desc" }, "Base canvas void background color")
                        ),
                        react.createElement("input", {
                          type: "color",
                          value: s.bgColor,
                          onChange: (e) => this.updateSettings({ bgColor: e.target.value, themeId: "custom" }),
                          style: { width: 30, height: 30, background: "none", border: "none", cursor: "pointer", borderRadius: "50%" }
                        })
                      )
                    );
                  }

                  if (themeRows.length > 0) {
                    sections.push(
                      react.createElement(react.Fragment, { key: "sec-themes" },
                        react.createElement("div", { className: "const-section-title" }, "Theme & Colors"),
                        react.createElement("div", { className: "const-settings-card" }, themeRows)
                      )
                    );
                  }
                }

                // 3. PLAYBACK CATEGORY
                if (query || activeSettingsTab === "playback") {
                  if (matches("Audio Sync Calibration", "bluetooth speaker offset vocal lead latency early")) {
                    sections.push(
                      react.createElement(react.Fragment, { key: "sec-sync" },
                        react.createElement("div", { className: "const-section-title" }, "Audio Sync Calibration"),
                        react.createElement("div", { className: "const-settings-card", style: { padding: "18px" } },
                          react.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" } },
                            react.createElement("div", null,
                              react.createElement("div", { style: { fontSize: "24px", fontWeight: "800", color: s.primaryColor, letterSpacing: "-0.02em" } },
                                `${s.syncOffset >= 0 ? "+" : ""}${s.syncOffset || 0} ms`
                              ),
                              react.createElement("div", { style: { fontSize: "11.5px", color: "rgba(255,255,255,0.48)", marginTop: "2px" } },
                                s.syncOffset === 0 ? "Exact Realtime Sync (0ms)" : (s.syncOffset < 0 ? "Early Vocal Lead" : "Delayed Lyrics")
                              )
                            ),
                            react.createElement("div", { style: { display: "flex", gap: "6px" } },
                              renderPillBtn(false, "-50ms", () => this.updateSettings({ syncOffset: (s.syncOffset || 0) - 50 })),
                              renderPillBtn(false, "+50ms", () => this.updateSettings({ syncOffset: (s.syncOffset || 0) + 50 })),
                              renderPillBtn(s.syncOffset === 0, "Reset (0ms)", () => this.updateSettings({ syncOffset: 0 }))
                            )
                          ),
                          react.createElement("input", {
                            type: "range",
                            min: -1500,
                            max: 1500,
                            step: 50,
                            value: s.syncOffset || 0,
                            style: { width: "100%", accentColor: s.primaryColor, cursor: "pointer" },
                            onChange: (e) => this.updateSettings({ syncOffset: parseInt(e.target.value, 10) })
                          })
                        )
                      )
                    );
                  }

                  const hudRows = [];
                  if (matches("Always Show Player Controls", "keep bottom bar visible hud auto hide")) {
                    hudRows.push(
                      react.createElement("div", { key: "neverHideHud", className: "const-settings-row" },
                        react.createElement("div", null,
                          react.createElement("div", { className: "const-row-label" }, "Always Show Player Controls"),
                          react.createElement("div", { className: "const-row-desc" }, "Keep bottom playback bar and song badge permanently visible")
                        ),
                        renderIosSwitch(s.neverHideHud, () => this.updateSettings({ neverHideHud: !s.neverHideHud, hideHud: false }))
                      )
                    );
                  }

                  if (matches("Song Section Minimap", "verse chorus bridge jump markers minimap")) {
                    hudRows.push(
                      react.createElement("div", { key: "showSongSections", className: "const-settings-row" },
                        react.createElement("div", null,
                          react.createElement("div", { className: "const-row-label" }, "Song Section Minimap"),
                          react.createElement("div", { className: "const-row-desc" }, "Clickable Verse & Chorus jump bar docked above player")
                        ),
                        renderIosSwitch(s.showSongSections, () => this.updateSettings({ showSongSections: !s.showSongSections, _sectionsUserEnabled: !s.showSongSections }))
                      )
                    );
                  }

                  if (matches("Audio Equalizer HUD", "spectrum bars rhythm tempo bpm indicator")) {
                    hudRows.push(
                      react.createElement("div", { key: "enableAudioHud", className: "const-settings-row" },
                        react.createElement("div", null,
                          react.createElement("div", { className: "const-row-label" }, "Audio Equalizer HUD"),
                          react.createElement("div", { className: "const-row-desc" }, "Live audio spectrum bars and rhythm tempo indicator in HUD")
                        ),
                        renderIosSwitch(s.enableAudioHud, () => this.updateSettings({ enableAudioHud: !s.enableAudioHud }))
                      )
                    );
                  }

                  if (hudRows.length > 0) {
                    sections.push(
                      react.createElement(react.Fragment, { key: "sec-hud" },
                        react.createElement("div", { className: "const-section-title" }, "Interface & Player"),
                        react.createElement("div", { className: "const-settings-card" }, hudRows)
                      )
                    );
                  }
                }

                // 4. APPEARANCE / TYPOGRAPHY CATEGORY
                if (query || activeSettingsTab === "appearance") {
                  const typeRows = [];
                  if (matches("Font Family", "typeface sans serif orbit mono elegant")) {
                    typeRows.push(
                      react.createElement("div", { key: "fontFamily", className: "const-settings-row" },
                        react.createElement("div", null,
                          react.createElement("div", { className: "const-row-label" }, "Font Family"),
                          react.createElement("div", { className: "const-row-desc" }, "Display typeface for lyrics and words")
                        ),
                        react.createElement("div", { style: { display: "flex", gap: "5px" } },
                          Object.keys(FONT_MAP_JS).map(fKey =>
                            renderPillBtn(s.fontFamily === fKey, FONT_MAP_JS[fKey].name, () => this.updateSettings({ fontFamily: fKey }))
                          )
                        )
                      )
                    );
                  }

                  if (matches("Base Font Size", "scale font sizing")) {
                    typeRows.push(
                      react.createElement("div", { key: "fontSize", className: "const-settings-row" },
                        react.createElement("div", null,
                          react.createElement("div", { className: "const-row-label" }, "Base Font Size"),
                          react.createElement("div", { className: "const-row-desc" }, `Current scale: ${s.fontSize}px`)
                        ),
                        react.createElement("input", {
                          type: "range",
                          min: 12,
                          max: 22,
                          value: s.fontSize,
                          onChange: (e) => this.updateSettings({ fontSize: parseInt(e.target.value, 10) }),
                          style: { width: 130, accentColor: s.primaryColor, cursor: "pointer" }
                        })
                      )
                    );
                  }

                  if (matches("Text Capitalization", "casing uppercase caps sung capitalize")) {
                    typeRows.push(
                      react.createElement("div", { key: "textTransform", className: "const-settings-row" },
                        react.createElement("div", null,
                          react.createElement("div", { className: "const-row-label" }, "Text Capitalization"),
                          react.createElement("div", { className: "const-row-desc" }, "Letter capitalization style for lyrics")
                        ),
                        react.createElement("div", { style: { display: "flex", gap: "5px" } },
                          [
                            { id: "none", label: "As Sung" },
                            { id: "uppercase", label: "ALL CAPS" },
                            { id: "capitalize", label: "Capitalize" }
                          ].map(item =>
                            renderPillBtn(s.textTransform === item.id, item.label, () => this.updateSettings({ textTransform: item.id }))
                          )
                        )
                      )
                    );
                  }

                  if (typeRows.length > 0) {
                    sections.push(
                      react.createElement(react.Fragment, { key: "sec-type" },
                        react.createElement("div", { className: "const-section-title" }, "Typography"),
                        react.createElement("div", { className: "const-settings-card" }, typeRows)
                      )
                    );
                  }
                }

                // 5. ABOUT CATEGORY
                if (query || activeSettingsTab === "about") {
                  sections.push(
                    react.createElement(react.Fragment, { key: "sec-about" },
                      react.createElement("div", { className: "const-section-title" }, "About Constellation"),
                      react.createElement("div", { className: "const-settings-card" },
                        react.createElement("div", { className: "const-settings-row" },
                          react.createElement("div", null,
                            react.createElement("div", { className: "const-row-label" }, "Constellation Synced Lyrics"),
                            react.createElement("div", { className: "const-row-desc" }, "Real-time celestial starlight lyrics and kinetic typography for Spicetify")
                          ),
                          react.createElement("span", {
                            style: {
                              fontSize: "11px",
                              fontWeight: "700",
                              color: s.primaryColor,
                              background: `${s.primaryColor}22`,
                              border: `1px solid ${s.primaryColor}44`,
                              padding: "4px 10px",
                              borderRadius: "9999px"
                            }
                          }, "v2.4")
                        ),
                        react.createElement("div", { className: "const-settings-row" },
                          react.createElement("div", null,
                            react.createElement("div", { className: "const-row-label" }, "Reset All Settings"),
                            react.createElement("div", { className: "const-row-desc" }, "Restore all themes, visual atmosphere, typography and sync settings to defaults")
                          ),
                          react.createElement("button", {
                            style: {
                              background: "rgba(255,255,255,0.06)",
                              border: "1px solid rgba(255,255,255,0.1)",
                              color: "#ffffff",
                              fontSize: "11.5px",
                              fontWeight: "600",
                              padding: "6px 14px",
                              borderRadius: "8px",
                              cursor: "pointer",
                              transition: "all 0.15s ease"
                            },
                            onClick: this.resetSettings
                          }, "Reset to Defaults")
                        )
                      )
                    )
                  );
                }

                if (sections.length === 0) {
                  return react.createElement("div", {
                    style: {
                      textAlign: "center",
                      padding: "48px 16px",
                      color: "rgba(255,255,255,0.4)",
                      fontSize: "13px"
                    }
                  }, `No settings found matching "${this.state.settingsSearch}"`);
                }

                return sections;
              })()
            )
          )
        )
      )
    );
  }
}

// Spicetify Custom App Entry Point
function render() {
  const r = (window.Spicetify && window.Spicetify.React) || window.React;
  if (!r) {
    console.error("[Constellation] Spicetify.React is not defined.");
    return null;
  }
  return r.createElement(ConstellationApp, null);
}

// Attach globally and export for Spicetify loader
window.render = render;
window.Constellation = {
  render,
  ConstellationApp,
  parseLrc,
  parseSpotifyNativeLines,
  parseSpotifySyllables,
  buildConstellationLayout,
  fetchLyrics,
  getTrackInfo,
  DEFAULT_CONSTELLATION_SETTINGS,
  THEME_PRESETS_JS,
  FONT_MAP_JS
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = { render };
}
