import axios from 'axios'
import { auth } from './firebase'
import type { Group, Match, Prediction, LeaderboardEntry } from '@/types'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  timeout: 10000,
})

// Attach Firebase ID token to every request
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser
  if (user) {
    const token = await user.getIdToken()
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ─── Groups ───────────────────────────────────────────
export const groupsApi = {
  create: (name: string, displayName: string): Promise<{ group: Group; user: { uid: string } }> =>
    api.post('/groups', { name, displayName }).then(r => r.data),

  join: (code: string, displayName: string): Promise<{ group: Group }> =>
    api.post(`/groups/${code}/join`, { displayName }).then(r => r.data),

  get: (code: string): Promise<Group> =>
    api.get(`/groups/${code}`).then(r => r.data),

  leave: (code: string): Promise<void> =>
    api.delete(`/groups/${code}/leave`).then(r => r.data),
}

// ─── Matches ──────────────────────────────────────────
export const matchesApi = {
  // Returns matches from Firestore (synced from API-Football by backend cron)
  list: (): Promise<Match[]> =>
    api.get('/matches').then(r => r.data),

  // Manually trigger sync (admin only)
  sync: (): Promise<{ synced: number }> =>
    api.post('/matches/sync').then(r => r.data),
}

// ─── Predictions ─────────────────────────────────────
export const predictionsApi = {
  save: (matchId: string, homeGoals: number, awayGoals: number, groupCode: string): Promise<Prediction> =>
    api.post('/predictions', { matchId, homeGoals, awayGoals, groupCode }).then(r => r.data),

  myPredictions: (groupCode: string): Promise<Prediction[]> =>
    api.get(`/predictions?groupCode=${groupCode}`).then(r => r.data),
}

// ─── Leaderboard ─────────────────────────────────────
export const leaderboardApi = {
  get: (groupCode: string): Promise<LeaderboardEntry[]> =>
    api.get(`/leaderboard/${groupCode}`).then(r => r.data),

  // Recalculate scores (called by backend cron after results update)
  recalculate: (groupCode: string): Promise<void> =>
    api.post(`/leaderboard/${groupCode}/recalculate`).then(r => r.data),
}

// ─── Champion & Scorer ────────────────────────────────
export const extrasApi = {
  saveChampion: (champion: string, groupCode: string): Promise<void> =>
    api.put('/me/champion', { champion, groupCode }).then(r => r.data),

  saveScorer: (topScorer: string, groupCode: string): Promise<void> =>
    api.put('/me/scorer', { topScorer, groupCode }).then(r => r.data),
}

export default api
