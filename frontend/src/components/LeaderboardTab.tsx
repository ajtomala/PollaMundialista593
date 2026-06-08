// ─── LeaderboardTab.tsx ───────────────────────────────
import { useStore } from '@/store'
import { getInitials, getAvatarColor } from '@/utils'

export default function LeaderboardTab() {
  const { leaderboard, firebaseUid, group } = useStore()
  const medals = ['🥇','🥈','🥉']

  return (
    <div className="px-4 pt-4 pb-6">
      <h2 className="font-display text-[22px] font-bold tracking-wide mb-3">
        🏆 <span className="text-ec-blue">Posiciones</span>
      </h2>
      <div className="bg-white rounded-[18px] border border-gray-100 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-ec-blue px-4 py-3 flex justify-between items-center">
          <span className="font-display text-lg font-bold text-white tracking-wide">
            Grupo {group?.code}
          </span>
          <span className="text-white/50 text-xs font-bold">{leaderboard.length} jugadores</span>
        </div>
        {/* Column headers */}
        <div className="grid grid-cols-[36px_1fr_32px_32px_48px] gap-2 px-4 py-2 bg-gray-50 border-b border-gray-100">
          {['#','Jugador','🎯','✅','Pts'].map(h => (
            <span key={h} className="text-[10px] font-black text-gray-400 uppercase tracking-wide text-center first:text-left [&:nth-child(2)]:text-left">{h}</span>
          ))}
        </div>
        {/* Rows */}
        {leaderboard.length === 0 && (
          <div className="text-center py-10 text-gray-400 font-bold">Sin datos aún</div>
        )}
        {leaderboard.map((entry, i) => {
          const isMe = entry.uid === firebaseUid
          return (
            <div
              key={entry.uid}
              className={`grid grid-cols-[36px_1fr_32px_32px_48px] gap-2 items-center px-4 py-3 border-b border-gray-50 last:border-0 ${isMe ? 'bg-blue-50' : 'hover:bg-gray-50'} transition-colors`}
            >
              <div className={`font-display text-xl font-bold text-center ${i===0?'text-amber-400':i===1?'text-gray-400':i===2?'text-amber-700':'text-gray-300'}`}>
                {i < 3 ? medals[i] : i+1}
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-display text-[13px] font-bold text-white flex-shrink-0"
                     style={{ background: getAvatarColor(entry.uid) }}>
                  {getInitials(entry.displayName)}
                </div>
                <div className="min-w-0">
                  <span className="text-[13px] font-black text-gray-800 truncate block">
                    {entry.displayName}
                    {isMe && <span className="ml-1 text-[10px] bg-ec-blue text-white px-1.5 py-0.5 rounded font-black">TÚ</span>}
                  </span>
                </div>
              </div>
              <div className="font-display text-lg font-bold text-gray-500 text-center">{entry.exactResults}</div>
              <div className="font-display text-lg font-bold text-gray-500 text-center">{entry.correctWinners}</div>
              <div className="font-display text-[22px] font-black text-ec-blue text-right">{entry.totalPoints}</div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-2">
        {[
          { cls:'bg-green-100 text-green-800', label:'🎯 +3 Exacto' },
          { cls:'bg-amber-100 text-amber-800', label:'✅ +2 Ganador' },
          { cls:'bg-red-100 text-red-800', label:'❌ +0 Falla' },
        ].map(b => (
          <span key={b.label} className={`text-[11px] font-black px-3 py-1.5 rounded-full ${b.cls}`}>{b.label}</span>
        ))}
      </div>
    </div>
  )
}
