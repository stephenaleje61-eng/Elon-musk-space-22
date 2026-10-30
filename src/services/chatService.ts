import { 
  collection, 
  doc, 
  getDoc, 
  getDocs,
  setDoc, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, auth, ADMIN_EMAIL } from '../lib/firebase';
import { JoinRequestItem, PrivateChatItem, RealMessage } from '../types';

const LOCAL_STORAGE_KEY = 'elon_real_human_chat_v1';

// Helper to get local backup
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

// Helper to save local backup
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

// 1. fbAddRequest
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

  // 1. Local backup
  const currentLocal = getLocalChatBackup();
  currentLocal.joinRequests[requestId] = requestData;
  saveLocalChatBackup({ joinRequests: currentLocal.joinRequests });

  // 2. Firestore write
  try {
    const reqRef = doc(db, 'joinRequests', requestId);
    await setDoc(reqRef, requestData);
    return requestId;
  } catch (error) {
    console.warn('Firestore add joinRequest failed, saved locally:', error);
    return requestId;
  }
}

// 2. fbAccept
export async function fbAccept(
  requestId: string,
  visitorId: string,
  name: string,
  loc: string,
  initialMsg: string
): Promise<void> {
  const time = new Date().toISOString();

  // 1. Update join request status to accepted
  try {
    const reqRef = doc(db, 'joinRequests', requestId);
    await setDoc(reqRef, { status: 'accepted' }, { merge: true });
  } catch (err) {
    console.warn('Failed to update join request status:', err);
  }

  // 2. Create privateChats/{visitorId}
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

    // 3. Preserve the original request message as the first conversation message
    // Check if initial message already exists
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

  // Local backup update
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

// Decline request
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

// 3. fbSendMsg
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

  // Local backup
  const local = getLocalChatBackup();
  if (!local.messages[visitorId]) local.messages[visitorId] = [];
  local.messages[visitorId].push(messageData);
  if (local.privateChats[visitorId]) {
    local.privateChats[visitorId].lastMsg = text.trim();
    local.privateChats[visitorId].lastTime = time;
  }
  saveLocalChatBackup(local);

  // Firestore update
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

// 4. fbListenRequests
export function fbListenRequests(
  callback: (requests: JoinRequestItem[]) => void
) {
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
        console.warn('JoinRequests listener notice:', error.message);
        // Fallback to local storage
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

// Listen to visitor's specific join request
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
        console.warn('Visitor request listener notice:', error.message);
        const local = getLocalChatBackup();
        const found = Object.values(local.joinRequests).find(r => r.visitorId === visitorId);
        callback(found || null);
      }
    );
  } catch (err) {
    return () => {};
  }
}

// 5. fbListenMessages
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

        // Update local backup
        const local = getLocalChatBackup();
        local.messages[visitorId] = msgs;
        saveLocalChatBackup(local);
      },
      (error) => {
        console.warn('Messages listener notice:', error.message);
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

// 6. fbListenActiveChats
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
        console.warn('Active chats listener notice:', error.message);
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

// 7. EXPORT ALL CHATS
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
    console.warn('Firestore export failed, falling back to local storage cache:', err);
    const local = getLocalChatBackup();
    Object.values(local.privateChats).forEach(chat => {
      backupData.conversations.push({
        chat,
        messages: local.messages[chat.visitorId] || []
      });
    });
    backupData.totalChats = backupData.conversations.length;
  }

  // Trigger JSON download
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
