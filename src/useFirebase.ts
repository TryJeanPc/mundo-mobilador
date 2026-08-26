import { useState, useEffect } from 'react';
import { auth, db, googleProvider } from './firebase';
import { signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, collection, onSnapshot, query, orderBy, setDoc, deleteDoc, updateDoc, increment } from 'firebase/firestore';
import { ModApk, Author } from './types';

export function useFirebase() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Data states
  const [mods, setMods] = useState<ModApk[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);

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

  const deleteAuthor = async (authorId: string) => {
    if (!isAdmin) return;
    try {
      await deleteDoc(doc(db, 'authors', authorId));
      // Optionally cascade delete their mods
    } catch (error) {
      console.error("Error deleting author", error);
    }
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
    login,
    logout,
    addMod,
    deleteMod,
    incrementDownload,
    addAuthor,
    deleteAuthor,
    claimAdminRole
  };
}
