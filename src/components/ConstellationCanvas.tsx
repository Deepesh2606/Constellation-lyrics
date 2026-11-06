import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  ConstellationNode,
  AmbientStar,
  ParsedLine,
  ConstellationSettings,
  DEFAULT_SETTINGS,
  FONT_FAMILY_MAP,
} from '../types';
import { buildConstellationLayout, generateAmbientStars } from '../utils/constellationLayout';
import {
  Navigation,
  ZoomIn,
  ZoomOut,
  Sparkles,
  Play,
  Pause,
  SkipForward,
  Search,
  Sliders,
  Music2,
  Pin,
} from 'lucide-react';

interface ConstellationCanvasProps {
  parsedLines: ParsedLine[];
  currentTimeMs: number;
  durationMs?: number;
  isPlaying: boolean;
  trackTitle: string;
  trackArtist: string;
  coverUrl?: string;
  trackAlbum?: string;
  isLoadingLyrics: boolean;
  errorLyrics: string | null;
  settings?: ConstellationSettings;
  onWordClick?: (timeMs: number) => void;
  onTogglePlay?: () => void;
  onNextTrack?: () => void;
  onOpenSearch?: () => void;
  onOpenSettings?: () => void;
  onOpenExport?: () => void;
}

export interface LinearCirclePos {
  x: number;
  y: number;
  activeIndex: number;
  activeLineIndex: number;
  progress: number;
  currNode: ConstellationNode;
  nextNode: ConstellationNode | null;
}

export function computeLinearCirclePos(
  nodes: ConstellationNode[],
  timeMs: number
): LinearCirclePos | null {
  if (!nodes || nodes.length === 0) return null;

  // Before first word
  if (timeMs <= nodes[0].startTime) {
    return {
      x: nodes[0].x,
      y: nodes[0].y,
      activeIndex: 0,
      activeLineIndex: nodes[0].lineIndex,
      progress: 0,
      currNode: nodes[0],
      nextNode: nodes[1] || null,
    };
  }

  const lastNode = nodes[nodes.length - 1];
  // After last word
  if (timeMs >= lastNode.endTime) {
    return {
      x: lastNode.x,
      y: lastNode.y,
      activeIndex: nodes.length - 1,
      activeLineIndex: lastNode.lineIndex,
      progress: 1,
      currNode: lastNode,
      nextNode: null,
    };
  }

  // Find the exact interval
  for (let i = 0; i < nodes.length; i++) {
    const curr = nodes[i];
    const next = nodes[i + 1];

    if (!next) {
      return {
        x: curr.x,
        y: curr.y,
        activeIndex: i,
        activeLineIndex: curr.lineIndex,
        progress: 1,
        currNode: curr,
        nextNode: null,
      };
    }

    if (timeMs >= curr.startTime && timeMs < next.startTime) {
      const duration = next.startTime - curr.startTime;
      if (duration <= 0) {
        return {
          x: curr.x,
          y: curr.y,
          activeIndex: i,
          activeLineIndex: curr.lineIndex,
          progress: 0,
          currNode: curr,
          nextNode: next,
        };
      }

      // Check for pause / instrumental break between lines
      const interLineGap = next.startTime - curr.endTime;
      let progress = 0;

      if (interLineGap > 1200) {
        if (timeMs <= curr.endTime) {
          // Still singing current line's final word
          progress = 0;
        } else if (timeMs < next.startTime - 900) {
          // In the middle of an instrumental break, rest at curr
          progress = 0;
        } else {
          // Final 900ms lead-in right before the next line starts: glide linearly to next!
          const leadProgress = (timeMs - (next.startTime - 900)) / 900;
          progress = Math.max(0, Math.min(1, leadProgress));
        }
      } else {
        // Standard contiguous linear progression between words:
        progress = Math.max(0, Math.min(1, (timeMs - curr.startTime) / duration));
      }

      const x = curr.x + (next.x - curr.x) * progress;
      const y = curr.y + (next.y - curr.y) * progress;

      return {
        x,
        y,
        activeIndex: i,
        activeLineIndex: curr.lineIndex,
        progress,
        currNode: curr,
        nextNode: next,
      };
    }
  }

  return {
    x: lastNode.x,
    y: lastNode.y,
    activeIndex: nodes.length - 1,
    activeLineIndex: lastNode.lineIndex,
    progress: 1,
    currNode: lastNode,
    nextNode: null,
  };
}

export const ConstellationCanvas: React.FC<ConstellationCanvasProps> = ({
  parsedLines,
  currentTimeMs,
  isPlaying,
  trackTitle,
  trackArtist,
  coverUrl,
  trackAlbum,
  isLoadingLyrics,
  errorLyrics,
  settings = DEFAULT_SETTINGS,
  onWordClick,
  onTogglePlay,
  onNextTrack,
  onOpenSearch,
  onOpenSettings,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const beaconGroupRef = useRef<SVGGElement>(null);
  const progressLineRef = useRef<SVGLineElement>(null);

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

  // Draggable & Resizable Now Playing iOS Widget position & size
  const [isPinned, setIsPinned] = useState(() => {
    try {
      const saved = localStorage.getItem('constellation_pin_title');
      return saved !== null ? saved === 'true' : true;
    } catch (e) {
      return true;
    }
  });
  const [isWidgetLocked, setIsWidgetLocked] = useState(() => {
    try {
      return localStorage.getItem('constellation_widget_locked') === 'true';
    } catch (e) {
      return false;
    }
  });

  const [widgetPos, setWidgetPos] = useState<{ x: number; y: number }>(() => {
    try {
      const saved = localStorage.getItem('constellation_widget_pos');
      if (saved) {
        const p = JSON.parse(saved);
        if (typeof p.x === 'number' && typeof p.y === 'number') return p;
      }
    } catch (e) {}
    return { x: 24, y: 24 };
  });

  const [widgetSize, setWidgetSize] = useState<{ width: number; height: number }>(() => {
    try {
      const saved = localStorage.getItem('constellation_widget_size');
      if (saved) {
        const p = JSON.parse(saved);
        if (typeof p.width === 'number' && typeof p.height === 'number') {
          return {
            width: Math.max(260, Math.min(850, p.width)),
            height: Math.max(76, Math.min(480, p.height)),
          };
        }
      }
    } catch (e) {}
    return { width: 390, height: 96 };
  });

  const [isDraggingWidget, setIsDraggingWidget] = useState(false);
  const [isResizingWidget, setIsResizingWidget] = useState(false);
  const widgetDragStartRef = useRef({ mouseX: 0, mouseY: 0, origX: 24, origY: 24 });
  const widgetResizeStartRef = useRef({ mouseX: 0, mouseY: 0, origWidth: 390, origHeight: 96 });
  const widgetMovedRef = useRef(false);

  const cycleWidgetSize = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const sizes = [
      { width: 330, height: 86 },
      { width: 400, height: 98 },
      { width: 480, height: 146 },
      { width: 560, height: 180 },
    ];
    let nextIdx = 0;
    if (widgetSize.height < 92) nextIdx = 1;
    else if (widgetSize.height < 120) nextIdx = 2;
    else if (widgetSize.height < 165) nextIdx = 3;
    else nextIdx = 0;

    const next = sizes[nextIdx];
    setWidgetSize(next);
    try {
      localStorage.setItem('constellation_widget_size', JSON.stringify(next));
    } catch (err) {}
  };

  const handleWidgetMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    if (isWidgetLocked) return;
    if ((e.target as HTMLElement).closest('.pinned-play-btn') || (e.target as HTMLElement).closest('.pinned-pin-btn') || (e.target as HTMLElement).closest('.widget-resize-handle')) return;
    e.stopPropagation();
    widgetDragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      origX: widgetPos.x,
      origY: widgetPos.y,
    };
    widgetMovedRef.current = false;
    setIsDraggingWidget(true);

    const onMouseMove = (me: MouseEvent) => {
      const dx = me.clientX - widgetDragStartRef.current.mouseX;
      const dy = me.clientY - widgetDragStartRef.current.mouseY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        widgetMovedRef.current = true;
      }
      const containerW = containerRef.current?.clientWidth || window.innerWidth;
      const containerH = containerRef.current?.clientHeight || window.innerHeight;
      const maxX = Math.max(16, containerW - widgetSize.width - 12);
      const maxY = Math.max(16, containerH - widgetSize.height - 12);
      const nextX = Math.max(12, Math.min(maxX, widgetDragStartRef.current.origX + dx));
      const nextY = Math.max(12, Math.min(maxY, widgetDragStartRef.current.origY + dy));
      setWidgetPos({ x: nextX, y: nextY });
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      setIsDraggingWidget(false);
      setWidgetPos((curr) => {
        try {
          localStorage.setItem('constellation_widget_pos', JSON.stringify(curr));
        } catch (err) {}
        return curr;
      });
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleWidgetTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    if (isWidgetLocked) return;
    if ((e.target as HTMLElement).closest('.pinned-play-btn') || (e.target as HTMLElement).closest('.pinned-pin-btn') || (e.target as HTMLElement).closest('.widget-resize-handle')) return;
    e.stopPropagation();
    const touch = e.touches[0];
    widgetDragStartRef.current = {
      mouseX: touch.clientX,
      mouseY: touch.clientY,
      origX: widgetPos.x,
      origY: widgetPos.y,
    };
    widgetMovedRef.current = false;
    setIsDraggingWidget(true);

    const onTouchMove = (me: TouchEvent) => {
      if (me.touches.length !== 1) return;
      me.preventDefault();
      const t = me.touches[0];
      const dx = t.clientX - widgetDragStartRef.current.mouseX;
      const dy = t.clientY - widgetDragStartRef.current.mouseY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        widgetMovedRef.current = true;
      }
      const containerW = containerRef.current?.clientWidth || window.innerWidth;
      const containerH = containerRef.current?.clientHeight || window.innerHeight;
      const maxX = Math.max(16, containerW - widgetSize.width - 12);
      const maxY = Math.max(16, containerH - widgetSize.height - 12);
      const nextX = Math.max(12, Math.min(maxX, widgetDragStartRef.current.origX + dx));
      const nextY = Math.max(12, Math.min(maxY, widgetDragStartRef.current.origY + dy));
      setWidgetPos({ x: nextX, y: nextY });
    };

    const onTouchEnd = () => {
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      setIsDraggingWidget(false);
      setWidgetPos((curr) => {
        try {
          localStorage.setItem('constellation_widget_pos', JSON.stringify(curr));
        } catch (err) {}
        return curr;
      });
    };

    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);
  };

  const handleWidgetResizeMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    e.preventDefault();
    widgetResizeStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      origWidth: widgetSize.width,
      origHeight: widgetSize.height,
    };
    setIsResizingWidget(true);

    const onMouseMove = (me: MouseEvent) => {
      const dx = me.clientX - widgetResizeStartRef.current.mouseX;
      const dy = me.clientY - widgetResizeStartRef.current.mouseY;
      const containerW = containerRef.current?.clientWidth || window.innerWidth;
      const containerH = containerRef.current?.clientHeight || window.innerHeight;
      const maxW = containerW - widgetPos.x - 16;
      const maxH = containerH - widgetPos.y - 16;
      const nextW = Math.max(260, Math.min(Math.min(850, maxW), widgetResizeStartRef.current.origWidth + dx));
      const nextH = Math.max(76, Math.min(Math.min(480, maxH), widgetResizeStartRef.current.origHeight + dy));
      setWidgetSize({ width: Math.round(nextW), height: Math.round(nextH) });
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      setIsResizingWidget(false);
      setWidgetSize((curr) => {
        try {
          localStorage.setItem('constellation_widget_size', JSON.stringify(curr));
        } catch (err) {}
        return curr;
      });
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleWidgetResizeTouchStart = (e: React.TouchEvent) => {
    if (!e.touches || e.touches.length !== 1) return;
    e.stopPropagation();
    const t = e.touches[0];
    widgetResizeStartRef.current = {
      mouseX: t.clientX,
      mouseY: t.clientY,
      origWidth: widgetSize.width,
      origHeight: widgetSize.height,
    };
    setIsResizingWidget(true);

    const onTouchMove = (me: TouchEvent) => {
      if (!me.touches || me.touches.length !== 1) return;
      me.preventDefault();
      const touch = me.touches[0];
      const dx = touch.clientX - widgetResizeStartRef.current.mouseX;
      const dy = touch.clientY - widgetResizeStartRef.current.mouseY;
      const containerW = containerRef.current?.clientWidth || window.innerWidth;
      const containerH = containerRef.current?.clientHeight || window.innerHeight;
      const maxW = containerW - widgetPos.x - 16;
      const maxH = containerH - widgetPos.y - 16;
      const nextW = Math.max(260, Math.min(Math.min(850, maxW), widgetResizeStartRef.current.origWidth + dx));
      const nextH = Math.max(76, Math.min(Math.min(480, maxH), widgetResizeStartRef.current.origHeight + dy));
      setWidgetSize({ width: Math.round(nextW), height: Math.round(nextH) });
    };

    const onTouchEnd = () => {
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      setIsResizingWidget(false);
      setWidgetSize((curr) => {
        try {
          localStorage.setItem('constellation_widget_size', JSON.stringify(curr));
        } catch (err) {}
        return curr;
      });
    };

    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);
  };

  // Dynamic font from settings
  const fontInfo = useMemo(() => {
    return FONT_FAMILY_MAP[settings.fontFamily] || FONT_FAMILY_MAP.sans;
  }, [settings.fontFamily]);

  // Star count from settings
  const starCount = useMemo(() => {
    switch (settings.starDensity) {
      case 'off':
        return 0;
      case 'low':
        return 40;
      case 'high':
        return 220;
      case 'medium':
      default:
        return 100;
    }
  }, [settings.starDensity]);

  // Rebuild constellation layout when parsedLines or dimension changes
  useEffect(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const w = rect.width || window.innerWidth || 1000;
    const h = rect.height || window.innerHeight || 700;
    setDimensions({ width: w, height: h });

    const newNodes = buildConstellationLayout(parsedLines, w, h, 56);
    setNodes(newNodes);
    setAmbientStars(generateAmbientStars(starCount, w, h));

    if (newNodes.length > 0) {
      cameraRef.current.x = newNodes[0].x;
      cameraRef.current.y = newNodes[0].y;
      cameraRef.current.targetX = newNodes[0].x;
      cameraRef.current.targetY = newNodes[0].y;
    }
  }, [parsedLines, starCount]);

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

  // Compute active word and active line
  const circlePos = useMemo(() => {
    return computeLinearCirclePos(nodes, currentTimeMs);
  }, [nodes, currentTimeMs]);

  const activeNode = circlePos ? nodes[circlePos.activeIndex] : null;
  const activeLineIdx = circlePos ? circlePos.activeLineIndex : -1;

  // Detect song sections (Intro, Verse, Chorus, Drop, Bridge, Outro)
  const songSections = useMemo(() => {
    if (!parsedLines || parsedLines.length < 3) return [];
    const secs: { name: string; timeMs: number; endTime: number }[] = [];
    const total = durationMs || (parsedLines[parsedLines.length - 1].timeMs + 8000);

    if (parsedLines[0].timeMs > 5000) {
      secs.push({ name: 'Intro', timeMs: 0, endTime: parsedLines[0].timeMs });
    }

    const counts: Record<string, number> = {};
    parsedLines.forEach((l) => {
      const norm = (l.text || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      if (norm.length > 6) counts[norm] = (counts[norm] || 0) + 1;
    });

    let cur = { name: 'Verse 1', timeMs: parsedLines[0].timeMs, endTime: parsedLines[0].endTime };
    let vCount = 1;
    let cCount = 1;

    for (let i = 1; i < parsedLines.length; i++) {
      const line = parsedLines[i];
      const prev = parsedLines[i - 1];
      const norm = (line.text || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const isRepeat = (counts[norm] || 0) > 1;
      const timeGap = line.timeMs - prev.endTime;

      if (timeGap > 4500 || (isRepeat && !cur.name.startsWith('Chorus'))) {
        cur.endTime = prev.endTime;
        secs.push(cur);
        if (isRepeat) {
          cur = { name: `Chorus ${cCount > 1 ? cCount : ''}`.trim(), timeMs: line.timeMs, endTime: line.endTime };
          cCount++;
        } else {
          vCount++;
          cur = { name: `Verse ${vCount}`, timeMs: line.timeMs, endTime: line.endTime };
        }
      } else {
        cur.endTime = line.endTime;
      }
    }
    if (cur) secs.push(cur);
    return secs;
  }, [parsedLines, durationMs]);

  // Current active section
  const activeSection = useMemo(() => {
    if (!songSections || !songSections.length) return null;
    for (let i = 0; i < songSections.length; i++) {
      if (currentTimeMs >= songSections[i].timeMs && currentTimeMs <= songSections[i].endTime) {
        return songSections[i];
      }
    }
    return null;
  }, [songSections, currentTimeMs]);

  // Dynamic Chroma Palette for Popular Verses (Chorus/Drop/Bridge) & Beats
  const activeChroma = useMemo(() => {
    const secName = (activeSection?.name || '').toLowerCase();
    if (secName.includes('chorus')) {
      if (secName.includes('2')) return { primary: '#d946ef', glow: '#a855f7', name: 'Chorus 2' };
      return { primary: '#ff2a85', glow: '#f43f5e', name: 'Chorus' };
    }
    if (secName.includes('drop') || secName.includes('hook')) {
      return { primary: '#ff3366', glow: '#ff0055', name: 'Drop' };
    }
    if (secName.includes('verse 2')) {
      return { primary: '#10b981', glow: '#34d399', name: 'Verse 2' };
    }
    if (secName.includes('verse 3')) {
      return { primary: '#fbbf24', glow: '#f59e0b', name: 'Verse 3' };
    }
    if (secName.includes('bridge') || secName.includes('solo')) {
      return { primary: '#a855f7', glow: '#8b5cf6', name: 'Bridge' };
    }
    return {
      primary: settings.primaryColor,
      glow: settings.glowColor,
      name: activeSection?.name || 'Now Playing',
    };
  }, [activeSection, settings.primaryColor, settings.glowColor]);

  // Ultra-smooth 60/120 FPS continuous linear positioning loop
  useEffect(() => {
    let animId: number;

    const loop = () => {
      animId = requestAnimationFrame(loop);

      if (circlePos) {
        // 1. Direct high-precision transform update on the moving circle beacon
        if (beaconGroupRef.current) {
          beaconGroupRef.current.style.display = 'block';
          beaconGroupRef.current.setAttribute(
            'transform',
            `translate(${circlePos.x.toFixed(2)}, ${circlePos.y.toFixed(2)})`
          );
        }

        // 2. Direct update of linear progress trail line
        if (progressLineRef.current && settings.showProgressTrail && circlePos.progress > 0) {
          progressLineRef.current.style.display = 'block';
          progressLineRef.current.setAttribute('x1', circlePos.currNode.x.toFixed(2));
          progressLineRef.current.setAttribute('y1', circlePos.currNode.y.toFixed(2));
          progressLineRef.current.setAttribute('x2', circlePos.x.toFixed(2));
          progressLineRef.current.setAttribute('y2', circlePos.y.toFixed(2));
        } else if (progressLineRef.current) {
          progressLineRef.current.style.display = 'none';
        }

        // 3. Camera target tracks the moving circle linearly
        if (autoFollow) {
          cameraRef.current.targetX = circlePos.x;
          cameraRef.current.targetY = circlePos.y;
        }
      } else if (beaconGroupRef.current) {
        beaconGroupRef.current.style.display = 'none';
        if (progressLineRef.current) progressLineRef.current.style.display = 'none';
      }

      // Smooth camera lerp
      const smoothness = settings.cameraSmoothness || 0.06;
      cameraRef.current.x += (cameraRef.current.targetX - cameraRef.current.x) * smoothness;
      cameraRef.current.y += (cameraRef.current.targetY - cameraRef.current.y) * smoothness;

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
  }, [autoFollow, circlePos, dimensions, zoomLevel, settings.cameraSmoothness, settings.showProgressTrail]);

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
    if (circlePos) {
      cameraRef.current.targetX = circlePos.x;
      cameraRef.current.targetY = circlePos.y;
    }
  };

  // Glow filter radii based on intensity setting
  const glowStdDev = useMemo(() => {
    switch (settings.glowIntensity) {
      case 'off':
        return 0;
      case 'subtle':
        return 2.4;
      case 'supernova':
        return 8.5;
      case 'hyperdrive':
        return 14.5;
      case 'normal':
      default:
        return 4.8;
    }
  }, [settings.glowIntensity]);

  const hasGlow = settings.glowIntensity !== 'off';

  // Font weight conversion
  const fontWeightNum = useMemo(() => {
    switch (settings.fontWeight) {
      case 'normal':
        return 400;
      case 'medium':
        return 500;
      case 'semibold':
        return 600;
      case 'black':
        return 900;
      case 'bold':
      default:
        return 700;
    }
  }, [settings.fontWeight]);

  return (
    <div
      ref={containerRef}
      id="spicetify-constellation-root"
      className="relative w-full h-full overflow-hidden select-none cursor-grab active:cursor-grabbing transition-colors duration-300"
      style={{ backgroundColor: settings.bgColor, fontFamily: fontInfo.css }}
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
          {/* Dynamic Celestial Primary Glow Filter */}
          <filter id="celestial-glow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation={glowStdDev} result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Super Bloom Aura Filter */}
          <filter id="super-glow" x="-120%" y="-120%" width="340%" height="340%">
            <feGaussianBlur stdDeviation={glowStdDev * 1.8} result="superBlur" />
            <feMerge>
              <feMergeNode in="superBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Word Glow DropShadow Filter */}
          <filter id="word-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow
              dx="0"
              dy="0"
              stdDeviation={glowStdDev * 0.8}
              floodColor={settings.glowColor}
              floodOpacity={hasGlow ? '0.9' : '0'}
            />
          </filter>

          <radialGradient id="nebula-haze" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={settings.primaryColor} stopOpacity="0.06" />
            <stop offset="70%" stopColor={settings.bgColor} stopOpacity="0" />
          </radialGradient>

          <radialGradient id="space-vignette" cx="50%" cy="50%" r="50%">
            <stop offset="65%" stopColor={settings.bgColor} stopOpacity="0" />
            <stop offset="100%" stopColor={settings.bgColor} stopOpacity="0.88" />
          </radialGradient>
        </defs>

        {/* Dynamic Transformed Universe Group */}
        <g id="camera-viewport-group">
          {/* Subtle Dynamic Nebula clouds in background */}
          {circlePos && (
            <circle
              cx={circlePos.x}
              cy={circlePos.y}
              r="440"
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
                  fill={settings.primaryColor}
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

              let lineOpacity = 0.15;
              let strokeColor = `${settings.primaryColor}26`;
              let strokeWidth = 1.1;

              if (node.lineIndex < activeLineIdx - 2) {
                // Fade out older lines
                const age = activeLineIdx - node.lineIndex;
                lineOpacity = Math.max(0.02, 0.14 - age * 0.04);
              } else if (isActiveLine) {
                lineOpacity = 0.95;
                strokeColor = settings.primaryColor;
                strokeWidth = 2.4;
              } else if (isPast) {
                lineOpacity = Math.max(0.25, 0.7 - lineDistFromActive * 0.18);
                strokeColor = `${settings.pastColor}cc`;
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
                  filter={isActiveLine && hasGlow ? 'url(#celestial-glow)' : undefined}
                />
              );
            })}
          </g>

          {/* Linear Progress Trail Line: Traces path linearly between words */}
          {settings.showProgressTrail && (
            <line
              ref={progressLineRef}
              stroke={activeChroma.primary}
              strokeWidth="2.8"
              strokeOpacity="0.95"
              strokeLinecap="round"
              filter={hasGlow ? 'url(#celestial-glow)' : undefined}
              pointerEvents="none"
              style={{ display: 'none' }}
            />
          )}

          {/* ACTIVE CELESTIAL BEACON / MOVING CIRCLE (Glides 100% linearly with time) */}
          <g
            id="active-celestial-beacon"
            ref={beaconGroupRef}
            pointerEvents="none"
            style={{ display: 'none' }}
          >
            {/* 1. Target Reticle Style */}
            {settings.beaconStyle === 'reticle' && (
              <>
                <circle
                  r="18"
                  fill="none"
                  stroke={activeChroma.primary}
                  strokeWidth="1.6"
                  strokeOpacity="0.85"
                  filter={hasGlow ? 'url(#celestial-glow)' : undefined}
                  className="animate-ping"
                />
                <circle
                  r="23"
                  fill="none"
                  stroke={activeChroma.primary}
                  strokeWidth="1"
                  strokeOpacity="0.35"
                />
                <circle
                  r="5.5"
                  fill={activeChroma.primary}
                  filter={hasGlow ? 'url(#celestial-glow)' : undefined}
                />
                <line
                  x1="-14"
                  y1="0"
                  x2="14"
                  y2="0"
                  stroke={activeChroma.primary}
                  strokeWidth="1.4"
                  strokeOpacity="0.9"
                  filter={hasGlow ? 'url(#celestial-glow)' : undefined}
                />
                <line
                  x1="0"
                  y1="-14"
                  x2="0"
                  y2="14"
                  stroke={activeChroma.primary}
                  strokeWidth="1.4"
                  strokeOpacity="0.9"
                  filter={hasGlow ? 'url(#celestial-glow)' : undefined}
                />
              </>
            )}

            {/* 2. Radiant Orb Style */}
            {settings.beaconStyle === 'orb' && (
              <>
                <circle
                  r="22"
                  fill={activeChroma.glow}
                  fillOpacity="0.25"
                  filter={hasGlow ? 'url(#super-glow)' : undefined}
                />
                <circle
                  r="14"
                  fill="none"
                  stroke={activeChroma.primary}
                  strokeWidth="2"
                  strokeOpacity="0.9"
                  filter={hasGlow ? 'url(#celestial-glow)' : undefined}
                  className="animate-pulse"
                />
                <circle
                  r="7.5"
                  fill={activeChroma.primary}
                  filter={hasGlow ? 'url(#celestial-glow)' : undefined}
                />
                <circle r="2.5" fill="#ffffff" />
              </>
            )}

            {/* 3. Pulsing Ring Style */}
            {settings.beaconStyle === 'ring' && (
              <>
                <circle
                  r="16"
                  fill="none"
                  stroke={activeChroma.primary}
                  strokeWidth="2.5"
                  strokeOpacity="0.95"
                  filter={hasGlow ? 'url(#celestial-glow)' : undefined}
                  className="animate-pulse"
                />
                <circle
                  r="24"
                  fill="none"
                  stroke={activeChroma.primary}
                  strokeWidth="1"
                  strokeOpacity="0.25"
                />
                <circle r="4" fill={activeChroma.primary} />
              </>
            )}

            {/* 4. Minimal Star Style */}
            {settings.beaconStyle === 'minimal' && (
              <>
                <circle
                  r="6.5"
                  fill={activeChroma.primary}
                  filter={hasGlow ? 'url(#celestial-glow)' : undefined}
                />
                <circle
                  r="11"
                  fill="none"
                  stroke={activeChroma.primary}
                  strokeWidth="1"
                  strokeOpacity="0.5"
                />
              </>
            )}
          </g>

          {/* Constellation Word Nodes */}
          <g className="constellation-nodes">
            {nodes.map((node, nIdx) => {
              const isWordActive = circlePos?.activeIndex === nIdx;
              const isWordPast = currentTimeMs >= node.endTime;

              let starRadius = 2.4;
              let starOpacity = 0.35;
              let starFill = `${settings.primaryColor}40`;
              let textOpacity = 0.4;
              let textColor = settings.futureColor;
              let wordFontSize = settings.fontSize * 0.9;
              let currentWeight = 400;
              let filterAttr: string | undefined = undefined;

              if (isWordActive) {
                starRadius = 6.8;
                starOpacity = 1.0;
                starFill = activeChroma.primary;
                textOpacity = 1.0;
                textColor = '#ffffff';
                wordFontSize = settings.fontSize * 1.25;
                currentWeight = fontWeightNum;
                filterAttr = hasGlow ? 'url(#celestial-glow)' : undefined;
              } else if (node.lineIndex === activeLineIdx) {
                if (isWordPast) {
                  starRadius = 4.0;
                  starOpacity = 0.9;
                  starFill = settings.pastColor;
                  textOpacity = 0.95;
                  textColor = settings.pastColor;
                  wordFontSize = settings.fontSize;
                  currentWeight = Math.max(500, fontWeightNum - 100);
                } else {
                  // Upcoming words in current line
                  starRadius = 3.2;
                  starOpacity = 0.65;
                  starFill = `${settings.primaryColor}99`;
                  textOpacity = 0.7;
                  textColor = `${settings.primaryColor}cc`;
                  wordFontSize = settings.fontSize * 0.95;
                  currentWeight = 500;
                }
              } else if (node.lineIndex < activeLineIdx) {
                // Older lines fading out
                const age = activeLineIdx - node.lineIndex;
                starOpacity = Math.max(0.04, 0.35 - age * 0.1);
                textOpacity = Math.max(0.04, 0.4 - age * 0.12);
                starFill = `${settings.pastColor}40`;
                textColor = `${settings.pastColor}88`;
                starRadius = 2.2;
              } else {
                // Future upcoming lines
                const distance = node.lineIndex - activeLineIdx;
                starOpacity = Math.max(0.12, 0.35 - distance * 0.08);
                textOpacity = Math.max(0.12, 0.4 - distance * 0.08);
                starFill = `${settings.futureColor}40`;
                textColor = settings.futureColor;
                starRadius = 2.0;
              }

              // Popped look for stream ending words
              const isLineEnd = !!node.isLineEnd;
              if (isLineEnd) {
                if (isWordActive) {
                  starRadius = 8.5;
                  wordFontSize = settings.fontSize * 1.35;
                  currentWeight = 800;
                } else if (node.lineIndex <= activeLineIdx) {
                  starRadius = Math.max(starRadius, 4.8);
                  starOpacity = Math.max(starOpacity, 0.85);
                  textOpacity = Math.max(textOpacity, 0.85);
                  wordFontSize = Math.max(wordFontSize, settings.fontSize * 1.05);
                  currentWeight = Math.max(currentWeight, 700);
                  starFill = settings.primaryColor;
                  textColor = settings.primaryColor;
                }
              }

              return (
                <g
                  key={node.id}
                  className={`cursor-pointer transition-transform duration-150 hover:scale-125 ${isLineEnd ? 'star-node-line-end' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onWordClick?.(node.startTime);
                  }}
                >
                  {/* Popped accent ring for stream-ending word */}
                  {isLineEnd && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={isWordActive ? 15 : 10}
                      fill="none"
                      stroke={settings.primaryColor}
                      strokeWidth={isWordActive ? 2 : 1.2}
                      strokeDasharray={isWordActive ? undefined : '2 2'}
                      opacity={isWordActive ? 1 : 0.45}
                    />
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
                    fontSize={wordFontSize}
                    fontWeight={currentWeight}
                    letterSpacing={`${settings.letterSpacing}em`}
                    opacity={textOpacity}
                    filter={isWordActive && hasGlow ? 'url(#word-glow)' : undefined}
                    className="select-none"
                    style={{
                      textTransform: settings.textTransform,
                      fontFamily: fontInfo.css,
                    }}
                  >
                    {node.text}
                  </text>
                </g>
              );
            })}
          </g>
        </g>

        {/* Outer Vignette gradient overlay */}
        <rect width="100%" height="100%" fill="url(#space-vignette)" pointerEvents="none" />
      </svg>

      {/* Floating Canvas Controls (Top Right) */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-20 pointer-events-auto">
        <button
          onClick={handleRecenter}
          className="px-3 py-1.5 text-xs font-semibold rounded-full flex items-center gap-1.5 transition-all backdrop-blur-md border shadow-sm"
          style={{
            backgroundColor: autoFollow ? `${settings.primaryColor}22` : '#18181bdf',
            borderColor: autoFollow ? settings.primaryColor : '#3f3f46',
            color: autoFollow ? settings.primaryColor : '#d4d4d8',
            boxShadow: autoFollow ? `0 0 12px ${settings.glowColor}40` : undefined,
          }}
          title="Keep camera focused on linearly moving lyrics"
        >
          <Navigation className={`w-3.5 h-3.5 ${autoFollow ? 'rotate-45' : ''}`} />
          {autoFollow ? 'Tracking Synced Lyrics' : 'Recenter Camera'}
        </button>

        <div className="flex items-center bg-neutral-900/90 backdrop-blur-md border border-neutral-700 rounded-full p-0.5">
          <button
            onClick={() => setZoomLevel((z) => Math.min(2.2, z + 0.15))}
            className="p-1.5 text-neutral-300 hover:text-white rounded-full transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-mono text-neutral-300 px-1.5">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.45, z - 0.15))}
            className="p-1.5 text-neutral-300 hover:text-white rounded-full transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Interactive Helper Hint (Top Left) */}
      <div className="absolute top-4 left-4 hidden md:flex items-center gap-2 px-3 py-1.5 bg-neutral-900/80 backdrop-blur-md border border-neutral-800 rounded-full text-[11px] text-neutral-400 pointer-events-none z-20">
        <span
          className="w-1.5 h-1.5 rounded-full shadow-sm"
          style={{ backgroundColor: settings.primaryColor }}
        />
        <span>Click star to seek • Smooth linear sync • Drag to pan</span>
      </div>

      {/* Status Overlay: Loading / Error / Empty state */}
      {isLoadingLyrics && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10 pointer-events-none text-center">
          <div
            className="w-10 h-10 border-2 rounded-full animate-spin shadow-lg"
            style={{
              borderColor: `${settings.primaryColor}33`,
              borderTopColor: settings.primaryColor,
              boxShadow: `0 0 16px ${settings.glowColor}55`,
            }}
          />
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

      {/* Aesthetic Floating iOS Now Playing Widget (Draggable & Resizable) */}
      {isPinned && trackTitle && (() => {
        const isTall = widgetSize.height >= 125;
        const artSize = isTall
          ? Math.max(54, Math.min(84, widgetSize.height - 48))
          : Math.max(50, Math.min(68, widgetSize.height - 24));
        const duration = durationMs || 180000;
        const progressPct = Math.max(0, Math.min(100, (currentTimeMs / duration) * 100));

        return (
          <div
            onMouseDown={handleWidgetMouseDown}
            onTouchStart={handleWidgetTouchStart}
            className={`absolute z-30 flex flex-col justify-center px-4 py-3 rounded-[26px] backdrop-blur-2xl bg-[#0c0e18]/88 border border-white/15 select-none transition-[box-shadow,border-color,background] touch-none overflow-hidden ${
              isDraggingWidget
                ? 'cursor-grabbing scale-[1.025] border-white/35 shadow-[0_38px_85px_rgba(0,0,0,0.92)]'
                : isResizingWidget
                ? 'cursor-nwse-resize border-white/40 shadow-[0_36px_85px_rgba(0,0,0,0.9)]'
                : 'cursor-grab hover:border-white/25 shadow-[0_22px_55px_rgba(0,0,0,0.72)]'
            }`}
            style={{
              left: widgetPos.x,
              top: widgetPos.y,
              width: widgetSize.width,
              height: widgetSize.height,
              boxShadow: isDraggingWidget || isResizingWidget
                ? `0 36px 85px rgba(0,0,0,0.92), 0 0 45px ${activeChroma.glow}50, inset 0 1px 2px rgba(255,255,255,0.35)`
                : `0 22px 55px rgba(0,0,0,0.72), 0 0 35px ${activeChroma.glow}25, inset 0 1px 1.5px rgba(255,255,255,0.2)`,
            }}
            title={`${trackTitle} by ${trackArtist}${trackAlbum ? ` (${trackAlbum})` : ''} • Drag to move • Drag corner to resize • Double click pill to cycle sizes`}
          >
            {/* iOS Top Drag Pill (Double-click cycles preset widget sizes) */}
            <div
              onDoubleClick={cycleWidgetSize}
              className="absolute top-1.5 left-1/2 -translate-x-1/2 w-9 h-1 rounded-full bg-white/25 cursor-pointer transition-all hover:bg-white/55 hover:w-12 z-10"
              title="Double-click to cycle widget sizes"
            />

            {/* Main horizontal row: Art + Texts + Pin & Play Controls */}
            <div className="flex items-center gap-3.5 w-full h-full">
              {/* Cover Art with Gloss Sheen & Glow */}
              <div
                className="relative rounded-[18px] overflow-hidden shrink-0 shadow-lg border border-white/15 bg-neutral-900 transition-all"
                style={{ width: artSize, height: artSize }}
              >
                {coverUrl ? (
                  <img src={coverUrl} alt={trackTitle} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-white/5 flex items-center justify-center">
                    <Music2 className="w-6 h-6" style={{ color: activeChroma.primary }} />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Texts & Equalizer */}
              <div className="flex flex-col min-w-0 pr-1 flex-1 overflow-hidden">
                <div className="flex items-center gap-2 mb-0.5">
                  <span
                    className="text-[10px] font-black uppercase tracking-widest transition-colors"
                    style={{
                      color: activeChroma.primary,
                      textShadow: `0 0 10px ${activeChroma.glow}88`,
                    }}
                  >
                    {activeChroma.name.toUpperCase()}
                  </span>
                  {isPlaying && (
                    <div className="flex items-end gap-0.5 h-3">
                      <span className="w-0.5 h-1 rounded-full animate-bounce" style={{ backgroundColor: activeChroma.primary }} />
                      <span className="w-0.5 h-3 rounded-full animate-bounce [animation-delay:0.15s]" style={{ backgroundColor: activeChroma.primary }} />
                      <span className="w-0.5 h-2 rounded-full animate-bounce [animation-delay:0.3s]" style={{ backgroundColor: activeChroma.primary }} />
                      <span className="w-0.5 h-2.5 rounded-full animate-bounce [animation-delay:0.45s]" style={{ backgroundColor: activeChroma.primary }} />
                    </div>
                  )}
                  <span className="ml-auto text-[9px] font-bold text-white/30 tracking-wider uppercase">
                    {isWidgetLocked ? '🔒 Locked' : '⠿ Drag'}
                  </span>
                </div>
                <div className="text-[16px] font-black text-white truncate max-w-[240px] sm:max-w-xs leading-tight tracking-tight">
                  {trackTitle}
                </div>
                <div className="text-[12.5px] text-neutral-300 truncate max-w-[240px] sm:max-w-xs font-semibold leading-snug">
                  {trackArtist}
                  {trackAlbum && trackAlbum !== trackTitle && (
                    <span className="text-neutral-500 text-[11px] font-normal ml-1.5">• {trackAlbum}</span>
                  )}
                </div>
              </div>

              {/* Pin / Lock Button on Badge */}
              <button
                type="button"
                className={`pinned-pin-btn w-8 h-8 rounded-full flex items-center justify-center border transition-all hover:scale-105 active:scale-95 shrink-0 ml-1 cursor-pointer ${
                  isWidgetLocked
                    ? 'bg-white/20 border-white/30 text-white'
                    : 'bg-white/5 border-white/10 text-white/50 hover:text-white'
                }`}
                style={isWidgetLocked ? { color: activeChroma.primary, borderColor: `${activeChroma.primary}88` } : {}}
                title={isWidgetLocked ? 'Unpin / Unlock Position' : 'Pin / Lock Position'}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsWidgetLocked((curr) => {
                    const next = !curr;
                    try { localStorage.setItem('constellation_widget_locked', String(next)); } catch (err) {}
                    return next;
                  });
                }}
              >
                <Pin className={`w-3.5 h-3.5 ${isWidgetLocked ? 'fill-current' : ''}`} />
              </button>

              {/* Quick Play/Pause Action Button */}
              {onTogglePlay && (
                <button
                  type="button"
                  className="pinned-play-btn w-9 h-9 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 border border-white/15 text-white transition-all hover:scale-105 active:scale-95 shrink-0 ml-1 cursor-pointer"
                  title={isPlaying ? 'Pause' : 'Play'}
                  onClick={(e) => {
                    e.stopPropagation();
                    onTogglePlay();
                  }}
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 fill-current" />
                  ) : (
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  )}
                </button>
              )}
            </div>

            {/* Scrubber row when widget is elongated taller */}
            {isTall && (
              <div className="w-full flex flex-col gap-1 mt-2 pointer-events-none">
                <div className="w-full h-1 bg-white/15 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-[width] duration-150"
                    style={{
                      width: `${progressPct}%`,
                      backgroundColor: activeChroma.primary,
                      boxShadow: `0 0 8px ${activeChroma.glow}`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-[9.5px] font-semibold text-white/45 tabular-nums">
                  <span>{Math.floor(currentTimeMs / 60000)}:{Math.floor((currentTimeMs % 60000) / 1000).toString().padStart(2, '0')}</span>
                  <span>{Math.floor(duration / 60000)}:{Math.floor((duration % 60000) / 1000).toString().padStart(2, '0')}</span>
                </div>
              </div>
            )}

            {/* Corner Resize Handle (Drag to freely elongate width or increase height) */}
            <div
              onMouseDown={handleWidgetResizeMouseDown}
              onTouchStart={handleWidgetResizeTouchStart}
              className="absolute bottom-1 right-1 w-4 h-4 cursor-nwse-resize flex items-center justify-center text-white/35 hover:text-white hover:scale-125 transition-all z-20"
              title="Drag to resize height & width"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                <circle cx="8.5" cy="1.5" r="1" />
                <circle cx="8.5" cy="5" r="1" />
                <circle cx="8.5" cy="8.5" r="1" />
                <circle cx="5" cy="5" r="1" />
                <circle cx="5" cy="8.5" r="1" />
                <circle cx="1.5" cy="8.5" r="1" />
              </svg>
            </div>
          </div>
        );
      })()}

      {/* Track Info & Interactive Player Pill (Floating on Canvas) */}
      <div
        className="constellation-bottom-bar absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-5 py-2.5 bg-neutral-950/90 backdrop-blur-xl border rounded-full shadow-2xl z-20 pointer-events-auto max-w-[90%] transition-all"
        style={{
          borderColor: `${settings.primaryColor}55`,
          boxShadow: `0 8px 32px rgba(0,0,0,0.8), 0 0 16px ${settings.glowColor}25`,
        }}
      >
        {/* Cover Art in bottom bar */}
        {coverUrl && (
          <img
            src={coverUrl}
            alt=""
            className="w-8 h-8 rounded-lg object-cover shrink-0 border border-white/15 shadow-sm"
          />
        )}

        {/* On-Canvas Play/Pause Button */}
        {onTogglePlay && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTogglePlay();
            }}
            className="w-8 h-8 rounded-full text-black flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-md shrink-0 font-bold"
            style={{
              backgroundColor: settings.primaryColor,
              boxShadow: `0 0 12px ${settings.glowColor}66`,
            }}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-current text-black" />
            ) : (
              <Play className="w-4 h-4 fill-current text-black ml-0.5" />
            )}
          </button>
        )}

        {/* Track Title and Artist */}
        <div className="flex flex-col overflow-hidden max-w-[220px] sm:max-w-xs">
          <div className="text-xs sm:text-sm font-semibold text-white truncate flex items-center gap-1.5">
            <span
              className={`inline-block w-2 h-2 rounded-full shrink-0 ${
                isPlaying ? 'animate-pulse' : 'opacity-60'
              }`}
              style={{
                backgroundColor: settings.primaryColor,
                boxShadow: `0 0 6px ${settings.glowColor}`,
              }}
            />
            <span className="truncate">{trackTitle || 'Waiting for playback'}</span>
          </div>
          {trackArtist && (
            <div className="text-[11px] text-neutral-400 truncate pl-3.5">{trackArtist}</div>
          )}
        </div>

        {/* Skip to Next Song shortcut */}
        {onNextTrack && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNextTrack();
            }}
            className="p-1.5 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800 transition-colors"
            title="Next Song"
          >
            <SkipForward className="w-4 h-4 fill-current" />
          </button>
        )}

        {/* Pin Title Island Toggle (Replaces any reload/close buttons) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsPinned((curr) => {
              const next = !curr;
              try {
                localStorage.setItem('constellation_pin_title', String(next));
              } catch (err) {}
              return next;
            });
          }}
          className={`p-1.5 rounded-full hover:bg-neutral-800 transition-colors ${
            isPinned ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'
          }`}
          style={isPinned ? { color: activeChroma.primary } : {}}
          title={isPinned ? 'Unpin Floating Title Island' : 'Pin Floating Title Island'}
        >
          <Pin className={`w-4 h-4 ${isPinned ? 'fill-current' : ''}`} />
        </button>

        {/* Search Songs shortcut */}
        {onOpenSearch && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenSearch();
            }}
            className="p-1.5 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800 transition-colors"
            title="Search Song Lyrics"
          >
            <Search className="w-4 h-4" />
          </button>
        )}

        {/* Settings Button Shortcut */}
        {onOpenSettings && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenSettings();
            }}
            className="p-1.5 rounded-full hover:bg-neutral-800 transition-colors"
            style={{ color: settings.primaryColor }}
            title="Open Constellation Visual Settings"
          >
            <Sliders className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
