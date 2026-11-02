import React, { useEffect, useState, useRef, useCallback } from 'react';
import { ConstellationCanvas } from './components/ConstellationCanvas';
import { SpotifyPlayerBar } from './components/SpotifyPlayerBar';
import { SpicetifyExportModal } from './components/SpicetifyExportModal';
import { TrackSearchModal } from './components/TrackSearchModal';
import { parseLrc } from './utils/lrcParser';
import { fetchLyricsFromLRCLIB, PRESET_TRACKS } from './utils/lrclib';
import { ParsedLine, TrackInfo } from './types';
import {
  Sparkles,
  Maximize2,
  Minimize2,
  Terminal,
  Play,
  Pause,
  Search,
  ChevronDown,
  Music,
  Download,
  Info,
} from 'lucide-react';
import manifestRaw from '../CustomApps/constellation/manifest.json?raw';
import indexJsRaw from '../CustomApps/constellation/index.js?raw';

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

  // Playback Loop
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
            return 0; // loop back
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
      <header className="h-16 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-neutral-800/80 px-4 md:px-6 flex items-center justify-between z-30 shrink-0 gap-3">
        {/* Left: Branding & Tag */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#d4ff3a]/15 text-[#d4ff3a] flex items-center justify-center border border-[#d4ff3a]/40 shadow-[0_0_14px_rgba(212,255,58,0.3)]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-wider uppercase text-white">Constellation</h1>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#d4ff3a]/20 text-[#d4ff3a] font-semibold border border-[#d4ff3a]/30">
                Spicetify App
              </span>
            </div>
            <div className="text-[11px] text-neutral-400 hidden sm:block">
              Synced Spotify Lyrics Starfield
            </div>
          </div>
        </div>

        {/* Center: Quick Interactive Playback & Song Picker Buttons */}
        <div className="flex items-center gap-2">
          {/* Quick Play/Pause Button */}
          <button
            onClick={handleTogglePlay}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 hover:border-[#d4ff3a] text-white text-xs font-semibold transition-all hover:bg-neutral-800 shadow-md"
            title={isPlaying ? 'Pause Lyrics' : 'Play Lyrics'}
          >
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5 fill-current text-[#d4ff3a]" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current text-[#d4ff3a]" />
            )}
            <span className="hidden md:inline">{isPlaying ? 'Pause' : 'Play'}</span>
          </button>

          {/* Quick Song Switcher */}
          <div className="relative">
            <select
              value={currentTrack.title}
              onChange={(e) => {
                const selected = PRESET_TRACKS.find((t) => t.title === e.target.value);
                if (selected) {
                  setCurrentTrack(selected);
                  setCurrentTimeMs(0);
                }
              }}
              className="bg-neutral-900 text-xs font-medium text-neutral-200 border border-neutral-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#d4ff3a] cursor-pointer hover:bg-neutral-800 transition-colors"
            >
              {PRESET_TRACKS.map((t) => (
                <option key={t.uri} value={t.title}>
                  🎵 {t.title} - {t.artist}
                </option>
              ))}
            </select>
          </div>

          {/* Search Songs Button */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 hover:border-[#d4ff3a] text-neutral-300 hover:text-white text-xs font-medium transition-colors"
            title="Search Any Song on LRCLIB"
          >
            <Search className="w-3.5 h-3.5 text-[#d4ff3a]" />
            <span className="hidden lg:inline">Search Songs</span>
          </button>
        </div>

        {/* Right: Big "How to Use" Button & Fullscreen */}
        <div className="flex items-center gap-2">
          {/* Big Vibrant "How to Use / Install to Spotify" Button */}
          <button
            onClick={() => setIsExportOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-[#d4ff3a] text-black hover:bg-[#c2ed2c] text-xs font-bold flex items-center gap-2 transition-all shadow-[0_0_16px_rgba(212,255,58,0.35)] hover:scale-105 active:scale-95"
            title="View Spicetify install instructions and export files"
          >
            <Terminal className="w-4 h-4 text-black" />
            <span>How to Use / Install</span>
          </button>

          {/* Glow selector */}
          <div className="hidden xl:flex items-center bg-neutral-900 border border-neutral-800 rounded-lg p-0.5 text-xs">
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
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 hover:text-[#d4ff3a] text-neutral-400 transition-colors"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Celestial Constellation Canvas (min-h-0 so flex column respects height without pushing footer offscreen) */}
      <main className="flex-1 min-h-0 relative w-full overflow-hidden bg-[#0a0a0a]">
        <ConstellationCanvas
          parsedLines={parsedLines}
          currentTimeMs={currentTimeMs}
          durationMs={currentTrack.durationMs}
          isPlaying={isPlaying}
          trackTitle={currentTrack.title}
          trackArtist={currentTrack.artist}
          isLoadingLyrics={isLoadingLyrics}
          errorLyrics={errorLyrics}
          onWordClick={(time) => handleSeek(time)}
          onTogglePlay={handleTogglePlay}
          onNextTrack={handleNextTrack}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenExport={() => setIsExportOpen(true)}
          glowIntensity={glowIntensity}
        />
      </main>

      {/* Spotify Player Control Bar (Always firmly anchored at bottom) */}
      <div className="shrink-0 z-40 bg-[#121212] border-t border-neutral-800 shadow-2xl">
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
      </div>

      {/* Modal: View Custom App Files & Installation Guide */}
      <SpicetifyExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        manifestContent={manifestRaw}
        indexContent={indexJsRaw}
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
