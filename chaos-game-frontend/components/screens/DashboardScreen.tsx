'use client'

import { useEffect, useRef, useMemo } from 'react'

const AI_VERDICTS = [
  "Shows promise but questionable decision-making. Like a golden retriever with a flamethrower. 🐕🔥",
  "Statistically impressive for someone who chose HARD three times in a row. Medically concerning.",
  "The AI has seen things. You specifically. It needs therapy now.",
  "Your chaos energy is unstable. We recommend deep breaths and avoiding sharp objects.",
  "Performance: chaotic. Commitment: unhinged. Overall: oddly inspiring.",
]

const BADGES = [
  { emoji: '🔥', label: 'Day Streak', color: '#ff4d00' },
  { emoji: '👑', label: 'First Hard Win', color: '#ffd60a' },
  { emoji: '🤡', label: 'Pro Clown', color: '#ff00aa' },
  { emoji: '🐔', label: 'Chicken x5', color: '#39ff14' },
  { emoji: '💀', label: 'Death Wish', color: '#ff1744' },
  { emoji: '🎯', label: 'Sniper', color: '#00e5ff' },
  { emoji: '🌀', label: 'Chaos Agent', color: '#bf5fff' },
]

interface DashboardStats {
  score: number;
  tasksCompleted: number;
  categories: Array<{ name: string; completed: number; total: number; color: string }>;
  history: number[];
  recentActivity: Array<{ type: 'approved' | 'rejected' | 'spin'; text: string; points: number; time: string }>;
}

interface DashboardScreenProps {
  score: number
  tasksCompleted: number
  passedTasks: number
  hardFails: number
  recentActivity: { type: 'approved' | 'rejected' | 'spin'; text: string; points: number; time: string }[]
  stats: DashboardStats | null
}

export default function DashboardScreen({ 
  score, 
  tasksCompleted, 
  passedTasks, 
  hardFails,
  recentActivity: localRecentActivity,
  stats
}: DashboardScreenProps) {
  const sparklineRef = useRef<HTMLCanvasElement>(null)
  
  // Use stats from backend if available, otherwise local/mock
  const displayScore = stats?.score ?? score
  const displayTasksCompleted = stats?.tasksCompleted ?? tasksCompleted
  const displayCategories = stats?.categories ?? [
    { name: 'Selfie', completed: 0, total: 1, color: '#ff4d00' },
    { name: 'Action', completed: 0, total: 1, color: '#ff00aa' },
  ]
  const displayHistory = stats?.history ?? []
  const displayActivity = (stats?.recentActivity && stats.recentActivity.length > 0) 
    ? stats.recentActivity 
    : localRecentActivity

  const passRate = displayTasksCompleted > 0 ? Math.round((passedTasks / displayTasksCompleted) * 100) : 0
  const masteryLevel = Math.min(100, Math.round(displayScore / 14.2))
  
  const masteryTier = useMemo(() => {
    if (masteryLevel <= 30) return { name: 'Absolute Beginner 🥚', color: '#666' }
    if (masteryLevel <= 50) return { name: 'Mild Inconvenience 🌧️', color: '#00e5ff' }
    if (masteryLevel <= 70) return { name: 'Controlled Disaster 🌪️', color: '#bf5fff' }
    if (masteryLevel <= 90) return { name: 'Certified Menace 🔥', color: '#ff4d00' }
    return { name: 'CHAOS INCARNATE 💀', color: '#ff1744' }
  }, [masteryLevel])
  
  const randomVerdict = useMemo(() => AI_VERDICTS[Math.floor(Math.random() * AI_VERDICTS.length)], [])
  
  // Draw sparkline
  useEffect(() => {
    const canvas = sparklineRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    canvas.width = canvas.offsetWidth * 2
    canvas.height = 120
    ctx.scale(2, 1)
    
    const width = canvas.offsetWidth
    const height = 60
    
    // Use real history or mock if empty
    const data = displayHistory.length > 1 
      ? displayHistory 
      : [0, 10, 5, 20, 15, 30, 25]; // Slight mock for empty states
    
    const points = data.length
    
    // Draw gradient line
    const gradient = ctx.createLinearGradient(0, 0, width, 0)
    gradient.addColorStop(0, '#ff4d00')
    gradient.addColorStop(1, '#39ff14')
    
    ctx.clearRect(0, 0, width, height + 20)
    ctx.beginPath()
    
    const getX = (i: number) => (i / (points - 1)) * width
    const getY = (val: number) => height - (Math.min(val, 100) / 100) * height
    
    ctx.moveTo(getX(0), getY(data[0]))
    data.forEach((val, i) => {
      ctx.lineTo(getX(i), getY(val))
    })
    
    ctx.strokeStyle = gradient
    ctx.lineWidth = 3
    ctx.lineJoin = 'round'
    ctx.stroke()
    
    // Draw dots
    data.forEach((val, i) => {
      ctx.beginPath()
      ctx.arc(getX(i), getY(val), 4, 0, Math.PI * 2)
      ctx.fillStyle = gradient
      ctx.fill()
    })
  }, [displayHistory])
  
  return (
    <div className="flex flex-col px-4 pt-20 pb-24 gap-4">
      {/* Heading */}
      <div className="text-center mb-2">
        <h2 className="font-display text-3xl tracking-wider animate-chromatic animate-glitch">
          YOUR CHAOS STATS
        </h2>
        <p className="text-[#666] text-sm">
          The AI has been watching. It&apos;s concerned.
        </p>
      </div>
      
      {/* Stat Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-xl bg-[#0d0d0d] border border-[#222]">
          <div className="text-[10px] text-[#666] uppercase mb-1">Total Points</div>
          <div className="font-display text-3xl animate-chromatic">{displayScore}</div>
        </div>
        <div className="p-4 rounded-xl bg-[#0d0d0d] border border-[#222]">
          <div className="text-[10px] text-[#666] uppercase mb-1">Pass Rate</div>
          <div className="font-display text-3xl text-[#39ff14]">{passRate}%</div>
        </div>
        <div className="p-4 rounded-xl bg-[#0d0d0d] border border-[#222]">
          <div className="text-[10px] text-[#666] uppercase mb-1">Tasks Done</div>
          <div className="font-display text-3xl text-[#bf5fff]">{displayTasksCompleted}</div>
        </div>
        <div className="p-4 rounded-xl bg-[#0d0d0d] border border-[#222]">
          <div className="text-[10px] text-[#666] uppercase mb-1">Hard Fails</div>
          <div className="font-display text-3xl text-[#ff1744]">💀 x{hardFails}</div>
        </div>
      </div>
      
      {/* Chaos Mastery Bar */}
      <div className="p-4 rounded-xl bg-[#0d0d0d] border border-[#222]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-[#666] uppercase">Chaos Mastery Level</span>
          <span className="font-display text-sm" style={{ color: masteryTier.color }}>
            {masteryLevel}%
          </span>
        </div>
        <div className="h-3 rounded-full bg-[#1a1a1a] overflow-hidden mb-2">
          <div 
            className="h-full rounded-full gradient-primary animate-[fill-bar_1s_ease-out]"
            style={{ width: `${masteryLevel}%` }}
          />
        </div>
        <div className="text-xs text-center" style={{ color: masteryTier.color }}>
          {masteryTier.name}
        </div>
      </div>
      
      {/* Category Breakdown */}
      <div className="p-4 rounded-xl bg-[#0d0d0d] border border-[#222]">
        <div className="text-xs text-[#666] uppercase mb-3">Category Breakdown</div>
        <div className="flex flex-col gap-3">
          {displayCategories.length === 0 ? (
             <p className="text-xs text-[#444] italic">No categories yet.</p>
          ) : (
            displayCategories.map((cat) => (
              <div key={cat.name} className="flex flex-col gap-1">
                <div className="flex justify-between text-xs">
                  <span>{cat.name}</span>
                  <span style={{ color: cat.color }}>{cat.completed}/{cat.total}</span>
                </div>
                <div className="h-2 rounded-full bg-[#1a1a1a] overflow-hidden">
                  <div 
                    className="h-full rounded-full"
                    style={{ 
                      width: `${(cat.completed / cat.total) * 100}%`,
                      backgroundColor: cat.color 
                    }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* Mood Graph */}
      <div className="p-4 rounded-xl bg-[#0d0d0d] border border-[#222]">
        <div className="text-xs text-[#666] uppercase mb-2">Your chaos energy over time</div>
        <canvas ref={sparklineRef} className="w-full h-[60px]" />
      </div>
      
      {/* AI Verdict */}
      <div className="p-4 rounded-xl bg-[#0d0d0d] border-l-4 border-[#ff4d00] border-r border-t border-b border-r-[#222] border-t-[#222] border-b-[#222]">
        <div className="text-4xl mb-2">&ldquo;</div>
        <p className="text-sm text-[#888] italic leading-relaxed -mt-6 pl-4">
          {randomVerdict}
        </p>
      </div>
      
      {/* Badges */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {BADGES.map((badge, i) => (
          <div 
            key={i}
            className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1"
            style={{ backgroundColor: badge.color + '22', color: badge.color }}
          >
            <span>{badge.emoji}</span>
            <span>{badge.label}</span>
          </div>
        ))}
      </div>
      
      {/* Recent Activity */}
      <div className="p-4 rounded-xl bg-[#0d0d0d] border border-[#222]">
        <div className="text-xs text-[#666] uppercase mb-3">Recent Activity</div>
        <div className="flex flex-col gap-2">
          {displayActivity.length === 0 ? (
            <p className="text-xs text-[#444] italic">No activity yet. Start playing!</p>
          ) : (
            displayActivity.slice(0, 5).map((activity, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span>
                  {activity.type === 'approved' ? '✅' : activity.type === 'rejected' ? '❌' : '⚡'}
                </span>
                <span className="flex-1 truncate text-[#888]">{activity.text}</span>
                <span className={activity.type === 'approved' ? 'text-[#39ff14]' : activity.type === 'rejected' ? 'text-[#ff1744]' : 'text-[#ffd60a]'}>
                  {activity.points > 0 ? `+${activity.points}pts` : activity.text}
                </span>
                <span className="text-[#444]">{activity.time}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
