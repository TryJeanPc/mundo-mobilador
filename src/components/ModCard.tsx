import React, { useState } from 'react';
import { Download, User, Cpu, Clock, Trash2, CheckCircle } from 'lucide-react';
import { ModApk } from '../types';
import { CATEGORY_INFO } from '../data';

interface ModCardProps {
  mod: ModApk;
  onDelete?: (id: string) => void;
  onDownload?: (id: string) => void;
}

export const ModCard: React.FC<ModCardProps> = ({ mod, onDelete, onDownload }) => {
  const catInfo = CATEGORY_INFO[mod.category] || CATEGORY_INFO['Otros'];
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  return (
    <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 p-5 flex flex-col hover:border-cyan-400/50 transition-colors group z-10 relative">
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
          className={`absolute top-2 right-2 p-2 bg-black/80 border transition-all z-20 ${
            isConfirmingDelete
              ? 'border-red-500 text-red-500 opacity-100 scale-110'
              : 'border-zinc-800 hover:border-red-500 hover:bg-red-500/20 text-zinc-500 hover:text-red-500 opacity-0 group-hover:opacity-100'
          }`}
          title={isConfirmingDelete ? "Click de nuevo para borrar" : "Eliminar Mod"}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
      <div className="flex gap-4 mb-4">
        <div className="w-16 h-16 shrink-0 border border-zinc-700 overflow-hidden relative">
          <img src={mod.imageUrl || catInfo.image} alt={mod.category} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
          <div className="absolute inset-0 bg-cyan-500/0 group-hover:bg-cyan-500/20 transition-colors pointer-events-none"></div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-zinc-100 truncate font-mono uppercase tracking-wide">{mod.name}</h3>
          <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-400/30 text-xs px-2 py-1 rounded-sm font-medium whitespace-nowrap mt-2 inline-block">
            v{mod.version}
          </span>
        </div>
      </div>
      
      <p className="text-zinc-400 text-sm mb-4 line-clamp-3 flex-grow">
        {mod.description}
      </p>
      
      <div className="space-y-2 mb-5 text-sm">
        <div className="flex items-center text-zinc-500">
          <User className="w-4 h-4 mr-2" />
          <span className="truncate">Autor: <span className="text-zinc-300">{mod.author}</span></span>
        </div>
        <div className="flex items-center text-zinc-500">
          <Cpu className="w-4 h-4 mr-2" />
          <span>Categoría: <span className="text-zinc-300">{mod.category}</span></span>
        </div>
        <div className="flex items-center text-zinc-500">
          <Clock className="w-4 h-4 mr-2" />
          <span>Actualizado: <span className="text-zinc-300">{mod.uploadDate}</span></span>
        </div>
      </div>
      
      {mod.downloadLink ? (
        <a 
          href={mod.downloadLink}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => {
            e.stopPropagation();
            onDownload?.(mod.id);
          }}
          className="w-full flex items-center justify-center gap-2 bg-transparent border border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black py-2 rounded-none font-mono font-bold transition-all"
        >
          <Download className="w-4 h-4" />
          DESCARGAR APK ({mod.size})
        </a>
      ) : (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setIsDownloading(true);
            onDownload?.(mod.id);
            setTimeout(() => setIsDownloading(false), 2000);
          }}
          className={`w-full flex items-center justify-center gap-2 border py-2 rounded-none font-mono font-bold transition-all ${
            isDownloading 
              ? 'bg-cyan-500 text-black border-cyan-500' 
              : 'bg-transparent border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black'
          }`}
        >
          {isDownloading ? (
            <>
              <CheckCircle className="w-4 h-4" /> LISTO
            </>
          ) : (
            <>
              <Download className="w-4 h-4" /> DESCARGAR APK ({mod.size})
            </>
          )}
        </button>
      )}
    </div>
  );
}
