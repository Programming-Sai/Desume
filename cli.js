#!/usr/bin/env node

import { Command } from "commander";
import { runInit } from "./src/cli/init.js";

const program = new Command();

program
  .name("desume")
  .description("Desume — Resume automation CLI")
  .version("0.1.0");

// ---------------- INIT ----------------
program
  .command("init")
  .description("Initialize a Desume workspace")
  .option("-f, --folder <path>", "Create project workspace at path")
  .option("-g, --global", "Create global workspace")
  .option("-v, --verbose", "Enable verbose output")
  .action(async (options) => {
    try {
      await runInit(options);
    } catch (err) {
      console.error("❌ Init failed:", err.message);
      process.exit(1);
    }
  });

// -------------------------------------

program.parse(process.argv);
