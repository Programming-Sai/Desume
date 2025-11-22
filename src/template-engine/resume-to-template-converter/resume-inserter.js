// src/template-engine/resume-to-template-converter/replaceInDocxSafe.js
import fs from "fs";
import path from "path";
import PizZip from "pizzip";
import { DOMParser, XMLSerializer } from "xmldom";

/**
 * replaceInDocxSafe:
 * - sourceDocx: path to .docx OR
 * - sourceBuf: Buffer of .docx (in-memory)
 * - outDocx: optional; if not provided, only returns Buffer
 * - find: text to replace
 * - replaceWith: replacement token/text
 * - maxReplacements: number
 *
 * Returns: { replacedCount, outBuf?, outDocx? }
 */
export async function replaceInDocxSafe({
  sourceDocx,
  sourceBuf,
  outDocx,
  find,
  replaceWith,
  maxReplacements = 1,
}) {
  if (!sourceDocx && !sourceBuf)
    throw new Error("Either sourceDocx or sourceBuf must be provided");

  const bin = sourceBuf
    ? sourceBuf
    : fs.readFileSync(path.resolve(sourceDocx), "binary");
  const zip = new PizZip(bin);

  const xmlPath = "word/document.xml";
  const xmlFile = zip.file(xmlPath);
  if (!xmlFile) throw new Error("document.xml not found inside .docx");

  const xml = xmlFile.asText();
  const dom = new DOMParser().parseFromString(xml, "application/xml");
  const documentElement =
    dom.getElementsByTagName("w:document")[0] || dom.documentElement;

  // collect <w:t> nodes
  const wtNodes = [];
  (function collect(node) {
    if (!node) return;
    if (node.nodeName === "w:t") wtNodes.push(node);
    else Array.from(node.childNodes || []).forEach(collect);
  })(documentElement);

  const texts = wtNodes.map((n) => n.textContent || "");
  let big = texts.join("");
  let searchStart = 0;
  let replaceCount = 0;

  while (replaceCount < maxReplacements) {
    const idx = big.indexOf(find, searchStart);
    if (idx === -1) break;

    // find start/end nodes covering match
    let acc = 0,
      startNode = -1,
      startOffset = 0,
      endNode = -1,
      endOffset = 0;
    for (let i = 0; i < texts.length; i++) {
      const t = texts[i];
      const nextAcc = acc + t.length;
      if (startNode === -1 && idx >= acc && idx < nextAcc) {
        startNode = i;
        startOffset = idx - acc;
      }
      const endPos = idx + find.length;
      if (endNode === -1 && endPos > acc && endPos <= nextAcc) {
        endNode = i;
        endOffset = endPos - acc;
        break;
      }
      acc = nextAcc;
    }
    if (startNode === -1 || endNode === -1) break;

    const prefix = texts[startNode].slice(0, startOffset);
    const suffix = texts[endNode].slice(endOffset);

    texts[startNode] = prefix + replaceWith + suffix;
    for (let k = startNode + 1; k <= endNode; k++) texts[k] = "";

    replaceCount++;
    searchStart = idx + replaceWith.length;
    big = texts.join("");
  }

  // write back to nodes
  for (let i = 0; i < wtNodes.length; i++) {
    const node = wtNodes[i];
    while (node.firstChild) node.removeChild(node.firstChild);
    node.appendChild(dom.createTextNode(texts[i]));
  }

  const newXml = new XMLSerializer().serializeToString(dom);
  zip.file(xmlPath, newXml);

  const outBuf = zip.generate({ type: "nodebuffer", compression: "DEFLATE" });
  if (outDocx) fs.writeFileSync(path.resolve(outDocx), outBuf);

  return { replacedCount, outBuf, outDocx };
}

export default replaceInDocxSafe;
