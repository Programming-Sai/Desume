import { Groq } from "groq-sdk";
import keys from "../utils/keys.js";

const token = keys.readKey("groq"); // from .desume/.keys.key

if (!token) {
  console.error("❌ No Groq token found in .desume/.keys.key");
  process.exit(1);
}
const groq = new Groq({ apiKey: token });

const chatCompletion = await groq.chat.completions.create({
  messages: [
    {
      role: "user",
      content: "",
    },
  ],
  model: "openai/gpt-oss-20b",
  temperature: 1,
  max_completion_tokens: 8192,
  top_p: 1,
  stream: false,
  reasoning_effort: "medium",
  stop: null,
});

console.log(chatCompletion.choices[0].message.content);
