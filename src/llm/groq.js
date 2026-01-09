// llm/groq.js
import { Groq } from "groq-sdk";
import keys from "../utils/keys.js";
// llm/hfVision.js
import fs from "fs";
import fetch from "node-fetch";

const tokenGroq = keys.readKey("groq"); // from .desume/.keys.key
if (!tokenGroq) {
  console.error("❌ No Groq tokenGroq found in .desume/.keys.key");
  process.exit(1);
}

const tokenHuggingFace = keys.readKey("hugging_face"); // from .desume/.keys.key
if (!tokenHuggingFace) {
  console.error("❌ No Groq tokenHuggingFace found in .desume/.keys.key");
  process.exit(1);
}

const groq = new Groq({ apiKey: tokenGroq });

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

/**
 * Send HTML + screenshot to Groq multimodal model to repair layout & inject placeholders
 * @param {string} html - Raw HTML from DOCX
 * @param {string} imagePath - Screenshot of original resume
 * @param {string} instructions - What to do with HTML (repair + placeholder injection)
 * @param {Object} options - Optional: { model, temperature, max_completion_tokens }
 * @returns {Promise<string>} - Repaired + templated HTML
 */
export async function runGroqVision(
  html,
  imagePathOrUrl,
  instructions,
  options = {}
) {
  const model = options.model || "meta-llama/llama-4-scout-17b-16e-instruct";
  const temperature = options.temperature ?? 0;
  const maxTokens = options.max_completion_tokens ?? 16384;

  let imageInput;

  if (/^https?:\/\//.test(imagePathOrUrl)) {
    // image is a URL
    imageInput = imagePathOrUrl;
  } else {
    // image is a local file
    if (!fs.existsSync(imagePathOrUrl)) {
      throw new Error(`runGroqVision: image not found at ${imagePathOrUrl}`);
    }
    const base64Image = fs.readFileSync(imagePathOrUrl, "base64");
    imageInput = `data:image/png;base64,${base64Image}`;
  }

  const messages = [
    {
      role: "user",
      content: [
        { type: "text", text: instructions },
        { type: "image_url", image_url: { url: imageInput } },
        {
          type: "text",
          text: `
<|begin_of_text|>
<|header_start|>system<|header_end|>
You are an expert document-to-HTML converter. Your only task is to analyze images of documents and output clean HTML code that replicates the exact visual layout and styling. Use inline CSS for all styling and semantic placeholder text for all content. Do not write any explanations, commentary, or text outside the HTML block.<|eot|>
<|header_start|>user<|header_end|>
<|image_start|>[IMAGE_DATA]<|image_end|>

Analyze this document image and convert it to structured HTML.

**CRITICAL REQUIREMENTS:**
1.  **Output Format**: Output *only* the complete, valid HTML code. No markdown, no explanations.
2.  **Structure**: Preserve every visual element: sections, columns (use CSS Grid/Flexbox), tables, lists, headers, footers, and dividers.
3.  **Styling**: Use **inline CSS styles** ("style='...'") to match ALL visual details:
    *   Font properties: "font-size", "font-weight", "font-style", "text-align", "color".
    *   Layout: "display", "margin", "padding", "line-height".
    *   Borders & Backgrounds: "border", "background-color".
    *   Use hex codes (e.g., "#333333") for colors.
4. Do not include code fences

Generate the HTML now.<|eot|>
<|header_start|>assistant<|header_end|>
`,
        },
        { type: "text", text: `HTML to repair:\n${html}` },
      ],
    },
  ];

  try {
    const completion = await groq.chat.completions.create({
      messages,
      model,
      temperature,
      // max_completion_tokens: maxTokens,
      top_p: 1,
      stream: false,
      // reasoning_effort: "high",
      stop: null,
      response_format: { type: "text" }, // plain HTML returned
    });

    return completion.choices[0].message.content;
  } catch (err) {
    console.error("❌ Groq Vision LLM error:", err);
    throw err;
  }
}

/**
 * Send an image (URL or local file) to Hugging Face multimodal model to get reconstructed HTML
 * @param {string} imagePathOrUrl - Local path or URL of screenshot/resume
 * @param {Object} options - { apiKey, model, temperature }
 * @returns {Promise<string>} - Raw HTML output
 */
export async function runHfVision(imagePathOrUrl, options = {}) {
  const model = options.model || "llava-hf/llava-1.5-7b-hf";
  const temperature = options.temperature ?? 0.0;

  let imageBuffer;
  let isUrl = false;

  if (/^https?:\/\//.test(imagePathOrUrl)) {
    // image is a URL, we'll just pass it directly
    isUrl = true;
  } else {
    // local file
    if (!fs.existsSync(imagePathOrUrl)) {
      throw new Error(`Image not found at path: ${imagePathOrUrl}`);
    }
    imageBuffer = fs.readFileSync(imagePathOrUrl);
  }

  // Hugging Face API expects multipart/form-data or JSON with URL
  let body;
  let headers = {
    Authorization: `Bearer ${tokenHuggingFace}`,
  };

  if (isUrl) {
    body = JSON.stringify({
      inputs: imagePathOrUrl,
      parameters: {
        temperature,
        task: "layout-to-html", // ensure model interprets this as layout->HTML
      },
    });
    headers["Content-Type"] = "application/json";
  } else {
    // Local file, send as binary
    const FormData = (await import("form-data")).default;
    const form = new FormData();
    form.append("file", imageBuffer, { filename: "resume.png" });
    form.append(
      "parameters",
      JSON.stringify({ temperature, task: "layout-to-html" })
    );
    body = form;
    headers = { ...headers, ...form.getHeaders() };
  }

  const response = await fetch(
    `https://router.huggingface.co/models/${model}`,
    {
      method: "POST",
      headers,
      body,
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HF Vision API Error: ${response.status} ${text}`);
  }

  const result = await response.json();

  // Some HF models return [{generated_text: "..."}] or {data: "..."}
  // We'll normalize to string
  if (Array.isArray(result) && result[0]?.generated_text) {
    return result[0].generated_text;
  }
  if (result.generated_text) {
    return result.generated_text;
  }
  if (typeof result === "string") {
    return result;
  }
  // fallback: stringify
  return JSON.stringify(result);
}
