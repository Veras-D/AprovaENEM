import React, { useEffect } from 'react';
import { useAccessibilityStore } from '@/stores/useAccessibilityStore';

/**
 * Visual Reading Guide / Ruler helping neurodivergent students, students with ADHD,
 * or dyslexia track horizontal line focus across dense text.
 */
export const ReadingRuler: React.FC = () => {
  const { readingRuler, rulerY, setRulerY } = useAccessibilityStore();

  useEffect(() => {
    if (!readingRuler) {
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      setRulerY(e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [readingRuler, setRulerY]);

  if (!readingRuler) {
    return null;
  }

  return (
    <div
      className="fixed left-0 right-0 pointer-events-none z-40 transition-transform duration-75 ease-out"
      style={{
        top: `${rulerY - 24}px`,
        height: '48px',
        backgroundColor: 'rgba(250, 204, 21, 0.15)', // Amber subtle highlight
        borderTop: '2px solid rgba(234, 179, 8, 0.6)',
        borderBottom: '2px solid rgba(234, 179, 8, 0.6)',
        boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.15)',
      }}
      role="presentation"
      aria-hidden="true"
    />
  );
};
