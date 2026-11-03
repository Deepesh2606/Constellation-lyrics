import React, { useMemo } from 'react';
import {
  ParsedLine,
  ConstellationSettings,
} from '../types';

interface KineticTypographyProps {
  parsedLines: ParsedLine[];
  currentTimeMs: number;
  settings: ConstellationSettings;
  fontCss: string;
  onWordClick?: (timeMs: number) => void;
}

export const KineticTypography: React.FC<KineticTypographyProps> = ({
  parsedLines,
  currentTimeMs,
  settings,
  fontCss,
  onWordClick,
}) => {
  if (!settings.enableKineticTypography || !parsedLines || parsedLines.length === 0) {
    return null;
  }

  // Find current line and active word
  const { currentLine, activeWordIndex, wordProgress, nextLine } = useMemo(() => {
    let lineIdx = -1;

    for (let i = 0; i < parsedLines.length; i++) {
      const l = parsedLines[i];
      if (currentTimeMs >= l.timeMs && currentTimeMs < l.endTime) {
        lineIdx = i;
        break;
      }
    }

    if (lineIdx === -1) {
      for (let i = 0; i < parsedLines.length; i++) {
        if (currentTimeMs < parsedLines[i].timeMs) {
          lineIdx = i > 0 ? i - 1 : 0;
          break;
        }
      }
      if (lineIdx === -1 && currentTimeMs >= parsedLines[parsedLines.length - 1].endTime) {
        lineIdx = parsedLines.length - 1;
      }
    }

    const curr = lineIdx >= 0 ? parsedLines[lineIdx] : null;
    const next = lineIdx >= 0 && lineIdx < parsedLines.length - 1 ? parsedLines[lineIdx + 1] : null;

    let wordIdx = -1;
    let progress = 0;

    if (curr && curr.words) {
      for (let w = 0; w < curr.words.length; w++) {
        const word = curr.words[w];
        if (currentTimeMs >= word.startTime && currentTimeMs < word.endTime) {
          wordIdx = w;
          const dur = word.endTime - word.startTime;
          progress = dur > 0 ? Math.max(0, Math.min(1, (currentTimeMs - word.startTime) / dur)) : 0;
          break;
        }
      }
      // If past all words in line
      if (wordIdx === -1 && curr.words.length > 0) {
        if (currentTimeMs >= curr.words[curr.words.length - 1].endTime) {
          wordIdx = curr.words.length - 1;
          progress = 1;
        } else if (currentTimeMs < curr.words[0].startTime) {
          wordIdx = 0;
          progress = 0;
        }
      }
    }

    return {
      currentLine: curr,
      activeWordIndex: wordIdx,
      wordProgress: progress,
      nextLine: next,
    };
  }, [parsedLines, currentTimeMs]);

  if (!currentLine || !currentLine.words || currentLine.words.length === 0) {
    return null;
  }

  // Determine font sizes based on size setting
  let activeFontSize = 40;
  let normalFontSize = 28;
  let nextLineFontSize = 16;
  if (settings.kineticSize === 'normal') {
    activeFontSize = 28;
    normalFontSize = 20;
    nextLineFontSize = 13;
  } else if (settings.kineticSize === 'huge') {
    activeFontSize = 54;
    normalFontSize = 38;
    nextLineFontSize = 18;
  }

  // Calculate sliding container offset
  // Words smoothly slide to keep the current word centered in view
  const totalWords = currentLine.words.length;
  const slidePercent = totalWords > 1 && activeWordIndex >= 0
    ? -((activeWordIndex + wordProgress * 0.4) / (totalWords - 1)) * 30 + 15
    : 0;

  // Positioning container style depending on layout style
  let containerPositionClasses = 'top-1/4 left-1/2 -translate-x-1/2 max-w-4xl';
  if (settings.kineticStyle === 'banner') {
    containerPositionClasses = 'bottom-24 left-1/2 -translate-x-1/2 max-w-5xl';
  } else if (settings.kineticStyle === 'floating') {
    containerPositionClasses = 'top-20 left-1/2 -translate-x-1/2 max-w-3xl';
  } else if (settings.kineticStyle === 'warp') {
    containerPositionClasses = 'top-1/4 left-1/2 -translate-x-1/2 max-w-4xl perspective-[1000px]';
  }

  const hasGlow = settings.glowIntensity !== 'off';

  return (
    <div
      className={`absolute ${containerPositionClasses} w-[92%] z-25 pointer-events-none flex flex-col items-center text-center transition-all duration-300 select-none`}
    >
      {/* Dynamic Keyframe Styles for Kinetic Typography */}
      <style>{`
        @keyframes kineticWordPop {
          0% {
            transform: scale(0.72) translateY(10px);
            opacity: 0.3;
          }
          55% {
            transform: scale(1.24) translateY(-5px);
            opacity: 1;
          }
          100% {
            transform: scale(1.15) translateY(-2px);
            opacity: 1;
          }
        }
        @keyframes kineticLineSlide {
          0% {
            transform: translateY(22px);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes kineticPulseBloom {
          0%, 100% {
            filter: drop-shadow(0 0 12px ${settings.glowColor});
          }
          50% {
            filter: drop-shadow(0 0 24px ${settings.glowColor}) drop-shadow(0 0 36px ${settings.primaryColor}80);
          }
        }
        .kinetic-active-word {
          animation: kineticWordPop 0.32s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
      `}</style>

      {/* Kinetic Phrase Row (Sliding in sync with music) */}
      <div
        key={`line-${currentLine.lineIndex}`}
        className="w-full flex items-center justify-center flex-wrap gap-x-3.5 gap-y-2 py-3 px-6 rounded-2xl backdrop-blur-md border shadow-2xl transition-transform duration-300"
        style={{
          fontFamily: fontCss,
          backgroundColor: `${settings.bgColor}99`,
          borderColor: `${settings.primaryColor}33`,
          boxShadow: `0 16px 48px rgba(0,0,0,0.7), 0 0 24px ${settings.glowColor}20`,
          animation: 'kineticLineSlide 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          transform: `translateX(${slidePercent}px)`,
        }}
      >
        {currentLine.words.map((w, wIdx) => {
          const isActive = wIdx === activeWordIndex;
          const isPast = wIdx < activeWordIndex;
          const isUpcoming = wIdx > activeWordIndex;

          let color = settings.futureColor;
          let fontSize = normalFontSize;
          let fontWeight = 500;
          let scale = 1;
          let opacity = 0.35;
          let textShadow = 'none';

          if (isActive) {
            color = '#ffffff';
            fontSize = activeFontSize;
            fontWeight = 800;
            scale = 1.15;
            opacity = 1;
            if (hasGlow) {
              textShadow = `0 0 16px ${settings.glowColor}, 0 0 32px ${settings.glowColor}99, 0 0 48px ${settings.primaryColor}66`;
            }
          } else if (isPast) {
            color = settings.pastColor;
            fontSize = normalFontSize;
            fontWeight = 600;
            scale = 1.0;
            opacity = 0.85;
            if (hasGlow) {
              textShadow = `0 0 8px ${settings.glowColor}40`;
            }
          }

          return (
            <div
              key={`word-${currentLine.lineIndex}-${wIdx}`}
              onClick={(e) => {
                e.stopPropagation();
                onWordClick?.(w.startTime);
              }}
              className={`relative inline-flex flex-col items-center pointer-events-auto cursor-pointer transition-all duration-200 hover:scale-125 ${
                isActive ? 'kinetic-active-word z-10' : ''
              }`}
              style={{
                color,
                fontSize: `${fontSize}px`,
                fontWeight,
                opacity,
                textShadow,
                textTransform: settings.textTransform,
                letterSpacing: `${settings.letterSpacing}em`,
              }}
            >
              <span>{w.text}</span>

              {/* Active Word Duration Progress Pill Underline */}
              {isActive && (
                <div
                  className="w-full h-1 mt-1 rounded-full overflow-hidden"
                  style={{ backgroundColor: `${settings.primaryColor}33` }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-75 shadow-sm"
                    style={{
                      width: `${Math.round(wordProgress * 100)}%`,
                      backgroundColor: settings.primaryColor,
                      boxShadow: `0 0 8px ${settings.glowColor}`,
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Upcoming Next Line Preview */}
      {settings.showNextLinePreview && nextLine && (
        <div
          className="mt-3 px-5 py-1.5 rounded-full backdrop-blur-sm border opacity-50 transition-opacity duration-300 hover:opacity-90 max-w-xl truncate"
          style={{
            fontFamily: fontCss,
            fontSize: `${nextLineFontSize}px`,
            color: settings.futureColor,
            backgroundColor: `${settings.bgColor}66`,
            borderColor: `${settings.primaryColor}20`,
            textTransform: settings.textTransform,
            letterSpacing: `${settings.letterSpacing}em`,
          }}
        >
          <span className="text-[10px] uppercase font-mono mr-2 px-1.5 py-0.5 rounded border border-neutral-700/60 bg-neutral-900/60 text-neutral-400">
            Next
          </span>
          <span>{nextLine.text}</span>
        </div>
      )}
    </div>
  );
};

