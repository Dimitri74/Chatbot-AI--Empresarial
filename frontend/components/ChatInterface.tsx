'use client'

import { useState, useRef, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { sendMessage, uploadDocument, ChatMessage, ApiError } from '@/lib/api'
import MessageBubble from './MessageBubble'
import UploadButton from './UploadButton'
import { Send, Bot } from 'lucide-react'

export default function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [sessionId] = useState(() => uuidv4())
  const [isLoading, setIsLoading] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  async function handleSend() {
    const text = input.trim()
    if (!text || isLoading) return

    const userMsg: ChatMessage = { role: 'user', content: text, timestamp: new Date().toISOString() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    try {
      const response = await sendMessage(text, sessionId)
      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: response.answer,
        sources: response.sources,
        timestamp: response.timestamp,
      }
      setMessages(prev => [...prev, assistantMsg])
    } catch (err) {
      const content = resolveErrorMessage(err)
      setMessages(prev => [...prev, { role: 'assistant', content }])
    } finally {
      setIsLoading(false)
    }
  }

  async function handleUpload(file: File) {
    try {
      const result = await uploadDocument(file)
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `Documento **${result.fileName}** indexado com sucesso! (${result.chunks} chunks processados)`,
        },
      ])
    } catch (err) {
      const content = err instanceof ApiError && err.status === 400
        ? `Nao foi possivel processar o arquivo: ${err.message}`
        : 'Erro ao fazer upload do documento. Verifique o formato e o tamanho (max 10 MB).'
      setMessages(prev => [...prev, { role: 'assistant', content }])
    }
  }

  function resolveErrorMessage(err: unknown): string {
    if (err instanceof ApiError) {
      if (err.status === 400) return 'Sua mensagem nao pôde ser processada. Por favor, reformule e tente novamente.'
      if (err.status === 429) return 'Muitas mensagens em pouco tempo. Aguarde um momento antes de tentar novamente.'
      if (err.status >= 500) return 'O servidor encontrou um problema. Tente novamente em instantes.'
    }
    return 'Erro ao conectar com o servidor. Verifique se o backend esta rodando.'
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand-500">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Assistente Empresarial</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Powered by RAG + Ollama</p>
          </div>
        </div>
        <button
          onClick={() => setIsDark(d => !d)}
          className="px-3 py-1.5 text-sm rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          {isDark ? 'Claro' : 'Escuro'}
        </button>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 dark:text-gray-600">
            <Bot className="w-16 h-16 mb-4 opacity-30" />
            <p className="text-lg font-medium">Como posso ajudar?</p>
            <p className="text-sm mt-1">Faca uma pergunta ou envie um documento para comecar.</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500 text-sm ml-2">
            <div className="flex gap-1">
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-bounce [animation-delay:0ms]" />
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-bounce [animation-delay:150ms]" />
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-bounce [animation-delay:300ms]" />
            </div>
            Processando...
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 pb-4">
        <div className="flex items-end gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-3 shadow-sm">
          <UploadButton onUpload={handleUpload} />
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder="Digite sua pergunta... (Enter para enviar, Shift+Enter para nova linha)"
            rows={1}
            className="flex-1 resize-none bg-transparent outline-none text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 max-h-32 overflow-y-auto"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  )
}