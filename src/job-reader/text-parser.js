// src/input-parsers/text-parser.js
export class TextParser {
  parse(input) {
    return {
      type: "text",
      content: input.trim(),
      source: "direct_input",
      length: input.length,
      words: input.split(/\s+/).length,
    };
  }

  // For batch text processing
  parseMultiple(texts) {
    return texts.map((text) => this.parse(text));
  }
}

export default TextParser;
