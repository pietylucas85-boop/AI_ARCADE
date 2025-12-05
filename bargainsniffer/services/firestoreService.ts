
import { db } from './firebase';
import { doc, setDoc, deleteDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { ItemModel } from '../types';

export const addToWatchlist = async (userId: string, item: ItemModel) => {
  try {
    const watchRef = doc(db, 'users', userId, 'watchlist', item.id);
    await setDoc(watchRef, {
      ...item,
      addedAt: new Date().toISOString(),
      targetPrice: item.price // Default trigger for price drop alert
    });
    return true;
  } catch (e) {
    console.error("Error adding to watchlist", e);
    return false;
  }
};

export const removeFromWatchlist = async (userId: string, itemId: string) => {
  try {
    await deleteDoc(doc(db, 'users', userId, 'watchlist', itemId));
    return true;
  } catch (e) {
    console.error("Error removing from watchlist", e);
    return false;
  }
};

export const getWatchlist = async (userId: string): Promise<ItemModel[]> => {
  try {
    const q = collection(db, 'users', userId, 'watchlist');
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as ItemModel);
  } catch (e) {
    console.error("Error fetching watchlist", e);
    return [];
  }
};
