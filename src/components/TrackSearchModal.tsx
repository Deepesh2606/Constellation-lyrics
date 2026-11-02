import React, { useState } from 'react';
import { Search, Music, X, Sparkles, FileText, Check } from 'lucide-react';
import { searchLRCLIB } from '../utils/lrclib';
import { LRCLibSearchResult, TrackInfo } from '../types';

interface TrackSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectResult: (track: TrackInfo, lrc: string) => void;
  onCustomLrcSubmit: (title: string, artist: string, lrc: string) => void;
}

export const TrackSearchModal: React.FC<TrackSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectResult,
  onCustomLrcSubmit,
}) => {
  const [tab, setTab] = useState<'search' | 'custom'>('search');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LRCLibSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searched, setSearched] = useState(false);

  // Custom LRC state
  const [customTitle, setCustomTitle] = useState('Cosmic Melody');
  const [customArtist, setCustomArtist] = useState('Starlight Ensemble');
  const [customLrcText, setCustomLrcText] = useState(
    `[00:00.00] Drift through the silent starlight\n[00:04.50] Galaxies whisper into the dark\n[00:09.20] Glowing constellations ignite the night\n[00:14.00] In a lime green electric spark\n[00:19.50] Floating endless across the cosmic void\n[00:25.00] Where melody turns to stardust`
  );

  if (!isOpen) return null;

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setSearched(true);
    const res = await searchLRCLIB(query);
    setResults(res);
    setIsSearching(false);
  };

  const handlePickResult = (item: LRCLibSearchResult) => {
    if (!item.syncedLyrics) return;
    const track: TrackInfo = {
      title: item.trackName,
      artist: item.artistName,
      album: item.albumName,
      durationMs: item.duration * 1000,
      uri: `lrclib:${item.id}`,
    };
    onSelectResult(track, item.syncedLyrics);
    onClose();
  };

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customLrcText.trim()) return;
    onCustomLrcSubmit(customTitle, customArtist, customLrcText);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#121212] border border-neutral-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#d4ff3a]/15 text-[#d4ff3a] flex items-center justify-center border border-[#d4ff3a]/30">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Find Synced Lyrics</h2>
              <p className="text-xs text-neutral-400">Search millions of tracks on LRCLIB database</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selector */}
        <div className="flex border-b border-neutral-800 px-6 bg-neutral-950/40">
          <button
            onClick={() => setTab('search')}
            className={`py-3 px-4 text-xs font-medium border-b-2 transition-all flex items-center gap-2 ${
              tab === 'search'
                ? 'border-[#d4ff3a] text-[#d4ff3a]'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Search className="w-4 h-4" />
            LRCLIB Search
          </button>
          <button
            onClick={() => setTab('custom')}
            className={`py-3 px-4 text-xs font-medium border-b-2 transition-all flex items-center gap-2 ${
              tab === 'custom'
                ? 'border-[#d4ff3a] text-[#d4ff3a]'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            Custom LRC
          </button>
        </div>

        {/* Search tab content */}
        {tab === 'search' && (
          <div className="p-6 flex-1 flex flex-col overflow-hidden space-y-4">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. Arctic Monkeys 505 or Coldplay Yellow..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#d4ff3a] focus:ring-1 focus:ring-[#d4ff3a]"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                disabled={isSearching}
                className="px-5 py-2.5 bg-[#d4ff3a] text-black font-semibold text-xs rounded-xl hover:bg-[#c2ed2c] disabled:opacity-50 transition-colors shrink-0 flex items-center gap-2 shadow-[0_0_12px_rgba(212,255,58,0.2)]"
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </form>

            {/* Results list */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {results.length > 0 &&
                results.map((item) => {
                  const hasSynced = !!item.syncedLyrics;
                  return (
                    <div
                      key={item.id}
                      onClick={() => hasSynced && handlePickResult(item)}
                      className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                        hasSynced
                          ? 'bg-neutral-900/60 border-neutral-800 hover:border-[#d4ff3a]/50 hover:bg-neutral-900 cursor-pointer group'
                          : 'bg-neutral-900/20 border-neutral-800/40 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                            hasSynced
                              ? 'bg-[#d4ff3a]/10 text-[#d4ff3a] border border-[#d4ff3a]/30'
                              : 'bg-neutral-800 text-neutral-500'
                          }`}
                        >
                          <Music className="w-4 h-4" />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-sm font-medium text-white truncate group-hover:text-[#d4ff3a] transition-colors">
                            {item.trackName}
                          </p>
                          <p className="text-xs text-neutral-400 truncate">
                            {item.artistName} {item.albumName ? `• ${item.albumName}` : ''}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {hasSynced ? (
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#d4ff3a]/15 text-[#d4ff3a] border border-[#d4ff3a]/30">
                            Synced Lyrics Available
                          </span>
                        ) : (
                          <span className="text-[11px] text-neutral-500">Plain text only</span>
                        )}
                        <span className="text-xs font-mono text-neutral-500">
                          {Math.floor(item.duration / 60)}:
                          {(item.duration % 60).toString().padStart(2, '0')}
                        </span>
                      </div>
                    </div>
                  );
                })}

              {searched && !isSearching && results.length === 0 && (
                <div className="text-center py-10 text-neutral-400 text-sm">
                  No lyrics found for &quot;{query}&quot;. Try a different query.
                </div>
              )}

              {!searched && (
                <div className="text-center py-12 text-neutral-500 text-xs">
                  Enter an artist or track name above to search synced lyrics from LRCLIB.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Custom LRC tab content */}
        {tab === 'custom' && (
          <form onSubmit={handleApplyCustom} className="p-6 flex-1 flex flex-col space-y-3 overflow-y-auto">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">Track Title</label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#d4ff3a]"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">Artist</label>
                <input
                  type="text"
                  value={customArtist}
                  onChange={(e) => setCustomArtist(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#d4ff3a]"
                  required
                />
              </div>
            </div>

            <div className="flex-1 flex flex-col">
              <label className="block text-xs font-medium text-neutral-400 mb-1">
                LRC Lyrics (format: <code className="text-[#d4ff3a]">[mm:ss.xx] lyric line</code>)
              </label>
              <textarea
                value={customLrcText}
                onChange={(e) => setCustomLrcText(e.target.value)}
                rows={9}
                className="w-full flex-1 bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs font-mono text-neutral-300 focus:outline-none focus:border-[#d4ff3a] resize-none"
                placeholder="[00:00.00] First line of lyrics&#10;[00:04.50] Second line here"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#d4ff3a] text-black font-semibold text-xs rounded-xl hover:bg-[#c2ed2c] transition-colors flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(212,255,58,0.2)]"
            >
              <Sparkles className="w-4 h-4" />
              Render Custom Constellation
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
