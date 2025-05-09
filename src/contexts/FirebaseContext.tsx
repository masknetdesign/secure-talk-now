
import React, { createContext, useContext, ReactNode } from 'react';
import { 
  Auth,
  User,
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { 
  Firestore, 
  collection, 
  query, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  doc,
  setDoc,
  serverTimestamp,
  orderBy,
  getDoc
} from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { auth, db } from '../lib/firebase';
import { useState, useEffect } from 'react';

interface FirebaseContextProps {
  auth: Auth;
  db: Firestore;
  currentUser: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  createGroup: (groupName: string, members: string[]) => Promise<string>;
  addContact: (name: string, email: string, role?: string) => Promise<string>;
  getContacts: () => Promise<any[]>;
  getGroups: () => Promise<any[]>;
  getMessages: (chatId: string) => Promise<any[]>;
  sendMessage: (chatId: string, content: string) => Promise<void>;
  sendAudioMessage: (chatId: string, audioUrl: string, duration: string) => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextProps | undefined>(undefined);

export const FirebaseProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Store user info in localStorage as your app currently expects
      const userData = {
        name: email.split('@')[0],
        email,
        token: await userCredential.user.getIdToken(),
        role: 'user' // Default role, you might want to get this from Firestore
      };
      
      localStorage.setItem('comtalk-user', JSON.stringify(userData));
      
      toast({
        title: "Login bem-sucedido",
        description: "Bem-vindo ao ComTalk!"
      });
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Erro de autenticação",
        description: error.message || "Verifique seu e-mail e senha.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      localStorage.removeItem('comtalk-user');
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso."
      });
    } catch (error: any) {
      console.error("Logout error:", error);
      toast({
        title: "Erro ao desconectar",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };
  
  const createGroup = async (groupName: string, members: string[]) => {
    try {
      if (!currentUser) throw new Error("User not authenticated");
      
      const groupRef = collection(db, 'groups');
      const newGroup = await addDoc(groupRef, {
        name: groupName,
        createdBy: currentUser.uid,
        members: [...members, currentUser.uid],
        createdAt: serverTimestamp()
      });
      
      toast({
        description: `Grupo "${groupName}" criado com sucesso.`
      });
      
      return newGroup.id;
    } catch (error: any) {
      console.error("Error creating group:", error);
      toast({
        title: "Erro ao criar grupo",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };
  
  const addContact = async (name: string, email: string, role: string = "user") => {
    try {
      if (!currentUser) throw new Error("User not authenticated");
      
      // In a real app, you would check if the user exists in your system
      // For now, we'll just add them to the contacts collection
      const contactRef = collection(db, 'users', currentUser.uid, 'contacts');
      const newContact = await addDoc(contactRef, {
        name,
        email,
        role,
        addedAt: serverTimestamp()
      });
      
      toast({
        description: `Contato "${name}" adicionado com sucesso.`
      });
      
      return newContact.id;
    } catch (error: any) {
      console.error("Error adding contact:", error);
      toast({
        title: "Erro ao adicionar contato",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };
  
  const getContacts = async () => {
    try {
      if (!currentUser) throw new Error("User not authenticated");
      
      const contactsRef = collection(db, 'users', currentUser.uid, 'contacts');
      const contactsSnap = await getDocs(contactsRef);
      
      return contactsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error fetching contacts:", error);
      return [];
    }
  };
  
  const getGroups = async () => {
    try {
      if (!currentUser) throw new Error("User not authenticated");
      
      const groupsRef = collection(db, 'groups');
      const groupsSnap = await getDocs(groupsRef);
      
      return groupsSnap.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter((group: any) => group.members.includes(currentUser.uid));
    } catch (error) {
      console.error("Error fetching groups:", error);
      return [];
    }
  };
  
  const getMessages = async (chatId: string) => {
    try {
      if (!currentUser) throw new Error("User not authenticated");
      
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      const messagesQuery = query(messagesRef, orderBy('timestamp', 'asc'));
      const messagesSnap = await getDocs(messagesQuery);
      
      return messagesSnap.docs.map(doc => {
        const data = doc.data();
        const isMine = data.senderId === currentUser.uid;
        
        return {
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate() || new Date(),
          isMine
        };
      });
    } catch (error) {
      console.error("Error fetching messages:", error);
      return [];
    }
  };
  
  const sendMessage = async (chatId: string, content: string) => {
    try {
      if (!currentUser) throw new Error("User not authenticated");
      
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      await addDoc(messagesRef, {
        content,
        senderId: currentUser.uid,
        sender: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
        timestamp: serverTimestamp(),
        type: 'text'
      });
      
      // Update last message in chat
      await updateDoc(doc(db, 'chats', chatId), {
        lastMessage: content,
        lastMessageTime: serverTimestamp()
      });
      
      toast({
        description: "Mensagem enviada"
      });
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast({
        title: "Erro ao enviar mensagem",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };
  
  const sendAudioMessage = async (chatId: string, audioUrl: string, duration: string) => {
    try {
      if (!currentUser) throw new Error("User not authenticated");
      
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      await addDoc(messagesRef, {
        audioUrl,
        duration,
        senderId: currentUser.uid,
        sender: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
        timestamp: serverTimestamp(),
        type: 'audio'
      });
      
      // Update last message in chat
      await updateDoc(doc(db, 'chats', chatId), {
        lastMessage: 'Áudio',
        lastMessageTime: serverTimestamp()
      });
      
      toast({
        description: `Áudio enviado (${duration})`
      });
    } catch (error: any) {
      console.error("Error sending audio message:", error);
      toast({
        title: "Erro ao enviar áudio",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };
  
  const value = {
    auth,
    db,
    currentUser,
    loading,
    signIn,
    signOut,
    createGroup,
    addContact,
    getContacts,
    getGroups,
    getMessages,
    sendMessage,
    sendAudioMessage
  };
  
  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  
  if (context === undefined) {
    throw new Error("useFirebase must be used within a FirebaseProvider");
  }
  
  return context;
};
