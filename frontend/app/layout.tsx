import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'

import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'ORCA - Operations & Reliability Command Assistant',
  description: 'Real-time monitoring dashboard for system telemetry, anomaly detection, and AI-powered incident analysis',
  icons: {
    icon: [
      {
        url: '/orca-logo.png',
      },
    ],
    apple: '/orca-logo.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased">
        {children}

      </body>
    </html>
  )
}
