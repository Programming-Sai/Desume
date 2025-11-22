// src/template-engine/resume-to-template-converter/createTemplate.js
import fs from "fs/promises";
import path from "path";
// import { readDocxHtml } from "./resume-reader.js"; // assumes file exists
import replaceInDocxSafe from "./resume-inserter.js";
// Convert an HTML snippet to plain text suitable for matching <w:t> nodes
function sanitizeHtmlToPlainText(html) {
  if (!html) return "";
  return String(html)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<li>/gi, "• ")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+\n/g, "\n")
    .replace(/\n{2,}/g, "\n\n")
    .trim();
}

/**
 * createTemplate
 *
 * Converts an existing docx into a template.docx by replacing content chunks
 * (provided in mapping) with tokens such as "{{profile.fullName}}".
 *
 * - Does NOT modify the source file.
 * - Writes the resulting template to outPath.
 *
 * mapping: Array of objects:
 *   {
 *     // Either:
 *     "content": "<p>Exact HTML/fragment from original (optional if `findText` provided)>",
 *     // or directly provide the text to find:
 *     "findText": "exact plain text to find",
 *
 *     // token to insert into the docx, e.g. "{{profile.fullName}}"
 *     "token": "{{profile.fullName}}"
 *   }
 *
 * Returns: { outPath, replaced: [..], missed: [..] }
 */
export async function createTemplate({
  sourceDocx,
  outPath,
  mapping = [],
  workDir = null,
}) {
  if (!sourceDocx) throw new Error("sourceDocx required");
  if (!outPath) throw new Error("outPath required");
  if (!Array.isArray(mapping)) throw new Error("mapping must be an array");

  // prepare working directory for temp files
  const tmpDir =
    workDir || path.join(path.dirname(outPath), ".tmp_create_template");
  await fs.mkdir(tmpDir, { recursive: true });

  // copy the source docx to a temp start file so we never modify original
  const startTmp = path.join(tmpDir, "step_0.docx");
  const srcBuf = await fs.readFile(sourceDocx);
  await fs.writeFile(startTmp, srcBuf);

  let currentSrc = startTmp;
  const replaced = [];
  const missed = [];

  // Apply mapping sequentially so each replacement sees the result of previous
  for (let i = 0; i < mapping.length; i++) {
    const item = mapping[i] || {};
    // support either content (HTML) or explicit findText
    const findText = item.findText
      ? String(item.findText)
      : sanitizeHtmlToPlainText(item.content || "");
    const token = item.token || item.placeholder;
    if (!findText) {
      missed.push({
        item,
        reason: "empty findText (content missing or sanitized to empty)",
      });
      continue;
    }
    if (!token) {
      missed.push({ item, reason: "no token provided" });
      continue;
    }

    const outTmp = path.join(tmpDir, `step_${i + 1}.docx`);

    // replaceInDocxSafe may be synchronous or synchronous returning object.
    // Call it and allow both sync/async shapes.
    try {
      const res = await Promise.resolve(
        replaceInDocxSafe({
          sourceDocx: currentSrc,
          outDocx: outTmp,
          find: findText,
          replaceWith: token,
          maxReplacements: 1,
        })
      );

      // Some implementations return { replacedCount, outDocx } or { replacedCount: N }
      const replacedCount =
        res &&
        (res.replacedCount || res.replacedCount === 0
          ? res.replacedCount
          : res.replaced
          ? res.replaced.length
          : undefined);
      if (
        typeof replacedCount === "number"
          ? replacedCount > 0
          : res && res.outDocx
      ) {
        replaced.push({ item, result: res });
        currentSrc = outTmp;
      } else {
        // nothing replaced — keep currentSrc unchanged
        missed.push({ item, reason: "no replacement performed", result: res });
      }
    } catch (err) {
      missed.push({ item, reason: "error", error: String(err) });
      // keep currentSrc untouched to continue with next item
    }
  }

  // finalize: copy currentSrc to outPath
  const finalBuf = await fs.readFile(currentSrc);
  await fs.writeFile(outPath, finalBuf, { mode: 0o600 });

  return {
    outPath,
    replaced,
    missed,
    tmpDir,
  };
}

export default createTemplate;
