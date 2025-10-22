/**
 * Chat Message Component
 * 
 * Displays a single chat message with proper styling and formatting
 */

import { Message } from '../types/message';
import { sanitizeHtml } from '../lib/sanitize-html';

interface ChatMessageProps {
    message: Message;
}

/**
 * Renders a single chat message bubble
 * 
 * Features:
 * - Different styling for user vs assistant messages
 * - HTML rendering for assistant messages (sanitized)
 * - Timestamp on hover
 * - Streaming indicator
 * - Facebook Messenger-style bubble design
 */
export function ChatMessage({ message }: ChatMessageProps) {
    const isUser = message.role === 'user';

    return (
        <div className={`group flex items-center ${isUser ? 'justify-end' : 'justify-start'}`}>
            {/* Timestamp (left side for user messages) */}
            {isUser && (
                <p className="text-xs opacity-0 group-hover:opacity-60 transition-opacity mr-2">
                    {message.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                </p>
            )}

            {/* Message bubble */}
            <div
                className={`max-w-[80%] p-4 ${isUser
                    ? 'bg-primary text-primary-foreground rounded-3xl rounded-br-sm'
                    : 'bg-muted rounded-3xl rounded-bl-sm'
                    }`}
            >
                {/* Message content */}
                {message.role === 'assistant' ? (
                    // Assistant messages support HTML formatting
                    <div
                        className="text-sm [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-2 [&_li]:my-1 [&_strong]:font-semibold [&_ol]:list-decimal [&_ol]:pl-5 [&_div]:my-2"
                        dangerouslySetInnerHTML={{
                            __html: sanitizeHtml(message.content) +
                                (message.isStreaming
                                    ? '<span class="inline-block w-2 h-2 ml-1 rounded-full bg-current animate-pulse align-middle"></span>'
                                    : ''
                                )
                        }}
                    />
                ) : (
                    // User messages are plain text
                    <>
                        <span className="text-sm whitespace-pre-wrap">{message.content}</span>
                        {/* Streaming indicator (pulsing circle) - inline with text */}
                        {message.isStreaming && (
                            <span className="inline-block w-2 h-2 ml-1 rounded-full bg-current animate-pulse align-middle" />
                        )}
                    </>
                )}
            </div>

            {/* Timestamp (right side for assistant messages) */}
            {!isUser && (
                <p className="text-xs opacity-0 group-hover:opacity-60 transition-opacity ml-2">
                    {message.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                </p>
            )}
        </div>
    );
}

