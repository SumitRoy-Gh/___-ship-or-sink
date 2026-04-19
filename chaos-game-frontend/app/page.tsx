'use client'

import { useState, useEffect, useCallback } from 'react'
import Header from '@/components/Header'
import TabBar from '@/components/TabBar'
import ParticleBackground from '@/components/ParticleBackground'
import ChaosOverlay from '@/components/ChaosOverlay'
import LoadingSpinner from '@/components/LoadingSpinner'
import HomeScreen from '@/components/screens/HomeScreen'
import SpinScreen from '@/components/screens/SpinScreen'
import LeaderboardScreen from '@/components/screens/LeaderboardScreen'
import DashboardScreen from '@/components/screens/DashboardScreen'
import BugZoneScreen from '@/components/screens/BugZoneScreen'
import DifficultyScreen from '@/components/screens/DifficultyScreen'
import TaskScreen from '@/components/screens/TaskScreen'
import UploadScreen from '@/components/screens/UploadScreen'
import ResultScreen from '@/components/screens/ResultScreen'
import ScoreScreen from '@/components/screens/ScoreScreen'
import { useSession } from 'next-auth/react'
import { startSession, getTask, verifyTask, postReward, getStats } from '@/lib/api'

type Tab = 'home' | 'spin' | 'board' | 'dash' | 'bug'
type GameScreen = 'none' | 'difficulty' | 'task' | 'upload' | 'result' | 'score'
type Difficulty = 'easy' | 'medium' | 'hard'

interface SpinResult {
  label: string
  emoji: string
  color: string
  message: string
}

interface ActivityItem {
  type: 'approved' | 'rejected' | 'spin'
  text: string
  points: number
  time: string
}

// Mock data
const MOCK_TASKS = {
  easy: [
    { task: 'Do your best chicken impression for 7 seconds', category: 'action' },
    { task: 'Take a selfie with something purple', category: 'selfie' },
    { task: 'Find and photograph a plant', category: 'object' },
  ],
  medium: [
    { task: 'Balance 3 objects into a tower without them falling', category: 'object' },
    { task: 'Strike a pose like a superhero', category: 'action' },
    { task: 'Take a selfie with the most dramatic expression possible', category: 'selfie' },
  ],
  hard: [
    { task: 'Speak in a pirate accent for 30 seconds without breaking', category: 'action' },
    { task: 'Write your name backwards in the air with your elbow', category: 'action' },
    { task: 'Recreate a famous painting using only household items', category: 'object' },
  ],
}

const MOCK_RESPONSES = {
  approved: [
    "I've seen better, but I've also seen worse. You pass.",
    "Against all odds, you actually did it. Color me impressed.",
    "This is acceptable. Barely. But acceptable.",
    "You're lucky I'm in a good mood. APPROVED.",
  ],
  rejected: [
    "Is this a joke? Try again.",
    "My AI eyes are crying. Rejected.",
    "Even a random number generator could do better.",
    "This is not what I asked for. At all.",
  ],
}

export default function ChaosTasks() {
  const { data: session } = useSession()
  const accessToken = (session as any)?.accessToken

  const [activeTab, setActiveTab] = useState<Tab>('home')
  const [gameScreen, setGameScreen] = useState<GameScreen>('none')
  const [playerId, setPlayerId] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [tasksCompleted, setTasksCompleted] = useState(0)
  const [passedTasks, setPassedTasks] = useState(0)
  const [hardFails, setHardFails] = useState(0)
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')
  const [currentTask, setCurrentTask] = useState<{ task: string; taskLabel: string } | null>(null)
  const [result, setResult] = useState<{ passed: boolean; message: string; confidence: number; points: number } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [spinResult, setSpinResult] = useState<SpinResult | null>(null)
  const [hasDoublePoints, setHasDoublePoints] = useState(false)
  const [hasSkipPass, setHasSkipPass] = useState(false)
  const [chaosTrigger, setChaosTrigger] = useState(false)
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([])
  
  const MAX_TASKS = 5
  
  // Add activity
  const addActivity = useCallback((type: ActivityItem['type'], text: string, points: number) => {
    setRecentActivity(prev => [
      { type, text, points, time: 'now' },
      ...prev.slice(0, 4).map(a => ({ ...a, time: a.time === 'now' ? '1 min ago' : a.time }))
    ])
  }, [])
  
  // Fetch task
  const fetchTask = useCallback(async (diff: Difficulty) => {
    setIsLoading(true)
    try {
      const task = await getTask(diff, playerId || undefined, accessToken)
      setCurrentTask(task)
      setGameScreen('task')
    } catch (err) {
      console.error('Failed to fetch task:', err)
      // Show error to user instead of silently using mock
      alert('Failed to get task from AI. Check your backend is running!')
    }
    setIsLoading(false)
  }, [playerId, accessToken])

  // Initialize Session
  useEffect(() => {
    const init = async () => {
      try {
        const data = await startSession(accessToken)
        setPlayerId(data.sessionId)
        setScore(data.score)
        setTasksCompleted(data.tasksCompleted)
        console.log('[Chaos] Session initialized:', data.sessionId)
      } catch (err) {
        console.error('Failed to init session:', err)
        if (!playerId) setPlayerId('player_' + Math.random().toString(36).slice(2, 8))
      }
    }
    init()
  }, [accessToken])
  
  const [dashboardStats, setDashboardStats] = useState<any | null>(null)

  // Handle tab change
  const handleTabChange = useCallback(async (tab: Tab) => {
    setActiveTab(tab)
    setGameScreen('none')
    setChaosTrigger(true)
    
    if (tab === 'dash' && playerId) {
      try {
        const stats = await getStats(playerId, accessToken)
        setDashboardStats(stats)
      } catch (err) {
        console.error('Failed to fetch dashboard stats:', err)
      }
    }
  }, [playerId, accessToken])
  
  // Handle back navigation
  const handleBack = useCallback(() => {
    if (activeTab !== 'home') {
      setActiveTab('home')
      setGameScreen('none')
      return
    }

    if (gameScreen === 'difficulty') setGameScreen('none')
    else if (gameScreen === 'task') setGameScreen('difficulty')
    else if (gameScreen === 'upload') setGameScreen('task')
    else if (gameScreen === 'result') setGameScreen('none')
    else if (gameScreen === 'score') setGameScreen('none')
    
    setChaosTrigger(true)
  }, [activeTab, gameScreen])

  // Handle home navigation (reset everything)
  const handleHome = useCallback(() => {
    setActiveTab('home')
    setGameScreen('none')
    setCurrentTask(null)
    setResult(null)
    setChaosTrigger(true)
  }, [])
  
  // Handle start game
  const handleStartGame = useCallback(() => {
    setGameScreen('difficulty')
    setChaosTrigger(true)
  }, [])
  
  // Handle spin first
  const handleSpinFirst = useCallback(() => {
    setActiveTab('spin')
  }, [])
  
  // Handle difficulty select
  const handleDifficultySelect = useCallback((diff: Difficulty) => {
    setDifficulty(diff)
    fetchTask(diff)
  }, [fetchTask])
  
  // Handle task complete
  const handleTaskComplete = useCallback(() => {
    setGameScreen('upload')
  }, [])
  
  // Handle task skip
  const handleTaskSkip = useCallback(() => {
    if (hasSkipPass) {
      setHasSkipPass(false)
    }
    const newTasksCompleted = tasksCompleted + 1
    setTasksCompleted(newTasksCompleted)
    
    if (newTasksCompleted >= MAX_TASKS) {
      setGameScreen('score')
    } else {
      fetchTask(difficulty)
    }
  }, [tasksCompleted, difficulty, fetchTask, hasSkipPass])
  
  // Handle upload submit
  const handleUploadSubmit = useCallback(async (file: File) => {
    if (!currentTask) return
    if (!playerId) {
      console.error('No session ID found!')
      alert('Your session is missing. Please refresh the page!')
      return
    }
    
    setIsLoading(true)
    setChaosTrigger(true)
    
    try {
      const response = await verifyTask(file, currentTask.taskLabel, currentTask.task, accessToken)
      
      const rewardResponse = await postReward(
        playerId,
        currentTask.task,
        response.passed,
        difficulty,
        accessToken
      )
      
      const { pointsEarned, totalScore, judgment } = rewardResponse

      setResult({
        passed: response.passed,
        message: judgment,
        confidence: response.confidence,
        points: pointsEarned,
      })
      
      setScore(totalScore)
      setTasksCompleted(prev => prev + 1)
      
      if (response.passed) {
        setPassedTasks(prev => prev + 1)
        addActivity('approved', currentTask.task, pointsEarned)
      } else {
        if (difficulty === 'hard') setHardFails(prev => prev + 1)
        addActivity('rejected', currentTask.task, pointsEarned)
      }
    } catch (error: any) {
      // Diagnostic logging: helps identify if it's a network error or a server error
      const errorDetail = error?.response?.data?.detail || error?.response?.data?.error || error.message;
      console.error('Submit Error Diagnostic:', {
        message: error.message,
        response: error?.response?.data,
        status: error?.response?.status
      })
      
      setResult({
        passed: false,
        message: `AI judge is down. Detail: ${errorDetail}. You fail by default. 💀`,
        confidence: 0,
        points: 0,
      })
      setTasksCompleted(prev => prev + 1)
      if (currentTask) {
        addActivity('rejected', currentTask.task, 0)
      }
    }
    setIsLoading(false)
    setGameScreen('result')
  }, [currentTask, playerId, hasDoublePoints, difficulty, addActivity, accessToken])
  
  // Handle next task
  const handleNextTask = useCallback(() => {
    if (tasksCompleted >= MAX_TASKS) {
      setGameScreen('score')
    } else {
      fetchTask(difficulty)
    }
  }, [tasksCompleted, difficulty, fetchTask])
  
  // Handle play again
  const handlePlayAgain = useCallback(() => {
    setScore(0)
    setTasksCompleted(0)
    setPassedTasks(0)
    setHardFails(0)
    setResult(null)
    setCurrentTask(null)
    setGameScreen('none')
    setActiveTab('home')
  }, [])
  
  // Handle spin result
  const handleSpinResult = useCallback((result: SpinResult) => {
    setSpinResult(result)
    addActivity('spin', `Got "${result.label}"`, 0)
    
    // Auto-fetch task based on spin result
    const label = result.label.toLowerCase() as Difficulty
    if (['easy', 'medium', 'hard'].includes(label)) {
      setDifficulty(label)
      // Small delay so user can see the result card
      setTimeout(() => {
        fetchTask(label)
      }, 1500)
    }
  }, [addActivity, fetchTask])
  
  // Reset chaos trigger
  useEffect(() => {
    if (chaosTrigger) {
      const timer = setTimeout(() => setChaosTrigger(false), 100)
      return () => clearTimeout(timer)
    }
  }, [chaosTrigger])
  
  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#060606]">
        <LoadingSpinner message="Loading chaos..." />
      </main>
    )
  }
  
  // Render game screens (overlay mode)
  if (gameScreen !== 'none') {
    return (
      <main className="min-h-screen bg-[#060606] overflow-x-hidden pt-20">
        <ParticleBackground />
        <Header 
          score={score} 
          showBack={true}
          onBack={handleBack}
          onHome={handleHome}
          onNavigate={setActiveTab}
        />
        <ChaosOverlay triggerOnAction={chaosTrigger} onTriggerHandled={() => setChaosTrigger(false)} />
        
        {/* Active bonuses display */}
        {(hasDoublePoints || hasSkipPass) && (
          <div className="fixed top-4 left-4 z-40 flex flex-col gap-2">
            {hasDoublePoints && (
              <div className="px-3 py-1.5 rounded-full bg-[#ffd60a]/20 text-[#ffd60a] text-xs font-display">
                🎡 2X ACTIVE
              </div>
            )}
            {hasSkipPass && (
              <div className="px-3 py-1.5 rounded-full bg-[#bf5fff]/20 text-[#bf5fff] text-xs font-display">
                🛡️ SKIP AVAILABLE
              </div>
            )}
          </div>
        )}
        
        {gameScreen === 'difficulty' && (
          <DifficultyScreen onSelect={handleDifficultySelect} />
        )}
        
        {gameScreen === 'task' && currentTask && (
          <TaskScreen 
            task={currentTask}
            onComplete={handleTaskComplete}
            onSkip={handleTaskSkip}
          />
        )}
        
        {gameScreen === 'upload' && currentTask && (
          <UploadScreen 
            task={currentTask}
            onSubmit={handleUploadSubmit}
          />
        )}
        
        {gameScreen === 'result' && result && (
          <ResultScreen 
            passed={result.passed}
            message={result.message}
            confidence={result.confidence}
            points={result.points}
            onNext={handleNextTask}
          />
        )}
        
        {gameScreen === 'score' && (
          <ScoreScreen 
            score={score}
            tasksCompleted={tasksCompleted}
            onPlayAgain={handlePlayAgain}
          />
        )}
      </main>
    )
  }
  
  // Main tab navigation
  return (
    <main className="min-h-screen bg-[#060606] overflow-x-hidden">
      <ParticleBackground />
      <Header 
        score={score} 
        showBack={activeTab !== 'home' || gameScreen !== 'none'}
        onBack={handleBack}
        onHome={handleHome}
        onNavigate={setActiveTab}
      />
      <ChaosOverlay triggerOnAction={chaosTrigger} onTriggerHandled={() => setChaosTrigger(false)} />
      
      <div className="max-w-[480px] mx-auto">
        {activeTab === 'home' && (
          <HomeScreen 
            onStartGame={handleStartGame}
            onSpinFirst={handleSpinFirst}
          />
        )}
        
        {activeTab === 'spin' && (
          <SpinScreen 
            onSpinResult={handleSpinResult}
            lastResult={spinResult}
          />
        )}
        
        {activeTab === 'board' && (
          <LeaderboardScreen userScore={score} />
        )}
        
        {activeTab === 'dash' && (
          <DashboardScreen 
            stats={dashboardStats}
            score={score}
            tasksCompleted={tasksCompleted}
            passedTasks={passedTasks}
            hardFails={hardFails}
            recentActivity={recentActivity}
          />
        )}
        
        {activeTab === 'bug' && (
          <BugZoneScreen />
        )}
      </div>
      
      <TabBar activeTab={activeTab} onTabChange={handleTabChange} />
    </main>
  )
}
