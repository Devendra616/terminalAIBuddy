import { exec } from "child_process";

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

    const child = exec(
      command,
      { cwd, shell: "/bin/bash" },
      (error, stdout, stderr) => {
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
      }
    );

    // Live stream stdout
    child.stdout?.pipe(process.stdout);
    child.stderr?.pipe(process.stderr);
  });
}
