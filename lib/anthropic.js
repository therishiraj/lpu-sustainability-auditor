import { GoogleGenAI } from '@google/genai';

let geminiClient = null;
function getGeminiClient() {
  if (!process.env.GEMINI_API_KEY) return null;
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return geminiClient;
}

// Two model tiers used across the pipeline. Both are free-tier-eligible
// Gemini models: Flash-Lite for mechanical normalization, Flash for
// everything that requires more judgment, research, or critique.
export const MODELS = {
  FAST: 'gemini-3.1-flash-lite',
  STANDARD: 'gemini-3.5-flash',
};

// Groq equivalents used as an automatic fallback once Gemini's free-tier
// quota is exhausted. groq/compound is Groq's tool-using "compound" system
// with a real built-in web search, so search-dependent agents (peer
// research, critique) keep their ability to search even on the fallback
// path — everything else falls back to a plain chat model.
const GROQ_MODELS = {
  FAST: 'llama-3.1-8b-instant',
  STANDARD: 'llama-3.3-70b-versatile',
  SEARCH: 'groq/compound',
};

function isRetryableError(err) {
  return (
    err?.status === 429 ||
    err?.status === 503 ||
    /quota|rate.?limit|overloaded|unavailable|high demand|RESOURCE_EXHAUSTED/i.test(err?.message || '')
  );
}

async function runGeminiAgent({ system, userContent, model, useWebSearch, maxTokens, thinkingLevel }) {
  const ai = getGeminiClient();
  if (!ai) {
    throw new Error(
      'GEMINI_API_KEY is not set. Add it to your environment (see .env.example). Get a free key at https://aistudio.google.com — note this is separate from a Gemini/Google AI Pro chat subscription.'
    );
  }

  const config = {
    systemInstruction: system,
    maxOutputTokens: maxTokens,
    thinkingConfig: { thinkingLevel },
    ...(useWebSearch ? { tools: [{ googleSearch: {} }] } : {}),
  };

  const maxAttempts = 3;
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
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
        provider: 'gemini',
        model,
      };
    } catch (err) {
      lastError = err;
      if (!isRetryableError(err) || attempt === maxAttempts) {
        throw err;
      }
      const waitMs = attempt * 2000; // 2s, then 4s
      console.warn(`Gemini quota error on attempt ${attempt}/${maxAttempts}, retrying in ${waitMs}ms...`);
      await new Promise((resolve) => setTimeout(resolve, waitMs));
    }
  }

  throw lastError;
}

// Groq's free tier has a much smaller effective request/token budget than
// Gemini. Later pipeline steps (critique, report) embed the full JSON
// output of earlier agents into userContent, which comfortably fits
// Gemini's huge context but can trip Groq's request-size limit (413) or
// its per-minute token cap. Trim defensively on the Groq path only.
function truncateForGroq(text, maxChars = 18000) {
  if (!text || text.length <= maxChars) return text;
  const headChars = Math.floor(maxChars * 0.7);
  const tailChars = maxChars - headChars;
  const head = text.slice(0, headChars);
  const tail = text.slice(-tailChars);
  return `${head}\n\n...[${text.length - maxChars} characters truncated to fit Groq's free-tier request size limit — this fallback response is based on a shortened version of the input]...\n\n${tail}`;
}

async function runGroqAgent({ system, userContent, useWebSearch, maxTokens, tier }) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error(
      'Gemini quota was exhausted and GROQ_API_KEY is not set for fallback. Add a free key from https://console.groq.com/keys to enable automatic failover.'
    );
  }

  const model = useWebSearch ? GROQ_MODELS.SEARCH : GROQ_MODELS[tier] || GROQ_MODELS.STANDARD;
  const safeUserContent = truncateForGroq(userContent);
  // Cap output tokens too — Groq's free-tier TPM budget covers input +
  // output combined, so a full 8000-token ask on top of a large prompt
  // can itself trigger a 413/429 even after truncating the input.
  const safeMaxTokens = Math.min(maxTokens, 3000);

  const maxAttempts = 3;
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: safeUserContent },
          ],
          max_completion_tokens: safeMaxTokens,
        }),
      });

      if (!res.ok) {
        const bodyText = await res.text().catch(() => '');
        const err = new Error(`Groq request failed (status ${res.status}): ${bodyText.slice(0, 300)}`);
        err.status = res.status;
        throw err;
      }

      const data = await res.json();
      const text = data.choices?.[0]?.message?.content || '';

      // groq/compound reports which built-in tools it actually ran (e.g.
      // web_search) in executed_tools, including the query and results —
      // surface those in the same shape Gemini's grounding metadata uses so
      // the Agent Trace and Citations list work regardless of provider.
      const executedTools = data.choices?.[0]?.message?.executed_tools || [];
      const citationsByUrl = new Map();
      const searchQueries = [];
      for (const tool of executedTools) {
        const query = tool?.arguments?.query || tool?.arguments?.q;
        if (query) searchQueries.push(query);
        const results = tool?.output?.results || tool?.search_results?.results || [];
        for (const r of results) {
          const url = r?.url;
          if (url && !citationsByUrl.has(url)) {
            citationsByUrl.set(url, { url, title: r?.title || url });
          }
        }
      }

      return {
        text,
        citations: Array.from(citationsByUrl.values()),
        searchQueries,
        stopReason: data.choices?.[0]?.finish_reason,
        usage: data.usage,
        provider: 'groq',
        model,
      };
    } catch (err) {
      lastError = err;
      if (!isRetryableError(err) || attempt === maxAttempts) {
        throw err;
      }
      const waitMs = attempt * 2000;
      console.warn(`Groq error on attempt ${attempt}/${maxAttempts}, retrying in ${waitMs}ms...`);
      await new Promise((resolve) => setTimeout(resolve, waitMs));
    }
  }

  throw lastError;
}

/**
 * Runs a single agent turn, preferring Gemini and automatically failing
 * over to Groq when Gemini's free-tier quota is exhausted.
 */
export async function runAgent({
  system,
  userContent,
  model = MODELS.STANDARD,
  useWebSearch = false,
  maxSearches = 6, // kept for interface parity; neither provider's search tool needs a client-side cap
  maxTokens = 8000,
  thinkingLevel = 'low', // keep reasoning-token overhead low so budget goes to visible output
}) {
  const tier = model === MODELS.FAST ? 'FAST' : 'STANDARD';

  try {
    return await runGeminiAgent({ system, userContent, model, useWebSearch, maxTokens, thinkingLevel });
  } catch (err) {
    if (!isRetryableError(err) || !process.env.GROQ_API_KEY) {
      throw err;
    }
    console.warn(
      `Gemini unavailable (${err.message}). Falling back to Groq (${useWebSearch ? GROQ_MODELS.SEARCH : GROQ_MODELS[tier]})...`
    );
    return await runGroqAgent({ system, userContent, useWebSearch, maxTokens, tier });
  }
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
    const openChar =
      candidate.includes('[') && (!candidate.includes('{') || candidate.indexOf('[') < candidate.indexOf('{'))
        ? '['
        : '{';
    const closeChar = openChar === '[' ? ']' : '}';
    const start = candidate.indexOf(openChar);
    const end = candidate.lastIndexOf(closeChar);
    if (start !== -1 && end !== -1 && end > start) {
      const sliced = candidate.slice(start, end + 1);
      return JSON.parse(sliced);
    }
    throw new Error('Could not parse agent output as JSON.');
  }
}
