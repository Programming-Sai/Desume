// src/resume/resume-generator.js
import fs from "fs";
import path from "path";

import resumeData from "../resumeData.js";
import htmlTemplater from "../converters/htmlTemplater.js";

const __dirname = path.resolve();

/**
 * Template population only:
 * Handlebars template -> populated HTML
 */
export class ResumeGenerator {
  constructor(templateName = "Base") {
    this.templateName = templateName;
    this.templatesPath = path.join(
      __dirname,
      ".desume",
      "templates",
      templateName
    );
    this.outputsPath = path.join(__dirname, "outputs");
  }

  async generate(outputFileName) {
    const templatePath = path.join(this.templatesPath, "template.html");
    const outputHtmlPath = path.join(
      this.outputsPath,
      `${outputFileName}.html`
    );

    if (!fs.existsSync(templatePath)) {
      throw new Error(
        "❌ template.html not found. Run template creation first."
      );
    }

    if (!fs.existsSync(this.outputsPath)) {
      fs.mkdirSync(this.outputsPath, { recursive: true });
    }

    // 1️⃣ Load Handlebars template
    const templatedHtml = fs.readFileSync(templatePath, "utf8");

    // 2️⃣ Populate with resume data
    const finalHtml = htmlTemplater(templatedHtml, resumeData);

    // 3️⃣ Write output
    fs.writeFileSync(outputHtmlPath, finalHtml, "utf8");
    console.log(`✅ Final rendered HTML saved at: ${outputHtmlPath}`);

    return finalHtml;
  }
}

export default ResumeGenerator;
