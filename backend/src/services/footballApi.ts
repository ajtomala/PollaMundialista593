import axios from 'axios'
import { db } from '../config/firebase'
import admin from 'firebase-admin'

const apiFootball = axios.create({
  baseURL: process.env.API_FOOTBALL_BASE || 'https://v3.football.api-sports.io',
  headers: { 'x-apisports-key': process.env.API_FOOTBALL_KEY! },
  timeout: 15000,
})

const LEAGUE_ID = parseInt(process.env.WORLD_CUP_LEAGUE_ID || '1')
const SEASON    = parseInt(process.env.WORLD_CUP_SEASON    || '2026')

// ─── Flag emoji map (extend as needed) ────────────────
const FLAG_MAP: Record<string, string> = {
  'Ecuador': '🇪🇨', 'Brazil': '🇧🇷', 'Argentina': '🇦🇷', 'France': '🇫🇷',
  'Germany': '🇩🇪', 'Spain': '🇪🇸', 'Portugal': '🇵🇹', 'Mexico': '🇲🇽',
  'USA': '🇺🇸', 'Netherlands': '🇳🇱', 'Japan': '🇯🇵', 'Senegal': '🇸🇳',
  'Croatia': '🇭🇷', 'Uruguay': '🇺🇾', 'Costa Rica': '🇨🇷', 'Poland': '🇵🇱',
  'Saudi Arabia': '🇸🇦', 'Australia': '🇦🇺', 'Serbia': '🇷🇸', 'Ghana': '🇬🇭',
  'Morocco': '🇲🇦', 'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Wales': '🏴󠁧󠁢󠁷󠁬󠁳󠁿', 'Switzerland': '🇨🇭',
  'Belgium': '🇧🇪', 'Denmark': '🇩🇰', 'South Korea': '🇰🇷', 'Canada': '🇨🇦',
}

function getFlag(teamName: string): string {
  return FLAG_MAP[teamName] || '🏳'
}

function mapStatus(apiStatus: string): 'upcoming' | 'live' | 'finished' {
  if (['NS','TBD','PST','CANC','ABD','AWD','WO'].includes(apiStatus)) return 'upcoming'
  if (['FT','AET','PEN','WO'].includes(apiStatus)) return 'finished'
  return 'live' // 1H, HT, 2H, ET, P, BT, INT
}

// ─── Sync all fixtures from API-Football → Firestore ──
export async function syncMatchesFromAPI(): Promise<number> {
  console.log('🔄 Syncing matches from API-Football...')
  const res = await apiFootball.get('/fixtures', {
    params: { league: LEAGUE_ID, season: SEASON },
  })

  const fixtures = res.data?.response || []
  const batch = db.batch()
  let count = 0

  for (const f of fixtures) {
    const { fixture, teams, goals, league } = f
    const status = mapStatus(fixture.status.short)

    const matchData = {
      id: String(fixture.id),
      homeTeam: {
        id: teams.home.id,
        name: teams.home.name,
        flag: getFlag(teams.home.name),
        logo: teams.home.logo,
      },
      awayTeam: {
        id: teams.away.id,
        name: teams.away.name,
        flag: getFlag(teams.away.name),
        logo: teams.away.logo,
      },
      scheduledAt: admin.firestore.Timestamp.fromDate(new Date(fixture.date)),
      status,
      round: league.round || 'Group Stage',
      group: f.league?.group || 'Group',
      ...(status === 'finished' && goals.home !== null ? {
        result: {
          homeGoals: goals.home,
          awayGoals: goals.away,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }
      } : {}),
      syncedAt: admin.firestore.FieldValue.serverTimestamp(),
    }

    const ref = db.collection('matches').doc(String(fixture.id))
    batch.set(ref, matchData, { merge: true })
    count++
  }

  await batch.commit()
  console.log(`✅ Synced ${count} matches to Firestore`)
  return count
}

// ─── Update only results for live/recent matches ───────
export async function syncLiveResults(): Promise<void> {
  const res = await apiFootball.get('/fixtures', {
    params: { league: LEAGUE_ID, season: SEASON, live: 'all' },
  })
  const fixtures = res.data?.response || []
  if (fixtures.length === 0) return

  const batch = db.batch()
  for (const f of fixtures) {
    const { fixture, goals } = f
    const status = mapStatus(fixture.status.short)
    const ref = db.collection('matches').doc(String(fixture.id))
    batch.update(ref, {
      status,
      ...(goals.home !== null ? {
        'result.homeGoals': goals.home,
        'result.awayGoals': goals.away,
        'result.updatedAt': admin.firestore.FieldValue.serverTimestamp(),
      } : {}),
    })
  }
  await batch.commit()
  console.log(`🔴 Updated ${fixtures.length} live matches`)
}
