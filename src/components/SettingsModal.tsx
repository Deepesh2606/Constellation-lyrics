import React, { useState } from 'react';
import {
  X,
  Palette,
  Type,
  Sparkles,
  RotateCcw,
  Check,
  Eye,
  Sliders,
  Sun,
  Layers,
  Compass,
} from 'lucide-react';
import {
  ConstellationSettings,
  THEME_PRESETS,
  FONT_FAMILY_MAP,
  DEFAULT_SETTINGS,
  ThemePresetId,
  FontFamilyId,
  FontWeight,
  TextTransform,
  GlowIntensity,
  BeaconStyle,
  StarDensity,
} from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ConstellationSettings;
  onUpdateSettings: (newSettings: ConstellationSettings) => void;
  onResetSettings: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onResetSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'colors' | 'font' | 'glow'>('colors');

  if (!isOpen) return null;

  const update = (partial: Partial<ConstellationSettings>) => {
    onUpdateSettings({ ...settings, ...partial });
  };

  const handleSelectTheme = (presetId: ThemePresetId) => {
    const preset = THEME_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    update({
      themeId: presetId,
      primaryColor: preset.primary,
      glowColor: preset.glow,
      bgColor: preset.bg,
      pastColor: preset.past,
      futureColor: preset.future,
    });
  };

  const currentFont = FONT_FAMILY_MAP[settings.fontFamily] || FONT_FAMILY_MAP.sans;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5"
      onClick={onClose}
    >
      <div
        className="bg-[#121212] border border-neutral-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-800/80 flex items-center justify-between bg-neutral-900/60">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center border shadow-md transition-colors"
              style={{
                backgroundColor: `${settings.primaryColor}1a`,
                color: settings.primaryColor,
                borderColor: `${settings.primaryColor}55`,
                boxShadow: `0 0 12px ${settings.glowColor}40`,
              }}
            >
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Constellation Visual Studio
              </h2>
              <p className="text-xs text-neutral-400">
                Customize colors, celestial fonts, sync indicators, and glow
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Preview Strip */}
        <div
          className="px-5 py-3 border-b border-neutral-800/80 flex items-center justify-between overflow-hidden transition-colors"
          style={{ backgroundColor: settings.bgColor }}
        >
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <Eye className="w-3.5 h-3.5 text-neutral-500" />
            <span className="font-mono text-[11px] uppercase tracking-wider text-neutral-400">Live Preview:</span>
          </div>

          <div
            className="flex items-center gap-3 px-4 py-1.5 rounded-lg border"
            style={{
              borderColor: `${settings.primaryColor}33`,
              backgroundColor: `${settings.primaryColor}0d`,
            }}
          >
            {/* Sung Word */}
            <span
              style={{
                color: settings.pastColor,
                fontFamily: currentFont.css,
                fontSize: `${settings.fontSize * 0.9}px`,
                textTransform: settings.textTransform,
                letterSpacing: `${settings.letterSpacing}em`,
              }}
            >
              Look
            </span>

            {/* Connecting dot / mini beacon */}
            <div className="relative flex items-center justify-center w-5 h-5">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{
                  backgroundColor: settings.primaryColor,
                  boxShadow: `0 0 ${
                    settings.glowIntensity === 'off'
                      ? '0'
                      : settings.glowIntensity === 'subtle'
                      ? '4px'
                      : settings.glowIntensity === 'supernova'
                      ? '12px'
                      : settings.glowIntensity === 'hyperdrive'
                      ? '18px'
                      : '8px'
                  } ${settings.glowColor}`,
                }}
              />
              {settings.beaconStyle === 'reticle' && (
                <div
                  className="absolute inset-0 rounded-full border animate-ping"
                  style={{ borderColor: settings.primaryColor, opacity: 0.5 }}
                />
              )}
            </div>

            {/* Active Word */}
            <span
              style={{
                color: '#ffffff',
                fontFamily: currentFont.css,
                fontSize: `${settings.fontSize * 1.25}px`,
                fontWeight: settings.fontWeight === 'black' ? 900 : settings.fontWeight === 'bold' ? 700 : settings.fontWeight === 'semibold' ? 600 : settings.fontWeight === 'medium' ? 500 : 400,
                textTransform: settings.textTransform,
                letterSpacing: `${settings.letterSpacing}em`,
                textShadow:
                  settings.glowIntensity !== 'off'
                    ? `0 0 10px ${settings.glowColor}, 0 0 20px ${settings.glowColor}80`
                    : 'none',
              }}
            >
              Starboy
            </span>

            {/* Upcoming Word */}
            <span
              style={{
                color: settings.futureColor,
                fontFamily: currentFont.css,
                fontSize: `${settings.fontSize * 0.85}px`,
                textTransform: settings.textTransform,
                letterSpacing: `${settings.letterSpacing}em`,
              }}
            >
              ah
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-neutral-800 bg-neutral-900/40 px-5 pt-2 gap-2">
          <button
            onClick={() => setActiveTab('colors')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors border-b-2 ${
              activeTab === 'colors'
                ? 'border-white text-white bg-neutral-800/60'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
            style={{
              borderColor: activeTab === 'colors' ? settings.primaryColor : 'transparent',
              color: activeTab === 'colors' ? settings.primaryColor : undefined,
            }}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Colors & Theme</span>
          </button>

          <button
            onClick={() => setActiveTab('font')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors border-b-2 ${
              activeTab === 'font'
                ? 'border-white text-white bg-neutral-800/60'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
            style={{
              borderColor: activeTab === 'font' ? settings.primaryColor : 'transparent',
              color: activeTab === 'font' ? settings.primaryColor : undefined,
            }}
          >
            <Type className="w-3.5 h-3.5" />
            <span>Font & Typography</span>
          </button>

          <button
            onClick={() => setActiveTab('glow')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors border-b-2 ${
              activeTab === 'glow'
                ? 'border-white text-white bg-neutral-800/60'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
            style={{
              borderColor: activeTab === 'glow' ? settings.primaryColor : 'transparent',
              color: activeTab === 'glow' ? settings.primaryColor : undefined,
            }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Glow & Motion</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1 min-h-[340px]">
          {/* TAB 1: COLORS */}
          {activeTab === 'colors' && (
            <div className="space-y-5">
              {/* Preset Color Themes */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-2.5">
                  Celestial Palette Presets
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {THEME_PRESETS.map((preset) => {
                    const isSelected = settings.themeId === preset.id;
                    return (
                      <button
                        key={preset.id}
                        onClick={() => handleSelectTheme(preset.id)}
                        className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-neutral-800/90 border-white shadow-lg'
                            : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800/40'
                        }`}
                        style={{
                          borderColor: isSelected ? preset.primary : undefined,
                          boxShadow: isSelected ? `0 0 14px ${preset.glow}33` : undefined,
                        }}
                      >
                        <div className="flex items-center justify-between w-full mb-2">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-black/40 shadow-sm"
                              style={{ backgroundColor: preset.primary }}
                            />
                            <span
                              className="w-2.5 h-2.5 rounded-full border border-black/40 shadow-sm"
                              style={{ backgroundColor: preset.glow }}
                            />
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5" style={{ color: preset.primary }} />}
                        </div>
                        <span className="text-xs font-semibold text-white">{preset.name}</span>
                        <span className="text-[10px] text-neutral-400 mt-0.5">{preset.badge}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Color Pickers */}
              <div className="border-t border-neutral-800/80 pt-4">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-3">
                  Fine-Tune Custom Colors
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Primary Accent Color */}
                  <div className="bg-neutral-900/70 p-3 rounded-xl border border-neutral-800 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-semibold text-white">Active Star & Beacon</div>
                      <div className="text-[11px] text-neutral-400">Primary constellation accent</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={settings.primaryColor}
                        onChange={(e) =>
                          update({
                            primaryColor: e.target.value,
                            themeId: 'custom',
                          })
                        }
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <input
                        type="text"
                        value={settings.primaryColor}
                        onChange={(e) =>
                          update({
                            primaryColor: e.target.value,
                            themeId: 'custom',
                          })
                        }
                        className="w-20 px-2 py-1 text-xs font-mono bg-neutral-800 border border-neutral-700 rounded text-neutral-200 uppercase"
                      />
                    </div>
                  </div>

                  {/* Glow Color */}
                  <div className="bg-neutral-900/70 p-3 rounded-xl border border-neutral-800 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-semibold text-white">Aura & Glow Tint</div>
                      <div className="text-[11px] text-neutral-400">Atmospheric blur color</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={settings.glowColor}
                        onChange={(e) =>
                          update({
                            glowColor: e.target.value,
                            themeId: 'custom',
                          })
                        }
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <input
                        type="text"
                        value={settings.glowColor}
                        onChange={(e) =>
                          update({
                            glowColor: e.target.value,
                            themeId: 'custom',
                          })
                        }
                        className="w-20 px-2 py-1 text-xs font-mono bg-neutral-800 border border-neutral-700 rounded text-neutral-200 uppercase"
                      />
                    </div>
                  </div>

                  {/* Deep Space Background Color */}
                  <div className="bg-neutral-900/70 p-3 rounded-xl border border-neutral-800 flex items-center justify-between gap-3 sm:col-span-2">
                    <div>
                      <div className="text-xs font-semibold text-white">Deep Space Background</div>
                      <div className="text-[11px] text-neutral-400">Celestial sky canvas color</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Quick bg presets */}
                      <button
                        onClick={() => update({ bgColor: '#0a0a0a', themeId: 'custom' })}
                        className={`px-2 py-1 text-[11px] rounded border ${
                          settings.bgColor === '#0a0a0a'
                            ? 'border-white text-white bg-neutral-800'
                            : 'border-neutral-700 text-neutral-400 hover:text-white'
                        }`}
                      >
                        Void
                      </button>
                      <button
                        onClick={() => update({ bgColor: '#000000', themeId: 'custom' })}
                        className={`px-2 py-1 text-[11px] rounded border ${
                          settings.bgColor === '#000000'
                            ? 'border-white text-white bg-neutral-800'
                            : 'border-neutral-700 text-neutral-400 hover:text-white'
                        }`}
                      >
                        OLED
                      </button>
                      <button
                        onClick={() => update({ bgColor: '#070f1a', themeId: 'custom' })}
                        className={`px-2 py-1 text-[11px] rounded border ${
                          settings.bgColor === '#070f1a'
                            ? 'border-white text-white bg-neutral-800'
                            : 'border-neutral-700 text-neutral-400 hover:text-white'
                        }`}
                      >
                        Navy
                      </button>
                      <input
                        type="color"
                        value={settings.bgColor}
                        onChange={(e) => update({ bgColor: e.target.value, themeId: 'custom' })}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FONT & TYPOGRAPHY */}
          {activeTab === 'font' && (
            <div className="space-y-5">
              {/* Font Family Cards */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-2.5">
                  Constellation Font Family
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(Object.keys(FONT_FAMILY_MAP) as FontFamilyId[]).map((fontId) => {
                    const info = FONT_FAMILY_MAP[fontId];
                    const isSelected = settings.fontFamily === fontId;
                    return (
                      <button
                        key={fontId}
                        onClick={() => update({ fontFamily: fontId })}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-neutral-800/90 border-white shadow-md'
                            : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800/40'
                        }`}
                        style={{
                          borderColor: isSelected ? settings.primaryColor : undefined,
                        }}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-white">{info.name}</span>
                          {isSelected && (
                            <Check className="w-3.5 h-3.5" style={{ color: settings.primaryColor }} />
                          )}
                        </div>
                        <div
                          className="text-sm my-1 text-neutral-200"
                          style={{ fontFamily: info.css }}
                        >
                          I come alive in the fall time
                        </div>
                        <span className="text-[10px] text-neutral-400 block">{info.description}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Font Size & Weight */}
              <div className="border-t border-neutral-800/80 pt-4 space-y-4">
                {/* Font Size Slider */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-white">Font Size</label>
                    <span className="text-xs font-mono font-bold" style={{ color: settings.primaryColor }}>
                      {settings.fontSize} px
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="10"
                      max="22"
                      step="1"
                      value={settings.fontSize}
                      onChange={(e) => update({ fontSize: parseInt(e.target.value, 10) })}
                      className="w-full accent-[#d4ff3a] cursor-pointer"
                    />
                    <div className="flex gap-1 shrink-0">
                      {[11, 13, 16, 20].map((size) => (
                        <button
                          key={size}
                          onClick={() => update({ fontSize: size })}
                          className={`px-2 py-0.5 rounded text-[11px] font-mono border ${
                            settings.fontSize === size
                              ? 'border-white text-white bg-neutral-800'
                              : 'border-neutral-800 text-neutral-400 hover:text-white'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Font Weight */}
                <div>
                  <label className="text-xs font-semibold text-white block mb-2">Font Weight</label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {(['normal', 'medium', 'semibold', 'bold', 'black'] as FontWeight[]).map((weight) => (
                      <button
                        key={weight}
                        onClick={() => update({ fontWeight: weight })}
                        className={`py-1.5 px-2 rounded-lg text-xs capitalize border transition-all ${
                          settings.fontWeight === weight
                            ? 'bg-neutral-800 text-white border-white'
                            : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:text-white'
                        }`}
                        style={{
                          borderColor: settings.fontWeight === weight ? settings.primaryColor : undefined,
                          color: settings.fontWeight === weight ? settings.primaryColor : undefined,
                        }}
                      >
                        {weight}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Text Transform (Casing) */}
                <div>
                  <label className="text-xs font-semibold text-white block mb-2">Text Casing</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'none', label: 'As Sung (Default)' },
                      { id: 'uppercase', label: 'ALL CAPS' },
                      { id: 'capitalize', label: 'Capitalize Every Word' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => update({ textTransform: item.id as TextTransform })}
                        className={`py-2 px-3 rounded-lg text-xs border text-center transition-all ${
                          settings.textTransform === item.id
                            ? 'bg-neutral-800 text-white border-white'
                            : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:text-white'
                        }`}
                        style={{
                          borderColor:
                            settings.textTransform === item.id ? settings.primaryColor : undefined,
                          color:
                            settings.textTransform === item.id ? settings.primaryColor : undefined,
                        }}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Letter Spacing Slider */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-white">Letter Spacing</label>
                    <span className="text-xs font-mono text-neutral-400">
                      {settings.letterSpacing.toFixed(2)} em
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="0.16"
                    step="0.02"
                    value={settings.letterSpacing}
                    onChange={(e) => update({ letterSpacing: parseFloat(e.target.value) })}
                    className="w-full accent-[#d4ff3a] cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: GLOW & VISUAL EFFECTS */}
          {activeTab === 'glow' && (
            <div className="space-y-5">
              {/* Glow Intensity Segmented Control */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-2.5">
                  Celestial Glow & Radiance Intensity
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {[
                    { id: 'off', label: 'Crisp Vector', desc: 'No blur' },
                    { id: 'subtle', label: 'Soft Aura', desc: '2.5px' },
                    { id: 'normal', label: 'Neon Glow', desc: '5.0px (Default)' },
                    { id: 'supernova', label: 'Supernova', desc: '8.5px' },
                    { id: 'hyperdrive', label: 'Hyperdrive', desc: '15px' },
                  ].map((level) => {
                    const isSelected = settings.glowIntensity === level.id;
                    return (
                      <button
                        key={level.id}
                        onClick={() => update({ glowIntensity: level.id as GlowIntensity })}
                        className={`p-2 rounded-xl border text-center transition-all ${
                          isSelected
                            ? 'bg-neutral-800 text-white border-white shadow-md'
                            : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:text-white'
                        }`}
                        style={{
                          borderColor: isSelected ? settings.primaryColor : undefined,
                          boxShadow: isSelected ? `0 0 12px ${settings.glowColor}40` : undefined,
                        }}
                      >
                        <div
                          className="text-xs font-bold mb-0.5"
                          style={{ color: isSelected ? settings.primaryColor : undefined }}
                        >
                          {level.label}
                        </div>
                        <div className="text-[10px] text-neutral-500">{level.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Celestial Beacon / Moving Circle Style */}
              <div className="border-t border-neutral-800/80 pt-4">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-2.5">
                  Linear Circle Beacon Style
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    {
                      id: 'reticle',
                      name: 'Target Reticle',
                      desc: 'Pulse ring + star crosshairs',
                    },
                    {
                      id: 'orb',
                      name: 'Radiant Orb',
                      desc: 'Double glowing filled pulsar',
                    },
                    {
                      id: 'ring',
                      name: 'Pulsing Ring',
                      desc: 'Smooth breathing halo',
                    },
                    {
                      id: 'minimal',
                      name: 'Minimal Star',
                      desc: 'Sharp precision star point',
                    },
                  ].map((beacon) => {
                    const isSelected = settings.beaconStyle === beacon.id;
                    return (
                      <button
                        key={beacon.id}
                        onClick={() => update({ beaconStyle: beacon.id as BeaconStyle })}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-neutral-800 text-white border-white shadow-md'
                            : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800/40 text-neutral-400'
                        }`}
                        style={{
                          borderColor: isSelected ? settings.primaryColor : undefined,
                        }}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className="text-xs font-bold"
                            style={{ color: isSelected ? settings.primaryColor : '#ffffff' }}
                          >
                            {beacon.name}
                          </span>
                          {isSelected && (
                            <Check className="w-3.5 h-3.5" style={{ color: settings.primaryColor }} />
                          )}
                        </div>
                        <span className="text-[10px] text-neutral-400">{beacon.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Progress Trail & Starfield Density */}
              <div className="border-t border-neutral-800/80 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Linear Progress Trail Toggle */}
                <div className="bg-neutral-900/70 p-3.5 rounded-xl border border-neutral-800 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-white">Starlight Progress Trail</div>
                    <div className="text-[11px] text-neutral-400">
                      Illuminates path linearly between words
                    </div>
                  </div>
                  <button
                    onClick={() => update({ showProgressTrail: !settings.showProgressTrail })}
                    className={`w-11 h-6 rounded-full transition-colors relative ${
                      settings.showProgressTrail ? 'bg-[#d4ff3a]' : 'bg-neutral-700'
                    }`}
                    style={{
                      backgroundColor: settings.showProgressTrail ? settings.primaryColor : undefined,
                    }}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-black absolute top-1 transition-transform ${
                        settings.showProgressTrail ? 'left-6' : 'left-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Starfield Density */}
                <div className="bg-neutral-900/70 p-3.5 rounded-xl border border-neutral-800">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-semibold text-white">Starfield Density</div>
                    <span className="text-xs font-mono capitalize" style={{ color: settings.primaryColor }}>
                      {settings.starDensity}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    {(['off', 'low', 'medium', 'high'] as StarDensity[]).map((density) => (
                      <button
                        key={density}
                        onClick={() => update({ starDensity: density })}
                        className={`py-1 text-[11px] rounded capitalize border ${
                          settings.starDensity === density
                            ? 'border-white text-white bg-neutral-800'
                            : 'border-neutral-800 text-neutral-400 hover:text-white'
                        }`}
                        style={{
                          borderColor: settings.starDensity === density ? settings.primaryColor : undefined,
                          color: settings.starDensity === density ? settings.primaryColor : undefined,
                        }}
                      >
                        {density}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-neutral-800 bg-neutral-900/80 flex items-center justify-between">
          <button
            onClick={onResetSettings}
            className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Defaults</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl font-bold text-xs text-black shadow-md transition-all hover:scale-105 active:scale-95"
            style={{
              backgroundColor: settings.primaryColor,
              boxShadow: `0 0 14px ${settings.glowColor}55`,
            }}
          >
            Save & Enjoy
          </button>
        </div>
      </div>
    </div>
  );
};

