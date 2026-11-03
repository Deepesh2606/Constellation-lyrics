import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Play,
  Pause,
  Upload,
  Copy,
  Check,
  ExternalLink,
  ChevronDown,
  Monitor,
  Maximize2,
  Sliders,
  Type,
  Music2,
  Compass,
  Zap,
  Globe2,
  ShieldCheck,
  Video,
  Eye,
  Github
} from 'lucide-react';
import { ConstellationCanvas } from './ConstellationCanvas';
import { PRESET_TRACKS } from '../utils/lrclib';
import { parseLrc } from '../utils/lrcParser';
import { DEFAULT_SETTINGS, ConstellationSettings } from '../types';

interface ShowcaseLandingPageProps {
  onOpenSimulator?: () => void;
}

export function ShowcaseLandingPage({ onOpenSimulator }: ShowcaseLandingPageProps) {
  const [videoSrc, setVideoSrc] = useState<string>('/demo.mp4');
  const [videoLoaded, setVideoLoaded] = useState<boolean>(true);
  const [isPlayingVideo, setIsPlayingVideo] = useState<boolean>(true);
  const [activeScreenTab, setActiveScreenTab] = useState<'video' | 'live'>('video');
  const [copiedStep, setCopiedStep] = useState<number | null>(null);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [activeOs, setActiveOs] = useState<'mac' | 'win'>('mac');

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fallback demo state for live canvas inside mockup
  const [demoTimeMs, setDemoTimeMs] = useState(12000);
  const [isLivePlaying, setIsLivePlaying] = useState(true);
  const sampleTrack = PRESET_TRACKS[0];
  const sampleParsedLines = parseLrc(sampleTrack.presetLrc || '');

  // Check if default video exists
  useEffect(() => {
    fetch('/demo.mp4', { method: 'HEAD' })
      .then((res) => {
        if (res.ok) {
          setVideoLoaded(true);
        }
      })
      .catch(() => {});
  }, []);

  // Handle local video drop / upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoSrc(url);
      setVideoLoaded(true);
      setActiveScreenTab('video');
      setIsPlayingVideo(true);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && (file.type.startsWith('video/') || file.name.endsWith('.mp4') || file.name.endsWith('.mov') || file.name.endsWith('.webm'))) {
      const url = URL.createObjectURL(file);
      setVideoSrc(url);
      setVideoLoaded(true);
      setActiveScreenTab('video');
      setIsPlayingVideo(true);
    }
  };

  const toggleVideoPlayback = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlayingVideo(true);
    } else {
      videoRef.current.pause();
      setIsPlayingVideo(false);
    }
  };

  const copyToClipboard = (text: string, stepIndex: number) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(stepIndex);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  // Live timer tick for embedded canvas
  useEffect(() => {
    if (activeScreenTab !== 'live' || !isLivePlaying) return;
    const interval = setInterval(() => {
      setDemoTimeMs((prev) => (prev > 45000 ? 12000 : prev + 250));
    }, 250);
    return () => clearInterval(interval);
  }, [activeScreenTab, isLivePlaying]);

  const installStepsMac = [
    {
      title: 'Install Spicetify',
      desc: 'If not already installed, install the lightweight Spicetify CLI:',
      cmd: 'curl -fsSL https://spicetify.app/install.sh | sh'
    },
    {
      title: 'Clone Constellation Repository',
      desc: 'Download the Constellation custom application code:',
      cmd: 'git clone https://github.com/Deepesh2606/Constellation-lyrics.git'
    },
    {
      title: 'Link to Spicetify CustomApps',
      desc: 'Create a direct symbolic link to your Spicetify CustomApps folder:',
      cmd: 'mkdir -p "$(dirname "$(spicetify -c)")/CustomApps" && ln -sf "$(pwd)/Constellation-lyrics/CustomApps/constellation" "$(dirname "$(spicetify -c)")/CustomApps/constellation"'
    },
    {
      title: 'Enable & Apply to Spotify',
      desc: 'Register the custom app and inject it into your Spotify client:',
      cmd: 'spicetify config custom_apps constellation && spicetify apply'
    },
    {
      title: 'Launch in Spotify',
      desc: 'Open Spotify and click Constellation in your left library sidebar!'
    }
  ];

  const installStepsWin = [
    {
      title: 'Install Spicetify (PowerShell)',
      desc: 'Open PowerShell as Administrator and run the official installer:',
      cmd: 'iwr -useb https://raw.githubusercontent.com/spicetify/cli/main/install.ps1 | iex'
    },
    {
      title: 'Clone Constellation Repository',
      desc: 'Clone the repository to your local drive:',
      cmd: 'git clone https://github.com/Deepesh2606/Constellation-lyrics.git'
    },
    {
      title: 'Link to CustomApps (PowerShell)',
      desc: 'Create a symbolic link in your Spicetify CustomApps directory:',
      cmd: '$dir = Split-Path (spicetify -c); New-Item -ItemType SymbolicLink -Path "$dir\\CustomApps\\constellation" -Target "$((Get-Item .).FullName)\\Constellation-lyrics\\CustomApps\\constellation" -Force'
    },
    {
      title: 'Enable & Apply to Spotify',
      desc: 'Register and inject into Spotify:',
      cmd: 'spicetify config custom_apps constellation; spicetify apply'
    },
    {
      title: 'Launch in Spotify',
      desc: 'Restart Spotify and click Constellation in the left navigation sidebar!'
    }
  ];

  const faqs = [
    {
      q: 'How do I add my own screen recording to this showcase site?',
      a: 'Simply record your screen in Spotify (using Cmd+Shift+5 on Mac or OBS), rename your video to "demo.mp4", and place it inside the "public/" folder of this project. You can also drag and drop any .mp4 file directly onto the laptop screen above to preview it immediately!'
    },
    {
      q: 'Does Constellation support Hindi, Bollywood, and International songs?',
      a: 'Yes! Constellation uses a multi-tiered fallback architecture (Spotify Official Native -> Netease Cloud -> LRCLIB with primary-artist smart matching -> Kugou). Non-Latin Unicode scripts (including Devanagari matras, CJK, and Cyrillic) are preserved without character stripping.'
    },
    {
      q: 'How does the Live Preview Eye button work in Settings?',
      a: 'Just like in Spicy Lyrics, clicking the Eye (👁) button in the top-right corner of Constellation Settings makes the settings window fade out into a floating preview pill. This lets you observe your playing lyrics and theme adjustments in real-time, and you can tap anywhere to restore the menu.'
    },
    {
      q: 'What is the popped stream-end effect?',
      a: 'When any lyric line ends, its terminal word triggers an elastic spring pop animation (expanding to 8.5px with an accentuated halo ring). Even as the song advances, the terminal words remain subtle celestial anchors so you can visually read where phrases started and finished.'
    },
    {
      q: 'How do I eliminate Bluetooth speaker audio delay?',
      a: 'Open Constellation Settings (⚙) and head to the "Playback" tab. Use the real-time Audio Sync slider with dedicated -50ms and +50ms nudge buttons to calibrate early vocal attack and align your speakers with exact millisecond precision.'
    }
  ];

  const currentSteps = activeOs === 'mac' ? installStepsMac : installStepsWin;

  return (
    <div className="min-h-screen bg-[#07080b] text-[#f0f2f5] font-sans antialiased selection:bg-red-500/30 selection:text-white relative overflow-x-hidden">
      {/* Background Starlight & Ambient Aura Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-[radial-gradient(ellipse_at_center,rgba(239,68,68,0.12)_0%,rgba(244,63,94,0.06)_40%,transparent_75%)] blur-[90px]" />
        <div className="absolute top-[40%] right-[-10%] w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(225,29,72,0.06)_0%,transparent_70%)] blur-[100px]" />
        <div className="absolute top-[70%] left-[-10%] w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(239,68,68,0.06)_0%,transparent_70%)] blur-[110px]" />
      </div>

      {/* Floating Glass Navigation Header */}
      <header className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-5xl">
        <nav className="backdrop-blur-xl bg-[#0f1118]/75 border border-white/[0.08] rounded-full px-5 py-3 shadow-[0_16px_40px_rgba(0,0,0,0.6)] flex items-center justify-between transition-all">
          <a href="#" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-full bg-red-500/15 border border-red-500/40 flex items-center justify-center text-red-500 shadow-[0_0_14px_rgba(239,68,68,0.4)] group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4 fill-current" />
            </div>
            <span className="font-bold text-sm tracking-tight text-white group-hover:text-red-400 transition-colors">
              Constellation
            </span>
          </a>

          <div className="hidden md:flex items-center gap-7 text-xs font-medium text-white/60">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#demo" className="hover:text-white transition-colors">Watch Demo</a>
            <a href="#install" className="hover:text-white transition-colors">Install</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>

          <div className="flex items-center gap-3">
            {onOpenSimulator && (
              <button
                onClick={onOpenSimulator}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white/80 hover:text-white bg-white/[0.08] border border-white/[0.12] hover:bg-white/[0.16] transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-red-400" />
                <span>Web Simulator</span>
              </button>
            )}
            <a
              href="https://github.com/Deepesh2606/Constellation-lyrics"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white/70 hover:text-white bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.1] transition-all"
            >
              <Github className="w-3.5 h-3.5" />
              <span>GitHub</span>
            </a>
            <a
              href="#install"
              className="px-4 py-1.5 rounded-full text-xs font-bold text-white bg-red-600 hover:bg-red-500 shadow-[0_0_18px_rgba(239,68,68,0.45)] hover:shadow-[0_0_24px_rgba(239,68,68,0.65)] transition-all flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 fill-white" />
              <span>Get for Spotify</span>
            </a>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 pt-36 pb-24 px-4 sm:px-6 max-w-6xl mx-auto flex flex-col items-center text-center">
        {/* Eyebrow Badge Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.09] text-[11.5px] font-medium text-white/80 shadow-[0_4px_16px_rgba(0,0,0,0.4)] mb-8 animate-fade-in backdrop-blur-md">
          <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          <span>Constellation 2.4 for Spicetify</span>
          <span className="text-white/30">|</span>
          <span className="text-red-400 font-semibold">Synced Starlight Lyrics</span>
        </div>

        {/* Primary Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white max-w-4xl leading-[1.08] mb-6">
          Lyrics written <br />
          <span className="bg-gradient-to-r from-white via-rose-100 to-red-500 bg-clip-text text-transparent">
            in the stars.
          </span>
        </h1>

        {/* Subhead Description */}
        <p className="text-base sm:text-lg md:text-xl text-white/55 max-w-2xl leading-relaxed mb-10 font-normal">
          Real-time word-by-word synced starlight constellation lyrics, dynamic kinetic posters, and deep album artwork aura for Spotify.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
          <a
            href="#install"
            className="px-6 py-3 rounded-full text-sm font-bold text-white bg-red-600 hover:bg-red-500 shadow-[0_0_25px_rgba(239,68,68,0.5)] hover:shadow-[0_0_35px_rgba(239,68,68,0.7)] transition-all flex items-center gap-2 group"
          >
            <span>Install in 5 Minutes</span>
            <ExternalLink className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
          {onOpenSimulator && (
            <button
              onClick={onOpenSimulator}
              className="px-6 py-3 rounded-full text-sm font-semibold text-white bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.12] transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-red-400" />
              <span>Launch Web Simulator</span>
            </button>
          )}
          <a
            href="https://github.com/Deepesh2606/Constellation-lyrics"
            target="_blank"
            rel="noreferrer"
            className="px-6 py-3 rounded-full text-sm font-semibold text-white/80 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-all flex items-center gap-2"
          >
            <Github className="w-4 h-4" />
            <span>Star on GitHub</span>
          </a>
        </div>

        {/* MacBook Pro Showcase Frame with Video / Live Demo */}
        <div id="demo" className="w-full max-w-5xl mt-4 mb-28">
          {/* Mockup Mode Selector Switcher */}
          <div className="flex items-center justify-center gap-2 mb-5">
            <button
              onClick={() => setActiveScreenTab('video')}
              className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 transition-all ${
                activeScreenTab === 'video'
                  ? 'bg-white text-black shadow-lg shadow-white/10'
                  : 'bg-white/[0.05] text-white/60 hover:text-white border border-white/[0.08]'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Screen Recording Video</span>
            </button>
            <button
              onClick={() => setActiveScreenTab('live')}
              className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 transition-all ${
                activeScreenTab === 'live'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                  : 'bg-white/[0.05] text-white/60 hover:text-white border border-white/[0.08]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Interactive Live Canvas</span>
            </button>
          </div>

          {/* MacBook Outer Frame Chassis */}
          <div className="relative mx-auto rounded-[28px] p-3 sm:p-4 bg-gradient-to-b from-[#2a2d36] via-[#16181f] to-[#0c0d12] border border-white/[0.14] shadow-[0_30px_90px_rgba(0,0,0,0.85),0_0_100px_rgba(239,68,68,0.15)]">
            {/* Ambient Lighting Rim Glow */}
            <div className="absolute -inset-1 rounded-[30px] bg-gradient-to-r from-red-600/30 via-rose-500/10 to-red-600/30 -z-10 blur-xl opacity-75 pointer-events-none" />

            {/* Laptop Screen Display */}
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="relative rounded-[18px] overflow-hidden bg-[#0a0b0e] border border-black/40 aspect-[16/10] flex items-center justify-center group"
            >
              {/* Web Notch Header */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-4 bg-[#14161d] rounded-b-xl z-30 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-[#050608] border border-white/20" />
              </div>

              {/* TAB A: Video Player */}
              {activeScreenTab === 'video' && (
                <>
                  {videoLoaded ? (
                    <div className="relative w-full h-full cursor-pointer" onClick={toggleVideoPlayback}>
                      <video
                        ref={videoRef}
                        src={videoSrc}
                        autoPlay
                        loop
                        muted
                        playsInline
                        onLoadedData={() => setVideoLoaded(true)}
                        onError={() => setVideoLoaded(false)}
                        className="w-full h-full object-cover"
                      />
                      {/* Play / Pause Float Pill Overlay */}
                      <div className="absolute bottom-5 right-5 z-20 backdrop-blur-md bg-black/60 border border-white/10 rounded-full px-3.5 py-1.5 flex items-center gap-2 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        {isPlayingVideo ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-white" />}
                        <span>{isPlayingVideo ? 'Click to Pause' : 'Click to Play'}</span>
                      </div>
                    </div>
                  ) : (
                    // Video Dropzone & Upload Guide
                    <div className="flex flex-col items-center justify-center p-8 text-center max-w-md">
                      <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-red-400 mb-4 shadow-[0_0_20px_rgba(239,68,68,0.25)]">
                        <Upload className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2">Display Your Screen Recording</h3>
                      <p className="text-xs text-white/50 leading-relaxed mb-6">
                        Record Spotify playing Constellation (<code className="text-white/80">Cmd + Shift + 5</code>), then drop your video file here or save it to <code className="text-red-400">public/demo.mp4</code>.
                      </p>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="px-4 py-2 rounded-full bg-white text-black font-semibold text-xs hover:bg-white/90 transition-all flex items-center gap-2"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Select Video File</span>
                        </button>
                        <button
                          onClick={() => setActiveScreenTab('live')}
                          className="px-4 py-2 rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-white font-medium text-xs border border-white/10 transition-all"
                        >
                          View Interactive Canvas
                        </button>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="video/mp4,video/webm,video/quicktime"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </div>
                  )}
                </>
              )}

              {/* TAB B: Interactive Live Canvas Fallback */}
              {activeScreenTab === 'live' && (
                <div className="w-full h-full relative">
                  <ConstellationCanvas
                    parsedLines={sampleParsedLines}
                    currentTimeMs={demoTimeMs}
                    durationMs={210000}
                    isPlaying={isLivePlaying}
                    trackTitle={sampleTrack.title}
                    trackArtist={sampleTrack.artist}
                    isLoadingLyrics={false}
                    errorLyrics={null}
                    settings={{
                      ...DEFAULT_SETTINGS,
                      primaryColor: '#ef4444',
                      glowColor: '#ff3355'
                    }}
                    onWordClick={(ms) => setDemoTimeMs(ms)}
                    onTogglePlay={() => setIsLivePlaying(!isLivePlaying)}
                  />
                  <div className="absolute top-4 right-4 z-20 backdrop-blur-md bg-black/50 border border-white/10 rounded-full px-3 py-1 text-[11px] font-semibold text-red-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span>Interactive Canvas (Click words to seek)</span>
                  </div>
                </div>
              )}
            </div>

            {/* Laptop Base Lip / Notch Groove */}
            <div className="h-2 w-32 bg-[#1b1e26] rounded-b-lg mx-auto border-x border-b border-white/10 mt-1" />
          </div>
        </div>

        {/* Bento Grid Feature Highlights (trylumn.xyz style) */}
        <div id="features" className="w-full max-w-5xl text-left mb-28">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-red-500 mb-2">Designed for Immersion</p>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Every detail tuned for music.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Feature 1: Celestial Paths */}
            <div className="md:col-span-2 rounded-[24px] p-8 bg-gradient-to-b from-[#13151d] to-[#0c0d12] border border-white/[0.08] relative overflow-hidden group hover:border-red-500/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mb-6">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Orbital Starlight & Popped Phrase Anchors</h3>
              <p className="text-sm text-white/55 leading-relaxed max-w-md">
                Words are laid out as living constellations. Active words guide the camera smoothly, and each completed stream expands with an elastic spring pop and glowing halo to anchor the structure.
              </p>
              <div className="mt-8 pt-6 border-t border-white/[0.06] flex items-center gap-3 text-xs font-semibold text-white/70">
                <span className="px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08]">✛ Reticle Marker</span>
                <span className="px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08]">◎ Stellar Beacon</span>
                <span className="px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08]">○ Orbit Halo</span>
              </div>
            </div>

            {/* Feature 2: Kinetic Poster Mode */}
            <div className="rounded-[24px] p-8 bg-gradient-to-b from-[#13151d] to-[#0c0d12] border border-white/[0.08] relative overflow-hidden group hover:border-purple-500/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-6">
                <Type className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Kinetic Typography</h3>
              <p className="text-sm text-white/55 leading-relaxed">
                Transform lyrics into editorial typographic posters featuring 3D perspective warp, Y2K chrome, and retro CRT scanlines.
              </p>
            </div>

            {/* Feature 3: Universal Sync Engine */}
            <div className="rounded-[24px] p-8 bg-gradient-to-b from-[#13151d] to-[#0c0d12] border border-white/[0.08] relative overflow-hidden group hover:border-blue-500/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-6">
                <Globe2 className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Universal Lyrics Sync</h3>
              <p className="text-sm text-white/55 leading-relaxed">
                Spotify Native + Netease + LRCLIB + Kugou fallback. Preserves all Devanagari/Hindi matras, CJK, and Arabic scripts without rate-limiting errors.
              </p>
            </div>

            {/* Feature 4: 2-Column Spicy Lyrics Studio */}
            <div className="md:col-span-2 rounded-[24px] p-8 bg-gradient-to-b from-[#13151d] to-[#0c0d12] border border-white/[0.08] relative overflow-hidden group hover:border-emerald-500/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-6">
                <Sliders className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Spicy Lyrics-Style 2-Column Studio</h3>
              <p className="text-sm text-white/55 leading-relaxed max-w-md">
                Refined settings panel with instant search, iOS switches, and an Eye preview button (<Eye className="w-3.5 h-3.5 inline text-white" />) that temporarily hides the modal to preview playing lyrics in real time.
              </p>
            </div>
          </div>
        </div>

        {/* 5-Step Installation Guide (Matching trylumn.xyz) */}
        <div id="install" className="w-full max-w-4xl text-left mb-28">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-red-500 mb-2">Five Minutes</p>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Install in five steps
            </h2>
            <p className="text-sm text-white/50 mt-3">No account or complicated build steps required.</p>
          </div>

          {/* OS Switcher Tabs */}
          <div className="flex justify-center mb-8">
            <div className="p-1 rounded-full bg-white/[0.05] border border-white/[0.08] flex gap-1">
              <button
                onClick={() => setActiveOs('mac')}
                className={`px-5 py-1.5 rounded-full text-xs font-bold transition-all ${
                  activeOs === 'mac' ? 'bg-white text-black' : 'text-white/60 hover:text-white'
                }`}
              >
                macOS / Linux
              </button>
              <button
                onClick={() => setActiveOs('win')}
                className={`px-5 py-1.5 rounded-full text-xs font-bold transition-all ${
                  activeOs === 'win' ? 'bg-white text-black' : 'text-white/60 hover:text-white'
                }`}
              >
                Windows (PowerShell)
              </button>
            </div>
          </div>

          {/* Steps List Container */}
          <div className="space-y-4">
            {currentSteps.map((step, idx) => (
              <div
                key={idx}
                className="rounded-2xl p-6 bg-[#0f1118]/80 border border-white/[0.07] hover:border-white/[0.14] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-7 h-7 rounded-full bg-red-500/15 text-red-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white mb-1">{step.title}</h4>
                    <p className="text-xs text-white/50">{step.desc}</p>
                  </div>
                </div>

                {step.cmd && (
                  <div className="flex items-center gap-2 bg-black/60 border border-white/10 rounded-xl px-3.5 py-2 w-full md:w-auto overflow-x-auto justify-between">
                    <code className="text-xs text-red-300 font-mono whitespace-nowrap">{step.cmd}</code>
                    <button
                      onClick={() => copyToClipboard(step.cmd, idx)}
                      className="ml-3 p-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.16] text-white/80 hover:text-white transition-all shrink-0"
                      title="Copy command"
                    >
                      {copiedStep === idx ? <Check className="w-3.5 h-3.5 text-red-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* FAQs Section (Matching trylumn.xyz "Good questions") */}
        <div id="faq" className="w-full max-w-3xl text-left mb-28">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-red-500 mb-2">FAQs</p>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Good questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-white/[0.08] bg-[#0e1017]/70 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between text-sm font-bold text-white hover:text-red-400 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-white/40 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs text-white/55 leading-relaxed border-t border-white/[0.04]">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Final CTA Panel */}
        <div className="w-full max-w-4xl rounded-[32px] p-10 sm:p-14 bg-gradient-to-b from-[#14161f] to-[#090a0e] border border-white/[0.12] text-center shadow-[0_20px_80px_rgba(0,0,0,0.8)] relative overflow-hidden mb-24">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-red-600/20 blur-3xl rounded-full pointer-events-none" />
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4 relative z-10">
            Ready to feel your music in the cosmos?
          </h2>
          <p className="text-sm text-white/55 max-w-md mx-auto mb-8 relative z-10">
            Install Constellation in Spotify today and experience your favorite songs in real-time starlight.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 relative z-10">
            <a
              href="#install"
              className="px-7 py-3.5 rounded-full text-sm font-bold text-white bg-red-600 hover:bg-red-500 shadow-[0_0_30px_rgba(239,68,68,0.5)] transition-all flex items-center gap-2"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>Get Constellation for Free</span>
            </a>
            <a
              href="https://github.com/Deepesh2606/Constellation-lyrics"
              target="_blank"
              rel="noreferrer"
              className="px-7 py-3.5 rounded-full text-sm font-semibold text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] transition-all"
            >
              View GitHub Repo
            </a>
          </div>
        </div>

        {/* Giant Outro Stylized Wordmark (Matching trylumn.xyz "Lumn" watermark) */}
        <div className="w-full text-center overflow-hidden select-none pointer-events-none opacity-20 hover:opacity-30 transition-opacity">
          <span className="text-[14vw] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white/40 to-transparent leading-none">
            CONSTELLATION
          </span>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.06] py-10 px-6 max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-white/40 gap-4">
        <p>© 2026 Constellation Synced Lyrics. Built for Spicetify & Spotify.</p>
        <div className="flex items-center gap-6">
          <a href="https://github.com/Deepesh2606/Constellation-lyrics" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
            GitHub
          </a>
          <a href="#install" className="hover:text-white transition-colors">
            Installation
          </a>
          <a href="#demo" className="hover:text-white transition-colors">
            Demo
          </a>
        </div>
      </footer>
    </div>
  );
}
