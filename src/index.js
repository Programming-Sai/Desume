// console.log(`
// 🧩 Desume — The Developer's Resume Generator
// Automate your resume creation directly from your coding activity.
// `);

import { readDocx } from "./template-engine/resume-to-template-converter/resume-reader.js";

const path =
  "C:/Users/pc/Desktop/Text Folder/DOCX Files/DUABALABS - MENSAH LARTEY ISAIAH NII LARTEY - Copy.docx";

const text = await readDocx(path);
console.log(text);
