import React, { useState } from 'react';
import { X, UploadCloud, User, Lock, Plus, Folder, CheckCircle, ChevronRight, Trash2, Loader2 } from 'lucide-react';
import { ModApk, Author, CATEGORIES } from '../types';
import { storage } from '../firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (mod: ModApk) => void;
  authors: Author[];
  onAddAuthor: (author: Author) => void;
  onDeleteAuthor: (id: string) => void;
}

type Step = 'LOGIN' | 'AUTHOR_SELECT' | 'AUTHOR_CREATE' | 'MOD_UPLOAD';

const AuthorDeleteButton = ({ author, onDelete }: { author: Author, onDelete: () => void }) => {
  const [isConfirming, setIsConfirming] = useState(false);
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        if (isConfirming) {
          onDelete();
        } else {
          setIsConfirming(true);
          setTimeout(() => setIsConfirming(false), 3000);
        }
      }}
      className={`w-12 flex items-center justify-center shrink-0 border transition-colors ${
        isConfirming 
          ? 'bg-red-500/20 border-red-500 text-red-500' 
          : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-red-500 hover:bg-red-500/10 hover:text-red-500'
      }`}
      title={isConfirming ? "Click de nuevo para borrar" : "Eliminar Autor"}
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
};

export function UploadModal({ isOpen, onClose, onUpload, authors, onAddAuthor, onDeleteAuthor }: UploadModalProps) {
  const [step, setStep] = useState<Step>('LOGIN');
  
  // Login State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Author State
  const [selectedAuthor, setSelectedAuthor] = useState<Author | null>(null);
  
  // New Author Form
  const [newAuthorData, setNewAuthorData] = useState({
    name: '',
    category: CATEGORIES[0],
    imageUrl: ''
  });

  // Mod Upload Form
  const [uploadMethod, setUploadMethod] = useState<'file' | 'link'>('file');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  const [modFormData, setModFormData] = useState({
    name: '',
    project: '',
    version: '',
    description: '',
    imageUrl: '',
    downloadLink: '',
  });

  if (!isOpen) return null;

  const handleClose = () => {
    setStep('LOGIN');
    setUsername('');
    setPassword('');
    setSelectedAuthor(null);
    setModFormData({ name: '', project: '', version: '', description: '', imageUrl: '', downloadLink: '' });
    setUploadMethod('file');
    onClose();
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    // Simulate login delay
    setTimeout(() => {
      setIsLoggingIn(false);
      setStep('AUTHOR_SELECT');
    }, 800);
  };

  const handleCreateAuthor = (e: React.FormEvent) => {
    e.preventDefault();
    const newAuthor: Author = {
      id: Math.random().toString(36).substring(2, 9),
      ...newAuthorData
    };
    onAddAuthor(newAuthor);
    setSelectedAuthor(newAuthor);
    setStep('MOD_UPLOAD');
  };

  const handleModUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAuthor) return;

    if (uploadMethod === 'file' && selectedFile) {
      setIsUploading(true);
      const fileRef = ref(storage, `mods/${Date.now()}_${selectedFile.name}`);
      const uploadTask = uploadBytesResumable(fileRef, selectedFile);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error("Upload failed", error);
          setIsUploading(false);
          alert("Error al subir el archivo.");
        },
        async () => {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          
          const newMod: ModApk = {
            id: Math.random().toString(36).substring(2, 9),
            ...modFormData,
            downloadLink: downloadUrl,
            author: selectedAuthor.name,
            category: selectedAuthor.category,
            uploadDate: new Date().toISOString().split('T')[0],
            size: (selectedFile.size / (1024 * 1024)).toFixed(1) + ' MB',
            downloads: 0
          };
          
          onUpload(newMod);
          setIsUploading(false);
          handleClose();
        }
      );
    } else {
      // Link upload
      const newMod: ModApk = {
        id: Math.random().toString(36).substring(2, 9),
        ...modFormData,
        author: selectedAuthor.name,
        category: selectedAuthor.category,
        uploadDate: new Date().toISOString().split('T')[0],
        size: (Math.random() * 20 + 5).toFixed(1) + ' MB',
        downloads: 0
      };
      onUpload(newMod);
      handleClose();
    }
  };

  // UI rendering based on steps
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-none w-full max-w-md shadow-[0_0_50px_rgba(34,211,238,0.1)] overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-zinc-800 bg-zinc-950">
          <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2 font-mono uppercase tracking-widest">
            {step === 'LOGIN' && <><Lock className="text-cyan-400 w-5 h-5" /> Acceso Restringido</>}
            {step === 'AUTHOR_SELECT' && <><User className="text-cyan-400 w-5 h-5" /> Seleccionar Autor</>}
            {step === 'AUTHOR_CREATE' && <><Plus className="text-cyan-400 w-5 h-5" /> Nuevo Creador</>}
            {step === 'MOD_UPLOAD' && <><UploadCloud className="text-cyan-400 w-5 h-5" /> Subir Mod</>}
          </h2>
          <button onClick={handleClose} className="text-zinc-500 hover:text-cyan-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          {/* STEP: LOGIN */}
          {step === 'LOGIN' && (
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="text-center mb-6">
                <p className="text-zinc-400 text-sm font-mono">Inicie sesión para acceder al sistema de subida.</p>
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-mono text-cyan-400 uppercase tracking-widest">Usuario</label>
                  <input 
                    required
                    type="text" 
                    className="w-full bg-black border border-zinc-800 px-4 py-3 text-zinc-100 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-mono text-sm transition-colors"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-mono text-cyan-400 uppercase tracking-widest">Contraseña</label>
                  <input 
                    required
                    type="password" 
                    className="w-full bg-black border border-zinc-800 px-4 py-3 text-zinc-100 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-mono text-sm transition-colors"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={isLoggingIn}
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-3 uppercase tracking-widest font-mono transition-colors disabled:opacity-50"
              >
                {isLoggingIn ? 'Autenticando...' : 'Iniciar Sesión'}
              </button>
            </form>
          )}

          {/* STEP: AUTHOR SELECT */}
          {step === 'AUTHOR_SELECT' && (
            <div className="space-y-6">
              <p className="text-zinc-400 text-sm font-mono text-center">Selecciona tu perfil de creador o registra uno nuevo.</p>
              
              <div className="max-h-60 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {authors.map(author => (
                  <div key={author.id} className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedAuthor(author);
                        setStep('MOD_UPLOAD');
                      }}
                      className="flex-1 flex items-center gap-4 p-3 bg-zinc-950 border border-zinc-800 hover:border-cyan-400 hover:bg-cyan-500/10 transition-colors text-left group"
                    >
                      <div className="w-10 h-10 rounded-full border border-zinc-700 bg-black overflow-hidden flex items-center justify-center shrink-0">
                        {author.imageUrl ? (
                          <img src={author.imageUrl} alt={author.name} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-5 h-5 text-zinc-500 group-hover:text-cyan-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="text-zinc-200 font-bold font-mono tracking-wide group-hover:text-cyan-400">{author.name}</div>
                        <div className="text-zinc-500 text-xs font-mono uppercase">{author.category}</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-cyan-400" />
                    </button>
                    <AuthorDeleteButton author={author} onDelete={() => onDeleteAuthor(author.id)} />
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-zinc-800">
                <button 
                  onClick={() => setStep('AUTHOR_CREATE')}
                  className="w-full flex items-center justify-center gap-2 bg-transparent border border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black py-3 font-mono font-bold tracking-widest uppercase transition-colors"
                >
                  <Plus className="w-4 h-4" /> Registrar Nuevo Creador
                </button>
              </div>
            </div>
          )}

          {/* STEP: AUTHOR CREATE */}
          {step === 'AUTHOR_CREATE' && (
            <form onSubmit={handleCreateAuthor} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-mono text-cyan-400 uppercase tracking-widest">Nombre del Creador</label>
                <input 
                  required
                  type="text" 
                  className="w-full bg-black border border-zinc-800 px-4 py-2 text-zinc-100 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-mono text-sm"
                  value={newAuthorData.name}
                  onChange={e => setNewAuthorData({...newAuthorData, name: e.target.value})}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-cyan-400 uppercase tracking-widest">Categoría Principal</label>
                <select 
                  className="w-full bg-black border border-zinc-800 px-4 py-2 text-zinc-100 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-mono text-sm"
                  value={newAuthorData.category}
                  onChange={e => setNewAuthorData({...newAuthorData, category: e.target.value})}
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-cyan-400 uppercase tracking-widest">Logo (Opcional)</label>
                <div className="flex items-center gap-4">
                  {newAuthorData.imageUrl && (
                    <div className="w-12 h-12 rounded-full border border-zinc-700 bg-black overflow-hidden shrink-0">
                      <img src={newAuthorData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <label className="flex-1 border border-dashed border-zinc-700 hover:border-cyan-400 bg-black px-4 py-2 cursor-pointer transition-colors text-center font-mono text-xs text-zinc-400 hover:text-cyan-400">
                    <span>{newAuthorData.imageUrl ? 'Cambiar' : 'Subir Imagen'}</span>
                    <input 
                      type="file" 
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setNewAuthorData({...newAuthorData, imageUrl: reader.result as string});
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="flex gap-4 pt-4 mt-4 border-t border-zinc-800">
                <button 
                  type="button" 
                  onClick={() => setStep('AUTHOR_SELECT')}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-2 font-mono text-sm uppercase tracking-wider transition-colors"
                >
                  Volver
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-black py-2 font-mono text-sm uppercase font-bold tracking-wider transition-colors"
                >
                  Guardar
                </button>
              </div>
            </form>
          )}

          {/* STEP: MOD UPLOAD */}
          {step === 'MOD_UPLOAD' && selectedAuthor && (
            <form onSubmit={handleModUpload} className="space-y-4">
              <div className="bg-cyan-500/10 border border-cyan-500/30 p-3 flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full border border-cyan-500/50 overflow-hidden shrink-0">
                  {selectedAuthor.imageUrl ? (
                    <img src={selectedAuthor.imageUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-cyan-900/50 flex items-center justify-center">
                      <User className="w-4 h-4 text-cyan-400" />
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-xs text-cyan-400/70 font-mono uppercase">Publicando como</div>
                  <div className="text-sm font-bold text-cyan-400 font-mono">{selectedAuthor.name}</div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-zinc-400 uppercase tracking-widest">Nombre del Mod</label>
                <input 
                  required
                  type="text" 
                  className="w-full bg-black border border-zinc-800 px-4 py-2 text-zinc-100 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-mono text-sm"
                  value={modFormData.name}
                  onChange={e => setModFormData({...modFormData, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-mono text-zinc-400 uppercase tracking-widest">Versión</label>
                  <input 
                    required
                    type="text" 
                    className="w-full bg-black border border-zinc-800 px-4 py-2 text-zinc-100 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-mono text-sm"
                    value={modFormData.version}
                    onChange={e => setModFormData({...modFormData, version: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-mono text-zinc-400 uppercase tracking-widest">Proyecto</label>
                  <input 
                    type="text" 
                    className="w-full bg-black border border-zinc-800 px-4 py-2 text-zinc-100 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-mono text-sm"
                    value={modFormData.project}
                    onChange={e => setModFormData({...modFormData, project: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-zinc-400 uppercase tracking-widest">Descripción</label>
                <textarea 
                  required
                  rows={2}
                  className="w-full bg-black border border-zinc-800 px-4 py-2 text-zinc-100 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-mono text-sm resize-none"
                  value={modFormData.description}
                  onChange={e => setModFormData({...modFormData, description: e.target.value})}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-zinc-400 uppercase tracking-widest">Logo del Mod (Opcional)</label>
                <div className="flex items-center gap-4">
                  {modFormData.imageUrl && (
                    <div className="w-10 h-10 border border-zinc-700 bg-black overflow-hidden shrink-0">
                      <img src={modFormData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <label className="flex-1 border border-dashed border-zinc-700 hover:border-cyan-400 bg-black px-4 py-2 cursor-pointer transition-colors text-center font-mono text-xs text-zinc-400 hover:text-cyan-400">
                    <span>{modFormData.imageUrl ? 'Cambiar imagen' : 'Seleccionar imagen'}</span>
                    <input 
                      type="file" 
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setModFormData({...modFormData, imageUrl: reader.result as string});
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-zinc-400 uppercase tracking-widest">Archivo del Mod</label>
                <div className="flex bg-black border border-zinc-800 p-1 rounded-none mb-2">
                  <button
                    type="button"
                    className={`flex-1 py-2 text-xs font-mono uppercase tracking-wider transition-colors ${uploadMethod === 'file' ? 'bg-cyan-500/20 text-cyan-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                    onClick={() => setUploadMethod('file')}
                  >
                    Subir APK
                  </button>
                  <button
                    type="button"
                    className={`flex-1 py-2 text-xs font-mono uppercase tracking-wider transition-colors ${uploadMethod === 'link' ? 'bg-cyan-500/20 text-cyan-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                    onClick={() => setUploadMethod('link')}
                  >
                    Pegar Enlace
                  </button>
                </div>

                {uploadMethod === 'file' ? (
                  <div className="space-y-2">
                    <label className="flex flex-col items-center justify-center border border-dashed border-zinc-700 hover:border-cyan-400 bg-black/50 py-6 cursor-pointer transition-colors text-center group relative overflow-hidden">
                      {isUploading && (
                        <div className="absolute inset-0 bg-cyan-900/20" style={{ width: `${uploadProgress}%` }} />
                      )}
                      
                      {isUploading ? (
                        <>
                          <Loader2 className="w-6 h-6 text-cyan-400 mb-2 animate-spin relative z-10" />
                          <span className="font-mono text-xs text-cyan-400 relative z-10">Subiendo... {Math.round(uploadProgress)}%</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="w-6 h-6 text-zinc-500 group-hover:text-cyan-400 mb-2 transition-colors relative z-10" />
                          <span className="font-mono text-xs text-zinc-400 group-hover:text-cyan-400 relative z-10">
                            {selectedFile ? selectedFile.name : 'Seleccionar archivo .APK'}
                          </span>
                        </>
                      )}
                      
                      <input 
                        type="file" 
                        accept=".apk, .zip, .rar" 
                        className="hidden" 
                        disabled={isUploading}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setSelectedFile(file);
                        }} 
                      />
                    </label>
                  </div>
                ) : (
                  <input
                    type="url"
                    required
                    placeholder="Ej: https://mediafire.com/..."
                    className="w-full bg-black border border-zinc-800 px-4 py-3 text-zinc-100 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-mono text-sm"
                    value={modFormData.downloadLink}
                    onChange={e => setModFormData({...modFormData, downloadLink: e.target.value})}
                  />
                )}
              </div>

              <div className="pt-4 border-t border-zinc-800 flex gap-4">
                <button 
                  type="button" 
                  disabled={isUploading}
                  onClick={() => setStep('AUTHOR_SELECT')}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-300 py-3 font-mono text-sm uppercase tracking-wider transition-colors"
                >
                  Atrás
                </button>
                <button 
                  type="submit" 
                  disabled={isUploading || (uploadMethod === 'file' && !selectedFile) || (uploadMethod === 'link' && !modFormData.downloadLink)}
                  className="flex-[2] bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:bg-zinc-700 disabled:text-zinc-500 text-black py-3 font-mono text-sm uppercase font-bold tracking-wider transition-colors flex justify-center items-center gap-2"
                >
                  {isUploading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Subiendo...</>
                  ) : (
                    <><UploadCloud className="w-4 h-4" /> Publicar APK</>
                  )}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
