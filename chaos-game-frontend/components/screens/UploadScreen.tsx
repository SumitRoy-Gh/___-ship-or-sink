'use client'

import { useState, useRef, useCallback } from 'react'

interface UploadScreenProps {
  task: { task: string; taskLabel: string }
  onSubmit: (file: File) => void
}

export default function UploadScreen({ task, onSubmit }: UploadScreenProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  
  const handleFile = useCallback((f: File) => {
    setFile(f)
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target?.result as string)
    reader.readAsDataURL(f)
  }, [])
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const f = e.dataTransfer.files[0]
    if (f && (f.type.startsWith('image/') || f.type.startsWith('video/'))) {
      handleFile(f)
    }
  }, [handleFile])
  
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) handleFile(f)
  }, [handleFile])
  
  const handleSubmit = useCallback(() => {
    if (file) onSubmit(file)
  }, [file, onSubmit])
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-[480px] mx-auto flex flex-col items-center gap-6">
        {/* Heading */}
        <h2 
          className="text-4xl animate-glitch text-[#f5f5f5]"
          style={{ fontFamily: 'Bangers, cursive', letterSpacing: '0.06em' }}
        >
          PROVE IT
        </h2>
        
        {/* Task recap */}
        <div 
          className="w-full p-4 rounded-xl border-2 animate-rborder"
          style={{
            background: 'rgba(255,77,0,0.05)',
          }}
        >
          <p 
            className="text-center text-[#eee]"
            style={{ fontFamily: 'DM Sans, sans-serif' }}
          >
            {task.task}
          </p>
        </div>
        
        {/* Upload zone */}
        {!preview ? (
          <button
            onClick={() => inputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            className={`w-full aspect-square rounded-xl flex flex-col items-center justify-center gap-4 transition-all ${
              isDragging ? 'border-solid' : 'border-dashed'
            }`}
            style={{
              border: '3px dashed',
              borderColor: isDragging ? '#00e5ff' : '#444',
              background: isDragging ? 'rgba(0,229,255,0.05)' : 'transparent',
              animation: isDragging ? 'rborder 2s linear infinite' : undefined,
              boxShadow: isDragging ? 'inset 0 0 30px rgba(0,229,255,0.1)' : undefined,
            }}
          >
            <span className="text-[48px]">&#128247;</span>
            <span 
              className="text-[1.4rem] animate-chromatic text-center px-4"
              style={{ fontFamily: 'Bangers, cursive', letterSpacing: '0.06em' }}
            >
              TAP TO UPLOAD PHOTO OR VIDEO
            </span>
          </button>
        ) : (
          <div 
            className="w-full rounded-2xl overflow-hidden border-2 animate-rborder bg-black"
            style={{ aspectRatio: '1' }}
          >
            {file?.type.startsWith('video/') ? (
              <video 
                src={preview!}
                className="w-full h-full object-cover"
                controls
                muted
                playsInline
              />
            ) : (
              <img 
                src={preview!} 
                alt="Preview" 
                className="w-full h-full object-cover"
              />
            )}
          </div>
        )}
        
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleChange}
          className="hidden"
        />
        
        {/* Submit button */}
        {file && (
          <button
            onClick={handleSubmit}
            className="w-full py-4 rounded-xl gradient-primary chaos-btn text-[1.8rem] text-[#080808]"
            style={{ fontFamily: 'Bangers, cursive', letterSpacing: '0.06em' }}
          >
            {"SUBMIT PROOF ⚡"}
          </button>
        )}
      </div>
    </div>
  )
}
