import React from 'react';

interface SpaceXIconProps {
  size?: number;
  className?: string;
  withGlow?: boolean;
}

export const SpaceXIcon: React.FC<SpaceXIconProps> = ({ 
  size = 28, 
  className = '',
  withGlow = false 
}) => {
  return (
    <div 
      className={`relative inline-flex items-center justify-center shrink-0 rounded-full select-none ${withGlow ? 'shadow-[0_0_15px_rgba(255,255,255,0.4)]' : ''} ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full transform transition-transform duration-200"
      >
        {/* Background Circle */}
        <circle cx="50" cy="50" r="48" fill="#000000" stroke="#333333" strokeWidth="2" />
        
        {/* Outer Orbit Ring Accent */}
        <circle cx="50" cy="50" r="43" stroke="#222222" strokeWidth="1.5" strokeDasharray="4 3" />
        
        {/* SpaceX Iconic 'X' Geometry */}
        {/* Left diagonal bar */}
        <path
          d="M26 28 L38 28 L74 74 L62 74 Z"
          fill="#FFFFFF"
        />

        {/* Dynamic Curved Rocket Trajectory Swoosh (The Signature SpaceX 'X' Swoop) */}
        <path
          d="M74 27 C64 36, 42 56, 24 73 C33 71, 54 58, 77 34 C79 31, 77 28, 74 27 Z"
          fill="#FFFFFF"
        />

        {/* Orbital Trajectory Spark / Rocket Tip */}
        <circle cx="77" cy="30" r="2.5" fill="#0084FF" />
      </svg>
    </div>
  );
};

// Backwards compatibility alias
export const PeaceXIcon = SpaceXIcon;

export const SPACEX_FAVICON_SVG = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='48' fill='%23000000'/><path d='M26 28 L38 28 L74 74 L62 74 Z' fill='%23FFFFFF'/><path d='M74 27 C64 36, 42 56, 24 73 C33 71, 54 58, 77 34 C79 31, 77 28, 74 27 Z' fill='%23FFFFFF'/><circle cx='77' cy='30' r='3' fill='%230084FF'/></svg>`;
