import { Router } from 'express'
import { requireAuth, requireAdmin } from '../middleware/auth'
import { createGroup, joinGroup, getGroup, leaveGroup } from '../controllers/groups'
import {
  savePrediction, getMyPredictions,
  getMatches, syncMatches,
  getLeaderboard, triggerRecalculate,
  updateChampion, updateScorer,
} from '../controllers/index'

const router = Router()

// ─── Health ───────────────────────────────────────────
router.get('/health', (_, res) => res.json({ status: 'ok', ts: new Date().toISOString() }))

// ─── Groups ───────────────────────────────────────────
router.post  ('/groups',            requireAuth, createGroup)
router.post  ('/groups/:code/join', requireAuth, joinGroup)
router.get   ('/groups/:code',      requireAuth, getGroup)
router.delete('/groups/:code/leave',requireAuth, leaveGroup)

// ─── Matches ──────────────────────────────────────────
router.get ('/matches',      requireAuth, getMatches)
router.post('/matches/sync', requireAuth, requireAdmin, syncMatches)  // admin only

// ─── Predictions ─────────────────────────────────────
router.post('/predictions', requireAuth, savePrediction)
router.get ('/predictions', requireAuth, getMyPredictions)

// ─── Leaderboard ─────────────────────────────────────
router.get ('/leaderboard/:groupCode',              requireAuth, getLeaderboard)
router.post('/leaderboard/:groupCode/recalculate',  requireAuth, requireAdmin, triggerRecalculate)

// ─── User extras ─────────────────────────────────────
router.put('/me/champion', requireAuth, updateChampion)
router.put('/me/scorer',   requireAuth, updateScorer)

export default router
