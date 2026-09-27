import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { Button } from '@/components/ui/button'

export default async function LandingPage() {
  const { userId } = await auth()
  if (userId) redirect('/dashboard')

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6">
      <h1 className="text-4xl font-bold tracking-tight">Brain</h1>
      <p className="max-w-xl text-center text-zinc-400">
        A 33M-parameter causal language model, trained from scratch. Prototype
        build — outputs reflect an early-stage checkpoint.
      </p>
      <SignedOut>
        <SignInButton mode="modal">
          <Button size="lg">Sign in to try it</Button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <Button size="lg" asChild>
          <a href="/dashboard">Go to dashboard</a>
        </Button>
      </SignedIn>
    </main>
  )
}
