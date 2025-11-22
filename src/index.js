import { renderDocxTemplate } from "./template-engine/resume-to-template-converter/populate-template.js";
import resumeData from "./resumeData.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateResume() {
  try {
    const templatePath = path.join(
      __dirname,
      "..",
      ".desume",
      "templates",
      "Next",
      "template.docx"
    );
    const outputPath = path.join(__dirname, "..", "mensah.docx");

    console.log("📄 Generating resume...");
    console.log("Template path:", templatePath);
    console.log("Output path:", outputPath);

    const result = await renderDocxTemplate(
      templatePath,
      outputPath,
      resumeData
    );

    console.log("✅ Resume generated successfully:", result);
    return result;
  } catch (error) {
    console.error("❌ Error generating resume:", error);
    throw error;
  }
}

// Run if this file is executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  generateResume();
}

export default generateResume;
