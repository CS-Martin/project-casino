/**
 * Chat Message Types
 *
 * Type definitions for chat messages and related interfaces
 */

/**
 * Represents a single message in the chat
 */
export interface Message {
  /** Unique identifier for the message */
  id: string;

  /** Role of the message sender */
  role: 'user' | 'assistant';

  /** Message content (supports HTML for assistant messages) */
  content: string;

  /** When the message was sent */
  timestamp: Date;

  /** Whether the message is currently being streamed */
  isStreaming?: boolean;
}

/**
 * Props for the ChatbotWidget component
 */
export interface ChatbotWidgetProps {
  /** Controlled open state */
  open?: boolean;

  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;

  /** Whether to show the floating chat button */
  showFloatingButton?: boolean;
}
