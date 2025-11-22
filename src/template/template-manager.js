// src/services/template-manager.js
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class TemplateManager {
  constructor() {
    this.templatesPath = path.join(
      __dirname,
      "..",
      "..",
      ".desume",
      "templates"
    );
  }

  async getAvailableTemplates() {
    try {
      const items = await fs.readdir(this.templatesPath);
      return items.filter(
        (item) => !item.startsWith(".") && !item.startsWith("~$")
      );
    } catch (error) {
      console.warn("Could not read templates directory:", error.message);
      return ["Base", "Next"]; // Fallback
    }
  }

  async getTemplateSchema(templateName) {
    const schemaPath = path.join(
      this.templatesPath,
      templateName,
      "schema.json"
    );
    try {
      const schema = await fs.readFile(schemaPath, "utf8");
      return JSON.parse(schema);
    } catch (error) {
      console.warn(`No schema found for template ${templateName}`);
      return null;
    }
  }

  validateDataAgainstSchema(data, schema) {
    // Basic validation logic
    const required = schema?.required || [];
    const missing = required.filter((field) => !data[field]);

    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(", ")}`);
    }
    return true;
  }
}
