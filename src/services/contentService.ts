import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  updateDoc, 
  onSnapshot, 
  query, 
  where,
  writeBatch
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, auth } from '../lib/firebase';
import { ContentItem, SavedItem, WatchlistRecord } from '../types';
import { INITIAL_CONTENT_ITEMS } from '../data/seedData';

const ITEMS_COLLECTION = 'items';
const SAVED_COLLECTION = 'saved_items';
const WATCHLIST_COLLECTION = 'watchlists';

// Subscribe to published items (or all items if admin)
export function subscribeToItems(
  isAdmin: boolean,
  callback: (items: ContentItem[]) => void,
  onError?: (err: Error) => void
) {
  try {
    const colRef = collection(db, ITEMS_COLLECTION);
    // If not admin, query only published items
    const q = isAdmin ? colRef : query(colRef, where('isPublished', '==', true));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          // If Firestore is still empty, initialize with default seed items
          callback(INITIAL_CONTENT_ITEMS);
          return;
        }
        const items: ContentItem[] = [];
        snapshot.forEach((docSnap) => {
          items.push({ id: docSnap.id, ...docSnap.data() } as ContentItem);
        });
        callback(items);
      },
      (error) => {
        console.warn('Items listener warning:', error.message);
        // Fallback to local verified seed items so the app is always resilient
        callback(INITIAL_CONTENT_ITEMS);
        if (onError) onError(error);
      }
    );

    return unsubscribe;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, ITEMS_COLLECTION);
    return () => {};
  }
}

// Seed initial items if database is empty (called by Admin or auto on first boot)
export async function seedInitialContentIfEmpty(): Promise<boolean> {
  try {
    const snap = await getDocs(collection(db, ITEMS_COLLECTION));
    if (snap.empty) {
      console.log('Seeding initial content catalogue into Firestore...');
      const batch = writeBatch(db);
      for (const item of INITIAL_CONTENT_ITEMS) {
        const itemRef = doc(db, ITEMS_COLLECTION, item.id);
        batch.set(itemRef, item);
      }
      await batch.commit();
      return true;
    }
    return false;
  } catch (err) {
    console.warn('Notice: Firestore seeding skipped or using seed memory buffer', err);
    return false;
  }
}

// Create new item
export async function createContentItem(item: Omit<ContentItem, 'id' | 'createdAt'>): Promise<string> {
  const id = `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const fullItem: ContentItem = {
    ...item,
    id,
    authorUid: auth.currentUser?.uid || 'admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  try {
    await setDoc(doc(db, ITEMS_COLLECTION, id), fullItem);
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${ITEMS_COLLECTION}/${id}`);
    return id;
  }
}

// Update existing item
export async function updateContentItem(id: string, updates: Partial<ContentItem>): Promise<void> {
  try {
    await updateDoc(doc(db, ITEMS_COLLECTION, id), {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${ITEMS_COLLECTION}/${id}`);
  }
}

// Delete item
export async function deleteContentItem(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, ITEMS_COLLECTION, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${ITEMS_COLLECTION}/${id}`);
  }
}

// Toggle publish
export async function togglePublishItem(id: string, currentStatus: boolean): Promise<void> {
  return updateContentItem(id, { isPublished: !currentStatus });
}

// Toggle featured
export async function toggleFeaturedItem(id: string, currentFeatured: boolean): Promise<void> {
  return updateContentItem(id, { isFeatured: !currentFeatured });
}

// SAVED ITEMS

export function subscribeToSavedItems(
  userId: string,
  callback: (saved: SavedItem[]) => void
) {
  try {
    const q = query(collection(db, SAVED_COLLECTION), where('userId', '==', userId));
    return onSnapshot(
      q,
      (snapshot) => {
        const list: SavedItem[] = [];
        snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as SavedItem));
        callback(list);
      },
      (err) => {
        console.warn('Saved items listener:', err);
      }
    );
  } catch (error) {
    return () => {};
  }
}

export async function toggleSaveItem(item: ContentItem, userId: string, isSaved: boolean): Promise<void> {
  const docId = `saved_${userId}_${item.id}`;
  try {
    if (isSaved) {
      await deleteDoc(doc(db, SAVED_COLLECTION, docId));
    } else {
      const savedDoc: SavedItem = {
        id: docId,
        userId,
        itemId: item.id,
        title: item.title,
        sectionId: item.sectionId,
        category: item.category,
        imageUrl: item.images[0] || '',
        price: item.price,
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, SAVED_COLLECTION, docId), savedDoc);
    }
  } catch (error) {
    handleFirestoreError(error, isSaved ? OperationType.DELETE : OperationType.CREATE, `${SAVED_COLLECTION}/${docId}`);
  }
}

// WATCHLIST ITEMS

export function subscribeToWatchlist(
  userId: string,
  callback: (watchlist: WatchlistRecord[]) => void
) {
  try {
    const q = query(collection(db, WATCHLIST_COLLECTION), where('userId', '==', userId));
    return onSnapshot(
      q,
      (snapshot) => {
        const list: WatchlistRecord[] = [];
        snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as WatchlistRecord));
        callback(list);
      },
      (err) => {
        console.warn('Watchlist listener:', err);
      }
    );
  } catch (error) {
    return () => {};
  }
}

export async function addWatchlistItem(userId: string, ticker: string, companyName: string, notes?: string, targetPrice?: string): Promise<string> {
  const id = `watch_${userId}_${ticker.replace(/[^a-zA-Z0-9]/g, '')}_${Date.now()}`;
  try {
    await setDoc(doc(db, WATCHLIST_COLLECTION, id), {
      id,
      userId,
      ticker,
      companyName,
      targetPrice: targetPrice || '',
      notes: notes || '',
      createdAt: new Date().toISOString()
    });
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${WATCHLIST_COLLECTION}/${id}`);
    return id;
  }
}

export async function removeWatchlistItem(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, WATCHLIST_COLLECTION, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${WATCHLIST_COLLECTION}/${id}`);
  }
}
