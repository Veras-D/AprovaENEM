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
  const bg = (activeConfig.backgroundColor || '').toLowerCase();

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
        <radialGradient id={`avatar-halo-${clipId}`} cx="50%" cy="38%" r="48%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
          <stop offset="60%" stopColor="#ffffff" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.14" />
        </radialGradient>
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
        {/* Soft Ambient Backdrop Halo (Illuminates silhouette from behind, ensuring dark hair & clothes pop on dark backgrounds) */}
        <circle cx="50" cy="50" r="49" fill={`url(#avatar-halo-${clipId})`} />

        {/* ================= THEMED 16-BIT ATMOSPHERIC ENVIRONMENTS ================= */}
        {/* 1. Céu Fazenda (Sunny Sky with Fluffy Pixel Clouds & Morning Sun) */}
        {(bg === '#bae6fd' || bg === '#e0f2fe') && (
          <g>
            {/* Gentle Morning Sun & Rays */}
            <circle cx="20" cy="18" r="6" fill="#fef08a" opacity="0.85" />
            <circle cx="20" cy="18" r="3.5" fill="#ffffff" opacity="0.95" />
            <rect x="19" y="8" width="2" height="3" fill="#fef08a" opacity="0.75" />
            <rect x="9" y="17" width="3" height="2" fill="#fef08a" opacity="0.75" />
            <rect x="28" y="17" width="3" height="2" fill="#fef08a" opacity="0.75" />

            {/* Upper Right Fluffy Pixel Cloud */}
            <rect x="74" y="16" width="14" height="6" rx="2" fill="#ffffff" opacity="0.9" />
            <rect x="77" y="13" width="8" height="5" rx="2" fill="#ffffff" opacity="0.95" />
            <rect x="73" y="20" width="16" height="2" fill="#e0f2fe" opacity="0.7" />

            {/* Left Edge Small Floating Cloud */}
            <rect x="10" y="34" width="10" height="4" rx="2" fill="#ffffff" opacity="0.75" />
            <rect x="12" y="32" width="6" height="3" rx="1.5" fill="#ffffff" opacity="0.85" />
          </g>
        )}

        {/* 2. Menta Primavera (Spring Breeze with Drifting Leaves & Blossom Petals) */}
        {(bg === '#a7f3d0' || bg === '#d1fae5') && (
          <g>
            {/* Fluttering Emerald Leaf 1 */}
            <rect x="18" y="20" width="4" height="3" rx="1.5" fill="#059669" />
            <rect x="20" y="19" width="2" height="3" rx="1" fill="#10b981" />
            <rect x="21" y="20" width="1" height="1" fill="#a7f3d0" />

            {/* Drifting Leaf 2 */}
            <rect x="77" y="16" width="4" height="3" rx="1.5" fill="#059669" />
            <rect x="78" y="15" width="2" height="2" rx="1" fill="#10b981" />

            {/* Pink Spring Flower Petal 1 */}
            <rect x="82" y="30" width="4" height="3" rx="1.5" fill="#f472b6" opacity="0.9" />
            <rect x="83" y="31" width="2" height="1" fill="#ffffff" />

            {/* Pink Spring Flower Petal 2 */}
            <rect x="14" y="38" width="3" height="3" rx="1" fill="#f472b6" opacity="0.85" />

            {/* Floating Nature Pollen Motes */}
            <rect x="26" y="14" width="1.5" height="1.5" fill="#ecfdf5" opacity="0.85" />
            <rect x="73" y="26" width="1.5" height="1.5" fill="#ecfdf5" opacity="0.85" />
            <rect x="85" y="42" width="1.5" height="1.5" fill="#34d399" opacity="0.6" />
          </g>
        )}

        {/* 3. Trigo Dourado (Harvest Glow with Golden Fireflies & Pollen) */}
        {(bg === '#fde68a' || bg === '#fef3c7') && (
          <g>
            {/* Golden 4-point Harvest Sparkle 1 */}
            <rect x="78" y="16" width="3" height="3" fill="#f59e0b" opacity="0.9" />
            <rect x="77" y="17" width="5" height="1" fill="#fbbf24" />
            <rect x="79" y="15" width="1" height="5" fill="#fbbf24" />
            <rect x="79" y="17" width="1" height="1" fill="#ffffff" />

            {/* Sparkle 2 */}
            <rect x="20" y="22" width="2" height="2" fill="#f59e0b" opacity="0.8" />
            <rect x="19" y="22" width="4" height="1" fill="#fbbf24" />
            <rect x="20" y="21" width="1" height="4" fill="#fbbf24" />
            <rect x="20" y="22" width="1" height="1" fill="#ffffff" />

            {/* Warm Floating Dust Motes */}
            <rect x="16" y="15" width="2" height="2" fill="#d97706" opacity="0.65" />
            <rect x="83" y="32" width="2" height="2" fill="#f59e0b" opacity="0.75" />
            <rect x="12" y="38" width="2" height="1.5" fill="#fbbf24" opacity="0.8" />
            <rect x="85" y="44" width="1.5" height="1.5" fill="#b45309" opacity="0.6" />
          </g>
        )}

        {/* 4. Pêssego Poente (Sakura Twilight with Cherry Blossom Petals) */}
        {(bg === '#fbcfe8' || bg === '#ffe4e6') && (
          <g>
            {/* Cherry Blossom Petal 1 */}
            <rect x="18" y="18" width="4" height="3" rx="1.5" fill="#ec4899" opacity="0.85" />
            <rect x="19" y="17" width="2" height="2" rx="1" fill="#f472b6" />
            <rect x="20" y="18" width="1" height="1" fill="#ffffff" />

            {/* Cherry Blossom Petal 2 */}
            <rect x="77" y="14" width="3" height="4" rx="1.5" fill="#ec4899" opacity="0.85" />
            <rect x="78" y="15" width="2" height="2" rx="1" fill="#f472b6" />

            {/* Drifting Petal 3 */}
            <rect x="82" y="32" width="4" height="3" rx="1.5" fill="#db2777" opacity="0.75" />
            <rect x="83" y="33" width="2" height="1" fill="#f472b6" />

            {/* Twilight Sparkles */}
            <rect x="24" y="26" width="2" height="2" fill="#ffffff" opacity="0.8" />
            <rect x="72" y="24" width="1.5" height="1.5" fill="#ffffff" opacity="0.9" />
            <rect x="14" y="36" width="2" height="1" fill="#ffffff" opacity="0.7" />
          </g>
        )}

        {/* 5. Lavanda Suave (Junimo Magic with Shimmering Fairy Stardust) */}
        {(bg === '#ddd6fe' || bg === '#ede9fe') && (
          <g>
            {/* 4-point Diamond Magic Sparkle 1 */}
            <rect x="78" y="15" width="3" height="3" fill="#a855f7" />
            <rect x="77" y="16" width="5" height="1" fill="#c084fc" />
            <rect x="79" y="14" width="1" height="5" fill="#c084fc" />
            <rect x="79" y="16" width="1" height="1" fill="#ffffff" />

            {/* Magic Sparkle 2 */}
            <rect x="20" y="20" width="2" height="2" fill="#a855f7" />
            <rect x="19" y="20" width="4" height="1" fill="#e9d5ff" />
            <rect x="20" y="19" width="1" height="4" fill="#e9d5ff" />
            <rect x="20" y="20" width="1" height="1" fill="#ffffff" />

            {/* Fairy Stardust Specks */}
            <rect x="16" y="13" width="2" height="2" fill="#ffffff" opacity="0.9" />
            <rect x="84" y="26" width="2" height="2" fill="#e9d5ff" opacity="0.85" />
            <rect x="25" y="32" width="1.5" height="1.5" fill="#ffffff" opacity="0.9" />
            <rect x="82" y="40" width="2" height="1.5" fill="#ffffff" opacity="0.75" />
          </g>
        )}

        {/* 6. Noite Estrelada (Constellation Night Sky with Twinkling Stars) */}
        {(bg === '#1e293b' || bg === '#0f172a') && (
          <g fill="#ffffff">
            {/* 4-point Gold North Star */}
            <rect x="77" y="15" width="3" height="3" fill="#fef08a" />
            <rect x="76" y="16" width="5" height="1" fill="#fef08a" />
            <rect x="78" y="14" width="1" height="5" fill="#fef08a" />
            <rect x="78" y="16" width="1" height="1" fill="#ffffff" />

            {/* Twinkling Constellation Stars */}
            <rect x="18" y="20" width="2" height="2" opacity="0.85" />
            <rect x="25" y="14" width="1.5" height="1.5" opacity="0.7" />
            <rect x="83" y="26" width="2" height="2" opacity="0.8" />
            <rect x="14" y="36" width="1.5" height="1.5" opacity="0.6" />
            <rect x="84" y="42" width="2" height="1.5" opacity="0.75" fill="#fef08a" />
          </g>
        )}

        {/* Character Silhouette with ambient drop shadow for clean contrast */}
        <g style={{ filter: 'drop-shadow(0 2px 4px rgba(15, 23, 42, 0.22))' }}>
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

        {activeConfig.hairStyle === 'bun' && activeConfig.accessory !== 'graduationCap' && (
          <g fill={activeConfig.hairColor}>
            {/* Topknot bun atop head (tucked cleanly under graduation cap when worn) */}
            <rect x="40" y="10" width="20" height="14" rx="4" />
            <rect x="44" y="8" width="12" height="4" rx="2" fill="#f59e0b" />
          </g>
        )}

        {activeConfig.hairStyle === 'spiky' && activeConfig.accessory !== 'graduationCap' && (
          <g fill={activeConfig.hairColor}>
            {/* Crown spikes peeking upward in authentic pixel art steps (tucked under cap when worn) */}
            {/* Left Spike */}
            <rect x="34" y="14" width="4" height="4" />
            <rect x="32" y="18" width="8" height="4" />
            <rect x="30" y="22" width="12" height="4" />
            {/* Center Spike (Tallest) */}
            <rect x="48" y="8" width="4" height="4" />
            <rect x="46" y="12" width="8" height="4" />
            <rect x="44" y="16" width="12" height="4" />
            <rect x="42" y="20" width="16" height="4" />
            {/* Right Spike */}
            <rect x="62" y="14" width="4" height="4" />
            <rect x="60" y="18" width="8" height="4" />
            <rect x="58" y="22" width="12" height="4" />
            {/* Specular Spike Tip Highlights for clean contrast on dark hair */}
            <rect x="34" y="14" width="4" height="2" fill="#ffffff" opacity="0.18" />
            <rect x="48" y="8" width="4" height="2" fill="#ffffff" opacity="0.22" />
            <rect x="62" y="14" width="4" height="2" fill="#ffffff" opacity="0.18" />
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
        {/* Subtle Shoulder Rim Lighting (Separates dark clothes from dark backgrounds) */}
        <rect x="34" y="68" width="32" height="2" fill="#ffffff" opacity="0.14" />
        <rect x="18" y="72" width="16" height="2" fill="#ffffff" opacity="0.14" />
        <rect x="66" y="72" width="16" height="2" fill="#ffffff" opacity="0.14" />
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

            {/* Subtle Sky-Blue Reflective Lens Glint (Ensures glasses pop on all skin tones) */}
            <rect x="33" y="38" width="12" height="10" rx="1" fill="#38bdf8" opacity="0.22" />
            <rect x="55" y="38" width="12" height="10" rx="1" fill="#38bdf8" opacity="0.22" />
            <rect x="34" y="38" width="3" height="2" fill="#ffffff" opacity="0.75" />
            <rect x="56" y="38" width="3" height="2" fill="#ffffff" opacity="0.75" />

            {/* Retro Pixel Spectacle Frames */}
            <rect x="32" y="37" width="14" height="12" rx="2" fill="none" stroke="#0f172a" strokeWidth="2.2" />
            <rect x="54" y="37" width="14" height="12" rx="2" fill="none" stroke="#0f172a" strokeWidth="2.2" />
            {/* Top Frame Specular Highlight (Pops on deep/ebony skin tones) */}
            <rect x="33" y="37" width="12" height="1" fill="#64748b" opacity="0.85" />
            <rect x="55" y="37" width="12" height="1" fill="#64748b" opacity="0.85" />
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
            {/* Forehead Spike Points in Pixel Art Steps */}
            <rect x="28" y="22" width="44" height="8" rx="2" />
            <rect x="34" y="28" width="6" height="3" />
            <rect x="35" y="31" width="4" height="3" />
            <rect x="46" y="28" width="6" height="3" />
            <rect x="47" y="31" width="4" height="3" />
            <rect x="58" y="28" width="6" height="3" />
            <rect x="59" y="31" width="4" height="3" />
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
            {/* Cap Skull Base / Forehead Band */}
            <rect x="34" y="20" width="32" height="6" fill="#0f172a" />
            <rect x="34" y="24" width="32" height="2" fill="#020617" />
            <rect x="36" y="21" width="28" height="1" fill="#334155" opacity="0.6" />

            {/* Mortarboard Diamond (Stardew Stepped Pixel Lozenge) */}
            {/* Top row to widest point (y=10 to y=16) */}
            <rect x="47" y="10" width="6" height="1" fill="#1e293b" />
            <rect x="43" y="11" width="14" height="1" fill="#1e293b" />
            <rect x="39" y="12" width="22" height="1" fill="#1e293b" />
            <rect x="35" y="13" width="30" height="1" fill="#1e293b" />
            <rect x="31" y="14" width="38" height="1" fill="#1e293b" />
            <rect x="27" y="15" width="46" height="1" fill="#1e293b" />
            {/* Midpoint / Widest Line (y=16) */}
            <rect x="23" y="16" width="54" height="1" fill="#0f172a" />
            {/* Bottom half stepping back to front point (y=17 to y=22) */}
            <rect x="27" y="17" width="46" height="1" fill="#0f172a" />
            <rect x="31" y="18" width="38" height="1" fill="#0f172a" />
            <rect x="35" y="19" width="30" height="1" fill="#0f172a" />
            <rect x="39" y="20" width="22" height="1" fill="#0f172a" />
            <rect x="43" y="21" width="14" height="1" fill="#0f172a" />
            <rect x="47" y="22" width="6" height="1" fill="#0f172a" />

            {/* Mortarboard 3D Rim Thickness (Under-edge bevel) */}
            <rect x="23" y="17" width="4" height="2" fill="#020617" />
            <rect x="73" y="17" width="4" height="2" fill="#020617" />
            <rect x="27" y="18" width="4" height="2" fill="#020617" />
            <rect x="69" y="18" width="4" height="2" fill="#020617" />
            <rect x="31" y="19" width="4" height="2" fill="#020617" />
            <rect x="65" y="19" width="4" height="2" fill="#020617" />
            <rect x="35" y="20" width="4" height="2" fill="#020617" />
            <rect x="61" y="20" width="4" height="2" fill="#020617" />
            <rect x="39" y="21" width="4" height="2" fill="#020617" />
            <rect x="57" y="21" width="4" height="2" fill="#020617" />
            <rect x="43" y="22" width="4" height="2" fill="#020617" />
            <rect x="53" y="22" width="4" height="2" fill="#020617" />
            <rect x="47" y="23" width="6" height="2" fill="#020617" />

            {/* Center Gold Button */}
            <rect x="48" y="15" width="4" height="3" fill="#f59e0b" />
            <rect x="49" y="15" width="2" height="1" fill="#fde68a" />

            {/* Gold Pixel-Stepped Tassel Cord (Draping across cap to left corner) */}
            <rect x="44" y="15" width="4" height="2" fill="#f59e0b" />
            <rect x="40" y="16" width="4" height="2" fill="#f59e0b" />
            <rect x="35" y="16" width="5" height="2" fill="#fbbf24" />
            <rect x="30" y="17" width="5" height="2" fill="#f59e0b" />
            <rect x="25" y="17" width="5" height="2" fill="#d97706" />
            <rect x="23" y="18" width="3" height="3" fill="#d97706" />

            {/* Gold Tassel Ring / Knot */}
            <rect x="22" y="21" width="4" height="2" fill="#f59e0b" />
            <rect x="23" y="21" width="2" height="1" fill="#fde68a" />

            {/* Gold Tassel Fringe / Brush (Hanging cleanly on left side) */}
            <rect x="21" y="23" width="6" height="6" fill="#fbbf24" />
            <rect x="22" y="24" width="4" height="4" fill="#f59e0b" />
            <rect x="21" y="29" width="6" height="2" fill="#d97706" />
            <rect x="22" y="31" width="4" height="1" fill="#b45309" />
          </g>
        )}

        {activeConfig.accessory === 'pencil' && (
          <g>
            {/* 1. Graphite Lead Point (Crisp lead tip pointing UPWARDS above ear into hair) */}
            <rect x="73" y="29" width="2" height="2" fill="#0f172a" />

            {/* 2. Sharpened Natural Cedar Wood Collar */}
            <rect x="72" y="31" width="3" height="2" fill="#fde68a" />
            <rect x="74" y="31" width="1" height="2" fill="#d97706" />
            <rect x="72" y="33" width="3" height="2" fill="#fde68a" />
            <rect x="74" y="33" width="1" height="2" fill="#d97706" />

            {/* 3. Upper Yellow Pencil Shaft (Rising naturally and compactly above ear) */}
            <rect x="72" y="35" width="3" height="3" fill="#f59e0b" />
            <rect x="72" y="35" width="1" height="3" fill="#fef08a" />
            <rect x="74" y="35" width="1" height="3" fill="#b45309" />

            <rect x="71" y="38" width="3" height="4" fill="#f59e0b" />
            <rect x="71" y="38" width="1" height="4" fill="#fef08a" />
            <rect x="73" y="38" width="1" height="4" fill="#b45309" />

            {/* 4. Lower Pencil Shaft (Passing behind the ear) */}
            <rect x="71" y="42" width="3" height="7" fill="#f59e0b" />
            <rect x="71" y="42" width="1" height="7" fill="#fef08a" />
            <rect x="73" y="42" width="1" height="7" fill="#b45309" />

            {/* 5. Silver Metal Ferrule Band (Tucked behind ear) */}
            <rect x="71" y="49" width="3" height="2" fill="#94a3b8" />
            <rect x="71" y="49" width="1" height="2" fill="#e2e8f0" />
            <rect x="73" y="49" width="1" height="2" fill="#475569" />

            {/* 6. Pink Rubber Eraser (Tucked behind ear) */}
            <rect x="71" y="51" width="3" height="2" fill="#f43f5e" />
            <rect x="71" y="51" width="1" height="1" fill="#fda4af" />
            <rect x="71" y="52" width="3" height="1" fill="#9f1239" />

            {/* 7. Right Ear Front Cartilage Overlap (Ensures pencil sits physically BEHIND the ear) */}
            <rect x="71" y="42" width="6" height="12" rx="2" fill={activeConfig.skinColor} />
            <rect x="72" y="44" width="3" height="8" rx="1" fill={shadowSkin} opacity="0.6" />
          </g>
        )}
        </g>
      </g>
    </svg>
  );
};
