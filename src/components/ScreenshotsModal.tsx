import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Image as ImageIcon, Maximize2, ExternalLink, Sparkles } from 'lucide-react';
import { ModApk } from '../types';

interface ScreenshotsModalProps {
  isOpen: boolean;
  onClose: () => void;
  mod: ModApk | null;
}

const DEFAULT_MOBILADOR_PREVIEWS = [
  {
    url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1000&auto=format&fit=crop&q=80',
    title: 'Configuración de Mapeo & Teclas'
  },
  {
    url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1000&auto=format&fit=crop&q=80',
    title: 'Interfaz Flotante en Juego'
  },
  {
    url: 'https://images.unsplash.com/photo-1527690789675-4ea7d8da4eb3?w=1000&auto=format&fit=crop&q=80',
    title: 'Calibración de DPI y Sensibilidad'
  }
];

export const ScreenshotsModal: React.FC<ScreenshotsModalProps> = ({ isOpen, onClose, mod }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Compute screenshots list
  const screenshots: { url: string; title?: string }[] = React.useMemo(() => {
    if (!mod) return [];
    if (mod.screenshots && mod.screenshots.length > 0) {
      return mod.screenshots.map((url, i) => ({
        url,
        title: `Captura #${i + 1} de ${mod.name}`
      }));
    }
    // Fallback if mod has no custom screenshots: combine its banner/avatar if present + curated mobilador preview shots
    const list: { url: string; title: string }[] = [];
    if (mod.imageUrl) {
      list.push({ url: mod.imageUrl, title: `${mod.name} (Banner Oficial)` });
    }
    list.push(...DEFAULT_MOBILADOR_PREVIEWS);
    return list;
  }, [mod]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [mod]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, screenshots.length]);

  if (!isOpen || !mod || screenshots.length === 0) return null;

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % screenshots.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + screenshots.length) % screenshots.length);
  };

  const active = screenshots[currentIndex];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 sm:p-6"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-4xl bg-zinc-950 border border-cyan-500/40 shadow-[0_0_50px_rgba(34,211,238,0.15)] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-zinc-900/90 border-b border-zinc-800">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0 text-cyan-400">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-mono font-bold text-sm sm:text-base text-zinc-100 truncate uppercase tracking-wider">
                  {mod.name}
                </h3>
                <span className="text-[11px] font-mono px-2 py-0.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  v{mod.version}
                </span>
              </div>
              <p className="text-zinc-500 text-xs font-mono truncate">
                Por {mod.author} • {mod.category}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-zinc-400 bg-zinc-800/80 px-2.5 py-1 border border-zinc-700">
              {currentIndex + 1} / {screenshots.length}
            </span>
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-cyan-400 hover:bg-cyan-500/10 border border-transparent hover:border-cyan-500/30 transition-colors"
              title="Cerrar galería (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Stage Image Viewer */}
        <div className="relative aspect-video max-h-[60vh] w-full bg-black flex items-center justify-center overflow-hidden select-none">
          <img
            key={active.url}
            src={active.url}
            alt={active.title || mod.name}
            className="w-full h-full object-contain"
          />

          {/* Navigation Arrows */}
          {screenshots.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 sm:p-3 bg-black/70 hover:bg-cyan-500 hover:text-black text-cyan-400 border border-cyan-500/40 transition-all backdrop-blur-sm"
                title="Captura anterior (Flecha Izq)"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                onClick={handleNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 sm:p-3 bg-black/70 hover:bg-cyan-500 hover:text-black text-cyan-400 border border-cyan-500/40 transition-all backdrop-blur-sm"
                title="Siguiente captura (Flecha Der)"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Title Overlay */}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/60 to-transparent p-4 flex items-center justify-between text-xs font-mono">
            <span className="text-zinc-300 font-semibold truncate flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              {active.title || `Captura #${currentIndex + 1}`}
            </span>
            <a
              href={active.url}
              target="_blank"
              rel="noreferrer"
              className="text-cyan-400 hover:text-cyan-200 flex items-center gap-1 shrink-0 text-[11px] underline"
            >
              Ver original <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Thumbnail Selector Strip */}
        {screenshots.length > 1 && (
          <div className="p-3 bg-zinc-900 border-t border-zinc-800 flex items-center gap-2 overflow-x-auto custom-scrollbar">
            {screenshots.map((item, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`relative w-20 h-12 shrink-0 border overflow-hidden transition-all ${
                  currentIndex === idx
                    ? 'border-cyan-400 ring-2 ring-cyan-500/40 scale-105'
                    : 'border-zinc-800 opacity-60 hover:opacity-100 hover:border-zinc-600'
                }`}
              >
                <img
                  src={item.url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
