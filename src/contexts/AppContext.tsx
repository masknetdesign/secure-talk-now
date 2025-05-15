
import React, { createContext, useContext, ReactNode, useState } from 'react';

// Define types for the contact data
interface ContactData {
  id: string;
  name: string;
  email: string;
  role?: string;
  userId?: string;
  photoURL?: string | null;
}

interface GroupData {
  id: string;
  name: string;
  createdBy: string;
  members: string[];
  type: string;
}

interface MessageData {
  id: string;
  content?: string;
  audioUrl?: string;
  duration?: string;
  senderId: string;
  sender: string;
  timestamp: Date;
  type: 'text' | 'audio';
  status: string;
  isMine: boolean;
}

interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role?: string;
}

interface AppContextProps {
  currentUser: UserData | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  createGroup: (groupName: string, members: string[]) => Promise<string>;
  addContact: (name: string, email: string, role?: string) => Promise<string>;
  getContacts: () => Promise<ContactData[]>;
  getGroups: () => Promise<GroupData[]>;
  getMessages: (chatId: string) => Promise<MessageData[]>;
  sendMessage: (chatId: string, content: string) => Promise<void>;
  sendAudioMessage: (chatId: string, audioUrl: string, duration: string) => Promise<void>;
  listenToMessages: (chatId: string, callback: (messages: MessageData[]) => void) => () => void;
  listenToContacts: (callback: (contacts: ContactData[]) => void) => () => void;
  listenToGroups: (callback: (groups: GroupData[]) => void) => () => void;
  createChat: (contactId: string, contactName: string) => Promise<string>;
  deleteMessage: (chatId: string, messageId: string) => Promise<void>;
  updateUserProfile: (displayName: string, photoURL?: string) => Promise<void>;
  createUser: (email: string, password: string, displayName: string) => Promise<UserData>;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState<ContactData[]>([]);
  const [groups, setGroups] = useState<GroupData[]>([]);
  
  // Mock implementation of Firebase-related functions
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Simulate API call
      console.log("Signing in with", email);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const userData: UserData = {
        uid: "user-123",
        email: email,
        displayName: email.split('@')[0],
        photoURL: null,
        role: "user"
      };
      
      setCurrentUser(userData);
      localStorage.setItem('comtalk-user', JSON.stringify({
        name: userData.displayName,
        email: userData.email,
        token: "mock-token",
        role: userData.role
      }));
      
      console.log("Login successful");
    } catch (error: any) {
      console.error("Login error:", error);
      throw new Error("Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      // Clear local storage and state
      localStorage.removeItem('comtalk-user');
      setCurrentUser(null);
      console.log("Logout successful");
    } catch (error: any) {
      console.error("Logout error:", error);
      throw new Error("Logout failed");
    }
  };
  
  const createGroup = async (groupName: string, members: string[]): Promise<string> => {
    try {
      console.log("Creating group", groupName, "with members", members);
      const groupId = `group-${Date.now()}`;
      const newGroup: GroupData = {
        id: groupId,
        name: groupName,
        createdBy: currentUser?.uid || "user-123",
        members: [...members],
        type: "group"
      };
      
      setGroups(prev => [...prev, newGroup]);
      return groupId;
    } catch (error: any) {
      console.error("Error creating group:", error);
      throw new Error("Failed to create group");
    }
  };
  
  const addContact = async (name: string, email: string, role: string = "user"): Promise<string> => {
    try {
      const contactId = `contact-${Date.now()}`;
      const newContact: ContactData = {
        id: contactId,
        name,
        email,
        role,
        userId: contactId
      };
      
      setContacts(prev => [...prev, newContact]);
      return contactId;
    } catch (error: any) {
      console.error("Error adding contact:", error);
      throw new Error("Failed to add contact");
    }
  };
  
  const getContacts = async (): Promise<ContactData[]> => {
    return contacts;
  };
  
  const getGroups = async (): Promise<GroupData[]> => {
    return groups;
  };
  
  const getMessages = async (chatId: string): Promise<MessageData[]> => {
    // Return empty array for now
    return [];
  };

  const listenToMessages = (chatId: string, callback: (messages: MessageData[]) => void) => {
    // No real-time updates without Firebase, just call with empty array
    callback([]);
    return () => {}; // Return empty unsubscribe function
  };
  
  const listenToContacts = (callback: (contacts: ContactData[]) => void) => {
    // Call callback with current contacts
    callback(contacts);
    return () => {}; // Return empty unsubscribe function
  };
  
  const listenToGroups = (callback: (groups: GroupData[]) => void) => {
    // Call callback with current groups
    callback(groups);
    return () => {}; // Return empty unsubscribe function
  };
  
  const sendMessage = async (chatId: string, content: string): Promise<void> => {
    console.log("Sending message to chat", chatId, ":", content);
  };
  
  const sendAudioMessage = async (chatId: string, audioUrl: string, duration: string): Promise<void> => {
    console.log("Sending audio message to chat", chatId, ":", audioUrl, duration);
  };

  const createChat = async (contactId: string, contactName: string): Promise<string> => {
    return `chat-${contactId}-${Date.now()}`;
  };

  const deleteMessage = async (chatId: string, messageId: string): Promise<void> => {
    console.log("Deleting message", messageId, "from chat", chatId);
  };

  const updateUserProfile = async (displayName: string, photoURL?: string): Promise<void> => {
    if (currentUser) {
      const updatedUser = {
        ...currentUser,
        displayName,
        photoURL: photoURL || currentUser.photoURL
      };
      setCurrentUser(updatedUser);
      
      // Update local storage
      const userData = JSON.parse(localStorage.getItem('comtalk-user') || '{}');
      userData.name = displayName;
      if (photoURL) userData.photoURL = photoURL;
      localStorage.setItem('comtalk-user', JSON.stringify(userData));
    }
  };

  const createUser = async (email: string, password: string, displayName: string): Promise<UserData> => {
    const newUser: UserData = {
      uid: `user-${Date.now()}`,
      email,
      displayName,
      photoURL: null,
      role: "user"
    };
    
    setCurrentUser(newUser);
    return newUser;
  };
  
  const value = {
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
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
