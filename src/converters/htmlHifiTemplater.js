// src/converters/htmlHifiTemplater.js
import fs from "fs";
import path from "path";
import { runGroq, runGroqVision } from "../llm/groq.js";
import resumeData from "../resumeData.js";
import htmlTemplater from "./htmlTemplater.js";

const __dirname = path.resolve();

/**
 * HiFi HTML generator
 * @param {string} docxHtml - HTML from DOCX (Mammoth)
 * @param {string} screenshotPathOrUrl - Screenshot of resume provided by user
 * @param {Object} options
 *    - instructions: string, what we want Groq vision model to do
 *    - outputDir: string, where to save debug/output files
 *    - returnRawHtml: boolean, if true returns fixed HTML before placeholder injection
 * @returns {Promise<string>} - final HTML (templated or raw)
 */
export async function hifiTemplater(
  docxHtml,
  screenshotPathOrUrl,
  options = {}
) {
  const outputDir =
    options.outputDir || path.join(__dirname, ".desume", "debug");
  const returnRawHtml = options.returnRawHtml ?? false;

  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  // STEP 1 — Vision: fix layout (NO placeholders)
  const fixedHtml = await runGroqVision(
    docxHtml,
    screenshotPathOrUrl,
    options.instructions || "",
    {
      model: options.model,
      temperature: 0,
      max_completion_tokens: 16384,
    }
  );

  fs.writeFileSync(
    path.join(outputDir, "resume-hifi-fixed.html"),
    fixedHtml,
    "utf8"
  );

  if (returnRawHtml) return fixedHtml;

  // STEP 2 — Text LLM: inject Handlebars placeholders
  const templatingPrompt = `
You are an expert at converting resumes into HTML templates.

Rules:
- Replace real content with Handlebars placeholders
- Use {{field}} or {{#each array}} blocks
- Do NOT invent fields
- Preserve HTML structure EXACTLY
- Do NOT change layout or styles
- Return ONLY the templated HTML

HTML:
${fixedHtml}

Resume data schema:
${JSON.stringify(resumeData, null, 2)}
`;

  const templatedHtml = await runGroq(templatingPrompt, null, {
    temperature: 0,
  });

  fs.writeFileSync(
    path.join(outputDir, "resume-hifi-templated.html"),
    templatedHtml,
    "utf8"
  );

  // STEP 3 — Deterministic render
  const finalHtml = htmlTemplater(templatedHtml, resumeData);

  fs.writeFileSync(
    path.join(outputDir, "resume-hifi-final.html"),
    finalHtml,
    "utf8"
  );

  return finalHtml;
}

export default hifiTemplater;
