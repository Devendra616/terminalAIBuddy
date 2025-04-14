import { exec } from "child_process";
import os from "os";

/**
 * Determines the appropriate shell based on OS and available shells
 * @returns {string} Path to shell executable or shell name
 */
function getSystemShell() {
  const platform = process.platform;
  const userShell = process.env.SHELL || process.env.COMSPEC;

  // Windows
  if (platform === "win32") {
    return process.env.COMSPEC || "cmd.exe";
  }

  // macOS or Linux
  if (userShell) {
    if (userShell.includes("zsh")) return "zsh";
    if (userShell.includes("bash")) return "bash";
  }

  // Fallback to bash for Unix-like systems
  return platform === "win32" ? "cmd.exe" : "bash";
}

/**
 * Executes a system command and logs output.
 * Works in terminal-only environments, no sudo.
 *
 * @param {string} command - the shell command to run
 * @param {string} cwd - current working directory (optional)
 * @returns {Promise<void>}
 */
export function runCommand(command, cwd = process.cwd()) {
  return new Promise((resolve, reject) => {
    console.log(`\n📦 Executing: \`${command}\``);

    const shell = getSystemShell();
    console.log(`🐚 Using shell: ${shell}`);

    const options = {
      cwd,
      shell: shell,
    };

    const child = exec(command, options, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Command failed: ${error.message}`);
        reject(error);
        return;
      }

      if (stderr) {
        console.log(`⚠️ STDERR: ${stderr}`);
      }

      if (stdout) {
        console.log(`✅ STDOUT:\n${stdout}`);
      }

      resolve();
    });

    // Live stream stdout
    child.stdout?.pipe(process.stdout);
    child.stderr?.pipe(process.stderr);
  });
}
