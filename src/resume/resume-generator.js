// src/resume/resume-generator.js
import { renderDocxTemplate } from "../template/populate-template.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class ResumeGenerator {
  constructor(templateName = "Base") {
    this.templateName = templateName;
    this.templatesBasePath = path.join(
      __dirname,
      "..",
      "..",
      ".desume",
      "templates"
    );
    this.outputsPath = path.join(__dirname, "..", "..", "outputs");
  }

  async generate(resumeData, outputFileName, templateName = null) {
    const template = templateName || this.templateName;
    const templatePath = path.join(
      this.templatesBasePath,
      template,
      "template.docx"
    );
    const outputPath = path.join(this.outputsPath, `${outputFileName}.docx`);

    // CREATE OUTPUTS DIRECTORY IF IT DOESN'T EXIST
    if (!fs.existsSync(this.outputsPath)) {
      fs.mkdirSync(this.outputsPath, { recursive: true });
      console.log("📁 Created outputs directory");
    }

    console.log("📄 Generating resume...");
    console.log("Template:", template);
    console.log("Output:", outputPath);

    try {
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

  listTemplates() {
    return ["Base", "Next"];
  }
}

export default ResumeGenerator;
