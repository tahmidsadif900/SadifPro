import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Sadif Pro',
  description: 'Sadif Pro messaging app',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
