// src/converters/htmlConverter.js

import fs from "fs";
import path from "path";
import { docxToHtml } from "./docxToHtml.js";
import { runGroq } from "../llm/groq.js";
import resumeData from "../resumeData.js";
import Handlebars from "handlebars";

/**
 * TEMPLATE CREATION (AI-assisted, run once per design)
 * DOCX -> HTML -> Handlebars template
 */
export async function generateTemplatedHtml(docxPath, outputPath = null) {
  const rawHtml = await docxToHtml(docxPath);

  const prompt = `
You are an expert at converting resumes into HTML templates.

Rules:
- Replace real content with Handlebars placeholders
- Use {{field}} or {{#each array}} blocks
- Do NOT invent fields
- Preserve HTML structure
- Return ONLY the templated HTML

HTML:
${rawHtml}

Resume data schema:
${JSON.stringify(resumeData, null, 2)}
`;

  const templatedHtml = await runGroq(prompt, null, { temperature: 0 });

  if (outputPath) {
    const absoluteOutput = path.resolve(outputPath);
    fs.mkdirSync(path.dirname(absoluteOutput), { recursive: true });
    fs.writeFileSync(absoluteOutput, templatedHtml, "utf8");
    console.log(`✅ Template saved at: ${absoluteOutput}`);
  }

  return templatedHtml;
}

/**
 * TEMPLATE POPULATION (deterministic, core)
 * Handlebars template -> final HTML
 */
export function htmlTemplater(templatedHtml, resumeData) {
  if (typeof templatedHtml !== "string") {
    throw new Error("htmlTemplater: template must be a string");
  }

  const template = Handlebars.compile(templatedHtml, {
    noEscape: true,
    strict: false,
  });

  return template(resumeData);
}

export default htmlTemplater;
