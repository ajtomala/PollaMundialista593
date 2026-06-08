// components/HeroCard.tsx
import { useStore } from '@/store'
import { usePoints } from '@/hooks'
import { getInitials, getAvatarColor } from '@/utils'

export function HeroCard() {
  const { user, group, leaderboard, firebaseUid, matches, predictions } = useStore()
  const { calcPoints } = usePoints()
  const { total, exact, winners } = calcPoints()

  const myRank = leaderboard.findIndex(e => e.uid === firebaseUid) + 1 || '–'
  const totalMembers = leaderboard.length || group?.members.length || 1

  const openMatches = matches.filter(m => m.status === 'upcoming').length
  const donePreds = matches.filter(m => m.status === 'upcoming' && predictions[m.id]).length
  const progPct = openMatches > 0 ? Math.round(donePreds / openMatches * 100) : 0

  const initials = getInitials(user?.displayName || '')
  const avColor = getAvatarColor(firebaseUid || '')

  return (
    <div className="bg-ec-blue px-4 pt-2 pb-4">
      <div className="bg-white/10 border border-white/20 rounded-[18px] p-4 relative overflow-hidden">
        <div className="absolute top-[-10px] right-[-10px] text-[80px] opacity-[0.06] select-none pointer-events-none rotate-12">⚽</div>
        <div className="flex items-center gap-3 relative z-10">
          {/* Points */}
          <div className="font-display text-[56px] font-black text-ec-yellow leading-none flex-shrink-0"
               style={{ textShadow: '0 3px 0 rgba(0,0,0,0.2)' }}>
            {total}
          </div>
          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="text-white font-black text-base truncate">{user?.displayName || 'Jugador'}</div>
            <div className="text-white/55 text-[12px] font-bold mt-0.5">
              Posición #{myRank} de {totalMembers}
            </div>
            <div className="flex gap-2 mt-2 flex-wrap">
              <span className="hero-badge">🎯 {exact} exactos</span>
              <span className="hero-badge">✅ {winners} ganadores</span>
            </div>
            <div className="mt-2">
              <div className="text-white/40 text-[11px] font-bold mb-1">{donePreds}/{openMatches} pronósticos</div>
              <div className="h-1.5 bg-white/15 rounded-full overflow-hidden">
                <div
                  className="h-full bg-ec-yellow rounded-full transition-all duration-500"
                  style={{ width: `${progPct}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// components/BottomNav.tsx
import { useStore } from '@/store'
import type { TabName } from '@/types'

const TABS: { id: TabName; icon: string; label: string }[] = [
  { id: 'matches',   icon: '⚽', label: 'Partidos'  },
  { id: 'table',     icon: '🏆', label: 'Tabla'     },
  { id: 'champion',  icon: '👑', label: 'Campeón'   },
  { id: 'share',     icon: '📤', label: 'Compartir' },
]

export function BottomNav() {
  const { activeTab, setActiveTab } = useStore()
  return (
    <nav className="bg-white border-t border-gray-100 flex safe-b shadow-[0_-4px_20px_rgba(0,0,0,0.08)] sticky bottom-0 z-50">
      {TABS.map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex-1 flex flex-col items-center justify-center py-2.5 pb-3 relative transition-all ${
            activeTab === tab.id ? 'text-ec-blue' : 'text-gray-400'
          }`}
        >
          {activeTab === tab.id && (
            <div className="absolute top-0 left-[20%] right-[20%] h-[3px] bg-ec-yellow rounded-b-full" />
          )}
          <span className="text-xl leading-none">{tab.icon}</span>
          <span className={`text-[10px] font-black mt-1 tracking-wide uppercase ${
            activeTab === tab.id ? 'text-ec-blue' : 'text-gray-400'
          }`}>{tab.label}</span>
        </button>
      ))}
    </nav>
  )
}

// components/Toast.tsx
import { useEffect } from 'react'
export function Toast() {
  const { toastMsg, hideToast } = useStore()
  useEffect(() => {
    if (toastMsg) {
      const t = setTimeout(hideToast, 3000)
      return () => clearTimeout(t)
    }
  }, [toastMsg])

  return (
    <div className={`fixed bottom-20 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-5 py-3 rounded-full text-sm font-bold shadow-xl z-[999] transition-all duration-300 whitespace-nowrap pointer-events-none ${
      toastMsg ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
    }`}>
      {toastMsg}
    </div>
  )
}

// components/AppHeader.tsx
import { useState } from 'react'
import { Users, X } from 'lucide-react'
export function AppHeader() {
  const { user, group } = useStore()
  const [showModal, setShowModal] = useState(false)
  const initials = getInitials(user?.displayName || '')

  return (
    <>
      <header className="bg-ec-blue sticky top-0 z-50">
        <div className="h-1 bg-ec-yellow" />
        <div className="flex items-center justify-between px-4 py-2.5 gap-3">
          <h1 className="font-display text-[26px] font-black text-ec-yellow tracking-wide leading-none">
            Polla<span className="text-white/80">Gol</span>
          </h1>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-2xl px-3 py-1.5"
          >
            <Users size={14} className="text-white/60" />
            <div>
              <div className="font-display text-[15px] font-bold text-ec-yellow tracking-[2px] leading-none">
                {group?.code || '––'}
              </div>
              <div className="text-[10px] text-white/50 font-bold uppercase tracking-wide leading-none mt-0.5">
                {group?.members.length || 0} jugadores
              </div>
            </div>
          </button>
          <div className="w-9 h-9 rounded-full flex items-center justify-center font-display font-bold text-sm text-white border-2 border-white/30 flex-shrink-0"
               style={{ background: getAvatarColor(user?.uid || '') }}>
            {initials}
          </div>
        </div>
      </header>

      {/* Group info sheet */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-[200] flex items-end justify-center" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-t-[20px] w-full max-w-md p-5 animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="w-9 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
            <div className="flex justify-between items-start mb-4">
              <h2 className="font-display text-xl font-bold tracking-wide">Tu Grupo</h2>
              <button onClick={() => setShowModal(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 mb-3 flex items-center gap-3">
              <span className="text-2xl">🔑</span>
              <div>
                <div className="text-[11px] text-gray-400 font-bold uppercase tracking-wide mb-0.5">Código del grupo</div>
                <div className="font-display text-2xl font-bold tracking-[4px] text-ec-blue">{group?.code}</div>
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(group?.code || '')}
                className="ml-auto bg-green-500 text-white font-bold text-sm px-3 py-2 rounded-lg"
              >
                Copiar
              </button>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800 font-semibold leading-relaxed">
              💡 Comparte este código con tus amigos. Solo quienes lo ingresen verán tu polla.
            </div>
          </div>
        </div>
      )}
    </>
  )
}
