import React from 'react';

/**
 * Invisible SVG containing color matrix filters for simulating/correcting Daltonism
 * (Protanopia, Deuteranopia, Tritanopia) per Viénot, Brettel & Mollon standards.
 */
export const ColorBlindFilters: React.FC = () => {
  return (
    <svg aria-hidden="true" className="sr-only" style={{ display: 'none' }}>
      <defs>
        {/* Protanopia (Red deficiency) */}
        <filter id="filter-protanopia">
          <feColorMatrix
            type="matrix"
            values="0.56667 0.43333 0 0 0
                    0.55833 0.44167 0 0 0
                    0 0.24167 0.75833 0 0
                    0 0 0 1 0"
          />
        </filter>

        {/* Deuteranopia (Green deficiency) */}
        <filter id="filter-deuteranopia">
          <feColorMatrix
            type="matrix"
            values="0.625 0.375 0 0 0
                    0.7 0.3 0 0 0
                    0 0.3 0.7 0 0
                    0 0 0 1 0"
          />
        </filter>

        {/* Tritanopia (Blue deficiency) */}
        <filter id="filter-tritanopia">
          <feColorMatrix
            type="matrix"
            values="0.95 0.05 0 0 0
                    0 0.43333 0.56667 0 0
                    0 0.475 0.525 0 0
                    0 0 0 1 0"
          />
        </filter>
      </defs>
    </svg>
  );
};
