import { ChevronLeft, LogIn, User, LogOut, ChevronDown } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'

interface HeaderProps {
  score: number
  showBack?: boolean
  onBack: () => void
  onHome: () => void
  onNavigate?: (tab: 'home' | 'spin' | 'board' | 'dash' | 'bug') => void
}

export default function Header({ score, showBack, onBack, onHome, onNavigate }: HeaderProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const handleLogin = () => {
    router.push('/login')
  }

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] bg-[#060606]/95 backdrop-blur-md border-b border-white/10 h-16">
      <div className="max-w-[480px] mx-auto h-full px-4 flex items-center justify-between gap-3">
        {/* Left: Back & Logo */}
        <div className="flex items-center gap-2 overflow-hidden flex-1 min-w-0">
          {showBack && (
            <button 
              onClick={onBack}
              className="p-2 -ml-2 rounded-full hover:bg-white/10 active:scale-90 transition-all text-gray-500 hover:text-[#39ff14] flex-shrink-0"
            >
              <ChevronLeft size={24} />
            </button>
          )}

          <button onClick={onHome} className="flex flex-col items-start group min-w-0">
            <h1 className="font-display text-lg tracking-wider text-white truncate group-hover:animate-chromatic transition-all uppercase">
              CHAOS TASKS
            </h1>
            <div className="h-0.5 w-0 group-hover:w-full bg-[#39ff14] transition-all duration-300" />
          </button>
        </div>
        
        {/* Right: Score & Auth */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Score Box */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#39ff14]/30 bg-[#0d0d0d] shadow-[0_0_10px_rgba(57,255,20,0.1)]">
            <span className="text-sm">⚡</span>
            <span className="font-display text-base text-[#39ff14] neon-glow">
              {score}
            </span>
          </div>

          {/* User Profile */}
          {status === 'authenticated' ? (
            <div className="relative" ref={menuRef}>
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-1 p-1 rounded-full border border-white/10 hover:border-[#39ff14] transition-all bg-[#111]"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden bg-[#222] flex items-center justify-center">
                  {session.user?.image ? (
                    <Image 
                      src={session.user.image} 
                      alt="Profile" 
                      width={32} 
                      height={32} 
                      className="object-cover"
                    />
                  ) : (
                    <User size={16} className="text-gray-400" />
                  )}
                </div>
                <ChevronDown size={14} className={`text-gray-500 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Controlled Dropdown Menu */}
              {isMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-[#0d0d0d] border border-white/10 rounded-xl shadow-2xl p-2 z-[110] animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-3 py-2 border-b border-white/5 mb-1">
                    <p className="text-[10px] font-display text-gray-500 uppercase tracking-widest">Candidate</p>
                    <p className="text-xs font-display text-white truncate">{session.user?.name}</p>
                  </div>
                  <button 
                    onClick={() => { 
                      if (onNavigate) onNavigate('dash'); 
                      else router.push('/dashboard'); 
                      setIsMenuOpen(false); 
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-xs text-gray-400 hover:text-[#39ff14] hover:bg-white/5 rounded-lg transition-all"
                  >
                    <User size={14} /> Dashboard
                  </button>
                  <button 
                    onClick={() => signOut()}
                    className="w-full flex items-center gap-3 px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
                  >
                    <LogOut size={14} /> Termination
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button 
              onClick={handleLogin}
              className="p-2 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-[#39ff14] hover:bg-[#39ff14]/10 transition-all"
            >
              <LogIn size={20} />
            </button>
          )}
        </div>
      </div>
      
      {/* Dynamic progress line or decorative line */}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#39ff14]/50 to-transparent" />
    </header>
  )
}
