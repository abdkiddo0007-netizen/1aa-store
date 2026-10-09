interface OneAALogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  variant?: 'light' | 'dark' | 'adaptive';
}

export default function OneAALogo({
  className = '',
  size = 'md',
  showTagline = true,
  variant = 'adaptive',
}: OneAALogoProps) {
  // Dimensions per size
  const dimensions = {
    sm: { height: 28, textClass: 'text-sm', subTextClass: 'text-[9px]' },
    md: { height: 40, textClass: 'text-lg', subTextClass: 'text-[11px]' },
    lg: { height: 56, textClass: 'text-2xl', subTextClass: 'text-xs' },
    xl: { height: 80, textClass: 'text-4xl', subTextClass: 'text-base' },
  }[size];

  const textColor = {
    light: 'text-obsidian-950',
    dark: 'text-white',
    adaptive: 'text-slate-900 dark:text-white',
  }[variant];

  const subtextColor = {
    light: 'text-brand-blue font-serif italic',
    dark: 'text-brand-orange font-serif italic',
    adaptive: 'text-slate-600 dark:text-slate-300 font-serif italic',
  }[variant];

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* 3D Intertwined Ribbon Icon */}
      <svg
        viewBox="0 0 240 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ height: `${dimensions.height}px`, width: 'auto' }}
        className="filter drop-shadow-md shrink-0"
      >
        <defs>
          {/* Blue Gradient - Official #0047AB */}
          <linearGradient id="blueRibbon" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0066FF" />
            <stop offset="45%" stopColor="#0047AB" />
            <stop offset="100%" stopColor="#002D6E" />
          </linearGradient>

          {/* Orange Gradient - Official #FF8C00 */}
          <linearGradient id="orangeRibbon" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFA028" />
            <stop offset="50%" stopColor="#FF8C00" />
            <stop offset="100%" stopColor="#D95700" />
          </linearGradient>

          {/* Shading filter */}
          <filter id="ribbonShadow" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="2" dy="4" stdDeviation="3" floodOpacity="0.35" floodColor="#001438" />
          </filter>
        </defs>

        {/* --- 1AA Stylized 3D Ribbon Paths --- */}
        {/* Left Orange Spine for "1" */}
        <path
          d="M 50 25 L 50 145 L 62 145 L 62 48 L 74 38 Z"
          fill="url(#orangeRibbon)"
        />

        {/* Main "1" Body - Cobalt Blue */}
        <path
          d="M 28 45 L 48 30 L 48 145 L 30 145 L 30 135 L 40 135 L 40 45 Z"
          fill="url(#blueRibbon)"
        />
        <path
          d="M 22 145 L 72 145 L 72 135 L 52 135 L 52 35 L 32 50 L 22 145 Z"
          fill="url(#blueRibbon)"
          opacity="0.95"
        />

        {/* Ribbon Loop Arching up and forming the first 'A' */}
        <path
          d="M 52 35 C 75 10, 110 18, 122 55 C 132 85, 142 125, 160 135 C 172 142, 188 135, 194 115 C 200 95, 192 70, 172 65 C 152 60, 138 85, 126 110 C 118 128, 102 145, 82 145 C 68 145, 60 132, 62 118 C 65 100, 80 82, 100 68"
          stroke="url(#blueRibbon)"
          strokeWidth="24"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          filter="url(#ribbonShadow)"
        />

        {/* Intertwined Orange Infinity Ribbon forming the second 'A' */}
        <path
          d="M 115 145 C 130 120, 144 75, 166 45 C 180 25, 202 24, 216 38 C 228 50, 230 75, 218 100 C 206 125, 185 145, 162 145 C 145 145, 135 130, 138 112 C 142 90, 162 70, 185 70 C 196 70, 208 78, 205 92 C 202 105, 188 116, 172 118"
          stroke="url(#orangeRibbon)"
          strokeWidth="22"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          filter="url(#ribbonShadow)"
        />

        {/* Foreground accent knot bridging the blue and orange loop */}
        <path
          d="M 125 58 C 140 85, 155 110, 175 115 C 190 120, 204 110, 208 95"
          stroke="url(#blueRibbon)"
          strokeWidth="18"
          strokeLinecap="round"
          fill="none"
        />

        {/* Orange loop accent overlay */}
        <path
          d="M 166 45 C 178 30, 196 28, 208 40 C 218 50, 220 70, 212 90"
          stroke="url(#orangeRibbon)"
          strokeWidth="16"
          strokeLinecap="round"
          fill="none"
        />
      </svg>

      {/* Brand Title & Tagline */}
      <div className="flex flex-col justify-center leading-tight">
        <div className={`font-black tracking-tight ${dimensions.textClass} ${textColor} flex items-center gap-1.5`}>
          <span>1AA</span>
          <span className="font-semibold opacity-90 text-sm sm:text-base">(Available Always)</span>
        </div>
        {showTagline && (
          <div className={`${dimensions.subTextClass} ${subtextColor} tracking-wide -mt-0.5`}>
            1st Available Always
          </div>
        )}
      </div>
    </div>
  );
}
