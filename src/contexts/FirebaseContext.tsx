import React, { createContext, useContext, ReactNode } from 'react';
import { 
  Auth,
  User,
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  updateProfile
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
  getDoc,
  where,
  onSnapshot,
  limit,
  FieldValue
} from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { auth, db } from '../lib/firebase';
import { useState, useEffect } from 'react';

// Define types for the contact data
interface BaseContactData {
  name: string;
  email: string;
  role: string;
  addedAt: ReturnType<typeof serverTimestamp>;
}

interface ExtendedContactData extends BaseContactData {
  userId: string;
  photoURL: string | null;
}

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
  listenToMessages: (chatId: string, callback: (messages: any[]) => void) => () => void;
  listenToContacts: (callback: (contacts: any[]) => void) => () => void;
  listenToGroups: (callback: (groups: any[]) => void) => () => void;
  createChat: (contactId: string, contactName: string) => Promise<string>;
  deleteMessage: (chatId: string, messageId: string) => Promise<void>;
  updateUserProfile: (displayName: string, photoURL?: string) => Promise<void>;
  createUser: (email: string, password: string, displayName: string) => Promise<User>;
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
      
      // Get user profile from Firestore
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      let userData: any = {
        name: email.split('@')[0],
        email,
        token: await userCredential.user.getIdToken(),
        role: 'user'
      };
      
      // If user profile exists in Firestore, use that data
      if (userDoc.exists()) {
        const userDocData = userDoc.data();
        userData = {
          ...userData,
          name: userCredential.user.displayName || userData.name,
          role: userDocData.role || userData.role,
          photoURL: userCredential.user.photoURL || null
        };
      } else {
        // If user doesn't exist in Firestore, create profile
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          email: userCredential.user.email,
          displayName: userCredential.user.displayName || email.split('@')[0],
          role: 'user',
          createdAt: serverTimestamp(),
          lastActive: serverTimestamp()
        });
      }
      
      // Update last active timestamp
      await updateDoc(doc(db, 'users', userCredential.user.uid), {
        lastActive: serverTimestamp()
      });
      
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
      // Update last active timestamp before signing out
      if (currentUser) {
        await updateDoc(doc(db, 'users', currentUser.uid), {
          lastActive: serverTimestamp()
        });
      }
      
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
      
      console.log("Criando grupo:", groupName, "com membros:", members);
      
      // Adicionar o usuário atual como membro se não estiver na lista
      if (!members.includes(currentUser.uid)) {
        members.push(currentUser.uid);
      }
      
      // Formatar os membros como array simples de UIDs (formato que a consulta espera)
      const memberIds = [...new Set(members)]; // Remover duplicatas
      
      console.log("Lista final de membros:", memberIds);
      
      // Criar o grupo
      const groupRef = collection(db, 'groups');
      const newGroup = await addDoc(groupRef, {
        name: groupName,
        createdBy: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        members: memberIds, // Usar array simples de UIDs
        type: "group"
      });
      
      console.log("Grupo criado com ID:", newGroup.id);
      
      // Criar chat correspondente para o grupo
      const chatRef = doc(db, 'chats', newGroup.id);
      await setDoc(chatRef, {
        type: "group",
        groupId: newGroup.id,
        lastMessage: `Grupo "${groupName}" criado`,
        lastMessageTime: serverTimestamp(),
        participants: memberIds
      });
      
      console.log("Chat criado para o grupo");
      
      return newGroup.id;
    } catch (error: any) {
      console.error("Error creating group:", error);
      throw error;
    }
  };
  
  const addContact = async (name: string, email: string, role: string = "user") => {
    try {
      if (!currentUser) throw new Error("User not authenticated");
      
      // Try to find user by email
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);
      
      let contactId = "";
      
      // Define a base contact data object 
      let contactData: BaseContactData = {
        name,
        email,
        role,
        addedAt: serverTimestamp()
      };
      
      if (!querySnapshot.empty) {
        // User exists, use their ID and data
        const userData = querySnapshot.docs[0].data();
        contactId = querySnapshot.docs[0].id;
        
        // Create new data object with extended type
        const extendedContactData: ExtendedContactData = {
          ...contactData,
          name: userData.displayName || name,
          userId: contactId,
          photoURL: userData.photoURL || null
        };
        
        // Reassign contact data
        contactData = extendedContactData as any;
      }
      
      // Add to current user's contacts
      const contactRef = collection(db, 'users', currentUser.uid, 'contacts');
      const newContact = await addDoc(contactRef, contactData);
      
      // If contact is a registered user, also add current user to their contacts
      if (contactId) {
        const reciprocalContactRef = collection(db, 'users', contactId, 'contacts');
        const currentUserContactData: BaseContactData & { userId: string; photoURL: string | null } = {
          name: currentUser.displayName || currentUser.email?.split('@')[0] || "User",
          email: currentUser.email || "",
          role: "user",
          userId: currentUser.uid,
          photoURL: currentUser.photoURL || null,
          addedAt: serverTimestamp()
        };
        
        await addDoc(reciprocalContactRef, currentUserContactData);
      }
      
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
      const q = query(groupsRef, where("members", "array-contains", currentUser.uid));
      const groupsSnap = await getDocs(q);
      
      return groupsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
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

  const listenToMessages = (chatId: string, callback: (messages: any[]) => void) => {
    if (!currentUser) throw new Error("User not authenticated");
    
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const messagesQuery = query(messagesRef, orderBy('timestamp', 'asc'));
    
    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messages = snapshot.docs.map(doc => {
        const data = doc.data();
        const isMine = data.senderId === currentUser.uid;
        
        return {
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate() || new Date(),
          isMine
        };
      });
      
      callback(messages);
    });
    
    return unsubscribe;
  };
  
  const listenToContacts = (callback: (contacts: any[]) => void) => {
    if (!currentUser) throw new Error("User not authenticated");
    
    const contactsRef = collection(db, 'users', currentUser.uid, 'contacts');
    
    const unsubscribe = onSnapshot(contactsRef, (snapshot) => {
      const contacts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      callback(contacts);
    });
    
    return unsubscribe;
  };
  
  const listenToGroups = (callback: (groups: any[]) => void) => {
    if (!currentUser) {
      console.warn("listenToGroups: Usuário não autenticado");
      callback([]);
      return () => {};
    }
    
    console.log("Tentando buscar grupos para o usuário:", currentUser.uid);
    
    // Primeiro verifica se há grupos na coleção
    const groupsRef = collection(db, 'groups');
    
    // Tenta várias formas de buscar os grupos para garantir compatibilidade com diferentes estruturas
    // Opção 1: Array de objetos com id
    const memberObjectsQuery = query(
      groupsRef, 
      where("members", "array-contains", { id: currentUser.uid })
    );
    
    // Opção 2: Array de strings com UIDs
    const memberUidsQuery = query(
      groupsRef, 
      where("members", "array-contains", currentUser.uid)
    );
    
    // Método para buscar todos os grupos e filtrar manualmente
    const getAllGroups = async () => {
      const allGroupsSnapshot = await getDocs(groupsRef);
      
      // Filtra manualmente para encontrar grupos que contenham o usuário
      const userGroups = allGroupsSnapshot.docs.filter(doc => {
        const data = doc.data();
        
        // Verificação para diferentes estruturas de dados
        if (Array.isArray(data.members)) {
          // Verifica se é um array de strings
          if (typeof data.members[0] === 'string') {
            return data.members.includes(currentUser.uid);
          }
          
          // Verifica se é um array de objetos
          if (typeof data.members[0] === 'object') {
            return data.members.some((member: any) => 
              member.id === currentUser.uid || 
              member === currentUser.uid
            );
          }
        }
        
        return false;
      });
      
      return userGroups.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    };
    
    // Tentar primeiro a consulta padrão
    const unsubscribe = onSnapshot(memberUidsQuery, async (snapshot) => {
      try {
        if (snapshot.empty) {
          console.log("Nenhum grupo encontrado com a primeira consulta, tentando alternativas...");
          
          // Se não encontrar, tentar a segunda consulta
          const objectsSnapshot = await getDocs(memberObjectsQuery);
          
          if (objectsSnapshot.empty) {
            console.log("Nenhum grupo encontrado com a segunda consulta, fazendo busca manual...");
            
            // Se ainda não encontrar, fazer uma busca completa e filtrar manualmente
            const manualGroups = await getAllGroups();
            console.log("Grupos encontrados manualmente:", manualGroups);
            
            if (manualGroups.length === 0) {
              // Se ainda não tiver grupos, criar um grupo padrão para teste
              console.log("Criando grupo padrão para teste");
              
              // Cria um grupo teste no Firestore
              const testGroupRef = await addDoc(groupsRef, {
                name: "Grupo de Teste",
                createdBy: currentUser.uid,
                createdAt: serverTimestamp(),
                members: [currentUser.uid],
                type: "group",
              });
              
              const testGroupData = {
                id: testGroupRef.id,
                name: "Grupo de Teste",
                createdBy: currentUser.uid,
                members: [currentUser.uid],
                type: "group",
              };
              
              callback([testGroupData]);
            } else {
              callback(manualGroups);
            }
          } else {
            const groups = objectsSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            console.log("Grupos encontrados com segunda consulta:", groups);
            callback(groups);
          }
        } else {
          const groups = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          console.log("Grupos encontrados com primeira consulta:", groups);
          callback(groups);
        }
      } catch (error) {
        console.error("Erro ao processar grupos:", error);
        callback([]);
      }
    }, (error) => {
      console.error("Erro na consulta de grupos:", error);
      callback([]);
    });
    
    return unsubscribe;
  };
  
  const sendMessage = async (chatId: string, content: string) => {
    try {
      if (!currentUser) throw new Error("User not authenticated");
      
      // Check if chat exists
      const chatDoc = await getDoc(doc(db, 'chats', chatId));
      if (!chatDoc.exists()) {
        throw new Error("Chat não encontrado");
      }
      
      // Add message to chat
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      await addDoc(messagesRef, {
        content,
        senderId: currentUser.uid,
        sender: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
        timestamp: serverTimestamp(),
        type: 'text',
        status: 'sent'
      });
      
      // Update last message in chat
      await updateDoc(doc(db, 'chats', chatId), {
        lastMessage: content,
        lastMessageTime: serverTimestamp(),
        lastMessageSender: currentUser.uid
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
      
      // Check if chat exists
      const chatDoc = await getDoc(doc(db, 'chats', chatId));
      if (!chatDoc.exists()) {
        throw new Error("Chat não encontrado");
      }
      
      // Add message to chat
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      await addDoc(messagesRef, {
        audioUrl,
        duration,
        senderId: currentUser.uid,
        sender: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
        timestamp: serverTimestamp(),
        type: 'audio',
        status: 'sent'
      });
      
      // Update last message in chat
      await updateDoc(doc(db, 'chats', chatId), {
        lastMessage: `Mensagem de áudio (${duration})`,
        lastMessageTime: serverTimestamp(),
        lastMessageSender: currentUser.uid,
        lastMessageType: 'audio'
      });
      
    } catch (error: any) {
      console.error("Error sending audio message:", error);
      toast({
        title: "Erro ao enviar mensagem de áudio",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  const createChat = async (contactId: string, contactName: string) => {
    try {
      if (!currentUser) throw new Error("User not authenticated");
      
      // Primeiro, verifica se já existe um chat entre os dois usuários
      const chatsRef = collection(db, 'chats');
      const q = query(
        chatsRef,
        where('type', '==', 'direct'),
        where('participants', 'array-contains', currentUser.uid)
      );
      
      const existingChatsSnap = await getDocs(q);
      
      // Procuramos um chat que contenha o ID do contato selecionado
      let existingChat = null;
      existingChatsSnap.forEach(doc => {
        const chatData = doc.data();
        if (chatData.participants.includes(contactId)) {
          existingChat = { id: doc.id, ...chatData };
        }
      });
      
      // Se já existe um chat, retorna o ID
      if (existingChat) {
        return existingChat.id;
      }
      
      // Se não existe, cria um novo chat
      const newChat = await addDoc(chatsRef, {
        type: "direct",
        participants: [currentUser.uid, contactId],
        participantDetails: [
          {
            id: currentUser.uid,
            name: currentUser.displayName || currentUser.email?.split('@')[0] || 'User'
          },
          {
            id: contactId,
            name: contactName
          }
        ],
        createdAt: serverTimestamp(),
        lastMessageTime: serverTimestamp(),
        lastMessage: "Conversa iniciada"
      });
      
      // Retorna o ID do novo chat
      return newChat.id;
    } catch (error: any) {
      console.error("Error creating chat:", error);
      toast({
        title: "Erro ao criar conversa",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteMessage = async (chatId: string, messageId: string) => {
    try {
      if (!currentUser) throw new Error("User not authenticated");
      
      await deleteDoc(doc(db, 'chats', chatId, 'messages', messageId));
      
      // Update last message in chat if needed
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      const messagesQuery = query(messagesRef, orderBy('timestamp', 'desc'), limit(1));
      const messagesSnap = await getDocs(messagesQuery);
      
      if (!messagesSnap.empty) {
        const lastMessage = messagesSnap.docs[0].data();
        
        let lastMessageText = '';
        if (lastMessage.type === 'text') {
          lastMessageText = lastMessage.content;
        } else if (lastMessage.type === 'audio') {
          lastMessageText = `Mensagem de áudio (${lastMessage.duration})`;
        }
        
        await updateDoc(doc(db, 'chats', chatId), {
          lastMessage: lastMessageText,
          lastMessageTime: lastMessage.timestamp,
          lastMessageSender: lastMessage.senderId,
          lastMessageType: lastMessage.type
        });
      }
      
    } catch (error: any) {
      console.error("Error deleting message:", error);
      toast({
        title: "Erro ao excluir mensagem",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateUserProfile = async (displayName: string, photoURL?: string) => {
    try {
      if (!currentUser) throw new Error("User not authenticated");
      
      const updateData: any = { displayName };
      if (photoURL) updateData.photoURL = photoURL;
      
      await updateProfile(currentUser, updateData);
      
      // Update Firestore user document
      await updateDoc(doc(db, 'users', currentUser.uid), {
        displayName,
        ...(photoURL && { photoURL }),
        updatedAt: serverTimestamp()
      });
      
      // Update local storage
      const userData = JSON.parse(localStorage.getItem('comtalk-user') || '{}');
      userData.name = displayName;
      if (photoURL) userData.photoURL = photoURL;
      localStorage.setItem('comtalk-user', JSON.stringify(userData));
      
      toast({
        description: "Perfil atualizado com sucesso"
      });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  const createUser = async (email: string, password: string, displayName: string) => {
    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update user profile with display name
      await updateProfile(user, { displayName });
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email,
        displayName,
        role: 'user',
        createdAt: serverTimestamp(),
        lastActive: serverTimestamp()
      });
      
      toast({
        title: "Usuário criado",
        description: "Conta criada com sucesso!"
      });
      
      return user;
    } catch (error: any) {
      console.error("Error creating user:", error);
      toast({
        title: "Erro ao criar usuário",
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
    sendAudioMessage,
    listenToMessages,
    listenToContacts,
    listenToGroups,
    createChat,
    deleteMessage,
    updateUserProfile,
    createUser
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
