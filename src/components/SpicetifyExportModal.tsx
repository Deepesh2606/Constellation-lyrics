import React, { useState } from 'react';
import { X, Check, Copy, Terminal, FolderCheck, Sparkles, FileCode } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'manifest' | 'index' | 'guide'>('guide');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const cliCommands = `spicetify config custom_apps constellation\nspicetify apply`;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#121212] border border-neutral-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#d4ff3a]/15 text-[#d4ff3a] flex items-center justify-center border border-[#d4ff3a]/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">
                Spicetify Custom App: <span className="text-[#d4ff3a]">constellation</span>
              </h2>
              <p className="text-xs text-neutral-400">
                Official CustomApp structure ready in <code className="text-neutral-200">CustomApps/constellation/</code>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b border-neutral-800 px-6 bg-neutral-950/40">
          <button
            onClick={() => setActiveTab('guide')}
            className={`py-3 px-4 text-xs font-medium border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'guide'
                ? 'border-[#d4ff3a] text-[#d4ff3a]'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <FolderCheck className="w-4 h-4" />
            Installation & Setup
          </button>
          <button
            onClick={() => setActiveTab('manifest')}
            className={`py-3 px-4 text-xs font-medium border-b-2 transition-all flex items-center gap-2 ${
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
            className={`py-3 px-4 text-xs font-medium border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'index'
                ? 'border-[#d4ff3a] text-[#d4ff3a]'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Terminal className="w-4 h-4" />
            index.js
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'guide' && (
            <div className="space-y-5 text-sm">
              <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#d4ff3a] text-black text-xs flex items-center justify-center font-bold">
                    1
                  </span>
                  App Folder Location
                </h3>
                <p className="text-neutral-300 text-xs leading-relaxed">
                  The app files are stored right in your project repository under{' '}
                  <code className="text-[#d4ff3a] bg-black/40 px-1.5 py-0.5 rounded">
                    CustomApps/constellation/
                  </code>
                  . Copy or symlink this folder to your Spicetify CustomApps directory:
                </p>

                <div className="space-y-2 text-xs">
                  <div className="bg-neutral-950 p-2.5 rounded border border-neutral-800/80 font-mono text-neutral-300">
                    <span className="text-neutral-500 font-sans block mb-1">Windows:</span>
                    %appdata%\spicetify\CustomApps\constellation\
                  </div>
                  <div className="bg-neutral-950 p-2.5 rounded border border-neutral-800/80 font-mono text-neutral-300">
                    <span className="text-neutral-500 font-sans block mb-1">macOS / Linux:</span>
                    ~/.config/spicetify/CustomApps/constellation/
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#d4ff3a] text-black text-xs flex items-center justify-center font-bold">
                      2
                    </span>
                    Activate in Spicetify CLI
                  </h3>
                  <button
                    onClick={() => copyToClipboard(cliCommands, 'cli')}
                    className="flex items-center gap-1.5 text-xs text-[#d4ff3a] hover:underline"
                  >
                    {copiedKey === 'cli' ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    {copiedKey === 'cli' ? 'Copied' : 'Copy Commands'}
                  </button>
                </div>
                <div className="bg-neutral-950 p-3 rounded-lg border border-neutral-800 font-mono text-xs text-[#d4ff3a] space-y-1">
                  <div>spicetify config custom_apps constellation</div>
                  <div>spicetify apply</div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-neutral-900/50 border border-neutral-800/60 text-xs text-neutral-400 space-y-2">
                <div className="font-semibold text-neutral-200">How Constellation Works in Spotify:</div>
                <ul className="list-disc list-inside space-y-1 text-neutral-400">
                  <li>Detects active song name and artist automatically via <code className="text-neutral-300">Spicetify.Player.data</code></li>
                  <li>Re-queries LRCLIB for synced lyrics on each <code className="text-neutral-300">songchange</code> event</li>
                  <li>Caches fetched lyrics in-memory per track URI so skips are instantaneous</li>
                  <li>Synchronizes word-by-word animation to Spotify&apos;s audio progress at 60 FPS</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'manifest' && (
            <div className="relative">
              <button
                onClick={() => copyToClipboard(manifestContent, 'manifest')}
                className="absolute top-3 right-3 px-2.5 py-1.5 bg-neutral-800 text-xs text-neutral-300 rounded border border-neutral-700 flex items-center gap-1 hover:text-white"
              >
                {copiedKey === 'manifest' ? <Check className="w-3.5 h-3.5 text-[#d4ff3a]" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedKey === 'manifest' ? 'Copied' : 'Copy'}
              </button>
              <pre className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 text-xs font-mono text-[#d4ff3a] overflow-x-auto max-h-[500px]">
                {manifestContent}
              </pre>
            </div>
          )}

          {activeTab === 'index' && (
            <div className="relative">
              <button
                onClick={() => copyToClipboard(indexContent, 'index')}
                className="absolute top-3 right-3 px-2.5 py-1.5 bg-neutral-800 text-xs text-neutral-300 rounded border border-neutral-700 flex items-center gap-1 hover:text-white"
              >
                {copiedKey === 'index' ? <Check className="w-3.5 h-3.5 text-[#d4ff3a]" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedKey === 'index' ? 'Copied' : 'Copy'}
              </button>
              <pre className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 text-xs font-mono text-neutral-300 overflow-x-auto max-h-[500px]">
                {indexContent}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
