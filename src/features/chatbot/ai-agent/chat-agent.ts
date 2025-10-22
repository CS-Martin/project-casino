/**
 * Chat AI Agent
 *
 * Handles OpenAI interactions for the chatbot with usage tracking and logging
 */

import OpenAI from 'openai';
import { logger } from '@/lib/logger';
import { aiUsageTracker } from '@/lib/ai-cost-tracker';
import { tools } from '../lib/tools';
import { INITIAL_PROMPT, TOOL_RESPONSE_PROMPT, GREETING_PROMPT } from '../lib/prompts';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Initial chat completion to determine if tools are needed
 *
 * @param message - User's message
 * @returns OpenAI chat completion response
 */
export async function getInitialChatCompletion(message: string) {
  const startTime = Date.now();

  try {
    logger.aiOperation('Chat initial completion', 'gpt-4o-mini', {
      function: 'getInitialChatCompletion',
    });

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: INITIAL_PROMPT,
        },
        {
          role: 'user',
          content: message,
        },
      ],
      tools,
      tool_choice: 'auto',
    });

    const duration = Date.now() - startTime;

    // Track AI usage
    await aiUsageTracker.track({
      model: 'gpt-4o-mini',
      operation: 'chat-initial',
      inputTokens: response.usage?.prompt_tokens || 0,
      outputTokens: response.usage?.completion_tokens || 0,
      durationMs: duration,
      success: true,
    });

    logger.info('Chat initial completion successful', {
      function: 'getInitialChatCompletion',
      duration,
      hasToolCalls: response.choices[0].message.tool_calls ? true : false,
    });

    return response;
  } catch (error: any) {
    const duration = Date.now() - startTime;

    // Track failed AI call
    await aiUsageTracker.track({
      model: 'gpt-4o-mini',
      operation: 'chat-initial',
      inputTokens: 0,
      outputTokens: 0,
      durationMs: duration,
      success: false,
      error: error.message,
    });

    logger.error('Chat initial completion failed', error, {
      function: 'getInitialChatCompletion',
      duration,
    });

    throw error;
  }
}

/**
 * Stream chat completion with tool results
 *
 * @param message - User's message
 * @param assistantMessage - Previous assistant message with tool calls
 * @param toolCallId - ID of the tool call
 * @param toolResult - Result from tool execution
 * @returns Async generator of chat completion chunks
 */
export async function* streamToolResponse(
  message: string,
  assistantMessage: OpenAI.Chat.Completions.ChatCompletionMessage,
  toolCallId: string,
  toolResult: string
) {
  const startTime = Date.now();
  let totalTokens = 0;
  let inputTokens = 0;
  let outputTokens = 0;

  try {
    logger.aiOperation('Chat tool response streaming', 'gpt-4o-mini', {
      function: 'streamToolResponse',
    });

    const stream = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: TOOL_RESPONSE_PROMPT,
        },
        {
          role: 'user',
          content: message,
        },
        assistantMessage,
        {
          role: 'tool',
          tool_call_id: toolCallId,
          content: toolResult,
        },
      ],
      stream: true,
      stream_options: { include_usage: true },
    });

    for await (const chunk of stream) {
      // Track usage from final chunk
      if (chunk.usage) {
        inputTokens = chunk.usage.prompt_tokens || 0;
        outputTokens = chunk.usage.completion_tokens || 0;
        totalTokens = chunk.usage.total_tokens || 0;
      }

      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        yield content;
      }
    }

    const duration = Date.now() - startTime;

    // Track AI usage
    await aiUsageTracker.track({
      model: 'gpt-4o-mini',
      operation: 'chat-tool-response',
      inputTokens,
      outputTokens,
      durationMs: duration,
      success: true,
    });

    logger.info('Chat tool response streaming completed', {
      function: 'streamToolResponse',
      duration,
      totalTokens,
    });
  } catch (error: any) {
    const duration = Date.now() - startTime;

    // Track failed AI call
    await aiUsageTracker.track({
      model: 'gpt-4o-mini',
      operation: 'chat-tool-response',
      inputTokens: 0,
      outputTokens: 0,
      durationMs: duration,
      success: false,
      error: error.message,
    });

    logger.error('Chat tool response streaming failed', error, {
      function: 'streamToolResponse',
      duration,
    });

    throw error;
  }
}

/**
 * Stream greeting response (no tools)
 *
 * @param message - User's message
 * @returns Async generator of chat completion chunks
 */
export async function* streamGreetingResponse(message: string) {
  const startTime = Date.now();
  let totalTokens = 0;
  let inputTokens = 0;
  let outputTokens = 0;

  try {
    logger.aiOperation('Chat greeting response streaming', 'gpt-4o-mini', {
      function: 'streamGreetingResponse',
    });

    const stream = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: GREETING_PROMPT,
        },
        {
          role: 'user',
          content: message,
        },
      ],
      stream: true,
      stream_options: { include_usage: true },
    });

    for await (const chunk of stream) {
      // Track usage from final chunk
      if (chunk.usage) {
        inputTokens = chunk.usage.prompt_tokens || 0;
        outputTokens = chunk.usage.completion_tokens || 0;
        totalTokens = chunk.usage.total_tokens || 0;
      }

      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        yield content;
      }
    }

    const duration = Date.now() - startTime;

    // Track AI usage
    await aiUsageTracker.track({
      model: 'gpt-4o-mini',
      operation: 'chat-greeting',
      inputTokens,
      outputTokens,
      durationMs: duration,
      success: true,
    });

    logger.info('Chat greeting response streaming completed', {
      function: 'streamGreetingResponse',
      duration,
      totalTokens,
    });
  } catch (error: any) {
    const duration = Date.now() - startTime;

    // Track failed AI call
    await aiUsageTracker.track({
      model: 'gpt-4o-mini',
      operation: 'chat-greeting',
      inputTokens: 0,
      outputTokens: 0,
      durationMs: duration,
      success: false,
      error: error.message,
    });

    logger.error('Chat greeting response streaming failed', error, {
      function: 'streamGreetingResponse',
      duration,
    });

    throw error;
  }
}
