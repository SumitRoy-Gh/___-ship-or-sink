import type { Metadata, Viewport } from 'next'
import { DM_Sans, Bangers } from 'next/font/google'
import './globals.css'

const dmSans = DM_Sans({ 
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap'
})

const bangers = Bangers({ 
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bangers',
  display: 'swap'
})

export const metadata: Metadata = {
  title: 'CHAOS TASKS',
  description: 'Weird tasks. Real proof. Sarcastic AI judge.',
}

export const viewport: Viewport = {
  themeColor: '#080808',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

import AuthProvider from '@/components/AuthProvider'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${bangers.variable} bg-[#080808]`} suppressHydrationWarning>
      <body className="font-sans antialiased bg-[#080808] text-[#f5f5f5] min-h-screen">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
