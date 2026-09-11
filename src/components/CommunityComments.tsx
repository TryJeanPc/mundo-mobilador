import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, Send, Tag, Trash2, User, Loader2, Clock, CheckCircle2, 
  ShieldCheck, Sparkles, Filter, Pin, Reply, CornerDownRight, Smile
} from 'lucide-react';
import { Comment, ModApk, CommentReply } from '../types';

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
  onTogglePinComment?: (commentId: string) => Promise<boolean | void>;
  onReactComment?: (commentId: string, emoji: string) => Promise<void> | void;
  onAddReply?: (commentId: string, data: { authorName: string; content: string; userAvatar?: string }) => Promise<boolean | void>;
  onDeleteReply?: (commentId: string, replyId: string) => Promise<boolean | void>;
  onSelectMod?: (modName: string, category: string) => void;
}

const AVAILABLE_REACTIONS = [
  { emoji: '👍', label: 'Útil' },
  { emoji: '🔥', label: 'Fuego' },
  { emoji: '🎮', label: 'Gamer' },
  { emoji: '❤️', label: 'Top' }
];

export const CommunityComments: React.FC<CommunityCommentsProps> = ({
  comments,
  mods,
  currentUser,
  isAdmin,
  onAddComment,
  onDeleteComment,
  onTogglePinComment,
  onReactComment,
  onAddReply,
  onDeleteReply,
  onSelectMod
}) => {
  const [nickname, setNickname] = useState('');
  const [content, setContent] = useState('');
  const [taggedModId, setTaggedModId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterModId, setFilterModId] = useState('ALL');
  const [justSubmitted, setJustSubmitted] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Reply state
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyAuthor, setReplyAuthor] = useState('');
  const [replyContent, setReplyContent] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // Initialize nickname from localStorage or user displayName
  useEffect(() => {
    const savedName = localStorage.getItem('mobilador_comment_nickname');
    if (savedName) {
      setNickname(savedName);
      setReplyAuthor(savedName);
    } else if (currentUser?.displayName) {
      setNickname(currentUser.displayName);
      setReplyAuthor(currentUser.displayName);
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

  const handleReplySubmit = async (commentId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!replyAuthor.trim() || !replyContent.trim() || !onAddReply) return;

    setIsSubmittingReply(true);
    localStorage.setItem('mobilador_comment_nickname', replyAuthor.trim());

    await onAddReply(commentId, {
      authorName: replyAuthor.trim(),
      content: replyContent.trim(),
      userAvatar: currentUser?.photoURL || undefined
    });

    setIsSubmittingReply(false);
    setReplyContent('');
    setReplyingToId(null);
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
                  className={`border p-4 sm:p-5 transition-all group relative backdrop-blur-sm ${
                    comment.isPinned
                      ? 'border-cyan-500/60 bg-gradient-to-b from-cyan-950/25 via-zinc-900/80 to-zinc-900/70 shadow-[0_0_20px_rgba(34,211,238,0.08)]'
                      : 'bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700'
                  }`}
                >
                  {/* Pinned Notification Header */}
                  {comment.isPinned && (
                    <div className="flex items-center gap-1.5 text-cyan-400 font-mono text-[11px] font-bold uppercase tracking-wider mb-3 pb-2 border-b border-cyan-500/20">
                      <Pin className="w-3.5 h-3.5 fill-cyan-400 rotate-45" />
                      <span>Comentario Fijado por Administración</span>
                    </div>
                  )}

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
                          {(comment.authorName.toLowerCase().includes('admin') || comment.isPinned) && (
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

                    {/* Actions: Pin Toggle & Admin Delete */}
                    <div className="flex items-center gap-1">
                      {isAdmin && onTogglePinComment && (
                        <button
                          onClick={() => onTogglePinComment(comment.id)}
                          className={`p-1.5 transition-all ${
                            comment.isPinned
                              ? 'text-cyan-400 bg-cyan-500/20 border border-cyan-500/40'
                              : 'text-zinc-600 hover:text-cyan-400 border border-transparent hover:border-cyan-500/40 opacity-0 group-hover:opacity-100'
                          }`}
                          title={comment.isPinned ? "Desfijar comentario" : "Fijar comentario al inicio"}
                        >
                          <Pin className={`w-3.5 h-3.5 ${comment.isPinned ? 'fill-cyan-400' : ''}`} />
                        </button>
                      )}

                      {isAdmin && (
                        <div>
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

                  {/* Reactions & Reply Row */}
                  <div className="mt-3.5 pt-3 border-t border-zinc-800/60 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {AVAILABLE_REACTIONS.map(({ emoji, label }) => {
                        const count = comment.reactions?.[emoji] || 0;
                        return (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => onReactComment?.(comment.id, emoji)}
                            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono border transition-all ${
                              count > 0 
                                ? 'bg-zinc-800/90 border-cyan-500/40 text-zinc-200 hover:border-cyan-400 hover:bg-cyan-500/10' 
                                : 'bg-zinc-900/60 border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'
                            }`}
                            title={`Reaccionar con ${label}`}
                          >
                            <span>{emoji}</span>
                            {count > 0 && <span className="font-bold text-[11px] text-cyan-400">{count}</span>}
                          </button>
                        );
                      })}
                    </div>

                    {/* Reply Trigger */}
                    {onAddReply && (
                      <button
                        type="button"
                        onClick={() => setReplyingToId(replyingToId === comment.id ? null : comment.id)}
                        className={`flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 border transition-colors ${
                          replyingToId === comment.id
                            ? 'bg-cyan-500 text-black border-cyan-500 font-bold'
                            : 'bg-zinc-800/60 hover:bg-cyan-500/20 text-zinc-400 hover:text-cyan-300 border-zinc-800 hover:border-cyan-500/40'
                        }`}
                      >
                        <Reply className="w-3.5 h-3.5" />
                        <span>Responder</span>
                        {(comment.replies?.length ?? 0) > 0 && (
                          <span className={`text-[10px] px-1.5 py-0.2 font-bold ${
                            replyingToId === comment.id ? 'bg-black/20 text-black' : 'bg-cyan-500/20 text-cyan-300'
                          }`}>
                            {comment.replies?.length}
                          </span>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Inline Reply Form */}
                  {replyingToId === comment.id && (
                    <form onSubmit={(e) => handleReplySubmit(comment.id, e)} className="mt-3 p-3 bg-zinc-950/80 border border-cyan-500/40 space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono text-cyan-400">
                        <span className="flex items-center gap-1">
                          <CornerDownRight className="w-3.5 h-3.5" />
                          Respondiendo a <strong className="text-zinc-200">@{comment.authorName}</strong>
                        </span>
                        <button 
                          type="button" 
                          onClick={() => setReplyingToId(null)}
                          className="text-zinc-500 hover:text-zinc-300 text-[11px]"
                        >
                          Cancelar
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                          type="text"
                          value={replyAuthor}
                          onChange={(e) => setReplyAuthor(e.target.value)}
                          placeholder="Tu apodo..."
                          maxLength={25}
                          required
                          className="bg-zinc-900 border border-zinc-700 px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-cyan-400 font-mono"
                        />
                        <input
                          type="text"
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          placeholder="Escribe tu respuesta..."
                          maxLength={300}
                          required
                          className="sm:col-span-2 bg-zinc-900 border border-zinc-700 px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-cyan-400 font-mono"
                        />
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={isSubmittingReply || !replyAuthor.trim() || !replyContent.trim()}
                          className="px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
                        >
                          {isSubmittingReply ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                          Enviar Respuesta
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Threaded Replies List */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-zinc-800/40 pl-3 sm:pl-4 border-l-2 border-cyan-500/30 space-y-2">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="bg-zinc-950/40 p-2.5 border border-zinc-800/70 hover:border-zinc-700 transition-colors group/rep">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-zinc-900 border border-cyan-500/30 flex items-center justify-center text-[10px] font-mono font-bold text-cyan-400 shrink-0">
                                {reply.userAvatar ? (
                                  <img src={reply.userAvatar} alt="" className="w-full h-full object-cover rounded-full" />
                                ) : (
                                  reply.authorName.charAt(0).toUpperCase()
                                )}
                              </div>
                              <span className="font-mono text-xs font-bold text-zinc-300">
                                {reply.authorName}
                              </span>
                              {reply.isAdmin && (
                                <span className="text-[8px] font-mono px-1 py-0.1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-0.5">
                                  <ShieldCheck className="w-2.5 h-2.5" /> MOD
                                </span>
                              )}
                              <span className="text-[10px] font-mono text-zinc-500">
                                {timeAgo(reply.createdAt)}
                              </span>
                            </div>

                            {isAdmin && onDeleteReply && (
                              <button
                                onClick={() => onDeleteReply(comment.id, reply.id)}
                                className="text-zinc-600 hover:text-red-400 p-1 opacity-0 group/rep:opacity-100 transition-opacity"
                                title="Eliminar respuesta"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                          <p className="text-zinc-300 text-xs font-sans leading-relaxed whitespace-pre-wrap pl-8">
                            {reply.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
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
