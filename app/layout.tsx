import { ClerkProvider } from '@clerk/nextjs'
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Brain',
  description: 'A 33M-parameter causal language model, trained from scratch.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="bg-zinc-950 text-zinc-100 antialiased">{children}</body>
      </html>
    </ClerkProvider>
  )
}
