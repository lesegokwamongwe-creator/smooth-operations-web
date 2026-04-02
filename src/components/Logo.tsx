export default function Logo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-label="Smooth Operations Logo">
      <defs>
        {/* Money Print Pattern */}
        <pattern id="money-pattern" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(25)">
          {/* Base green color */}
          <rect width="12" height="12" fill="#10b981" />
          {/* Wavy lines resembling currency engraving */}
          <path d="M 0 6 Q 3 0 6 6 T 12 6" fill="none" stroke="#047857" strokeWidth="1.5" opacity="0.7"/>
          <path d="M 0 12 Q 3 6 6 12 T 12 12" fill="none" stroke="#047857" strokeWidth="1.5" opacity="0.7"/>
          <path d="M 0 0 Q 3 -6 6 0 T 12 0" fill="none" stroke="#047857" strokeWidth="1.5" opacity="0.7"/>
          {/* Small geometric details */}
          <circle cx="6" cy="6" r="1.5" fill="none" stroke="#064e3b" strokeWidth="0.5" opacity="0.6" />
        </pattern>
        
        {/* Drop shadow for depth */}
        <filter id="logo-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="2" stdDeviation="1.5" floodColor="#022c22" floodOpacity="0.3"/>
        </filter>
      </defs>
      
      {/* The Solid 'S' */}
      <text 
        x="50%" 
        y="54%" 
        fontFamily="Arial, Helvetica, sans-serif" 
        fontWeight="900" 
        fontSize="38" 
        fill="url(#money-pattern)" 
        stroke="#064e3b" 
        strokeWidth="1.5" 
        textAnchor="middle" 
        dominantBaseline="middle"
        filter="url(#logo-shadow)"
      >
        S
      </text>
    </svg>
  );
}
