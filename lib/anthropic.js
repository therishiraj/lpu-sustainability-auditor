import { GoogleGenAI } from '@google/genai';

let client = null;

function getClient() {
  if (!client) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error(
        'GEMINI_API_KEY is not set. Add it to your environment (see .env.example). Get a free key at https://aistudio.google.com — note this is separate from a Gemini/Google AI Pro chat subscription.'
      );
    }
    client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return client;
}

// Two model tiers used across the pipeline. Both are free-tier-eligible
// Gemini models: Flash-Lite for mechanical normalization, Flash for
// everything that requires more judgment, research, or critique.
export const MODELS = {
  FAST: 'gemini-2.5-flash-lite',
  STANDARD: 'gemini-2.5-flash',
};

/**
 * Runs a single agent turn against the Gemini API.
 *
 * - Optionally enables Gemini's built-in Google Search grounding tool.
 * - Returns the full response text (agents are instructed to make this a
 *   single strict-JSON payload).
 * - Collects every grounding source Gemini actually used (real URLs found
 *   via Google Search), deduped by URL.
 * - Collects the literal search queries Gemini issued, for the Agent Trace.
 */
export async function runAgent({
  system,
  userContent,
  model = MODELS.STANDARD,
  useWebSearch = false,
  maxSearches = 6, // kept for interface parity; Gemini's grounding tool manages query count itself
  maxTokens = 3000,
}) {
  const ai = getClient();

  const config = {
    systemInstruction: system,
    maxOutputTokens: maxTokens,
    ...(useWebSearch ? { tools: [{ googleSearch: {} }] } : {}),
  };

  const response = await ai.models.generateContent({
    model,
    contents: userContent,
    config,
  });

  const text = response.text || '';

  const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
  const citationsByUrl = new Map();
  if (groundingMetadata?.groundingChunks) {
    for (const chunk of groundingMetadata.groundingChunks) {
      const url = chunk?.web?.uri;
      const title = chunk?.web?.title;
      if (url && !citationsByUrl.has(url)) {
        citationsByUrl.set(url, { url, title: title || url });
      }
    }
  }
  const searchQueries = groundingMetadata?.webSearchQueries || [];

  return {
    text,
    citations: Array.from(citationsByUrl.values()),
    searchQueries,
    stopReason: response.candidates?.[0]?.finishReason,
    usage: response.usageMetadata,
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
