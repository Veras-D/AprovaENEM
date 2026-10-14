import React, { useState, useEffect } from 'react';
import { Wifi, X } from 'lucide-react';

interface NetworkInformation extends EventTarget {
  readonly saveData?: boolean;
  readonly effectiveType?: 'slow-2g' | '2g' | '3g' | '4g';
}

declare global {
  interface Navigator {
    readonly connection?: NetworkInformation;
  }
}

export interface BandwidthNoticeProps {
  readonly className?: string;
  readonly forcedStatus?: boolean;
}

/**
 * Low-Bandwidth & 3G/4G Data Saver Optimization Widget.
 * Automatically detects NetworkInformation API (saveData or slow 2G/3G connections)
 * to inform students that assets, fonts, and network payloads are dynamically compressed.
 */
export const BandwidthNotice: React.FC<BandwidthNoticeProps> = ({
  className = '',
  forcedStatus,
}) => {
  const [isLowBandwidth, setIsLowBandwidth] = useState<boolean>(Boolean(forcedStatus));
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [connectionType, setConnectionType] = useState<string>('3G');

  useEffect(() => {
    if (forcedStatus !== undefined) {
      setIsLowBandwidth(forcedStatus);
      return;
    }

    if (typeof navigator !== 'undefined' && navigator.connection) {
      const conn = navigator.connection;
      const isSlow =
        conn.saveData ||
        conn.effectiveType === 'slow-2g' ||
        conn.effectiveType === '2g' ||
        conn.effectiveType === '3g';

      if (isSlow) {
        setIsLowBandwidth(true);
        setConnectionType(conn.effectiveType?.toUpperCase() || '3G');
      }
    }
  }, [forcedStatus]);

  if (!isLowBandwidth || isDismissed) {
    return null;
  }

  return (
    <div
      className={`bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900 px-4 py-2 text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between gap-3 ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-2 max-w-4xl mx-auto flex-1">
        <Wifi className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
        <span>
          <strong>Modo Economia de Dados ({connectionType}) Ativo:</strong> Imagens de diagramas e equações KaTeX otimizadas para carregamento rápido em redes móveis de baixa largura de banda.
        </span>
      </div>
      <button
        type="button"
        onClick={() => setIsDismissed(true)}
        className="p-1 rounded text-amber-700 hover:text-amber-900 dark:text-amber-300 dark:hover:text-amber-100 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors"
        aria-label="Dispensar aviso de economia de dados"
      >
        <X className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </div>
  );
};
