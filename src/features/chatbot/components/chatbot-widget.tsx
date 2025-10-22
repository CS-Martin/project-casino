/**
 * Chatbot Widget Component
 * 
 * Main chatbot interface with modal dialog and optional floating button.
 * Provides AI-powered assistance for casino intelligence queries.
 * 
 * Features:
 * - Streaming responses from OpenAI
 * - HTML-formatted messages for better readability
 * - Hover-to-show timestamps
 * - Facebook Messenger-style chat bubbles
 * - Keyboard shortcuts (Enter to send)
 * - Abort streaming on close
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MessageCircle } from 'lucide-react';
import { useChat } from '../hooks/use-chat';
import { ChatMessage } from './chat-message';
import { ChatInput } from './chat-input';
import { ChatbotWidgetProps } from '../types/message';

/**
 * Chatbot Widget with modal interface
 * 
 * @example
 * ```tsx
 * // Controlled mode (from header)
 * <ChatbotWidget 
 *   open={isOpen} 
 *   onOpenChange={setIsOpen}
 *   showFloatingButton={false}
 * />
 * 
 * // Standalone mode (with floating button)
 * <ChatbotWidget />
 * ```
 */
export function ChatbotWidget({
  open: controlledOpen,
  onOpenChange,
  showFloatingButton = true,
}: ChatbotWidgetProps = {}) {
  // Internal open state (used when not controlled)
  const [internalOpen, setInternalOpen] = useState(false);

  // Use controlled or internal state
  const isOpen = controlledOpen ?? internalOpen;
  const setIsOpen = onOpenChange ?? setInternalOpen;

  // Chat functionality
  const {
    messages,
    input,
    setInput,
    isLoading,
    sendMessage,
    handleKeyPress,
    cancelStreaming,
    messagesEndRef,
  } = useChat();

  /**
   * Handles dialog close with cleanup
   */
  const handleClose = () => {
    cancelStreaming();
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Chat Button (optional) */}
      {showFloatingButton && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow z-50"
          size="icon"
          aria-label="Open chat"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {/* Chat Modal */}
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-[900px] h-[80vh] flex flex-col p-0">
          {/* Header */}
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Casino Intelligence Assistant
            </DialogTitle>
          </DialogHeader>

          {/* Messages List */}
          <div className="flex-1 overflow-y-auto px-6 py-2 space-y-4">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {/* Scroll anchor */}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <ChatInput
            value={input}
            onChange={setInput}
            onSend={sendMessage}
            onKeyPress={handleKeyPress}
            isLoading={isLoading}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
