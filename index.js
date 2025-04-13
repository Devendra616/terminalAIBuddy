import readlineSync from "readline-sync";
import dotenv from "dotenv";
import {
  selectModel,
  askProjectStack,
  initializeAIClient,
} from "./tools/aiClient.js";
import { handleFeatureRequest } from "./core/stepHandler.js";

import { saveSession, loadSession } from "./tools/sessionState.js";
import { createBaseStructure } from "./tools/fileManager.js";

dotenv.config();

console.log(
  "\n👋 Welcome to TermiBuddy - Your Terminal 💻 Full-Stack AI Agent!"
);

let session = loadSession();

// STEP 1: Select AI model (OpenAI / Gemini)
if (!session.model) {
  session.model = selectModel();
  saveSession(session);
}

// STEP 2: Choose stack (MERN / Flask / Django)
if (!session.stack) {
  session.stack = askProjectStack();
  saveSession(session);
}

// STEP 3: Ask for project idea
if (!session.projectName) {
  const idea = readlineSync.question(
    "💡 What kind of project are you building? "
  );
  session.projectName = idea.trim().replace(/\s+/g, "-").toLowerCase();
  session.projectIdea = idea;
  saveSession(session);

  // Generate folder structure
  createBaseStructure(session.projectName, session.stack);
  console.log(`📁 Project scaffold created for '${session.stack}' stack.`);
}

console.log(
  `\n🚀 Project "${session.projectName}" initialized using ${session.stack} and ${session.model}.`
);
console.log(
  "✅ Ready for feature development. Type your first feature request below.\n"
);

// LOOP for feature-based interaction
async function featureLoop() {
  while (true) {
    const answer = readlineSync
      .question("\n🧠 Next task (type `exit` to quit): ")
      .trim();

    if (answer.toLowerCase() === "exit") {
      console.log("👋 Exiting TermiBuddy. Happy coding!");
      break;
    }

    // Handle feature request using dynamic input
    await handleFeatureRequest(answer);
  }
}

// Start feature loop after project setup
await featureLoop();
