import { useStore } from '@/store'
import { usePoints } from '@/hooks'
import { buildWhatsAppMessage } from '@/utils'

export default function ShareTab() {
  const { user, group, leaderboard, firebaseUid } = useStore()
  const { calcPoints } = usePoints()
  const { total, exact, winners } = calcPoints()
  const rank = (leaderboard.findIndex(e => e.uid === firebaseUid) + 1) || 1
  const totalMembers = leaderboard.length || 1

  const waMsg = buildWhatsAppMessage({
    name: user?.displayName || '',
    rank, total: totalMembers, points: total,
    exact, winners,
    champion: user?.champion,
    groupCode: group?.code || '',
  })

  const shareWA = () => window.open('https://wa.me/?text=' + encodeURIComponent(waMsg), '_blank')
  const copyMsg = () => navigator.clipboard.writeText(waMsg).then(() => alert('📋 Mensaje copiado'))
  const copyCode = () => navigator.clipboard.writeText(group?.code || '').then(() => alert('🔗 Código copiado'))

  return (
    <div className="px-4 pt-4 pb-6 space-y-4">
      <h2 className="font-display text-[22px] font-bold tracking-wide">
        📤 <span className="text-ec-blue">Compartir</span>
      </h2>

      {/* Invite box */}
      <div className="bg-green-50 border border-green-200 rounded-[18px] p-4">
        <div className="text-[11px] font-black text-green-700 uppercase tracking-wide mb-2">🔗 Código de invitación</div>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-white border border-green-200 rounded-xl px-4 py-2.5 font-display text-2xl font-black text-ec-blue tracking-[4px]">
            {group?.code || '––'}
          </div>
          <button
            onClick={copyCode}
            className="bg-green-600 text-white font-black text-sm px-4 py-2.5 rounded-xl hover:bg-green-700 transition active:scale-95"
          >
            Copiar 🔗
          </button>
        </div>
        <p className="text-xs text-green-700 font-semibold mt-2 leading-relaxed">
          Comparte este código. Solo quienes lo ingresen verán tu polla. Máximo 20 jugadores.
        </p>
      </div>

      {/* Share poster */}
      <div className="bg-ec-blue rounded-[18px] overflow-hidden">
        <div className="h-1.5 bg-ec-yellow" />
        <div className="p-5 text-center relative overflow-hidden">
          <div className="absolute top-[-20px] right-[-20px] text-[140px] opacity-[0.05] select-none rotate-12">⚽</div>
          <div className="text-[13px] text-white/40 font-black uppercase tracking-[3px] mb-1">PollaGol · Mundial 2026</div>
          <div className="font-display text-[80px] font-black text-ec-yellow leading-none" style={{textShadow:'0 4px 0 rgba(0,0,0,0.2)'}}>
            #{rank}
          </div>
          <div className="font-display text-[26px] font-bold text-white mt-1">{user?.displayName?.toUpperCase()}</div>
          <div className="text-white/70 text-sm font-bold mt-1">{total} puntos acumulados</div>
          <div className="text-white/40 text-xs mt-1">{exact} exactos · {winners} ganadores</div>
          <div className="mt-3 text-2xl">🇪🇨⚽🏆</div>
        </div>
        <div className="h-1.5 bg-ec-red" />
      </div>

      {/* WA preview */}
      <div className="bg-white border border-gray-100 rounded-[18px] p-4 shadow-sm">
        <div className="text-[11px] font-black text-gray-400 uppercase tracking-wide mb-3">Vista previa WhatsApp</div>
        <div className="bg-[#DCF8C6] rounded-xl rounded-tl-none p-3.5">
          <p className="text-[13px] text-gray-800 leading-relaxed whitespace-pre-wrap">{waMsg.replace(/\*/g, '')}</p>
        </div>
      </div>

      {/* CTA buttons */}
      <div className="space-y-3">
        <button
          onClick={shareWA}
          className="w-full flex items-center justify-center gap-3 bg-[#25D366] text-white font-display text-xl font-bold py-4 rounded-[14px] hover:bg-[#1da34a] transition active:scale-[0.98]"
          style={{ boxShadow: '0 4px 0 #1aa352' }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Compartir en WhatsApp
        </button>
        <button
          onClick={copyMsg}
          className="w-full flex items-center justify-center gap-2 bg-white text-gray-700 font-display text-lg font-bold py-3.5 rounded-[14px] border-2 border-gray-200 hover:bg-gray-50 transition active:scale-[0.98]"
        >
          📋 Copiar mensaje
        </button>
      </div>
    </div>
  )
}
