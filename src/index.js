// // src/index.js
// import ResumeGenerator from "./resume/resume-generator.js";
// import resumeData from "./resumeData.js";
// import { fileURLToPath } from "url";

// async function main() {
//   const generator = new ResumeGenerator("Next"); // or "Base"

//   try {
//     await generator.generate(resumeData, "mensah-resume");
//     console.log("🎉 Resume generation complete!");
//   } catch (error) {
//     console.error("💥 Failed to generate resume:", error);
//     process.exit(1);
//   }
// }

// // CLI support
// if (process.argv[1] === fileURLToPath(import.meta.url)) {
//   main();
// }

// export default main;

// Example usage in your code
import InputParser from "./job-reader/index.js";

const parser = new InputParser();

// Parse text
const textResult = parser.parse(`About the Role

We are seeking a skilled C# Developer with strong experience in JSON data handling and database integration. The ideal candidate will work closely with our engineering and product teams to design, develop, and maintain high-performance applications that interact with various data sources and APIs.

Experience with .NET or Transportation Management Systems (TMS) is a strong plus.

Key Responsibilities

Design, implement, and maintain software solutions using C#.
Work with JSON data for configuration, serialization, and data exchange.
Develop and optimize database queries (SQL or NoSQL) for data-driven applications.
Collaborate with other developers to integrate application components and APIs.
Write clean, efficient, and maintainable code following best practices.
Participate in code reviews, debugging, and performance tuning.
Assist in integrating systems with TMS platforms.`);

// Parse URL
const urlResult = await parser.parse(
  "https://www.salafric.com/jobs/c-.net-developer-691d9c479704ce402340bb29"
);

// Parse image
const imageResult = await parser.parseImage("./src/test.png");

console.log(textResult);
console.log(urlResult);
console.log(imageResult);

// Cleanup when done
await parser.cleanup();
