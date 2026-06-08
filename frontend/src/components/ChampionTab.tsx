import { useState } from 'react'
import { extrasApi } from '@/services/api'
import { useStore } from '@/store'
import { useToast } from '@/hooks'

const TEAMS = [
  {f:'🇧🇷',n:'Brasil'},{f:'🇦🇷',n:'Argentina'},{f:'🇫🇷',n:'Francia'},
  {f:'🇩🇪',n:'Alemania'},{f:'🇪🇸',n:'España'},{f:'🇵🇹',n:'Portugal'},
  {f:'🇲🇽',n:'México'},{f:'🇺🇸',n:'EE.UU'},{f:'🇪🇨',n:'Ecuador'},
  {f:'🇳🇱',n:'Holanda'},{f:'🇯🇵',n:'Japón'},{f:'🇸🇳',n:'Senegal'},
  {f:'🇭🇷',n:'Croacia'},{f:'🇺🇾',n:'Uruguay'},{f:'🇨🇷',n:'Costa Rica'},
]

export default function ChampionTab() {
  const { user, group, setUser } = useStore()
  const { toast } = useToast()
  const [selectedChamp, setSelectedChamp] = useState(user?.champion || '')
  const [scorer, setScorer] = useState(user?.topScorer || '')
  const [saving, setSaving] = useState(false)

  const saveChampion = async () => {
    if (!selectedChamp) { toast('⚠️ Selecciona un equipo'); return }
    setSaving(true)
    try {
      await extrasApi.saveChampion(selectedChamp, group!.code)
      setUser({ ...user!, champion: selectedChamp })
      toast('🏆 Campeón guardado: ' + selectedChamp)
    } catch { toast('❌ Error al guardar') }
    finally { setSaving(false) }
  }

  const saveScorer = async () => {
    if (!scorer.trim()) { toast('⚠️ Escribe el nombre del jugador'); return }
    setSaving(true)
    try {
      await extrasApi.saveScorer(scorer.trim(), group!.code)
      setUser({ ...user!, topScorer: scorer.trim() })
      toast('⚽ Goleador guardado: ' + scorer)
    } catch { toast('❌ Error al guardar') }
    finally { setSaving(false) }
  }

  return (
    <div className="px-4 pt-4 pb-6 space-y-4">
      <h2 className="font-display text-[22px] font-bold tracking-wide">
        👑 <span className="text-ec-blue">Apuestas Extra</span>
      </h2>

      {/* Champion picker */}
      <div className="bg-white rounded-[18px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
          <span className="text-2xl">🏆</span>
          <div>
            <div className="font-black text-[15px] text-gray-800">Campeón del Mundial</div>
            <div className="text-xs text-gray-400 font-bold">¿Quién levantará la copa?</div>
          </div>
          <span className="ml-auto bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-black px-2.5 py-1 rounded-full">⭐ +20 pts</span>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-4 gap-2 mb-4">
            {TEAMS.map(t => (
              <button
                key={t.n}
                onClick={() => setSelectedChamp(t.n)}
                className={`border-2 rounded-xl p-2.5 text-center transition-all active:scale-95 ${
                  selectedChamp === t.n
                    ? 'border-ec-yellow bg-amber-50 shadow-[0_0_0_3px_rgba(255,209,0,0.2)]'
                    : 'border-gray-200 bg-white hover:border-ec-blue hover:bg-blue-50'
                }`}
              >
                <span className="text-2xl block mb-1">{t.f}</span>
                <span className="text-[9px] font-black text-gray-500 uppercase tracking-wide leading-tight block">{t.n}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-sm text-gray-500 font-bold">
              Elegiste: <strong className="text-ec-blue">{user?.champion || selectedChamp || 'Ninguno'}</strong>
            </span>
            <button
              onClick={saveChampion}
              disabled={saving}
              className="bg-ec-blue text-white font-display font-bold text-base px-4 py-2.5 rounded-xl flex items-center gap-1.5 hover:bg-ec-blue-dark active:scale-95 transition disabled:opacity-60"
            >
              💾 Guardar
            </button>
          </div>
        </div>
      </div>

      {/* Top scorer */}
      <div className="bg-white rounded-[18px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
          <span className="text-2xl">⚽</span>
          <div>
            <div className="font-black text-[15px] text-gray-800">Goleador del Torneo</div>
            <div className="text-xs text-gray-400 font-bold">¿Quién será el máximo artillero?</div>
          </div>
          <span className="ml-auto bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-black px-2.5 py-1 rounded-full">⭐ +10 pts</span>
        </div>
        <div className="p-4">
          <input
            type="text"
            value={scorer}
            onChange={e => setScorer(e.target.value)}
            placeholder="Nombre del jugador..."
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 font-bold text-[15px] outline-none focus:border-ec-blue focus:shadow-[0_0_0_3px_rgba(0,61,165,0.12)] transition mb-3"
          />
          <div className="flex justify-end">
            <button
              onClick={saveScorer}
              disabled={saving}
              className="bg-ec-blue text-white font-display font-bold text-base px-4 py-2.5 rounded-xl flex items-center gap-1.5 hover:bg-ec-blue-dark active:scale-95 transition disabled:opacity-60"
            >
              💾 Guardar
            </button>
          </div>
        </div>
      </div>

      {/* Rules summary */}
      <div className="bg-white rounded-[18px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
          <span className="text-2xl">📋</span>
          <div className="font-black text-[15px] text-gray-800">Sistema de Puntos</div>
        </div>
        {[
          { pts:'3', title:'Resultado exacto', desc:'Aciertas el marcador exacto. Ej: dices 2-1 y termina 2-1.' },
          { pts:'2', title:'Ganador correcto', desc:'Aciertas quién gana o si hay empate, aunque el marcador difiera.' },
          { pts:'0', title:'Pronóstico fallido', desc:'No aciertas ni el ganador ni el marcador. Sin puntos.' },
          { pts:'20', title:'Campeón correcto', desc:'Si el equipo que elegiste gana el Mundial, ¡20 puntos extra!' },
          { pts:'10', title:'Goleador correcto', desc:'Aciertas el máximo goleador del torneo.' },
        ].map((r,i,arr) => (
          <div key={r.pts} className={`flex items-start gap-3 px-4 py-3.5 ${i<arr.length-1?'border-b border-gray-50':''}`}>
            <div className="bg-ec-yellow text-ec-blue-dark font-display text-xl font-black min-w-[46px] text-center py-1 px-2 rounded-lg flex-shrink-0" style={{boxShadow:'0 3px 0 #C9A400'}}>
              {r.pts}
            </div>
            <div>
              <strong className="text-[14px] font-black text-gray-800 block">{r.title}</strong>
              <p className="text-[12px] text-gray-500 mt-0.5 leading-relaxed">{r.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
