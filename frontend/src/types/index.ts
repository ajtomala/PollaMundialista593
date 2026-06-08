// ─── User & Auth ─────────────────────────────────────
export interface User {
  uid: string
  displayName: string
  groupCode: string
  champion?: string
  topScorer?: string
  createdAt: Date
}

// ─── Group ───────────────────────────────────────────
export interface Group {
  code: string            // ej: "RK7A"
  name: string            // ej: "Polla Oficina"
  creatorUid: string
  members: GroupMember[]
  maxMembers: number      // default 20
  createdAt: Date
}

export interface GroupMember {
  uid: string
  displayName: string
  avatarColor: string
  joinedAt: Date
}

// ─── Match ───────────────────────────────────────────
export interface Match {
  id: string              // API-Football fixture id
  homeTeam: Team
  awayTeam: Team
  scheduledAt: Date
  status: 'upcoming' | 'live' | 'finished'
  round: string           // "Group Stage - 1"
  group: string           // "Group A"
  result?: MatchResult
}

export interface Team {
  id: number
  name: string
  flag: string            // emoji flag
  logo?: string           // URL from API
}

export interface MatchResult {
  homeGoals: number
  awayGoals: number
  updatedAt: Date
}

// ─── Prediction ──────────────────────────────────────
export interface Prediction {
  id?: string
  uid: string
  groupCode: string
  matchId: string
  homeGoals: number
  awayGoals: number
  points?: number         // null until match finished
  createdAt: Date
  updatedAt: Date
}

// ─── Leaderboard ─────────────────────────────────────
export interface LeaderboardEntry {
  uid: string
  displayName: string
  avatarColor: string
  totalPoints: number
  exactResults: number
  correctWinners: number
  rank: number
  prevRank?: number
}

// ─── API responses ───────────────────────────────────
export interface ApiResponse<T> {
  data: T
  error?: string
}

export type TabName = 'matches' | 'table' | 'champion' | 'share'
