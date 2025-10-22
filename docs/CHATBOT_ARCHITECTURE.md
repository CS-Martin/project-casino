# Agent Martian - Chatbot Architecture

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           USER INTERFACE LAYER                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  Header.tsx (Trigger Button)                                      │  │
│  │         ↓                                                          │  │
│  │  ChatbotWidget.tsx (Modal Dialog)                                 │  │
│  │    ├── ChatInput.tsx (User Input)                                 │  │
│  │    ├── ChatMessage.tsx (Message Bubbles)                          │  │
│  │    └── useChat Hook (State Management)                            │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │ HTTP POST /api/chat
                                 │ { message: "..." }
                                 ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                          API ROUTE LAYER                                │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  /app/api/chat/route.ts                                           │  │
│  │    - Validates request                                            │  │
│  │    - Creates SSE stream                                           │  │
│  │    - Returns streaming response                                   │  │
│  └─────────────────────────────┬─────────────────────────────────────┘  │
└─────────────────────────────────┼─────────────────────────────────────────┘
                                  │ createChatStream(message)
                                  ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                      STREAM ORCHESTRATION LAYER                         │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  stream-handler.ts                                                │  │
│  │    1. Get initial completion (tool selection)                     │  │
│  │    2. Check if tools needed                                       │  │
│  │    3. Execute tools if needed                                     │  │
│  │    4. Stream final response                                       │  │
│  └─────────────┬─────────────────────────────┬───────────────────────┘  │
└─────────────────┼─────────────────────────────┼───────────────────────────┘
                  │                             │
                  │ AI Agent Calls              │ Tool Execution
                  ↓                             ↓
┌────────────────────────────────┐  ┌──────────────────────────────────────┐
│     AI AGENT LAYER             │  │     TOOL EXECUTOR LAYER              │
│  ┌──────────────────────────┐  │  │  ┌────────────────────────────────┐  │
│  │  chat-agent.ts           │  │  │  │  tool-executor.ts              │  │
│  │                          │  │  │  │                                │  │
│  │  Functions:              │  │  │  │  executeTool(name, args)       │  │
│  │  • getInitialCompletion  │  │  │  │    ├── get_casino_stats        │  │
│  │  • streamToolResponse    │  │  │  │    ├── get_casinos_by_state    │  │
│  │  • streamGreetingResponse│  │  │  │    ├── search_casinos          │  │
│  │                          │  │  │  │    ├── get_casino_details      │  │
│  │  Features:               │  │  │  │    ├── get_offer_kpis          │  │
│  │  • OpenAI API calls      │  │  │  │    ├── get_offer_timeline      │  │
│  │  • Usage tracking        │  │  │  │    ├── get_best_offers         │  │
│  │  • Structured logging    │  │  │  │    └── get_ai_usage_stats      │  │
│  │  • Error handling        │  │  │  │                                │  │
│  └──────────┬───────────────┘  │  │  └────────────┬───────────────────┘  │
└─────────────┼──────────────────┘  └─────────────────┼──────────────────────┘
              │                                       │
              │ Uses prompts.ts                       │ Convex Queries
              │ Uses tools.ts                         ↓
              ↓                           ┌──────────────────────────────┐
┌──────────────────────────────┐         │  DATABASE LAYER (Convex)     │
│  CONFIGURATION LAYER         │         │  ┌────────────────────────┐  │
│  ┌────────────────────────┐  │         │  │  api.casinos.index     │  │
│  │  prompts.ts            │  │         │  │  api.offers.index      │  │
│  │  • INITIAL_PROMPT      │  │         │  │  api.ai_usage.index    │  │
│  │  • TOOL_RESPONSE_PROMPT│  │         │  └────────────────────────┘  │
│  │  • GREETING_PROMPT     │  │         └──────────────────────────────┘
│  └────────────────────────┘  │
│  ┌────────────────────────┐  │         ┌──────────────────────────────┐
│  │  tools.ts              │  │         │  EXTERNAL SERVICES           │
│  │  • Tool definitions    │  │         │  ┌────────────────────────┐  │
│  │  • OpenAI function     │  │         │  │  OpenAI API            │  │
│  │    calling schema      │  │         │  │  • gpt-4o-mini         │  │
│  └────────────────────────┘  │         │  │  • Function calling    │  │
│  ┌────────────────────────┐  │         │  │  • Streaming           │  │
│  │  constants.ts          │  │         │  └────────────────────────┘  │
│  │  • WELCOME_MESSAGE     │  │         └──────────────────────────────┘
│  │  • OFF_TOPIC_RESPONSE  │  │
│  └────────────────────────┘  │         ┌──────────────────────────────┐
│  ┌────────────────────────┐  │         │  UTILITIES                   │
│  │  sanitize-html.ts      │  │         │  ┌────────────────────────┐  │
│  │  • XSS protection      │  │         │  │  logger.ts             │  │
│  │  • Safe HTML rendering │  │         │  │  ai-cost-tracker.ts    │  │
│  └────────────────────────┘  │         │  └────────────────────────┘  │
└──────────────────────────────┘         └──────────────────────────────┘
```

## 📊 Data Flow Diagram

```
┌──────────┐
│  User    │
│  Types   │
│ Message  │
└────┬─────┘
     │
     ↓
┌─────────────────────────────────────────────────────────────┐
│ 1. UI LAYER - ChatbotWidget + useChat Hook                  │
│    • User types message                                     │
│    • useChat.sendMessage() called                           │
│    • Create user message bubble                             │
│    • Create placeholder for AI response                     │
└────┬────────────────────────────────────────────────────────┘
     │ fetch('/api/chat', { method: 'POST', body: { message } })
     ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. API ROUTE - /app/api/chat/route.ts                       │
│    • Receive request                                        │
│    • Validate message                                       │
│    • Call createChatStream(message)                         │
│    • Return SSE stream                                      │
└────┬────────────────────────────────────────────────────────┘
     │
     ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. STREAM HANDLER - stream-handler.ts                       │
│    • Create ReadableStream                                  │
│    • Call getInitialChatCompletion(message)                 │
└────┬────────────────────────────────────────────────────────┘
     │
     ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. AI AGENT - chat-agent.ts                                 │
│    getInitialChatCompletion():                              │
│    • Send message + INITIAL_PROMPT to OpenAI                │
│    • Track token usage                                      │
│    • Log operation                                          │
│    • Return: tool_calls OR direct response                  │
└────┬────────────────────────────────────────────────────────┘
     │
     ├──[NO TOOLS]─────────────────────────┐
     │                                     │
     │                                     ↓
     │                        ┌────────────────────────────────┐
     │                        │ streamGreetingResponse()       │
     │                        │ • GREETING_PROMPT              │
     │                        │ • Stream to client             │
     │                        └────────────────────────────────┘
     │
     └──[HAS TOOLS]────────────────────────┐
                                           │
                                           ↓
                              ┌────────────────────────────────┐
                              │ 5. TOOL EXECUTOR               │
                              │    executeTool(name, args)     │
                              │    • Parse arguments           │
                              │    • Call Convex query         │
                              │    • Return JSON data          │
                              └────┬───────────────────────────┘
                                   │
                                   ↓
                              ┌────────────────────────────────┐
                              │ 6. DATABASE QUERY              │
                              │    • convex.query(api.*.*)     │
                              │    • Fetch data                │
                              │    • Return results            │
                              └────┬───────────────────────────┘
                                   │
                                   ↓
                              ┌────────────────────────────────┐
                              │ 7. AI AGENT AGAIN              │
                              │    streamToolResponse()        │
                              │    • Message + Tool Result     │
                              │    • TOOL_RESPONSE_PROMPT      │
                              │    • Stream formatted answer   │
                              │    • Track usage               │
                              └────┬───────────────────────────┘
                                   │
     ┌─────────────────────────────┘
     │
     ↓
┌─────────────────────────────────────────────────────────────┐
│ 8. STREAM TO CLIENT                                         │
│    • SSE chunks: data: { content: "..." }                   │
│    • UI updates message progressively                       │
│    • Sanitize HTML before rendering                         │
│    • Show pulsing cursor during stream                      │
│    • Final: data: [DONE]                                    │
└─────────────────────────────────────────────────────────────┘
     │
     ↓
┌──────────┐
│  User    │
│  Sees    │
│ Response │
└──────────┘
```

## 🔄 Request/Response Flow

### Example: "What offers does BetMGM in Michigan have?"

```
1. USER INPUT
   ↓
   "What offers does BetMGM in Michigan have?"

2. API ROUTE (/api/chat)
   ↓
   POST { message: "What offers..." }

3. STREAM HANDLER
   ↓
   createChatStream("What offers...")

4. AI AGENT - Initial Completion
   ↓
   OpenAI + INITIAL_PROMPT
   ↓
   Decision: Use search_casinos tool
   ↓
   tool_call: {
     name: "search_casinos",
     arguments: { query: "BetMGM Michigan" }  // Cleaned!
   }

5. TOOL EXECUTOR
   ↓
   executeTool("search_casinos", { query: "BetMGM Michigan" })
   ↓
   parseSearchQuery("BetMGM Michigan")
   → casinoName: "BetMGM"
   → stateName: "Michigan"
   ↓
   convex.query(api.casinos.index.getCasinosSearchable, {
     searchTerm: "BetMGM",
     paginationOpts: { numItems: 10, cursor: null }
   })
   ↓
   Filter by state: "Michigan"
   ↓
   Fetch offers: getCasinoDetailWithOffers(casinoId)
   ↓
   Return JSON: {
     casino: {...},
     offerDetails: {
       activeOffers: [...]
     }
   }

6. AI AGENT - Tool Response
   ↓
   streamToolResponse(
     message: "What offers...",
     toolResult: JSON data,
     prompt: TOOL_RESPONSE_PROMPT
   )
   ↓
   OpenAI streams formatted response:
   "Here's what I found for BetMGM in Michigan:<br><br>
   <div>
   <strong>Welcome Bonus</strong><br>
   Type: Deposit Match<br>
   Bonus: $1,000<br>
   Wagering: 1x<br>
   Valid Until: Dec 31, 2025
   </div>"

7. CLIENT RECEIVES STREAM
   ↓
   data: {"content":"Here's"}
   data: {"content":" what"}
   data: {"content":" I found"}
   ...
   data: [DONE]

8. UI RENDERS
   ↓
   • Sanitize HTML
   • Render formatted message
   • Remove pulsing cursor
   • Auto-scroll to bottom
```

## 🧩 Component Interaction

```
┌─────────────────────────────────────────────────────────────────┐
│                    React Component Tree                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  <SiteHeader>                                                   │
│    │                                                            │
│    ├─ [chatbotOpen state]                                      │
│    ├─ <Button onClick={setChatbotOpen(true)}>                  │
│    │     <MessageCircle />                                     │
│    │                                                            │
│    └─ <ChatbotWidget                                           │
│         open={chatbotOpen}                                     │
│         onOpenChange={setChatbotOpen}                          │
│         showFloatingButton={false}                             │
│       >                                                        │
│         │                                                      │
│         ├─ useChat() Hook                                     │
│         │    ├─ [messages] state                              │
│         │    ├─ [input] state                                 │
│         │    ├─ [isLoading] state                             │
│         │    ├─ sendMessage()                                 │
│         │    └─ messagesEndRef                                │
│         │                                                      │
│         ├─ <DialogContent>                                    │
│         │    │                                                │
│         │    ├─ <DialogHeader>                                │
│         │    │     Agent Martian                              │
│         │    │                                                │
│         │    ├─ <ScrollArea>                                  │
│         │    │    └─ messages.map(msg =>                      │
│         │    │         <ChatMessage                           │
│         │    │            message={msg}                       │
│         │    │            key={msg.id}                        │
│         │    │         />                                     │
│         │    │       )                                        │
│         │    │                                                │
│         │    └─ <ChatInput                                    │
│         │         value={input}                               │
│         │         onChange={setInput}                         │
│         │         onSend={sendMessage}                        │
│         │         onKeyPress={handleKeyPress}                 │
│         │         disabled={isLoading}                        │
│         │       />                                            │
│         │                                                      │
│         └─ [Floating Button - hidden in this case]            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 📁 File Organization (Vertical Slice)

```
src/features/chatbot/
│
├── ai-agent/                    # AI Layer
│   └── chat-agent.ts           # OpenAI client with tracking
│       ├── getInitialChatCompletion()
│       ├── streamToolResponse()
│       └── streamGreetingResponse()
│
├── components/                  # UI Layer
│   ├── chatbot-widget.tsx      # Main modal container
│   ├── chat-message.tsx        # Individual message bubble
│   └── chat-input.tsx          # Input field + send button
│
├── hooks/                       # State Management
│   └── use-chat.ts             # Chat logic & SSE handling
│       ├── useState (messages, input, isLoading)
│       ├── useRef (messagesEndRef, abortControllerRef)
│       ├── sendMessage()
│       └── handleKeyPress()
│
├── lib/                         # Business Logic
│   ├── stream-handler.ts       # SSE orchestration
│   ├── tool-executor.ts        # Database queries
│   ├── tools.ts                # OpenAI tool definitions
│   ├── prompts.ts              # System prompts
│   ├── sanitize-html.ts        # XSS protection
│   └── constants.ts            # Shared constants
│
├── types/                       # TypeScript
│   └── message.ts              # Message & Props types
│
├── index.ts                     # Public API exports
└── README.md                    # Documentation
```

## 🔐 Security & Quality

```
┌─────────────────────────────────────────────────────────────┐
│                    Security Layers                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. INPUT VALIDATION                                        │
│     • API route validates message type                      │
│     • Reject empty/null messages                            │
│                                                             │
│  2. HTML SANITIZATION                                       │
│     • sanitizeHtml() function                               │
│     • Strip dangerous tags (<script>, <iframe>)             │
│     • Allow safe tags only (<ul>, <li>, <strong>, <br>)     │
│     • Remove all attributes except class                    │
│                                                             │
│  3. READ-ONLY DATABASE ACCESS                               │
│     • All tools use convex.query() only                     │
│     • No convex.mutation() calls                            │
│     • No data modification possible                         │
│                                                             │
│  4. OFF-TOPIC FILTERING                                     │
│     • Prevents wasted API calls                             │
│     • Returns canned response                               │
│     • Saves costs                                           │
│                                                             │
│  5. ABORT CONTROLLER                                        │
│     • Cancel in-flight requests                             │
│     • Prevent memory leaks                                  │
│     • Clean up on unmount                                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                 Observability & Tracking                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. AI USAGE TRACKING                                       │
│     • Every OpenAI call tracked                             │
│     • Token counts (input/output)                           │
│     • Duration in milliseconds                              │
│     • Cost estimation                                       │
│     • Success/failure status                                │
│     • Stored in Convex ai_usage table                       │
│                                                             │
│  2. STRUCTURED LOGGING                                      │
│     • logger.aiOperation() - Start of AI call               │
│     • logger.info() - Success events                        │
│     • logger.error() - Failures with context                │
│     • logger.warn() - Warnings                              │
│                                                             │
│  3. OPERATIONS TRACKED                                      │
│     • chat-initial (tool determination)                     │
│     • chat-tool-response (with database data)               │
│     • chat-greeting (conversational)                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 Key Design Patterns

### 1. **Vertical Slice Architecture**

Each feature (chatbot) contains ALL its layers:

- UI components
- Business logic
- AI integration
- Configuration
- Types

### 2. **Separation of Concerns**

- **UI Layer**: Rendering & user interaction
- **Hook Layer**: State management
- **Stream Layer**: Orchestration
- **AI Layer**: OpenAI interactions
- **Tool Layer**: Database queries

### 3. **Streaming Architecture**

- Server-Sent Events (SSE) for real-time updates
- Progressive message rendering
- Abort controller for cancellation

### 4. **Configuration-Driven**

- Prompts in separate file (easy to modify)
- Tools defined declaratively
- Constants centralized

### 5. **AI Agent Pattern** (from casino-discovery)

- Usage tracking on every call
- Structured logging
- Error handling
- Cost monitoring

## 🔧 Technology Stack

```
Frontend:
├── React (UI components)
├── TypeScript (type safety)
├── Tailwind CSS (styling)
├── shadcn/ui (Dialog, ScrollArea, etc.)
└── Lucide React (icons)

Backend:
├── Next.js App Router (API routes)
├── Server-Sent Events (streaming)
└── Edge Runtime compatible

AI/ML:
├── OpenAI API (gpt-4o-mini)
├── Function Calling (tool selection)
└── Streaming completions

Database:
└── Convex (serverless, real-time)

Utilities:
├── logger.ts (structured logging)
├── ai-cost-tracker.ts (usage tracking)
└── sanitize-html.ts (XSS protection)
```

## 📈 Scalability Considerations

1. **Caching**: Off-topic responses use constant (no API call)
2. **Streaming**: Chunks sent as generated (low memory)
3. **Abort Control**: Cancel unused requests
4. **Tool Limits**: Max results configurable
5. **Read-Only**: No database mutations = safe scaling
6. **Stateless**: Each request independent
7. **Edge Compatible**: Can deploy to edge runtime

## 🎨 UI/UX Features

```
Chat Bubbles:
├── Facebook Messenger style (rounded-3xl)
├── User: Primary color, right-aligned
├── AI: Muted color, left-aligned
└── Timestamps on hover

Message Rendering:
├── User: Plain text (whitespace-pre-wrap)
├── AI: Sanitized HTML with formatting
├── Lists: <ul> with bullets
└── Emphasis: <strong> for bold

Streaming:
├── Pulsing circle cursor (inline with text)
├── Progressive text updates
├── Auto-scroll to bottom
└── Loading state during API calls

Accessibility:
├── Keyboard shortcuts (Enter to send)
├── Focus management
└── ARIA labels
```

---

**Summary**: Agent Martian uses a **vertical slice architecture** with clear separation between UI, orchestration, AI, and data layers. The system leverages **OpenAI function calling** for intelligent tool selection, **Server-Sent Events** for streaming responses, and **Convex** for database queries. All AI operations are tracked and logged for cost monitoring and debugging.
