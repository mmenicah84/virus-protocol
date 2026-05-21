#!/usr/bin/env node
import { createFileStorage, createMarketplace, createTaskNetwork, runtimeVersion } from "../src/index.js";
import { runtimeUnit } from "../src/units.js";

const [, , command, ...args] = process.argv;
const storage = createFileStorage();
const marketplace = createMarketplace({ storage });

try {
  if (!command || command === "help") {
    printHelp();
    process.exit(0);
  }

  if (command === "health") {
    printJson({
      ok: true,
      runtime: "virus-runtime",
      version: runtimeVersion,
    });
    process.exit(0);
  }

  if (command === "strains") {
    printJson({
      strains: marketplace.list(),
    });
    process.exit(0);
  }

  if (command === "networks") {
    printJson({
      networks: storage.listNetworks().map(summarizeStoredNetwork),
    });
    process.exit(0);
  }

  if (command === "show") {
    const id = args[0];
    if (!id) {
      throw new Error("The show command requires a network id.");
    }

    const network = storage.findNetwork(id);
    if (!network) {
      throw new Error(`Network not found: ${id}`);
    }

    printJson(network);
    process.exit(0);
  }

  if (command === "run") {
    const parsed = parseRunArgs(args);
    const network = createTaskNetwork({
      ...parsed,
      resolveStrain: (id) => marketplace.find(id),
    });
    storage.saveNetwork(network);

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

function summarizeStoredNetwork(network) {
  return {
    id: network.id,
    createdAt: network.createdAt,
    goal: network.goal,
    strain: network.strain.id,
    mode: network.input.mode,
    host: network.host,
    immuneStatus: network.immuneReview.status,
    selectedStrategy: network.summary.selectedStrategy,
    estimatedCostVrs: network.summary.estimatedCostVrs,
  };
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
  console.log(`Estimated cost: ${network.summary.estimatedCostVrs} ${runtimeUnit}`);
  console.log("");
  console.log("Variants:");

  for (const variant of network.variants) {
    console.log(`- ${variant.label}: score ${variant.score}, cost ${variant.estimatedCostVrs} ${runtimeUnit}, risk ${variant.risk}`);
  }
}

function printJson(payload) {
  console.log(JSON.stringify(payload, null, 2));
}

function printHelp() {
  console.log(`VIRUS Runtime v1

Usage:
  virus run "Analyze a competitor" --strain research --mode balanced
  virus run "Fix a bug" --strain code --mode precise --json
  virus strains
  virus networks
  virus show vnet_12345678
  virus health

Options:
  --strain   research | code | audit | market
  --mode     balanced | fast | precise | low_cost
  --host     local | public
  --budget   VIRUS budget number
  --json     Print full JSON task network
`);
}
