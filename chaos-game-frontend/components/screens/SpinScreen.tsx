'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

const SEGMENTS = [
  { label: 'EASY', emoji: '🥱', color: '#39ff14', message: "Grandma mode activated. Don't embarrass us." },
  { label: 'MEDIUM', emoji: '😤', color: '#ff4d00', message: "Spicy but survivable. Probably. No promises." },
  { label: 'HARD', emoji: '💀', color: '#ff1744', message: "You chose violence. The chaos gods respect this. 💀" },
]

interface SpinScreenProps {
  onSpinResult: (result: typeof SEGMENTS[number]) => void
  lastResult: typeof SEGMENTS[number] | null
}

export default function SpinScreen({ onSpinResult, lastResult }: SpinScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isSpinning, setIsSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)
  const confettiRef = useRef<HTMLCanvasElement>(null)
  
  // Draw the wheel
  const drawWheel = useCallback((ctx: CanvasRenderingContext2D, currentRotation: number) => {
    const size = 260
    const centerX = size / 2
    const centerY = size / 2
    const radius = size / 2 - 10
    const segmentAngle = (2 * Math.PI) / SEGMENTS.length
    
    ctx.clearRect(0, 0, size, size)
    ctx.save()
    ctx.translate(centerX, centerY)
    ctx.rotate(currentRotation)
    ctx.translate(-centerX, -centerY)
    
    // Draw segments
    SEGMENTS.forEach((seg, i) => {
      const startAngle = i * segmentAngle - Math.PI / 2
      const endAngle = startAngle + segmentAngle
      
      // Segment fill
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, startAngle, endAngle)
      ctx.closePath()
      ctx.fillStyle = seg.color + '26' // 15% opacity
      ctx.fill()
      ctx.strokeStyle = seg.color
      ctx.lineWidth = 2
      ctx.stroke()
      
      // Draw emoji and label
      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.rotate(startAngle + segmentAngle / 2)
      ctx.textAlign = 'center'
      ctx.font = '20px sans-serif'
      ctx.fillText(seg.emoji, radius * 0.6, 6)
      ctx.font = 'bold 9px sans-serif'
      ctx.fillStyle = seg.color
      ctx.fillText(seg.label, radius * 0.38, 5)
      ctx.restore()
    })
    
    ctx.restore()
    
    // Center circle
    ctx.beginPath()
    ctx.arc(centerX, centerY, 20, 0, Math.PI * 2)
    ctx.fillStyle = '#0d0d0d'
    ctx.fill()
    ctx.strokeStyle = '#ff4d00'
    ctx.lineWidth = 3
    ctx.stroke()
  }, [])
  
  // Draw pointer
  const drawPointer = useCallback((ctx: CanvasRenderingContext2D) => {
    const size = 260
    const centerX = size / 2
    
    ctx.beginPath()
    ctx.moveTo(centerX - 12, 5)
    ctx.lineTo(centerX + 12, 5)
    ctx.lineTo(centerX, 25)
    ctx.closePath()
    ctx.fillStyle = '#ff4d00'
    ctx.fill()
    ctx.shadowColor = '#ff4d00'
    ctx.shadowBlur = 10
    ctx.fill()
    ctx.shadowBlur = 0
  }, [])
  
  // Initial draw
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    drawWheel(ctx, rotation)
    drawPointer(ctx)
  }, [rotation, drawWheel, drawPointer])
  
  // Confetti effect
  useEffect(() => {
    if (!showConfetti) return
    
    const canvas = confettiRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    canvas.width = 300
    canvas.height = 400
    
    const particles: { x: number; y: number; vx: number; vy: number; color: string; size: number }[] = []
    for (let i = 0; i < 30; i++) {
      particles.push({
        x: 150,
        y: 200,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10 - 5,
        color: SEGMENTS[Math.floor(Math.random() * SEGMENTS.length)].color,
        size: Math.random() * 6 + 3,
      })
    }
    
    let frame = 0
    const animate = () => {
      ctx.clearRect(0, 0, 300, 400)
      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.3
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.fill()
      })
      frame++
      if (frame < 60) requestAnimationFrame(animate)
    }
    animate()
    
    const timer = setTimeout(() => setShowConfetti(false), 1500)
    return () => clearTimeout(timer)
  }, [showConfetti])
  
  const spin = () => {
    if (isSpinning) return
    setIsSpinning(true)
    
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const targetRotations = 3 + Math.random() * 2 // 3-5 full rotations
    const targetAngle = targetRotations * Math.PI * 2 + Math.random() * Math.PI * 2
    const duration = 3000 + Math.random() * 2000 // 3-5 seconds
    const startTime = Date.now()
    const startRotation = rotation
    
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      const currentRotation = startRotation + targetAngle * eased
      
      setRotation(currentRotation)
      drawWheel(ctx, currentRotation)
      drawPointer(ctx)
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        // Calculate winning segment
        // The wheel segments start at -PI/2 (Top).
        // If the wheel rotates clockwise by R, the segment that ends up at the pointer is at -R on the original wheel.
        const normalizedRotation = (currentRotation % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2)
        const segmentAngle = (Math.PI * 2) / SEGMENTS.length
        
        // At rotation 0, segment 0 is at the top.
        // As rotation increases (clockwise), we move backwards through the indices.
        const segmentIndex = Math.floor((Math.PI * 2 - (normalizedRotation % (Math.PI * 2))) / segmentAngle) % SEGMENTS.length
        setIsSpinning(false)
        setShowConfetti(true)
        onSpinResult(SEGMENTS[segmentIndex])
      }
    }
    
    animate()
  }
  
  return (
    <div className="flex flex-col items-center px-4 pt-20 pb-24">
      {/* Heading */}
      <h2 className="font-display text-3xl tracking-wider animate-chromatic animate-glitch mb-2">
        WHEEL OF FATE
      </h2>
      <p className="text-[#666] text-sm mb-6">Spin to determine your destiny...</p>
      
      {/* Wheel container */}
      <div className="relative mb-6">
        <canvas
          ref={canvasRef}
          width={260}
          height={260}
          className="relative z-10"
        />
        {showConfetti && (
          <canvas
            ref={confettiRef}
            className="absolute inset-0 pointer-events-none z-20"
            style={{ left: '-20px', top: '-70px' }}
          />
        )}
      </div>
      
      {/* Spin button */}
      <button
        onClick={spin}
        disabled={isSpinning}
        className={`
          chaos-btn w-full max-w-[260px] py-3 rounded-xl text-xl text-white
          gradient-primary disabled:opacity-50
        `}
      >
        {isSpinning ? 'SPINNING...' : 'SPIN IT! 🎰'}
      </button>
      
      {/* Result card */}
      {lastResult && !isSpinning && (
        <div className="mt-6 w-full max-w-[300px] p-4 rounded-xl bg-[#0d0d0d] border-2 animate-rborder animate-scale-bounce">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">{lastResult.emoji}</span>
            <span 
              className="font-display text-2xl tracking-wider"
              style={{ color: lastResult.color }}
            >
              {lastResult.label}
            </span>
          </div>
          <p className="text-sm text-[#888] leading-relaxed">
            {lastResult.message}
          </p>
        </div>
      )}
    </div>
  )
}
