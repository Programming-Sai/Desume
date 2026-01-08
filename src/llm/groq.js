// llm/groq.js
import { Groq } from "groq-sdk";
import keys from "../utils/keys.js";

const token = keys.readKey("groq"); // from .desume/.keys.key
if (!token) {
  console.error("❌ No Groq token found in .desume/.keys.key");
  process.exit(1);
}

const groq = new Groq({ apiKey: token });

/**
 * Send a prompt + optional context to Groq LLM
 * @param {string} prompt - The user prompt
 * @param {string} systemPrompt - Optional system prompt for instructions
 * @param {Object} options - Additional options like model, temperature
 * @returns {Promise<string>} LLM output
 */
export async function runGroq(prompt, systemPrompt = "", options = {}) {
  const model = options.model || "openai/gpt-oss-20b";
  const temperature = options.temperature ?? 1;
  const maxTokens = options.max_completion_tokens ?? 8192;

  const messages = [];
  if (systemPrompt) {
    messages.push({ role: "system", content: systemPrompt });
  }
  messages.push({ role: "user", content: prompt });

  try {
    const completion = await groq.chat.completions.create({
      messages,
      model,
      temperature,
      max_completion_tokens: maxTokens,
      top_p: 1,
      stream: false,
      reasoning_effort: "medium",
      stop: null,
    });

    return completion.choices[0].message.content;
  } catch (err) {
    console.error("❌ Groq LLM error:", err);
    throw err;
  }
}
