/* 
    Ensures the agent remembers progress between runs.
    Persists selections (model, stack, features, etc.)
*/

import fs from "fs";
import path from "path";

const sessionFile = path.join(process.cwd(), "session_state.json");

// Load session from file or create a new one
export function loadSession() {
  try {
    if (fs.existsSync(sessionFile)) {
      const data = fs.readFileSync(sessionFile, "utf8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("⚠️ Failed to load session:", err);
  }

  // Return default session structure if none exists
  return {
    model: null,
    stack: null,
    projectName: null,
    projectIdea: null,
    created_folders: [],
    features_built: [],
    next_tasks: [],
    git_committed: false,
  };
}

// Save current session state to file
export function saveSession(sessionData) {
  try {
    fs.writeFileSync(sessionFile, JSON.stringify(sessionData, null, 2), "utf8");
  } catch (err) {
    console.error("❌ Failed to save session state:", err);
  }
}
