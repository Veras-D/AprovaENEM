import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ZoomIn, ZoomOut, X, Image as ImageIcon, AlertCircle } from 'lucide-react';

export interface ZoomableImageProps {
  readonly src?: string;
  readonly alt?: string;
  readonly caption?: string;
  readonly className?: string;
}

/**
 * Accessible, responsive, zoomable image component for figures, diagrams, and illustrations.
 * Includes skeleton loader, graceful error state, and full-screen lightbox modal with Escape hotkey.
 */
export const ZoomableImage: React.FC<ZoomableImageProps> = ({
  src,
  alt = 'Figura de apoio da questão',
  caption,
  className = '',
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  const [shouldRenderModal, setShouldRenderModal] = useState<boolean>(false);
  const [isClosingModal, setIsClosingModal] = useState<boolean>(false);
  const zoomModalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isZoomed) {
      setShouldRenderModal(true);
      setIsClosingModal(false);
      return;
    }
    if (shouldRenderModal) {
      setIsClosingModal(true);
      const timer = setTimeout(() => {
        setShouldRenderModal(false);
        setIsClosingModal(false);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isZoomed, shouldRenderModal]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (contentRef.current && !contentRef.current.contains(e.target as Node)) {
      setIsZoomed(false);
    }
  };

  useEffect(() => {
    if (!isZoomed) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsZoomed(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isZoomed]);

  if (!src) return null;

  return (
    <>
      <figure
        className={`relative my-4 flex flex-col items-center rounded-brand overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-2 sm:p-3 ${className}`}
      >
        {/* Loading Skeleton */}
        {isLoading && !hasError && (
          <div
            role="status"
            className="w-full h-48 sm:h-64 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-brand flex items-center justify-center text-slate-400"
            aria-busy="true"
            aria-label="Carregando imagem da questão..."
          >
            <ImageIcon className="h-8 w-8 animate-pulse text-slate-400" aria-hidden="true" />
          </div>
        )}

        {/* Error State */}
        {hasError && (
          <div
            role="alert"
            className="w-full py-8 flex flex-col items-center justify-center gap-2 text-slate-500 text-xs sm:text-sm text-center"
          >
            <AlertCircle className="h-6 w-6 text-amber-500" aria-hidden="true" />
            <span>Não foi possível carregar a figura da questão.</span>
          </div>
        )}

        {/* Main Image */}
        {!hasError && (
          <div className="relative group cursor-zoom-in max-w-full">
            <img
              src={src}
              alt={alt}
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                setHasError(true);
              }}
              onClick={() => setIsZoomed(true)}
              className={`max-h-72 sm:max-h-96 w-auto object-contain rounded-brand mx-auto transition-opacity duration-300 ${
                isLoading ? 'opacity-0 h-0' : 'opacity-100'
              }`}
            />

            {!isLoading && (
              <button
                type="button"
                onClick={() => setIsZoomed(true)}
                className="absolute bottom-2 right-2 p-1.5 rounded-full bg-slate-900/70 text-white hover:bg-slate-900 transition-colors opacity-90 sm:opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                aria-label="Ampliar figura"
              >
                <ZoomIn className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>
        )}

        {/* Caption */}
        {caption && (
          <figcaption className="mt-2 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 text-center italic max-w-md">
            {caption}
          </figcaption>
        )}
      </figure>

      {/* Accessible Lightbox Modal */}
      {shouldRenderModal && (() => {
        const lightboxContent = (
          <div
            ref={zoomModalRef}
            data-testid="zoom-modal-backdrop"
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md cursor-zoom-out ${
              isClosingModal
                ? 'animate-out fade-out duration-150'
                : 'animate-in fade-in duration-200'
            }`}
            role="dialog"
            aria-modal="true"
            aria-hidden={isClosingModal || undefined}
            aria-label={`Visualização ampliada: ${alt}`}
            onClick={handleBackdropClick}
          >
            <div
              ref={contentRef}
              className={`relative max-w-5xl max-h-[90vh] flex flex-col items-center cursor-default ${
                isClosingModal
                  ? 'animate-out fade-out zoom-out-95 duration-150'
                  : 'animate-in fade-in zoom-in-95 duration-200'
              }`}
            >
              {/* Close button */}
              <button
                type="button"
                onClick={() => setIsZoomed(false)}
                className="absolute -top-12 right-0 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                aria-label="Fechar visualização ampliada"
              >
                <X className="h-6 w-6" aria-hidden="true" />
              </button>

              <img
                src={src}
                alt={alt}
                className="max-h-[80vh] w-auto max-w-full object-contain rounded-brand shadow-2xl border border-white/10"
              />

              <div className="mt-3 flex items-center justify-between w-full text-white/80 text-xs px-2">
                <span className="truncate max-w-md">{alt}</span>
                <button
                  type="button"
                  onClick={() => setIsZoomed(false)}
                  className="inline-flex items-center gap-1 hover:text-white underline"
                >
                  <ZoomOut className="h-3.5 w-3.5" aria-hidden="true" />
                  Fechar
                </button>
              </div>
            </div>
          </div>
        );
        const portalRoot = typeof document !== 'undefined' ? document.getElementById('root') : null;
        return portalRoot ? createPortal(lightboxContent, portalRoot) : lightboxContent;
      })()}
    </>
  );
};
