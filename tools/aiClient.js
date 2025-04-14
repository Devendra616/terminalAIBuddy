/* 
    Prompts the user to choose OpenAI or Gemini
    Provides a basic interface for selecting stack
    Prepares the foundation for future AI calls
*/

import readlineSync from "readline-sync";
import fs from "fs";
import path from "path";
import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

/**
 * Return the appropriate client based on model (currently OpenAI)
 */
export function initializeAIClient(model) {
  if (model === "openai") {
    return new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  // Placeholder for Gemini client integration
  if (model === "gemini") {
    console.warn("⚠️ Gemini client not yet implemented.");
    return null;
  }

  throw new Error("Unsupported model: " + model);
}

export function selectModel() {
  console.log("\n🤖 Choose your AI model:");
  const options = ["OpenAI", "Gemini (not implemented yet)"];
  const index = readlineSync.keyInSelect(options, "Select AI:");
  if (index === -1) {
    console.log("❌ No model selected. Exiting...");
    process.exit(1);
  }

  const model = options[index];

  return model.toLowerCase(); // 'openai' or 'gemini'
}

export function askProjectStack() {
  console.log("\n🧱 Choose your tech stack:");
  const stacks = ["MERN", "Flask", "Django", "HTML/CSS/JS"];
  const index = readlineSync.keyInSelect(stacks, "Select stack:");
  if (index === -1) {
    console.log("❌ No stack selected. Exiting...");
    process.exit(1);
  }

  return stacks[index].toLowerCase();
}

let cachedOpenAI = null;

export function getAIClient(model) {
  if (model === "openai") {
    if (!cachedOpenAI) {
      cachedOpenAI = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }
    return cachedOpenAI;
  }

  throw new Error("Only OpenAI is supported for now.");
}
