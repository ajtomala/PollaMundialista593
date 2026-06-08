// controllers/groups.ts
import { Response } from 'express'
import { AuthRequest } from '../middleware/auth'
import { db } from '../config/firebase'
import admin from 'firebase-admin'
import { z } from 'zod'

const AVATAR_COLORS = ['#003DA5','#C8102E','#059669','#7C3AED','#B45309','#0891B2']

function genCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXY3456789'
  return Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export async function createGroup(req: AuthRequest, res: Response) {
  const schema = z.object({ name: z.string().min(2).max(40), displayName: z.string().min(1).max(20) })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Datos inválidos', details: parsed.error.flatten() })

  const { name, displayName } = parsed.data
  const uid = req.uid!

  // Generate unique code
  let code = genCode()
  let exists = true
  while (exists) {
    const snap = await db.collection('groups').doc(code).get()
    if (!snap.exists) { exists = false } else { code = genCode() }
  }

  const avatarColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]
  const member = { uid, displayName, avatarColor, joinedAt: admin.firestore.FieldValue.serverTimestamp() }

  const group = {
    code, name, creatorUid: uid,
    members: [member],
    maxMembers: 20,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  }

  await db.collection('groups').doc(code).set(group)
  await db.collection('users').doc(uid).set(
    { uid, displayName, groupCode: code, avatarColor, createdAt: admin.firestore.FieldValue.serverTimestamp() },
    { merge: true }
  )

  return res.status(201).json({ group: { ...group, createdAt: new Date() }, user: { uid } })
}

export async function joinGroup(req: AuthRequest, res: Response) {
  const schema = z.object({ displayName: z.string().min(1).max(20) })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Datos inválidos' })

  const { code } = req.params
  const { displayName } = parsed.data
  const uid = req.uid!

  const groupRef = db.collection('groups').doc(code.toUpperCase())
  const groupSnap = await groupRef.get()
  if (!groupSnap.exists) return res.status(404).json({ error: 'Grupo no encontrado. Verifica el código.' })

  const groupData = groupSnap.data()!
  const members: any[] = groupData.members || []

  if (members.length >= groupData.maxMembers)
    return res.status(409).json({ error: `El grupo está lleno (máx. ${groupData.maxMembers} jugadores).` })

  if (members.some(m => m.uid === uid)) {
    // Already a member — just return the group
    return res.json({ group: groupData })
  }

  const avatarColor = AVATAR_COLORS[members.length % AVATAR_COLORS.length]
  const newMember = { uid, displayName, avatarColor, joinedAt: admin.firestore.FieldValue.serverTimestamp() }

  await groupRef.update({ members: admin.firestore.FieldValue.arrayUnion(newMember) })
  await db.collection('users').doc(uid).set(
    { uid, displayName, groupCode: code.toUpperCase(), avatarColor, updatedAt: admin.firestore.FieldValue.serverTimestamp() },
    { merge: true }
  )

  return res.json({ group: { ...groupData, members: [...members, newMember] } })
}

export async function getGroup(req: AuthRequest, res: Response) {
  const snap = await db.collection('groups').doc(req.params.code.toUpperCase()).get()
  if (!snap.exists) return res.status(404).json({ error: 'Grupo no encontrado' })
  return res.json(snap.data())
}

export async function leaveGroup(req: AuthRequest, res: Response) {
  const uid = req.uid!
  const { code } = req.params
  const groupRef = db.collection('groups').doc(code.toUpperCase())
  const snap = await groupRef.get()
  if (!snap.exists) return res.status(404).json({ error: 'Grupo no encontrado' })

  const members: any[] = snap.data()!.members || []
  const updated = members.filter(m => m.uid !== uid)
  await groupRef.update({ members: updated })
  await db.collection('users').doc(uid).update({ groupCode: admin.firestore.FieldValue.delete() })
  return res.json({ ok: true })
}
