const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  sources?: SourceReference[]
  timestamp?: string
}

export interface SourceReference {
  documentName: string
  excerpt: string
  score: number
}

export interface ChatResponse {
  answer: string
  sessionId: string
  sources: SourceReference[]
  timestamp: string
}

export async function sendMessage(
  message: string,
  sessionId?: string
): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, sessionId }),
  })

  if (!res.ok) {
    throw new Error(`Erro na API: ${res.status}`)
  }

  return res.json()
}

export async function uploadDocument(file: File): Promise<{ fileName: string; chunks: number }> {
  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch(`${API_BASE}/api/documents/upload`, {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    throw new Error(`Erro no upload: ${res.status}`)
  }

  return res.json()
}