import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '@/store'
import { useAuth, useMatches, useMyPredictions, useLeaderboard, useToast } from '@/hooks'
import { HeroCard, BottomNav, Toast, AppHeader } from '@/components/Layout'
import MatchCard from '@/components/MatchCard'
import LeaderboardTab from '@/components/LeaderboardTab'
import ChampionTab from '@/components/ChampionTab'
import ShareTab from '@/components/ShareTab'

export default function AppPage() {
  const { user, group, activeTab, matches } = useStore()
  const navigate = useNavigate()
  useAuth()
  useMatches()
  useMyPredictions(group?.code)
  useLeaderboard(group?.code)

  // Redirect if not in a group
  useEffect(() => {
    if (!user || !group) navigate('/', { replace: true })
  }, [user, group])

  if (!user || !group) return null

  // Group matches by round
  const upcomingMatches = matches.filter(m => m.status === 'upcoming')
  const liveMatches     = matches.filter(m => m.status === 'live')
  const finishedMatches = matches.filter(m => m.status === 'finished')

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-body">
      <AppHeader />
      <HeroCard />

      <main className="flex-1 overflow-y-auto">
        {/* PARTIDOS */}
        {activeTab === 'matches' && (
          <div className="px-4 pt-4 pb-6 space-y-4">
            {liveMatches.length > 0 && (
              <section>
                <SectionTitle icon="🔴" text="En Vivo" accent />
                <div className="space-y-3">
                  {liveMatches.map(m => <MatchCard key={m.id} match={m} />)}
                </div>
              </section>
            )}
            {upcomingMatches.length > 0 && (
              <section>
                <div className="inline-flex items-center gap-1.5 bg-ec-blue text-white text-[11px] font-black px-3 py-1.5 rounded-full uppercase tracking-wide mb-3">
                  🗓 Próximos partidos
                </div>
                <div className="space-y-3">
                  {upcomingMatches.map(m => <MatchCard key={m.id} match={m} />)}
                </div>
              </section>
            )}
            {finishedMatches.length > 0 && (
              <section>
                <SectionTitle icon="✅" text="Finalizados" />
                <div className="space-y-3">
                  {finishedMatches.map(m => <MatchCard key={m.id} match={m} />)}
                </div>
              </section>
            )}
            {matches.length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <div className="text-5xl mb-3">⏳</div>
                <p className="font-bold">Cargando partidos...</p>
              </div>
            )}
          </div>
        )}

        {/* TABLA */}
        {activeTab === 'table' && <LeaderboardTab />}

        {/* CAMPEÓN */}
        {activeTab === 'champion' && <ChampionTab />}

        {/* COMPARTIR */}
        {activeTab === 'share' && <ShareTab />}
      </main>

      <BottomNav />
      <Toast />
    </div>
  )
}

function SectionTitle({ icon, text, accent }: { icon: string; text: string; accent?: boolean }) {
  return (
    <h2 className={`font-display text-[22px] font-bold tracking-wide mb-3 flex items-center gap-2 ${accent ? 'text-green-600' : 'text-gray-800'}`}>
      {icon} <span className={accent ? 'text-green-600' : 'text-ec-blue'}>{text}</span>
    </h2>
  )
}
