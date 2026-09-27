'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function ChatInterface() {
  const [prompt, setPrompt] = useState('')
  const [output, setOutput] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    if (!prompt.trim() || loading) return
    setLoading(true)
    setError(null)
    setOutput(null)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generation failed')
      setOutput(data.generatedText)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter a prompt for Brain..."
        rows={4}
        disabled={loading}
      />
      <Button onClick={handleSubmit} disabled={loading || !prompt.trim()}>
        {loading ? 'Generating…' : 'Generate'}
      </Button>

      {loading && (
        <Card>
          <CardContent className="space-y-2 pt-6">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-red-900 bg-red-950/40">
          <CardContent className="pt-6 text-red-300">{error}</CardContent>
        </Card>
      )}

      {output && !loading && (
        <Card>
          <CardContent className="whitespace-pre-wrap pt-6">{output}</CardContent>
        </Card>
      )}
    </div>
  )
}
