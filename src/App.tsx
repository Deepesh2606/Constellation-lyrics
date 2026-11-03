import React, { useEffect, useState, useRef, useCallback } from 'react';
import { ConstellationCanvas } from './components/ConstellationCanvas';
import { SpotifyPlayerBar } from './components/SpotifyPlayerBar';
import { SpicetifyExportModal } from './components/SpicetifyExportModal';
import { TrackSearchModal } from './components/TrackSearchModal';
import { SettingsModal } from './components/SettingsModal';
import { parseLrc } from './utils/lrcParser';
import { fetchLyricsFromLRCLIB, PRESET_TRACKS } from './utils/lrclib';
import {
  ParsedLine,
  TrackInfo,
  ConstellationSettings,
  DEFAULT_SETTINGS,
} from './types';
import {
  Sparkles,
  Maximize2,
  Minimize2,
  Terminal,
  Play,
  Pause,
  Search,
  Sliders,
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
      LocalStorage?: {
        get: (key: string) => string | null;
        set: (key: string, value: string) => void;
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

  // Settings state (persisted to localStorage)
  const [settings, setSettings] = useState<ConstellationSettings>(() => {
    try {
      const saved = localStorage.getItem('constellation_user_settings');
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch (e) {
      // ignore
    }
    return DEFAULT_SETTINGS;
  });

  // Modals & UI controls
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const mainContainerRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number>(performance.now());
  const smoothedProgressRef = useRef<number>(0);
  const lastReportedProgressRef = useRef<number>(0);

  const handleUpdateSettings = (newSettings: ConstellationSettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem('constellation_user_settings', JSON.stringify(newSettings));
    } catch (e) {
      // ignore
    }
  };

  const handleResetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    try {
      localStorage.setItem('constellation_user_settings', JSON.stringify(DEFAULT_SETTINGS));
    } catch (e) {
      // ignore
    }
  };

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

  // High-precision smooth 60/120 FPS audio progress loop
  useEffect(() => {
    const loop = (now: number) => {
      animFrameRef.current = requestAnimationFrame(loop);

      const delta = now - lastTimestampRef.current;
      lastTimestampRef.current = now;

      if (isSpicetifyNative && window.Spicetify?.Player) {
        try {
          const raw = window.Spicetify.Player.getProgress() || 0;
          const playing = window.Spicetify.Player.isPlaying();
          setIsPlaying(playing);

          if (Math.abs(raw - lastReportedProgressRef.current) > 250) {
            // Scrub or seek occurred
            smoothedProgressRef.current = raw;
            lastReportedProgressRef.current = raw;
          } else if (playing) {
            // Smooth linear continuous advance with gentle clock drift correction
            smoothedProgressRef.current += delta;
            smoothedProgressRef.current += (raw - smoothedProgressRef.current) * 0.08;
          }
          setCurrentTimeMs(smoothedProgressRef.current);
        } catch (e) {
          // ignore
        }
        return;
      }

      // Simulation mode
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
      smoothedProgressRef.current = ms;
      lastReportedProgressRef.current = ms;
      setCurrentTimeMs(ms);
    },
    [isSpicetifyNative]
  );

  const handleNextTrack = useCallback(() => {
    const currentIndex = PRESET_TRACKS.findIndex((t) => t.title === currentTrack.title);
    const nextIndex = (currentIndex + 1) % PRESET_TRACKS.length;
    setCurrentTrack(PRESET_TRACKS[nextIndex]);
    setCurrentTimeMs(0);
    smoothedProgressRef.current = 0;
  }, [currentTrack]);

  const handlePrevTrack = useCallback(() => {
    const currentIndex = PRESET_TRACKS.findIndex((t) => t.title === currentTrack.title);
    const prevIndex = (currentIndex - 1 + PRESET_TRACKS.length) % PRESET_TRACKS.length;
    setCurrentTrack(PRESET_TRACKS[prevIndex]);
    setCurrentTimeMs(0);
    smoothedProgressRef.current = 0;
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
      className="w-screen h-screen flex flex-col text-white overflow-hidden select-none transition-colors duration-300"
      style={{ backgroundColor: settings.bgColor }}
    >
      {/* Top Bar / App Header */}
      <header className="h-16 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-neutral-800/80 px-4 md:px-6 flex items-center justify-between z-30 shrink-0 gap-3">
        {/* Left: Branding & Tag */}
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center border shadow-md transition-colors"
            style={{
              backgroundColor: `${settings.primaryColor}1a`,
              color: settings.primaryColor,
              borderColor: `${settings.primaryColor}55`,
              boxShadow: `0 0 14px ${settings.glowColor}33`,
            }}
          >
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-wider uppercase text-white">Constellation</h1>
              <span
                className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full font-semibold border transition-colors"
                style={{
                  backgroundColor: `${settings.primaryColor}22`,
                  color: settings.primaryColor,
                  borderColor: `${settings.primaryColor}40`,
                }}
              >
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
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 hover:border-white text-white text-xs font-semibold transition-all hover:bg-neutral-800 shadow-md"
            title={isPlaying ? 'Pause Lyrics' : 'Play Lyrics'}
          >
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5 fill-current" style={{ color: settings.primaryColor }} />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current ml-0.5" style={{ color: settings.primaryColor }} />
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
                  smoothedProgressRef.current = 0;
                }
              }}
              className="bg-neutral-900 text-xs font-medium text-neutral-200 border border-neutral-700 rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer hover:bg-neutral-800 transition-colors"
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 hover:border-white text-neutral-300 hover:text-white text-xs font-medium transition-colors"
            title="Search Any Song on LRCLIB"
          >
            <Search className="w-3.5 h-3.5" style={{ color: settings.primaryColor }} />
            <span className="hidden lg:inline">Search Songs</span>
          </button>
        </div>

        {/* Right: Settings, Export, Fullscreen */}
        <div className="flex items-center gap-2">
          {/* Visual Settings Button (Colors, Font, Glow) */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 hover:border-white text-white text-xs font-semibold transition-all hover:bg-neutral-850 shadow-md group"
            style={{ borderColor: `${settings.primaryColor}55` }}
            title="Customize colors, font family & size, glow intensity, and beacon styles"
          >
            <Sliders
              className="w-4 h-4 transition-transform group-hover:rotate-45"
              style={{ color: settings.primaryColor }}
            />
            <span className="hidden sm:inline">Settings</span>
          </button>

          {/* Big Vibrant "How to Use / Install to Spotify" Button */}
          <button
            onClick={() => setIsExportOpen(true)}
            className="px-3.5 py-2 rounded-xl text-black text-xs font-bold flex items-center gap-2 transition-all shadow-md hover:scale-105 active:scale-95"
            style={{
              backgroundColor: settings.primaryColor,
              boxShadow: `0 0 16px ${settings.glowColor}55`,
            }}
            title="View Spicetify install instructions and export files"
          >
            <Terminal className="w-4 h-4 text-black" />
            <span>How to Use</span>
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition-colors"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Celestial Constellation Canvas */}
      <main className="flex-1 min-h-0 relative w-full overflow-hidden">
        <ConstellationCanvas
          parsedLines={parsedLines}
          currentTimeMs={currentTimeMs}
          durationMs={currentTrack.durationMs}
          isPlaying={isPlaying}
          trackTitle={currentTrack.title}
          trackArtist={currentTrack.artist}
          isLoadingLyrics={isLoadingLyrics}
          errorLyrics={errorLyrics}
          settings={settings}
          onWordClick={(time) => handleSeek(time)}
          onTogglePlay={handleTogglePlay}
          onNextTrack={handleNextTrack}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenExport={() => setIsExportOpen(true)}
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
            smoothedProgressRef.current = 0;
          }}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenExport={() => setIsExportOpen(true)}
          isSpicetifyNative={isSpicetifyNative}
          accentColor={settings.primaryColor}
          glowColor={settings.glowColor}
        />
      </div>

      {/* Modal: Visual Studio Settings (Colors, Font, Glow) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onResetSettings={handleResetSettings}
      />

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
          smoothedProgressRef.current = 0;
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
          smoothedProgressRef.current = 0;
          setIsPlaying(true);
        }}
      />
    </div>
  );
}
