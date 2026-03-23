import React from 'react'

interface IconProps { size?: number; className?: string; style?: React.CSSProperties }

function svg(size: number, className?: string, style?: React.CSSProperties) {
  return {
    width: size, height: size, viewBox: '0 0 24 24',
    fill: 'none', stroke: 'currentColor', strokeWidth: 1.5,
    strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
    className, style,
  }
}

export function BrainIcon({ size = 20, className, style }: IconProps) {
  return <svg {...svg(size, className, style)}>
    <path d="M12 3C9 3 7 5 7 7c0 1 .4 2 1 2.5C6.5 10 6 11 6 12c0 1.5 1 2.5 2 3-.5.5-.5 1-.5 2 0 1.5 1 2 2 2h5c1 0 2-.5 2-2 0-1 0-1.5-.5-2 1-.5 2-1.5 2-3 0-1-.5-2-2-2.5.6-.5 1-1.5 1-2.5 0-2-2-4-5-4z"/>
    <path d="M12 9v6M9.5 11.5l5 1M9.5 14.5l5-1"/>
  </svg>
}

export function FocusIcon({ size = 20, className, style }: IconProps) {
  return <svg {...svg(size, className, style)}>
    <circle cx="12" cy="12" r="9"/>
    <circle cx="12" cy="12" r="4"/>
    <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/>
    <line x1="12" y1="2" x2="12" y2="5"/>
    <line x1="12" y1="19" x2="12" y2="22"/>
    <line x1="2" y1="12" x2="5" y2="12"/>
    <line x1="19" y1="12" x2="22" y2="12"/>
  </svg>
}

export function MemoryIcon({ size = 20, className, style }: IconProps) {
  return <svg {...svg(size, className, style)}>
    <rect x="3" y="3" width="7" height="7" rx="1.5"/>
    <rect x="14" y="3" width="7" height="7" rx="1.5"/>
    <rect x="3" y="14" width="7" height="7" rx="1.5"/>
    <rect x="14" y="14" width="7" height="7" rx="1.5"/>
  </svg>
}

export function LogicIcon({ size = 20, className, style }: IconProps) {
  return <svg {...svg(size, className, style)}>
    <circle cx="12" cy="4" r="2"/>
    <circle cx="5" cy="19" r="2"/>
    <circle cx="19" cy="19" r="2"/>
    <line x1="12" y1="6" x2="12" y2="13"/>
    <line x1="12" y1="13" x2="5" y2="17"/>
    <line x1="12" y1="13" x2="19" y2="17"/>
  </svg>
}

export function VisualIcon({ size = 20, className, style }: IconProps) {
  return <svg {...svg(size, className, style)}>
    <path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6-10-6-10-6z"/>
    <circle cx="12" cy="12" r="3"/>
    <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/>
  </svg>
}

export function MathIcon({ size = 20, className, style }: IconProps) {
  return <svg {...svg(size, className, style)}>
    <line x1="12" y1="4" x2="12" y2="20"/>
    <line x1="4" y1="12" x2="20" y2="12"/>
    <line x1="4" y1="6" x2="10" y2="6"/>
    <line x1="14" y1="18" x2="20" y2="18"/>
  </svg>
}

export function PulseIcon({ size = 20, className, style }: IconProps) {
  return <svg {...svg(size, className, style)}>
    <polyline points="2,12 5,12 7,5 9,19 11,9 13,15 15,12 22,12"/>
  </svg>
}

export function ArrowRightIcon({ size = 20, className, style }: IconProps) {
  return <svg {...svg(size, className, style)}>
    <line x1="4" y1="12" x2="20" y2="12"/>
    <polyline points="14,6 20,12 14,18"/>
  </svg>
}

export function ChevronLeftIcon({ size = 20, className, style }: IconProps) {
  return <svg {...svg(size, className, style)}>
    <polyline points="15,18 9,12 15,6"/>
  </svg>
}

export function CloseIcon({ size = 20, className, style }: IconProps) {
  return <svg {...svg(size, className, style)}>
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
}

export function CheckIcon({ size = 20, className, style }: IconProps) {
  return <svg {...svg(size, className, style)}>
    <polyline points="20,6 9,17 4,12"/>
  </svg>
}

export function TrendUpIcon({ size = 20, className, style }: IconProps) {
  return <svg {...svg(size, className, style)}>
    <polyline points="22,7 13,16 8,11 2,17"/>
    <polyline points="16,7 22,7 22,13"/>
  </svg>
}

export function GridIcon({ size = 20, className, style }: IconProps) {
  return <svg {...svg(size, className, style)}>
    <rect x="3" y="3" width="7" height="7" rx="1"/>
    <rect x="14" y="3" width="7" height="7" rx="1"/>
    <rect x="3" y="14" width="7" height="7" rx="1"/>
    <rect x="14" y="14" width="7" height="7" rx="1"/>
  </svg>
}
