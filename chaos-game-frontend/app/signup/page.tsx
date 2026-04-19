'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'
import ParticleBackground from '@/components/ParticleBackground'
import Header from '@/components/Header'
import { User, Mail, Lock, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const router = useRouter()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    try {
      const res = await axios.post(`${BACKEND_URL}/api/auth/signup`, {
        name,
        email,
        password
      })

      if (res.data) {
        setIsSuccess(true)
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create your identity. Try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#060606] text-white flex flex-col relative overflow-hidden">
      <ParticleBackground />
      <Header score={0} showBack={true} onBack={() => router.push('/')} onHome={() => router.push('/')} />

      <div className="flex-1 flex items-center justify-center p-4 relative z-10 pt-20">
        <div className="w-full max-w-[420px] space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-4xl font-display tracking-tighter animate-glitch text-white">
              NEW CANDIDATE
            </h2>
            <p className="text-gray-400 text-sm font-sans">
              Join the ranks of Chaos.
            </p>
          </div>

          <div className="bg-[#0d0d0d]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-[0_0_50px_rgba(57,255,20,0.1)] relative group overflow-hidden">
            {/* Shimmer effect */}
            <div className="absolute inset-0 opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#39ff14] to-transparent animate-shimmer" />
            </div>

            {isSuccess ? (
              <div className="py-8 text-center space-y-4 animate-in fade-in zoom-in duration-500">
                <div className="flex justify-center">
                  <div className="w-20 h-20 rounded-full bg-[#39ff14]/20 flex items-center justify-center text-[#39ff14] animate-bounce">
                    <CheckCircle2 size={48} />
                  </div>
                </div>
                <h3 className="text-2xl font-display text-[#39ff14]">IDENTITY SECURED</h3>
                <p className="text-gray-400 text-sm">Redirecting to login portal...</p>
              </div>
            ) : (
              <form onSubmit={handleSignup} className="space-y-6">
                {error && (
                  <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 flex items-center gap-2 text-red-500 text-xs animate-shake">
                    <AlertCircle size={14} />
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-display text-gray-500 uppercase tracking-widest px-1">Pseudonym</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                      <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:border-[#39ff14] focus:ring-1 focus:ring-[#39ff14] outline-none transition-all placeholder:text-gray-700"
                        placeholder="Chaos Lord"
                        required
                      />
                    </div>
                  </div>

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
                  className="w-full bg-[#39ff14] text-black font-display py-3 rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={20} /> : (
                    <>
                      INITIALIZE ACCOUNT <ArrowRight size={20} />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          <p className="text-center text-gray-500 text-sm">
            Already have an identity? {' '}
            <Link href="/login" className="text-[#39ff14] hover:underline font-display tracking-tight">
              LOGIN HERE
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
