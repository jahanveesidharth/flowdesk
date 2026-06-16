import React from 'react';
import type { FurnitureType } from '../../types';

interface FurnitureAssetProps {
  type: FurnitureType | string;
  className?: string;
}

export function FurnitureAsset({ type, className = "w-full h-full" }: FurnitureAssetProps) {
  switch (type) {
    case 'plant':
      return (
        <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="16" fill="#15803d" fillOpacity="0.1" stroke="#16a34a" strokeWidth="1.5" />
          <circle cx="20" cy="20" r="8" fill="#166534" stroke="#15803d" strokeWidth="1" />
          {/* Leaves */}
          <path d="M20 12 C22 17, 24 17, 26 15 C24 19, 22 19, 20 28" fill="#22c55e" fillOpacity="0.8" />
          <path d="M20 12 C18 17, 16 17, 14 15 C16 19, 18 19, 20 28" fill="#22c55e" fillOpacity="0.8" />
          <path d="M12 20 C17 22, 17 24, 15 26 C19 24, 19 22, 28 20" fill="#22c55e" fillOpacity="0.8" />
          <path d="M12 20 C17 18, 17 16, 15 14 C19 16, 19 18, 28 20" fill="#22c55e" fillOpacity="0.8" />
        </svg>
      );
    case 'couch':
      return (
        <svg className={className} viewBox="0 0 80 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="2" width="76" height="36" rx="6" fill="#e5e7eb" fillOpacity="0.9" stroke="#475569" strokeWidth="2.5" />
          {/* Backrest cushion */}
          <rect x="5" y="5" width="70" height="9" rx="3" fill="#cbd5e1" stroke="#475569" strokeWidth="1.5" />
          {/* Seat cushions */}
          <rect x="8" y="16" width="31" height="17" rx="3" fill="#f1f5f9" stroke="#64748b" strokeWidth="1.5" />
          <rect x="41" y="16" width="31" height="17" rx="3" fill="#f1f5f9" stroke="#64748b" strokeWidth="1.5" />
          {/* Armrests */}
          <rect x="5" y="12" width="5" height="21" rx="2.5" fill="#94a3b8" />
          <rect x="70" y="12" width="5" height="21" rx="2.5" fill="#94a3b8" />
        </svg>
      );
    case 'printer':
      return (
        <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="4" y="4" width="32" height="32" rx="4" fill="#334155" stroke="#1e293b" strokeWidth="2.5" />
          {/* Console screen panel */}
          <rect x="8" y="8" width="24" height="7" rx="1.5" fill="#0f172a" stroke="#475569" strokeWidth="1" />
          <circle cx="12" cy="11.5" r="1.5" fill="#22c55e" />
          <circle cx="16" cy="11.5" r="1.5" fill="#3b82f6" />
          <circle cx="28" cy="11.5" r="1.5" fill="#ef4444" />
          {/* Paper exit tray */}
          <rect x="8" y="19" width="24" height="11" rx="1" fill="#475569" stroke="#1e293b" strokeWidth="1" />
          {/* Outgoing paper */}
          <rect x="11" y="21" width="18" height="6" rx="0.5" fill="#ffffff" />
          <line x1="14" y1="24" x2="26" y2="24" stroke="#94a3b8" strokeWidth="1" />
        </svg>
      );
    case 'coffee_machine':
      return (
        <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="6" y="4" width="28" height="32" rx="4" fill="#1e293b" stroke="#0f172a" strokeWidth="2.5" />
          {/* Screen */}
          <rect x="11" y="8" width="18" height="7" rx="1" fill="#0284c7" />
          <text x="20" y="13.5" fill="#ffffff" fontSize="5" fontWeight="bold" fontFamily="monospace" textAnchor="middle">READY</text>
          {/* Nozzle and cup platform */}
          <rect x="18" y="19" width="4" height="3" fill="#475569" />
          <rect x="10" y="28" width="20" height="4" rx="1" fill="#0f172a" stroke="#334155" strokeWidth="1" />
          <circle cx="13" cy="30" r="1" fill="#475569" />
          <circle cx="27" cy="30" r="1" fill="#475569" />
          {/* Mug */}
          <path d="M16 21 H24 L23 27 H17 Z" fill="#ffffff" stroke="#94a3b8" strokeWidth="1" />
        </svg>
      );
    case 'water_cooler':
      return (
        <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="16" fill="#f8fafc" stroke="#64748b" strokeWidth="2" />
          {/* Water jug */}
          <ellipse cx="20" cy="14" rx="9" ry="8" fill="#38bdf8" fillOpacity="0.75" stroke="#0284c7" strokeWidth="1.5" />
          {/* Dispenser buttons */}
          <rect x="16" y="24" width="3" height="3" rx="0.5" fill="#3b82f6" />
          <rect x="21" y="24" width="3" height="3" rx="0.5" fill="#ef4444" />
          {/* Water stream */}
          <path d="M20 27 V31" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case 'restroom_toilet':
      return (
        <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Toilet Tank */}
          <rect x="9" y="4" width="22" height="9" rx="2.5" fill="#ffffff" stroke="#475569" strokeWidth="2.5" />
          {/* Flush handle */}
          <rect x="12" y="7" width="4" height="2" rx="0.5" fill="#cbd5e1" stroke="#475569" strokeWidth="1" />
          {/* Bowl and seat outline */}
          <ellipse cx="20" cy="24" rx="10" ry="11" fill="#ffffff" stroke="#475569" strokeWidth="2.5" />
          {/* Water line / Inner bowl */}
          <ellipse cx="20" cy="24" rx="6" ry="7" fill="#bae6fd" fillOpacity="0.4" stroke="#94a3b8" strokeWidth="1" />
        </svg>
      );
    case 'restroom_sink':
      return (
        <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Countertop */}
          <rect x="4" y="4" width="32" height="32" rx="4" fill="#ffffff" stroke="#475569" strokeWidth="2.5" />
          {/* Basin oval */}
          <ellipse cx="20" cy="20" rx="11" ry="9" fill="#f1f5f9" stroke="#64748b" strokeWidth="1.5" strokeDasharray="30,1" />
          {/* Drain */}
          <circle cx="20" cy="20" r="1.5" fill="#94a3b8" />
          {/* Faucet */}
          <path d="M20 6 V11" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M19 11 H21" stroke="#64748b" strokeWidth="1.5" />
          {/* Taps */}
          <circle cx="16" cy="8" r="1.5" fill="#3b82f6" />
          <circle cx="24" cy="8" r="1.5" fill="#ef4444" />
        </svg>
      );
    case 'tv':
      return (
        <svg className={className} viewBox="0 0 80 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="4" width="76" height="12" rx="2" fill="#0f172a" stroke="#1e293b" strokeWidth="2" />
          {/* Glass glare line */}
          <path d="M5 6 L25 14" stroke="#ffffff" strokeWidth="1" opacity="0.15" />
          {/* Stand bracket */}
          <rect x="34" y="16" width="12" height="2" fill="#475569" />
        </svg>
      );
    case 'dining_table':
      return (
        <svg className={className} viewBox="0 0 80 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Wooden Table surface */}
          <rect x="8" y="8" width="64" height="24" rx="4" fill="#dcb582" stroke="#475569" strokeWidth="2" />
          {/* Table edge inset line */}
          <rect x="10" y="10" width="60" height="20" rx="3" fill="none" stroke="#ffffff" strokeWidth="1" opacity="0.3" />
          {/* 6 chairs surrounding table */}
          {/* Top 3 */}
          <rect x="18" y="2" width="12" height="5" rx="1.5" fill="#1e293b" stroke="#000" strokeWidth="1" />
          <rect x="34" y="2" width="12" height="5" rx="1.5" fill="#1e293b" stroke="#000" strokeWidth="1" />
          <rect x="50" y="2" width="12" height="5" rx="1.5" fill="#1e293b" stroke="#000" strokeWidth="1" />
          {/* Bottom 3 */}
          <rect x="18" y="33" width="12" height="5" rx="1.5" fill="#1e293b" stroke="#000" strokeWidth="1" />
          <rect x="34" y="33" width="12" height="5" rx="1.5" fill="#1e293b" stroke="#000" strokeWidth="1" />
          <rect x="50" y="33" width="12" height="5" rx="1.5" fill="#1e293b" stroke="#000" strokeWidth="1" />
        </svg>
      );
    case 'pool_table':
      return (
        <svg className={className} viewBox="0 0 80 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Wood rail border */}
          <rect x="2" y="2" width="76" height="36" rx="4" fill="#5c3616" stroke="#2d1705" strokeWidth="2.5" />
          {/* Green felt felt-surface */}
          <rect x="6" y="6" width="68" height="28" rx="1" fill="#15803d" stroke="#166534" strokeWidth="1" />
          {/* Cushions */}
          <rect x="7" y="7" width="66" height="2" fill="#166534" />
          <rect x="7" y="31" width="66" height="2" fill="#166534" />
          {/* Pockets */}
          <circle cx="8" cy="8" r="3.5" fill="#090d16" />
          <circle cx="40" cy="7.5" r="3.5" fill="#090d16" />
          <circle cx="72" cy="8" r="3.5" fill="#090d16" />
          <circle cx="8" cy="32" r="3.5" fill="#090d16" />
          <circle cx="40" cy="32.5" r="3.5" fill="#090d16" />
          <circle cx="72" cy="32" r="3.5" fill="#090d16" />
          {/* Placed Billiard Balls */}
          <circle cx="22" cy="20" r="1.8" fill="#ffffff" />
          <circle cx="52" cy="20" r="1.8" fill="#ef4444" />
          <circle cx="56" cy="18" r="1.8" fill="#f59e0b" />
          <circle cx="56" cy="22" r="1.8" fill="#3b82f6" />
        </svg>
      );
    case 'ping_pong':
      return (
        <svg className={className} viewBox="0 0 80 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Blue surface with white border */}
          <rect x="2" y="2" width="76" height="36" fill="#1d4ed8" stroke="#ffffff" strokeWidth="2" />
          {/* Table center divider line */}
          <line x1="2" y1="20" x2="78" y2="20" stroke="#ffffff" strokeWidth="1" strokeDasharray="3,3" />
          {/* Net across the center */}
          <rect x="39" y="0" width="2" height="40" fill="#94a3b8" stroke="#475569" strokeWidth="0.5" />
          {/* Paddles */}
          <circle cx="24" cy="14" r="2.5" fill="#dc2626" />
          <rect x="24" y="16" width="1" height="4" fill="#d97706" />
          <circle cx="56" cy="26" r="2.5" fill="#047857" />
          <rect x="56" y="20" width="1" height="4" fill="#d97706" />
          {/* Table tennis ball */}
          <circle cx="36" cy="24" r="1.2" fill="#ffffff" />
        </svg>
      );
    case 'lounge_chair':
      return (
        <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="4" y="4" width="32" height="32" rx="8" fill="#e5e7eb" stroke="#475569" strokeWidth="2.5" />
          {/* Back cushion */}
          <path d="M 6 10 C 6 6, 34 6, 34 10" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
          {/* Armrests */}
          <rect x="4" y="11" width="5.5" height="21" rx="2.5" fill="#cbd5e1" stroke="#475569" strokeWidth="1" />
          <rect x="30.5" y="11" width="5.5" height="21" rx="2.5" fill="#cbd5e1" stroke="#475569" strokeWidth="1" />
          {/* Inside seat cushion */}
          <rect x="11.5" y="12" width="17" height="18" rx="4" fill="#ffffff" stroke="#64748b" strokeWidth="1.5" />
        </svg>
      );
    case 'bed':
      return (
        <svg className={className} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Base wooden frame */}
          <rect x="6" y="16" width="68" height="58" rx="3" fill="#ffffff" stroke="#475569" strokeWidth="2.5" />
          {/* Pillows */}
          <rect x="12" y="22" width="24" height="12" rx="2" fill="#f1f5f9" stroke="#64748b" strokeWidth="1.5" />
          <rect x="44" y="22" width="24" height="12" rx="2" fill="#f1f5f9" stroke="#64748b" strokeWidth="1.5" />
          {/* Sheets border line fold */}
          <line x1="6" y1="42" x2="74" y2="42" stroke="#475569" strokeWidth="2" />
          {/* Sheets quilt texture path */}
          <rect x="6" y="42" width="68" height="32" fill="#f8fafc" fillOpacity="0.4" />
          {/* Nightstands left/right */}
          <rect x="8" y="2" width="14" height="10" rx="1.5" fill="#ffffff" stroke="#475569" strokeWidth="1.5" />
          <rect x="58" y="2" width="14" height="10" rx="1.5" fill="#ffffff" stroke="#475569" strokeWidth="1.5" />
        </svg>
      );
    case 'server_rack':
      return (
        <svg className={className} viewBox="0 0 40 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Outer enclosure cabinet */}
          <rect x="2" y="2" width="36" height="56" rx="4" fill="#1e293b" stroke="#090d16" strokeWidth="2.5" />
          {/* Internal rows grid */}
          <rect x="5" y="6" width="30" height="48" rx="2" fill="#020617" />
          {/* Blinking slots LED bars */}
          {Array.from({ length: 9 }, (_, i) => {
            const rowY = 10 + i * 5;
            return (
              <g key={i}>
                <rect x="7" y={rowY} width="26" height="2" rx="0.5" fill="#334155" />
                {/* Active status lights */}
                <circle cx="10" cy={rowY + 1} r="0.75" fill={i % 3 === 0 ? "#10b981" : i % 3 === 1 ? "#3b82f6" : "#eab308"} />
                <circle cx="13" cy={rowY + 1} r="0.75" fill="#10b981" />
              </g>
            );
          })}
        </svg>
      );
    default:
      return <div className="w-full h-full bg-gray-250 border border-gray-400 select-none flex items-center justify-center text-[10px] text-gray-500 font-bold">{type}</div>;
  }
}
