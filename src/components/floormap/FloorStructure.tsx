import { useAppStore } from '../../store/useAppStore';
import { getZoneColors } from '../../lib/utils';

interface FloorStructureProps {
  floorId: string;
  showLabels?: boolean;
  hideZoneLabels?: boolean;
  showGrid?: boolean;
  className?: string;
}

export function FloorStructure({ 
  floorId, 
  showLabels = true, 
  hideZoneLabels = false,
  showGrid = true,
  className 
}: FloorStructureProps) {
  const { theme, floors, rooms } = useAppStore();
  const isDark = theme === 'dark';

  const floor = floors.find(f => f.id === floorId);
  if (!floor) return null;

  // Base SVG canvas configurations
  const width = 1200;
  const height = 960;

  // Dynamic grid configuration parameters
  const gridWidth = floor.gridWidth || 18;
  const gridHeight = floor.gridHeight || 14;
  const cellW = width / gridWidth;
  const cellH = height / gridHeight;

  // Retrieve active rooms for the floor
  const floorRooms = rooms.filter(r => r.floorId === floorId && r.isActive);

  // Helper to determine background fills for rooms dynamically
  const getRoomBgColor = (type: string, isDark: boolean) => {
    if (type === 'washroom') {
      return isDark ? 'url(#washroomTilesDark)' : 'url(#washroomTilesLight)';
    }
    if (isDark) {
      switch (type) {
        case 'boardroom': return '#1c1b3f'; // dark purple-indigo
        case 'training': return '#251c1c'; // dark warm stone
        case 'focus': return '#2a1727'; // dark plum
        case 'meeting': return '#182030'; // dark blue-slate
        case 'pantry': return '#2d2015'; // dark warm wood/orange
        case 'storage': return '#1e2025'; // dark gray
        case 'server_room': return '#121620'; // dark tech blue
        case 'printer_room': return '#182030';
        default: return '#161a22'; // default dark gray-blue
      }
    } else {
      switch (type) {
        case 'boardroom': return '#f5f3ff'; // purple-50
        case 'training': return '#fafaf6'; // stone-50
        case 'focus': return '#fff5f7'; // pink-50
        case 'meeting': return '#f8fafc'; // slate-50
        case 'pantry': return '#fdfaf2'; // warm cream
        case 'storage': return '#fafaf9'; // stone-50
        case 'server_room': return '#f8fafc'; // slate-50
        case 'printer_room': return '#fafaf9'; // stone-50
        default: return '#fcfaf6';
      }
    }
  };

  const renderBackgroundGrid = () => (
    <g opacity={isDark ? '0.04' : '0.08'}>
      {Array.from({ length: gridWidth + 1 }, (_, i) => (
        <path key={`v-${i}`} d={`M${i * cellW} 0V${height}`} stroke={isDark ? '#4b5563' : '#9ca3af'} strokeWidth="1" strokeDasharray="3,3" />
      ))}
      {Array.from({ length: gridHeight + 1 }, (_, i) => (
        <path key={`h-${i}`} d={`M0 ${i * cellH}H${width}`} stroke={isDark ? '#4b5563' : '#9ca3af'} strokeWidth="1" strokeDasharray="3,3" />
      ))}
    </g>
  );

  const renderWindows = () => {
    // Generate windows spacing dynamically based on current grid bounds
    const topWindows: number[] = [];
    for (let x = 2; x < gridWidth - 1; x += 4) {
      topWindows.push(x * cellW);
    }

    const leftWindows: number[] = [];
    for (let y = 2; y < gridHeight - 1; y += 4) {
      leftWindows.push(y * cellH);
    }

    return (
      <g fill="#bae6fd" stroke="#0284c7" strokeWidth="1.5" opacity="0.8">
        {/* Top windows */}
        {topWindows.map((x, idx) => (
          <rect key={`tw-${idx}`} x={x} y="0" width={cellW * 1.5} height="8" rx="1" />
        ))}
        {/* Bottom windows */}
        {topWindows.map((x, idx) => (
          <rect key={`bw-${idx}`} x={x} y={height - 8} width={cellW * 1.5} height="8" rx="1" />
        ))}
        {/* Left windows */}
        {leftWindows.map((y, idx) => (
          <rect key={`lw-${idx}`} x="0" y={y} width="8" height={cellH * 1.5} rx="1" />
        ))}
        {/* Right windows */}
        {leftWindows.map((y, idx) => (
          <rect key={`rw-${idx}`} x={width - 8} y={y} width="8" height={cellH * 1.5} rx="1" />
        ))}
      </g>
    );
  };

  const renderRestroomsStack = () => {
    // We now render restrooms stack dynamically from seeded rooms rather than static overlays
    // to allow the user to delete/reposition them in the floor builder.
    return null;
  };

  return (
    <svg className={className} viewBox={`0 0 ${width} ${height}`} xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Office floor structure">
      <defs>
        {/* Soft shadow filter */}
        <filter id="premiumSoftShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#0f172a" floodOpacity={isDark ? '0.45' : '0.12'} />
        </filter>
        {/* Pattern for glass blocks */}
        <pattern id="glassBlock" width="8" height="8" patternUnits="userSpaceOnUse">
          <rect width="8" height="8" fill="none" />
          <line x1="0" y1="8" x2="8" y2="0" stroke="#bae6fd" strokeWidth="1" />
        </pattern>
        {/* Washroom Tiled Floors Patterns */}
        <pattern id="washroomTilesLight" width="12" height="12" patternUnits="userSpaceOnUse">
          <rect width="12" height="12" fill="#f0f9ff" stroke="#bae6fd" strokeWidth="0.5" />
        </pattern>
        <pattern id="washroomTilesDark" width="12" height="12" patternUnits="userSpaceOnUse">
          <rect width="12" height="12" fill="#1e293b" stroke="#334155" strokeWidth="0.5" />
        </pattern>
      </defs>

      {/* Main Floor Base */}
      <rect width={width} height={height} fill={isDark ? '#0b0f19' : '#EDE8DC'} />

      {/* Grid Alignment lines */}
      {showGrid && renderBackgroundGrid()}

      {/* Outer structural walls */}
      <rect x="0" y="0" width={width} height={height} fill="none" stroke="#555" strokeWidth="12" />

      {/* Glass windows stack around perimeter */}
      {renderWindows()}

      {/* Common restroom vertical stacks */}
      {renderRestroomsStack()}

      {/* Dynamic Zone Boundaries & Backgrounds */}
      {floor.zones.map(z => {
        const zColors = getZoneColors(z.color);
        const rx = z.x * cellW;
        const ry = z.y * cellH;
        const rw = z.width * cellW;
        const rh = z.height * cellH;
        return (
          <g key={z.id}>
            {/* Zone background area bounding line */}
            <rect
              x={rx + 4}
              y={ry + 4}
              width={rw - 8}
              height={rh - 8}
              rx="12"
              fill="none"
              stroke={z.color}
              strokeWidth="2"
              strokeDasharray="6,4"
              opacity={isDark ? 0.35 : 0.6}
            />
            {/* Zone name/dimensions label */}
            {showLabels && !hideZoneLabels && (
              <g
                fontFamily="Inter, sans-serif"
                fontWeight="900"
                fontSize="11"
                fill={isDark ? zColors.textDark : zColors.textLight}
                textAnchor="middle"
                opacity="0.8"
              >
                <text x={rx + rw / 2} y={ry + 22}>
                  {z.name.toUpperCase()}
                </text>
                <text x={rx + rw / 2} y={ry + 32} fontSize="7" fontWeight="bold" opacity="0.6">
                  {`${Math.round(z.width * 4)}'0" x ${Math.round(z.height * 4)}'0"`}
                </text>
              </g>
            )}
          </g>
        );
      })}

      {/* Pass 1: Room Background Fills & Wall borders */}
      {floorRooms.map(room => {
        const rx = room.x * cellW;
        const ry = room.y * cellH;
        const rw = room.width * cellW;
        const rh = room.height * cellH;

        return (
          <g key={`room-walls-${room.id}`}>
            {/* Room Background Fill */}
            <rect
              x={rx}
              y={ry}
              width={rw}
              height={rh}
              fill={getRoomBgColor(room.type, isDark)}
              opacity={isDark ? "0.9" : "0.65"}
            />
            {/* Room Wall borders */}
            <rect
              x={rx}
              y={ry}
              width={rw}
              height={rh}
              fill="none"
              stroke={isDark ? '#334155' : '#1a1a1a'}
              strokeWidth="8"
            />
          </g>
        );
      })}

      {/* Pass 2: Door swing gaps and trajectories */}
      {floorRooms.map(room => {
        const rx = room.x * cellW;
        const ry = room.y * cellH;
        const rw = room.width * cellW;
        const rh = room.height * cellH;

        // Check adjacent walls blocked by other rooms on this floor
        const isTopBlocked = floorRooms.some(r => r.id !== room.id && Math.abs(r.y + r.height - room.y) < 0.1 && !(r.x + r.width <= room.x || r.x >= room.x + room.width));
        const isBottomBlocked = floorRooms.some(r => r.id !== room.id && Math.abs(r.y - (room.y + room.height)) < 0.1 && !(r.x + r.width <= room.x || r.x >= room.x + room.width));
        const isLeftBlocked = floorRooms.some(r => r.id !== room.id && Math.abs(r.x + r.width - room.x) < 0.1 && !(r.y + r.height <= room.y || r.y >= room.y + room.height));
        const isRightBlocked = floorRooms.some(r => r.id !== room.id && Math.abs(r.x - (room.x + room.width)) < 0.1 && !(r.y + r.height <= room.y || r.y >= room.y + room.height));

        const isBottomOuter = room.y + room.height >= gridHeight;
        const isTopOuter = room.y <= 0;
        const isLeftOuter = room.x <= 0;
        const isRightOuter = room.x + room.width >= gridWidth;

        // Candidate walls in priority order
        const candidates: ('bottom' | 'top' | 'left' | 'right')[] = ['bottom', 'top', 'left', 'right'];

        // Find the first candidate that is neither blocked nor an outer wall boundary
        let doorWall = candidates.find(wall => {
          if (wall === 'bottom') return !isBottomBlocked && !isBottomOuter;
          if (wall === 'top') return !isTopBlocked && !isTopOuter;
          if (wall === 'left') return !isLeftBlocked && !isLeftOuter;
          if (wall === 'right') return !isRightBlocked && !isRightOuter;
          return false;
        });

        // If none found, find any wall that is not blocked by another room (even if outer wall)
        if (!doorWall) {
          doorWall = candidates.find(wall => {
            if (wall === 'bottom') return !isBottomBlocked;
            if (wall === 'top') return !isTopBlocked;
            if (wall === 'left') return !isLeftBlocked;
            if (wall === 'right') return !isRightBlocked;
            return false;
          });
        }

        // Default fallback
        if (!doorWall) {
          doorWall = 'bottom';
        }

        const doorWidth = Math.min(32, cellW * 0.8);
        const doorX = rx + rw / 2 - doorWidth / 2;
        const doorY = ry + rh / 2 - doorWidth / 2;

        return (
          <g key={`room-door-${room.id}`}>
            {/* Door swing gap and trajectory depending on wall selection */}
            {doorWall === 'bottom' && (
              <g>
                <rect
                  x={doorX}
                  y={ry + rh - 4}
                  width={doorWidth}
                  height={8}
                  fill={isDark ? '#0b0f19' : '#EDE8DC'}
                />
                <line x1={doorX} y1={ry + rh} x2={doorX} y2={ry + rh + doorWidth} stroke={isDark ? '#64748b' : '#555'} strokeWidth="2.5" />
                <path d={`M ${doorX} ${ry + rh + doorWidth} A ${doorWidth} ${doorWidth} 0 0 0 ${doorX + doorWidth} ${ry + rh}`} stroke={isDark ? '#475569' : '#64748b'} strokeWidth="1.5" strokeDasharray="3,3" fill="none" />
              </g>
            )}

            {doorWall === 'top' && (
              <g>
                <rect
                  x={doorX}
                  y={ry - 4}
                  width={doorWidth}
                  height={8}
                  fill={isDark ? '#0b0f19' : '#EDE8DC'}
                />
                <line x1={doorX} y1={ry} x2={doorX} y2={ry - doorWidth} stroke={isDark ? '#64748b' : '#555'} strokeWidth="2.5" />
                <path d={`M ${doorX} ${ry - doorWidth} A ${doorWidth} ${doorWidth} 0 0 1 ${doorX + doorWidth} ${ry}`} stroke={isDark ? '#475569' : '#64748b'} strokeWidth="1.5" strokeDasharray="3,3" fill="none" />
              </g>
            )}

            {doorWall === 'left' && (
              <g>
                <rect
                  x={rx - 4}
                  y={doorY}
                  width={8}
                  height={doorWidth}
                  fill={isDark ? '#0b0f19' : '#EDE8DC'}
                />
                <line x1={rx} y1={doorY} x2={rx - doorWidth} y2={doorY} stroke={isDark ? '#64748b' : '#555'} strokeWidth="2.5" />
                <path d={`M ${rx - doorWidth} ${doorY} A ${doorWidth} ${doorWidth} 0 0 1 ${rx} ${doorY + doorWidth}`} stroke={isDark ? '#475569' : '#64748b'} strokeWidth="1.5" strokeDasharray="3,3" fill="none" />
              </g>
            )}

            {doorWall === 'right' && (
              <g>
                <rect
                  x={rx + rw - 4}
                  y={doorY}
                  width={8}
                  height={doorWidth}
                  fill={isDark ? '#0b0f19' : '#EDE8DC'}
                />
                <line x1={rx + rw} y1={doorY} x2={rx + rw + doorWidth} y2={doorY} stroke={isDark ? '#64748b' : '#555'} strokeWidth="2.5" />
                <path d={`M ${rx + rw + doorWidth} ${doorY} A ${doorWidth} ${doorWidth} 0 0 0 ${rx + rw} ${doorY + doorWidth}`} stroke={isDark ? '#475569' : '#64748b'} strokeWidth="1.5" strokeDasharray="3,3" fill="none" />
              </g>
            )}
          </g>
        );
      })}

      {/* Dynamic Main Entrance indicator at bottom center */}
      <g transform={`translate(${(gridWidth / 2) * cellW - 25}, ${height - 20})`} fill={isDark ? '#f04a16' : '#ea580c'}>
        <path d="M 25 0 L 10 15 L 20 15 L 20 20 L 30 20 L 30 15 L 40 15 Z" />
        {showLabels && (
          <text x="25" y="-12" textAnchor="middle" fontSize="10" fontWeight="900" fill={isDark ? '#94a3b8' : '#475569'} fontFamily="Inter, sans-serif">
            MAIN ENTRANCE
          </text>
        )}
      </g>
    </svg>
  );
}
