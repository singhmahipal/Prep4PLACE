import express from "express";
import { exec } from "child_process";
import { promises as fs } from "fs";
import path from "path";
import os from "os";

const router = express.Router();

const TIMEOUT_MS = 10000; // 10 second execution timeout
const IS_WINDOWS = os.platform() === "win32";

function generateId() {
  return Math.random().toString(36).substring(2, 10) + Date.now();
}

// Check if a runtime binary exists on this host
const checkRuntime = (binary) =>
  new Promise((resolve) => {
    exec(`${binary} --version`, (error) => resolve(!error));
  });

// Cache which runtimes are available (checked once at startup)
const availableRuntimes = {};

const initRuntimeCheck = async () => {
  availableRuntimes.node = await checkRuntime("node");
  availableRuntimes.python = await checkRuntime(IS_WINDOWS ? "python" : "python3");
  availableRuntimes.java = await checkRuntime("javac");
  console.log("✅ Available code execution runtimes:", availableRuntimes);
};

// Run the check immediately (non-blocking)
initRuntimeCheck();

const LANGUAGE_CONFIG = {
  javascript: {
    extension: "js",
    runtimeKey: "node",
    buildCommand: null,
    runCommand: (filePath) => `node "${filePath}"`,
    displayName: "Node.js",
  },
  python: {
    extension: "py",
    runtimeKey: "python",
    buildCommand: null,
    runCommand: (filePath) =>
      IS_WINDOWS ? `python "${filePath}"` : `python3 "${filePath}"`,
    displayName: "Python 3",
  },
  java: {
    extension: "java",
    runtimeKey: "java",
    buildCommand: (filePath) => `javac "${filePath}"`,
    runCommand: (filePath) => {
      const dir = path.dirname(filePath);
      const className = path.basename(filePath, ".java");
      return `java -cp "${dir}" ${className}`;
    },
    displayName: "Java",
  },
};

const runCommand = (command) => {
  return new Promise((resolve) => {
    exec(command, { timeout: TIMEOUT_MS, shell: true }, (error, stdout, stderr) => {
      resolve({ error, stdout: stdout || "", stderr: stderr || "" });
    });
  });
};

const cleanUp = async (filePath, language) => {
  try {
    await fs.unlink(filePath).catch(() => {});
    if (language === "java") {
      const className = path.basename(filePath, ".java");
      const dir = path.dirname(filePath);
      await fs.unlink(path.join(dir, `${className}.class`)).catch(() => {});
    }
  } catch (e) {
    // silently ignore cleanup errors
  }
};

// GET /api/code/runtimes — tells the frontend which languages are available
router.get("/runtimes", (_req, res) => {
  res.json(availableRuntimes);
});

// POST /api/code/execute
router.post("/execute", async (req, res) => {
  const { language, code } = req.body;

  if (!language || !code) {
    return res.status(400).json({
      success: false,
      output: "",
      error: "Both 'language' and 'code' fields are required.",
    });
  }

  const config = LANGUAGE_CONFIG[language];
  if (!config) {
    return res.status(400).json({
      success: false,
      output: "",
      error: `Unsupported language: "${language}". Supported: javascript, python, java.`,
    });
  }

  // Check if the runtime is available on this server
  if (!availableRuntimes[config.runtimeKey]) {
    return res.json({
      success: false,
      output: "",
      error: `${config.displayName} runtime is not available on this server. Try JavaScript or Python instead.`,
    });
  }

  const tempDir = os.tmpdir();
  const fileId = generateId();
  let filePath;

  // Java: filename MUST match the public class name
  if (language === "java") {
    const classMatch = code.match(/public\s+class\s+(\w+)/);
    const className = classMatch ? classMatch[1] : `Solution${fileId}`;
    filePath = path.join(tempDir, `${className}.java`);
  } else {
    filePath = path.join(tempDir, `code_${fileId}.${config.extension}`);
  }

  try {
    // Write source code to temp file
    await fs.writeFile(filePath, code, "utf8");

    // Compile step (Java only)
    if (config.buildCommand) {
      const buildCmd = config.buildCommand(filePath);
      const { error: buildError, stderr: buildStderr } = await runCommand(buildCmd);

      if (buildError) {
        await cleanUp(filePath, language);
        return res.json({
          success: false,
          output: "",
          error: buildStderr || buildError.message,
        });
      }
    }

    // Execute step
    const runCmd = config.runCommand(filePath);
    const { error: runError, stdout, stderr } = await runCommand(runCmd);

    await cleanUp(filePath, language);

    // If there was a runtime error and no output was produced
    if (runError && !stdout) {
      return res.json({
        success: false,
        output: "",
        error: stderr || runError.message || "Execution failed.",
      });
    }

    // Execution succeeded (possibly with stderr warnings alongside output)
    return res.json({
      success: true,
      output: stdout || "No output",
      error: stderr || null,
    });
  } catch (err) {
    await cleanUp(filePath, language);
    return res.status(500).json({
      success: false,
      output: "",
      error: `Internal server error: ${err.message}`,
    });
  }
});

export default router;
