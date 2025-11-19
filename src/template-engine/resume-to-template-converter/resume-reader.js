// src/template-engine/resume-to-template-converter/resume-reader.js
import mammoth from "mammoth";

/**
 * Reads a .docx file and returns:
 * - fullText: string
 * - paragraphs: array of cleaned strings
 */

export async function readDocx(filePath) {
  const { value: html } = await mammoth.extractRawText({ path: filePath });
  // const { value: html } = await mammoth.convertToHtml({ path: filePath });
  return html;
}
