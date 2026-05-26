'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ChatMessage } from '@/lib/api'
import { Bot, User, FileText } from 'lucide-react'
import { clsx } from 'clsx'

interface Props {
  message: ChatMessage
}

export default function MessageBubble({ message }: Props) {
  const isUser = message.role === 'user'

  return (
    <div className={clsx('flex gap-3', isUser && 'flex-row-reverse')}>
      {/* Avatar */}
      <div
        className={clsx(
          'flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full',
          isUser
            ? 'bg-brand-500'
            : 'bg-gray-200 dark:bg-gray-700'
        )}
      >
        {isUser
          ? <User className="w-4 h-4 text-white" />
          : <Bot className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        }
      </div>

      {/* Bubble */}
      <div className={clsx('max-w-[75%] space-y-2', isUser && 'items-end flex flex-col')}>
        <div
          className={clsx(
            'px-4 py-3 rounded-2xl text-sm leading-relaxed',
            isUser
              ? 'bg-brand-500 text-white rounded-tr-sm'
              : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-tl-sm shadow-sm'
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Sources */}
        {message.sources && message.sources.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs text-gray-400 dark:text-gray-500 ml-1">Fontes:</p>
            {message.sources.map((src, i) => (
              <div
                key={i}
                className="flex items-start gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-xs"
              >
                <FileText className="w-3 h-3 mt-0.5 text-brand-500 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-700 dark:text-gray-300">{src.documentName}</p>
                  <p className="text-gray-500 dark:text-gray-500 mt-0.5 line-clamp-2">{src.excerpt}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}