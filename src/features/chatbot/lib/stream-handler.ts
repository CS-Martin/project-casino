/**
 * Stream Handler
 *
 * Orchestrates streaming responses using the chat AI agent
 */

import { executeTool } from './tool-executor';
import { getInitialChatCompletion, streamToolResponse, streamGreetingResponse } from '../ai-agent/chat-agent';
import { logger } from '@/lib/logger';

/**
 * Creates a streaming response for a user message
 *
 * @param message - User's message
 * @returns ReadableStream for Server-Sent Events
 */
export function createChatStream(message: string): ReadableStream {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      try {
        logger.info('Starting chat stream', { message: message.substring(0, 50) });

        // First, check if we need to call a tool
        const initialResponse = await getInitialChatCompletion(message);
        const assistantMessage = initialResponse.choices[0].message;

        // If the model wants to call a function
        if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
          const toolCall = assistantMessage.tool_calls[0];

          // Type guard
          if (toolCall.type !== 'function') {
            logger.warn('Unexpected tool call type', { type: toolCall.type });
            controller.enqueue(encoder.encode('data: Sorry, I encountered an unexpected tool call type.\n\n'));
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            controller.close();
            return;
          }

          const functionName = toolCall.function.name;
          const functionArgs = JSON.parse(toolCall.function.arguments);

          logger.info('Executing tool', { functionName, args: functionArgs });

          // Execute the tool
          const toolResult = await executeTool(functionName, functionArgs);

          // Stream the final response with tool result
          for await (const content of streamToolResponse(message, assistantMessage, toolCall.id, toolResult)) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
          }
        } else {
          // No tool call - this is for greetings and general conversation
          logger.info('Streaming greeting response');

          for await (const content of streamGreetingResponse(message)) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
          }
        }

        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
        logger.info('Chat stream completed successfully');
      } catch (error) {
        logger.error('Streaming error', error as Error);
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'An error occurred' })}\n\n`));
        controller.close();
      }
    },
  });
}
