import React, { useRef } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Search,
  Terminal,
  ListMusic,
  Volume2,
  VolumeX,
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
  accentColor?: string;
  glowColor?: string;
  volume?: number;
  isMuted?: boolean;
  onVolumeChange?: (val: number) => void;
  onToggleMute?: () => void;
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
  accentColor = '#d4ff3a',
  glowColor = '#d4ff3a',
  volume = 0.85,
  isMuted = false,
  onVolumeChange,
  onToggleMute,
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
    <footer className="h-22 bg-[#0e0f14]/95 backdrop-blur-xl border-t border-neutral-800/80 px-4 md:px-6 flex items-center justify-between text-white select-none z-40 shrink-0 gap-4">
      {/* Left: Track Info & Quick Switcher */}
      <div className="flex items-center gap-3.5 w-1/4 min-w-[210px]">
        {currentTrack.coverUrl ? (
          <div className="relative group shrink-0">
            <img
              src={currentTrack.coverUrl}
              alt={currentTrack.title}
              className="w-14 h-14 rounded-xl shadow-lg object-cover border border-white/10 group-hover:scale-105 transition-transform"
              style={{
                boxShadow: `0 4px 16px rgba(0,0,0,0.5), 0 0 12px ${glowColor}25`,
              }}
            />
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none" />
          </div>
        ) : (
          <div
            className="w-14 h-14 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center transition-colors shrink-0 shadow-md"
            style={{ color: accentColor }}
          >
            <ListMusic className="w-7 h-7" />
          </div>
        )}
        <div className="flex flex-col overflow-hidden min-w-0 pr-1">
          <div className="flex items-center gap-2">
            <span className="text-sm sm:text-[15px] font-bold text-white truncate hover:underline cursor-pointer leading-snug">
              {currentTrack.title || 'No Track'}
            </span>
            {isPlaying && (
              <div className="flex items-end gap-0.5 h-2.5 shrink-0">
                <span className="w-0.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: accentColor }} />
                <span className="w-0.5 h-2.5 rounded-full animate-bounce [animation-delay:0.15s]" style={{ backgroundColor: accentColor }} />
                <span className="w-0.5 h-2 rounded-full animate-bounce [animation-delay:0.3s]" style={{ backgroundColor: accentColor }} />
              </div>
            )}
          </div>
          <span className="text-xs sm:text-[12.5px] text-neutral-300 truncate hover:underline cursor-pointer font-medium">
            {currentTrack.artist || 'Unknown Artist'}
          </span>
          {currentTrack.album && currentTrack.album !== currentTrack.title && (
            <span className="text-[11px] text-neutral-500 truncate hidden sm:block">
              {currentTrack.album}
            </span>
          )}
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

          {/* High-visibility Dynamic Play/Pause Button */}
          <button
            onClick={onTogglePlay}
            className="w-10 h-10 rounded-full text-black flex items-center justify-center hover:scale-108 active:scale-95 transition-all shadow-md font-bold"
            style={{
              backgroundColor: accentColor,
              boxShadow: `0 0 16px ${glowColor}66`,
            }}
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
              className="absolute left-0 top-0 bottom-0 rounded-full transition-all duration-75 shadow-sm"
              style={{
                width: `${progressPercent}%`,
                backgroundColor: accentColor,
                boxShadow: `0 0 8px ${glowColor}80`,
              }}
            />
            {/* Scrubber thumb */}
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
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
            className="bg-neutral-800 text-xs text-neutral-200 border border-neutral-700 rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer hover:bg-neutral-750 transition-colors"
          >
            {presetTracks.map((t) => (
              <option key={t.uri} value={t.title}>
                {t.title} - {t.artist}
              </option>
            ))}
          </select>
        </div>

        {/* Audio Volume Controls (Web Simulator) */}
        {onToggleMute && (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-neutral-900 border border-neutral-700/80 rounded-lg">
            <button
              onClick={onToggleMute}
              className="text-neutral-400 hover:text-white p-1 rounded transition-colors"
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isMuted ? (
                <VolumeX className="w-3.5 h-3.5 text-red-400" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-neutral-300 hover:text-white" />
              )}
            </button>
            {onVolumeChange && (
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                className="w-14 h-1 accent-red-500 bg-neutral-700 rounded-lg cursor-pointer"
                title="Simulator Volume"
              />
            )}
          </div>
        )}

        {/* Live Search LRCLIB */}
        <button
          onClick={onOpenSearch}
          className="px-3 py-1.5 text-neutral-200 hover:text-white bg-neutral-800 hover:bg-neutral-750 border border-neutral-700 rounded-lg flex items-center gap-1.5 text-xs font-medium transition-colors"
          title="Search any song on LRCLIB"
        >
          <Search className="w-3.5 h-3.5" style={{ color: accentColor }} />
          <span className="hidden sm:inline">Search Songs</span>
        </button>

        {/* Spicetify Install / Guide Button */}
        <button
          onClick={onOpenExport}
          className="px-3 py-1.5 text-black rounded-lg flex items-center gap-1.5 text-xs font-bold transition-all shadow-md hover:scale-105 active:scale-95"
          style={{
            backgroundColor: accentColor,
            boxShadow: `0 0 14px ${glowColor}50`,
          }}
          title="Install in Spotify / Spicetify"
        >
          <Terminal className="w-3.5 h-3.5 text-black" />
          <span>How to Use</span>
        </button>
      </div>
    </footer>
  );
};
