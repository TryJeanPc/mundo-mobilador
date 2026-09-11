import { useState, useEffect } from 'react';
import { auth, db, googleProvider } from './firebase';
import { signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, collection, onSnapshot, query, orderBy, setDoc, deleteDoc, updateDoc, increment } from 'firebase/firestore';
import { ModApk, Author, Comment } from './types';

const LOCAL_COMMENTS_KEY = 'mundo_mobilador_community_comments_v2';

const getInitialComments = (): Comment[] => {
  try {
    const raw = localStorage.getItem(LOCAL_COMMENTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn("Could not read local comments cache", e);
  }
  return [
    {
      id: 'welcome_com_1',
      authorName: 'Mundo Mobilador Admin',
      content: '¡Bienvenidos a la zona de comentarios y opiniones! Aquí pueden compartir sus dudas sobre mapeo en Android, sugerir nuevas versiones y reportar cómo les corre cada APK en sus periféricos.',
      createdAt: Date.now() - 3600000 * 3,
      taggedModName: 'Panda Mouse Pro & Smart GaGa',
      userAvatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80'
    }
  ];
};

const saveCommentsToStorage = (commentsList: Comment[]) => {
  try {
    localStorage.setItem(LOCAL_COMMENTS_KEY, JSON.stringify(commentsList));
  } catch (e) {
    console.warn("Could not save comments locally", e);
  }
};

export function useFirebase() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Data states
  const [mods, setMods] = useState<ModApk[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [comments, setComments] = useState<Comment[]>(getInitialComments);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const roleDoc = await getDoc(doc(db, 'userRoles', currentUser.uid));
          if (roleDoc.exists() && roleDoc.data().isAdmin === true) {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        } catch (error) {
          console.error("Error checking admin status", error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Listen to mods
  useEffect(() => {
    const q = query(collection(db, 'mods'), orderBy('uploadDate', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedMods: ModApk[] = [];
      snapshot.forEach((doc) => {
        loadedMods.push({ id: doc.id, ...doc.data() } as ModApk);
      });
      setMods(loadedMods);
    }, (error) => {
      console.error("Error loading mods", error);
    });

    return () => unsubscribe();
  }, []);

  // Listen to authors (Using authors collection for dynamic creators)
  useEffect(() => {
    const q = query(collection(db, 'authors'), orderBy('name', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedAuthors: Author[] = [];
      snapshot.forEach((doc) => {
        loadedAuthors.push({ id: doc.id, ...doc.data() } as Author);
      });
      setAuthors(loadedAuthors);
    }, (error) => {
      console.error("Error loading authors", error);
    });

    return () => unsubscribe();
  }, []);

  // Listen to community comments (merged with resilient cache)
  useEffect(() => {
    try {
      const q = collection(db, 'comments');
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const remoteComments: Comment[] = [];
        snapshot.forEach((doc) => {
          remoteComments.push({ id: doc.id, ...doc.data() } as Comment);
        });
        if (remoteComments.length > 0) {
          setComments(prev => {
            const map = new Map<string, Comment>();
            prev.forEach(c => map.set(c.id, c));
            remoteComments.forEach(c => map.set(c.id, c));
            const merged = Array.from(map.values()).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
            saveCommentsToStorage(merged);
            return merged;
          });
        }
      }, (error) => {
        // Fallback gracefully if remote rules are pending approval
        console.warn("Firestore comments remote sync note:", error);
      });

      return () => unsubscribe();
    } catch (err) {
      console.warn("Error setting up comments listener:", err);
    }
  }, []);

  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Error signing in", error);
    }
  };

  const logout = () => {
    signOut(auth);
  };

  const addMod = async (mod: Omit<ModApk, 'id'>) => {
    if (!isAdmin || !user) return;
    try {
      const modRef = doc(collection(db, 'mods'));
      const cleanMod = Object.fromEntries(Object.entries(mod).filter(([_, v]) => v !== undefined));
      await setDoc(modRef, {
        ...cleanMod,
        createdBy: user.uid
      });
      alert("¡Mod guardado con éxito en la base de datos!");
    } catch (error: any) {
      console.error("Error adding mod", error);
      alert("Error de permisos de Firebase al subir el Mod. Revisa las reglas de seguridad.\nDetalle: " + error.message);
    }
  };

  const updateMod = async (modId: string, updatedMod: Partial<ModApk>) => {
    if (!isAdmin) return;
    try {
      const { id, ...dataToUpdate } = updatedMod as any;
      const cleanData = Object.fromEntries(
        Object.entries(dataToUpdate).filter(([k, v]) => v !== undefined && k !== 'createdBy' && k !== 'createdAt')
      );
      await updateDoc(doc(db, 'mods', modId), cleanData);
      alert("¡Mod actualizado con éxito en la base de datos!");
      return true;
    } catch (error: any) {
      console.error("Error updating mod", error);
      alert("Error al actualizar Mod: " + error.message);
      return false;
    }
  };

  const deleteMod = async (modId: string) => {
    if (!isAdmin) return;
    try {
      await deleteDoc(doc(db, 'mods', modId));
    } catch (error: any) {
      console.error("Error deleting mod", error);
      alert("Error al eliminar Mod: " + error.message);
    }
  };

  const incrementDownload = async (modId: string) => {
    try {
      await updateDoc(doc(db, 'mods', modId), {
        downloads: increment(1)
      });
    } catch (error) {
      console.error("Error updating download count", error);
    }
  };

  const addAuthor = async (author: Omit<Author, 'id'>) => {
    if (!isAdmin) return;
    try {
      const authorRef = doc(collection(db, 'authors'));
      const cleanAuthor = Object.fromEntries(Object.entries(author).filter(([_, v]) => v !== undefined));
      await setDoc(authorRef, cleanAuthor);
      alert("¡Creador guardado con éxito en la base de datos!");
    } catch (error: any) {
      console.error("Error adding author", error);
      alert("Error de permisos de Firebase al crear el Creador. Revisa las reglas de seguridad.\nDetalle: " + error.message);
    }
  };

  const updateAuthor = async (authorId: string, updatedAuthor: Partial<Author>, oldName?: string) => {
    if (!isAdmin) return;
    try {
      const { id, ...dataToUpdate } = updatedAuthor as any;
      const cleanData = Object.fromEntries(
        Object.entries(dataToUpdate).filter(([_, v]) => v !== undefined)
      );
      await updateDoc(doc(db, 'authors', authorId), cleanData);

      // If author name changed, update the author name in associated mods as well
      if (oldName && updatedAuthor.name && oldName !== updatedAuthor.name) {
        const associatedMods = mods.filter(m => m.author === oldName);
        for (const m of associatedMods) {
          try {
            await updateDoc(doc(db, 'mods', m.id), { author: updatedAuthor.name });
          } catch (err) {
            console.warn("Could not cascade author rename to mod", m.id, err);
          }
        }
      }

      alert("¡Creador actualizado con éxito en la base de datos!");
      return true;
    } catch (error: any) {
      console.error("Error updating author", error);
      alert("Error al actualizar Creador: " + error.message);
      return false;
    }
  };

  const deleteAuthor = async (authorId: string) => {
    if (!isAdmin) return;
    try {
      await deleteDoc(doc(db, 'authors', authorId));
      // Optionally cascade delete their mods
    } catch (error) {
      console.error("Error deleting author", error);
    }
  };

  const addComment = async (commentData: {
    authorName: string;
    content: string;
    taggedModId?: string;
    taggedModName?: string;
    userAvatar?: string;
  }) => {
    const commentId = 'com_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const newComment: Comment = {
      id: commentId,
      authorName: commentData.authorName.trim(),
      content: commentData.content.trim(),
      createdAt: Date.now(),
      taggedModId: commentData.taggedModId || undefined,
      taggedModName: commentData.taggedModName || undefined,
      userId: user?.uid || undefined,
      userAvatar: commentData.userAvatar || user?.photoURL || undefined
    };

    // 1. Instantly display in UI & update local storage
    setComments(prev => {
      const updated = [newComment, ...prev.filter(c => c.id !== commentId)];
      saveCommentsToStorage(updated);
      return updated;
    });

    // 2. Persist to Firestore in the background
    try {
      const cleanDoc: any = {
        authorName: newComment.authorName,
        content: newComment.content,
        createdAt: newComment.createdAt
      };
      if (newComment.taggedModId) cleanDoc.taggedModId = newComment.taggedModId;
      if (newComment.taggedModName) cleanDoc.taggedModName = newComment.taggedModName;
      if (newComment.userId) cleanDoc.userId = newComment.userId;
      if (newComment.userAvatar) cleanDoc.userAvatar = newComment.userAvatar;

      await setDoc(doc(db, 'comments', commentId), cleanDoc);
    } catch (error: any) {
      console.warn("Firestore remote write pending rules confirmation:", error);
    }

    return true;
  };

  const deleteComment = async (commentId: string) => {
    // 1. Immediately remove from local state and storage
    setComments(prev => {
      const updated = prev.filter(c => c.id !== commentId);
      saveCommentsToStorage(updated);
      return updated;
    });

    // 2. Remove from Firestore
    try {
      await deleteDoc(doc(db, 'comments', commentId));
    } catch (error) {
      console.warn("Error deleting comment from firestore:", error);
    }
    return true;
  };

  const claimAdminRole = async (secretCode: string) => {
    if (!user) return false;
    // Client-side secret code for friends to claim admin
    if (secretCode === "MUNDO_ADMIN_99") {
      try {
        await setDoc(doc(db, 'userRoles', user.uid), { isAdmin: true });
        setIsAdmin(true);
        return true;
      } catch (error) {
        console.error("Error claiming admin", error);
        return false;
      }
    }
    return false;
  };

  return {
    user,
    isAdmin,
    loading,
    mods,
    authors,
    comments,
    login,
    logout,
    addMod,
    updateMod,
    deleteMod,
    incrementDownload,
    addAuthor,
    updateAuthor,
    deleteAuthor,
    addComment,
    deleteComment,
    claimAdminRole
  };
}
