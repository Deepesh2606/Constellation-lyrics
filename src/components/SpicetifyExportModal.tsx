import React, { useState } from 'react';
import {
  X,
  Check,
  Copy,
  Terminal,
  FolderCheck,
  Sparkles,
  FileCode,
  Download,
  ExternalLink,
  HelpCircle,
  PlayCircle,
} from 'lucide-react';

interface SpicetifyExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  manifestContent: string;
  indexContent: string;
}

export const SpicetifyExportModal: React.FC<SpicetifyExportModalProps> = ({
  isOpen,
  onClose,
  manifestContent,
  indexContent,
}) => {
  const [activeTab, setActiveTab] = useState<'guide' | 'manifest' | 'index'>('guide');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const cliCommands = `spicetify config custom_apps constellation\nspicetify apply`;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#121212] border border-neutral-700/80 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#d4ff3a]/20 text-[#d4ff3a] flex items-center justify-center border border-[#d4ff3a]/40 shadow-[0_0_12px_rgba(212,255,58,0.3)]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">How to Use & Install Constellation</h2>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#d4ff3a]/20 text-[#d4ff3a] font-semibold border border-[#d4ff3a]/30">
                  Spicetify Custom App
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Run it in your web browser simulator OR install directly inside your desktop Spotify app
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab navigation & Quick Download Actions */}
        <div className="flex items-center justify-between border-b border-neutral-800 px-6 bg-neutral-950/60 flex-wrap gap-2 py-1">
          <div className="flex">
            <button
              onClick={() => setActiveTab('guide')}
              className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'guide'
                  ? 'border-[#d4ff3a] text-[#d4ff3a]'
                  : 'border-transparent text-neutral-400 hover:text-white'
              }`}
            >
              <FolderCheck className="w-4 h-4" />
              Installation Guide
            </button>
            <button
              onClick={() => setActiveTab('manifest')}
              className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'manifest'
                  ? 'border-[#d4ff3a] text-[#d4ff3a]'
                  : 'border-transparent text-neutral-400 hover:text-white'
              }`}
            >
              <FileCode className="w-4 h-4" />
              manifest.json
            </button>
            <button
              onClick={() => setActiveTab('index')}
              className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'index'
                  ? 'border-[#d4ff3a] text-[#d4ff3a]'
                  : 'border-transparent text-neutral-400 hover:text-white'
              }`}
            >
              <Terminal className="w-4 h-4" />
              index.js
            </button>
          </div>

          {/* Direct File Download Buttons */}
          <div className="flex items-center gap-2 py-2">
            <button
              onClick={() => downloadFile(manifestContent, 'manifest.json', 'application/json')}
              className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs rounded-lg border border-neutral-700 flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-[#d4ff3a]" />
              manifest.json
            </button>
            <button
              onClick={() => downloadFile(indexContent, 'index.js', 'application/javascript')}
              className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs rounded-lg border border-neutral-700 flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-[#d4ff3a]" />
              index.js
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {activeTab === 'guide' && (
            <div className="space-y-5 text-sm">
              {/* Option A: Use it here in browser */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-neutral-900 to-neutral-900/90 border border-[#d4ff3a]/30 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white flex items-center gap-2">
                    <PlayCircle className="w-5 h-5 text-[#d4ff3a]" />
                    Option 1: Test & Use Right Here in the Web Preview
                  </h3>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                    Ready Now
                  </span>
                </div>
                <p className="text-neutral-300 text-xs leading-relaxed">
                  You don&apos;t need Spotify installed to experience Constellation! Use the controls on your screen:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs text-neutral-300">
                  <div className="bg-black/40 p-2.5 rounded-lg border border-neutral-800">
                    <strong className="text-[#d4ff3a] block mb-1">▶ Play & Pause</strong>
                    Press the Play button at the bottom or the floating player to start the starry lyrics.
                  </div>
                  <div className="bg-black/40 p-2.5 rounded-lg border border-neutral-800">
                    <strong className="text-[#d4ff3a] block mb-1">🎵 Switch Tracks</strong>
                    Pick from Queen, The Weeknd, Coldplay, or click <strong>Search Songs</strong> for any artist.
                  </div>
                  <div className="bg-black/40 p-2.5 rounded-lg border border-neutral-800">
                    <strong className="text-[#d4ff3a] block mb-1">✨ Click Any Star</strong>
                    Click any star node in the constellation to immediately seek to that lyric!
                  </div>
                </div>
              </div>

              {/* Option B: Install into Desktop Spotify */}
              <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#d4ff3a] text-black text-xs flex items-center justify-center font-bold">
                      2
                    </span>
                    Option 2: Install into Desktop Spotify via Spicetify CLI
                  </h3>
                </div>

                {/* Step 1 */}
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-neutral-200">
                    Step 1: Put the app folder in your Spicetify <code className="text-[#d4ff3a]">CustomApps</code> directory
                  </div>
                  <p className="text-xs text-neutral-400">
                    Create a folder named <code className="text-white bg-black/50 px-1.5 py-0.5 rounded">constellation</code> in your Spicetify CustomApps folder, and put <code className="text-[#d4ff3a]">manifest.json</code> and <code className="text-[#d4ff3a]">index.js</code> inside it:
                  </p>

                  <div className="space-y-1.5 text-xs">
                    <div className="bg-neutral-950 p-2.5 rounded-lg border border-neutral-800 font-mono text-neutral-300 flex items-center justify-between">
                      <div>
                        <span className="text-neutral-500 font-sans text-[11px] block">Windows (File Explorer):</span>
                        %appdata%\spicetify\CustomApps\constellation\
                      </div>
                      <button
                        onClick={() => copyToClipboard('%appdata%\\spicetify\\CustomApps\\constellation\\', 'path-win')}
                        className="text-neutral-400 hover:text-white p-1"
                        title="Copy Path"
                      >
                        {copiedKey === 'path-win' ? <Check className="w-3.5 h-3.5 text-[#d4ff3a]" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <div className="bg-neutral-950 p-2.5 rounded-lg border border-neutral-800 font-mono text-neutral-300 flex items-center justify-between">
                      <div>
                        <span className="text-neutral-500 font-sans text-[11px] block">macOS / Linux:</span>
                        ~/.config/spicetify/CustomApps/constellation/
                      </div>
                      <button
                        onClick={() => copyToClipboard('~/.config/spicetify/CustomApps/constellation/', 'path-nix')}
                        className="text-neutral-400 hover:text-white p-1"
                        title="Copy Path"
                      >
                        {copiedKey === 'path-nix' ? <Check className="w-3.5 h-3.5 text-[#d4ff3a]" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="space-y-2 pt-2 border-t border-neutral-800">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-semibold text-neutral-200">
                      Step 2: Enable and Apply in Terminal
                    </div>
                    <button
                      onClick={() => copyToClipboard(cliCommands, 'cli')}
                      className="flex items-center gap-1.5 text-xs text-[#d4ff3a] hover:underline"
                    >
                      {copiedKey === 'cli' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedKey === 'cli' ? 'Copied Commands' : 'Copy Commands'}
                    </button>
                  </div>
                  <div className="bg-neutral-950 p-3 rounded-lg border border-neutral-800 font-mono text-xs text-[#d4ff3a] space-y-1">
                    <div>spicetify config custom_apps constellation</div>
                    <div>spicetify apply</div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="space-y-1 pt-2 border-t border-neutral-800">
                  <div className="text-xs font-semibold text-neutral-200">
                    Step 3: Open Spotify
                  </div>
                  <p className="text-xs text-neutral-400">
                    You will see <strong>Constellation</strong> with its custom star icon in Spotify&apos;s left sidebar! Click it while playing any song to see the synced lyrics constellation.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'manifest' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-400 font-mono">CustomApps/constellation/manifest.json</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => downloadFile(manifestContent, 'manifest.json', 'application/json')}
                    className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-300 rounded border border-neutral-700 flex items-center gap-1"
                  >
                    <Download className="w-3 h-3 text-[#d4ff3a]" /> Download
                  </button>
                  <button
                    onClick={() => copyToClipboard(manifestContent, 'manifest')}
                    className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-300 rounded border border-neutral-700 flex items-center gap-1"
                  >
                    {copiedKey === 'manifest' ? <Check className="w-3 h-3 text-[#d4ff3a]" /> : <Copy className="w-3 h-3" />}
                    {copiedKey === 'manifest' ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
              <pre className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 text-xs font-mono text-[#d4ff3a] overflow-x-auto max-h-[500px]">
                {manifestContent}
              </pre>
            </div>
          )}

          {activeTab === 'index' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-400 font-mono">CustomApps/constellation/index.js</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => downloadFile(indexContent, 'index.js', 'application/javascript')}
                    className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-300 rounded border border-neutral-700 flex items-center gap-1"
                  >
                    <Download className="w-3 h-3 text-[#d4ff3a]" /> Download
                  </button>
                  <button
                    onClick={() => copyToClipboard(indexContent, 'index')}
                    className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-300 rounded border border-neutral-700 flex items-center gap-1"
                  >
                    {copiedKey === 'index' ? <Check className="w-3 h-3 text-[#d4ff3a]" /> : <Copy className="w-3 h-3" />}
                    {copiedKey === 'index' ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
              <pre className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 text-xs font-mono text-neutral-300 overflow-x-auto max-h-[500px]">
                {indexContent}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-neutral-800 bg-neutral-950/80 flex items-center justify-between">
          <span className="text-xs text-neutral-500">
            LRCLIB Synced Lyrics • Dark #0a0a0a • Lime #d4ff3a
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#d4ff3a] text-black font-semibold text-xs rounded-lg hover:bg-[#c2ed2c] transition-colors"
          >
            Got it, Let&apos;s Play
          </button>
        </div>
      </div>
    </div>
  );
};
