import React, { useRef } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Search,
  Terminal,
  ListMusic,
  Sparkles,
} from 'lucide-react';
import { TrackInfo } from '../types';

interface SpotifyPlayerBarProps {
  currentTrack: TrackInfo;
  isPlaying: boolean;
  currentTimeMs: number;
  onTogglePlay: () => void;
  onSeek: (ms: number) => void;
  onPrevTrack: () => void;
  onNextTrack: () => void;
  presetTracks: TrackInfo[];
  onSelectTrack: (track: TrackInfo) => void;
  onOpenSearch: () => void;
  onOpenExport: () => void;
  isSpicetifyNative: boolean;
}

function formatTime(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

export const SpotifyPlayerBar: React.FC<SpotifyPlayerBarProps> = ({
  currentTrack,
  isPlaying,
  currentTimeMs,
  onTogglePlay,
  onSeek,
  onPrevTrack,
  onNextTrack,
  presetTracks,
  onSelectTrack,
  onOpenSearch,
  onOpenExport,
  isSpicetifyNative,
}) => {
  const progressBarRef = useRef<HTMLDivElement>(null);

  const duration = currentTrack.durationMs || 180000;
  const progressPercent = Math.min(100, Math.max(0, (currentTimeMs / duration) * 100));

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    onSeek(ratio * duration);
  };

  return (
    <footer className="h-20 bg-[#121212] border-t border-neutral-800 px-4 md:px-6 flex items-center justify-between text-white select-none z-40 shrink-0 gap-4">
      {/* Left: Track Info & Quick Switcher */}
      <div className="flex items-center gap-3 w-1/4 min-w-[180px]">
        {currentTrack.coverUrl ? (
          <img
            src={currentTrack.coverUrl}
            alt={currentTrack.title}
            className="w-12 h-12 rounded-lg shadow-md object-cover border border-neutral-700/60"
          />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center text-[#d4ff3a]">
            <ListMusic className="w-6 h-6" />
          </div>
        )}

        <div className="flex flex-col overflow-hidden">
          <span className="text-sm font-semibold text-white truncate hover:underline cursor-pointer">
            {currentTrack.title || 'No Track'}
          </span>
          <span className="text-xs text-neutral-400 truncate hover:underline cursor-pointer">
            {currentTrack.artist || 'Unknown Artist'}
          </span>
        </div>
      </div>

      {/* Center: Controls & Scrubber */}
      <div className="flex flex-col items-center gap-1.5 w-2/4 max-w-xl">
        <div className="flex items-center gap-4">
          <button
            onClick={onPrevTrack}
            className="text-neutral-400 hover:text-white p-1 rounded-full transition-colors"
            title="Previous Song"
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </button>

          {/* High-visibility Lime Play/Pause Button */}
          <button
            onClick={onTogglePlay}
            className="w-10 h-10 rounded-full bg-[#d4ff3a] text-black flex items-center justify-center hover:scale-108 active:scale-95 transition-all shadow-[0_0_16px_rgba(212,255,58,0.45)] hover:bg-[#c2ed2c]"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current text-black" />
            ) : (
              <Play className="w-5 h-5 fill-current text-black ml-0.5" />
            )}
          </button>

          <button
            onClick={onNextTrack}
            className="text-neutral-400 hover:text-white p-1 rounded-full transition-colors"
            title="Next Song"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full flex items-center gap-2">
          <span className="text-[11px] font-mono text-neutral-400 w-10 text-right">
            {formatTime(currentTimeMs)}
          </span>

          <div
            ref={progressBarRef}
            onClick={handleProgressBarClick}
            className="relative flex-1 h-1.5 bg-neutral-800 hover:h-2 rounded-full cursor-pointer group transition-all"
          >
            {/* Active filled bar */}
            <div
              className="absolute left-0 top-0 bottom-0 bg-[#d4ff3a] rounded-full transition-all duration-75 shadow-[0_0_8px_rgba(212,255,58,0.5)]"
              style={{ width: `${progressPercent}%` }}
            />
            {/* Scrubber thumb */}
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-white group-hover:bg-[#d4ff3a] rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ left: `${progressPercent}%` }}
            />
          </div>

          <span className="text-[11px] font-mono text-neutral-400 w-10">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Right: Actions, Search, Presets & Spicetify Modal */}
      <div className="flex items-center justify-end gap-2.5 w-1/4 min-w-[200px]">
        {/* Preset Selector */}
        <div className="relative hidden xl:block">
          <select
            value={currentTrack.title}
            onChange={(e) => {
              const selected = presetTracks.find((t) => t.title === e.target.value);
              if (selected) onSelectTrack(selected);
            }}
            className="bg-neutral-800 text-xs text-neutral-200 border border-neutral-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#d4ff3a] cursor-pointer hover:bg-neutral-750 transition-colors"
          >
            {presetTracks.map((t) => (
              <option key={t.uri} value={t.title}>
                {t.title} - {t.artist}
              </option>
            ))}
          </select>
        </div>

        {/* Live Search LRCLIB */}
        <button
          onClick={onOpenSearch}
          className="px-3 py-1.5 text-neutral-200 hover:text-white bg-neutral-800 hover:bg-neutral-750 border border-neutral-700 rounded-lg flex items-center gap-1.5 text-xs font-medium transition-colors"
          title="Search any song on LRCLIB"
        >
          <Search className="w-3.5 h-3.5 text-[#d4ff3a]" />
          <span className="hidden sm:inline">Search Songs</span>
        </button>

        {/* Spicetify Install / Guide Button */}
        <button
          onClick={onOpenExport}
          className="px-3 py-1.5 bg-[#d4ff3a] text-black hover:bg-[#c2ed2c] rounded-lg flex items-center gap-1.5 text-xs font-bold transition-all shadow-[0_0_14px_rgba(212,255,58,0.3)] hover:scale-105 active:scale-95"
          title="Install in Spotify / Spicetify"
        >
          <Terminal className="w-3.5 h-3.5 text-black" />
          <span>How to Use</span>
        </button>
      </div>
    </footer>
  );
};
