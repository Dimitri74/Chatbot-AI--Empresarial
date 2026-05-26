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

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function handleErrorResponse(res: Response, fallback: string): Promise<never> {
  let message = fallback
  try {
    const body = await res.json()
    if (typeof body?.error === 'string') message = body.error
  } catch {
    // body nao e JSON — usa fallback
  }
  throw new ApiError(res.status, message)
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
    await handleErrorResponse(res, `Erro na API: ${res.status}`)
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
    await handleErrorResponse(res, `Erro no upload: ${res.status}`)
  }

  return res.json()
}