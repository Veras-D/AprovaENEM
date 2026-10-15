import React, { useEffect } from 'react';
import { useAccessibilityStore } from '@/stores/useAccessibilityStore';

declare global {
  interface Window {
    VLibras?: {
      Widget: new (url: string) => unknown;
    };
  }
}

/**
 * VLibras 3D Avatar Sign Language Integration (Governo Federal / UFPB).
 * Translates Brazilian Portuguese text into Brazilian Sign Language (Libras)
 * to support deaf and hard-of-hearing students.
 */
export const VLibras: React.FC = () => {
  const { vlibrasEnabled } = useAccessibilityStore();

  useEffect(() => {
    if (!vlibrasEnabled || typeof document === 'undefined') {
      return;
    }

    const scriptId = 'vlibras-script';
    let scriptElement = document.getElementById(scriptId) as HTMLScriptElement | null;

    const initWidget = () => {
      try {
        if (window.VLibras?.Widget) {
          new window.VLibras.Widget('https://vlibras.gov.br/app');
        }
      } catch {
        // Gracefully handle network isolation or offline testing
      }
    };

    if (!scriptElement) {
      scriptElement = document.createElement('script');
      scriptElement.id = scriptId;
      scriptElement.src = 'https://vlibras.gov.br/app/vlibras-plugin.js';
      scriptElement.async = true;
      scriptElement.onload = initWidget;
      document.body.appendChild(scriptElement);
    } else if (window.VLibras?.Widget) {
      initWidget();
    }
  }, [vlibrasEnabled]);

  if (!vlibrasEnabled) {
    return null;
  }

  return (
    <div
      role="region"
      // @ts-expect-error VLibras proprietary attributes
      vw="true"
      className="enabled"
      aria-label="Tradutor de Libras VLibras"
    >
      <div vw-access-button="true" className="active" />
      <div vw-plugin-wrapper="true">
        <div className="vw-plugin-top-wrapper" />
      </div>
    </div>
  );
};
