import React from 'react';
import { X, Users, Star, Shield, User, Zap, Terminal, CheckCircle } from 'lucide-react';

interface CommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Custom TikTok Icon SVG
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 10.692 6.33 6.33 0 0 0 10.857-4.424V8.687a8.182 8.182 0 0 0 4.77 1.526V6.79a4.831 4.831 0 0 1-1.003-.104z"/>
  </svg>
);

// Custom WhatsApp Icon SVG
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
  </svg>
);

export function CommunityModal({ isOpen, onClose }: CommunityModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Dynamic Backdrop */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-md"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-3xl bg-zinc-950/80 backdrop-blur-xl border border-zinc-800 shadow-2xl shadow-cyan-900/20 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-amber-500 to-cyan-500 bg-[length:200%_auto] animate-pulse" />
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800/80 bg-zinc-900/30">
          <h2 className="text-xl font-mono tracking-widest uppercase font-bold text-white">
            Comunidad
          </h2>
          <button 
            onClick={onClose}
            className="group relative p-2 text-zinc-400 hover:text-white transition-colors"
          >
            <div className="absolute inset-0 bg-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <X className="w-6 h-6 relative z-10" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 md:p-8 overflow-y-auto space-y-10 custom-scrollbar">
          
          {/* Fundador Section */}
          <div className="relative">
            {/* Background Decorative Element */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-32 bg-amber-500/5 blur-[100px] pointer-events-none" />

            <div className="flex items-center gap-3 mb-6">
              <Star className="w-6 h-6 text-amber-400" />
              <h3 className="text-xl font-mono tracking-widest uppercase text-amber-400" style={{ textShadow: '0 0 10px rgba(251,191,36,0.3)' }}>
                System_Admin
              </h3>
              <div className="h-[1px] flex-1 bg-gradient-to-r from-amber-500/50 to-transparent" />
            </div>
            
            {/* Founder Card */}
            <div className="relative bg-zinc-900/40 border border-amber-500/20 p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-8 group hover:border-amber-500/50 transition-all duration-500 overflow-hidden">
              
              {/* Corner accents for Founder Card */}
              <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-amber-500/50 group-hover:border-amber-400 transition-colors" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-amber-500/50 group-hover:border-amber-400 transition-colors" />

              {/* Avatar Section */}
              <div className="relative shrink-0">
                <div className="absolute -inset-2 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full blur-md opacity-20 group-hover:opacity-40 transition-opacity duration-500 animate-pulse" />
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-amber-700 p-1 relative z-10">
                  <div className="w-full h-full bg-zinc-950 rounded-full flex items-center justify-center border-4 border-zinc-950 overflow-hidden relative group-hover:scale-105 transition-transform duration-500">
                    <img 
                      src="/images/perfil.jpg" 
                      alt="Perfil de Try Jean Pc" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                {/* Level Badge */}
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-amber-500 text-black text-[10px] font-bold font-mono px-3 py-1 uppercase tracking-wider z-20 whitespace-nowrap shadow-[0_0_10px_rgba(245,158,11,0.5)]">
                  Lvl 99 - Fundador
                </div>
              </div>
              
              {/* Details & Actions */}
              <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left w-full mt-2 md:mt-0">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="text-3xl font-bold font-mono text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500">
                    Try Jean Pc
                  </h4>
                  <CheckCircle className="w-5 h-5 text-amber-500" />
                </div>
                
                <p className="text-zinc-400 text-sm font-mono max-w-md leading-relaxed mb-6">
                  Creador y administrador principal de Mundo Mobilador. Especialista en modificaciones, mapeadores VIP y optimización.
                </p>
                
                {/* Buttons Row */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 w-full">
                  <a 
                    href="https://www.tiktok.com/@tryjeanpc?_r=1" 
                    target="_blank"
                    rel="noreferrer"
                    className="relative flex items-center gap-2 px-6 py-3 bg-[#00f2fe]/5 hover:bg-[#00f2fe]/20 text-[#00f2fe] border border-[#00f2fe]/30 hover:border-[#00f2fe] font-mono tracking-widest text-sm transition-all group/btn overflow-hidden"
                  >
                    <div className="absolute inset-0 w-0 bg-gradient-to-r from-[#00f2fe]/0 via-[#00f2fe]/20 to-[#00f2fe]/0 group-hover/btn:w-full transition-all duration-700 ease-out translate-x-[-100%] group-hover/btn:translate-x-[100%]" />
                    <TikTokIcon className="w-5 h-5" />
                    <span className="font-bold relative z-10">TikTok</span>
                  </a>
                  
                  <a 
                    href="https://chat.whatsapp.com/HsXWSnOgp5U7JJcJLXMcf7?s=cl&p=a&mlu=4" 
                    target="_blank"
                    rel="noreferrer"
                    className="relative flex items-center gap-2 px-6 py-3 bg-[#25D366]/5 hover:bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/30 hover:border-[#25D366] font-mono tracking-widest text-sm transition-all group/btn overflow-hidden"
                  >
                    <div className="absolute inset-0 w-0 bg-gradient-to-r from-[#25D366]/0 via-[#25D366]/20 to-[#25D366]/0 group-hover/btn:w-full transition-all duration-700 ease-out translate-x-[-100%] group-hover/btn:translate-x-[100%]" />
                    <WhatsAppIcon className="w-5 h-5" />
                    <span className="font-bold relative z-10">WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Cofundadores Section */}
          <div className="relative">
             {/* Background Decorative Element */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-32 bg-cyan-500/5 blur-[100px] pointer-events-none" />

            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-6 h-6 text-cyan-400" />
              <h3 className="text-xl font-mono tracking-widest uppercase text-cyan-400" style={{ textShadow: '0 0 10px rgba(34,211,238,0.3)' }}>
                Co-Admins
              </h3>
              <div className="h-[1px] flex-1 bg-gradient-to-r from-cyan-500/30 to-transparent" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Co-founder Slot 1 */}
              <div className="relative bg-zinc-900/30 border border-dashed border-zinc-700/80 p-5 flex items-center gap-5 hover:border-cyan-400/50 transition-colors group overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="w-14 h-14 bg-zinc-950 rounded-none flex items-center justify-center shrink-0 border border-zinc-800 relative z-10">
                  <User className="w-6 h-6 text-zinc-600 group-hover:text-cyan-400 transition-colors" />
                </div>
                <div className="relative z-10">
                  <h4 className="font-bold font-mono text-zinc-300 group-hover:text-white transition-colors flex items-center gap-2">
                    <Zap className="w-4 h-4 text-zinc-600 group-hover:text-cyan-400" />
                    Slot_Abierto
                  </h4>
                  <p className="text-xs text-zinc-500 font-mono mt-1 uppercase tracking-wider">Esperando asignación</p>
                </div>
              </div>
              
              {/* Co-founder Slot 2 */}
              <div className="relative bg-zinc-900/30 border border-dashed border-zinc-700/80 p-5 flex items-center gap-5 hover:border-cyan-400/50 transition-colors group overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="w-14 h-14 bg-zinc-950 rounded-none flex items-center justify-center shrink-0 border border-zinc-800 relative z-10">
                  <User className="w-6 h-6 text-zinc-600 group-hover:text-cyan-400 transition-colors" />
                </div>
                <div className="relative z-10">
                  <h4 className="font-bold font-mono text-zinc-300 group-hover:text-white transition-colors flex items-center gap-2">
                    <Zap className="w-4 h-4 text-zinc-600 group-hover:text-cyan-400" />
                    Slot_Abierto
                  </h4>
                  <p className="text-xs text-zinc-500 font-mono mt-1 uppercase tracking-wider">Esperando asignación</p>
                </div>
              </div>

            </div>
            
            <div className="mt-8 flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-zinc-600 animate-pulse rounded-full" />
              <p className="text-xs text-zinc-500 font-mono tracking-widest uppercase">
                Buscando colaboradores activos
              </p>
              <div className="w-2 h-2 bg-zinc-600 animate-pulse rounded-full" />
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}

