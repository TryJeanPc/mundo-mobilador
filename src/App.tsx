import React, { useState, useEffect, useMemo } from 'react';
import { Search, Plus, ShieldAlert, Library, Info, Folder, User, Package, ChevronRight, LayoutGrid, List, Menu, X } from 'lucide-react';
import { ModApk, Author, CATEGORIES } from './types';
import { INITIAL_MODS, INITIAL_AUTHORS, CATEGORY_INFO } from './data';
import { ModCard } from './components/ModCard';
import { ModListRow } from './components/ModListRow';
import { UploadModal } from './components/UploadModal';
import { NetworkParticles } from './components/NetworkParticles';
import { TiltImage } from './components/TiltImage';
import { TerminalLog } from './components/TerminalLog';
import { CommunityModal } from './components/CommunityModal';

import { useFirebase } from './useFirebase';

export default function App() {
  const { 
    user, isAdmin, loading, 
    mods, authors, 
    login, logout, 
    addMod, deleteMod, incrementDownload, 
    addAuthor, deleteAuthor, claimAdminRole
  } = useFirebase();

  const [searchQuery, setSearchQuery] = useState('');
  
  // View Mode: 'grid' or 'list'
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Drill-down state
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const [selectedCreator, setSelectedCreator] = useState<string | null>(null);
  
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isCommunityModalOpen, setIsCommunityModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleUpload = async (newMod: ModApk) => {
    // The useFirebase addMod takes Omit<ModApk, 'id'>, but newMod has an id (generated in UploadModal)
    // We can just pass the whole newMod and Firestore will ignore the id field if we don't save it, or we can strip it.
    const { id, ...modData } = newMod;
    await addMod(modData as any);
  };

  const handleAddAuthor = async (newAuthor: Author) => {
    const { id, ...authorData } = newAuthor;
    await addAuthor(authorData as any);
  };

  const handleDeleteAuthor = async (authorId: string) => {
    const authorToDelete = authors.find(a => a.id === authorId);
    if (!authorToDelete) return;

    await deleteAuthor(authorId);
    
    if (selectedCreator === authorToDelete.name) {
      setSelectedCreator(null);
    }
  };

  const handleDeleteMod = async (modId: string) => {
    await deleteMod(modId);
  };

  const handleIncrementDownload = async (modId: string) => {
    await incrementDownload(modId);
  };

  const handleResetNavigation = () => {
    setSelectedCategory(null);
    setSelectedCreator(null);
  };

  // Hierarchy Data Extraction
  const currentCategoryAuthors = useMemo(() => {
    if (!selectedCategory) return [];
    return authors.filter(a => a.category === selectedCategory);
  }, [authors, selectedCategory]);

  const currentApks = useMemo(() => {
    if (!selectedCategory || !selectedCreator) return [];
    return mods.filter(m => m.category === selectedCategory && m.author === selectedCreator);
  }, [mods, selectedCategory, selectedCreator]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return mods.filter(m => 
      m.name.toLowerCase().includes(q) || 
      m.author.toLowerCase().includes(q) || 
      m.project.toLowerCase().includes(q)
    );
  }, [mods, searchQuery]);

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans selection:bg-cyan-500/30 overflow-x-hidden relative">
      <NetworkParticles />
      
      {/* Navbar */}
      <header className="relative z-40 border-b border-zinc-800/50 bg-black/40 backdrop-blur-md">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-bold font-mono tracking-widest uppercase">
                Mundo <span className="text-cyan-400">Mobilador</span>
              </h1>
            </div>
            
            <nav className="hidden md:flex gap-8 text-sm font-mono tracking-widest uppercase text-zinc-400">
              <a href="#" className="hover:text-cyan-400 transition-colors">Inicio</a>
              <a href="#mods" className="hover:text-cyan-400 transition-colors">Mods</a>
              <button 
                onClick={() => setIsCommunityModalOpen(true)}
                className="hover:text-cyan-400 transition-colors text-left"
              >
                Comunidad
              </button>
            </nav>
            
            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 text-zinc-400 hover:text-cyan-400 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-20 left-0 w-full bg-zinc-950/95 backdrop-blur-xl border-b border-zinc-800 p-4 shadow-2xl z-50">
            <nav className="flex flex-col gap-4 text-sm font-mono tracking-widest uppercase text-zinc-400">
              <a 
                href="#" 
                className="hover:text-cyan-400 transition-colors py-2 border-b border-zinc-900"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Inicio
              </a>
              <a 
                href="#mods" 
                className="hover:text-cyan-400 transition-colors py-2 border-b border-zinc-900"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Mods
              </a>
              <button 
                onClick={() => {
                  setIsCommunityModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="hover:text-cyan-400 transition-colors text-left py-2"
              >
                Comunidad
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24 flex flex-col md:flex-row items-center justify-between">
        <div className="md:w-1/2 space-y-8 text-center md:text-left z-20">
          <h2 className="text-5xl md:text-7xl font-bold font-mono tracking-tighter uppercase leading-none glitch-effect cursor-default">
            Mundo<br/>
            <span className="text-cyan-400" style={{ textShadow: '0 0 20px rgba(34,211,238,0.5)' }}>Mobilador</span>
          </h2>
          <p className="text-zinc-400 text-lg md:text-xl font-light max-w-lg lg:max-w-xl xl:max-w-2xl leading-relaxed">
            "Hola, te damos la bienvenida a Mundo Mobilador, el lugar donde encontrarás mapeadores con acceso VIP. Somos la comunidad principal dedicada a centralizar, organizar y compartir las mejores versiones y codificaciones de Panda Mouse Pro, GG Mouse Pro y otras herramientas de mapeo. Explora nuestro catálogo, todo está disponible de forma 100% gratuita."
          </p>
          
          {/* HUD Stats */}
          <div className="flex gap-4 justify-center md:justify-start">
            <div className="border border-zinc-800 bg-zinc-950/60 backdrop-blur-sm p-3 w-28 text-center">
              <div className="text-cyan-400 font-mono text-xl">{mods.length}</div>
              <div className="text-zinc-500 text-[10px] tracking-widest uppercase">Mods</div>
            </div>
            <div className="border border-zinc-800 bg-zinc-950/60 backdrop-blur-sm p-3 w-28 text-center">
              <div className="text-cyan-400 font-mono text-xl">{authors.length}</div>
              <div className="text-zinc-500 text-[10px] tracking-widest uppercase">Creadores</div>
            </div>
            <div className="border border-zinc-800 bg-zinc-950/60 backdrop-blur-sm p-3 w-28 text-center">
              <div className="text-cyan-400 font-mono text-xl">{mods.reduce((acc, mod) => acc + (mod.downloads || 0), 0)}</div>
              <div className="text-zinc-500 text-[10px] tracking-widest uppercase">Descargas</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            {isAdmin && (
              <button 
                onClick={() => setIsUploadModalOpen(true)}
                className="px-8 py-3 bg-transparent border border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black font-mono font-bold tracking-widest uppercase transition-all glitch-effect"
              >
                Subir APK
              </button>
            )}
            <a 
              href="#mods"
              className="px-8 py-3 bg-transparent border border-zinc-600 text-zinc-300 hover:border-zinc-300 font-mono font-bold tracking-widest uppercase transition-all text-center"
            >
              Explorar
            </a>
            
            {user && !isAdmin && (
              <button 
                onClick={async () => {
                  const code = window.prompt("Introduce el Código Secreto de Administrador:");
                  if (code) {
                    const success = await claimAdminRole(code);
                    if (success) window.alert("¡Acceso de Administrador Concedido!");
                    else window.alert("Código incorrecto.");
                  }
                }}
                className="px-4 py-3 bg-transparent border border-zinc-800 text-zinc-600 hover:border-amber-500 hover:text-amber-500 font-mono text-xs tracking-widest uppercase transition-all text-center flex items-center justify-center gap-2"
              >
                <ShieldAlert className="w-4 h-4" />
                Reclamar Admin
              </button>
            )}

            {!user ? (
              <button onClick={login} className="px-8 py-3 bg-transparent border border-zinc-800 text-zinc-500 hover:border-cyan-500 hover:text-cyan-500 font-mono font-bold tracking-widest uppercase transition-all">
                Ingresar
              </button>
            ) : (
              <button onClick={logout} className="px-8 py-3 bg-transparent border border-zinc-800 text-zinc-500 hover:border-red-500 hover:text-red-500 font-mono font-bold tracking-widest uppercase transition-all">
                Salir
              </button>
            )}
          </div>

          <TerminalLog latestMod={mods[0]?.name || ''} />
        </div>
        <div className="md:w-1/2 w-full mt-12 md:mt-0">
          <TiltImage />
        </div>
      </section>

      {/* Warning Banner */}
      <div className="relative z-10 bg-amber-500/10 border-y border-amber-500/20 px-4 py-2 text-center font-mono text-xs tracking-widest">
        <p className="text-amber-400 flex items-center justify-center gap-2 uppercase">
          <Info className="w-4 h-4 shrink-0" />
          <span className="truncate">La subida y eliminación de APKs funciona en tiempo real.</span>
        </p>
      </div>

      <main id="mods" className="relative z-10 max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 min-h-[500px]">
        <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="relative">
            <h3 className="text-3xl font-mono font-bold tracking-widest uppercase mb-2 flex items-center gap-3 text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-500">
              <span className="text-cyan-400">/</span> Base de Datos
            </h3>
            <div className="flex items-center gap-2">
              <div className="h-[2px] w-12 bg-cyan-400"></div>
              <div className="h-[2px] w-4 bg-cyan-400/50"></div>
              <div className="h-[2px] w-2 bg-cyan-400/20"></div>
            </div>
            {/* Ambient glow */}
            <div className="absolute -inset-4 bg-cyan-500/10 blur-2xl -z-10 rounded-full opacity-50" />
          </div>
          
          <div className="relative w-full md:w-auto md:min-w-[350px] group">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity blur-md" />
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
              <Search className="h-5 w-5 text-cyan-500/70 group-focus-within:text-cyan-400 transition-colors" />
            </div>
            <input
              type="text"
              className="block w-full pl-12 pr-4 py-3 border border-zinc-800 bg-zinc-950/80 backdrop-blur-xl text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/50 transition-all font-mono uppercase text-sm relative z-0"
              placeholder="Búsqueda global..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-500/50 opacity-0 group-focus-within:opacity-100 transition-opacity" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-500/50 opacity-0 group-focus-within:opacity-100 transition-opacity" />
          </div>
        </div>

        {searchQuery.trim() ? (
          // --- SEARCH RESULTS VIEW ---
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-2 bg-cyan-400 animate-pulse" />
              <h4 className="text-xl font-mono tracking-widest uppercase text-cyan-400">Resultados para: {searchQuery}</h4>
            </div>
            {searchResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {searchResults.map(mod => <ModCard key={mod.id} mod={mod} onDelete={isAdmin ? handleDeleteMod : undefined} onDownload={handleIncrementDownload} />)}
              </div>
            ) : (
              <div className="text-center py-20 border border-dashed border-zinc-700/50 bg-zinc-900/20 backdrop-blur-sm">
                <ShieldAlert className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                <h3 className="text-lg font-mono tracking-widest uppercase text-zinc-500">Sin resultados_</h3>
              </div>
            )}
          </div>
        ) : (
          // --- DRILL-DOWN NAVIGATION VIEW ---
          <div className="space-y-8">
            {/* Breadcrumbs & View Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative flex flex-wrap items-center gap-2 text-xs sm:text-sm font-mono uppercase border border-zinc-800 bg-zinc-950/80 backdrop-blur-xl px-5 py-4 text-zinc-400 flex-1 overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-cyan-500/50 to-transparent opacity-50" />
                
                <button onClick={handleResetNavigation} className={`hover:text-cyan-400 transition-colors flex items-center gap-2 ${!selectedCategory ? 'text-cyan-400 font-bold' : ''}`}>
                  <div className={`w-2 h-2 rounded-full ${!selectedCategory ? 'bg-cyan-400 animate-pulse' : 'bg-zinc-600'}`} />
                  Raíz
                </button>
                
                {selectedCategory && (
                  <>
                    <ChevronRight className="w-4 h-4 text-zinc-600 shrink-0" />
                    <button onClick={() => { setSelectedCreator(null); }} className={`hover:text-cyan-400 transition-colors flex items-center gap-2 ${!selectedCreator ? 'text-cyan-400 font-bold' : ''}`}>
                      <div className={`w-2 h-2 rounded-full ${!selectedCreator ? 'bg-cyan-400 animate-pulse' : 'bg-zinc-600'}`} />
                      {selectedCategory}
                    </button>
                  </>
                )}
                
                {selectedCreator && (
                  <>
                    <ChevronRight className="w-4 h-4 text-zinc-600 shrink-0" />
                    <span className="text-cyan-400 font-bold flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                      <User className="w-3 h-3" />
                      {selectedCreator}
                    </span>
                  </>
                )}
              </div>

              {/* View Mode Toggle (Only show when viewing APKs) */}
              {selectedCategory && selectedCreator && (
                <div className="flex items-center bg-zinc-950/80 backdrop-blur-xl border border-zinc-800 p-1 shrink-0 relative">
                  <button 
                    onClick={() => setViewMode('grid')}
                    className={`relative p-2 transition-colors z-10 ${viewMode === 'grid' ? 'text-cyan-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                    title="Vista Cuadrícula"
                  >
                    {viewMode === 'grid' && <div className="absolute inset-0 bg-cyan-500/20 -z-10" />}
                    <LayoutGrid className="w-5 h-5" />
                  </button>
                  <div className="w-[1px] h-6 bg-zinc-800 mx-1" />
                  <button 
                    onClick={() => setViewMode('list')}
                    className={`relative p-2 transition-colors z-10 ${viewMode === 'list' ? 'text-cyan-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                    title="Vista Lista"
                  >
                    {viewMode === 'list' && <div className="absolute inset-0 bg-cyan-500/20 -z-10" />}
                    <List className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            {/* LEVEL 1: Categories */}
            {!selectedCategory && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5 gap-6">
                {CATEGORIES.map(category => {
                  const info = CATEGORY_INFO[category] || CATEGORY_INFO['Otros'];
                  return (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className="group relative overflow-hidden bg-zinc-950 border border-zinc-800 hover:border-cyan-500/50 transition-all duration-300 text-left flex flex-col h-48 shadow-lg shadow-black/50"
                    >
                      {/* Background Image Restored with Dark Overlay */}
                      <img src={info.image} alt={category} className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-40 group-hover:scale-110 transition-all duration-700 ease-out" />
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/90 to-zinc-950/40"></div>

                      {/* Top Accent Line */}
                      <div className="absolute top-0 left-0 w-0 h-[2px] bg-gradient-to-r from-cyan-400 to-transparent group-hover:w-full transition-all duration-500 ease-out z-20" />
                      
                      {/* Corner Accents */}
                      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-500/0 group-hover:border-cyan-500/50 transition-colors z-20" />
                      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-500/0 group-hover:border-cyan-500/50 transition-colors z-20" />

                      {/* Content */}
                      <div className="relative z-10 p-6 flex flex-col h-full justify-between transition-colors">
                        <div className="flex justify-between items-start">
                          <div className="p-2 bg-zinc-900/50 border border-zinc-800 group-hover:border-cyan-500/30 transition-colors backdrop-blur-sm">
                            <Folder className="w-6 h-6 text-cyan-500/70 group-hover:text-cyan-400 transition-colors" />
                          </div>
                          <span className="text-[10px] font-mono text-zinc-500 group-hover:text-cyan-400/80 transition-colors bg-zinc-950/80 px-2 py-1 border border-zinc-800">DIR_SYS</span>
                        </div>
                        
                        <div>
                          <h4 className="text-xl font-mono tracking-widest uppercase text-zinc-300 group-hover:text-white flex items-center gap-2 transition-colors mb-1">
                            <span className="w-1 h-4 bg-cyan-500/0 group-hover:bg-cyan-500/100 transition-all"></span>
                            {category}
                          </h4>
                          <p className="text-xs font-mono text-zinc-500 group-hover:text-zinc-400 transition-colors line-clamp-2">
                            {info.desc}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* LEVEL 2: Creators */}
            {selectedCategory && !selectedCreator && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4">
                {currentCategoryAuthors.length > 0 ? currentCategoryAuthors.map(author => (
                  <button
                    key={author.id}
                    onClick={() => setSelectedCreator(author.name)}
                    className="p-6 border border-zinc-800 bg-zinc-900/30 hover:bg-cyan-500/10 hover:border-cyan-400 transition-all flex flex-col items-center justify-center text-center group"
                  >
                    <div className="w-16 h-16 rounded-full bg-zinc-950 border border-zinc-700 group-hover:border-cyan-400 mb-4 overflow-hidden flex items-center justify-center relative">
                      {author.imageUrl ? (
                        <img src={author.imageUrl} alt={author.name} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-8 h-8 text-cyan-500" />
                      )}
                      <div className="absolute inset-0 bg-cyan-500/0 group-hover:bg-cyan-500/10 transition-colors pointer-events-none"></div>
                    </div>
                    <span className="font-mono text-sm tracking-widest uppercase text-zinc-300 group-hover:text-cyan-400">{author.name}</span>
                  </button>
                )) : (
                  <div className="col-span-full text-center py-12 text-zinc-500 font-mono">No hay creadores registrados en esta categoría.</div>
                )}
              </div>
            )}

            {/* LEVEL 3: APKs (ModCards or List) */}
            {selectedCategory && selectedCreator && (
              <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "flex flex-col gap-3"}>
                {currentApks.length > 0 ? currentApks.map(mod => (
                  viewMode === 'grid' 
                    ? <ModCard key={mod.id} mod={mod} onDelete={isAdmin ? handleDeleteMod : undefined} onDownload={handleIncrementDownload} /> 
                    : <ModListRow key={mod.id} mod={mod} onDelete={isAdmin ? handleDeleteMod : undefined} onDownload={handleIncrementDownload} />
                )) : (
                  <div className="col-span-full text-center py-12 text-zinc-500 font-mono">No se encontraron versiones para este creador.</div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      <UploadModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
        onUpload={handleUpload}
        authors={authors}
        onAddAuthor={handleAddAuthor}
        onDeleteAuthor={handleDeleteAuthor}
      />

      <CommunityModal 
        isOpen={isCommunityModalOpen}
        onClose={() => setIsCommunityModalOpen(false)}
      />
    </div>
  );
}

