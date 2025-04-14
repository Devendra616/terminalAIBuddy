import OpenAI from "openai";
import dotenv from "dotenv";
import { AVAILABLE_TOOLS } from "../tools/tools.js";

dotenv.config();

const AGENT_MODEL = "gpt-4-turbo-preview";
const MAX_ITERATIONS = 25;

export class CodingAgent {
  constructor(model = AGENT_MODEL, tools = AVAILABLE_TOOLS) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY environment variable not set.");
    }

    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.model = model;
    this.tools = tools;
    this.systemPrompt = this.generateSystemPrompt(tools);
    this.messages = [{ role: "system", content: this.systemPrompt }];
    this.maxIterations = MAX_ITERATIONS;
  }

  generateSystemPrompt(tools) {
    const toolDescriptions = {};
    for (const [name, toolInfo] of Object.entries(tools)) {
      toolDescriptions[name] = {
        description: toolInfo.description,
        parameters: toolInfo.parameters,
      };
    }

    const formattedTools = JSON.stringify(toolDescriptions, null, 2);

    return `
You are a highly capable AI Coding Agent with file system and terminal access, designed to work across various programming languages and frameworks. For any user request, follow this workflow:

1. Plan: Briefly state your plan. Outline the steps, including specific shell commands.
2. Act: Execute steps sequentially using only the available tools, one tool per action.
3. Observe: After each action, you receive the tool's output.
4. Analyze & Iterate: Carefully analyze the observation. Check for errors, extract needed information.
5. Output: Once the request is fully addressed, provide the final result/confirmation.

KEY RULES & TOOL USAGE:
* Use run_command for commands that finish (compile, install, test, format, etc.)
* Use run_in_new_terminal for long-running foreground processes
* Use ask_user_for_feedback sparingly when you need clarification
* Be precise with file paths
* Check run_command output for errors and fix them

AVAILABLE TOOLS:
${formattedTools}

OUTPUT JSON FORMAT:
{
  "step": "string",  // Must be one of: "plan", "action", "observe", "output"
  "content": "string",  // Plan description, analysis, or final message
  "function": "string",  // Tool name (required for step="action")
  "input": {}      // Tool parameters (required for step="action")
}
`;
  }

  async callLLM() {
    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: this.messages,
        response_format: { type: "json_object" },
        temperature: 0.5,
      });

      const responseContent = response.choices[0].message.content;
      if (!responseContent) {
        throw new Error("LLM returned empty content");
      }

      try {
        const parsedOutput = JSON.parse(responseContent);

        // Basic validation
        if (!parsedOutput.step) {
          throw new Error("Missing 'step' key in LLM response");
        }
        if (
          parsedOutput.step === "action" &&
          (!parsedOutput.function || !parsedOutput.input)
        ) {
          throw new Error(
            "Malformed 'action' step: missing 'function' or 'input'"
          );
        }

        this.messages.push({ role: "assistant", content: responseContent });
        return parsedOutput;
      } catch (error) {
        throw new Error(`Invalid JSON response: ${error.message}`);
      }
    } catch (error) {
      console.error(`Error in LLM call: ${error.message}`);
      return {
        step: "observe",
        content: `Error: ${error.message}`,
      };
    }
  }

  async executeTool(functionName, functionInput) {
    if (!this.tools[functionName]) {
      return `Error: Tool '${functionName}' not found.`;
    }

    const tool = this.tools[functionName];
    const requiredParams = tool.parameters.required || [];

    // Validate required parameters
    for (const param of requiredParams) {
      if (!(param in functionInput)) {
        return `Error: Missing required parameter '${param}' for tool '${functionName}'.`;
      }
    }

    try {
      const output = await tool.fn(functionInput);
      return output;
    } catch (error) {
      return `Error executing tool '${functionName}': ${error.message}`;
    }
  }

  async runInteraction(userQuery) {
    console.log(`\n[USER QUERY] ${userQuery}`);
    this.messages = [this.messages[0]]; // Keep only system prompt
    this.messages.push({ role: "user", content: userQuery });

    let iterationCount = 0;
    while (iterationCount < this.maxIterations) {
      iterationCount++;
      console.log(
        `\n--- Iteration ${iterationCount}/${this.maxIterations} ---`
      );

      const parsedOutput = await this.callLLM();
      if (!parsedOutput || parsedOutput.step === "observe") {
        if (parsedOutput?.content) {
          console.log(`[LLM/SYSTEM ERROR] ${parsedOutput.content}`);
        }
        if (parsedOutput?.step !== "observe") {
          break;
        }
        continue;
      }

      const {
        step,
        content,
        function: functionName,
        input: functionInput,
      } = parsedOutput;
      console.log(`[LLM RESPONSE] Step: ${step}`);

      switch (step) {
        case "plan":
          console.log(`[PLAN] ${content}`);
          continue;

        case "action":
          if (!functionName || !functionInput) {
            console.log(
              "[ERROR] LLM action step missing 'function' or 'input'"
            );
            this.messages.push({
              role: "assistant",
              content: JSON.stringify({
                step: "observe",
                content:
                  "Error: Your previous 'action' step was malformed (missing 'function' or 'input').",
              }),
            });
            continue;
          }

          const toolOutput = await this.executeTool(
            functionName,
            functionInput
          );
          this.messages.push({
            role: "assistant",
            content: JSON.stringify({
              step: "observe",
              content: toolOutput,
            }),
          });
          continue;

        case "output":
          console.log(`\n[FINAL OUTPUT]\n${content}`);
          return content;

        default:
          console.log(`[ERROR] Unknown step type '${step}'`);
          this.messages.push({
            role: "assistant",
            content: JSON.stringify({
              step: "observe",
              content: `Error: Unknown step type '${step}'. Allowed steps are 'plan', 'action', 'output'.`,
            }),
          });
          continue;
      }
    }

    if (iterationCount >= this.maxIterations) {
      const timeoutMessage = `Reached maximum iterations (${this.maxIterations}). The task may be incomplete.`;
      console.log(`\n[FINAL OUTPUT]\n${timeoutMessage}`);
      return timeoutMessage;
    }
  }
}
