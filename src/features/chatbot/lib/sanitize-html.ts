/**
 * HTML Sanitizer
 *
 * Sanitizes HTML content to only allow safe tags for rendering in chat messages.
 * Prevents XSS attacks by stripping dangerous elements while preserving formatting.
 */

/**
 * List of HTML tags that are safe to render in chat messages
 */
const ALLOWED_TAGS = ['STRONG', 'B', 'EM', 'I', 'U', 'BR', 'P', 'DIV', 'SPAN', 'UL', 'OL', 'LI'];

/**
 * Recursively sanitizes DOM nodes, keeping only allowed tags
 * @param node - The DOM node to sanitize
 * @returns Sanitized node or null if node should be removed
 */
function sanitizeNode(node: Node): Node | null {
  // Text nodes are always safe
  if (node.nodeType === Node.TEXT_NODE) {
    return node;
  }

  // Process element nodes
  if (node.nodeType === Node.ELEMENT_NODE) {
    const element = node as Element;

    // Check if tag is in allowed list
    if (!ALLOWED_TAGS.includes(element.tagName)) {
      // If not allowed, convert to text content
      return document.createTextNode(element.textContent || '');
    }

    // Clone element without attributes (for security)
    const cleanElement = document.createElement(element.tagName);

    // Recursively sanitize child nodes
    Array.from(element.childNodes).forEach((child) => {
      const sanitizedChild = sanitizeNode(child);
      if (sanitizedChild) {
        cleanElement.appendChild(sanitizedChild);
      }
    });

    return cleanElement;
  }

  return null;
}

/**
 * Sanitizes HTML string by removing all dangerous tags and attributes
 * @param html - Raw HTML string to sanitize
 * @returns Sanitized HTML string safe for rendering
 *
 * @example
 * ```ts
 * const safe = sanitizeHtml('<strong>Hello</strong><script>alert("xss")</script>');
 * // Returns: '<strong>Hello</strong>alert("xss")'
 * ```
 */
export function sanitizeHtml(html: string): string {
  // Create temporary container to parse HTML
  const temp = document.createElement('div');
  temp.innerHTML = html;

  // Create container for sanitized content
  const sanitizedDiv = document.createElement('div');

  // Process each child node
  Array.from(temp.childNodes).forEach((child) => {
    const sanitizedChild = sanitizeNode(child);
    if (sanitizedChild) {
      sanitizedDiv.appendChild(sanitizedChild);
    }
  });

  return sanitizedDiv.innerHTML;
}
