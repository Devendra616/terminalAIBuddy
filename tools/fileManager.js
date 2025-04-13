/* 
    Generates a stack-specific folder structure
    Creates base files like README.md, .gitignore
    Updates session with created foldersKeeps track of what was created (for rollback or logging)
*/
import fs from "fs";
import path from "path";
import { saveSession, loadSession } from "./sessionState.js";

/**
 * Recursively creates folders based on structure array
 */
function createFolders(basePath, folders, created = []) {
  folders.forEach((folder) => {
    const fullPath = path.join(basePath, folder);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      created.push(fullPath);
    }
  });

  return created;
}

/**
 * Returns base folder structure based on stack type
 */
function getStructure(stack) {
  switch (stack) {
    case "mern":
      return [
        "backend/routes",
        "backend/schema",
        "backend/config",
        "backend/services",
        "backend/utils",
        "frontend/components",
        "frontend/pages",
        "frontend/utils",
        "tests",
        "postman",
      ];
    case "flask":
    case "django":
      return [
        "app/routes",
        "app/models",
        "app/templates",
        "app/static",
        "tests",
        "postman",
      ];
    default:
      return [];
  }
}

/**
 * Creates project folder, folders inside it, and starter files
 */
export function createBaseStructure(projectName, stack) {
  const rootPath = path.join(process.cwd(), projectName);
  if (!fs.existsSync(rootPath)) {
    fs.mkdirSync(rootPath);
  }

  // Generate folder structure
  const folders = getStructure(stack);
  const createdFolders = createFolders(rootPath, folders);

  // Generate base files
  fs.writeFileSync(
    path.join(rootPath, "README.md"),
    `# ${projectName}\n`,
    "utf8"
  );
  fs.writeFileSync(
    path.join(rootPath, ".gitignore"),
    "node_modules/\n.env\n",
    "utf8"
  );
  if (stack === "mern") {
    fs.writeFileSync(
      path.join(rootPath, "package.json"),
      JSON.stringify({ name: projectName, version: "1.0.0" }, null, 2)
    );
  } else {
    fs.writeFileSync(path.join(rootPath, "requirements.txt"), "", "utf8");
  }

  // Update session with folder data
  const session = loadSession();
  session.created_folders = createdFolders.map((f) =>
    path.relative(process.cwd(), f)
  );
  saveSession(session);
}
