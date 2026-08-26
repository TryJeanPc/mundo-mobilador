import React, { useState } from 'react';
import { Download, Trash2, CheckCircle } from 'lucide-react';
import { ModApk } from '../types';
import { CATEGORY_INFO } from '../data';

interface ModListRowProps {
  mod: ModApk;
  onDelete?: (id: string) => void;
  onDownload?: (id: string) => void;
}

export const ModListRow: React.FC<ModListRowProps> = ({ mod, onDelete, onDownload }) => {
  const catInfo = CATEGORY_INFO[mod.category] || CATEGORY_INFO['Otros'];
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  return (
    <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 p-3 flex items-center hover:border-cyan-400/50 transition-colors group z-10 relative gap-4">
      <div className="w-12 h-12 shrink-0 border border-zinc-700 overflow-hidden relative hidden sm:block">
        <img src={mod.imageUrl || catInfo.image} alt={mod.category} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
      </div>
      
      <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        <div className="md:col-span-4">
          <h3 className="text-sm md:text-base font-bold text-zinc-100 truncate font-mono uppercase tracking-wide group-hover:text-cyan-400 transition-colors">{mod.name}</h3>
          <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest">{mod.author} / {mod.category}</p>
        </div>
        
        <div className="md:col-span-5 hidden md:block">
          <p className="text-zinc-400 text-xs line-clamp-2">{mod.description}</p>
        </div>
        
        <div className="md:col-span-3 flex items-center justify-between md:justify-end gap-2 shrink-0">
          <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-400/30 text-xs px-2 py-1 rounded-sm font-medium whitespace-nowrap mr-2">
            v{mod.version}
          </span>
          
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (isConfirmingDelete) {
                  onDelete(mod.id);
                } else {
                  setIsConfirmingDelete(true);
                  setTimeout(() => setIsConfirmingDelete(false), 3000);
                }
              }}
              className={`flex items-center justify-center border p-2 transition-all ${
                isConfirmingDelete
                  ? 'border-red-500 bg-red-500/20 text-red-500 scale-110 opacity-100'
                  : 'bg-transparent border-zinc-800 text-zinc-500 hover:border-red-500 hover:bg-red-500/20 hover:text-red-500 opacity-0 group-hover:opacity-100'
              }`}
              title={isConfirmingDelete ? "Click de nuevo para borrar" : "Eliminar Mod"}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          {mod.downloadLink ? (
            <a 
              href={mod.downloadLink}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => {
                e.stopPropagation();
                onDownload?.(mod.id);
              }}
              className="flex items-center justify-center gap-2 bg-transparent border border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black p-2 rounded-none transition-all"
              title={`Descargar APK (${mod.size})`}
            >
              <Download className="w-4 h-4" />
            </a>
          ) : (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsDownloading(true);
                onDownload?.(mod.id);
                setTimeout(() => setIsDownloading(false), 2000);
              }}
              className={`flex items-center justify-center gap-2 border p-2 rounded-none transition-all ${
                isDownloading 
                  ? 'bg-cyan-500 text-black border-cyan-500' 
                  : 'bg-transparent border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black'
              }`}
              title={isDownloading ? "Descargando..." : `Descargar APK (${mod.size})`}
            >
              {isDownloading ? <CheckCircle className="w-4 h-4" /> : <Download className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
