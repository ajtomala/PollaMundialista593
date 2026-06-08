import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { groupsApi } from '@/services/api'
import { useStore } from '@/store'
import { useToast } from '@/hooks'

export default function SplashPage() {
  const navigate = useNavigate()
  const { setUser, setGroup } = useStore()
  const { toast } = useToast()
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)

  const handleCreate = async () => {
    if (!name.trim()) { toast('✏️ Escribe tu nombre primero'); return }
    if (!groupName.trim()) { toast('✏️ Ponle un nombre a tu grupo'); return }
    setLoading(true)
    try {
      const res = await groupsApi.create(groupName.trim(), name.trim())
      setGroup(res.group)
      setUser({ uid: res.user.uid, displayName: name.trim(), groupCode: res.group.code, createdAt: new Date() })
      navigate('/app')
    } catch {
      toast('❌ Error al crear grupo. Intenta de nuevo.')
    } finally { setLoading(false) }
  }

  const handleJoin = async () => {
    if (!name.trim()) { toast('✏️ Escribe tu nombre primero'); return }
    if (code.trim().length < 4) { toast('🔑 Código debe tener 4 caracteres'); return }
    setLoading(true)
    try {
      const res = await groupsApi.join(code.trim().toUpperCase(), name.trim())
      setGroup(res.group)
      setUser({ uid: '', displayName: name.trim(), groupCode: res.group.code, createdAt: new Date() })
      navigate('/app')
    } catch (e: any) {
      toast(e?.response?.data?.error || '❌ Código inválido o grupo lleno')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-ec-blue flex flex-col items-center justify-center relative overflow-hidden px-4">
      {/* Stripes */}
      <div className="absolute top-0 inset-x-0 h-2 bg-ec-yellow" />
      <div className="absolute bottom-0 inset-x-0 h-2 bg-ec-red" />
      {/* BG ball */}
      <div className="absolute bottom-[-40px] right-[-60px] text-[280px] opacity-[0.04] select-none pointer-events-none">⚽</div>

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3 animate-float">🇪🇨 ⚽ 🏆</div>
          <h1 className="font-display text-[72px] leading-none font-black text-ec-yellow tracking-wide"
              style={{ textShadow: '0 4px 0 rgba(0,0,0,0.25)' }}>
            Polla<span className="text-white">Gol</span>
          </h1>
          <p className="text-white/60 text-xs font-bold tracking-[3px] uppercase mt-2">Mundial 2026</p>
        </div>

        {/* Card */}
        <div className="bg-white/10 border border-white/20 rounded-[18px] p-5 backdrop-blur-sm">
          {/* Name */}
          <label className="text-ec-yellow text-[11px] font-black uppercase tracking-[2px] block mb-2">
            Tu nombre / apodo
          </label>
          <input
            className="w-full bg-white/15 border border-white/25 rounded-[10px] px-4 py-3 text-white font-bold text-base placeholder-white/40 outline-none focus:border-ec-yellow focus:bg-white/20 transition mb-4"
            placeholder="¿Cómo te llaman?"
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={20}
            onKeyDown={e => e.key === 'Enter' && !showCreateForm && setShowCreateForm(true)}
          />

          {/* Create group */}
          {!showCreateForm ? (
            <button
              onClick={() => setShowCreateForm(true)}
              className="w-full bg-ec-yellow text-ec-blue-dark font-display font-bold text-xl tracking-wide py-4 rounded-[10px] mb-3 transition hover:bg-yellow-300 active:scale-[0.98]"
              style={{ boxShadow: '0 4px 0 #C9A400' }}
            >
              ⚡ Crear mi grupo nuevo
            </button>
          ) : (
            <div className="mb-3">
              <label className="text-ec-yellow text-[11px] font-black uppercase tracking-[2px] block mb-2">
                Nombre del grupo
              </label>
              <input
                className="w-full bg-white/15 border border-white/25 rounded-[10px] px-4 py-3 text-white font-bold text-base placeholder-white/40 outline-none focus:border-ec-yellow transition mb-2"
                placeholder="Ej: Polla Oficina 2026"
                value={groupName}
                onChange={e => setGroupName(e.target.value)}
                maxLength={30}
              />
              <button
                onClick={handleCreate}
                disabled={loading}
                className="w-full bg-ec-yellow text-ec-blue-dark font-display font-bold text-xl tracking-wide py-4 rounded-[10px] transition hover:bg-yellow-300 active:scale-[0.98] disabled:opacity-60"
                style={{ boxShadow: '0 4px 0 #C9A400' }}
              >
                {loading ? '⏳ Creando...' : '🚀 Crear grupo'}
              </button>
            </div>
          )}

          {/* Divider */}
          <div className="flex items-center gap-2 my-4">
            <div className="flex-1 h-px bg-white/15" />
            <span className="text-white/40 text-xs font-black uppercase tracking-wider">o entrar con código</span>
            <div className="flex-1 h-px bg-white/15" />
          </div>

          {/* Join */}
          <label className="text-ec-yellow text-[11px] font-black uppercase tracking-[2px] block mb-2">
            Código del grupo
          </label>
          <div className="flex gap-2">
            <input
              className="flex-1 bg-white/15 border border-white/25 rounded-[10px] px-4 py-3 text-white font-black text-xl uppercase tracking-[4px] text-center placeholder-white/30 outline-none focus:border-ec-yellow transition"
              placeholder="XXXX"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              maxLength={4}
              onKeyDown={e => e.key === 'Enter' && handleJoin()}
            />
            <button
              onClick={handleJoin}
              disabled={loading}
              className="bg-ec-red text-white font-display font-bold text-lg px-5 rounded-[10px] transition hover:bg-ec-red-dark active:scale-[0.97] disabled:opacity-60 whitespace-nowrap"
            >
              Entrar →
            </button>
          </div>
        </div>

        <p className="text-white/30 text-[11px] font-bold text-center mt-5 leading-relaxed">
          🔒 Sin registro · Sin contraseña<br />
          Tus datos se guardan de forma segura
        </p>
      </div>
    </div>
  )
}
