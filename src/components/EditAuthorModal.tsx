import React, { useState, useEffect } from 'react';
import { X, Save, User, Loader2, Image as ImageIcon, Cpu } from 'lucide-react';
import { Author, CATEGORIES } from '../types';
import { compressImage } from '../utils/image';

interface EditAuthorModalProps {
  isOpen: boolean;
  onClose: () => void;
  author: Author | null;
  onSave: (authorId: string, updatedData: Partial<Author>, oldName?: string) => Promise<boolean | void>;
}

export function EditAuthorModal({ isOpen, onClose, author, onSave }: EditAuthorModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    category: CATEGORIES[0] as string,
    imageUrl: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (author) {
      setFormData({
        name: author.name || '',
        category: author.category || CATEGORIES[0],
        imageUrl: author.imageUrl || ''
      });
    }
  }, [author]);

  if (!isOpen || !author) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsSaving(true);
    try {
      await onSave(author.id, formData, author.name);
      setIsSaving(false);
      onClose();
    } catch (error) {
      console.error("Error updating author:", error);
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-none w-full max-w-md shadow-[0_0_50px_rgba(34,211,238,0.15)] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-zinc-800 bg-zinc-950">
          <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2 font-mono uppercase tracking-wider">
            <span className="text-cyan-400">/</span> Editar Creador
          </h2>
          <button 
            onClick={onClose} 
            disabled={isSaving}
            className="text-zinc-500 hover:text-cyan-400 transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-mono text-cyan-400 uppercase tracking-widest flex items-center gap-1">
              <User className="w-3 h-3" /> Nombre del Creador
            </label>
            <input 
              required
              type="text" 
              className="w-full bg-black border border-zinc-800 px-3 py-2 text-zinc-100 focus:outline-none focus:border-cyan-400 font-mono text-sm"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono text-cyan-400 uppercase tracking-widest flex items-center gap-1">
              <Cpu className="w-3 h-3" /> Categoría Principal
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
              <ImageIcon className="w-3 h-3 text-cyan-400" /> Foto o Avatar
            </label>
            <div className="flex items-center gap-3">
              {formData.imageUrl ? (
                <div className="w-12 h-12 rounded-full border border-zinc-700 bg-black overflow-hidden shrink-0">
                  <img src={formData.imageUrl} alt="Avatar" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full border border-zinc-800 bg-black flex items-center justify-center text-zinc-600 shrink-0">
                  <User className="w-5 h-5" />
                </div>
              )}

              <label className="flex-1 border border-dashed border-zinc-700 hover:border-cyan-400 bg-black px-4 py-2.5 cursor-pointer transition-colors text-center font-mono text-xs text-zinc-400 hover:text-cyan-400">
                <span>{formData.imageUrl ? 'Cambiar Foto' : 'Subir Foto'}</span>
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
              disabled={isSaving}
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
