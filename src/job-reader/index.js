// src/input-parsers/index.js
import TextParser from "./text-parser.js";
import URLParser from "./url-parser.js";
import ImageParser from "./image-parser.js";

export class InputParser {
  constructor() {
    this.textParser = new TextParser();
    this.urlParser = new URLParser();
    this.imageParser = new ImageParser();
  }

  async parse(input) {
    // Determine input type and route to appropriate parser
    if (typeof input === "string") {
      if (this.isURL(input)) {
        return await this.urlParser.parse(input);
      } else {
        return this.textParser.parse(input);
      }
    } else {
      throw new Error(
        "Unsupported input type. Use string (text/URL) or file path."
      );
    }
  }

  async parseImage(imagePath) {
    return await this.imageParser.parse(imagePath);
  }

  isURL(str) {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  }

  async cleanup() {
    await this.imageParser.cleanup();
  }
}

export default InputParser;
