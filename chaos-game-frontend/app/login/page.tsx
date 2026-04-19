'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ParticleBackground from '@/components/ParticleBackground'
import Header from '@/components/Header'
import { Chrome, Mail, Lock, ArrowRight, Loader2, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false
      })

      if (res?.error) {
        setError('Invalid chaos credentials. Try again, human.')
      } else {
        router.push('/')
        router.refresh()
      }
    } catch (err) {
      setError('Something went wrong in the matrix.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    signIn('google', { callbackUrl: '/' })
  }

  return (
    <main className="min-h-screen bg-[#060606] text-white flex flex-col relative overflow-hidden">
      <ParticleBackground />
      <Header score={0} showBack={true} onBack={() => router.push('/')} onHome={() => router.push('/')} />

      <div className="flex-1 flex items-center justify-center p-4 relative z-10 pt-20">
        <div className="w-full max-w-[420px] space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-4xl font-display tracking-tighter animate-glitch text-white">
              ACCESS GRANTED?
            </h2>
            <p className="text-gray-400 text-sm font-sans">
              Prove your identity to the Chaos Judge.
            </p>
          </div>

          <div className="bg-[#0d0d0d]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-[0_0_50px_rgba(255,77,0,0.1)] relative group overflow-hidden">
            {/* Rainbow border animation effect */}
            <div className="absolute inset-0 opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#39ff14] to-transparent animate-shimmer" />
              <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#ff4d00] to-transparent animate-shimmer-reverse" />
            </div>

            <form onSubmit={handleCredentialsLogin} className="space-y-6">
              {error && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 flex items-center gap-2 text-red-500 text-xs animate-shake">
                  <AlertCircle size={14} />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-display text-gray-500 uppercase tracking-widest px-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:border-[#39ff14] focus:ring-1 focus:ring-[#39ff14] outline-none transition-all placeholder:text-gray-700"
                      placeholder="human@chaos.com"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-display text-gray-500 uppercase tracking-widest px-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:border-[#ff4d00] focus:ring-1 focus:ring-[#ff4d00] outline-none transition-all placeholder:text-gray-700"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-white text-black font-display py-3 rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : (
                  <>
                    ENTER CHAOS <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/5"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#0d0d0d] px-4 text-gray-600 font-display">OR CONTINUE WITH</span>
              </div>
            </div>

            <button 
              onClick={handleGoogleLogin}
              className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white font-sans py-3 rounded-xl flex items-center justify-center gap-3 transition-all"
            >
              <Chrome size={20} className="text-[#39ff14]" />
              <span className="font-display tracking-tight">CONTINUE WITH GOOGLE</span>
            </button>
          </div>

          <p className="text-center text-gray-500 text-sm">
            Don't have an identity? {' '}
            <Link href="/signup" className="text-[#39ff14] hover:underline font-display tracking-tight">
              REGISTER HERE
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
