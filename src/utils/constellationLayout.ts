import { ParsedLine, ConstellationNode, AmbientStar } from '../types';

export function buildConstellationLayout(
  lines: ParsedLine[],
  width: number,
  height: number,
  minDistance: number = 60
): ConstellationNode[] {
  const nodes: ConstellationNode[] = [];
  if (!lines || !lines.length) return nodes;

  const placedPoints: { x: number; y: number }[] = [];

  const checkMinDistance = (x: number, y: number, minDist: number): boolean => {
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

  let currentClusterX = centerX;
  let currentClusterY = centerY;
  let clusterAngle = Math.PI * 0.25;

  lines.forEach((line, lIdx) => {
    // Progress the cluster forward in a celestial spiral/drift
    const clusterStep = 170 + (Math.sin(lIdx * 0.8) * 40 + 50);
    clusterAngle += 0.45 + (Math.sin(lIdx) * 0.2);
    currentClusterX += Math.cos(clusterAngle) * clusterStep;
    currentClusterY += Math.sin(clusterAngle) * clusterStep;

    const lineNodes: ConstellationNode[] = [];
    let lastX = currentClusterX;
    let lastY = currentClusterY;
    let lineAngle = clusterAngle + (Math.sin(lIdx * 2) * 0.4);

    line.words.forEach((wordObj, wIdx) => {
      let bestX = lastX;
      let bestY = lastY;
      let found = false;

      // Try multiple candidate offsets from previous word in the line
      for (let attempt = 0; attempt < 28; attempt++) {
        const dist = 75 + Math.random() * 65;
        const deltaAngle = (Math.random() - 0.5) * (Math.PI * 0.7);
        const candAngle = lineAngle + deltaAngle;
        const candX = (wIdx === 0 ? currentClusterX : lastX) + Math.cos(candAngle) * dist;
        const candY = (wIdx === 0 ? currentClusterY : lastY) + Math.sin(candAngle) * dist;

        if (checkMinDistance(candX, candY, minDistance)) {
          bestX = candX;
          bestY = candY;
          lineAngle = candAngle;
          found = true;
          break;
        }
      }

      if (!found) {
        const fallbackDist = 85;
        bestX = lastX + Math.cos(lineAngle) * fallbackDist;
        bestY = lastY + Math.sin(lineAngle) * fallbackDist;
      }

      placedPoints.push({ x: bestX, y: bestY });
      const prev = wIdx > 0 ? lineNodes[wIdx - 1] : undefined;
      lastX = bestX;
      lastY = bestY;

      const node: ConstellationNode = {
        id: `node-${lIdx}-${wIdx}`,
        lineIndex: lIdx,
        wordIndex: wIdx,
        text: wordObj.text,
        startTime: wordObj.startTime,
        endTime: wordObj.endTime,
        x: bestX,
        y: bestY,
        prevNodeId: prev?.id,
        prevNode: prev
          ? {
              x: prev.x,
              y: prev.y,
              startTime: prev.startTime,
              endTime: prev.endTime,
            }
          : undefined,
      };

      lineNodes.push(node);
      nodes.push(node);
    });
  });

  return nodes;
}

export function generateAmbientStars(count: number, width: number, height: number): AmbientStar[] {
  const stars: AmbientStar[] = [];
  const spread = Math.max(width, height) * 4;
  for (let i = 0; i < count; i++) {
    stars.push({
      x: (Math.random() - 0.5) * spread,
      y: (Math.random() - 0.5) * spread,
      r: Math.random() * 1.6 + 0.4,
      baseOpacity: Math.random() * 0.35 + 0.1,
      speed: Math.random() * 0.002 + 0.0008,
      phase: Math.random() * Math.PI * 2,
    });
  }
  return stars;
}
