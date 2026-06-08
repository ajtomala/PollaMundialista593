import { format, formatDistanceToNow, isPast, subMinutes } from 'date-fns'
import { es } from 'date-fns/locale'

export const AVATAR_COLORS = [
  '#003DA5', '#C8102E', '#059669', '#7C3AED',
  '#B45309', '#0891B2', '#BE123C', '#4B5563',
]

export function getInitials(name: string) {
  return name.split(' ').map(w => w[0] || '').join('').toUpperCase().slice(0, 2) || '??'
}

export function getAvatarColor(uid: string) {
  const idx = uid.charCodeAt(uid.length - 1) % AVATAR_COLORS.length
  return AVATAR_COLORS[idx]
}

export function getWinner(h: number, a: number): 'H' | 'A' | 'D' {
  return h > a ? 'H' : a > h ? 'A' : 'D'
}

export function calcPredictionPoints(
  predH: number, predA: number,
  realH: number, realA: number
): number {
  if (predH === realH && predA === realA) return 3
  if (getWinner(predH, predA) === getWinner(realH, realA)) return 2
  return 0
}

export function isMatchLocked(scheduledAt: Date): boolean {
  // Lock 30 min before kickoff
  return isPast(subMinutes(new Date(scheduledAt), 30))
}

export function formatMatchDate(date: Date): string {
  return format(new Date(date), "d 'de' MMM · HH:mm", { locale: es })
}

export function formatRelative(date: Date): string {
  return formatDistanceToNow(new Date(date), { locale: es, addSuffix: true })
}

export function genGroupCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXY3456789'
  return Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export function buildWhatsAppMessage(params: {
  name: string
  rank: number
  total: number
  points: number
  exact: number
  winners: number
  champion?: string
  groupCode: string
}): string {
  const { name, rank, total, points, exact, winners, champion, groupCode } = params
  const champLine = champion ? `\n🏆 Mi campeón: *${champion}*` : ''
  return (
    `⚽ *PollaGol – Mundial 2026* 🏆\n\n` +
    `📍 *${name}* — Puesto #${rank} de ${total}\n` +
    `⭐ *${points} puntos* acumulados\n` +
    `🎯 ${exact} resultados exactos\n` +
    `✅ ${winners} ganadores correctos${champLine}\n\n` +
    `¡Únete a mi grupo con el código *${groupCode}*!\n` +
    `👉 ¿Te atreves a ganarme?`
  )
}
