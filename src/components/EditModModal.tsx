import React, { useState, useEffect } from 'react';
import { X, Save, UploadCloud, Loader2, Image as ImageIcon, Link as LinkIcon, Cpu, User } from 'lucide-react';
import { ModApk, Author, CATEGORIES } from '../types';
import { storage } from '../firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { compressImage } from '../utils/image';

interface EditModModalProps {
  isOpen: boolean;
  onClose: () => void;
  mod: ModApk | null;
  authors: Author[];
  onSave: (modId: string, updatedData: Partial<ModApk>) => Promise<boolean | void>;
}

export function EditModModal({ isOpen, onClose, mod, authors, onSave }: EditModModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    version: '',
    project: '',
    description: '',
    category: '',
    author: '',
    size: '',
    downloadLink: '',
    imageUrl: '',
    screenshotsText: ''
  });

  const [uploadMethod, setUploadMethod] = useState<'keep_or_link' | 'new_file'>('keep_or_link');
  const [newFile, setNewFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (mod) {
      setFormData({
        name: mod.name || '',
        version: mod.version || '',
        project: mod.project || '',
        description: mod.description || '',
        category: mod.category || CATEGORIES[0],
        author: mod.author || '',
        size: mod.size || '',
        downloadLink: mod.downloadLink || '',
        imageUrl: mod.imageUrl || '',
        screenshotsText: mod.screenshots ? mod.screenshots.join('\n') : ''
      });
      setUploadMethod('keep_or_link');
      setNewFile(null);
      setUploadProgress(0);
    }
  }, [mod]);

  if (!isOpen || !mod) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (uploadMethod === 'new_file' && newFile) {
        // Upload new APK file to Firebase Storage
        const fileRef = ref(storage, `mods/${Date.now()}_${newFile.name}`);
        const uploadTask = uploadBytesResumable(fileRef, newFile);

        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(progress);
          },
          (error) => {
            console.error("Upload error:", error);
            setIsSaving(false);
            alert("Error al subir el nuevo archivo APK.");
          },
          async () => {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            const fileSize = (newFile.size / (1024 * 1024)).toFixed(1) + ' MB';
            const parsedScreenshots = formData.screenshotsText
              .split(/[\n,]/)
              .map(s => s.trim())
              .filter(s => s.length > 0 && s.startsWith('http'));

            await onSave(mod.id, {
              ...formData,
              screenshots: parsedScreenshots,
              downloadLink: downloadUrl,
              size: fileSize
            });

            setIsSaving(false);
            onClose();
          }
        );
      } else {
        // Direct update with existing/updated link
        const parsedScreenshots = formData.screenshotsText
          .split(/[\n,]/)
          .map(s => s.trim())
          .filter(s => s.length > 0 && s.startsWith('http'));

        await onSave(mod.id, {
          ...formData,
          screenshots: parsedScreenshots
        });
        setIsSaving(false);
        onClose();
      }
    } catch (error) {
      console.error("Error saving mod:", error);
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-none w-full max-w-lg shadow-[0_0_50px_rgba(34,211,238,0.15)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-zinc-800 bg-zinc-950">
          <h2 className="text-base sm:text-lg font-bold text-zinc-100 flex items-center gap-2 font-mono uppercase tracking-wider">
            <span className="text-cyan-400">/</span> Editar Mod
          </h2>
          <button 
            onClick={onClose} 
            disabled={isSaving}
            className="text-zinc-500 hover:text-cyan-400 transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 custom-scrollbar">
          {/* Mod Name & Version */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-mono text-cyan-400 uppercase tracking-widest">Nombre del Mod</label>
              <input 
                required
                type="text" 
                className="w-full bg-black border border-zinc-800 px-3 py-2 text-zinc-100 focus:outline-none focus:border-cyan-400 font-mono text-sm"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-mono text-cyan-400 uppercase tracking-widest">Versión</label>
              <input 
                required
                type="text" 
                placeholder="v1.2"
                className="w-full bg-black border border-zinc-800 px-3 py-2 text-zinc-100 focus:outline-none focus:border-cyan-400 font-mono text-sm"
                value={formData.version}
                onChange={e => setFormData({...formData, version: e.target.value})}
              />
            </div>
          </div>

          {/* Category and Author */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-mono text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                <Cpu className="w-3 h-3 text-cyan-400" /> Categoría
              </label>
              <select 
                className="w-full bg-black border border-zinc-800 px-3 py-2 text-zinc-100 focus:outline-none focus:border-cyan-400 font-mono text-sm"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                <User className="w-3 h-3 text-cyan-400" /> Creador / Autor
              </label>
              <input 
                required
                type="text"
                list="authors-list"
                placeholder="Nombre del Creador"
                className="w-full bg-black border border-zinc-800 px-3 py-2 text-zinc-100 focus:outline-none focus:border-cyan-400 font-mono text-sm"
                value={formData.author}
                onChange={e => setFormData({...formData, author: e.target.value})}
              />
              <datalist id="authors-list">
                {authors.map(a => (
                  <option key={a.id} value={a.name}>
                    {a.name} ({a.category})
                  </option>
                ))}
              </datalist>
            </div>
          </div>

          {/* Project & Size */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-mono text-zinc-400 uppercase tracking-widest">Proyecto</label>
              <input 
                type="text" 
                placeholder="Ej. Free Fire, Standalone"
                className="w-full bg-black border border-zinc-800 px-3 py-2 text-zinc-100 focus:outline-none focus:border-cyan-400 font-mono text-sm"
                value={formData.project}
                onChange={e => setFormData({...formData, project: e.target.value})}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono text-zinc-400 uppercase tracking-widest">Tamaño (MB)</label>
              <input 
                type="text" 
                placeholder="Ej. 18.5 MB"
                className="w-full bg-black border border-zinc-800 px-3 py-2 text-zinc-100 focus:outline-none focus:border-cyan-400 font-mono text-sm"
                value={formData.size}
                onChange={e => setFormData({...formData, size: e.target.value})}
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-mono text-zinc-400 uppercase tracking-widest">Descripción</label>
            <textarea 
              rows={3}
              className="w-full bg-black border border-zinc-800 px-3 py-2 text-zinc-100 focus:outline-none focus:border-cyan-400 font-mono text-sm resize-none"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          {/* Mod Image / Logo */}
          <div className="space-y-1">
            <label className="text-xs font-mono text-zinc-400 uppercase tracking-widest flex items-center gap-1">
              <ImageIcon className="w-3 h-3 text-cyan-400" /> Logo / Portada del Mod
            </label>
            <div className="flex items-center gap-3">
              {formData.imageUrl ? (
                <div className="w-12 h-12 border border-zinc-700 bg-black overflow-hidden shrink-0 relative group">
                  <img src={formData.imageUrl} alt="Mod" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-12 h-12 border border-zinc-800 bg-black flex items-center justify-center text-zinc-600 shrink-0">
                  <ImageIcon className="w-5 h-5" />
                </div>
              )}

              <label className="flex-1 border border-dashed border-zinc-700 hover:border-cyan-400 bg-black px-4 py-2.5 cursor-pointer transition-colors text-center font-mono text-xs text-zinc-400 hover:text-cyan-400">
                <span>{formData.imageUrl ? 'Cambiar Imagen' : 'Subir Imagen'}</span>
                <input 
                  type="file" 
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      compressImage(file, (base64) => {
                        setFormData({...formData, imageUrl: base64});
                      });
                    }
                  }}
                />
              </label>

              {formData.imageUrl && (
                <button
                  type="button"
                  onClick={() => setFormData({...formData, imageUrl: ''})}
                  className="px-3 py-2 text-xs font-mono text-red-400 border border-zinc-800 hover:border-red-500 hover:bg-red-500/10 transition-colors"
                >
                  Quitar
                </button>
              )}
            </div>
          </div>

          {/* Screenshots Gallery URLs */}
          <div className="space-y-2">
            <label className="text-xs font-mono text-zinc-400 uppercase tracking-widest flex items-center justify-between">
              <span className="flex items-center gap-1">
                <ImageIcon className="w-3 h-3 text-cyan-400" /> Galería de Capturas de Pantalla (URLs)
              </span>
              <span className="text-[10px] text-zinc-500">Una URL por línea</span>
            </label>
            <textarea
              rows={3}
              placeholder="https://ejemplo.com/captura1.png&#10;https://ejemplo.com/captura2.png"
              className="w-full bg-black border border-zinc-800 px-3 py-2 text-zinc-100 focus:outline-none focus:border-cyan-400 font-mono text-xs placeholder:text-zinc-600 resize-none"
              value={formData.screenshotsText}
              onChange={e => setFormData({...formData, screenshotsText: e.target.value})}
            />
          </div>

          {/* Download Method / Link */}
          <div className="space-y-2 pt-2 border-t border-zinc-800/80">
            <label className="text-xs font-mono text-zinc-400 uppercase tracking-widest flex items-center gap-1">
              <LinkIcon className="w-3 h-3 text-cyan-400" /> Enlace o Archivo de Descarga
            </label>

            <div className="flex bg-black border border-zinc-800 p-1">
              <button
                type="button"
                className={`flex-1 py-1.5 text-xs font-mono uppercase transition-colors ${uploadMethod === 'keep_or_link' ? 'bg-cyan-500/20 text-cyan-400 font-bold' : 'text-zinc-500 hover:text-zinc-300'}`}
                onClick={() => setUploadMethod('keep_or_link')}
              >
                Enlace Directo
              </button>
              <button
                type="button"
                className={`flex-1 py-1.5 text-xs font-mono uppercase transition-colors ${uploadMethod === 'new_file' ? 'bg-cyan-500/20 text-cyan-400 font-bold' : 'text-zinc-500 hover:text-zinc-300'}`}
                onClick={() => setUploadMethod('new_file')}
              >
                Subir Nuevo Archivo
              </button>
            </div>

            {uploadMethod === 'keep_or_link' ? (
              <input
                type="url"
                required
                placeholder="https://mediafire.com/..."
                className="w-full bg-black border border-zinc-800 px-3 py-2 text-zinc-100 focus:outline-none focus:border-cyan-400 font-mono text-sm"
                value={formData.downloadLink}
                onChange={e => setFormData({...formData, downloadLink: e.target.value})}
              />
            ) : (
              <label className="flex flex-col items-center justify-center border border-dashed border-zinc-700 hover:border-cyan-400 bg-black/50 py-5 cursor-pointer transition-colors text-center group relative overflow-hidden">
                {isSaving && (
                  <div className="absolute inset-0 bg-cyan-900/20" style={{ width: `${uploadProgress}%` }} />
                )}

                {isSaving ? (
                  <>
                    <Loader2 className="w-5 h-5 text-cyan-400 mb-1 animate-spin relative z-10" />
                    <span className="font-mono text-xs text-cyan-400 relative z-10">
                      Subiendo archivo... {Math.round(uploadProgress)}%
                    </span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-5 h-5 text-zinc-500 group-hover:text-cyan-400 mb-1 transition-colors relative z-10" />
                    <span className="font-mono text-xs text-zinc-400 group-hover:text-cyan-400 relative z-10">
                      {newFile ? newFile.name : 'Seleccionar nuevo archivo APK'}
                    </span>
                  </>
                )}

                <input 
                  type="file" 
                  accept=".apk, .zip, .rar" 
                  className="hidden" 
                  disabled={isSaving}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setNewFile(file);
                  }} 
                />
              </label>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-zinc-800 flex gap-3">
            <button 
              type="button" 
              disabled={isSaving}
              onClick={onClose}
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-300 py-2.5 font-mono text-sm uppercase tracking-wider transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={isSaving || (uploadMethod === 'new_file' && !newFile && !formData.downloadLink)}
              className="flex-[2] bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black py-2.5 font-mono text-sm uppercase font-bold tracking-wider transition-colors flex justify-center items-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Guardar Cambios
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
