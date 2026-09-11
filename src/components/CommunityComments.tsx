import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Tag, Trash2, User, Loader2, Clock, CheckCircle2, ShieldCheck, Sparkles, Filter } from 'lucide-react';
import { Comment, ModApk } from '../types';

interface CommunityCommentsProps {
  comments: Comment[];
  mods: ModApk[];
  currentUser: { displayName?: string | null; photoURL?: string | null; uid?: string } | null;
  isAdmin: boolean;
  onAddComment: (data: {
    authorName: string;
    content: string;
    taggedModId?: string;
    taggedModName?: string;
    userAvatar?: string;
  }) => Promise<boolean>;
  onDeleteComment: (commentId: string) => Promise<boolean | void>;
  onSelectMod?: (modName: string, category: string) => void;
}

export const CommunityComments: React.FC<CommunityCommentsProps> = ({
  comments,
  mods,
  currentUser,
  isAdmin,
  onAddComment,
  onDeleteComment,
  onSelectMod
}) => {
  const [nickname, setNickname] = useState('');
  const [content, setContent] = useState('');
  const [taggedModId, setTaggedModId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterModId, setFilterModId] = useState('ALL');
  const [justSubmitted, setJustSubmitted] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Initialize nickname from localStorage or user displayName
  useEffect(() => {
    const savedName = localStorage.getItem('mobilador_comment_nickname');
    if (savedName) {
      setNickname(savedName);
    } else if (currentUser?.displayName) {
      setNickname(currentUser.displayName);
    }
  }, [currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim() || !content.trim()) return;

    setIsSubmitting(true);

    const selectedMod = mods.find(m => m.id === taggedModId);

    // Save nickname in localStorage for convenience
    localStorage.setItem('mobilador_comment_nickname', nickname.trim());

    const success = await onAddComment({
      authorName: nickname.trim(),
      content: content.trim(),
      taggedModId: selectedMod ? selectedMod.id : undefined,
      taggedModName: selectedMod ? `${selectedMod.name} (v${selectedMod.version})` : undefined,
      userAvatar: currentUser?.photoURL || undefined
    });

    setIsSubmitting(false);

    if (success) {
      setContent('');
      setTaggedModId('');
      setJustSubmitted(true);
      setTimeout(() => setJustSubmitted(false), 3000);
    }
  };

  const timeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = Math.floor((now - timestamp) / 1000); // in seconds
    if (diff < 60) return 'Hace un momento';
    if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`;
    const days = Math.floor(diff / 86400);
    if (days === 1) return 'Ayer';
    if (days < 30) return `Hace ${days} días`;
    return new Date(timestamp).toLocaleDateString();
  };

  const filteredComments = filterModId === 'ALL'
    ? comments
    : comments.filter(c => c.taggedModId === filterModId);

  return (
    <section id="comunidad" className="relative z-10 max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-zinc-800/80">
      {/* Title & Hub Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-cyan-400 mb-1">
            <MessageSquare className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>// CHAT & OPINIONES DE LA COMUNIDAD</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-mono tracking-tight uppercase text-zinc-100 flex items-center gap-3">
            Muro de Comentarios
            <span className="text-xs font-mono font-normal px-2.5 py-0.5 border border-cyan-500/30 bg-cyan-500/10 text-cyan-300">
              {comments.length} {comments.length === 1 ? 'mensaje' : 'mensajes'}
            </span>
          </h2>
          <p className="text-zinc-400 text-sm mt-1 max-w-2xl font-light">
            Comparte tus recomendaciones, preguntas de configuración, o etiqueta un APK específico para dejar tu reporte o reseña para todos los usuarios.
          </p>
        </div>

        {/* Filter Dropdown */}
        {mods.length > 0 && comments.some(c => c.taggedModId) && (
          <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 px-3 py-1.5 self-start md:self-auto">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs font-mono text-zinc-400">Filtrar:</span>
            <select
              value={filterModId}
              onChange={(e) => setFilterModId(e.target.value)}
              className="bg-transparent text-xs font-mono text-zinc-200 focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-zinc-900">Todos los comentarios</option>
              {mods.map(m => (
                <option key={m.id} value={m.id} className="bg-zinc-900">
                  Solo {m.name} (v{m.version})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: Input Form */}
        <div className="lg:col-span-5">
          <div className="bg-zinc-900/90 border border-zinc-800 p-5 sm:p-6 backdrop-blur-md relative overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
              <h3 className="text-sm font-bold font-mono tracking-wider uppercase text-cyan-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                Deja tu Mensaje
              </h3>
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                Público para todos
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* User Name */}
              <div>
                <label className="block text-xs font-mono text-zinc-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-cyan-400" />
                  Tu Nombre o Apodo (User) <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={40}
                  placeholder="Ej. MobiladorMaster, PandaSniper..."
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full bg-black border border-zinc-800 focus:border-cyan-400 px-3 py-2 text-zinc-100 text-sm font-mono focus:outline-none transition-colors"
                />
              </div>

              {/* Tag an APK (Optional) */}
              <div>
                <label className="block text-xs font-mono text-zinc-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-cyan-400" />
                  Etiquetar un Mod / APK <span className="text-zinc-500 font-normal">(Opcional)</span>
                </label>
                <select
                  value={taggedModId}
                  onChange={(e) => setTaggedModId(e.target.value)}
                  className="w-full bg-black border border-zinc-800 focus:border-cyan-400 px-3 py-2 text-zinc-100 text-xs font-mono focus:outline-none transition-colors"
                >
                  <option value="">-- Comentario general (Sin etiquetar) --</option>
                  {mods.map(mod => (
                    <option key={mod.id} value={mod.id}>
                      [{mod.category}] {mod.name} v{mod.version} — {mod.author}
                    </option>
                  ))}
                </select>
                {taggedModId && (
                  <p className="text-[11px] font-mono text-cyan-400 mt-1 flex items-center gap-1">
                    ✓ Tu comentario se publicará vinculando esta versión.
                  </p>
                )}
              </div>

              {/* Message Content */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-mono text-zinc-300 uppercase tracking-wider">
                    Comentario <span className="text-red-400">*</span>
                  </label>
                  <span className="text-[10px] font-mono text-zinc-500">
                    {content.length}/500
                  </span>
                </div>
                <textarea
                  required
                  rows={4}
                  maxLength={500}
                  placeholder="Escribe tu mensaje, opinión sobre el mod, configuración de sensibilidad recomendada..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-black border border-zinc-800 focus:border-cyan-400 p-3 text-zinc-100 text-sm font-mono focus:outline-none transition-colors resize-none"
                />
              </div>

              {justSubmitted && (
                <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  ¡Comentario publicado en el muro!
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !content.trim() || !nickname.trim()}
                className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-mono font-bold tracking-wider uppercase py-2.5 px-4 transition-all flex items-center justify-center gap-2 text-sm shadow-[0_0_15px_rgba(34,211,238,0.2)]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Publicando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Publicar Comentario
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: Comments Feed */}
        <div className="lg:col-span-7">
          <div className="space-y-3">
            {filteredComments.length > 0 ? (
              filteredComments.map((comment) => (
                <div
                  key={comment.id}
                  className="bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 p-4 sm:p-5 transition-all group relative backdrop-blur-sm"
                >
                  {/* Top Bar: User & Time */}
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="w-9 h-9 rounded-full bg-zinc-950 border border-cyan-500/40 overflow-hidden flex items-center justify-center shrink-0 text-cyan-400 font-bold font-mono text-sm">
                        {comment.userAvatar ? (
                          <img src={comment.userAvatar} alt={comment.authorName} className="w-full h-full object-cover" />
                        ) : (
                          <span>{comment.authorName.charAt(0).toUpperCase()}</span>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold text-zinc-200 group-hover:text-cyan-400 transition-colors">
                            {comment.authorName}
                          </span>
                          {comment.authorName.toLowerCase().includes('admin') && (
                            <span className="text-[9px] font-mono px-1.5 py-0.2 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center gap-1">
                              <ShieldCheck className="w-2.5 h-2.5" /> MOD
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-zinc-500 text-[11px] font-mono">
                          <Clock className="w-3 h-3 text-zinc-600" />
                          <span>{timeAgo(comment.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Admin Delete Action */}
                    {isAdmin && (
                      <div className="flex items-center gap-1">
                        {deleteConfirmId === comment.id ? (
                          <div className="flex items-center gap-1 bg-red-950/80 border border-red-500/50 px-2 py-1 text-[11px] font-mono">
                            <span className="text-red-300">¿Borrar?</span>
                            <button
                              onClick={() => {
                                onDeleteComment(comment.id);
                                setDeleteConfirmId(null);
                              }}
                              className="text-red-400 hover:text-red-200 font-bold px-1 underline"
                            >
                              Sí
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="text-zinc-400 hover:text-zinc-200 px-1"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirmId(comment.id)}
                            className="p-1.5 text-zinc-600 hover:text-red-400 border border-transparent hover:border-red-500/40 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                            title="Eliminar comentario como Administrador"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Tagged APK Badge (if present) */}
                  {comment.taggedModName && (
                    <div className="mb-2.5">
                      <div
                        onClick={() => {
                          if (onSelectMod) {
                            const found = mods.find(m => m.id === comment.taggedModId);
                            if (found) onSelectMod(found.name, found.category);
                          }
                        }}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 text-xs font-mono cursor-pointer hover:bg-cyan-500/20 transition-colors"
                        title="Ver este mod"
                      >
                        <Tag className="w-3 h-3 text-cyan-400" />
                        <span className="font-semibold">{comment.taggedModName}</span>
                      </div>
                    </div>
                  )}

                  {/* Comment Text */}
                  <p className="text-zinc-300 text-sm font-sans leading-relaxed break-words whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>
              ))
            ) : (
              <div className="border border-dashed border-zinc-800 bg-zinc-950/40 p-10 text-center">
                <MessageSquare className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
                <h4 className="text-zinc-300 font-mono text-sm uppercase tracking-wider mb-1">
                  Aún no hay comentarios publicados
                </h4>
                <p className="text-zinc-500 text-xs font-mono max-w-sm mx-auto">
                  Sé la primera persona en dejar un mensaje, compartir tu experiencia o etiquetar un mod.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
