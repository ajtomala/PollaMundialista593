import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Group, Match, Prediction, LeaderboardEntry, TabName } from '@/types'

interface AppState {
  // Auth
  user: User | null
  firebaseUid: string | null
  setUser: (user: User | null) => void
  setFirebaseUid: (uid: string | null) => void

  // Group
  group: Group | null
  setGroup: (group: Group | null) => void

  // Matches (from backend/Firestore)
  matches: Match[]
  setMatches: (matches: Match[]) => void

  // My predictions (keyed by matchId)
  predictions: Record<string, Prediction>
  setPrediction: (matchId: string, pred: Prediction) => void
  setPredictions: (preds: Prediction[]) => void

  // Leaderboard
  leaderboard: LeaderboardEntry[]
  setLeaderboard: (lb: LeaderboardEntry[]) => void

  // UI
  activeTab: TabName
  setActiveTab: (tab: TabName) => void
  isLoading: boolean
  setLoading: (v: boolean) => void
  toastMsg: string | null
  showToast: (msg: string) => void
  hideToast: () => void
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      firebaseUid: null,
      setUser: (user) => set({ user }),
      setFirebaseUid: (uid) => set({ firebaseUid: uid }),

      group: null,
      setGroup: (group) => set({ group }),

      matches: [],
      setMatches: (matches) => set({ matches }),

      predictions: {},
      setPrediction: (matchId, pred) =>
        set((s) => ({ predictions: { ...s.predictions, [matchId]: pred } })),
      setPredictions: (preds) =>
        set({ predictions: Object.fromEntries(preds.map(p => [p.matchId, p])) }),

      leaderboard: [],
      setLeaderboard: (leaderboard) => set({ leaderboard }),

      activeTab: 'matches',
      setActiveTab: (activeTab) => set({ activeTab }),
      isLoading: false,
      setLoading: (isLoading) => set({ isLoading }),
      toastMsg: null,
      showToast: (toastMsg) => set({ toastMsg }),
      hideToast: () => set({ toastMsg: null }),
    }),
    {
      name: 'pollagol-store',
      // Only persist lightweight data; real-time data refreshes on mount
      partialize: (s) => ({
        user: s.user,
        firebaseUid: s.firebaseUid,
        group: s.group,
        predictions: s.predictions,
      }),
    }
  )
)
