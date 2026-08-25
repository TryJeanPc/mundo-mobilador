import React, { useState, useEffect } from 'react';
import { Terminal } from 'lucide-react';

interface TerminalLogProps {
  latestMod: string;
}

export function TerminalLog({ latestMod }: TerminalLogProps) {
  const [lines, setLines] = useState<string[]>([]);
  
  useEffect(() => {
    const sequence = [
      "> Iniciando protocolo Yautja... OK",
      "> Conectando a la red neuronal... OK",
      "> Verificando integridad de archivos... OK",
      `> Último mod detectado: ${latestMod || 'Ninguno'}`,
      "> SISTEMA ONLINE. LISTO PARA OPERAR."
    ];

    let currentIndex = 0;
    setLines([]);

    const interval = setInterval(() => {
      if (currentIndex < sequence.length) {
        setLines(prev => [...prev, sequence[currentIndex]]);
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 800);

    return () => clearInterval(interval);
  }, [latestMod]);

  return (
    <div className="bg-black/60 backdrop-blur-md border border-zinc-800 p-3 font-mono text-xs text-cyan-400 mt-6 w-full max-w-lg h-36 flex flex-col justify-end shadow-[0_0_15px_rgba(0,0,0,0.5)]">
      <div className="flex items-center gap-2 text-zinc-500 border-b border-zinc-800 pb-2 mb-2 shrink-0">
        <Terminal className="w-3 h-3" />
        <span>SYS.LOG // STARTUP_SEQ</span>
      </div>
      <div className="flex-1 space-y-1.5 overflow-hidden flex flex-col justify-end">
        {lines.map((line, i) => (
          <div key={i} className="animate-pulse">{line}</div>
        ))}
        {lines.length < 5 && <div className="w-2 h-3 bg-cyan-400 animate-pulse mt-1" />}
      </div>
    </div>
  );
}
