import React, { useState, useEffect, useRef } from 'react';
import { 
  Volume2, Volume1, VolumeX, Music, Disc, Palette, 
  Sparkles, Check, Sliders, ChevronDown
} from 'lucide-react';
import { cyberAudio } from '../utils/cyberAudio';
import { CYBER_THEMES, CyberThemeId, applyTheme } from '../utils/theme';

interface AudioThemeControlProps {
  currentTheme: CyberThemeId;
  onThemeChange: (themeId: CyberThemeId) => void;
}

export const AudioThemeControl: React.FC<AudioThemeControlProps> = ({
  currentTheme,
  onThemeChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [volume, setVolume] = useState(cyberAudio.volume);
  const [isMusicOn, setIsMusicOn] = useState(cyberAudio.musicEnabled);
  const [isSfxOn, setIsSfxOn] = useState(cyberAudio.sfxEnabled);
  const [hasInteracted, setHasInteracted] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleVolumeChange = (newVal: number) => {
    setVolume(newVal);
    cyberAudio.setVolume(newVal);
    cyberAudio.playClick();
  };

  const toggleMute = () => {
    cyberAudio.playClick();
    if (volume > 0) {
      handleVolumeChange(0);
    } else {
      handleVolumeChange(0.35);
    }
  };

  const handleToggleMusic = () => {
    setHasInteracted(true);
    const newState = cyberAudio.toggleMusic();
    setIsMusicOn(newState);
    cyberAudio.playToggle(newState);
  };

  const handleToggleSfx = () => {
    const newState = cyberAudio.toggleSfx();
    setIsSfxOn(newState);
  };

  const handleSelectTheme = (themeId: CyberThemeId) => {
    applyTheme(themeId);
    onThemeChange(themeId);
    cyberAudio.playConfirm();
  };

  const activeThemeObj = CYBER_THEMES[currentTheme] || CYBER_THEMES.cyan;

  return (
    <div className="relative inline-block" ref={containerRef}>
      {/* Main HUD Button */}
      <div className="flex items-center gap-1.5 bg-zinc-900/90 border border-zinc-800 hover:border-cyan-400/50 p-1 sm:p-1.5 transition-all shadow-md backdrop-blur-md">
        {/* Quick Mute / Sound Status Button */}
        <button
          onClick={toggleMute}
          className="p-1.5 text-zinc-400 hover:text-cyan-400 hover:bg-zinc-800/80 transition-colors flex items-center gap-1"
          title={volume === 0 ? "Activar audio" : "Silenciar audio general"}
        >
          {volume === 0 ? (
            <VolumeX className="w-4 h-4 text-red-400" />
          ) : volume < 0.5 ? (
            <Volume1 className="w-4 h-4 text-cyan-400" />
          ) : (
            <Volume2 className="w-4 h-4 text-cyan-400" />
          )}
        </button>

        {/* Music Active Equalizer Animation */}
        <button
          onClick={handleToggleMusic}
          className={`flex items-center gap-1.5 px-2 py-1 text-xs font-mono border transition-all ${
            isMusicOn 
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-[0_0_10px_rgba(34,211,238,0.2)]' 
              : 'bg-zinc-950/60 text-zinc-400 hover:text-zinc-200 border-zinc-800'
          }`}
          title={isMusicOn ? "Pausar música cyber de fondo" : "Reproducir música cyber suave de fondo"}
        >
          <Music className={`w-3.5 h-3.5 ${isMusicOn ? 'text-cyan-400 animate-pulse' : ''}`} />
          <span className="hidden sm:inline">
            {isMusicOn ? 'Música: ON' : 'Música'}
          </span>
          {isMusicOn && (
            <div className="flex items-end gap-0.5 h-3">
              <span className="w-0.5 bg-cyan-400 animate-[bounce_1s_infinite_100ms] h-full"></span>
              <span className="w-0.5 bg-cyan-400 animate-[bounce_1s_infinite_300ms] h-2/3"></span>
              <span className="w-0.5 bg-cyan-400 animate-[bounce_1s_infinite_200ms] h-4/5"></span>
            </div>
          )}
        </button>

        {/* Theme Preview Dot & Control Opener */}
        <button
          onClick={() => {
            cyberAudio.playClick();
            setIsOpen(!isOpen);
          }}
          className="flex items-center gap-1.5 px-2 py-1 bg-zinc-950 text-xs font-mono text-zinc-300 hover:text-cyan-300 border border-zinc-800 hover:border-cyan-500/40 transition-colors"
          title="Ajustar volumen, sonidos y temas de color"
        >
          <span 
            className="w-2.5 h-2.5 rounded-full ring-1 ring-white/20" 
            style={{ backgroundColor: activeThemeObj.primaryColor }}
          />
          <span className="hidden md:inline text-[11px] uppercase tracking-wider">
            {Math.round(volume * 100)}%
          </span>
          <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180 text-cyan-400' : ''}`} />
        </button>
      </div>

      {/* Expanded Cyber Panel Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-zinc-950/95 border border-cyan-500/40 p-4 shadow-[0_0_30px_rgba(0,0,0,0.8)] backdrop-blur-xl z-50 text-zinc-200 font-mono text-xs space-y-4 animate-in fade-in zoom-in-95 duration-150">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="text-cyan-400 font-bold uppercase tracking-widest flex items-center gap-1.5 text-[11px]">
              <Sliders className="w-3.5 h-3.5" /> Cyber Panel HUD
            </span>
            <span className="text-[10px] text-zinc-500 uppercase">
              Audio & Estilo
            </span>
          </div>

          {/* Master Volume Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-zinc-400 text-[11px]">
              <span className="flex items-center gap-1">
                <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> Volumen General
              </span>
              <span className="text-zinc-200 font-bold">
                {Math.round(volume * 100)}%
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            {/* Quick volume presets */}
            <div className="flex items-center justify-between pt-1 gap-1 text-[10px]">
              <button
                onClick={() => handleVolumeChange(0)}
                className={`px-1.5 py-0.5 border ${volume === 0 ? 'border-red-400 text-red-400 bg-red-950/40' : 'border-zinc-800 text-zinc-400 hover:text-zinc-200'}`}
              >
                Silencio
              </button>
              <button
                onClick={() => handleVolumeChange(0.25)}
                className={`px-1.5 py-0.5 border ${Math.abs(volume - 0.25) < 0.05 ? 'border-cyan-400 text-cyan-400 bg-cyan-950/40' : 'border-zinc-800 text-zinc-400 hover:text-zinc-200'}`}
              >
                25%
              </button>
              <button
                onClick={() => handleVolumeChange(0.50)}
                className={`px-1.5 py-0.5 border ${Math.abs(volume - 0.50) < 0.05 ? 'border-cyan-400 text-cyan-400 bg-cyan-950/40' : 'border-zinc-800 text-zinc-400 hover:text-zinc-200'}`}
              >
                50%
              </button>
              <button
                onClick={() => handleVolumeChange(0.85)}
                className={`px-1.5 py-0.5 border ${volume > 0.75 ? 'border-cyan-400 text-cyan-400 bg-cyan-950/40' : 'border-zinc-800 text-zinc-400 hover:text-zinc-200'}`}
              >
                85%
              </button>
            </div>
          </div>

          {/* Sound Controls (Music & Click SFX) */}
          <div className="space-y-2 pt-2 border-t border-zinc-800/80">
            {/* Ambient Music Toggle */}
            <div className="flex items-center justify-between bg-zinc-900/60 p-2 border border-zinc-800">
              <div className="flex items-center gap-2">
                <Disc className={`w-4 h-4 ${isMusicOn ? 'text-cyan-400 animate-spin' : 'text-zinc-500'}`} />
                <div>
                  <div className="text-zinc-200 font-bold text-xs">Música de Fondo</div>
                  <div className="text-[10px] text-zinc-500">Tono synthwave suave gamer</div>
                </div>
              </div>

              <button
                onClick={handleToggleMusic}
                className={`px-2.5 py-1 text-[11px] font-bold border transition-colors ${
                  isMusicOn 
                    ? 'bg-cyan-500 text-black border-cyan-400' 
                    : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-zinc-200'
                }`}
              >
                {isMusicOn ? 'ACTIVO' : 'OFF'}
              </button>
            </div>

            {/* Click Effects Toggle */}
            <div className="flex items-center justify-between bg-zinc-900/60 p-2 border border-zinc-800">
              <div className="flex items-center gap-2">
                <Sparkles className={`w-4 h-4 ${isSfxOn ? 'text-cyan-400' : 'text-zinc-500'}`} />
                <div>
                  <div className="text-zinc-200 font-bold text-xs">Sonido al Dar Clic</div>
                  <div className="text-[10px] text-zinc-500">Efecto mecánico táctil</div>
                </div>
              </div>

              <button
                onClick={handleToggleSfx}
                className={`px-2.5 py-1 text-[11px] font-bold border transition-colors ${
                  isSfxOn 
                    ? 'bg-cyan-500 text-black border-cyan-400' 
                    : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-zinc-200'
                }`}
              >
                {isSfxOn ? 'ACTIVO' : 'OFF'}
              </button>
            </div>
          </div>

          {/* Color Themes Selector */}
          <div className="space-y-2 pt-2 border-t border-zinc-800/80">
            <div className="flex items-center justify-between text-zinc-400 text-[11px]">
              <span className="flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-cyan-400" /> Tema de Color Cyberpunk
              </span>
              <span className="text-cyan-400 font-bold text-[10px]">
                {activeThemeObj.name}
              </span>
            </div>

            <div className="grid grid-cols-5 gap-1.5 pt-1">
              {(Object.keys(CYBER_THEMES) as CyberThemeId[]).map((themeId) => {
                const item = CYBER_THEMES[themeId];
                const isSelected = currentTheme === themeId;
                return (
                  <button
                    key={themeId}
                    onClick={() => handleSelectTheme(themeId)}
                    className={`relative p-2 border flex flex-col items-center gap-1 transition-all ${
                      isSelected 
                        ? 'border-white bg-zinc-800 shadow-lg scale-105' 
                        : 'border-zinc-800 bg-zinc-950/70 hover:border-zinc-600'
                    }`}
                    title={`${item.name} (${item.tagline})`}
                  >
                    <span 
                      className="w-4 h-4 rounded-full shadow-sm flex items-center justify-center"
                      style={{ backgroundColor: item.primaryColor }}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5 text-black stroke-[3]" />}
                    </span>
                    <span className="text-[9px] text-zinc-400 truncate w-full text-center">
                      {item.name.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer close info */}
          <div className="pt-2 border-t border-zinc-900 flex justify-between items-center text-[10px] text-zinc-500">
            <span>Ajustes guardados automáticamente</span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-zinc-400 hover:text-cyan-300 underline"
            >
              Cerrar
            </button>
          </div>

        </div>
      )}
    </div>
  );
};
