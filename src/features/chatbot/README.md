# Chatbot Feature

Agent Martian - AI Assistant for the Casino Intelligence Platform

## Architecture

This feature follows **Vertical Slice Architecture**, containing all layers needed for chatbot functionality in one cohesive module.

## Structure

```
src/features/chatbot/
├── ai-agent/             # AI Agent Layer
│   └── chat-agent.ts        # OpenAI client with usage tracking & logging
├── components/           # UI Components
│   ├── chatbot-widget.tsx   # Main chat interface
│   ├── chat-message.tsx     # Message bubble component
│   └── chat-input.tsx       # Input field component
├── hooks/                # React Hooks
│   └── use-chat.ts          # Chat state management & streaming
├── lib/                  # Business Logic & Utilities
│   ├── stream-handler.ts    # SSE stream orchestration
│   ├── tool-executor.ts     # Database query execution
│   ├── tools.ts             # Tool definitions for OpenAI
│   ├── prompts.ts           # System prompts
│   ├── sanitize-html.ts     # HTML sanitization
│   └── constants.ts         # Shared constants
├── types/                # TypeScript Types
│   └── message.ts           # Message types
├── index.ts              # Public exports
└── README.md             # This file
```

## Key Features

### 1. **Streaming Responses**

- Server-Sent Events (SSE) for real-time streaming
- Progressive message updates
- Abort controller for cancellation

### 2. **Function Calling**

- OpenAI function calling for intelligent tool selection
- 8 read-only tools for database queries
- Smart casino search with state parsing

### 2.5. **AI Usage Tracking**

- Automatic tracking of all OpenAI API calls
- Token usage and cost estimation
- Success/failure monitoring
- Structured logging for debugging

### 3. **Security**

- HTML sanitization for AI-generated content
- Read-only database access
- No mutation operations allowed

### 4. **UX Features**

- Facebook Messenger-style chat bubbles
- Timestamp on hover
- Pulsing indicator during streaming
- Auto-scroll to latest message

## API Endpoint

**Endpoint:** `POST /api/chat`

**Request:**

```json
{
  "message": "What are the best offers for BetMGM in Michigan?"
}
```

**Response:** Server-Sent Events stream

```
data: {"content": "Let me check"}
data: {"content": " the offers"}
data: [DONE]
```

## Available Tools

1. **get_casino_stats** - Overall casino statistics
2. **get_casinos_by_state** - Casino distribution by state
3. **search_casinos** - Search casinos by name/state
4. **get_casino_details** - Detailed casino information
5. **get_offer_kpis** - Offer key performance indicators
6. **get_offer_timeline** - Research activity timeline
7. **get_best_offers** - Top promotional offers
8. **get_ai_usage_stats** - AI usage and costs

## Usage

### Basic Integration

```tsx
import { ChatbotWidget } from '@/features/chatbot';

export function MyPage() {
  return <ChatbotWidget />;
}
```

### Controlled Mode

```tsx
import { ChatbotWidget } from '@/features/chatbot';
import { useState } from 'react';

export function MyPage() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open Chat</button>
      <ChatbotWidget open={isOpen} onOpenChange={setIsOpen} showFloatingButton={false} />
    </>
  );
}
```

## Configuration

### Prompts

Edit `src/features/chatbot/lib/prompts.ts` to modify:

- Assistant behavior
- Response formatting
- Tool selection logic

### Tools

Edit `src/features/chatbot/lib/tools.ts` to:

- Add new tools
- Modify tool descriptions
- Update parameters

### Tool Execution

Edit `src/features/chatbot/lib/tool-executor.ts` to:

- Implement new tool logic
- Modify database queries
- Add custom business logic

### AI Agent

Edit `src/features/chatbot/ai-agent/chat-agent.ts` to:

- Modify OpenAI model settings
- Adjust usage tracking logic
- Change streaming behavior

## Environment Variables

Required:

- `OPENAI_API_KEY` - OpenAI API key for GPT-4o-mini
- `NEXT_PUBLIC_CONVEX_URL` - Convex database URL

## Extending the Chatbot

### Adding a New Tool

1. **Define the tool** in `lib/tools.ts`:

```typescript
{
  type: 'function',
  function: {
    name: 'my_new_tool',
    description: 'What this tool does',
    parameters: {
      type: 'object',
      properties: {
        arg1: { type: 'string', description: 'First argument' }
      },
      required: ['arg1']
    }
  }
}
```

2. **Implement execution** in `lib/tool-executor.ts`:

```typescript
case 'my_new_tool': {
  const result = await convex.query(api.myModule.myQuery, {
    arg: args.arg1
  });
  return JSON.stringify(result, null, 2);
}
```

3. **Update prompts** in `lib/prompts.ts` if needed

### Monitoring AI Usage

All AI operations are automatically tracked and logged:

- Check `ai_usage` table in Convex for usage metrics
- View logs for debugging chat behavior
- Monitor costs and token usage
- Track success/failure rates

Operations tracked:

- `chat-initial` - Initial tool determination
- `chat-tool-response` - Response with tool data
- `chat-greeting` - Greeting/conversational responses

### Customizing UI

All UI components are in `components/`:

- `chatbot-widget.tsx` - Main modal and layout
- `chat-message.tsx` - Message bubbles
- `chat-input.tsx` - Input field

Use Tailwind CSS for styling.

## Best Practices

1. **Keep tools read-only** - No mutations through the chatbot
2. **Use clear tool descriptions** - Help AI choose the right tool
3. **Sanitize HTML** - Always sanitize AI-generated HTML
4. **Handle errors gracefully** - Show user-friendly error messages
5. **Log for debugging** - Use console.log in tool executor

## Testing

Test the chatbot with these queries:

- "Hi" (greeting)
- "Which state has the most casinos?" (state stats)
- "What offers does BetMGM in Michigan have?" (search)
- "Show me the best offers" (offers)
- "AI usage stats" (usage tracking)

## Troubleshooting

**Issue: AI not using tools**

- Check prompts in `lib/prompts.ts`
- Verify tool descriptions are clear
- Check OpenAI API key

**Issue: Stream not working**

- Verify SSE headers in `app/api/chat/route.ts`
- Check network tab for connection errors
- Ensure fetch is not being aborted

**Issue: Tools returning empty results**

- Check Convex queries are working
- Verify database has data
- Check console logs in tool executor
