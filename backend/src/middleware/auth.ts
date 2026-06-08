import { Request, Response, NextFunction } from 'express'
import { auth } from '../config/firebase'

export interface AuthRequest extends Request {
  uid?: string
  isAdmin?: boolean
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No autorizado. Token requerido.' })
  }
  const token = authHeader.split('Bearer ')[1]
  try {
    const decoded = await auth.verifyIdToken(token)
    req.uid = decoded.uid
    req.isAdmin = decoded.uid === process.env.ADMIN_UID
    next()
  } catch {
    return res.status(401).json({ error: 'Token inválido o expirado.' })
  }
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.isAdmin) return res.status(403).json({ error: 'Acceso denegado. Solo administradores.' })
  next()
}
