import { useState, useEffect } from 'react'
import { getLeaderboard } from '@/lib/api'

// Leaderboard component

interface LeaderboardScreenProps {
  userScore: number
}

export default function LeaderboardScreen({ userScore }: LeaderboardScreenProps) {
  const [players, setPlayers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBoard = async () => {
      try {
        const data = await getLeaderboard()
        setPlayers(data)
      } catch (err) {
        console.error('Leaderboard fetch failed:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchBoard()
  }, [])

  // Combine real data with ranking logic
  const displayPlayers = players.map((p, index) => ({
    rank: index + 1,
    name: p.name || `ShadowPlayer_${p.session_id?.slice(0, 4)}`,
    score: p.total_score,
    emoji: ['👑', '🔥', '💀', '🐔', '🎪', '🍞', '😈'][index % 7],
    color: ['#ffd60a', '#c0c0c0', '#cd7f32', '#ff4d00', '#ff00aa', '#bf5fff', '#00e5ff'][index % 7],
    badge: p.total_score > 1000 ? 'Chaos Master' : 'Survivor'
  }))

  // Calculate user rank
  const userRank = displayPlayers.find(p => p.score <= userScore)?.rank || displayPlayers.length + 1
  const userTitle = userScore < 100 ? 'Still Learning' 
    : userScore < 300 ? 'Warming Up'
    : userScore < 500 ? 'Getting Dangerous'
    : userScore < 800 ? 'Certified Menace'
    : 'Chaos Apprentice'
  
  // Footer taunt
  const topPlayer = displayPlayers[0]?.name || "ChaosLord"

  return (
    <div className="flex flex-col px-4 pt-20 pb-24">
      {/* Heading */}
      <h2 className="font-display text-3xl tracking-wider animate-chromatic text-center mb-1">
        HALL OF CHAOS
      </h2>
      <p className="text-[#666] text-sm text-center mb-6">
        Ranked by chaos energy &amp; pure audacity
      </p>
      
      {/* Leaderboard rows */}
      <div className="flex flex-col gap-2 mb-6">
        {loading ? (
          <div className="text-center py-10 text-[#444] font-display animate-pulse">
            LOADING THE CHAOS...
          </div>
        ) : displayPlayers.length === 0 ? (
          <div className="text-center py-10 text-[#444] border-2 border-dashed border-white/5 rounded-2xl italic text-sm">
            No one has dared to play yet.
          </div>
        ) : (
          displayPlayers.map((player) => (
            <div
              key={player.rank}
              className={`
                flex items-center gap-3 p-3 rounded-xl bg-[#0d0d0d] transition-transform hover:translate-x-1
                ${player.rank === 1 ? 'border-2 border-[#ffd60a] shadow-[0_0_15px_rgba(255,214,10,0.3)]' : 'border border-[#222]'}
              `}
            >
              {/* Rank */}
              <div 
                className="font-display text-xl w-8 text-center"
                style={{ color: player.color }}
              >
                {player.rank}
              </div>
              
              {/* Avatar */}
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                style={{ backgroundColor: player.color + '33' }}
              >
                {player.emoji}
              </div>
              
              {/* Name & Badge */}
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm truncate">{player.name}</div>
                <div className="text-[10px] text-[#666]">{player.badge}</div>
              </div>
              
              {/* Score */}
              <div 
                className="font-display text-lg"
                style={{ color: player.color }}
              >
                {player.score}
              </div>
            </div>
          ))
        )}
        
        {/* User row */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[#0d0d0d] border-2 animate-rborder mt-4">
          {/* Rank */}
          <div className="font-display text-xl w-8 text-center animate-chromatic">
            {userRank}
          </div>
          
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl bg-[#39ff14]/20">
            🤡
          </div>
          
          {/* Name & Badge */}
          <div className="flex-1 min-w-0">
            <div className="font-bold text-sm truncate flex items-center gap-1">
              <span className="text-[#39ff14]">★</span> YOU
            </div>
            <div className="text-[10px] text-[#666] italic">{userTitle}</div>
          </div>
          
          {/* Score */}
          <div className="font-display text-lg animate-chromatic neon-glow">
            {userScore}
          </div>
        </div>
      </div>
      
      {/* Your rank card */}
      <div className="p-4 rounded-xl bg-[#0d0d0d] border border-[#222] text-center mb-4">
        <div className="text-[#666] text-sm mb-1">YOUR RANK</div>
        <div className="font-display text-5xl animate-chromatic mb-1">#{userRank}</div>
        <div className="text-[#666] text-sm italic">{userTitle}</div>
      </div>
      
      {/* Footer taunt */}
      <p className="text-[10px] text-[#444] text-center">
        Think you can beat {topPlayer}? Cute.
      </p>
    </div>
  )
}
