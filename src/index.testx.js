// import path from "path";
// import { generateTemplatedHtml } from "./converters/htmlTemplater.js";

// const input = path.resolve(".desume/templates/Base/demo.docx");
// const output = path.resolve(".desume/templates/Base/template.html");

// const html = await generateTemplatedHtml(input, output);

// console.log("✅ TEMPLATE CREATED");

// import ResumeGenerator from "./resume/resume-generator.js";

// const generator = new ResumeGenerator("Base");

// await generator.generate("mensah-resume");

// console.log("✅ RESUME GENERATED");

import path from "path";
import { docxToHtml } from "./converters/docxToHtml.js";
import hifiTemplater from "./converters/htmlHifiTemplater.js";

const templateDocx = path.resolve(".desume/templates/Next/demo.docx");
const screenshot = path.resolve(".desume/templates/Next/demo-screenshot.png");

async function testHiFi() {
  // 1️⃣ Convert DOCX -> HTML (Mammoth)
  const rawHtml = await docxToHtml(templateDocx);

  // 2️⃣ HiFi templating
  const finalHtml = await hifiTemplater(rawHtml, screenshot, {
    returnRawHtml: false, // set true to get only fixed HTML before placeholders
    outputDir: path.resolve(".desume/debug"),
  });

  console.log("=== FINAL HTML ===\n", finalHtml);
}

testHiFi().catch(console.error);

// import { runHfVision } from "./llm/groq.js";
// import fs from "fs";

// (async () => {
//   try {
//     const html = await runHfVision(screenshot, {
//       temperature: 0.0,
//       model: "microsoft/omni-layout-v1",
//     });

//     console.log("=== FINAL HTML ===\n", html);

//     // Save raw HTML to file
//     fs.writeFileSync("./.desume/debug/resume-hf-raw.html", html);
//     console.log("✅ Raw HTML saved at ./.desume/debug/resume-hf-raw.html");
//   } catch (err) {
//     console.error("❌ Error:", err);
//   }
// })();
