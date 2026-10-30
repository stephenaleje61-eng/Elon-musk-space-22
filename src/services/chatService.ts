import { 
  collection, 
  doc, 
  getDoc, 
  getDocs,
  setDoc, 
  addDoc, 
  deleteDoc,
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, auth, ADMIN_EMAIL } from '../lib/firebase';
import { 
  JoinRequestItem, 
  PrivateChatItem, 
  RealMessage, 
  ChatUser, 
  RealConversation, 
  RealMessageItem, 
  ReportItem 
} from '../types';

const LOCAL_STORAGE_KEY = 'elon_real_human_chat_v1';
const LOCAL_USER_KEY = 'elon_chat_registered_user';

// =======================================================================
// 1. REGISTERED CHAT USERS & PRESENCE (HUMAN-TO-HUMAN DIRECT DIRECTORY)
// =======================================================================

export async function registerOrUpdateUser(
  userId: string,
  displayName: string,
  photoURL?: string
): Promise<ChatUser> {
  const userRef = doc(db, 'users', userId);
  const now = new Date().toISOString();

  let existingUser: Partial<ChatUser> = {};
  try {
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      existingUser = snap.data() as ChatUser;
    }
  } catch (err) {
    console.warn('Note reading existing user:', err);
  }

  const userData: ChatUser = {
    userId,
    displayName: displayName.trim() || existingUser.displayName || `StarlinkVoyager_${userId.slice(-4)}`,
    photoURL: photoURL || existingUser.photoURL || '',
    online: true,
    lastSeen: now,
    createdAt: existingUser.createdAt || now,
    isSuspended: existingUser.isSuspended || false
  };

  try {
    await setDoc(userRef, userData, { merge: true });
  } catch (err) {
    console.warn('Firestore set user notice:', err);
  }

  // Save in local storage
  try {
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(userData));
  } catch {}

  return userData;
}

export async function setUserOnlineStatus(userId: string, online: boolean): Promise<void> {
  if (!userId) return;
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      online,
      lastSeen: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.warn('Failed to update presence:', err);
  }
}

export function subscribeToUsers(callback: (users: ChatUser[]) => void) {
  try {
    const colRef = collection(db, 'users');
    return onSnapshot(
      colRef,
      (snapshot) => {
        const users: ChatUser[] = [];
        snapshot.forEach((d) => {
          users.push({ ...d.data() } as ChatUser);
        });
        // Sort: online first, then by lastSeen desc
        users.sort((a, b) => {
          if (a.online === b.online) {
            return new Date(b.lastSeen || 0).getTime() - new Date(a.lastSeen || 0).getTime();
          }
          return a.online ? -1 : 1;
        });
        callback(users);
      },
      (error) => {
        console.warn('Users listener notice:', error.message);
        // Fallback to local storage if available
        try {
          const cached = localStorage.getItem(LOCAL_USER_KEY);
          if (cached) callback([JSON.parse(cached)]);
          else callback([]);
        } catch {
          callback([]);
        }
      }
    );
  } catch (err) {
    callback([]);
    return () => {};
  }
}

// =======================================================================
// 2. REAL CONVERSATIONS (1-ON-1 HUMAN-TO-HUMAN CHANNELS)
// =======================================================================

// Deterministic conversation ID for two users so both find the same channel
export function getConversationId(userId1: string, userId2: string): string {
  return [userId1, userId2].sort().join('_');
}

export async function getOrCreateConversation(
  currentUser: ChatUser,
  otherUser: ChatUser
): Promise<string> {
  const conversationId = getConversationId(currentUser.userId, otherUser.userId);
  const convRef = doc(db, 'conversations', conversationId);

  const now = new Date().toISOString();

  try {
    const snap = await getDoc(convRef);
    if (!snap.exists()) {
      const newConv: RealConversation = {
        id: conversationId,
        participants: [currentUser.userId, otherUser.userId],
        participantDetails: {
          [currentUser.userId]: {
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL || ''
          },
          [otherUser.userId]: {
            displayName: otherUser.displayName,
            photoURL: otherUser.photoURL || ''
          }
        },
        lastMessage: '',
        lastMessageAt: now,
        lastSenderId: '',
        createdAt: now,
        unreadCount: {
          [currentUser.userId]: 0,
          [otherUser.userId]: 0
        }
      };
      await setDoc(convRef, newConv, { merge: true });
    } else {
      // Ensure participant details are up-to-date
      await setDoc(convRef, {
        participantDetails: {
          [currentUser.userId]: {
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL || ''
          },
          [otherUser.userId]: {
            displayName: otherUser.displayName,
            photoURL: otherUser.photoURL || ''
          }
        }
      }, { merge: true });
    }
  } catch (err) {
    console.warn('Notice getOrCreateConversation:', err);
  }

  return conversationId;
}

export function subscribeToUserConversations(
  userId: string,
  callback: (conversations: RealConversation[]) => void
) {
  try {
    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', userId)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const convs: RealConversation[] = [];
        snapshot.forEach((d) => {
          convs.push({ id: d.id, ...d.data() } as RealConversation);
        });
        // Sort in memory by lastMessageAt desc to avoid composite index requirements
        convs.sort((a, b) => new Date(b.lastMessageAt || b.createdAt || 0).getTime() - new Date(a.lastMessageAt || a.createdAt || 0).getTime());
        callback(convs);
      },
      (error) => {
        console.warn('Conversations listener notice:', error.message);
        callback([]);
      }
    );
  } catch (err) {
    callback([]);
    return () => {};
  }
}

export function subscribeToAllConversations(
  callback: (conversations: RealConversation[]) => void
) {
  try {
    const colRef = collection(db, 'conversations');
    return onSnapshot(
      colRef,
      (snapshot) => {
        const convs: RealConversation[] = [];
        snapshot.forEach((d) => {
          convs.push({ id: d.id, ...d.data() } as RealConversation);
        });
        convs.sort((a, b) => new Date(b.lastMessageAt || 0).getTime() - new Date(a.lastMessageAt || 0).getTime());
        callback(convs);
      },
      (error) => {
        console.warn('All conversations listener notice:', error.message);
        callback([]);
      }
    );
  } catch (err) {
    callback([]);
    return () => {};
  }
}

// =======================================================================
// 3. MESSAGES (SUBCOLLECTION: conversations/{conversationId}/messages)
// =======================================================================

export async function sendHumanMessage(
  conversationId: string,
  senderId: string,
  receiverId: string,
  senderName: string,
  text: string,
  imageUrl?: string
): Promise<string> {
  const cleanText = text.trim();
  if (!cleanText && !imageUrl) return '';

  // 1. Verify user suspension status
  try {
    const senderDoc = await getDoc(doc(db, 'users', senderId));
    if (senderDoc.exists() && senderDoc.data()?.isSuspended) {
      throw new Error('Your account has been suspended by the platform administrator for violating communication guidelines.');
    }
  } catch (err: any) {
    if (err?.message?.includes('suspended')) {
      throw err;
    }
  }

  const now = new Date().toISOString();
  const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const messageData: RealMessageItem = {
    id: messageId,
    conversationId,
    senderId,
    receiverId,
    senderName,
    text: cleanText,
    imageUrl: imageUrl || '',
    createdAt: now,
    status: 'sent'
  };

  try {
    // 1. Add message doc
    const msgRef = doc(db, 'conversations', conversationId, 'messages', messageId);
    await setDoc(msgRef, messageData);

    // 2. Update conversation summary
    const convRef = doc(db, 'conversations', conversationId);
    await setDoc(convRef, {
      lastMessage: cleanText || '📷 [Image Attachment]',
      lastMessageAt: now,
      lastSenderId: senderId
    }, { merge: true });

    return messageId;
  } catch (err) {
    console.error('Failed to dispatch message to Firestore:', err);
    throw err;
  }
}

export function subscribeToConversationMessages(
  conversationId: string,
  callback: (messages: RealMessageItem[]) => void
) {
  if (!conversationId) {
    callback([]);
    return () => {};
  }

  try {
    const messagesCol = collection(db, 'conversations', conversationId, 'messages');
    const q = query(messagesCol, orderBy('createdAt', 'asc'));

    return onSnapshot(
      q,
      (snapshot) => {
        const msgs: RealMessageItem[] = [];
        snapshot.forEach((d) => {
          msgs.push({ id: d.id, ...d.data() } as RealMessageItem);
        });
        callback(msgs);
      },
      (error) => {
        console.warn('Messages listener warning:', error.message);
        callback([]);
      }
    );
  } catch (err) {
    callback([]);
    return () => {};
  }
}

export async function markMessagesAsRead(
  conversationId: string,
  currentUserId: string
): Promise<void> {
  if (!conversationId || !currentUserId) return;
  try {
    const messagesCol = collection(db, 'conversations', conversationId, 'messages');
    const q = query(
      messagesCol,
      where('receiverId', '==', currentUserId),
      where('status', '!=', 'read')
    );
    const snap = await getDocs(q);
    const updates = snap.docs.map((d) => 
      setDoc(doc(db, 'conversations', conversationId, 'messages', d.id), { status: 'read' }, { merge: true })
    );
    await Promise.all(updates);
  } catch (err) {
    console.warn('Notice marking messages as read:', err);
  }
}

// =======================================================================
// 4. REPORTING & ABUSE MODERATION (OWNER-EXCLUSIVE)
// =======================================================================

export async function reportAbusiveMessage(
  reportedBy: string,
  reportedByName: string,
  reportedUserId: string,
  conversationId: string,
  messageId: string,
  messageText: string,
  reason: string
): Promise<string> {
  const reportId = `rep_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  const reportData: ReportItem = {
    id: reportId,
    reportedBy,
    reportedByName,
    reportedUserId,
    conversationId,
    messageId,
    messageText,
    reason,
    createdAt: now,
    status: 'pending'
  };

  try {
    await setDoc(doc(db, 'reports', reportId), reportData);
    return reportId;
  } catch (err) {
    console.error('Failed to submit report:', err);
    throw err;
  }
}

export function subscribeToReports(callback: (reports: ReportItem[]) => void) {
  try {
    const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
    return onSnapshot(
      q,
      (snapshot) => {
        const reports: ReportItem[] = [];
        snapshot.forEach((d) => {
          reports.push({ id: d.id, ...d.data() } as ReportItem);
        });
        callback(reports);
      },
      (err) => {
        console.warn('Reports listener notice:', err);
        callback([]);
      }
    );
  } catch (err) {
    callback([]);
    return () => {};
  }
}

export async function adminSuspendUser(userId: string, isSuspended: boolean): Promise<void> {
  try {
    await setDoc(doc(db, 'users', userId), { isSuspended }, { merge: true });
  } catch (err) {
    console.error('Failed to suspend user:', err);
    throw err;
  }
}

export async function adminDeleteUser(userId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'users', userId));
  } catch (err) {
    console.error('Failed to delete user:', err);
    throw err;
  }
}

export async function adminDeleteMessage(conversationId: string, messageId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'conversations', conversationId, 'messages', messageId));
  } catch (err) {
    console.error('Failed to delete message:', err);
    throw err;
  }
}

export async function adminUpdateReportStatus(
  reportId: string, 
  status: 'pending' | 'reviewed' | 'dismissed'
): Promise<void> {
  try {
    await setDoc(doc(db, 'reports', reportId), { status }, { merge: true });
  } catch (err) {
    console.error('Failed to update report status:', err);
    throw err;
  }
}

// =======================================================================
// 5. BACKWARD-COMPATIBILITY DESK HELPERS
// =======================================================================

export function getLocalChatBackup(): {
  joinRequests: Record<string, JoinRequestItem>;
  privateChats: Record<string, PrivateChatItem>;
  messages: Record<string, RealMessage[]>;
} {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return { joinRequests: {}, privateChats: {}, messages: {} };
    return JSON.parse(raw);
  } catch (err) {
    return { joinRequests: {}, privateChats: {}, messages: {} };
  }
}

export function saveLocalChatBackup(data: {
  joinRequests?: Record<string, JoinRequestItem>;
  privateChats?: Record<string, PrivateChatItem>;
  messages?: Record<string, RealMessage[]>;
}) {
  try {
    const current = getLocalChatBackup();
    const updated = {
      joinRequests: { ...current.joinRequests, ...data.joinRequests },
      privateChats: { ...current.privateChats, ...data.privateChats },
      messages: { ...current.messages, ...data.messages }
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('LocalStorage backup write failed:', err);
  }
}

export async function fbAddRequest(
  name: string,
  loc: string,
  msg: string,
  visitorId: string
): Promise<string> {
  const time = new Date().toISOString();
  const requestId = `req_${visitorId}_${Date.now()}`;

  const requestData: JoinRequestItem = {
    id: requestId,
    name: name.trim(),
    loc: loc.trim(),
    msg: msg.trim(),
    time,
    visitorId,
    status: 'pending'
  };

  const currentLocal = getLocalChatBackup();
  currentLocal.joinRequests[requestId] = requestData;
  saveLocalChatBackup({ joinRequests: currentLocal.joinRequests });

  try {
    const reqRef = doc(db, 'joinRequests', requestId);
    await setDoc(reqRef, requestData);
    return requestId;
  } catch (error) {
    return requestId;
  }
}

export async function fbAccept(
  requestId: string,
  visitorId: string,
  name: string,
  loc: string,
  initialMsg: string
): Promise<void> {
  const time = new Date().toISOString();

  try {
    const reqRef = doc(db, 'joinRequests', requestId);
    await setDoc(reqRef, { status: 'accepted' }, { merge: true });
  } catch (err) {
    console.warn('Failed to update join request status:', err);
  }

  const chatData: PrivateChatItem = {
    id: visitorId,
    visitorId,
    name,
    loc,
    lastMsg: initialMsg,
    lastTime: time,
    status: 'active'
  };

  try {
    const chatRef = doc(db, 'privateChats', visitorId);
    await setDoc(chatRef, chatData, { merge: true });

    const messagesCol = collection(db, 'privateChats', visitorId, 'messages');
    const existingSnap = await getDocs(messagesCol);
    if (existingSnap.empty) {
      const firstMessage: RealMessage = {
        from: name,
        text: initialMsg,
        time,
        real: true
      };
      await addDoc(messagesCol, firstMessage);
    }
  } catch (error) {
    console.warn('Failed to initialize privateChat in Firestore:', error);
  }

  const local = getLocalChatBackup();
  if (local.joinRequests[requestId]) {
    local.joinRequests[requestId].status = 'accepted';
  }
  local.privateChats[visitorId] = chatData;
  if (!local.messages[visitorId]) {
    local.messages[visitorId] = [{
      from: name,
      text: initialMsg,
      time,
      real: true
    }];
  }
  saveLocalChatBackup(local);
}

export async function fbDecline(requestId: string): Promise<void> {
  try {
    const reqRef = doc(db, 'joinRequests', requestId);
    await setDoc(reqRef, { status: 'declined' }, { merge: true });
  } catch (err) {
    console.warn('Failed to decline request in Firestore:', err);
  }

  const local = getLocalChatBackup();
  if (local.joinRequests[requestId]) {
    local.joinRequests[requestId].status = 'declined';
    saveLocalChatBackup(local);
  }
}

export async function fbSendMsg(
  visitorId: string,
  from: string,
  text: string
): Promise<void> {
  const time = new Date().toISOString();
  const messageData: RealMessage = {
    from,
    text: text.trim(),
    time,
    real: true
  };

  const local = getLocalChatBackup();
  if (!local.messages[visitorId]) local.messages[visitorId] = [];
  local.messages[visitorId].push(messageData);
  if (local.privateChats[visitorId]) {
    local.privateChats[visitorId].lastMsg = text.trim();
    local.privateChats[visitorId].lastTime = time;
  }
  saveLocalChatBackup(local);

  try {
    const messagesCol = collection(db, 'privateChats', visitorId, 'messages');
    await addDoc(messagesCol, messageData);

    const chatRef = doc(db, 'privateChats', visitorId);
    await setDoc(chatRef, {
      visitorId,
      lastMsg: text.trim(),
      lastTime: time,
      status: 'active'
    }, { merge: true });
  } catch (error) {
    console.warn('Firestore send message notice:', error);
  }
}

export function fbListenRequests(callback: (requests: JoinRequestItem[]) => void) {
  try {
    const q = query(collection(db, 'joinRequests'), orderBy('time', 'desc'));
    return onSnapshot(
      q,
      (snapshot) => {
        const reqs: JoinRequestItem[] = [];
        snapshot.forEach((d) => {
          reqs.push({ id: d.id, ...d.data() } as JoinRequestItem);
        });
        callback(reqs);
      },
      (error) => {
        const local = getLocalChatBackup();
        callback(Object.values(local.joinRequests));
      }
    );
  } catch (err) {
    const local = getLocalChatBackup();
    callback(Object.values(local.joinRequests));
    return () => {};
  }
}

export function fbListenVisitorRequest(
  visitorId: string,
  callback: (request: JoinRequestItem | null) => void
) {
  try {
    const q = query(
      collection(db, 'joinRequests'),
      where('visitorId', '==', visitorId)
    );
    return onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          const local = getLocalChatBackup();
          const found = Object.values(local.joinRequests).find(r => r.visitorId === visitorId);
          callback(found || null);
          return;
        }
        let matched: JoinRequestItem | null = null;
        snapshot.forEach((d) => {
          matched = { id: d.id, ...d.data() } as JoinRequestItem;
        });
        callback(matched);
      },
      (error) => {
        const local = getLocalChatBackup();
        const found = Object.values(local.joinRequests).find(r => r.visitorId === visitorId);
        callback(found || null);
      }
    );
  } catch (err) {
    return () => {};
  }
}

export function fbListenMessages(
  visitorId: string,
  callback: (messages: RealMessage[]) => void
) {
  try {
    const messagesCol = collection(db, 'privateChats', visitorId, 'messages');
    const q = query(messagesCol, orderBy('time', 'asc'));

    return onSnapshot(
      q,
      (snapshot) => {
        const msgs: RealMessage[] = [];
        snapshot.forEach((d) => {
          msgs.push({ id: d.id, ...d.data() } as RealMessage);
        });
        callback(msgs);
      },
      (error) => {
        const local = getLocalChatBackup();
        callback(local.messages[visitorId] || []);
      }
    );
  } catch (err) {
    const local = getLocalChatBackup();
    callback(local.messages[visitorId] || []);
    return () => {};
  }
}

export function fbListenActiveChats(
  callback: (chats: PrivateChatItem[]) => void
) {
  try {
    const q = query(collection(db, 'privateChats'), orderBy('lastTime', 'desc'));
    return onSnapshot(
      q,
      (snapshot) => {
        const chats: PrivateChatItem[] = [];
        snapshot.forEach((d) => {
          chats.push({ id: d.id, ...d.data() } as PrivateChatItem);
        });
        callback(chats);
      },
      (error) => {
        const local = getLocalChatBackup();
        callback(Object.values(local.privateChats));
      }
    );
  } catch (err) {
    const local = getLocalChatBackup();
    callback(Object.values(local.privateChats));
    return () => {};
  }
}

export async function exportAllChats(): Promise<void> {
  const backupData: {
    exportedAt: string;
    totalChats: number;
    conversations: {
      chat: PrivateChatItem;
      messages: RealMessage[];
    }[];
  } = {
    exportedAt: new Date().toISOString(),
    totalChats: 0,
    conversations: []
  };

  try {
    const chatsSnap = await getDocs(collection(db, 'privateChats'));
    for (const chatDoc of chatsSnap.docs) {
      const chat = { id: chatDoc.id, ...chatDoc.data() } as PrivateChatItem;
      const msgsSnap = await getDocs(
        query(collection(db, 'privateChats', chat.id, 'messages'), orderBy('time', 'asc'))
      );
      const messages: RealMessage[] = [];
      msgsSnap.forEach(m => messages.push({ id: m.id, ...m.data() } as RealMessage));
      backupData.conversations.push({ chat, messages });
    }
    backupData.totalChats = backupData.conversations.length;
  } catch (err) {
    const local = getLocalChatBackup();
    Object.values(local.privateChats).forEach(chat => {
      backupData.conversations.push({
        chat,
        messages: local.messages[chat.visitorId] || []
      });
    });
    backupData.totalChats = backupData.conversations.length;
  }

  const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `elon_musk_space_chats_backup_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
