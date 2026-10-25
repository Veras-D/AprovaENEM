import React, { useId } from 'react';
import type { AvatarConfig } from '@/types';
import { DEFAULT_AVATAR_CONFIG } from '@/types';

export interface AvatarRendererProps {
  readonly config?: AvatarConfig | null;
  readonly size?: number;
  readonly className?: string;
  readonly ariaLabel?: string;
  readonly ariaHidden?: boolean;
}

/**
 * Calculates a slightly darker shade for skin shadows, neck, and ears.
 */
function getDarkerShade(hex: string): string {
  if (hex === '#58cc02') return '#46a302';
  if (hex === '#38bdf8') return '#0284c7';
  if (hex === '#a855f7') return '#7e22ce';
  if (hex === '#fbd38d') return '#f6ad55';
  if (hex === '#f6ad55') return '#ed8936';
  if (hex === '#dd6b20') return '#c05621';
  if (hex === '#9c4221') return '#7b341e';
  if (hex === '#652b19') return '#4a1d0f';
  return '#cbd5e1';
}

export const AvatarRenderer: React.FC<AvatarRendererProps> = ({
  config = DEFAULT_AVATAR_CONFIG,
  size = 64,
  className = '',
  ariaLabel = 'Avatar do estudante',
  ariaHidden,
}) => {
  const activeConfig = config ?? DEFAULT_AVATAR_CONFIG;
  const clipId = useId();
  const shadowSkin = getDarkerShade(activeConfig.skinColor);

  return (
    <svg
      role={ariaHidden ? undefined : 'img'}
      aria-label={ariaHidden ? undefined : ariaLabel}
      aria-hidden={ariaHidden ? 'true' : undefined}
      focusable="false"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={`shrink-0 select-none ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <clipPath id={`avatar-circle-${clipId}`}>
          <circle cx="50" cy="50" r="48" />
        </clipPath>
      </defs>

      {/* Outer Border & Background Circle */}
      <circle
        cx="50"
        cy="50"
        r="49"
        fill={activeConfig.backgroundColor}
        className="stroke-slate-200 dark:stroke-slate-700"
        strokeWidth="1.5"
      />

      <g clipPath={`url(#avatar-circle-${clipId})`}>
        {/* ================= BACK HAIR ================= */}
        {activeConfig.hairStyle === 'curly' && (
          <g fill={activeConfig.hairColor}>
            <circle cx="30" cy="32" r="14" />
            <circle cx="70" cy="32" r="14" />
            <circle cx="50" cy="22" r="16" />
            <circle cx="24" cy="46" r="12" />
            <circle cx="76" cy="46" r="12" />
          </g>
        )}

        {activeConfig.hairStyle === 'wavy' && (
          <g fill={activeConfig.hairColor}>
            <path d="M 22 36 C 18 48 18 64 26 78 C 30 76 34 70 34 60 Z" />
            <path d="M 78 36 C 82 48 82 64 74 78 C 70 76 66 70 66 60 Z" />
            <circle cx="50" cy="26" r="22" />
          </g>
        )}

        {activeConfig.hairStyle === 'bun' && (
          <g fill={activeConfig.hairColor}>
            <circle cx="50" cy="14" r="13" />
            <circle cx="50" cy="26" r="22" />
          </g>
        )}

        {/* ================= NECK ================= */}
        <path
          d="M 43 60 L 57 60 L 59 74 L 41 74 Z"
          fill={shadowSkin}
        />

        {/* ================= BODY & CLOTHING ================= */}
        {/* Shoulders Base */}
        <path
          d="M 16 100 C 18 78 30 72 50 72 C 70 72 82 78 84 100 Z"
          fill={activeConfig.clothingColor}
        />

        {/* Clothing Specific Details */}
        {activeConfig.clothingStyle === 'tshirt' && (
          <path
            d="M 42 72 Q 50 82 58 72"
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
            opacity="0.9"
          />
        )}

        {activeConfig.clothingStyle === 'hoodie' && (
          <g>
            <path
              d="M 38 72 Q 50 85 62 72 Q 50 78 38 72 Z"
              fill="#0f172a"
              opacity="0.25"
            />
            {/* Drawstrings */}
            <path d="M 46 76 L 46 88" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M 54 76 L 54 88" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
          </g>
        )}

        {activeConfig.clothingStyle === 'academic' && (
          <g>
            {/* White Collared Shirt Peak */}
            <polygon points="43,72 57,72 50,83" fill="#ffffff" />
            {/* Red / Gold Academic Tie */}
            <polygon points="48,77 52,77 54,92 50,96 46,92" fill="#ef4444" />
            {/* V-neck Sweater Edge */}
            <path d="M 38 72 L 50 85 L 62 72" stroke="#0f172a" strokeWidth="1.5" fill="none" opacity="0.3" />
          </g>
        )}

        {activeConfig.clothingStyle === 'vest' && (
          <g>
            {/* Yellow ENEM Candidate Lanyard */}
            <path d="M 42 72 L 48 95" stroke="#f59e0b" strokeWidth="2.5" />
            <path d="M 58 72 L 52 95" stroke="#f59e0b" strokeWidth="2.5" />
            {/* Mini ENEM Badge */}
            <rect x="44" y="86" width="12" height="12" rx="2" fill="#ffffff" stroke="#f59e0b" strokeWidth="1" />
            <text x="50" y="93" fontSize="4.5" fontWeight="bold" textAnchor="middle" fill="#0284c7">
              ENEM
            </text>
            <text x="50" y="97" fontSize="3" fontWeight="bold" textAnchor="middle" fill="#10b981">
              1000
            </text>
          </g>
        )}

        {/* ================= HEAD ================= */}
        {/* Ears */}
        <circle cx="28" cy="48" r="5.5" fill={activeConfig.skinColor} />
        <circle cx="28" cy="48" r="3" fill={shadowSkin} opacity="0.6" />
        <circle cx="72" cy="48" r="5.5" fill={activeConfig.skinColor} />
        <circle cx="72" cy="48" r="3" fill={shadowSkin} opacity="0.6" />

        {/* Main Face Shape */}
        <rect
          x="28"
          y="24"
          width="44"
          height="46"
          rx="22"
          fill={activeConfig.skinColor}
        />

        {/* Cheerful Blush Cheeks */}
        <circle cx="34" cy="52" r="3.5" fill="#f43f5e" opacity="0.22" />
        <circle cx="66" cy="52" r="3.5" fill="#f43f5e" opacity="0.22" />

        {/* Tiny Button Nose */}
        <ellipse cx="50" cy="49" rx="2" ry="1.4" fill={shadowSkin} opacity="0.65" />

        {/* ================= EYES & EYEBROWS ================= */}
        {/* Eyebrows */}
        <path
          d="M 34 38 Q 40 34 46 37"
          stroke={activeConfig.hairColor}
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 54 37 Q 60 34 66 38"
          stroke={activeConfig.hairColor}
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Eyes by Expression */}
        {activeConfig.eyeExpression === 'cheerful' && (
          <g stroke="#1e293b" strokeWidth="2.6" strokeLinecap="round" fill="none">
            <path d="M 35 46 Q 40 40 45 46" />
            <path d="M 55 46 Q 60 40 65 46" />
          </g>
        )}

        {activeConfig.eyeExpression === 'focused' && (
          <g>
            <ellipse cx="40" cy="45" rx="4.5" ry="5.5" fill="#1e293b" />
            <circle cx="41.5" cy="43" r="1.5" fill="#ffffff" />
            <ellipse cx="60" cy="45" rx="4.5" ry="5.5" fill="#1e293b" />
            <circle cx="61.5" cy="43" r="1.5" fill="#ffffff" />
          </g>
        )}

        {activeConfig.eyeExpression === 'glasses' && (
          <g>
            {/* Eyes behind glasses */}
            <circle cx="40" cy="45" r="3.5" fill="#1e293b" />
            <circle cx="41" cy="44" r="1.2" fill="#ffffff" />
            <circle cx="60" cy="45" r="3.5" fill="#1e293b" />
            <circle cx="61" cy="44" r="1.2" fill="#ffffff" />

            {/* Spectacle Frames */}
            <circle cx="40" cy="45" r="7.5" fill="none" stroke="#0f172a" strokeWidth="2.2" />
            <circle cx="60" cy="45" r="7.5" fill="none" stroke="#0f172a" strokeWidth="2.2" />
            <path d="M 47.5 45 Q 50 43 52.5 45" stroke="#0f172a" strokeWidth="2.2" fill="none" />
            {/* Frame temples */}
            <path d="M 32.5 45 L 28 44" stroke="#0f172a" strokeWidth="2" />
            <path d="M 67.5 45 L 72 44" stroke="#0f172a" strokeWidth="2" />
          </g>
        )}

        {activeConfig.eyeExpression === 'sunglasses' && (
          <g>
            {/* Left lens */}
            <path d="M 32 41 L 48 41 L 46 51 C 45 54 34 54 32 51 Z" fill="#0f172a" />
            {/* Right lens */}
            <path d="M 52 41 L 68 41 L 66 51 C 65 54 54 54 52 51 Z" fill="#0f172a" />
            {/* Bridge */}
            <rect x="47" y="41" width="6" height="2.5" fill="#0f172a" />
            {/* Cool Glare Reflection Lines */}
            <path d="M 34 43 L 42 51" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
            <path d="M 54 43 L 62 51" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
          </g>
        )}

        {/* ================= MOUTH ================= */}
        {activeConfig.mouthExpression === 'smile' && (
          <path
            d="M 42 56 Q 50 62 58 56"
            stroke="#1e293b"
            strokeWidth="2.6"
            strokeLinecap="round"
            fill="none"
          />
        )}

        {activeConfig.mouthExpression === 'openSmile' && (
          <g>
            {/* Cheerful Open Mouth */}
            <path
              d="M 40 55 Q 50 67 60 55 Z"
              fill="#991b1b"
            />
            {/* Top Teeth */}
            <path
              d="M 42 55.5 Q 50 59 58 55.5 Z"
              fill="#ffffff"
            />
            {/* Tongue */}
            <path
              d="M 46 63 Q 50 61 54 63 Q 50 66 46 63 Z"
              fill="#f43f5e"
            />
          </g>
        )}

        {activeConfig.mouthExpression === 'grin' && (
          <g>
            <path
              d="M 40 56 Q 50 65 60 56 Z"
              fill="#ffffff"
              stroke="#1e293b"
              strokeWidth="2.2"
            />
            <path d="M 40 56 L 60 56" stroke="#1e293b" strokeWidth="2.2" />
          </g>
        )}

        {activeConfig.mouthExpression === 'smirk' && (
          <path
            d="M 43 58 Q 52 60 58 53"
            stroke="#1e293b"
            strokeWidth="2.6"
            strokeLinecap="round"
            fill="none"
          />
        )}

        {/* ================= FRONT HAIR / BANGS ================= */}
        {activeConfig.hairStyle === 'short' && (
          <path
            d="M 28 34 C 28 20 40 18 54 18 C 68 18 72 24 72 34 C 65 24 54 24 48 24 C 40 24 32 28 28 34 Z"
            fill={activeConfig.hairColor}
          />
        )}

        {activeConfig.hairStyle === 'curly' && (
          <g fill={activeConfig.hairColor}>
            <circle cx="34" cy="26" r="8" />
            <circle cx="45" cy="23" r="9" />
            <circle cx="56" cy="23" r="9" />
            <circle cx="66" cy="26" r="8" />
            <circle cx="40" cy="29" r="6" />
            <circle cx="60" cy="29" r="6" />
          </g>
        )}

        {activeConfig.hairStyle === 'wavy' && (
          <path
            d="M 28 34 C 34 22 46 20 54 20 C 66 20 72 26 72 34 C 68 28 58 27 50 31 C 42 27 34 28 28 34 Z"
            fill={activeConfig.hairColor}
          />
        )}

        {activeConfig.hairStyle === 'bun' && (
          <path
            d="M 28 32 C 34 22 46 20 54 20 C 66 20 72 24 72 32 C 64 26 55 25 48 27 C 40 25 34 26 28 32 Z"
            fill={activeConfig.hairColor}
          />
        )}

        {activeConfig.hairStyle === 'spiky' && (
          <g fill={activeConfig.hairColor}>
            <polygon points="30,30 38,15 42,26" />
            <polygon points="40,24 50,12 56,24" />
            <polygon points="54,24 64,15 68,30" />
            <path d="M 28 32 Q 50 20 72 32 Z" />
          </g>
        )}

        {activeConfig.hairStyle === 'bald' && (
          /* Sleek shine highlight on bald scalp */
          <path
            d="M 38 27 Q 44 23 52 24"
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            opacity="0.4"
          />
        )}

        {/* ================= ACCESSORIES ================= */}
        {activeConfig.accessory === 'headphones' && (
          <g>
            {/* Headband Arch */}
            <path
              d="M 25 48 A 26 26 0 0 1 75 48"
              stroke="#0284c7"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />
            {/* Left Earcup */}
            <rect x="20" y="40" width="8" height="16" rx="4" fill="#0284c7" stroke="#ffffff" strokeWidth="1" />
            {/* Right Earcup */}
            <rect x="72" y="40" width="8" height="16" rx="4" fill="#0284c7" stroke="#ffffff" strokeWidth="1" />
          </g>
        )}

        {activeConfig.accessory === 'graduationCap' && (
          <g>
            {/* Cap Skull Base */}
            <path d="M 34 24 Q 50 30 66 24 L 66 28 Q 50 34 34 28 Z" fill="#1e293b" />
            {/* Diamond Biretta Top */}
            <polygon points="50,10 74,18 50,26 26,18" fill="#0f172a" stroke="#334155" strokeWidth="0.8" />
            {/* Center Button */}
            <circle cx="50" cy="18" r="2.2" fill="#f59e0b" />
            {/* Golden Dangling Tassel */}
            <path
              d="M 50 18 Q 32 20 30 34"
              stroke="#f59e0b"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
            <circle cx="30" cy="35" r="2.5" fill="#f59e0b" />
          </g>
        )}

        {activeConfig.accessory === 'pencil' && (
          <g>
            {/* Yellow ENEM Pencil behind right ear */}
            <line x1="68" y1="52" x2="80" y2="34" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
            {/* Pink Eraser Tip */}
            <line x1="77.5" y1="37.5" x2="80" y2="34" stroke="#f43f5e" strokeWidth="3" strokeLinecap="round" />
            {/* Dark Graphite Tip */}
            <line x1="68" y1="52" x2="69" y2="50" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
          </g>
        )}
      </g>
    </svg>
  );
};
