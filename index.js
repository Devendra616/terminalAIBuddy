import readlineSync from "readline-sync";
import dotenv from "dotenv";
import chalk from "chalk";
import {
  selectModel,
  askProjectStack,
  initializeAIClient,
} from "./tools/aiClient.js";
import { handleFeatureRequest } from "./core/stepHandler.js";

import { saveSession, loadSession } from "./tools/sessionState.js";
import { createBaseStructure } from "./tools/fileManager.js";

dotenv.config();

// Print a nice welcome message with enhanced instructions
console.log(chalk.blue("=================================================="));
console.log(chalk.green("🤖 TermiBuddy - Your Terminal Full-Stack AI Agent"));
console.log(chalk.blue("=================================================="));
console.log(chalk.yellow("\nWelcome! I can help you with:"));
console.log(chalk.cyan(" - Creating new projects from scratch"));
console.log(chalk.cyan(" - Adding features to existing projects"));
console.log(chalk.cyan(" - Modifying and debugging code"));
console.log(chalk.cyan(" - Running development commands"));
console.log(chalk.yellow("\nLet's get started!\n"));

let session = loadSession();

// STEP 1: Select AI model (OpenAI / Gemini)
if (!session.model) {
  console.log(chalk.magenta("\n📡 Step 1: AI Model Selection"));
  session.model = selectModel();
  saveSession(session);
}

// STEP 2: Choose stack (MERN / Flask / Django)
if (!session.stack) {
  console.log(chalk.magenta("\n🏗️  Step 2: Tech Stack Selection"));
  session.stack = askProjectStack();
  saveSession(session);
}

// STEP 3: Ask for project idea
if (!session.projectName) {
  console.log(chalk.magenta("\n💡 Step 3: Project Details"));
  const idea = readlineSync.question(
    chalk.yellow("What kind of project are you building? ")
  );
  session.projectName = idea.trim().replace(/\s+/g, "-").toLowerCase();
  session.projectIdea = idea;
  saveSession(session);

  // Generate folder structure
  createBaseStructure(session.projectName, session.stack);
  console.log(
    chalk.green(
      `\n📁 Project scaffold created for '${chalk.bold(session.stack)}' stack.`
    )
  );
}

console.log(
  chalk.green(
    `\n🚀 Project "${chalk.bold(
      session.projectName
    )}" initialized using ${chalk.bold(session.stack)} and ${chalk.bold(
      session.model
    )}.`
  )
);
console.log(
  chalk.yellow(
    "✅ Ready for feature development. Type your first feature request below.\n"
  )
);

// LOOP for feature-based interaction
async function featureLoop() {
  while (true) {
    const answer = readlineSync
      .question(
        `[Proj:${session.projectName}]
        ${chalk.cyan(">> Next task (type")} ${chalk.red("exit")} ${chalk.cyan(
          "to quit): "
        )}`
      )
      .trim();

    if (answer.toLowerCase() === "exit") {
      console.log(chalk.green("\n👋 Exiting TermiBuddy. Happy coding!"));
      break;
    }

    // Handle feature request using dynamic input
    await handleFeatureRequest(answer);
  }
}

// Start feature loop after project setup
await featureLoop();
