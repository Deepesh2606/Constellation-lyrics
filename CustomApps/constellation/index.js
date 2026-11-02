// Spicetify Custom App: Constellation
// Synced lyrics constellation animation on #0a0a0a with #d4ff3a lime glow

(function () {
  const APP_NAME = "constellation";
  const BG_COLOR = "#0a0a0a";
  const LIME_COLOR = "#d4ff3a";
  const LIME_FAINT = "rgba(212, 255, 58, 0.15)";
  const LIME_BRIGHT = "rgba(212, 255, 58, 0.9)";
  const MIN_WORD_DISTANCE = 56;

  // In-memory lyrics cache per track URI
  const lyricsCache = new Map();

  // Root container & state
  let appContainer = null;
  let animFrameId = null;
  let currentUri = null;
  let parsedLyrics = null;
  let constellationNodes = [];
  let isFetching = false;
  let fetchError = null;
  let currentTrackInfo = { title: "", artist: "", album: "", durationMs: 0 };

  // Camera viewport tracking
  let camera = { x: 0, y: 0, scale: 1, targetX: 0, targetY: 0 };
  let ambientStars = [];

  // Scoped CSS styles
  const STYLE_ID = "constellation-scoped-styles";
  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const styleEl = document.createElement("style");
    styleEl.id = STYLE_ID;
    styleEl.textContent = `
      #spicetify-constellation-root {
        position: relative;
        width: 100%;
        height: 100%;
        min-height: 100%;
        background-color: ${BG_COLOR};
        color: #e5e7eb;
        overflow: hidden;
        user-select: none;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        box-sizing: border-box;
      }
      #spicetify-constellation-root * {
        box-sizing: border-box;
      }
      #spicetify-constellation-root .constellation-svg {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: block;
      }
      #spicetify-constellation-root .constellation-bottom-bar {
        position: absolute;
        bottom: 24px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        padding: 12px 24px;
        background: rgba(15, 15, 15, 0.75);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid rgba(212, 255, 58, 0.2);
        border-radius: 9999px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6), 0 0 16px rgba(212, 255, 58, 0.1);
        z-index: 10;
        pointer-events: auto;
        max-width: 85%;
        text-align: center;
        transition: border-color 0.3s ease;
      }
      #spicetify-constellation-root .constellation-bottom-bar:hover {
        border-color: rgba(212, 255, 58, 0.45);
      }
      #spicetify-constellation-root .track-title {
        font-size: 14px;
        font-weight: 600;
        color: #ffffff;
        display: flex;
        align-items: center;
        gap: 8px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      #spicetify-constellation-root .track-artist {
        font-size: 12px;
        color: #a3a3a3;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      #spicetify-constellation-root .track-badge {
        display: inline-block;
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background-color: ${LIME_COLOR};
        box-shadow: 0 0 8px ${LIME_COLOR};
        animation: constellation-pulse 2s infinite;
      }
      #spicetify-constellation-root .constellation-status-banner {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        color: #9ca3af;
        font-size: 15px;
        letter-spacing: 0.05em;
        pointer-events: none;
        text-align: center;
        z-index: 5;
      }
      #spicetify-constellation-root .constellation-status-banner .glow-icon {
        color: ${LIME_COLOR};
        filter: drop-shadow(0 0 10px rgba(212, 255, 58, 0.6));
      }
      @keyframes constellation-pulse {
        0%, 100% { opacity: 0.6; transform: scale(0.9); }
        50% { opacity: 1; transform: scale(1.2); }
      }
    `;
    document.head.appendChild(styleEl);
  }

  // LRC Parser
  function parseLrc(lrcText) {
    if (!lrcText || typeof lrcText !== "string") return [];
    const lines = lrcText.split("\n");
    const parsed = [];
    const timeRegex = /\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\]/g;

    for (const rawLine of lines) {
      const trimmed = rawLine.trim();
      if (!trimmed) continue;
      const matches = [...trimmed.matchAll(timeRegex)];
      if (!matches.length) continue;
      const text = trimmed.replace(timeRegex, "").trim();
      if (!text) continue;

      for (const m of matches) {
        const min = parseInt(m[1], 10);
        const sec = parseInt(m[2], 10);
        let ms = 0;
        if (m[3]) {
          ms = m[3].length === 2 ? parseInt(m[3], 10) * 10 : parseInt(m[3], 10);
        }
        const timeMs = min * 60000 + sec * 1000 + ms;
        parsed.push({ timeMs, text });
      }
    }

    parsed.sort((a, b) => a.timeMs - b.timeMs);

    // Spread timestamps across words for each line
    return parsed.map((item, idx) => {
      const nextTime = idx < parsed.length - 1 ? parsed[idx + 1].timeMs : item.timeMs + 4000;
      const lineDuration = Math.max(1200, Math.min(nextTime - item.timeMs, 8000));
      const words = item.text.split(/\s+/).filter(Boolean);
      const wordCount = words.length || 1;

      const timedWords = words.map((w, wIdx) => {
        const wordStart = item.timeMs + (wIdx / wordCount) * lineDuration;
        const wordEnd = item.timeMs + ((wIdx + 1) / wordCount) * lineDuration;
        return {
          text: w,
          startTime: wordStart,
          endTime: wordEnd,
          duration: wordEnd - wordStart
        };
      });

      return {
        lineIndex: idx,
        timeMs: item.timeMs,
        endTime: nextTime,
        text: item.text,
        words: timedWords
      };
    });
  }

  // Generate constellation layout with minimum distance between stars
  function buildConstellationLayout(lines, width, height) {
    const nodes = [];
    if (!lines || !lines.length) return nodes;

    const placedPoints = [];
    const checkMinDistance = (x, y, minDist) => {
      for (const p of placedPoints) {
        const dx = p.x - x;
        const dy = p.y - y;
        if (dx * dx + dy * dy < minDist * minDist) {
          return false;
        }
      }
      return true;
    };

    const centerX = width / 2;
    const centerY = height / 2;

    // Arrange lines in celestial clusters / serpentine galaxy trail
    let currentClusterX = centerX;
    let currentClusterY = centerY;
    let clusterAngle = Math.random() * Math.PI * 2;

    lines.forEach((line, lIdx) => {
      // Step cluster forward
      const clusterStep = 180 + Math.random() * 90;
      clusterAngle += (Math.random() - 0.5) * 1.2;
      currentClusterX += Math.cos(clusterAngle) * clusterStep;
      currentClusterY += Math.sin(clusterAngle) * clusterStep;

      const lineNodes = [];
      let lastX = currentClusterX;
      let lastY = currentClusterY;
      let lineAngle = clusterAngle + (Math.random() - 0.5) * 0.8;

      line.words.forEach((wordObj, wIdx) => {
        let bestX = lastX;
        let bestY = lastY;
        let found = false;

        // Try candidate offsets from previous word in the line
        for (let attempt = 0; attempt < 24; attempt++) {
          const dist = 75 + Math.random() * 65;
          const deltaAngle = (Math.random() - 0.5) * (Math.PI * 0.75);
          const candAngle = lineAngle + deltaAngle;
          const candX = (wIdx === 0 ? currentClusterX : lastX) + Math.cos(candAngle) * dist;
          const candY = (wIdx === 0 ? currentClusterY : lastY) + Math.sin(candAngle) * dist;

          if (checkMinDistance(candX, candY, MIN_WORD_DISTANCE)) {
            bestX = candX;
            bestY = candY;
            lineAngle = candAngle;
            found = true;
            break;
          }
        }

        if (!found) {
          const fallbackDist = 80;
          bestX = lastX + Math.cos(lineAngle) * fallbackDist;
          bestY = lastY + Math.sin(lineAngle) * fallbackDist;
        }

        placedPoints.push({ x: bestX, y: bestY });
        lastX = bestX;
        lastY = bestY;

        const node = {
          id: `node-${lIdx}-${wIdx}`,
          lineIndex: lIdx,
          wordIndex: wIdx,
          text: wordObj.text,
          startTime: wordObj.startTime,
          endTime: wordObj.endTime,
          x: bestX,
          y: bestY,
          prevNode: wIdx > 0 ? lineNodes[wIdx - 1] : null
        };
        lineNodes.push(node);
        nodes.push(node);
      });
    });

    return nodes;
  }

  // Generate ambient background twinkling stars
  function generateAmbientStars(count, width, height) {
    const stars = [];
    const spread = Math.max(width, height) * 3;
    for (let i = 0; i < count; i++) {
      stars.push({
        x: (Math.random() - 0.5) * spread,
        y: (Math.random() - 0.5) * spread,
        r: Math.random() * 1.5 + 0.5,
        baseOpacity: Math.random() * 0.4 + 0.1,
        speed: Math.random() * 0.002 + 0.001,
        phase: Math.random() * Math.PI * 2
      });
    }
    return stars;
  }

  // Fetch lyrics from LRCLIB using plain fetch
  async function fetchLyrics(track, artist, album, durationSeconds, uri) {
    if (lyricsCache.has(uri)) {
      return lyricsCache.get(uri);
    }

    isFetching = true;
    fetchError = null;
    updateStatusDisplay();

    try {
      // 1. Direct get endpoint
      const params = new URLSearchParams();
      if (track) params.append("track_name", track);
      if (artist) params.append("artist_name", artist);
      if (album) params.append("album_name", album);
      if (durationSeconds) params.append("duration", durationSeconds);

      const getUrl = `https://lrclib.net/api/get?${params.toString()}`;
      let response = await fetch(getUrl);

      if (response.ok) {
        const data = await response.json();
        if (data && data.syncedLyrics) {
          lyricsCache.set(uri, data.syncedLyrics);
          isFetching = false;
          return data.syncedLyrics;
        }
      }

      // 2. Fallback to search endpoint
      const searchQuery = `${artist || ""} ${track || ""}`.trim();
      if (searchQuery) {
        const searchUrl = `https://lrclib.net/api/search?q=${encodeURIComponent(searchQuery)}`;
        response = await fetch(searchUrl);
        if (response.ok) {
          const list = await response.json();
          if (Array.isArray(list) && list.length > 0) {
            const hit = list.find((item) => item.syncedLyrics) || list[0];
            if (hit && hit.syncedLyrics) {
              lyricsCache.set(uri, hit.syncedLyrics);
              isFetching = false;
              return hit.syncedLyrics;
            }
          }
        }
      }

      isFetching = false;
      fetchError = "No lyrics found";
      updateStatusDisplay();
      return null;
    } catch (err) {
      console.error("[Constellation] Lyrics fetch error:", err);
      isFetching = false;
      fetchError = "Error loading lyrics";
      updateStatusDisplay();
      return null;
    }
  }

  // Extract track data safely from Spicetify.Player
  function getTrackInfo() {
    if (!window.Spicetify || !window.Spicetify.Player) {
      return null;
    }
    const data = window.Spicetify.Player.data;
    if (!data) return null;

    const item = data.item || data.track;
    if (!item) return null;

    const title = item.name || item.metadata?.title || "";
    let artist = "";
    if (Array.isArray(item.artists)) {
      artist = item.artists.map((a) => a.name).join(", ");
    } else if (item.metadata?.artist_name) {
      artist = item.metadata.artist_name;
    }

    const album = item.album?.name || item.metadata?.album_title || "";
    const durationMs = item.duration?.milliseconds || item.metadata?.duration || 0;
    const uri = item.uri || item.metadata?.uri || `${title}-${artist}`;

    return { title, artist, album, durationMs, uri };
  }

  // Update track on song change
  async function handleSongChange() {
    const info = getTrackInfo();
    if (!info || !info.title) {
      currentTrackInfo = { title: "Waiting for playback", artist: "", album: "", durationMs: 0 };
      updateStatusDisplay();
      return;
    }

    if (info.uri === currentUri && parsedLyrics) {
      return;
    }

    currentUri = info.uri;
    currentTrackInfo = info;
    updateStatusDisplay();

    const durationSec = Math.round(info.durationMs / 1000);
    const lrc = await fetchLyrics(info.title, info.artist, info.album, durationSec, info.uri);

    if (lrc) {
      parsedLyrics = parseLrc(lrc);
      rebuildConstellation();
    } else {
      parsedLyrics = null;
      constellationNodes = [];
      renderSvgScene();
    }
    updateStatusDisplay();
  }

  function rebuildConstellation() {
    if (!appContainer) return;
    const rect = appContainer.getBoundingClientRect();
    const width = rect.width || window.innerWidth || 1000;
    const height = rect.height || window.innerHeight || 700;

    constellationNodes = buildConstellationLayout(parsedLyrics, width, height);
    ambientStars = generateAmbientStars(80, width, height);

    if (constellationNodes.length > 0) {
      camera.x = constellationNodes[0].x;
      camera.y = constellationNodes[0].y;
      camera.targetX = constellationNodes[0].x;
      camera.targetY = constellationNodes[0].y;
    }
  }

  // DOM update for bottom bar and banners
  function updateStatusDisplay() {
    if (!appContainer) return;

    const titleEl = appContainer.querySelector(".track-title-text");
    const artistEl = appContainer.querySelector(".track-artist");
    const bannerEl = appContainer.querySelector(".constellation-status-banner");

    if (titleEl) {
      titleEl.textContent = currentTrackInfo.title || "No track playing";
    }
    if (artistEl) {
      artistEl.textContent = currentTrackInfo.artist || "";
    }

    if (bannerEl) {
      if (isFetching) {
        bannerEl.style.display = "flex";
        bannerEl.innerHTML = `
          <div class="glow-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" stroke-opacity="0.3"></circle>
              <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path>
            </svg>
          </div>
          <div>Mapping celestial lyrics...</div>
        `;
      } else if (fetchError || (!parsedLyrics && currentTrackInfo.title)) {
        bannerEl.style.display = "flex";
        bannerEl.innerHTML = `
          <div class="glow-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="8" y1="12" x2="16" y2="12"></line>
            </svg>
          </div>
          <div>${fetchError || "No lyrics found"}</div>
        `;
      } else {
        bannerEl.style.display = "none";
      }
    }
  }

  // Main SVG Render loop (driven by requestAnimationFrame)
  function renderSvgScene() {
    if (!appContainer) return;
    const svgEl = appContainer.querySelector(".constellation-svg");
    if (!svgEl) return;

    const rect = appContainer.getBoundingClientRect();
    const width = rect.width || 1000;
    const height = rect.height || 700;

    // Read progress from Spicetify.Player
    let progressMs = 0;
    let isPlaying = true;
    if (window.Spicetify && window.Spicetify.Player) {
      try {
        progressMs = window.Spicetify.Player.getProgress() || 0;
        isPlaying = window.Spicetify.Player.isPlaying();
      } catch (e) {
        isPlaying = true;
      }
    }

    // Identify active word and line
    let activeNode = null;
    let activeLineIdx = -1;

    for (const node of constellationNodes) {
      if (progressMs >= node.startTime && progressMs < node.endTime) {
        activeNode = node;
        activeLineIdx = node.lineIndex;
        break;
      }
    }

    // Fallback active line if in between words
    if (!activeNode && constellationNodes.length > 0) {
      for (let i = 0; i < constellationNodes.length; i++) {
        if (progressMs < constellationNodes[i].startTime) {
          activeLineIdx = i > 0 ? constellationNodes[i - 1].lineIndex : 0;
          break;
        }
      }
      if (activeLineIdx === -1) {
        activeLineIdx = constellationNodes[constellationNodes.length - 1].lineIndex;
      }
    }

    // Smooth camera drift towards active node
    if (activeNode) {
      camera.targetX = activeNode.x;
      camera.targetY = activeNode.y;
    } else if (activeLineIdx >= 0) {
      const lineNodes = constellationNodes.filter((n) => n.lineIndex === activeLineIdx);
      if (lineNodes.length > 0) {
        const mid = lineNodes[Math.floor(lineNodes.length / 2)];
        camera.targetX = mid.x;
        camera.targetY = mid.y;
      }
    }

    // Smooth lerp
    camera.x += (camera.targetX - camera.x) * 0.05;
    camera.y += (camera.targetY - camera.y) * 0.05;

    const viewX = camera.x - width / 2;
    const viewY = camera.y - height / 2;

    // Construct SVG Elements string
    const nowTime = performance.now();

    // 1. Ambient background stars
    let ambientSvg = "";
    for (const star of ambientStars) {
      const twinkle = Math.sin(nowTime * star.speed + star.phase);
      const opacity = Math.max(0.08, star.baseOpacity + twinkle * 0.15);
      ambientSvg += `<circle cx="${star.x}" cy="${star.y}" r="${star.r}" fill="${LIME_COLOR}" opacity="${opacity.toFixed(3)}" />`;
    }

    // 2. Constellation Lines
    let linesSvg = "";
    for (const node of constellationNodes) {
      if (!node.prevNode) continue;

      const linePast = progressMs >= node.endTime;
      const lineActive = progressMs >= node.prevNode.startTime && progressMs < node.endTime;
      const lineDistFromActive = Math.abs(node.lineIndex - activeLineIdx);

      // Line fade out for older lines
      let lineOpacity = 0.18;
      let strokeColor = LIME_FAINT;
      let strokeWidth = 1.2;

      if (node.lineIndex < activeLineIdx - 2) {
        lineOpacity = Math.max(0.03, 0.15 - (activeLineIdx - node.lineIndex) * 0.04);
      } else if (lineActive) {
        lineOpacity = 0.95;
        strokeColor = LIME_COLOR;
        strokeWidth = 2.0;
      } else if (linePast) {
        lineOpacity = Math.max(0.2, 0.7 - lineDistFromActive * 0.2);
        strokeColor = LIME_BRIGHT;
        strokeWidth = 1.4;
      }

      linesSvg += `
        <line 
          x1="${node.prevNode.x}" 
          y1="${node.prevNode.y}" 
          x2="${node.x}" 
          y2="${node.y}" 
          stroke="${strokeColor}" 
          stroke-width="${strokeWidth}" 
          stroke-opacity="${lineOpacity.toFixed(3)}"
          stroke-linecap="round"
          ${lineActive ? 'filter="url(#constellation-glow)"' : ""}
        />
      `;
    }

    // 3. Word Star Nodes
    let nodesSvg = "";
    for (const node of constellationNodes) {
      const isWordActive = activeNode && activeNode.id === node.id;
      const isWordPast = progressMs >= node.endTime;
      const isFuture = progressMs < node.startTime;
      const lineDist = Math.abs(node.lineIndex - activeLineIdx);

      let starRadius = 2.5;
      let starOpacity = 0.35;
      let starFill = "#7d8a60";
      let textOpacity = 0.4;
      let textColor = "#9ca3af";
      let fontWeight = "400";
      let filterAttr = "";
      let haloSvg = "";

      if (isWordActive) {
        starRadius = 6.5;
        starOpacity = 1.0;
        starFill = LIME_COLOR;
        textOpacity = 1.0;
        textColor = "#ffffff";
        fontWeight = "700";
        filterAttr = 'filter="url(#constellation-glow)"';

        const pulseScale = 1 + Math.sin(nowTime * 0.008) * 0.25;
        haloSvg = `
          <circle 
            cx="${node.x}" 
            cy="${node.y}" 
            r="${14 * pulseScale}" 
            fill="none" 
            stroke="${LIME_COLOR}" 
            stroke-width="1.5" 
            stroke-opacity="0.65" 
            filter="url(#constellation-glow)" 
          />
          <line x1="${node.x - 12}" y1="${node.y}" x2="${node.x + 12}" y2="${node.y}" stroke="${LIME_COLOR}" stroke-width="1.2" opacity="0.8" />
          <line x1="${node.x}" y1="${node.y - 12}" x2="${node.x}" y2="${node.y + 12}" stroke="${LIME_COLOR}" stroke-width="1.2" opacity="0.8" />
        `;
      } else if (node.lineIndex === activeLineIdx) {
        if (isWordPast) {
          starRadius = 4.0;
          starOpacity = 0.9;
          starFill = LIME_COLOR;
          textOpacity = 0.95;
          textColor = "#eaff96";
          fontWeight = "600";
        } else {
          // Upcoming word in active line
          starRadius = 3.2;
          starOpacity = 0.65;
          starFill = "#a4c442";
          textOpacity = 0.7;
          textColor = "#c9d998";
        }
      } else if (node.lineIndex < activeLineIdx) {
        // Older lines fade out
        const age = activeLineIdx - node.lineIndex;
        starOpacity = Math.max(0.04, 0.4 - age * 0.12);
        textOpacity = Math.max(0.04, 0.45 - age * 0.14);
        starFill = "#6b7d4c";
        textColor = "#869677";
        starRadius = 2.2;
      } else {
        // Upcoming future lines
        const distance = node.lineIndex - activeLineIdx;
        starOpacity = Math.max(0.12, 0.35 - distance * 0.08);
        textOpacity = Math.max(0.12, 0.4 - distance * 0.08);
        starFill = "#54613c";
        textColor = "#6b7280";
        starRadius = 2.0;
      }

      nodesSvg += `
        <g class="star-node">
          ${haloSvg}
          <circle 
            cx="${node.x}" 
            cy="${node.y}" 
            r="${starRadius}" 
            fill="${starFill}" 
            opacity="${starOpacity.toFixed(3)}"
            ${filterAttr}
          />
          <text 
            x="${node.x}" 
            y="${node.y + 18}" 
            text-anchor="middle" 
            fill="${textColor}" 
            font-size="${isWordActive ? 15 : 12}" 
            font-weight="${fontWeight}" 
            letter-spacing="0.04em"
            opacity="${textOpacity.toFixed(3)}"
            ${isWordActive ? 'filter="url(#text-glow)"' : ""}
          >${escapeXml(node.text)}</text>
        </g>
      `;
    }

    svgEl.innerHTML = `
      <defs>
        <filter id="constellation-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4.5" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <filter id="text-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="0" stdDeviation="3" flood-color="${LIME_COLOR}" flood-opacity="0.8"/>
        </filter>
        <radialGradient id="space-vignette" cx="50%" cy="50%" r="50%">
          <stop offset="60%" stop-color="#000000" stop-opacity="0" />
          <stop offset="100%" stop-color="#000000" stop-opacity="0.75" />
        </radialGradient>
      </defs>

      <!-- Celestial Universe Transform -->
      <g transform="translate(${-viewX.toFixed(2)}, ${-viewY.toFixed(2)})">
        <!-- Ambient Stars -->
        <g class="ambient-stars">${ambientSvg}</g>

        <!-- Constellation Lines -->
        <g class="constellation-lines">${linesSvg}</g>

        <!-- Constellation Star Nodes -->
        <g class="constellation-words">${nodesSvg}</g>
      </g>

      <!-- Static Vignette overlay -->
      <rect width="100%" height="100%" fill="url(#space-vignette)" pointer-events="none" />
    `;
  }

  function escapeXml(unsafe) {
    return unsafe.replace(/[<>&'"]/g, function (c) {
      switch (c) {
        case "<": return "&lt;";
        case ">": return "&gt;";
        case "&": return "&amp;";
        case "'": return "&apos;";
        case '"': return "&quot;";
      }
    });
  }

  // Animation frame loop
  function tick() {
    animFrameId = requestAnimationFrame(tick);

    // Pause animation when Spicetify.Player is paused
    if (window.Spicetify && window.Spicetify.Player) {
      if (!window.Spicetify.Player.isPlaying()) {
        return;
      }
    }

    renderSvgScene();
  }

  // Main custom app render function
  function render() {
    injectStyles();

    if (!appContainer) {
      appContainer = document.createElement("div");
      appContainer.id = "spicetify-constellation-root";

      appContainer.innerHTML = `
        <svg class="constellation-svg"></svg>
        <div class="constellation-status-banner"></div>
        <div class="constellation-bottom-bar">
          <div class="track-title">
            <span class="track-badge"></span>
            <span class="track-title-text">Waiting for playback</span>
          </div>
          <div class="track-artist"></div>
        </div>
      `;

      // Window resize handling
      const resizeObserver = new ResizeObserver(() => {
        if (parsedLyrics && constellationNodes.length === 0) {
          rebuildConstellation();
        }
      });
      resizeObserver.observe(appContainer);

      // Start animation loop
      if (!animFrameId) {
        animFrameId = requestAnimationFrame(tick);
      }

      // Initial track lookup
      setTimeout(() => {
        handleSongChange();
      }, 100);

      // Register songchange listener
      if (window.Spicetify && window.Spicetify.Player) {
        window.Spicetify.Player.addEventListener("songchange", handleSongChange);
      }
    }

    return appContainer;
  }

  // Wait for Spicetify to be ready
  function init() {
    if (!window.Spicetify || !window.Spicetify.Player) {
      setTimeout(init, 250);
      return;
    }

    // Register event listeners
    window.Spicetify.Player.addEventListener("songchange", handleSongChange);
  }

  // Export render for Spicetify Custom App loader
  window.Constellation = { render, handleSongChange, parseLrc };
  if (typeof module !== "undefined" && module.exports) {
    module.exports = { render };
  }

  init();

  // If Spicetify Custom App router expects render() as global function
  window.render = render;
})();
