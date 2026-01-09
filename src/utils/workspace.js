import fs from "fs";
import path from "path";
import os from "os";

const profileSchema = {
  personal: {
    name: { type: "string", required: true },
    email: { type: "string", required: true },
    phone: { type: "string", required: false },
    location: { type: "string", required: false },
    links: {
      website: { type: "string", required: false },
      linkedin: { type: "string", required: false },
      github: { type: "string", required: false },
      portfolio: { type: "string", required: false },
    },
  },
  summary: { type: "string", required: true },
  experience: {
    type: "array",
    required: false,
    schema: {
      company: { type: "string", required: true },
      position: { type: "string", required: true },
      location: { type: "string", required: false },
      startDate: { type: "string", required: true },
      endDate: { type: "string", required: false },
      description: { type: "array", required: false },
    },
  },
  education: {
    type: "array",
    required: false,
    schema: {
      institution: { type: "string", required: true },
      degree: { type: "string", required: false },
      field: { type: "string", required: false },
      startDate: { type: "string", required: false },
      endDate: { type: "string", required: false },
    },
  },
  skills: {
    type: "object",
    required: false,
    schema: {
      technologies: { type: "array", required: false },
      tools: { type: "array", required: false },
    },
  },
  projects: {
    type: "array",
    required: false,
    schema: {
      name: { type: "string", required: true },
      description: { type: "string", required: false },
      repoUrl: { type: "string", required: true },
      demoUrl: { type: "string", required: false },
      language: { type: "string", required: false },
      lastUpdated: { type: "string", required: false },
      isOwned: { type: "boolean", required: false },
    },
  },
};

/**
 * Workspace resolution rules:
 * 1. Use .desume in current working directory if present
 * 2. Else use ~/.desume if present
 * 3. Else return null
 */

const WORKSPACE_NAME = ".desume";

export function findWorkspace(startDir = process.cwd()) {
  // 1. project-based workspace
  const localPath = path.join(startDir, WORKSPACE_NAME);
  if (fs.existsSync(localPath)) {
    return {
      type: "project",
      path: localPath,
    };
  }

  // 2. global workspace
  const globalPath = path.join(os.homedir(), WORKSPACE_NAME);
  if (fs.existsSync(globalPath)) {
    return {
      type: "global",
      path: globalPath,
    };
  }

  return null;
}

/**
 * Creates a new workspace at the given path
 */
export function createWorkspace({
  scope = "project",
  cwd = process.cwd(),
  verbose = false,
}) {
  let workspacePath;

  if (scope === "project") {
    workspacePath = path.join(cwd, WORKSPACE_NAME);
  } else if (scope === "global") {
    workspacePath = path.join(os.homedir(), WORKSPACE_NAME);
  } else {
    throw new Error(`Invalid workspace scope: ${scope}`);
  }

  if (fs.existsSync(workspacePath)) {
    throw new Error(`Desume workspace already exists at ${workspacePath}`);
  }

  const dirs = [
    workspacePath,
    path.join(workspacePath, "templates"),
    path.join(workspacePath, "templates", "base"),
    path.join(workspacePath, "history"),
  ];

  for (const dir of dirs) {
    fs.mkdirSync(dir, { recursive: true });
    if (verbose) console.log(`📁 Created directory: ${dir}`);
  }

  fs.writeFileSync(
    path.join(workspacePath, "profile.json"),
    JSON.stringify({}, null, 2),
    "utf8"
  );
  if (verbose) console.log(`📝 Created file: profile.json`);

  fs.writeFileSync(
    path.join(workspacePath, "schema.json"),
    JSON.stringify(profileSchema, null, 2),
    "utf8"
  );

  if (verbose)
    console.log(`📝 Created file: schema.json (populated with profile schema)`);

  fs.writeFileSync(path.join(workspacePath, ".keys.key"), "", "utf8");
  if (verbose) console.log(`🔑 Created file: .keys.key`);

  return {
    scope,
    path: workspacePath,
  };
}

/**
 * Ensures a workspace exists.
 * If none found, throws with a clear message.
 */
export function ensureWorkspace() {
  const workspace = findWorkspace();

  if (!workspace) {
    throw new Error(
      "No Desume workspace found.\nRun `desume init` to create one."
    );
  }

  return workspace;
}

/**
 * Helper to resolve paths inside workspace safely
 */
export function resolveInWorkspace(...segments) {
  const workspace = ensureWorkspace();
  return path.join(workspace.path, ...segments);
}

export default {
  findWorkspace,
  createWorkspace,
  ensureWorkspace,
  resolveInWorkspace,
};
