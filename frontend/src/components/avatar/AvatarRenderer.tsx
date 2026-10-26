import React, { useId } from 'react';
import type { AvatarConfig } from '@/types';
import { DEFAULT_AVATAR_CONFIG } from '@/types';
import { REALISTIC_SKIN_PALETTE } from './avatar-constants';

export type { SkinToneOption } from './avatar-constants';
export { REALISTIC_SKIN_PALETTE } from './avatar-constants';

export interface AvatarRendererProps {
  readonly config?: AvatarConfig | null;
  readonly size?: number;
  readonly className?: string;
  readonly ariaLabel?: string;
  readonly ariaHidden?: boolean;
}

/**
 * Derives coordinated shadow shade for realistic neck, ear, and jawline depth.
 */
function getDarkerShade(hex: string): string {
  const match = REALISTIC_SKIN_PALETTE.find((s) => s.hex.toLowerCase() === hex.toLowerCase());
  if (match) return match.shadow;

  const cleanHex = hex.replace('#', '');
  if (cleanHex.length === 6) {
    const r = Math.max(0, Math.round(parseInt(cleanHex.slice(0, 2), 16) * 0.76));
    const g = Math.max(0, Math.round(parseInt(cleanHex.slice(2, 4), 16) * 0.76));
    const b = Math.max(0, Math.round(parseInt(cleanHex.slice(4, 6), 16) * 0.76));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
  return '#9a5e2f';
}

/**
 * Derives coordinated soft cheek blush matching the student's skin undertone.
 */
function getBlushColor(hex: string): string {
  const match = REALISTIC_SKIN_PALETTE.find((s) => s.hex.toLowerCase() === hex.toLowerCase());
  if (match) return match.blush;
  return '#f87171';
}

/**
 * Stardew Valley-inspired 16-bit Cozy Pixel Art Avatar Renderer.
 * Utilizes crispEdges shape rendering and integer-aligned geometry for harmonious component stacking.
 */
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
  const blushColor = getBlushColor(activeConfig.skinColor);

  return (
    <svg
      role={ariaHidden ? undefined : 'img'}
      aria-label={ariaHidden ? undefined : ariaLabel}
      aria-hidden={ariaHidden ? 'true' : undefined}
      focusable="false"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      shapeRendering="crispEdges"
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
        {/* ================= BACK HAIR LAYER (Behind Head & Shoulders) ================= */}
        {activeConfig.hairStyle === 'wavy' && (
          <g fill={activeConfig.hairColor}>
            {/* Cascading side waves */}
            <rect x="20" y="32" width="10" height="42" rx="2" />
            <rect x="70" y="32" width="10" height="42" rx="2" />
            <rect x="24" y="20" width="52" height="18" rx="4" />
          </g>
        )}

        {activeConfig.hairStyle === 'curly' && (
          <g fill={activeConfig.hairColor}>
            {/* Textured pixel volume crown */}
            <rect x="22" y="16" width="56" height="24" rx="6" />
            <rect x="18" y="26" width="10" height="26" rx="4" />
            <rect x="72" y="26" width="10" height="26" rx="4" />
          </g>
        )}

        {activeConfig.hairStyle === 'bun' && (
          <g fill={activeConfig.hairColor}>
            {/* Topknot bun atop head */}
            <rect x="40" y="10" width="20" height="14" rx="4" />
            <rect x="44" y="8" width="12" height="4" rx="2" fill="#f59e0b" />
          </g>
        )}

        {activeConfig.hairStyle === 'spiky' && (
          <g fill={activeConfig.hairColor}>
            {/* Crown spikes peeking upward */}
            <polygon points="30,26 38,12 44,26" />
            <polygon points="44,24 50,8 56,24" />
            <polygon points="56,26 62,12 70,26" />
          </g>
        )}

        {/* ================= NECK & SHADOW ================= */}
        <rect x="43" y="58" width="14" height="12" fill={shadowSkin} />

        {/* ================= BODY & CLOTHING (Shoulders & Torso) ================= */}
        {/* Pixel Shoulders Base */}
        <polygon
          points="14,100 18,72 34,68 66,68 82,72 86,100"
          fill={activeConfig.clothingColor}
        />
        {/* Shoulder highlights & contour */}
        <rect x="20" y="74" width="60" height="26" fill={activeConfig.clothingColor} />

        {/* Clothing Specific Details */}
        {activeConfig.clothingStyle === 'tshirt' && (
          <g>
            {/* Crewneck Collar Ribbing */}
            <path
              d="M 40 68 Q 50 78 60 68"
              stroke="#ffffff"
              strokeWidth="2.5"
              fill="none"
              opacity="0.95"
            />
          </g>
        )}

        {activeConfig.clothingStyle === 'hoodie' && (
          <g>
            {/* Cozy Hoodie Rim */}
            <polygon points="38,68 50,80 62,68 50,73" fill="#0f172a" opacity="0.3" />
            {/* Two White Drawstring Cords */}
            <rect x="46" y="74" width="2" height="14" rx="0.5" fill="#ffffff" />
            <rect x="52" y="74" width="2" height="14" rx="0.5" fill="#ffffff" />
          </g>
        )}

        {activeConfig.clothingStyle === 'academic' && (
          <g>
            {/* White Collared Shirt Peak */}
            <polygon points="40,68 60,68 50,80" fill="#ffffff" />
            {/* Academic Crimson Necktie */}
            <polygon points="48,74 52,74 54,92 50,96 46,92" fill="#b91c1c" />
            {/* Gold Knot Accent */}
            <rect x="48" y="74" width="4" height="4" fill="#f59e0b" />
          </g>
        )}

        {activeConfig.clothingStyle === 'vest' && (
          <g>
            {/* Yellow ENEM Lanyard */}
            <line x1="42" y1="68" x2="47" y2="88" stroke="#f59e0b" strokeWidth="2.5" />
            <line x1="58" y1="68" x2="53" y2="88" stroke="#f59e0b" strokeWidth="2.5" />
            {/* Candidate ID Credential Badge */}
            <rect x="44" y="82" width="12" height="14" rx="1.5" fill="#ffffff" stroke="#f59e0b" strokeWidth="1" />
            <text x="50" y="89" fontSize="4.5" fontWeight="bold" textAnchor="middle" fill="#0284c7">
              ENEM
            </text>
            <text x="50" y="93.5" fontSize="3" fontWeight="bold" textAnchor="middle" fill="#10b981">
              1000
            </text>
          </g>
        )}

        {/* ================= HEAD & EARS ================= */}
        {/* Left Ear */}
        <rect x="23" y="42" width="6" height="12" rx="2" fill={activeConfig.skinColor} />
        <rect x="25" y="44" width="3" height="8" rx="1" fill={shadowSkin} opacity="0.6" />

        {/* Right Ear */}
        <rect x="71" y="42" width="6" height="12" rx="2" fill={activeConfig.skinColor} />
        <rect x="72" y="44" width="3" height="8" rx="1" fill={shadowSkin} opacity="0.6" />

        {/* Main Pixel Face Shape */}
        <rect x="28" y="24" width="44" height="36" rx="4" fill={activeConfig.skinColor} />
        {/* Tapered Pixel Jaw & Chin */}
        <polygon
          points="28,52 34,64 66,64 72,52"
          fill={activeConfig.skinColor}
        />
        {/* Jawline Shadow Accent */}
        <rect x="36" y="62" width="28" height="2" fill={shadowSkin} />

        {/* Cheerful Stardew Rosy Cheek Pixels */}
        <rect x="32" y="48" width="6" height="4" rx="1" fill={blushColor} opacity="0.45" />
        <rect x="62" y="48" width="6" height="4" rx="1" fill={blushColor} opacity="0.45" />

        {/* Button Nose Pixel */}
        <rect x="48" y="46" width="4" height="3" rx="0.5" fill={shadowSkin} />
        <rect x="48" y="46" width="2" height="2" rx="0.5" fill={activeConfig.skinColor} opacity="0.75" />

        {/* ================= EYEBROWS ================= */}
        <rect x="34" y="34" width="12" height="3" rx="1" fill={activeConfig.hairColor} />
        <rect x="54" y="34" width="12" height="3" rx="1" fill={activeConfig.hairColor} />

        {/* ================= EYES ================= */}
        {activeConfig.eyeExpression === 'focused' && (
          <g>
            {/* Left Eye: 2x2 iris with 1x1 Stardew sparkle glint */}
            <rect x="36" y="39" width="8" height="8" rx="1" fill="#1e293b" />
            <rect x="37" y="40" width="3" height="3" fill="#ffffff" />

            {/* Right Eye: 2x2 iris with 1x1 Stardew sparkle glint */}
            <rect x="56" y="39" width="8" height="8" rx="1" fill="#1e293b" />
            <rect x="57" y="40" width="3" height="3" fill="#ffffff" />
          </g>
        )}

        {activeConfig.eyeExpression === 'cheerful' && (
          <g stroke="#1e293b" strokeWidth="2.8" strokeLinecap="round" fill="none">
            {/* Happy Curved Squint Eyes (^ ^) */}
            <path d="M 35 44 Q 40 38 45 44" />
            <path d="M 55 44 Q 60 38 65 44" />
          </g>
        )}

        {activeConfig.eyeExpression === 'glasses' && (
          <g>
            {/* Eyes behind glasses */}
            <rect x="37" y="41" width="5" height="5" rx="1" fill="#1e293b" />
            <rect x="38" y="42" width="2" height="2" fill="#ffffff" />
            <rect x="58" y="41" width="5" height="5" rx="1" fill="#1e293b" />
            <rect x="59" y="42" width="2" height="2" fill="#ffffff" />

            {/* Retro Pixel Spectacle Frames */}
            <rect x="32" y="37" width="14" height="12" rx="2" fill="none" stroke="#0f172a" strokeWidth="2.2" />
            <rect x="54" y="37" width="14" height="12" rx="2" fill="none" stroke="#0f172a" strokeWidth="2.2" />
            {/* Bridge */}
            <rect x="46" y="41" width="8" height="2.2" fill="#0f172a" />
            {/* Temples connecting to ears */}
            <rect x="25" y="41" width="7" height="2" fill="#0f172a" />
            <rect x="68" y="41" width="7" height="2" fill="#0f172a" />
          </g>
        )}

        {activeConfig.eyeExpression === 'sunglasses' && (
          <g>
            {/* Dark Shaded Pixel Lenses */}
            <rect x="32" y="37" width="15" height="12" rx="2" fill="#0f172a" />
            <rect x="53" y="37" width="15" height="12" rx="2" fill="#0f172a" />
            {/* Bridge */}
            <rect x="47" y="39" width="6" height="3" fill="#0f172a" />
            {/* Glare Highlights */}
            <rect x="34" y="39" width="3" height="3" fill="#ffffff" opacity="0.8" />
            <rect x="55" y="39" width="3" height="3" fill="#ffffff" opacity="0.8" />
          </g>
        )}

        {/* ================= MOUTH ================= */}
        {activeConfig.mouthExpression === 'smile' && (
          <g fill="#1e293b">
            {/* Gentle Pixel Smile */}
            <rect x="45" y="54" width="10" height="2.5" rx="1" />
            <rect x="43" y="52" width="2.5" height="2.5" rx="0.5" />
            <rect x="54.5" y="52" width="2.5" height="2.5" rx="0.5" />
          </g>
        )}

        {activeConfig.mouthExpression === 'openSmile' && (
          <g>
            {/* Cheerful Open Mouth */}
            <rect x="43" y="52" width="14" height="8" rx="2" fill="#881337" />
            {/* Top Teeth Row */}
            <rect x="45" y="52" width="10" height="3" fill="#ffffff" />
            {/* Rosy Tongue */}
            <rect x="46" y="57" width="8" height="3" rx="1" fill="#f43f5e" />
          </g>
        )}

        {activeConfig.mouthExpression === 'grin' && (
          <g>
            {/* Wide Toothy Smile */}
            <rect x="42" y="52" width="16" height="6" rx="1.5" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
            <line x1="42" y1="55" x2="58" y2="55" stroke="#1e293b" strokeWidth="1" />
          </g>
        )}

        {activeConfig.mouthExpression === 'smirk' && (
          <g fill="#1e293b">
            {/* Confident Smirk */}
            <rect x="45" y="54" width="8" height="2.5" rx="1" />
            <rect x="53" y="52" width="3" height="2.5" rx="0.5" />
          </g>
        )}

        {/* ================= FRONT HAIR & BANGS LAYER ================= */}
        {activeConfig.hairStyle === 'short' && (
          <g fill={activeConfig.hairColor}>
            {/* Farmer Side-swept Bangs */}
            <rect x="28" y="22" width="44" height="12" rx="2" />
            <rect x="28" y="32" width="24" height="5" />
            <rect x="48" y="32" width="16" height="3" />
            {/* Sideburns */}
            <rect x="26" y="34" width="4" height="10" />
            <rect x="70" y="34" width="4" height="10" />
          </g>
        )}

        {activeConfig.hairStyle === 'curly' && (
          <g fill={activeConfig.hairColor}>
            {/* Curly Forehead Clusters */}
            <rect x="26" y="22" width="48" height="10" rx="3" />
            <rect x="30" y="28" width="10" height="6" rx="2" />
            <rect x="44" y="28" width="12" height="5" rx="2" />
            <rect x="60" y="28" width="10" height="6" rx="2" />
            {/* Side Curls */}
            <rect x="24" y="34" width="6" height="12" rx="2" />
            <rect x="70" y="34" width="6" height="12" rx="2" />
          </g>
        )}

        {activeConfig.hairStyle === 'wavy' && (
          <g fill={activeConfig.hairColor}>
            {/* Front Wavy Bangs & Strands */}
            <rect x="26" y="22" width="48" height="10" rx="2" />
            <rect x="28" y="30" width="16" height="6" rx="1" />
            <rect x="56" y="30" width="16" height="6" rx="1" />
            {/* Cheek-framing locks */}
            <rect x="24" y="34" width="6" height="24" rx="2" />
            <rect x="70" y="34" width="6" height="24" rx="2" />
          </g>
        )}

        {activeConfig.hairStyle === 'bun' && (
          <g fill={activeConfig.hairColor}>
            {/* Front Headband & Parted Bangs */}
            <rect x="28" y="22" width="44" height="10" rx="2" />
            <rect x="30" y="30" width="18" height="4" />
            <rect x="52" y="30" width="18" height="4" />
            {/* Side tendrils */}
            <rect x="26" y="32" width="4" height="14" rx="1" />
            <rect x="70" y="32" width="4" height="14" rx="1" />
          </g>
        )}

        {activeConfig.hairStyle === 'spiky' && (
          <g fill={activeConfig.hairColor}>
            {/* Forehead Spike Points */}
            <rect x="28" y="22" width="44" height="8" rx="2" />
            <polygon points="32,28 38,36 44,28" />
            <polygon points="46,28 52,34 58,28" />
            <polygon points="56,28 62,36 68,28" />
          </g>
        )}

        {activeConfig.hairStyle === 'bald' && (
          <g>
            {/* Sleek Scalp Shine Highlight */}
            <rect x="36" y="26" width="8" height="3" rx="1" fill="#ffffff" opacity="0.35" />
            <rect x="42" y="24" width="6" height="2" rx="1" fill="#ffffff" opacity="0.45" />
          </g>
        )}

        {/* ================= ACCESSORIES (Grid-Snapped & Snug Fit) ================= */}
        {activeConfig.accessory === 'headphones' && (
          <g>
            {/* Snug Headband Arch Curve */}
            <rect x="26" y="18" width="48" height="5" rx="2.5" fill="#0284c7" stroke="#0369a1" strokeWidth="1" />
            {/* Left Ear Cushion (Hugging Left Ear Snugly) */}
            <rect x="18" y="38" width="10" height="18" rx="3" fill="#0284c7" stroke="#ffffff" strokeWidth="1.5" />
            {/* Right Ear Cushion (Hugging Right Ear Snugly) */}
            <rect x="72" y="38" width="10" height="18" rx="3" fill="#0284c7" stroke="#ffffff" strokeWidth="1.5" />
          </g>
        )}

        {activeConfig.accessory === 'graduationCap' && (
          <g>
            {/* Cap Skull Base Band (Resting firmly on forehead, NOT floating) */}
            <rect x="32" y="20" width="36" height="8" rx="2" fill="#1e293b" stroke="#0f172a" strokeWidth="1" />
            {/* Diamond Mortarboard Brim */}
            <polygon points="50,8 82,18 50,26 18,18" fill="#0f172a" stroke="#334155" strokeWidth="1" />
            {/* Center Gold Button */}
            <rect x="48" y="16" width="4" height="4" fill="#f59e0b" />
            {/* Gold Hanging Tassel */}
            <line x1="50" y1="18" x2="32" y2="28" stroke="#f59e0b" strokeWidth="2.5" />
            <rect x="30" y="27" width="4" height="6" rx="1" fill="#f59e0b" />
          </g>
        )}

        {activeConfig.accessory === 'pencil' && (
          <g>
            {/* Yellow ENEM Study Pencil Angled Behind Right Ear */}
            <polygon points="76,46 72,42 82,24 86,26" fill="#f59e0b" stroke="#d97706" strokeWidth="0.8" />
            {/* Pink Eraser Tip */}
            <polygon points="82,24 86,26 88,23 84,21" fill="#f43f5e" />
            {/* Dark Graphite Tip */}
            <polygon points="74,48 76,46 72,42" fill="#1e293b" />
          </g>
        )}
      </g>
    </svg>
  );
};
