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
    case "html/css/js":
      return ["css", "js", "assets", "assets/images"];
    default:
      return [];
  }
}

/**
 * Creates project folder, folders inside it, and starter files
 */
export function createBaseStructure(projectName, stack) {
  // Check and create PROJECTS directory if it doesn't exist
  const projectsDir = path.join(process.cwd(), "PROJECTS");
  if (!fs.existsSync(projectsDir)) {
    fs.mkdirSync(projectsDir);
  }

  const rootPath = path.join(process.cwd(), "PROJECTS", projectName);
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

  // Create stack-specific files
  if (stack === "mern") {
    fs.writeFileSync(
      path.join(rootPath, "package.json"),
      JSON.stringify({ name: projectName, version: "1.0.0" }, null, 2)
    );
  } else if (stack === "html/css/js") {
    // Create basic HTML, CSS, and JS files
    fs.writeFileSync(
      path.join(rootPath, "index.html"),
      `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${projectName}</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <h1>Welcome to ${projectName}</h1>
    <script src="js/main.js"></script>
</body>
</html>`,
      "utf8"
    );
    fs.writeFileSync(
      path.join(rootPath, "css/style.css"),
      `/* Add your CSS styles here */`,
      "utf8"
    );
    fs.writeFileSync(
      path.join(rootPath, "js/main.js"),
      `// Add your JavaScript code here`,
      "utf8"
    );
  } else {
    fs.writeFileSync(path.join(rootPath, "requirements.txt"), "", "utf8");
  }

  // Update session with folder data
  const session = loadSession();
  session.projectRoot = rootPath;
  session.created_folders = createdFolders.map((f) =>
    path.relative(process.cwd(), f)
  );
  saveSession(session);
}
