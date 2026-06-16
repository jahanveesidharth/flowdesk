interface ReferenceOfficePlanProps {
  showLabels?: boolean;
  className?: string;
}

const rooms = [
  { x: 6, y: 6, w: 400, h: 460, label: 'OPEN WORKSTATION AREA', size: '28\'0" x 18\'0"', fill: '#EDE8DC', stroke: 2 },
  { x: 400, y: 6, w: 175, h: 188, label: 'PRIVATE OFFICE', size: '12\'0" x 12\'0"', fill: '#EDE8DC', stroke: 8 },
  { x: 575, y: 6, w: 118, h: 188, label: 'WASHROOM', size: '7\'0" x 8\'0"', fill: 'url(#tile)', stroke: 8 },
  { x: 693, y: 6, w: 118, h: 188, label: 'WASHROOM', size: '7\'0" x 8\'0"', fill: 'url(#tile)', stroke: 8 },
  { x: 811, y: 6, w: 188, h: 148, label: 'PANTRY', size: '10\'0" x 8\'0"', fill: '#EDE8DC', stroke: 8 },
  { x: 999, y: 6, w: 195, h: 148, label: 'STORAGE', size: '7\'0" x 8\'0"', fill: '#EDE8DC', stroke: 8 },
  { x: 811, y: 154, w: 383, h: 340, label: 'CONFERENCE ROOM', size: '18\'0" x 16\'0"', fill: '#EDE8DC', stroke: 8 },
  { x: 400, y: 340, w: 198, h: 220, label: 'MANAGER OFFICE', size: '14\'0" x 12\'0"', fill: '#EDE8DC', stroke: 8 },
  { x: 598, y: 340, w: 213, h: 220, label: 'MEETING ROOM', size: '12\'0" x 12\'0"', fill: '#EDE8DC', stroke: 8 },
  { x: 6, y: 560, w: 218, h: 200, label: 'BEDROOM', size: '14\'0" x 12\'0"', fill: '#EDE8DC', stroke: 8 },
  { x: 224, y: 600, w: 156, h: 160, label: 'WASHROOM', size: '8\'0" x 8\'0"', fill: 'url(#tile)', stroke: 8 },
  { x: 380, y: 560, w: 430, h: 280, label: 'LOBBY / RECEPTION', size: '24\'0" x 16\'0"', fill: '#EDE8DC', stroke: 8 },
  { x: 811, y: 560, w: 188, h: 280, label: 'WAITING AREA', size: '14\'0" x 12\'0"', fill: '#EDE8DC', stroke: 8 },
  { x: 999, y: 560, w: 195, h: 280, label: 'PRIVATE OFFICE', size: '12\'0" x 12\'0"', fill: '#EDE8DC', stroke: 8 },
  { x: 6, y: 760, w: 188, h: 194, label: 'SERVER ROOM', size: '10\'0" x 8\'0"', fill: '#EDE8DC', stroke: 8 },
  { x: 194, y: 760, w: 186, h: 194, label: 'PRINTER / COPY ROOM', size: '10\'0" x 8\'0"', fill: '#EDE8DC', stroke: 8 },
];

const plants = [
  [28, 35], [370, 35], [28, 450], [1180, 460], [395, 828], [795, 828], [500, 828], [822, 828], [1180, 828],
];

export function ReferenceOfficePlan({ showLabels = true, className }: ReferenceOfficePlanProps) {
  return (
    <svg className={className} viewBox="0 0 1200 960" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Detailed office floor plan">
      <defs>
        <pattern id="tile" width="12" height="12" patternUnits="userSpaceOnUse">
          <rect width="12" height="12" fill="#B8C8D8" />
          <rect width="6" height="6" fill="#C4D4E4" />
          <rect x="6" y="6" width="6" height="6" fill="#C4D4E4" />
        </pattern>
        <pattern id="wood" width="20" height="6" patternUnits="userSpaceOnUse">
          <rect width="20" height="6" fill="#C8A96E" />
          <rect width="20" height="1" fill="#B89A5E" opacity="0.45" />
        </pattern>
        <pattern id="serverRack" width="30" height="20" patternUnits="userSpaceOnUse">
          <rect width="30" height="20" fill="#2D3748" />
          <rect y="2" width="30" height="3" fill="#3D4A5C" />
          <rect y="8" width="30" height="3" fill="#3D4A5C" />
          <rect y="14" width="30" height="3" fill="#3D4A5C" />
          <circle cx="25" cy="3.5" r="1.5" fill="#48BB78" />
          <circle cx="25" cy="9.5" r="1.5" fill="#48BB78" />
          <circle cx="25" cy="15.5" r="1.5" fill="#F6AD55" />
        </pattern>
        <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#111827" floodOpacity="0.2" />
        </filter>
      </defs>

      <rect width="1200" height="960" fill="#EDE8DC" />
      <g opacity="0.18">
        {Array.from({ length: 100 }, (_, i) => <path key={`v-${i}`} d={`M${i * 24} 0V960`} stroke="#D8D1C4" />)}
        {Array.from({ length: 80 }, (_, i) => <path key={`h-${i}`} d={`M0 ${i * 24}H1200`} stroke="#D8D1C4" />)}
      </g>
      <rect x="0" y="0" width="1200" height="960" fill="none" stroke="#555" strokeWidth="12" />

      {rooms.map(room => (
        <rect key={`${room.label}-${room.x}-${room.y}`} x={room.x} y={room.y} width={room.w} height={room.h} fill={room.fill} stroke="#555" strokeWidth={room.stroke} />
      ))}

      <rect x="490" y="948" width="200" height="12" fill="#EDE8DC" />
      <rect x="380" y="554" width="6" height="14" fill="#EDE8DC" />
      <rect x="805" y="554" width="10" height="14" fill="#EDE8DC" />
      <g fill="#D4E8F5" stroke="#8AAAC0" strokeWidth="1.5">
        {[60, 200, 440, 600, 870, 1060].map(x => <rect key={x} x={x} y="0" width="60" height="8" rx="1" />)}
        {[100, 300, 650].map(y => <rect key={y} x="1192" y={y} width="8" height="60" rx="1" />)}
        {[80, 220, 660, 820].map(y => <rect key={y} x="0" y={y} width="8" height="50" rx="1" />)}
        {[60, 200, 750, 1060].map(x => <rect key={x} x={x} y="952" width="50" height="8" rx="1" />)}
      </g>

      <WorkstationTable x={30} y={40} />
      <WorkstationTable x={220} y={40} />
      <WorkstationTable x={30} y={280} />
      <WorkstationTable x={220} y={280} />
      <OfficeDesk x={425} y={110} />
      <OfficeDesk x={420} y={430} />
      <OfficeDesk x={1020} y={680} />
      <ConferenceTable />
      <RoundMeeting />
      <LobbyFurniture />
      <WaitingFurniture />
      <BedroomFurniture />
      <WashroomFixtures />
      <rect x="820" y="14" width="168" height="40" fill="#C8B8A0" stroke="#987" rx="2" filter="url(#softShadow)" />
      <rect x="895" y="20" width="55" height="25" fill="#F8FAFC" stroke="#777" rx="2" />
      <circle cx="915" cy="32" r="9" fill="#E5E7EB" stroke="#777" />
      <circle cx="935" cy="32" r="9" fill="#E5E7EB" stroke="#777" />
      <rect x="20" y="775" width="60" height="90" fill="url(#serverRack)" rx="2" />
      <rect x="88" y="775" width="60" height="90" fill="url(#serverRack)" rx="2" />
      <Printer x={220} y={790} />

      <g fill="#5A8A3A" opacity="0.9">
        {plants.map(([cx, cy]) => (
          <g key={`${cx}-${cy}`}>
            <circle cx={cx} cy={cy} r="12" />
            <circle cx={cx - 11} cy={cy - 7} r="8" />
            <circle cx={cx + 11} cy={cy - 8} r="8" />
            <circle cx={cx + 2} cy={cy + 9} r="7" fill="#6DA64B" />
          </g>
        ))}
      </g>

      {showLabels && (
        <g fontFamily="Inter, Arial, sans-serif" fill="#222" textAnchor="middle">
          {rooms.map(room => (
            <g key={`label-${room.label}-${room.x}-${room.y}`}>
              <text x={room.x + room.w / 2} y={room.y + room.h / 2 - 7} fontSize={room.w < 130 ? 10 : 13} fontWeight="800">{room.label}</text>
              <text x={room.x + room.w / 2} y={room.y + room.h / 2 + 11} fontSize={room.w < 130 ? 9 : 11} fontWeight="700">{room.size}</text>
            </g>
          ))}
          <text x="590" y="970" fontSize="13" fontWeight="800">MAIN ENTRANCE</text>
        </g>
      )}
      <rect x="488" y="948" width="204" height="12" fill="#555" />
      <rect x="490" y="952" width="200" height="10" fill="#EDE8DC" />
      <path d="M490,952 Q490,920 540,920" fill="none" stroke="#888" strokeWidth="1.5" strokeDasharray="4,3" />
      <path d="M690,952 Q690,920 640,920" fill="none" stroke="#888" strokeWidth="1.5" strokeDasharray="4,3" />
      <path d="M590 937l8 14h-16z" fill="#333" />
    </svg>
  );
}

function Chair({ x, y, rotate = 0 }: { x: number; y: number; rotate?: number }) {
  return <rect x={x} y={y} width="28" height="18" fill="#3A3A3A" stroke="#1F2937" strokeWidth="1" rx="4" transform={`rotate(${rotate} ${x + 14} ${y + 9})`} filter="url(#softShadow)" />;
}

function WorkstationTable({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <rect x={x} y={y} width="130" height="55" fill="url(#wood)" stroke="#9A7A48" rx="3" filter="url(#softShadow)" />
      {[10, 50, 90].map(dx => <Chair key={`t-${dx}`} x={x + dx} y={y - 18} />)}
      {[10, 50, 90].map(dx => <Chair key={`b-${dx}`} x={x + dx} y={y + 54} rotate={180} />)}
      <Chair x={x - 18} y={y + 16} rotate={90} />
      <Chair x={x + 120} y={y + 16} rotate={-90} />
    </g>
  );
}

function OfficeDesk({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <rect x={x} y={y} width="120" height="60" fill="url(#wood)" stroke="#9A7A48" rx="3" filter="url(#softShadow)" />
      <Chair x={x + 45} y={y - 28} />
      <rect x={x + 44} y={y + 38} width="34" height="8" fill="#2D3748" rx="2" />
    </g>
  );
}

function ConferenceTable() {
  return (
    <g>
      <rect x="870" y="220" width="270" height="130" fill="url(#wood)" stroke="#9A7A48" rx="4" filter="url(#softShadow)" />
      {[880, 930, 980, 1050].map(x => <Chair key={`ct-${x}`} x={x} y={198} />)}
      {[880, 940, 1000, 1060].map(x => <Chair key={`cb-${x}`} x={x} y={352} rotate={180} />)}
      {[228, 280].map(y => <Chair key={`cl-${y}`} x={850} y={y} rotate={90} />)}
      {[228, 280].map(y => <Chair key={`cr-${y}`} x={1142} y={y} rotate={-90} />)}
    </g>
  );
}

function RoundMeeting() {
  const chairs = [[668, 372, 0], [632, 418, 90], [748, 418, -90], [668, 508, 180], [636, 395, 45], [746, 395, -45], [636, 462, 135], [746, 462, -135]];
  return (
    <g>
      <circle cx="700" cy="448" r="62" fill="url(#wood)" stroke="#B89A5E" strokeWidth="2" filter="url(#softShadow)" />
      {chairs.map(([x, y, r]) => <Chair key={`${x}-${y}`} x={x} y={y} rotate={r} />)}
    </g>
  );
}

function WashroomFixtures() {
  return (
    <g>
      {[620, 740, 290].map((cx, i) => <ellipse key={cx} cx={cx} cy={i === 2 ? 646 : 120} rx="20" ry="26" fill="#F8FAFC" stroke="#8AAAC0" strokeWidth="2" />)}
      <rect x="595" y="155" width="50" height="28" fill="#F8FAFC" stroke="#8AAAC0" rx="3" />
      <rect x="715" y="155" width="50" height="28" fill="#F8FAFC" stroke="#8AAAC0" rx="3" />
      <rect x="272" y="700" width="44" height="22" fill="#F8FAFC" stroke="#8AAAC0" rx="3" />
    </g>
  );
}

function BedroomFurniture() {
  return (
    <g>
      <rect x="28" y="580" width="100" height="130" fill="#E8E8E8" stroke="#AAA" rx="4" filter="url(#softShadow)" />
      <rect x="28" y="580" width="100" height="34" fill="#C8B090" rx="4" />
      <rect x="36" y="620" width="38" height="42" fill="#FFF" stroke="#CCC" rx="2" />
      <rect x="82" y="620" width="38" height="42" fill="#FFF" stroke="#CCC" rx="2" />
      <rect x="36" y="668" width="84" height="34" fill="#9A8878" rx="2" />
      <rect x="142" y="585" width="28" height="28" fill="url(#wood)" rx="2" />
    </g>
  );
}

function LobbyFurniture() {
  return (
    <g>
      <rect x="580" y="720" width="120" height="55" fill="url(#wood)" stroke="#9A7A48" rx="3" filter="url(#softShadow)" />
      <Chair x={625} y={695} />
      <rect x="402" y="700" width="100" height="50" fill="#C4B49A" stroke="#A09080" rx="5" filter="url(#softShadow)" />
      <circle cx="462" cy="670" r="24" fill="#C8B490" stroke="#B0A080" filter="url(#softShadow)" />
    </g>
  );
}

function WaitingFurniture() {
  return (
    <g>
      <rect x="822" y="660" width="80" height="38" fill="#C4B49A" stroke="#A09080" rx="5" filter="url(#softShadow)" />
      <rect x="836" y="710" width="50" height="30" fill="#D4C4A8" stroke="#B0A080" rx="3" />
      <circle cx="900" cy="690" r="20" fill="#D4C4A8" stroke="#A09080" />
    </g>
  );
}

function Printer({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <rect x={x} y={y} width="80" height="60" fill="#5A5A5A" rx="4" filter="url(#softShadow)" />
      <rect x={x + 8} y={y + 8} width="64" height="22" fill="#3A3A3A" rx="2" />
      <rect x={x + 15} y={y + 35} width="50" height="4" fill="#888" rx="1" />
      <rect x={x + 15} y={y + 42} width="50" height="4" fill="#888" rx="1" />
    </g>
  );
}
