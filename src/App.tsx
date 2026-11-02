import React, { useEffect, useState, useRef, useCallback } from 'react';
import { ConstellationCanvas } from './components/ConstellationCanvas';
import { SpotifyPlayerBar } from './components/SpotifyPlayerBar';
import { SpicetifyExportModal } from './components/SpicetifyExportModal';
import { TrackSearchModal } from './components/TrackSearchModal';
import { parseLrc } from './utils/lrcParser';
import { fetchLyricsFromLRCLIB, PRESET_TRACKS } from './utils/lrclib';
import { ParsedLine, TrackInfo } from './types';
import { Sparkles, Maximize2, Minimize2, Terminal, Radio, Sliders } from 'lucide-react';

// Declarations for Spicetify
declare global {
  interface Window {
    Spicetify?: {
      Player?: {
        data?: any;
        getProgress: () => number;
        isPlaying: () => boolean;
        addEventListener: (event: string, callback: (...args: any[]) => void) => void;
        removeEventListener: (event: string, callback: (...args: any[]) => void) => void;
        play?: () => void;
        pause?: () => void;
        seek?: (ms: number) => void;
      };
    };
  }
}

const MANIFEST_STRING = `{
  "name": "Constellation",
  "icon": "<svg xmlns=\\"http://www.w3.org/2000/svg\\" viewBox=\\"0 0 24 24\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"1.8\\" stroke-linecap=\\"round\\" stroke-linejoin=\\"round\\"><path d=\\"M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83\\"/><circle cx=\\"12\\" cy=\\"12\\" r=\\"3\\" fill=\\"currentColor\\"/><circle cx=\\"19\\" cy=\\"5\\" r=\\"1.5\\" fill=\\"currentColor\\"/><circle cx=\\"5\\" cy=\\"19\\" r=\\"1.5\\" fill=\\"currentColor\\"/><line x1=\\"12\\" y1=\\"12\\" x2=\\"19\\" y2=\\"5\\" stroke=\\"currentColor\\" stroke-dasharray=\\"2 2\\"/><line x1=\\"12\\" y1=\\"12\\" x2=\\"5\\" y2=\\"19\\" stroke=\\"currentColor\\" stroke-dasharray=\\"2 2\\"/></svg>",
  "active-icon": "<svg xmlns=\\"http://www.w3.org/2000/svg\\" viewBox=\\"0 0 24 24\\" fill=\\"currentColor\\" stroke=\\"currentColor\\" stroke-width=\\"1.8\\" stroke-linecap=\\"round\\" stroke-linejoin=\\"round\\"><path d=\\"M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83\\" stroke=\\"currentColor\\"/><circle cx=\\"12\\" cy=\\"12\\" r=\\"3.5\\" fill=\\"#d4ff3a\\"/><circle cx=\\"19\\" cy=\\"5\\" r=\\"2\\" fill=\\"#d4ff3a\\"/><circle cx=\\"5\\" cy=\\"19\\" r=\\"2\\" fill=\\"#d4ff3a\\"/><line x1=\\"12\\" y1=\\"12\\" x2=\\"19\\" y2=\\"5\\" stroke=\\"#d4ff3a\\"/><line x1=\\"12\\" y1=\\"12\\" x2=\\"5\\" y2=\\"19\\" stroke=\\"#d4ff3a\\"/></svg>"
}`;

const INDEX_STRING_PREVIEW = `// CustomApps/constellation/index.js
// Synced lyrics constellation animation on #0a0a0a with #d4ff3a lime glow
// Full file available in /CustomApps/constellation/index.js`;

export default function App() {
  const [isSpicetifyNative, setIsSpicetifyNative] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<TrackInfo>(PRESET_TRACKS[0]);
  const [parsedLines, setParsedLines] = useState<ParsedLine[]>([]);
  const [currentTimeMs, setCurrentTimeMs] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLoadingLyrics, setIsLoadingLyrics] = useState(false);
  const [errorLyrics, setErrorLyrics] = useState<string | null>(null);

  // Modals & UI controls
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [glowIntensity, setGlowIntensity] = useState<'subtle' | 'normal' | 'supernova'>('normal');

  const mainContainerRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number>(performance.now());

  // Check if running inside Spicetify
  useEffect(() => {
    const hasSpicetify = !!(window.Spicetify && window.Spicetify.Player);
    setIsSpicetifyNative(hasSpicetify);

    if (hasSpicetify) {
      const readSpicetifyTrack = () => {
        const data = window.Spicetify?.Player?.data;
        if (!data) return;
        const item = data.item || data.track;
        if (!item) return;

        const title = item.name || item.metadata?.title || '';
        let artist = '';
        if (Array.isArray(item.artists)) {
          artist = item.artists.map((a: any) => a.name).join(', ');
        } else if (item.metadata?.artist_name) {
          artist = item.metadata.artist_name;
        }

        const album = item.album?.name || item.metadata?.album_title || '';
        const durationMs = item.duration?.milliseconds || item.metadata?.duration || 180000;
        const uri = item.uri || item.metadata?.uri || `${title}-${artist}`;

        setCurrentTrack({ title, artist, album, durationMs, uri });
      };

      readSpicetifyTrack();
      window.Spicetify?.Player?.addEventListener('songchange', readSpicetifyTrack);

      return () => {
        window.Spicetify?.Player?.removeEventListener('songchange', readSpicetifyTrack);
      };
    }
  }, []);

  // Fetch or parse lyrics whenever currentTrack changes
  useEffect(() => {
    let cancelled = false;

    const loadLyrics = async () => {
      setIsLoadingLyrics(true);
      setErrorLyrics(null);

      // 1. If track has preset LRC embedded, use immediately
      if (currentTrack.presetLrc) {
        const parsed = parseLrc(currentTrack.presetLrc);
        if (!cancelled) {
          setParsedLines(parsed);
          setIsLoadingLyrics(false);
        }
        return;
      }

      // 2. Query LRCLIB via API
      try {
        const durationSec = Math.round(currentTrack.durationMs / 1000);
        const lrc = await fetchLyricsFromLRCLIB(
          currentTrack.title,
          currentTrack.artist,
          currentTrack.album,
          durationSec,
          currentTrack.uri
        );

        if (cancelled) return;

        if (lrc) {
          const parsed = parseLrc(lrc);
          setParsedLines(parsed);
          if (parsed.length === 0) {
            setErrorLyrics('No lyrics found');
          }
        } else {
          setParsedLines([]);
          setErrorLyrics('No lyrics found');
        }
      } catch (err) {
        if (!cancelled) {
          setParsedLines([]);
          setErrorLyrics('No lyrics found');
        }
      } finally {
        if (!cancelled) {
          setIsLoadingLyrics(false);
        }
      }
    };

    loadLyrics();
    return () => {
      cancelled = true;
    };
  }, [currentTrack]);

  // Playback Loop:
  // - If Spicetify native: reads Spicetify.Player.getProgress()
  // - If simulated: advances currentTimeMs based on delta time, pauses when isPlaying is false
  useEffect(() => {
    const loop = (now: number) => {
      animFrameRef.current = requestAnimationFrame(loop);

      if (isSpicetifyNative && window.Spicetify?.Player) {
        try {
          const progress = window.Spicetify.Player.getProgress() || 0;
          setCurrentTimeMs(progress);
          const playing = window.Spicetify.Player.isPlaying();
          setIsPlaying(playing);
        } catch (e) {
          // ignore
        }
        return;
      }

      // Simulation mode
      const delta = now - lastTimestampRef.current;
      lastTimestampRef.current = now;

      if (isPlaying) {
        setCurrentTimeMs((prev) => {
          const duration = currentTrack.durationMs || 180000;
          const next = prev + delta;
          if (next >= duration) {
            return 0; // loop back or next track
          }
          return next;
        });
      }
    };

    lastTimestampRef.current = performance.now();
    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, isSpicetifyNative, currentTrack]);

  // Controls
  const handleTogglePlay = useCallback(() => {
    if (isSpicetifyNative && window.Spicetify?.Player) {
      if (isPlaying) window.Spicetify.Player.pause?.();
      else window.Spicetify.Player.play?.();
    } else {
      setIsPlaying((prev) => !prev);
    }
  }, [isSpicetifyNative, isPlaying]);

  const handleSeek = useCallback(
    (ms: number) => {
      if (isSpicetifyNative && window.Spicetify?.Player) {
        window.Spicetify.Player.seek?.(ms);
      }
      setCurrentTimeMs(ms);
    },
    [isSpicetifyNative]
  );

  const handleNextTrack = useCallback(() => {
    const currentIndex = PRESET_TRACKS.findIndex((t) => t.title === currentTrack.title);
    const nextIndex = (currentIndex + 1) % PRESET_TRACKS.length;
    setCurrentTrack(PRESET_TRACKS[nextIndex]);
    setCurrentTimeMs(0);
  }, [currentTrack]);

  const handlePrevTrack = useCallback(() => {
    const currentIndex = PRESET_TRACKS.findIndex((t) => t.title === currentTrack.title);
    const prevIndex = (currentIndex - 1 + PRESET_TRACKS.length) % PRESET_TRACKS.length;
    setCurrentTrack(PRESET_TRACKS[prevIndex]);
    setCurrentTimeMs(0);
  }, [currentTrack]);

  const toggleFullscreen = () => {
    if (!mainContainerRef.current) return;
    if (!document.fullscreenElement) {
      mainContainerRef.current.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={mainContainerRef}
      className="w-screen h-screen flex flex-col bg-[#0a0a0a] text-white overflow-hidden select-none"
    >
      {/* Top Bar / App Header */}
      <header className="h-14 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-neutral-800/80 px-4 md:px-6 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#d4ff3a]/15 text-[#d4ff3a] flex items-center justify-center border border-[#d4ff3a]/30 shadow-[0_0_12px_rgba(212,255,58,0.25)]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold tracking-wider uppercase text-white">Constellation</h1>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#d4ff3a]/15 text-[#d4ff3a] border border-[#d4ff3a]/30">
              Spicetify Custom App
            </span>
          </div>
        </div>

        {/* Center: Environment status tag */}
        <div className="hidden md:flex items-center gap-2 text-xs text-neutral-400">
          <span
            className={`w-2 h-2 rounded-full ${
              isSpicetifyNative
                ? 'bg-[#d4ff3a] shadow-[0_0_8px_#d4ff3a]'
                : 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]'
            }`}
          />
          <span>{isSpicetifyNative ? 'Spicetify Native Player' : 'Spotify Simulator Mode'}</span>
        </div>

        {/* Right: Glow Intensity, Spicetify Modal, Fullscreen */}
        <div className="flex items-center gap-2">
          {/* Glow selector */}
          <div className="hidden sm:flex items-center bg-neutral-900 border border-neutral-800 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setGlowIntensity('subtle')}
              className={`px-2 py-1 rounded transition-colors ${
                glowIntensity === 'subtle'
                  ? 'bg-neutral-800 text-[#d4ff3a]'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Soft
            </button>
            <button
              onClick={() => setGlowIntensity('normal')}
              className={`px-2 py-1 rounded transition-colors ${
                glowIntensity === 'normal'
                  ? 'bg-neutral-800 text-[#d4ff3a]'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Neon
            </button>
            <button
              onClick={() => setGlowIntensity('supernova')}
              className={`px-2 py-1 rounded transition-colors ${
                glowIntensity === 'supernova'
                  ? 'bg-neutral-800 text-[#d4ff3a]'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Supernova
            </button>
          </div>

          <button
            onClick={() => setIsExportOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-[#d4ff3a]/40 text-neutral-300 hover:text-[#d4ff3a] text-xs flex items-center gap-1.5 transition-colors"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Spicetify Files</span>
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:text-[#d4ff3a] text-neutral-400 transition-colors"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </header>

      {/* Main Celestial Constellation Canvas */}
      <main className="flex-1 relative w-full h-full overflow-hidden bg-[#0a0a0a]">
        <ConstellationCanvas
          parsedLines={parsedLines}
          currentTimeMs={currentTimeMs}
          isPlaying={isPlaying}
          trackTitle={currentTrack.title}
          trackArtist={currentTrack.artist}
          isLoadingLyrics={isLoadingLyrics}
          errorLyrics={errorLyrics}
          onWordClick={(time) => handleSeek(time)}
          glowIntensity={glowIntensity}
        />
      </main>

      {/* Spotify Player Control Bar */}
      <SpotifyPlayerBar
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        currentTimeMs={currentTimeMs}
        onTogglePlay={handleTogglePlay}
        onSeek={handleSeek}
        onPrevTrack={handlePrevTrack}
        onNextTrack={handleNextTrack}
        presetTracks={PRESET_TRACKS}
        onSelectTrack={(t) => {
          setCurrentTrack(t);
          setCurrentTimeMs(0);
        }}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        isSpicetifyNative={isSpicetifyNative}
      />

      {/* Modal: View Custom App Files & Installation Guide */}
      <SpicetifyExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        manifestContent={MANIFEST_STRING}
        indexContent={INDEX_STRING_PREVIEW}
      />

      {/* Modal: Search LRCLIB or enter custom LRC */}
      <TrackSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectResult={(track, lrc) => {
          setCurrentTrack({ ...track, presetLrc: lrc });
          setCurrentTimeMs(0);
          setIsPlaying(true);
        }}
        onCustomLrcSubmit={(title, artist, lrc) => {
          setCurrentTrack({
            title,
            artist,
            album: 'Custom Composition',
            durationMs: 40000,
            uri: `custom:${Date.now()}`,
            presetLrc: lrc,
          });
          setCurrentTimeMs(0);
          setIsPlaying(true);
        }}
      />
    </div>
  );
}
