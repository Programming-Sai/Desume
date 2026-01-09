import fs from "fs";
import path from "path";
import inquirer from "inquirer";
import { createWorkspace } from "../utils/workspace.js";

export async function runInit(options = {}) {
  const { folder, global, verbose } = options;

  let scope = null;
  let basePath = null;

  // ─────────────────────────────────────────
  // 1. Resolve mode (non-interactive first)
  // ─────────────────────────────────────────

  if (folder && global) {
    console.error("❌ Cannot use --folder and --global together");
    process.exit(1);
  }

  if (folder) {
    scope = "project";
    basePath = path.resolve(folder);
  }

  if (global) {
    scope = "global";
  }

  // ─────────────────────────────────────────
  // 2. Interactive fallback
  // ─────────────────────────────────────────

  if (!scope) {
    const { scope: selectedScope } = await inquirer.prompt([
      {
        type: "rawlist",
        name: "scope",
        message: "Where should Desume create its workspace?",
        choices: [
          { name: "Project (current directory)", value: "project" },
          { name: "Global (~/.desume)", value: "global" },
        ],
      },
    ]);

    scope = selectedScope;

    if (scope === "project") {
      basePath = process.cwd();
    }
  }

  // ─────────────────────────────────────────
  // 3. Validate project path
  // ─────────────────────────────────────────

  if (scope === "project") {
    if (!basePath) {
      console.error("❌ Project path not resolved");
      process.exit(1);
    }

    if (!fs.existsSync(basePath)) {
      console.error(`❌ Path does not exist: ${basePath}`);
      process.exit(1);
    }

    if (verbose) {
      console.log(`ℹ Using project directory: ${basePath}`);
    }
  }

  // ─────────────────────────────────────────
  // 4. Create workspace
  // ─────────────────────────────────────────

  let workspace;

  try {
    if (verbose) {
      console.log("ℹ Creating Desume workspace…");
    }

    workspace = createWorkspace({
      scope,
      cwd: basePath,
    });
  } catch (err) {
    console.error(`❌ ${err.message}`);
    process.exit(1);
  }

  // ─────────────────────────────────────────
  // 5. Success output (Unix style)
  // ─────────────────────────────────────────

  console.log("✔ Desume workspace initialized");
  console.log(`  Scope: ${workspace.scope}`);
  console.log(`  Path : ${workspace.path}`);

  if (verbose) {
    console.log("ℹ Initialization complete");
  }
}
