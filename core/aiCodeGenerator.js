import { getAIClient } from "./aiClient.js";
import { loadSession } from "../tools/sessionState.js";
import { SYSTEM_PROMPT } from "./systemPrompt.js";
import { AVAILABLE_TOOLS } from "../tools/tools.js";

/**
 * Ask the AI to generate code files for the feature
 */

export async function generateFeatureWithAI(feature) {
  const session = loadSession();

  const { client, model } = getAIClient(session.model);

  const prompt = `
  You are a senior full-stack developer building a ${
    session.stack
  } project called "${
    session.projectName
  }". You operate in a loop of analyse → plan → action → observe → output. 
  
  A user wants to add the feature: **"${feature}"**.
  
  Analyse the input and break down the problem step by step.
  
  Think step-by-step and use the available tools as needed for action. After action, wait for observation and validate if the problem is solved. Repeat the loop until the problem is solved.
  
  Generate code files needed to implement this feature.
  Each file should include:
  - a filename with relative path from project root
  - full file content with inline comments

Reply only in JSON format for example:

{
  "step": "analyse" | "plan" | "action" | "observe" | "output",
  "function": "tool_name",
  "input": { ...params },
  "content": "..."  // For analyse/plan/observe/output steps
}

Available tools:
${JSON.stringify(AVAILABLE_TOOLS, null, 2)}

example:

User Query: Add login ?
Output: { "step": "analyse", "content": "The user is interested in login to StudentApp." }
Output: { "step": "plan", "content": "I have to use studentApp as root directory. I have to create login in frontend and backend. I have to update route and controller in backend" }
Output: { "step": "action", "function": "write_file", "input": { "path": "frontend/pages/Login.jsx", "content": "import { signIn } from '@/auth'\nexport function SignIn() { return (...)" } }
Output: { "step": "observe", "content": "login.jsx is created, need to install auth.js as its imported" }
Output: { "step": "action", "function": "run_command", "input": { "command": "cd studentsApp && npm i @auth/express" } }
Output: { "step": "observe", "content": "The dependencies are installed successfully" }
Output: { "step": "output", "content": "The login functionality is done in backend and frontend successfully" }
`;

  const messages = [
    { role: "system", content: prompt },
    { role: "user", content: feature },
  ];

  while (true) {
    const response = await client.chat.completions.create({
      model: model,
      temperature: 0.5,
      response_format: { type: "json_object" },
      messages: messages,
    });

    const res = JSON.parse(response.choices[0].message.content);
    console.log(`🤖: ${res.step} content: ${res.content}`);

    if (res.step === "output") {
      console.log("✅ Done", res.content);
      return res.content;
    }

    if (res.step === "action") {
      const tool = AVAILABLE_TOOLS[res.function];
      if (!tool) {
        console.error(`❌ Unknown tool: ${res.function}`);
        continue;
      }

      try {
        const result = await tool.fn(res.input);
        messages.push({
          role: "assistant",
          content: JSON.stringify({
            step: "observe",
            content: result,
          }),
        });
      } catch (error) {
        console.error(`❌ Error executing tool: ${error.message}`);
        messages.push({
          role: "assistant",
          content: JSON.stringify({
            step: "observe",
            content: `Error: ${error.message}`,
          }),
        });
      }
    } else {
      messages.push({
        role: "assistant",
        content: JSON.stringify(res),
      });
    }
  }
}
