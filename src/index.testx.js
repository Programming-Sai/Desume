// import path from "path";
// import { generateTemplatedHtml } from "./converters/htmlTemplater.js";

// const input = path.resolve(".desume/templates/Base/demo.docx");
// const output = path.resolve(".desume/templates/Base/template.html");

// const html = await generateTemplatedHtml(input, output);

// console.log("✅ TEMPLATE CREATED");

import ResumeGenerator from "./resume/resume-generator.js";

const generator = new ResumeGenerator("Base");

await generator.generate("mensah-resume");

console.log("✅ RESUME GENERATED");
