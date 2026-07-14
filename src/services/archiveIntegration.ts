import { User, onAuthStateChanged, sendPasswordResetEmail, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { auth, db, isFirebaseConfigured, storage } from '../firebase/client';
import { Group, Note } from '../types';

export interface MemoCloudState {
  darkMode: boolean;
  groups: Group[];
  notes: Note[];
  profileImage: string;
}

export function subscribeArchiveAccount(onUser: (user: User | null) => void) {
  if (!auth) return () => undefined;
  return onAuthStateChanged(auth, onUser);
}

export async function loginArchiveAccount(email: string, password: string) {
  if (!auth) throw new Error('Firebase 설정이 없습니다.');
  await signInWithEmailAndPassword(auth, email.trim(), password);
}

export async function logoutArchiveAccount() {
  if (auth) await signOut(auth);
}

export async function resetArchivePassword(email: string) {
  if (!auth) throw new Error('Firebase 설정이 없습니다.');
  await sendPasswordResetEmail(auth, email.trim());
}

function stateDoc(userId: string) {
  if (!db) throw new Error('Firestore 설정이 없습니다.');
  return doc(db, 'users', userId, 'apps', 'personalMemo');
}

export async function loadMemoCloudState(userId: string): Promise<Partial<MemoCloudState> | null> {
  if (!isFirebaseConfigured) return null;
  const snapshot = await getDoc(stateDoc(userId));
  return snapshot.exists() ? snapshot.data() as Partial<MemoCloudState> : null;
}

export async function saveMemoCloudState(userId: string, state: MemoCloudState) {
  if (!isFirebaseConfigured) return;
  await setDoc(stateDoc(userId), { ...state, updatedAt: serverTimestamp() }, { merge: true });
}

export async function uploadMemoImage(userId: string, file: File) {
  if (!storage) throw new Error('Storage 설정이 없습니다.');
  const safeName = file.name.replace(/[^\w.\-가-힣 ]/g, '_');
  const storageRef = ref(storage, `users/${userId}/personalMemo/images/${crypto.randomUUID()}_${safeName}`);
  await uploadBytes(storageRef, file, { contentType: file.type || 'application/octet-stream' });
  return getDownloadURL(storageRef);
}

export async function uploadMemoProfileImage(userId: string, file: File) {
  if (!storage) throw new Error('Storage 설정이 없습니다.');
  const safeName = file.name.replace(/[^\w.\-가-힣 ]/g, '_');
  const storageRef = ref(storage, `users/${userId}/personalMemo/profile/${crypto.randomUUID()}_${safeName}`);
  await uploadBytes(storageRef, file, { contentType: file.type || 'application/octet-stream' });
  return getDownloadURL(storageRef);
}
