import Anthropic from '@anthropic-ai/sdk';

let client = null;

function getClient() {
  if (!client) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error(
        'ANTHROPIC_API_KEY is not set. Add it to your environment (see .env.example).'
      );
    }
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

// Two model tiers used across the pipeline. Fast/cheap for mechanical
// normalization, standard for everything that requires real judgment,
// research, or critique.
export const MODELS = {
  FAST: 'claude-haiku-4-5-20251001',
  STANDARD: 'claude-sonnet-5',
};

/**
 * Runs a single agent turn against the Messages API.
 *
 * - Optionally enables Anthropic's server-side web_search tool.
 * - Concatenates every text content block into `text` (this is what agents
 *   are instructed to make a single strict-JSON payload).
 * - Collects every citation Claude actually attached to that text (real
 *   URLs found via web_search), deduped by URL.
 * - Collects the literal search queries Claude issued, for the Agent Trace.
 */
export async function runAgent({
  system,
  userContent,
  model = MODELS.STANDARD,
  useWebSearch = false,
  maxSearches = 6,
  maxTokens = 3000,
}) {
  const anthropic = getClient();

  const tools = useWebSearch
    ? [{ type: 'web_search_20250305', name: 'web_search', max_uses: maxSearches }]
    : undefined;

  const response = await anthropic.messages.create({
    model,
    max_tokens: maxTokens,
    system,
    messages: [{ role: 'user', content: userContent }],
    ...(tools ? { tools } : {}),
  });

  let text = '';
  const citationsByUrl = new Map();
  const searchQueries = [];

  for (const block of response.content) {
    if (block.type === 'text') {
      text += block.text;
      if (Array.isArray(block.citations)) {
        for (const c of block.citations) {
          if (c?.url && !citationsByUrl.has(c.url)) {
            citationsByUrl.set(c.url, {
              url: c.url,
              title: c.title || c.url,
            });
          }
        }
      }
    } else if (block.type === 'server_tool_use' && block.name === 'web_search') {
      if (block.input?.query) searchQueries.push(block.input.query);
    }
  }

  return {
    text,
    citations: Array.from(citationsByUrl.values()),
    searchQueries,
    stopReason: response.stop_reason,
    usage: response.usage,
  };
}

/**
 * Robustly parses a model's text output as JSON, tolerating stray markdown
 * fences or leading/trailing prose the model might add despite instructions.
 */
export function parseJsonLoose(text) {
  if (!text) throw new Error('Empty response — nothing to parse as JSON.');

  let candidate = text.trim();
  candidate = candidate.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '');

  try {
    return JSON.parse(candidate);
  } catch (_err) {
    const start = candidate.indexOf('{');
    const end = candidate.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
      const sliced = candidate.slice(start, end + 1);
      return JSON.parse(sliced);
    }
    throw new Error('Could not parse agent output as JSON.');
  }
}
