import { Message } from '../types/message';

/**
 * Initial welcome message from the assistant
 */
export const WELCOME_MESSAGE: Message = {
  id: '1',
  role: 'assistant',
  content: `Hi! I'm Agent Martian. I can help you with:<br><br><ul><li>Casino statistics and searches</li><li>Promotional offers</li><li>AI usage tracking</li></ul><br>What would you like to know?`,
  timestamp: new Date(),
};

/**
 * Default response for off-topic questions
 * Used to save API costs by providing a canned response
 */
export const OFF_TOPIC_RESPONSE = `I'm Agent Martian, specialized in casino intelligence. I can only help with casino data, offers, and tracking. Please ask me about casinos, promotions, or system statistics.`;
