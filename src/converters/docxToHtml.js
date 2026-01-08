import fs from "fs";
import path from "path";
import mammoth from "mammoth";

/**
 * Convert a DOCX resume to clean HTML
 * @param {string} inputPath - path to .docx file
 * @param {string|null} outputPath - optional .html output path
 * @returns {Promise<string>} HTML string
 */
export async function docxToHtml(inputPath, outputPath = null) {
  const absoluteInput = path.resolve(inputPath);

  if (!fs.existsSync(absoluteInput)) {
    throw new Error(`DOCX file not found: ${absoluteInput}`);
  }

  const result = await mammoth.convertToHtml(
    { path: absoluteInput },
    {
      // Optional: better HTML semantics
      styleMap: [
        "p[style-name='Heading 1'] => h1:fresh",
        "p[style-name='Heading 2'] => h2:fresh",
        "p[style-name='Heading 3'] => h3:fresh",
        "p[style-name='Title'] => h1:fresh",
      ],
    }
  );

  const html = result.value; // The generated HTML
  const messages = result.messages; // Warnings, if any

  if (messages.length) {
    console.warn("Mammoth warnings:", messages);
  }

  if (outputPath) {
    const absoluteOutput = path.resolve(outputPath);
    const outDir = path.dirname(absoluteOutput);
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(absoluteOutput, html, "utf8");
  }

  return html;
}
