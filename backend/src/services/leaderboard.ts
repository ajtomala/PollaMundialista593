import { db } from '../config/firebase'
import admin from 'firebase-admin'

function getWinner(h: number, a: number) {
  return h > a ? 'H' : a > h ? 'A' : 'D'
}

function calcPoints(predH: number, predA: number, realH: number, realA: number): number {
  if (predH === realH && predA === realA) return 3
  if (getWinner(predH, predA) === getWinner(realH, realA)) return 2
  return 0
}

// ─── Recalculate leaderboard for a group ──────────────
export async function recalculateLeaderboard(groupCode: string): Promise<void> {
  console.log(`📊 Recalculating leaderboard for group ${groupCode}`)

  // 1. Get group members
  const groupSnap = await db.collection('groups').doc(groupCode).get()
  if (!groupSnap.exists) throw new Error(`Group ${groupCode} not found`)
  const group = groupSnap.data()!
  const members: Array<{ uid: string; displayName: string; avatarColor: string }> = group.members || []

  // 2. Get all finished matches
  const matchesSnap = await db.collection('matches').where('status', '==', 'finished').get()
  const finishedMatchIds = matchesSnap.docs.map(d => d.id)
  const matchResults: Record<string, { homeGoals: number; awayGoals: number }> = {}
  matchesSnap.docs.forEach(d => {
    const data = d.data()
    if (data.result) matchResults[d.id] = data.result
  })

  // 3. Get all predictions for this group
  const predsSnap = await db.collection('predictions')
    .where('groupCode', '==', groupCode)
    .get()

  // Group predictions by uid
  const predsByUid: Record<string, Record<string, { homeGoals: number; awayGoals: number }>> = {}
  predsSnap.docs.forEach(d => {
    const p = d.data()
    if (!predsByUid[p.uid]) predsByUid[p.uid] = {}
    predsByUid[p.uid][p.matchId] = { homeGoals: p.homeGoals, awayGoals: p.awayGoals }
  })

  // 4. Calculate scores per member
  const entries = members.map((member, i) => {
    const myPreds = predsByUid[member.uid] || {}
    let totalPoints = 0, exactResults = 0, correctWinners = 0

    finishedMatchIds.forEach(matchId => {
      const pred = myPreds[matchId]
      const result = matchResults[matchId]
      if (!pred || !result) return
      const pts = calcPoints(pred.homeGoals, pred.awayGoals, result.homeGoals, result.awayGoals)
      totalPoints += pts
      if (pts === 3) exactResults++
      else if (pts === 2) correctWinners++
    })

    // Bonus: champion & scorer (from user profile)
    // These are added separately when the tournament ends

    return {
      uid: member.uid,
      displayName: member.displayName,
      avatarColor: member.avatarColor,
      totalPoints,
      exactResults,
      correctWinners,
      rank: 0, // will be set after sort
    }
  })

  // 5. Sort and assign ranks
  entries.sort((a, b) => b.totalPoints - a.totalPoints || b.exactResults - a.exactResults)
  entries.forEach((e, i) => { e.rank = i + 1 })

  // 6. Write leaderboard document (real-time listeners on frontend will pick this up)
  await db.collection('leaderboards').doc(groupCode).set({
    groupCode,
    entries,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  })

  // 7. Update points on each prediction document
  const batch = db.batch()
  predsSnap.docs.forEach(d => {
    const p = d.data()
    const result = matchResults[p.matchId]
    if (!result) return
    const pts = calcPoints(p.homeGoals, p.awayGoals, result.homeGoals, result.awayGoals)
    batch.update(d.ref, { points: pts })
  })
  await batch.commit()

  console.log(`✅ Leaderboard updated for group ${groupCode} — ${entries.length} players`)
}

// ─── Recalculate ALL groups (called by cron) ──────────
export async function recalculateAllLeaderboards(): Promise<void> {
  const groupsSnap = await db.collection('groups').get()
  await Promise.all(groupsSnap.docs.map(d => recalculateLeaderboard(d.id)))
}
