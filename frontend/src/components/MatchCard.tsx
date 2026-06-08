import { useState } from 'react'
import { Minus, Plus, Save, Lock } from 'lucide-react'
import { predictionsApi } from '@/services/api'
import { useStore } from '@/store'
import { useToast } from '@/hooks'
import { calcPredictionPoints, isMatchLocked, formatMatchDate, getWinner } from '@/utils'
import type { Match } from '@/types'

interface Props { match: Match }

const STATUS_COLORS = {
  upcoming: 'bg-ec-blue',
  live:     'bg-green-500',
  finished: 'bg-gray-300',
}

export default function MatchCard({ match }: Props) {
  const { predictions, group, firebaseUid, setPrediction } = useStore()
  const { toast } = useToast()
  const pred = predictions[match.id]
  const locked = match.status !== 'upcoming' || isMatchLocked(match.scheduledAt)
  const played = match.status === 'finished' && !!match.result

  const [homeInput, setHomeInput] = useState(pred?.homeGoals ?? '')
  const [awayInput, setAwayInput] = useState(pred?.awayGoals ?? '')
  const [saving, setSaving] = useState(false)

  const step = (setter: typeof setHomeInput, delta: number) => {
    setter(prev => Math.max(0, Math.min(20, (Number(prev) || 0) + delta)))
  }

  const handleSave = async () => {
    const h = Number(homeInput), a = Number(awayInput)
    if (isNaN(h) || isNaN(a) || homeInput === '' || awayInput === '') {
      toast('⚠️ Ingresa el marcador completo'); return
    }
    if (!group?.code) { toast('❌ No estás en un grupo'); return }
    setSaving(true)
    try {
      const saved = await predictionsApi.save(match.id, h, a, group.code)
      setPrediction(match.id, saved)
      toast('✅ ¡Pronóstico guardado!')
    } catch {
      toast('❌ Error al guardar. Intenta de nuevo.')
    } finally { setSaving(false) }
  }

  // Points chip
  let chip = null
  if (played && pred && match.result) {
    const pts = calcPredictionPoints(pred.homeGoals, pred.awayGoals, match.result.homeGoals, match.result.awayGoals)
    if (pts === 3) chip = <span className="result-chip exact">🎯 +3 Exacto</span>
    else if (pts === 2) chip = <span className="result-chip win">✅ +2 Ganador</span>
    else chip = <span className="result-chip miss">❌ +0 Falla</span>
  } else if (match.status === 'live') {
    chip = <span className="result-chip live animate-pulse-soft">🔴 EN VIVO</span>
  } else if (locked) {
    chip = <span className="result-chip locked">🔒 Cerrado</span>
  } else {
    chip = <span className="result-chip open">🟢 Abierto</span>
  }

  const topBarColor = played
    ? (pred && match.result && calcPredictionPoints(pred.homeGoals, pred.awayGoals, match.result.homeGoals, match.result.awayGoals) === 3
        ? 'bg-green-500' : pred && match.result && calcPredictionPoints(pred.homeGoals, pred.awayGoals, match.result.homeGoals, match.result.awayGoals) === 2
        ? 'bg-amber-400' : 'bg-red-400')
    : match.status === 'live' ? 'bg-green-500'
    : locked ? 'bg-gray-200' : 'bg-ec-blue'

  return (
    <div className="bg-white rounded-[18px] overflow-hidden shadow-sm border border-gray-100">
      {/* Top accent bar */}
      <div className={`h-1 ${topBarColor}`} />

      {/* Meta */}
      <div className="flex justify-between items-center px-4 pt-3 pb-0">
        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
          📅 {formatMatchDate(match.scheduledAt)}
        </span>
        <span className="text-[10px] font-black bg-blue-50 text-ec-blue px-2 py-1 rounded-md uppercase tracking-wide">
          {match.group}
        </span>
      </div>

      {/* Teams & Inputs */}
      <div className="grid grid-cols-[1fr_80px_1fr] items-center gap-2 px-4 py-4">
        {/* Home */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-4xl leading-none">{match.homeTeam.flag}</span>
          <span className="text-[12px] font-black text-gray-800 text-center leading-tight">{match.homeTeam.name}</span>
        </div>

        {/* Score / Inputs */}
        <div className="flex flex-col items-center gap-1">
          {!locked ? (
            <div className="flex items-center gap-1">
              <Stepper value={homeInput} onChange={setHomeInput} step={step} />
              <span className="font-display text-2xl font-bold text-gray-300 mx-0.5">:</span>
              <Stepper value={awayInput} onChange={setAwayInput} step={step} />
            </div>
          ) : played && match.result ? (
            <div className="flex items-center gap-1 bg-gray-100 rounded-xl px-3 py-2">
              <span className="font-display text-2xl font-black text-gray-800 tracking-wider">
                {match.result.homeGoals}–{match.result.awayGoals}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <div className="w-11 h-11 rounded-xl bg-gray-50 border-2 border-gray-200 flex items-center justify-center">
                <span className="font-display text-2xl font-bold text-gray-300">{pred?.homeGoals ?? '–'}</span>
              </div>
              <span className="font-display text-xl text-gray-300">:</span>
              <div className="w-11 h-11 rounded-xl bg-gray-50 border-2 border-gray-200 flex items-center justify-center">
                <span className="font-display text-2xl font-bold text-gray-300">{pred?.awayGoals ?? '–'}</span>
              </div>
            </div>
          )}
          {played && pred && match.result && (
            <div className="text-[10px] text-gray-400 font-bold text-center">
              Tu pred: {pred.homeGoals}–{pred.awayGoals}
            </div>
          )}
          {!played && <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wide">{locked ? 'cerrado' : 'vs'}</span>}
        </div>

        {/* Away */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-4xl leading-none">{match.awayTeam.flag}</span>
          <span className="text-[12px] font-black text-gray-800 text-center leading-tight">{match.awayTeam.name}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center px-4 pb-3 pt-1 border-t border-gray-100 bg-gray-50/60">
        <div>{chip}</div>
        {!locked ? (
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 bg-ec-blue text-white font-display text-base font-bold px-4 py-2 rounded-lg transition hover:bg-ec-blue-dark active:scale-95 disabled:opacity-60"
          >
            {saving ? '⏳' : <Save size={14} />}
            {saving ? 'Guardando' : 'Guardar'}
          </button>
        ) : played && match.result ? (
          <span className="text-[12px] font-bold text-gray-400">
            Resultado final: <strong className="text-gray-700">{match.result.homeGoals}–{match.result.awayGoals}</strong>
          </span>
        ) : (
          <span className="flex items-center gap-1 text-[12px] text-gray-400 font-bold italic">
            <Lock size={11} /> Sin resultado aún
          </span>
        )}
      </div>
    </div>
  )
}

// ─── Stepper sub-component ────────────────────────────
function Stepper({ value, onChange, step }: {
  value: number | string
  onChange: (v: number) => void
  step: (s: typeof onChange, d: number) => void
}) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <button
        onClick={() => step(onChange, 1)}
        className="w-5 h-5 rounded border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-ec-blue hover:text-white hover:border-ec-blue transition text-xs font-bold"
      >+</button>
      <input
        type="number" min={0} max={20}
        value={value}
        onChange={e => onChange(Math.max(0, Math.min(20, parseInt(e.target.value) || 0)))}
        className="w-11 h-11 rounded-xl border-2 border-gray-200 bg-gray-50 text-center font-display text-2xl font-bold text-gray-800 outline-none focus:border-ec-blue focus:bg-blue-50 focus:shadow-[0_0_0_3px_rgba(0,61,165,0.12)] transition [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      <button
        onClick={() => step(onChange, -1)}
        className="w-5 h-5 rounded border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-ec-blue hover:text-white hover:border-ec-blue transition text-xs font-bold"
      >–</button>
    </div>
  )
}
