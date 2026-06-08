// hooks/index.ts — all custom hooks

import { useEffect, useCallback, useRef } from 'react'
import { onAuth, signInAnon, db, refs, onSnapshot, query, where, orderBy } from '@/services/firebase'
import { matchesApi, predictionsApi, leaderboardApi } from '@/services/api'
import { useStore } from '@/store'
import type { Match, Prediction, LeaderboardEntry } from '@/types'

// ─── useAuth ─────────────────────────────────────────
// Signs in anonymously if no user; loads user profile from Firestore
export function useAuth() {
  const { setFirebaseUid, setUser, firebaseUid } = useStore()

  useEffect(() => {
    const unsub = onAuth(async (fbUser) => {
      if (fbUser) {
        setFirebaseUid(fbUser.uid)
        // Load user profile from Firestore
        const snap = await import('@/services/firebase').then(m => m.getDoc(refs.user(fbUser.uid)))
        if (snap.exists()) setUser(snap.data() as any)
      } else {
        // Auto sign-in anonymously
        await signInAnon()
      }
    })
    return () => unsub()
  }, [])

  return { firebaseUid }
}

// ─── useMatches ──────────────────────────────────────
// Real-time listener on Firestore matches collection (synced by backend cron)
export function useMatches() {
  const { setMatches } = useStore()

  useEffect(() => {
    const q = query(refs.matches(), orderBy('scheduledAt', 'asc'))
    const unsub = onSnapshot(q, (snap) => {
      const matches = snap.docs.map(d => ({ id: d.id, ...d.data() } as Match))
      setMatches(matches)
    })
    return () => unsub()
  }, [])
}

// ─── useMyPredictions ────────────────────────────────
// Real-time listener on predictions for current user in this group
export function useMyPredictions(groupCode: string | undefined) {
  const { firebaseUid, setPredictions } = useStore()

  useEffect(() => {
    if (!firebaseUid || !groupCode) return
    const q = query(
      refs.predictions(),
      where('uid', '==', firebaseUid),
      where('groupCode', '==', groupCode)
    )
    const unsub = onSnapshot(q, (snap) => {
      const preds = snap.docs.map(d => ({ id: d.id, ...d.data() } as Prediction))
      setPredictions(preds)
    })
    return () => unsub()
  }, [firebaseUid, groupCode])
}

// ─── useLeaderboard ──────────────────────────────────
// Real-time listener on leaderboard document (recalculated by backend)
export function useLeaderboard(groupCode: string | undefined) {
  const { setLeaderboard } = useStore()

  useEffect(() => {
    if (!groupCode) return
    const unsub = onSnapshot(refs.leaderboard(groupCode), (snap) => {
      if (snap.exists()) {
        const data = snap.data()
        setLeaderboard((data.entries || []) as LeaderboardEntry[])
      }
    })
    return () => unsub()
  }, [groupCode])
}

// ─── useToast ────────────────────────────────────────
export function useToast() {
  const { showToast, hideToast } = useStore()
  const timer = useRef<ReturnType<typeof setTimeout>>()

  const toast = useCallback((msg: string) => {
    showToast(msg)
    clearTimeout(timer.current)
    timer.current = setTimeout(hideToast, 3000)
  }, [showToast, hideToast])

  return { toast }
}

// ─── usePoints ───────────────────────────────────────
export function usePoints() {
  const { matches, predictions } = useStore()

  const calcPoints = useCallback(() => {
    let total = 0, exact = 0, winners = 0
    matches.forEach(m => {
      if (m.status !== 'finished' || !m.result) return
      const pred = predictions[m.id]
      if (!pred) return
      const { homeGoals: rh, awayGoals: ra } = m.result
      if (pred.homeGoals === rh && pred.awayGoals === ra) { total += 3; exact++ }
      else if (getWinner(pred.homeGoals, pred.awayGoals) === getWinner(rh, ra)) { total += 2; winners++ }
    })
    return { total, exact, winners }
  }, [matches, predictions])

  return { calcPoints }
}

function getWinner(h: number, a: number) {
  return h > a ? 'H' : a > h ? 'A' : 'D'
}
