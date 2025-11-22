// src/input-parsers/image-parser.js
import { createWorker } from "tesseract.js";
import fs from "fs/promises";
import path from "path";

export class ImageParser {
  constructor() {
    this.worker = null;
  }

  async initialize() {
    if (!this.worker) {
      console.log("🔧 Initializing OCR worker...");
      this.worker = await createWorker("eng");
      console.log("✅ OCR worker ready");
    }
  }

  async parse(imagePath) {
    try {
      await this.initialize();

      // Check if file exists
      await fs.access(imagePath);

      console.log(`📷 Processing image: ${path.basename(imagePath)}`);

      const {
        data: { text, confidence },
      } = await this.worker.recognize(imagePath);

      return {
        type: "image",
        content: text.trim(),
        source: imagePath,
        confidence: confidence,
        length: text.length,
        words: text.split(/\s+/).length,
        success: text.length > 0,
      };
    } catch (error) {
      console.error(`❌ Failed to parse image: ${imagePath}`, error.message);
      return {
        type: "image",
        content: "",
        source: imagePath,
        confidence: 0,
        error: error.message,
        success: false,
      };
    }
  }

  async parseMultiple(imagePaths) {
    const results = [];
    for (const imagePath of imagePaths) {
      const result = await this.parse(imagePath);
      results.push(result);
    }
    return results;
  }

  async cleanup() {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
      console.log("🧹 OCR worker terminated");
    }
  }
}

export default ImageParser;
