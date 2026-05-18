#!/usr/bin/env node
import { createMarketplace, createTaskNetwork } from "../src/index.js";

const [, , command, ...args] = process.argv;

try {
  if (!command || command === "help") {
    printHelp();
    process.exit(0);
  }

  if (command === "health") {
    printJson({
      ok: true,
      runtime: "virus-mvp",
      version: "0.1.0",
    });
    process.exit(0);
  }

  if (command === "strains") {
    const marketplace = createMarketplace();
    printJson({
      strains: marketplace.list(),
    });
    process.exit(0);
  }

  if (command === "run") {
    const parsed = parseRunArgs(args);
    const network = createTaskNetwork(parsed);

    if (parsed.json) {
      printJson(network);
    } else {
      printNetwork(network);
    }

    process.exit(0);
  }

  throw new Error(`Unknown command: ${command}`);
} catch (error) {
  console.error(`VIRUS error: ${error.message}`);
  process.exit(1);
}

function parseRunArgs(args) {
  const goalParts = [];
  const options = {
    strain: "research",
    mode: "balanced",
    host: "local",
    budgetVrs: 40,
    json: false,
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--strain") {
      options.strain = args[++index];
    } else if (arg === "--mode") {
      options.mode = args[++index];
    } else if (arg === "--host") {
      options.host = args[++index];
    } else if (arg === "--budget") {
      options.budgetVrs = Number(args[++index]);
    } else if (arg === "--json") {
      options.json = true;
    } else {
      goalParts.push(arg);
    }
  }

  return {
    ...options,
    goal: goalParts.join(" ").trim(),
  };
}

function printNetwork(network) {
  console.log(`VIRUS Task Network: ${network.id}`);
  console.log(`Goal: ${network.goal}`);
  console.log(`Strain: ${network.strain.name}`);
  console.log(`Immune status: ${network.immuneReview.status}`);
  console.log(`Selected strategy: ${network.summary.selectedStrategy}`);
  console.log(`Estimated cost: ${network.summary.estimatedCostVrs} VRS`);
  console.log("");
  console.log("Variants:");

  for (const variant of network.variants) {
    console.log(`- ${variant.label}: score ${variant.score}, cost ${variant.estimatedCostVrs} VRS, risk ${variant.risk}`);
  }
}

function printJson(payload) {
  console.log(JSON.stringify(payload, null, 2));
}

function printHelp() {
  console.log(`VIRUS Runtime MVP

Usage:
  virus run "Analyze a competitor" --strain research --mode balanced
  virus run "Fix a bug" --strain code --mode precise --json
  virus strains
  virus health

Options:
  --strain   research | code | audit | market
  --mode     balanced | fast | precise | low_cost
  --host     local | public
  --budget   VRS budget number
  --json     Print full JSON task network
`);
}
