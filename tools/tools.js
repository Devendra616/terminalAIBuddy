import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";
import readlineSync from "readline-sync";
import { runCommand } from "./executor.js";

const execAsync = promisify(exec);

export const AVAILABLE_TOOLS = {
  write_file: {
    fn: async (params) => {
      const { path: filePath, content } = params;
      if (!filePath || content === undefined) {
        return "Error: 'path' and 'content' are required.";
      }
      try {
        const dirPath = path.dirname(filePath);
        if (dirPath) {
          await fs.promises.mkdir(dirPath, { recursive: true });
        }
        await fs.promises.writeFile(filePath, content, "utf8");
        return `File '${filePath}' written successfully.`;
      } catch (error) {
        return `Error writing file '${filePath}': ${error.message}`;
      }
    },
    description:
      "Write content to a file. Creates parent directories if needed.",
    parameters: {
      type: "object",
      properties: {
        path: { type: "string", description: "File path to write to" },
        content: { type: "string", description: "Content to write" },
      },
      required: ["path", "content"],
    },
  },

  read_file: {
    fn: async (params) => {
      const { path: filePath } = params;
      if (!filePath) {
        return "Error: 'path' is required.";
      }
      try {
        const content = await fs.promises.readFile(filePath, "utf8");
        return content;
      } catch (error) {
        return `Error reading file '${filePath}': ${error.message}`;
      }
    },
    description: "Read content from a file.",
    parameters: {
      type: "object",
      properties: {
        path: { type: "string", description: "File path to read from" },
      },
      required: ["path"],
    },
  },

  run_command: {
    fn: runCommand,
    description: "Run a shell command and return its output.",
    parameters: {
      properties: {
        command: { type: "string", description: "Command to execute" },
        cwd: {
          type: "string",
          description: "directory where to run the command",
        },
      },
      required: ["command"],
    },
  },

  ask_user_for_feedback: {
    fn: async (params) => {
      const { question } = params;
      if (!question) {
        return "Error: 'question' is required.";
      }
      try {
        const answer = readlineSync.question(question + " ");
        return `User response: ${answer}`;
      } catch (error) {
        return `Error getting user feedback: ${error.message}`;
      }
    },
    description: "Ask the user a question and get their response.",
    parameters: {
      type: "object",
      properties: {
        question: { type: "string", description: "Question to ask the user" },
      },
      required: ["question"],
    },
  },

  list_files: {
    fn: async (params) => {
      const { directory = "." } = params;
      try {
        const files = await fs.promises.readdir(directory);
        return JSON.stringify(files);
      } catch (error) {
        return `Error listing files in '${directory}': ${error.message}`;
      }
    },
    description: "List files in a directory.",
    parameters: {
      type: "object",
      properties: {
        directory: {
          type: "string",
          description: "Directory to list files from",
        },
      },
      required: [],
    },
  },

  create_directory: {
    fn: async (params) => {
      const { path: dirPath } = params;
      if (!dirPath) {
        return "Error: 'path' is required.";
      }
      try {
        await fs.promises.mkdir(dirPath, { recursive: true });
        return `Directory '${dirPath}' created successfully.`;
      } catch (error) {
        return `Error creating directory '${dirPath}': ${error.message}`;
      }
    },
    description:
      "Create a new directory. Creates parent directories if needed.",
    parameters: {
      type: "object",
      properties: {
        path: { type: "string", description: "Directory path to create" },
      },
      required: ["path"],
    },
  },

  delete_file: {
    fn: async (params) => {
      const { path: filePath } = params;
      if (!filePath) {
        return "Error: 'path' is required.";
      }
      try {
        await fs.promises.unlink(filePath);
        return `File '${filePath}' deleted successfully.`;
      } catch (error) {
        return `Error deleting file '${filePath}': ${error.message}`;
      }
    },
    description: "Delete a file.",
    parameters: {
      type: "object",
      properties: {
        path: { type: "string", description: "File path to delete" },
      },
      required: ["path"],
    },
  },

  delete_directory: {
    fn: async (params) => {
      const { path: dirPath } = params;
      if (!dirPath) {
        return "Error: 'path' is required.";
      }
      try {
        await fs.promises.rm(dirPath, { recursive: true, force: true });
        return `Directory '${dirPath}' deleted successfully.`;
      } catch (error) {
        return `Error deleting directory '${dirPath}': ${error.message}`;
      }
    },
    description:
      "Delete a directory and all its contents recursively. Use with caution!",
    parameters: {
      type: "object",
      properties: {
        path: { type: "string", description: "Directory path to delete" },
      },
      required: ["path"],
    },
  },

  check_file_exists: {
    fn: async (params) => {
      const { path: filePath } = params;
      if (!filePath) {
        return "Error: 'path' is required.";
      }
      try {
        const exists = await fs.promises
          .access(filePath)
          .then(() => true)
          .catch(() => false);
        return JSON.stringify({ exists });
      } catch (error) {
        return `Error checking file existence '${filePath}': ${error.message}`;
      }
    },
    description: "Check if a file exists.",
    parameters: {
      type: "object",
      properties: {
        path: { type: "string", description: "File path to check" },
      },
      required: ["path"],
    },
  },

  get_file_info: {
    fn: async (params) => {
      const { path: filePath } = params;
      if (!filePath) {
        return "Error: 'path' is required.";
      }
      try {
        const stats = await fs.promises.stat(filePath);
        return JSON.stringify({
          size: stats.size,
          isDirectory: stats.isDirectory(),
          isFile: stats.isFile(),
          created: stats.birthtime,
          modified: stats.mtime,
        });
      } catch (error) {
        return `Error getting file info '${filePath}': ${error.message}`;
      }
    },
    description: "Get detailed information about a file or directory.",
    parameters: {
      type: "object",
      properties: {
        path: { type: "string", description: "File path to get info for" },
      },
      required: ["path"],
    },
  },

  copy_file: {
    fn: async (params) => {
      const { source, destination } = params;
      if (!source || !destination) {
        return "Error: 'source' and 'destination' are required.";
      }
      try {
        await fs.promises.copyFile(source, destination);
        return `File copied from '${source}' to '${destination}' successfully.`;
      } catch (error) {
        return `Error copying file: ${error.message}`;
      }
    },
    description: "Copy a file from source to destination.",
    parameters: {
      type: "object",
      properties: {
        source: { type: "string", description: "Source file path" },
        destination: { type: "string", description: "Destination file path" },
      },
      required: ["source", "destination"],
    },
  },

  move_file: {
    fn: async (params) => {
      const { source, destination } = params;
      if (!source || !destination) {
        return "Error: 'source' and 'destination' are required.";
      }
      try {
        await fs.promises.rename(source, destination);
        return `File moved from '${source}' to '${destination}' successfully.`;
      } catch (error) {
        return `Error moving file: ${error.message}`;
      }
    },
    description: "Move a file from source to destination.",
    parameters: {
      type: "object",
      properties: {
        source: { type: "string", description: "Source file path" },
        destination: { type: "string", description: "Destination file path" },
      },
      required: ["source", "destination"],
    },
  },
};
