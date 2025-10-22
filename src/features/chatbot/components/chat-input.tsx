/**
 * Chat Input Component
 * 
 * Input area for typing and sending messages
 */

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Loader2 } from 'lucide-react';

interface ChatInputProps {
    /** Current input value */
    value: string;

    /** Input change handler */
    onChange: (value: string) => void;

    /** Send message handler */
    onSend: () => void;

    /** Key press handler (for Enter key) */
    onKeyPress: (e: React.KeyboardEvent) => void;

    /** Whether message is being sent */
    isLoading: boolean;
}

/**
 * Chat input with send button
 * 
 * Features:
 * - Auto-focus on mount
 * - Enter to send (Shift+Enter for new line)
 * - Disabled state during loading
 * - Send button with loading indicator
 */
export function ChatInput({ value, onChange, onSend, onKeyPress, isLoading }: ChatInputProps) {
    return (
        <div className="px-6 py-4 border-t">
            <div className="flex gap-2">
                <Input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyPress={onKeyPress}
                    placeholder="Ask me anything about casinos, offers, or statistics..."
                    disabled={isLoading}
                    className="flex-1"
                />
                <Button onClick={onSend} disabled={!value.trim() || isLoading} size="icon">
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
            </div>
        </div>
    );
}

