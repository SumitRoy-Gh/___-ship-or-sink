'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

const ParticleExplosion = dynamic(() => import('@/components/three/ParticleExplosion'), { ssr: false })
const RedRain = dynamic(() => import('@/components/three/RedRain'), { ssr: false })

interface ResultScreenProps {
  passed: boolean
  message: string
  confidence: number
  points: number
  onNext: () => void
}

export default function ResultScreen({ passed, message, confidence, points, onNext }: ResultScreenProps) {
  const [showPoints, setShowPoints] = useState(false)
  const [shake, setShake] = useState(!passed)
  
  useEffect(() => {
    const timer = setTimeout(() => setShowPoints(true), 500)
    return () => clearTimeout(timer)
  }, [])
  
  useEffect(() => {
    if (!passed) {
      const timer = setTimeout(() => setShake(false), 600)
      return () => clearTimeout(timer)
    }
  }, [passed])
  
  return (
    <div 
      className={`min-h-screen flex flex-col items-center justify-center p-6 ${shake ? 'animate-shake' : ''}`}
    >
      {/* Three.js effects */}
      {passed ? <ParticleExplosion /> : <RedRain />}
      
      <div className="relative z-10 w-full max-w-[480px] mx-auto flex flex-col items-center gap-6">
        {/* Emoji */}
        <span 
          className={`text-[64px] ${passed ? 'animate-bounce-subtle' : 'animate-shake'}`}
          style={{ animationIterationCount: passed ? 'infinite' : '1' }}
        >
          {passed ? '🏆' : '💀'}
        </span>
        
        {/* Result text */}
        <h2 
          className={`text-[3.5rem] neon-glow ${passed ? '' : 'animate-glitch'}`}
          style={{ 
            fontFamily: 'Bangers, cursive', 
            letterSpacing: '0.06em',
            color: passed ? '#39ff14' : '#ff1744'
          }}
        >
          {passed ? 'APPROVED!' : 'REJECTED!'}
        </h2>
        
        {/* AI quote card */}
        <div 
          className="w-full p-5 rounded-xl"
          style={{
            background: passed ? 'rgba(57,255,20,0.05)' : 'rgba(255,23,68,0.05)',
            boxShadow: `inset 0 0 30px ${passed ? 'rgba(57,255,20,0.1)' : 'rgba(255,23,68,0.1)'}`,
          }}
        >
          <p 
            className="text-center text-[#eee] italic"
            style={{ fontFamily: 'DM Sans, sans-serif' }}
          >
            {`"${message}"`}
          </p>
        </div>
        
        {/* Confidence bar (approved only) */}
        {passed && (
          <div className="w-full">
            <div className="flex justify-between text-xs text-[#666] mb-2">
              <span>Confidence</span>
              <span>{Math.round(confidence * 100)}%</span>
            </div>
            <div className="w-full h-3 rounded-full bg-[#1a1a1a] overflow-hidden">
              <div 
                className="h-full rounded-full gradient-success"
                style={{ 
                  width: `${confidence * 100}%`,
                  animation: 'fill-bar 1s ease-out forwards'
                }}
              />
            </div>
          </div>
        )}
        
        {/* Points */}
        {showPoints && (
          <div 
            className={`text-[2.5rem] neon-glow animate-scale-bounce`}
            style={{ 
              fontFamily: 'Bangers, cursive', 
              letterSpacing: '0.06em',
              color: '#ffd60a'
            }}
          >
            +{points} PTS
          </div>
        )}
        
        {/* Next button */}
        <button
          onClick={onNext}
          className={`w-full py-4 rounded-xl chaos-btn text-[1.8rem] text-[#080808] ${
            passed ? 'gradient-success' : 'gradient-danger'
          }`}
          style={{ fontFamily: 'Bangers, cursive', letterSpacing: '0.06em' }}
        >
          {passed ? 'NEXT TASK →' : 'TRY AGAIN →'}
        </button>
      </div>
    </div>
  )
}
