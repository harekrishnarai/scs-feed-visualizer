import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SCS Feed Visualizer',
  description: 'Supply Chain Security Intelligence Dashboard',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100">
        {children}
      </body>
    </html>
  )
}
