/* 
    Prompts the user to choose OpenAI or Gemini
    Provides a basic interface for selecting stack
    Prepares the foundation for future AI calls
*/

import readlineSync from "readline-sync";
import fs from "fs";
import path from "path";
import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";
import chalk from "chalk";
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
    // console.warn(chalk.yellow("⚠️  Gemini client not yet implemented."));
    return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    // return null;
  }

  throw new Error(chalk.red("Unsupported model: " + model));
}

export function selectModel() {
  console.log(chalk.cyan("\n🤖 Choose your AI model:"));
  const options = ["OpenAI", "Gemini"];
  const index = readlineSync.keyInSelect(options, chalk.yellow("Select AI:"));
  if (index === -1) {
    console.log(chalk.red("❌ No model selected. Exiting..."));
    process.exit(1);
  }

  const model = options[index];

  return model.toLowerCase(); // 'openai' or 'gemini'
}

export function askProjectStack() {
  console.log(chalk.cyan("\n🧱 Choose your tech stack:"));
  const stacks = ["MERN", "Flask", "Django", "HTML/CSS/JS"];
  const index = readlineSync.keyInSelect(stacks, chalk.yellow("Select stack:"));
  if (index === -1) {
    console.log(chalk.red("❌ No stack selected. Exiting..."));
    process.exit(1);
  }

  return stacks[index].toLowerCase();
}

let cachedOpenAI = null;

export function getAIClient(model) {
  if (!cachedOpenAI) {
    return initializeAIClient(model);
  }

  return cachedOpenAI;
}
