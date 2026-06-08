import { initializeApp } from 'firebase/app'
import { getAuth, signInAnonymously, onAuthStateChanged, type User as FBUser } from 'firebase/auth'
import {
  getFirestore, collection, doc, getDoc, setDoc, updateDoc,
  onSnapshot, query, where, orderBy, serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore'

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
}

export const app  = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db   = getFirestore(app)

// ─── Auth helpers ─────────────────────────────────────
export const signInAnon = () => signInAnonymously(auth)
export const onAuth = (cb: (user: FBUser | null) => void) => onAuthStateChanged(auth, cb)

// ─── Firestore refs ───────────────────────────────────
export const refs = {
  users:       () => collection(db, 'users'),
  user:        (uid: string) => doc(db, 'users', uid),
  groups:      () => collection(db, 'groups'),
  group:       (code: string) => doc(db, 'groups', code),
  matches:     () => collection(db, 'matches'),
  match:       (id: string) => doc(db, 'matches', id),
  predictions: () => collection(db, 'predictions'),
  prediction:  (uid: string, matchId: string) => doc(db, 'predictions', `${uid}_${matchId}`),
  leaderboard: (groupCode: string) => doc(db, 'leaderboards', groupCode),
}

// ─── Re-exports ───────────────────────────────────────
export {
  getDoc, setDoc, updateDoc, onSnapshot,
  query, where, orderBy, serverTimestamp,
  type Unsubscribe,
}
