/* 
    Ask  the user for the next feature
    Using stack-specific generator (mern.js, etc.)
    Writing generated files
    Updating session state
*/

import fs from "fs";
import path from "path";
import readlineSync from "readline-sync";
import { saveSession, loadSession } from "../tools/sessionState.js";
import { runCommand } from "../tools/executor.js";
import { generateFeatureWithAI } from "../tools/aiCodeGenerator.js";

// Dynamically import stack logic
function getStackHandler(stack) {
  return import(`../stacks/${stack}.js`);
}

// Ask user what to build next
export async function handleFeatureRequest(feature) {
  const session = loadSession();

  if (!feature || feature.length < 2) {
    console.log("⚠️ Please enter a valid feature name.");
    return;
  }

  console.log(
    `🧠 Asking ${session.model.toUpperCase()} to generate "${feature}"...`
  );
  let files;
  // const { generateFeature } = await getStackHandler(session.stack);

  // const files = generateFeature(feature, session);
  try {
    files = await generateFeatureWithAI(feature);
  } catch (err) {
    console.error("❌ AI failed to generate code:", err.message);
    return;
  }
  // Write files
  files.forEach((file) => {
    const fullPath = path.resolve(file.path);
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(fullPath, file.content, "utf8");
    console.log(`✅ Created: ${path.relative(process.cwd(), fullPath)}`);
  });

  // Update session
  session.features_built.push(feature);
  saveSession(session);

  // Git commit
  if (fs.existsSync(path.join(session.projectName, ".git"))) {
    const relPaths = files
      .map((f) => path.relative(process.cwd(), f.path))
      .join(" ");
    await runCommand(`git add ${relPaths}`);
    await runCommand(`git commit -m "Add ${feature} feature via AI"`);
  }

  console.log(`🚀 Feature "${feature}" has been added.`);
}
