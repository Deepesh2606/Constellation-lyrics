import React, { useEffect, useRef, useState, useMemo } from 'react';
import { ConstellationNode, AmbientStar, ParsedLine } from '../types';
import { buildConstellationLayout, generateAmbientStars } from '../utils/constellationLayout';
import { Eye, Navigation, ZoomIn, ZoomOut, Sparkles } from 'lucide-react';

interface ConstellationCanvasProps {
  parsedLines: ParsedLine[];
  currentTimeMs: number;
  isPlaying: boolean;
  trackTitle: string;
  trackArtist: string;
  isLoadingLyrics: boolean;
  errorLyrics: string | null;
  onWordClick?: (timeMs: number) => void;
  glowIntensity?: 'subtle' | 'normal' | 'supernova';
}

export const ConstellationCanvas: React.FC<ConstellationCanvasProps> = ({
  parsedLines,
  currentTimeMs,
  isPlaying,
  trackTitle,
  trackArtist,
  isLoadingLyrics,
  errorLyrics,
  onWordClick,
  glowIntensity = 'normal',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Layout states
  const [nodes, setNodes] = useState<ConstellationNode[]>([]);
  const [ambientStars, setAmbientStars] = useState<AmbientStar[]>([]);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });

  // Camera & Interaction
  const [autoFollow, setAutoFollow] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const cameraRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });

  // Rebuild constellation layout when parsedLines or dimension changes
  useEffect(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const w = rect.width || window.innerWidth || 1000;
    const h = rect.height || window.innerHeight || 700;
    setDimensions({ width: w, height: h });

    const newNodes = buildConstellationLayout(parsedLines, w, h, 56);
    setNodes(newNodes);
    setAmbientStars(generateAmbientStars(100, w, h));

    if (newNodes.length > 0) {
      cameraRef.current.x = newNodes[0].x;
      cameraRef.current.y = newNodes[0].y;
      cameraRef.current.targetX = newNodes[0].x;
      cameraRef.current.targetY = newNodes[0].y;
    }
  }, [parsedLines]);

  // Window resize observer
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setDimensions({ width, height });
        }
      }
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Compute active word and active line based on currentTimeMs
  const { activeNode, activeLineIdx } = useMemo(() => {
    let foundNode: ConstellationNode | null = null;
    let lineIdx = -1;

    for (const node of nodes) {
      if (currentTimeMs >= node.startTime && currentTimeMs < node.endTime) {
        foundNode = node;
        lineIdx = node.lineIndex;
        break;
      }
    }

    if (!foundNode && nodes.length > 0) {
      for (let i = 0; i < nodes.length; i++) {
        if (currentTimeMs < nodes[i].startTime) {
          lineIdx = i > 0 ? nodes[i - 1].lineIndex : 0;
          break;
        }
      }
      if (lineIdx === -1 && currentTimeMs >= nodes[nodes.length - 1].endTime) {
        lineIdx = nodes[nodes.length - 1].lineIndex;
      }
    }

    return { activeNode: foundNode, activeLineIdx: lineIdx };
  }, [nodes, currentTimeMs]);

  // Auto-camera smooth update with requestAnimationFrame
  useEffect(() => {
    let animId: number;

    const loop = () => {
      animId = requestAnimationFrame(loop);

      if (autoFollow) {
        if (activeNode) {
          cameraRef.current.targetX = activeNode.x;
          cameraRef.current.targetY = activeNode.y;
        } else if (activeLineIdx >= 0) {
          const lineNodes = nodes.filter((n) => n.lineIndex === activeLineIdx);
          if (lineNodes.length > 0) {
            const midNode = lineNodes[Math.floor(lineNodes.length / 2)];
            cameraRef.current.targetX = midNode.x;
            cameraRef.current.targetY = midNode.y;
          }
        }
      }

      // Smooth camera lerp
      cameraRef.current.x += (cameraRef.current.targetX - cameraRef.current.x) * 0.06;
      cameraRef.current.y += (cameraRef.current.targetY - cameraRef.current.y) * 0.06;

      if (svgRef.current) {
        const gTransform = svgRef.current.querySelector('#camera-viewport-group');
        if (gTransform) {
          const cx = dimensions.width / 2;
          const cy = dimensions.height / 2;
          const tx = cx - cameraRef.current.x * zoomLevel;
          const ty = cy - cameraRef.current.y * zoomLevel;
          gTransform.setAttribute(
            'transform',
            `translate(${tx.toFixed(2)}, ${ty.toFixed(2)}) scale(${zoomLevel})`
          );
        }
      }
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [autoFollow, activeNode, activeLineIdx, nodes, dimensions, zoomLevel]);

  // Mouse pan & zoom handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastMousePosRef.current.x;
    const dy = e.clientY - lastMousePosRef.current.y;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };

    setAutoFollow(false);
    cameraRef.current.targetX -= dx / zoomLevel;
    cameraRef.current.targetY -= dy / zoomLevel;
    cameraRef.current.x -= dx / zoomLevel;
    cameraRef.current.y -= dy / zoomLevel;
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.08 : 0.92;
    setZoomLevel((prev) => Math.min(2.2, Math.max(0.45, prev * factor)));
  };

  const handleRecenter = () => {
    setAutoFollow(true);
    setZoomLevel(1);
    if (activeNode) {
      cameraRef.current.targetX = activeNode.x;
      cameraRef.current.targetY = activeNode.y;
    }
  };

  // Glow filter radii based on intensity
  const glowStdDev = glowIntensity === 'supernova' ? 6 : glowIntensity === 'subtle' ? 2.5 : 4;

  return (
    <div
      ref={containerRef}
      id="spicetify-constellation-root"
      className="relative w-full h-full bg-[#0a0a0a] overflow-hidden select-none cursor-grab active:cursor-grabbing font-sans"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* SVG Celestial Field */}
      <svg
        ref={svgRef}
        className="w-full h-full absolute inset-0 block"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="lime-glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation={glowStdDev} result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="super-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation={glowStdDev * 1.8} result="superBlur" />
            <feMerge>
              <feMergeNode in="superBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="word-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#d4ff3a" floodOpacity="0.8" />
          </filter>
          <radialGradient id="nebula-haze" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#d4ff3a" stopOpacity="0.04" />
            <stop offset="70%" stopColor="#0a0a0a" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="vignette" cx="50%" cy="50%" r="50%">
            <stop offset="65%" stopColor="#0a0a0a" stopOpacity="0" />
            <stop offset="100%" stopColor="#0a0a0a" stopOpacity="0.85" />
          </radialGradient>
        </defs>

        {/* Dynamic Transformed Universe Group */}
        <g id="camera-viewport-group">
          {/* Subtle Nebula clouds in background */}
          {activeNode && (
            <circle
              cx={activeNode.x}
              cy={activeNode.y}
              r="400"
              fill="url(#nebula-haze)"
              pointerEvents="none"
            />
          )}

          {/* Ambient Twinkling Stars */}
          <g className="ambient-stars" pointerEvents="none">
            {ambientStars.map((star, sIdx) => {
              const twinkle = Math.sin(Date.now() * star.speed + star.phase);
              const op = Math.max(0.08, star.baseOpacity + twinkle * 0.15);
              return (
                <circle
                  key={`amb-${sIdx}`}
                  cx={star.x}
                  cy={star.y}
                  r={star.r}
                  fill="#d4ff3a"
                  opacity={op.toFixed(3)}
                />
              );
            })}
          </g>

          {/* Constellation Connecting Lines */}
          <g className="constellation-lines" pointerEvents="none">
            {nodes.map((node) => {
              if (!node.prevNode) return null;

              const isPast = currentTimeMs >= node.endTime;
              const isActiveLine =
                currentTimeMs >= node.prevNode.startTime && currentTimeMs < node.endTime;
              const lineDistFromActive = Math.abs(node.lineIndex - activeLineIdx);

              let lineOpacity = 0.16;
              let strokeColor = 'rgba(212, 255, 58, 0.18)';
              let strokeWidth = 1.2;

              if (node.lineIndex < activeLineIdx - 2) {
                // Fade out older lines
                const age = activeLineIdx - node.lineIndex;
                lineOpacity = Math.max(0.02, 0.14 - age * 0.04);
              } else if (isActiveLine) {
                lineOpacity = 0.95;
                strokeColor = '#d4ff3a';
                strokeWidth = 2.2;
              } else if (isPast) {
                lineOpacity = Math.max(0.25, 0.7 - lineDistFromActive * 0.18);
                strokeColor = 'rgba(212, 255, 58, 0.85)';
                strokeWidth = 1.4;
              }

              return (
                <line
                  key={`line-${node.id}`}
                  x1={node.prevNode.x}
                  y1={node.prevNode.y}
                  x2={node.x}
                  y2={node.y}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeOpacity={lineOpacity}
                  strokeLinecap="round"
                  filter={isActiveLine ? 'url(#lime-glow)' : undefined}
                />
              );
            })}
          </g>

          {/* Constellation Word Nodes */}
          <g className="constellation-nodes">
            {nodes.map((node) => {
              const isWordActive = activeNode?.id === node.id;
              const isWordPast = currentTimeMs >= node.endTime;
              const isFuture = currentTimeMs < node.startTime;

              let starRadius = 2.5;
              let starOpacity = 0.35;
              let starFill = '#7d8a60';
              let textOpacity = 0.4;
              let textColor = '#9ca3af';
              let fontWeight = 400;
              let filterAttr: string | undefined = undefined;

              if (isWordActive) {
                starRadius = 6.8;
                starOpacity = 1.0;
                starFill = '#d4ff3a';
                textOpacity = 1.0;
                textColor = '#ffffff';
                fontWeight = 700;
                filterAttr = 'url(#lime-glow)';
              } else if (node.lineIndex === activeLineIdx) {
                if (isWordPast) {
                  starRadius = 4.0;
                  starOpacity = 0.9;
                  starFill = '#d4ff3a';
                  textOpacity = 0.95;
                  textColor = '#eaff96';
                  fontWeight = 600;
                } else {
                  // Upcoming words in current line
                  starRadius = 3.2;
                  starOpacity = 0.65;
                  starFill = '#a4c442';
                  textOpacity = 0.7;
                  textColor = '#c9d998';
                }
              } else if (node.lineIndex < activeLineIdx) {
                // Older lines fading out
                const age = activeLineIdx - node.lineIndex;
                starOpacity = Math.max(0.04, 0.35 - age * 0.1);
                textOpacity = Math.max(0.04, 0.4 - age * 0.12);
                starFill = '#6b7d4c';
                textColor = '#869677';
                starRadius = 2.2;
              } else {
                // Future upcoming lines
                const distance = node.lineIndex - activeLineIdx;
                starOpacity = Math.max(0.12, 0.35 - distance * 0.08);
                textOpacity = Math.max(0.12, 0.4 - distance * 0.08);
                starFill = '#54613c';
                textColor = '#6b7280';
                starRadius = 2.0;
              }

              return (
                <g
                  key={node.id}
                  className="cursor-pointer transition-transform duration-150 hover:scale-125"
                  onClick={(e) => {
                    e.stopPropagation();
                    onWordClick?.(node.startTime);
                  }}
                >
                  {/* Active radiant halo / celestial beacon */}
                  {isWordActive && (
                    <>
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r="16"
                        fill="none"
                        stroke="#d4ff3a"
                        strokeWidth="1.5"
                        strokeOpacity="0.75"
                        filter="url(#lime-glow)"
                        className="animate-ping"
                      />
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r="22"
                        fill="none"
                        stroke="#d4ff3a"
                        strokeWidth="1"
                        strokeOpacity="0.3"
                      />
                      {/* Celestial crosshair spikes */}
                      <line
                        x1={node.x - 14}
                        y1={node.y}
                        x2={node.x + 14}
                        y2={node.y}
                        stroke="#d4ff3a"
                        strokeWidth="1.5"
                        strokeOpacity="0.9"
                        filter="url(#lime-glow)"
                      />
                      <line
                        x1={node.x}
                        y1={node.y - 14}
                        x2={node.x}
                        y2={node.y + 14}
                        stroke="#d4ff3a"
                        strokeWidth="1.5"
                        strokeOpacity="0.9"
                        filter="url(#lime-glow)"
                      />
                    </>
                  )}

                  {/* Star point */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={starRadius}
                    fill={starFill}
                    opacity={starOpacity}
                    filter={filterAttr}
                  />

                  {/* Star label (Lyric Word) */}
                  <text
                    x={node.x}
                    y={node.y + (isWordActive ? 22 : 18)}
                    textAnchor="middle"
                    fill={textColor}
                    fontSize={isWordActive ? 16 : 13}
                    fontWeight={fontWeight}
                    letterSpacing="0.04em"
                    opacity={textOpacity}
                    filter={isWordActive ? 'url(#word-glow)' : undefined}
                    className="select-none"
                  >
                    {node.text}
                  </text>
                </g>
              );
            })}
          </g>
        </g>

        {/* Outer Vignette gradient overlay */}
        <rect width="100%" height="100%" fill="url(#vignette)" pointerEvents="none" />
      </svg>

      {/* Floating Canvas Controls (Top Right) */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-20 pointer-events-auto">
        <button
          onClick={handleRecenter}
          className={`px-3 py-1.5 text-xs font-medium rounded-full flex items-center gap-1.5 transition-all backdrop-blur-md border ${
            autoFollow
              ? 'bg-[#d4ff3a]/20 border-[#d4ff3a] text-[#d4ff3a] shadow-[0_0_12px_rgba(212,255,58,0.25)]'
              : 'bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:text-white'
          }`}
          title="Keep camera focused on active lyrics"
        >
          <Navigation className={`w-3.5 h-3.5 ${autoFollow ? 'rotate-45' : ''}`} />
          {autoFollow ? 'Auto-Tracking' : 'Recenter Camera'}
        </button>

        <div className="flex items-center bg-neutral-900/80 backdrop-blur-md border border-neutral-800 rounded-full p-0.5">
          <button
            onClick={() => setZoomLevel((z) => Math.min(2.2, z + 0.15))}
            className="p-1.5 text-neutral-400 hover:text-[#d4ff3a] rounded-full transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-mono text-neutral-400 px-1.5">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.45, z - 0.15))}
            className="p-1.5 text-neutral-400 hover:text-[#d4ff3a] rounded-full transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Status Overlay: Loading / Error / Empty state */}
      {isLoadingLyrics && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10 pointer-events-none text-center">
          <div className="w-10 h-10 border-2 border-[#d4ff3a]/20 border-t-[#d4ff3a] rounded-full animate-spin shadow-[0_0_16px_rgba(212,255,58,0.4)]" />
          <p className="text-sm font-medium text-neutral-300 tracking-wide">
            Mapping celestial lyrics from LRCLIB...
          </p>
        </div>
      )}

      {!isLoadingLyrics && (errorLyrics || nodes.length === 0) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10 pointer-events-none text-center px-6">
          <div className="p-3 bg-neutral-900/80 border border-neutral-800 rounded-full text-neutral-500 shadow-xl">
            <Sparkles className="w-6 h-6 text-neutral-600" />
          </div>
          <p className="text-base font-semibold text-neutral-300">
            {errorLyrics || 'No lyrics found'}
          </p>
          <p className="text-xs text-neutral-500 max-w-sm">
            {trackTitle
              ? `No synced LRC lyrics were returned for "${trackTitle}". Try picking another song or pasting custom lyrics.`
              : 'Play a song to view its synced constellation.'}
          </p>
        </div>
      )}

      {/* Track Info Badge at the Bottom (matching Spicetify requirement) */}
      <div className="constellation-bottom-bar absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 px-6 py-2.5 bg-neutral-950/80 backdrop-blur-xl border border-[#d4ff3a]/30 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.7),0_0_20px_rgba(212,255,58,0.12)] z-20 pointer-events-auto max-w-[85%] text-center transition-all hover:border-[#d4ff3a]/60">
        <div className="text-sm font-semibold text-white flex items-center gap-2 max-w-full overflow-hidden">
          <span
            className={`inline-block w-2 h-2 rounded-full bg-[#d4ff3a] shadow-[0_0_8px_#d4ff3a] ${
              isPlaying ? 'animate-pulse' : 'opacity-60'
            }`}
          />
          <span className="truncate">{trackTitle || 'Waiting for playback'}</span>
        </div>
        {trackArtist && (
          <div className="text-xs text-neutral-400 truncate max-w-full">{trackArtist}</div>
        )}
      </div>
    </div>
  );
};
