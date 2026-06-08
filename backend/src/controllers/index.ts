// controllers/predictions.ts
import { Response } from 'express'
import { AuthRequest } from '../middleware/auth'
import { db } from '../config/firebase'
import admin from 'firebase-admin'
import { z } from 'zod'

export async function savePrediction(req: AuthRequest, res: Response) {
  const schema = z.object({
    matchId:   z.string().min(1),
    homeGoals: z.number().int().min(0).max(20),
    awayGoals: z.number().int().min(0).max(20),
    groupCode: z.string().length(4),
  })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Datos inválidos', details: parsed.error.flatten() })

  const { matchId, homeGoals, awayGoals, groupCode } = parsed.data
  const uid = req.uid!

  // Check match is not locked (status === 'upcoming' and ≥30min before kickoff)
  const matchSnap = await db.collection('matches').doc(matchId).get()
  if (!matchSnap.exists) return res.status(404).json({ error: 'Partido no encontrado' })

  const match = matchSnap.data()!
  if (match.status !== 'upcoming') return res.status(409).json({ error: 'Pronósticos cerrados para este partido.' })

  const kickoff = match.scheduledAt.toDate()
  const now = new Date()
  const diffMin = (kickoff.getTime() - now.getTime()) / 60000
  if (diffMin < 30) return res.status(409).json({ error: 'Pronósticos cierran 30 minutos antes del partido.' })

  const predId = `${uid}_${matchId}`
  const predData = {
    id: predId, uid, groupCode, matchId,
    homeGoals, awayGoals,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  }

  const ref = db.collection('predictions').doc(predId)
  const existing = await ref.get()
  if (!existing.exists) Object.assign(predData, { createdAt: admin.firestore.FieldValue.serverTimestamp() })

  await ref.set(predData, { merge: true })
  return res.json({ ...predData, updatedAt: new Date() })
}

export async function getMyPredictions(req: AuthRequest, res: Response) {
  const { groupCode } = req.query
  if (!groupCode) return res.status(400).json({ error: 'groupCode requerido' })

  const snap = await db.collection('predictions')
    .where('uid', '==', req.uid!)
    .where('groupCode', '==', groupCode)
    .get()

  const preds = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  return res.json(preds)
}

// controllers/matches.ts
import { syncMatchesFromAPI } from '../services/footballApi'

export async function getMatches(req: AuthRequest, res: Response) {
  const snap = await db.collection('matches')
    .orderBy('scheduledAt', 'asc')
    .get()
  const matches = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  return res.json(matches)
}

export async function syncMatches(req: AuthRequest, res: Response) {
  try {
    const synced = await syncMatchesFromAPI()
    return res.json({ synced, message: `${synced} partidos sincronizados` })
  } catch (e: any) {
    console.error('Sync error:', e.message)
    return res.status(500).json({ error: 'Error al sincronizar partidos', detail: e.message })
  }
}

// controllers/leaderboard.ts
import { recalculateLeaderboard } from '../services/leaderboard'

export async function getLeaderboard(req: AuthRequest, res: Response) {
  const { groupCode } = req.params
  const snap = await db.collection('leaderboards').doc(groupCode).get()
  if (!snap.exists) return res.json([])
  return res.json(snap.data()?.entries || [])
}

export async function triggerRecalculate(req: AuthRequest, res: Response) {
  const { groupCode } = req.params
  try {
    await recalculateLeaderboard(groupCode)
    return res.json({ ok: true })
  } catch (e: any) {
    return res.status(500).json({ error: e.message })
  }
}

// controllers/user.ts
export async function updateChampion(req: AuthRequest, res: Response) {
  const { champion, groupCode } = req.body
  if (!champion) return res.status(400).json({ error: 'champion requerido' })
  await db.collection('users').doc(req.uid!).set(
    { champion, groupCode, updatedAt: admin.firestore.FieldValue.serverTimestamp() },
    { merge: true }
  )
  return res.json({ ok: true })
}

export async function updateScorer(req: AuthRequest, res: Response) {
  const { topScorer, groupCode } = req.body
  if (!topScorer) return res.status(400).json({ error: 'topScorer requerido' })
  await db.collection('users').doc(req.uid!).set(
    { topScorer, groupCode, updatedAt: admin.firestore.FieldValue.serverTimestamp() },
    { merge: true }
  )
  return res.json({ ok: true })
}
