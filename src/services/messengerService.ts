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
  serverTimestamp,
  increment,
  writeBatch
} from 'firebase/firestore';
import { db, auth, ADMIN_UID, ADMIN_EMAIL } from '../lib/firebase';
import { signInAnonymously } from 'firebase/auth';

export { ADMIN_UID, ADMIN_EMAIL };

export interface MessengerConversation {
  id: string;
  participants: string[];
  participantNames: { [uid: string]: string };
  lastMessage: string;
  lastMessageTime: any;
  unreadForAdmin: number;
  unreadForVisitor: number;
  createdAt: any;
  isTypingForAdmin?: boolean;
  isTypingForVisitor?: boolean;
  blocked?: boolean;
}

export interface MessengerMessage {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  timestamp: any;
  read: boolean;
  delivered?: boolean;
}

// 1. Ensure Visitor Anonymous Login
export async function ensureVisitorAuth(): Promise<string> {
  if (auth.currentUser?.uid) {
    return auth.currentUser.uid;
  }
  try {
    const cred = await signInAnonymously(auth);
    return cred.user.uid;
  } catch (err) {
    console.warn('Anonymous auth note:', err);
    // Fallback to stored visitor ID if Firebase Auth is unreachable
    let storedId = localStorage.getItem('elon_visitor_anon_uid');
    if (!storedId) {
      storedId = `anon_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      localStorage.setItem('elon_visitor_anon_uid', storedId);
    }
    return storedId;
  }
}

// 2. Check if conversation already exists with ADMIN_UID, if not create new
export async function getOrCreateVisitorConversation(
  visitorUid: string, 
  visitorName = 'Guest'
): Promise<{ id: string; convo: MessengerConversation }> {
  try {
    const convsCol = collection(db, 'conversations');
    const q = query(convsCol, where('participants', 'array-contains', visitorUid));
    const snapshot = await getDocs(q);

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data() as any;
      if (Array.isArray(data.participants) && data.participants.includes(ADMIN_UID)) {
        return {
          id: docSnap.id,
          convo: { id: docSnap.id, ...data } as MessengerConversation
        };
      }
    }

    // Not found, create new conversation according to exact prompt specifications:
    // conversations/{autoId} { 
    //   participants: [ADMIN_UID, visitorUid], 
    //   participantNames: {ADMIN_UID:"Elon Musk", visitorUid:"Guest"}, 
    //   lastMessage:"", 
    //   lastMessageTime: serverTimestamp(), 
    //   unreadForAdmin:0, 
    //   unreadForVisitor:0, 
    //   createdAt: serverTimestamp() 
    // }
    const newConvoData = {
      participants: [ADMIN_UID, visitorUid],
      participantNames: {
        [ADMIN_UID]: 'Elon Musk',
        [visitorUid]: visitorName || 'Guest'
      },
      lastMessage: '',
      lastMessageTime: serverTimestamp(),
      unreadForAdmin: 0,
      unreadForVisitor: 0,
      createdAt: serverTimestamp(),
      isTypingForAdmin: false,
      isTypingForVisitor: false,
      blocked: false
    };

    const docRef = await addDoc(convsCol, newConvoData);
    return {
      id: docRef.id,
      convo: { id: docRef.id, ...newConvoData } as MessengerConversation
    };
  } catch (err) {
    console.error('Error in getOrCreateVisitorConversation:', err);
    // Fallback deterministic ID in case of network edge
    const fallbackId = `convo_${visitorUid}`;
    const fallbackData: MessengerConversation = {
      id: fallbackId,
      participants: [ADMIN_UID, visitorUid],
      participantNames: { [ADMIN_UID]: 'Elon Musk', [visitorUid]: visitorName || 'Guest' },
      lastMessage: '',
      lastMessageTime: new Date().toISOString(),
      unreadForAdmin: 0,
      unreadForVisitor: 0,
      createdAt: new Date().toISOString()
    };
    try {
      await setDoc(doc(db, 'conversations', fallbackId), fallbackData, { merge: true });
    } catch {}
    return { id: fallbackId, convo: fallbackData };
  }
}

// 3. Subscribe to Real-Time Conversation Document
export function subscribeToMessengerConversation(
  conversationId: string,
  callback: (convo: MessengerConversation | null) => void
) {
  if (!conversationId) {
    callback(null);
    return () => {};
  }
  const convRef = doc(db, 'conversations', conversationId);
  return onSnapshot(
    convRef,
    (snap) => {
      if (snap.exists()) {
        callback({ id: snap.id, ...snap.data() } as MessengerConversation);
      } else {
        callback(null);
      }
    },
    (err) => {
      console.warn('subscribeToMessengerConversation warning:', err.message);
    }
  );
}

// 4. Subscribe to Real-Time Messages Subcollection (conversations/{convoId}/messages)
export function subscribeToMessengerMessages(
  conversationId: string,
  callback: (messages: MessengerMessage[]) => void
) {
  if (!conversationId) {
    callback([]);
    return () => {};
  }
  const msgsCol = collection(db, 'conversations', conversationId, 'messages');
  const q = query(msgsCol, orderBy('timestamp', 'asc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const msgs: MessengerMessage[] = [];
      snapshot.forEach((d) => {
        const data = d.data() as any;
        msgs.push({
          id: d.id,
          conversationId,
          senderId: data.senderId || '',
          text: data.text || '',
          timestamp: data.timestamp || data.createdAt || new Date().toISOString(),
          read: Boolean(data.read),
          delivered: data.delivered !== false
        });
      });
      callback(msgs);
    },
    (err) => {
      console.warn('subscribeToMessengerMessages warning:', err.message);
      // Fallback query without order by if index building
      const fallbackUnsub = onSnapshot(msgsCol, (snapshot) => {
        const msgs: MessengerMessage[] = [];
        snapshot.forEach((d) => {
          const data = d.data() as any;
          msgs.push({
            id: d.id,
            conversationId,
            senderId: data.senderId || '',
            text: data.text || '',
            timestamp: data.timestamp || data.createdAt || 0,
            read: Boolean(data.read),
            delivered: data.delivered !== false
          });
        });
        msgs.sort((a, b) => {
          const tA = a.timestamp?.toMillis ? a.timestamp.toMillis() : new Date(a.timestamp || 0).getTime();
          const tB = b.timestamp?.toMillis ? b.timestamp.toMillis() : new Date(b.timestamp || 0).getTime();
          return tA - tB;
        });
        callback(msgs);
      });
      return fallbackUnsub;
    }
  );
}

// 5. Send Messenger Message
export async function sendMessengerMessage(
  conversationId: string,
  senderId: string,
  text: string,
  isAdmin: boolean
): Promise<string> {
  const clean = text.trim();
  if (!clean || !conversationId) return '';

  const msgsCol = collection(db, 'conversations', conversationId, 'messages');
  const convRef = doc(db, 'conversations', conversationId);

  // 1. Add message to subcollection
  const msgDoc = await addDoc(msgsCol, {
    senderId,
    text: clean,
    timestamp: serverTimestamp(),
    read: false,
    delivered: true
  });

  // 2. Update conversation summary
  const updateData: any = {
    lastMessage: clean,
    lastMessageTime: serverTimestamp()
  };

  if (isAdmin) {
    updateData.unreadForAdmin = 0;
    updateData.unreadForVisitor = increment(1);
    updateData.isTypingForAdmin = false;
  } else {
    updateData.unreadForVisitor = 0;
    updateData.unreadForAdmin = increment(1);
    updateData.isTypingForVisitor = false;
  }

  await updateDoc(convRef, updateData).catch(async () => {
    // If updateDoc fails (doc might not exist yet), set with merge
    await setDoc(convRef, updateData, { merge: true });
  });

  return msgDoc.id;
}

// 6. Mark Conversation Read
export async function markConversationAsRead(
  conversationId: string,
  readerIsAdmin: boolean,
  currentUserId?: string
) {
  if (!conversationId) return;
  const convRef = doc(db, 'conversations', conversationId);
  try {
    await updateDoc(convRef, {
      [readerIsAdmin ? 'unreadForAdmin' : 'unreadForVisitor']: 0
    });
  } catch (err) {
    console.warn('markConversationAsRead note:', err);
  }

  // Also update unread messages in subcollection
  try {
    const msgsCol = collection(db, 'conversations', conversationId, 'messages');
    const q = query(msgsCol, where('read', '==', false));
    const snap = await getDocs(q);
    const batch = writeBatch(db);
    let count = 0;
    snap.forEach((d) => {
      const data = d.data();
      // If reader is admin, mark visitor's messages as read. If visitor, mark admin's as read.
      if (readerIsAdmin ? data.senderId !== ADMIN_UID : data.senderId === ADMIN_UID) {
        batch.update(d.ref, { read: true });
        count++;
      }
    });
    if (count > 0) {
      await batch.commit();
    }
  } catch (err) {
    // Non-critical background update
  }
}

// 7. Toggle Typing Indicator
export async function setMessengerTypingStatus(
  conversationId: string,
  isAdmin: boolean,
  isTyping: boolean
) {
  if (!conversationId) return;
  const convRef = doc(db, 'conversations', conversationId);
  try {
    await updateDoc(convRef, {
      [isAdmin ? 'isTypingForAdmin' : 'isTypingForVisitor']: isTyping
    });
  } catch (err) {}
}

// 8. Admin List All Conversations (Ordered by lastMessageTime desc)
export function subscribeToAdminMessengerConversations(
  callback: (conversations: MessengerConversation[]) => void
) {
  const convsCol = collection(db, 'conversations');
  return onSnapshot(
    convsCol,
    (snapshot) => {
      const list: MessengerConversation[] = [];
      snapshot.forEach((d) => {
        const data = d.data() as any;
        list.push({ id: d.id, ...data } as MessengerConversation);
      });

      // Sort by lastMessageTime desc
      list.sort((a, b) => {
        const tA = a.lastMessageTime?.toMillis ? a.lastMessageTime.toMillis() : new Date(a.lastMessageTime || a.createdAt || 0).getTime();
        const tB = b.lastMessageTime?.toMillis ? b.lastMessageTime.toMillis() : new Date(b.lastMessageTime || b.createdAt || 0).getTime();
        return tB - tA;
      });

      callback(list);
    },
    (err) => {
      console.warn('subscribeToAdminMessengerConversations error:', err.message);
      callback([]);
    }
  );
}

// 9. Admin Message Deletion
export async function deleteMessengerMessage(
  conversationId: string,
  messageId: string
): Promise<void> {
  const msgRef = doc(db, 'conversations', conversationId, 'messages', messageId);
  await deleteDoc(msgRef);
}

// 10. Admin Block/Unblock Visitor
export async function toggleBlockConversation(
  conversationId: string,
  blocked: boolean
): Promise<void> {
  const convRef = doc(db, 'conversations', conversationId);
  await updateDoc(convRef, { blocked });
}

// 11. Admin Delete Conversation
export async function deleteMessengerConversation(
  conversationId: string
): Promise<void> {
  const convRef = doc(db, 'conversations', conversationId);
  await deleteDoc(convRef);
}
