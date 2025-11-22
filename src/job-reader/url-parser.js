// src/input-parsers/url-parser.js
import fetch from "node-fetch";
import * as cheerio from "cheerio";

export class URLParser {
  async parse(url) {
    try {
      console.log(`🌐 Fetching content from: ${url}`);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      // Remove script and style elements
      $("script, style, nav, footer, header").remove();

      // Extract meaningful content
      const title = $("title").text() || $("h1").first().text() || "No Title";
      const bodyText = $("body").text().replace(/\s+/g, " ").trim();

      // Try to find main content (common selectors)
      const mainContent =
        $("main, article, .content, #content, .main").text() || bodyText;

      return {
        type: "url",
        content: mainContent.substring(0, 10000), // Limit size
        source: url,
        title: title,
        length: mainContent.length,
        words: mainContent.split(/\s+/).length,
        success: true,
      };
    } catch (error) {
      console.error(`❌ Failed to parse URL: ${url}`, error.message);
      return {
        type: "url",
        content: "",
        source: url,
        title: "Failed to fetch",
        error: error.message,
        success: false,
      };
    }
  }

  async parseMultiple(urls) {
    const results = [];
    for (const url of urls) {
      const result = await this.parse(url);
      results.push(result);
      // Small delay to be respectful
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
    return results;
  }
}

export default URLParser;
