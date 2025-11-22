// populate-template.js  (ESM) - UPDATED VERSION
import fs from "fs";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import path from "path";

export function renderDocxTemplate(templatePath, outputPath, data) {
  const content = fs.readFileSync(path.resolve(templatePath), "binary");
  const zip = new PizZip(content);

  // Modern syntax - pass data directly to constructor
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
  });

  // Use render() with data instead of setData()
  try {
    doc.render(data); // Pass data directly to render()
  } catch (err) {
    console.error("Docxtemplater render error:", err);
    throw err;
  }

  const buf = doc.getZip().generate({ type: "nodebuffer" });
  fs.writeFileSync(path.resolve(outputPath), buf);
  return outputPath;
}
