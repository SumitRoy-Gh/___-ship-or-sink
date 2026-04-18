import { ChevronLeft, Home } from 'lucide-react'

interface HeaderProps {
  score: number
  showBack?: boolean
  onBack: () => void
  onHome: () => void
}

export default function Header({ score, showBack, onBack, onHome }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#060606]/90 backdrop-blur-sm">
      <div className="max-w-[480px] mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {/* Back Button */}
          {showBack && (
            <button 
              onClick={onBack}
              className="p-2 -ml-2 rounded-full hover:bg-white/10 active:scale-90 transition-all text-[#666] hover:text-[#39ff14]"
              aria-label="Go Back"
            >
              <ChevronLeft size={24} />
            </button>
          )}

          {/* Home / Logo */}
          <button 
            onClick={onHome}
            className="flex flex-col items-start group"
          >
            <h1 className="font-display text-xl tracking-wider group-hover:animate-chromatic group-hover:animate-glitch transition-all text-white">
              CHAOS TASKS
            </h1>
            <div className="h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-[#ff4d00] to-[#39ff14] transition-all duration-300" />
          </button>
        </div>
        
        {/* Score Area */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 animate-rborder bg-[#0d0d0d] shadow-[0_0_15px_rgba(255,77,0,0.1)]">
            <span className="text-lg">⚡</span>
            <span className="font-display text-lg animate-chromatic neon-glow">
              {score}
            </span>
          </div>
        </div>
      </div>
      
      {/* Rainbow divider */}
      <div className="rainbow-line" />
    </header>
  )
}
