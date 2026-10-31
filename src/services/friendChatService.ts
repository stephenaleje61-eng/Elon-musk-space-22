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
import { db, auth, ADMIN_EMAIL, ADMIN_UID } from '../lib/firebase';
import { signInAnonymously } from 'firebase/auth';

export { ADMIN_EMAIL, ADMIN_UID };

export interface FriendRequest {
  id: string;
  senderId: string;
  senderName: string;
  senderEmail: string | null;
  receiverEmail: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: any;
  message?: string;
}

export interface Friendship {
  id: string;
  participants: string[];
  adminEmail: string;
  visitorId: string;
  createdAt: any;
  status: 'friends';
}

export interface RealConversation {
  id: string;
  participants: string[];
  participantNames?: { [uid: string]: string };
  adminEmail: string;
  friendshipId: string;
  lastMessage: string;
  lastMessageTime: any;
  createdAt: any;
  deletedByAdmin: boolean;
  archivedAt?: any;
  unreadForAdmin?: number;
  unreadForVisitor?: number;
  isTypingForAdmin?: boolean;
  isTypingForVisitor?: boolean;
}

export interface RealChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderEmail?: string | null;
  text: string;
  timestamp: any;
  read: boolean;
  isReal: true;
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
    let storedId = localStorage.getItem('elon_visitor_anon_uid');
    if (!storedId) {
      storedId = `anon_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      localStorage.setItem('elon_visitor_anon_uid', storedId);
    }
    return storedId;
  }
}

// 2. Send Friend Request (Visitor -> Elon Musk)
export async function sendFriendRequest(
  senderId: string,
  senderName: string,
  message?: string,
  senderEmail?: string | null
): Promise<string> {
  const reqCol = collection(db, 'friendRequests');
  const docRef = await addDoc(reqCol, {
    senderId,
    senderName: senderName.trim() || 'Guest',
    senderEmail: senderEmail || auth.currentUser?.email || null,
    receiverEmail: ADMIN_EMAIL,
    status: 'pending',
    createdAt: serverTimestamp(),
    message: message?.trim() || 'Hi, I want to connect on Elon Musk Space'
  });
  return docRef.id;
}

// 3. Listen to Visitor's Friend Request Status
export function subscribeToVisitorFriendRequest(
  visitorId: string,
  callback: (request: FriendRequest | null) => void
) {
  if (!visitorId) {
    callback(null);
    return () => {};
  }
  const reqCol = collection(db, 'friendRequests');
  const q = query(reqCol, where('senderId', '==', visitorId));
  
  return onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.empty) {
        callback(null);
        return;
      }
      // Pick the most recent request
      const list: FriendRequest[] = [];
      snapshot.forEach(d => list.push({ id: d.id, ...d.data() } as FriendRequest));
      list.sort((a, b) => {
        const tA = a.createdAt?.toMillis ? a.createdAt.toMillis() : new Date(a.createdAt || 0).getTime();
        const tB = b.createdAt?.toMillis ? b.createdAt.toMillis() : new Date(b.createdAt || 0).getTime();
        return tB - tA;
      });
      callback(list[0]);
    },
    (err) => {
      console.warn('subscribeToVisitorFriendRequest warning:', err.message);
      callback(null);
    }
  );
}

// 4. Listen to Visitor's Active Conversation (only once accepted)
export function subscribeToVisitorActiveConversation(
  visitorId: string,
  callback: (convo: RealConversation | null) => void
) {
  if (!visitorId) {
    callback(null);
    return () => {};
  }
  const convsCol = collection(db, 'conversations');
  const q = query(convsCol, where('participants', 'array-contains', visitorId));

  return onSnapshot(
    q,
    (snapshot) => {
      let activeConvo: RealConversation | null = null;
      snapshot.forEach((d) => {
        const data = d.data() as any;
        // Don't show if deleted/archived by admin
        if (!data.deletedByAdmin) {
          activeConvo = { ...data, id: d.id };
        }
      });
      callback(activeConvo);
    },
    (err) => {
      console.warn('subscribeToVisitorActiveConversation warning:', err.message);
      callback(null);
    }
  );
}

// 5. Admin: Listen to All Friend Requests
export function subscribeToAllFriendRequests(
  callback: (requests: FriendRequest[]) => void
) {
  const reqCol = collection(db, 'friendRequests');
  return onSnapshot(
    reqCol,
    (snapshot) => {
      const list: FriendRequest[] = [];
      snapshot.forEach(d => list.push({ id: d.id, ...d.data() } as FriendRequest));
      list.sort((a, b) => {
        const tA = a.createdAt?.toMillis ? a.createdAt.toMillis() : new Date(a.createdAt || 0).getTime();
        const tB = b.createdAt?.toMillis ? b.createdAt.toMillis() : new Date(b.createdAt || 0).getTime();
        return tB - tA;
      });
      callback(list);
    },
    (err) => {
      console.warn('subscribeToAllFriendRequests error:', err.message);
      callback([]);
    }
  );
}

// 6. Admin Action: Accept Friend Request -> Creates friendship doc + conversation doc
export async function acceptFriendRequest(
  request: FriendRequest,
  adminUid: string
): Promise<string> {
  const adminId = adminUid || ADMIN_UID;
  const visitorId = request.senderId;

  // 1. Update friend request status to accepted
  const reqRef = doc(db, 'friendRequests', request.id);
  await updateDoc(reqRef, { status: 'accepted' });

  // 2. Create friendship document
  const friendshipCol = collection(db, 'friendships');
  const friendshipDoc = await addDoc(friendshipCol, {
    participants: [adminId, visitorId],
    adminEmail: ADMIN_EMAIL,
    visitorId,
    createdAt: serverTimestamp(),
    status: 'friends'
  });

  // 3. Check if conversation doc already exists or create new
  const convsCol = collection(db, 'conversations');
  const existingQ = query(convsCol, where('participants', 'array-contains', visitorId));
  const existingSnap = await getDocs(existingQ);

  let convoId = '';
  if (!existingSnap.empty) {
    const d = existingSnap.docs[0];
    convoId = d.id;
    await updateDoc(doc(db, 'conversations', convoId), {
      friendshipId: friendshipDoc.id,
      deletedByAdmin: false,
      lastMessage: 'You are now friends - Say hello',
      lastMessageTime: serverTimestamp()
    });
  } else {
    const newConvo = await addDoc(convsCol, {
      participants: [adminId, visitorId],
      participantNames: {
        [adminId]: 'Elon Musk',
        [visitorId]: request.senderName || 'Guest'
      },
      adminEmail: ADMIN_EMAIL,
      friendshipId: friendshipDoc.id,
      lastMessage: 'You are now friends - Say hello',
      lastMessageTime: serverTimestamp(),
      createdAt: serverTimestamp(),
      deletedByAdmin: false,
      unreadForAdmin: 0,
      unreadForVisitor: 1,
      isTypingForAdmin: false,
      isTypingForVisitor: false
    });
    convoId = newConvo.id;

    // Send initial greeting message in conversation messages
    const messagesCol = collection(db, 'conversations', convoId, 'messages');
    await addDoc(messagesCol, {
      conversationId: convoId,
      senderId: adminId,
      senderEmail: ADMIN_EMAIL,
      text: 'You are now friends - Say hello',
      timestamp: serverTimestamp(),
      read: false,
      isReal: true,
      delivered: true
    });
  }

  return convoId;
}

// 7. Admin Action: Decline Friend Request
export async function declineFriendRequest(requestId: string): Promise<void> {
  const reqRef = doc(db, 'friendRequests', requestId);
  await updateDoc(reqRef, { status: 'declined' });
}

// 8. Admin: Listen to Accepted Chats (conversations where deletedByAdmin is false or all)
export function subscribeToAdminChats(
  callback: (conversations: RealConversation[]) => void
) {
  const convsCol = collection(db, 'conversations');
  return onSnapshot(
    convsCol,
    (snapshot) => {
      const list: RealConversation[] = [];
      snapshot.forEach(d => list.push({ id: d.id, ...d.data() } as RealConversation));
      list.sort((a, b) => {
        const tA = a.lastMessageTime?.toMillis ? a.lastMessageTime.toMillis() : new Date(a.lastMessageTime || a.createdAt || 0).getTime();
        const tB = b.lastMessageTime?.toMillis ? b.lastMessageTime.toMillis() : new Date(b.lastMessageTime || b.createdAt || 0).getTime();
        return tB - tA;
      });
      callback(list);
    },
    (err) => {
      console.warn('subscribeToAdminChats error:', err.message);
      callback([]);
    }
  );
}

// 9. Real-Time Messages Subscription (conversations/{convoId}/messages)
export function subscribeToChatMessages(
  conversationId: string,
  callback: (messages: RealChatMessage[]) => void
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
      const msgs: RealChatMessage[] = [];
      snapshot.forEach((d) => {
        const data = d.data() as any;
        msgs.push({
          id: d.id,
          conversationId,
          senderId: data.senderId || '',
          senderEmail: data.senderEmail || null,
          text: data.text || '',
          timestamp: data.timestamp || data.createdAt || new Date().toISOString(),
          read: Boolean(data.read),
          isReal: true,
          delivered: data.delivered !== false
        });
      });
      callback(msgs);
    },
    (err) => {
      console.warn('subscribeToChatMessages warning, using unordered fallback:', err.message);
      const fallbackUnsub = onSnapshot(msgsCol, (snapshot) => {
        const msgs: RealChatMessage[] = [];
        snapshot.forEach((d) => {
          const data = d.data() as any;
          msgs.push({
            id: d.id,
            conversationId,
            senderId: data.senderId || '',
            senderEmail: data.senderEmail || null,
            text: data.text || '',
            timestamp: data.timestamp || data.createdAt || 0,
            read: Boolean(data.read),
            isReal: true,
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

// 10. Send Real Human Message (No bots, no fake auto-replies)
export async function sendChatMessage(
  conversationId: string,
  senderId: string,
  text: string,
  isAdmin: boolean,
  senderEmail?: string | null
): Promise<string> {
  const clean = text.trim();
  if (!clean || !conversationId) return '';

  const msgsCol = collection(db, 'conversations', conversationId, 'messages');
  const convRef = doc(db, 'conversations', conversationId);

  // Add message to subcollection
  const msgDoc = await addDoc(msgsCol, {
    conversationId,
    senderId,
    senderEmail: isAdmin ? ADMIN_EMAIL : (senderEmail || null),
    text: clean,
    timestamp: serverTimestamp(),
    read: false,
    isReal: true,
    delivered: true
  });

  // Update conversation parent document
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
    await setDoc(convRef, updateData, { merge: true });
  });

  return msgDoc.id;
}

// 11. Mark Messages as Read
export async function markChatAsRead(
  conversationId: string,
  readerIsAdmin: boolean
) {
  if (!conversationId) return;
  const convRef = doc(db, 'conversations', conversationId);
  try {
    await updateDoc(convRef, {
      [readerIsAdmin ? 'unreadForAdmin' : 'unreadForVisitor']: 0
    });
  } catch (err) {}

  try {
    const msgsCol = collection(db, 'conversations', conversationId, 'messages');
    const q = query(msgsCol, where('read', '==', false));
    const snap = await getDocs(q);
    const batch = writeBatch(db);
    let count = 0;
    snap.forEach((d) => {
      const data = d.data();
      if (readerIsAdmin ? data.senderId !== ADMIN_UID : (data.senderEmail === ADMIN_EMAIL || data.senderId === ADMIN_UID)) {
        batch.update(d.ref, { read: true });
        count++;
      }
    });
    if (count > 0) {
      await batch.commit();
    }
  } catch (err) {}
}

// 12. Toggle Typing Indicator
export async function setChatTyping(
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

// 13. DELETE RULE - ONLY ADMIN (Soft delete + 30-day archive)
export async function adminDeleteConversation(
  conversationId: string,
  currentUserEmail: string | null | undefined
): Promise<void> {
  if (currentUserEmail?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    throw new Error('Unauthorized: Only elonmuskspace241@gmail.com can delete conversations.');
  }

  const convRef = doc(db, 'conversations', conversationId);
  // Set deletedByAdmin = true, but keep data for 30 days in archive (do not hard delete immediately)
  await updateDoc(convRef, {
    deletedByAdmin: true,
    archivedAt: serverTimestamp()
  });
}
