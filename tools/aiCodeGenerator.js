import { getAIClient } from "./aiClient.js";
import { loadSession } from "./sessionState.js";

/**
 * Ask the AI to generate code files for the feature
 */

export async function generateFeatureWithAI(feature) {
  const session = loadSession();
  const client = getAIClient(session.model);

  const prompt = `
You are a senior full-stack developer building a ${session.stack} project called "${session.projectName}". 

A user wants to add the feature: **"${feature}"**.

Generate code files needed to implement this feature. 
Each file should include:
- a filename with relative path from project root
- full file content with inline comments

Reply only in JSON format:
[
  {
    "path": "backend/routes/auth.routes.js",
    "content": "// route file content"
  },
  ...
]
`;

  const res = await client.chat.completions.create({
    model: "gpt-3.5-turbo", // or gpt-4o
    messages: [
      { role: "system", content: "You are an expert coding assistant." },
      { role: "user", content: prompt },
    ],
    response_format: {
      type: "json_object",
    }, // ensure parsable output
  });

  return JSON.parse(res.choices[0].message.content);
}
