/**
 * Chatbot Feature Module
 *
 * A vertical slice containing all chatbot functionality:
 * - AI Agent Layer (OpenAI with usage tracking & logging)
 * - UI Components (ChatbotWidget, ChatMessage, ChatInput)
 * - Business Logic (tool executor, stream handler)
 * - Configuration (tools, prompts)
 * - Types and utilities
 */

// UI Components
export { ChatbotWidget } from './components/chatbot-widget';
export { ChatMessage } from './components/chat-message';
export { ChatInput } from './components/chat-input';

// Hooks
export { useChat } from './hooks/use-chat';

// Utilities
export { sanitizeHtml } from './lib/sanitize-html';

// Types
export type { Message, ChatbotWidgetProps } from './types/message';
