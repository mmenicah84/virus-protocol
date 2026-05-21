import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createFileStorage, createMarketplace, createTaskNetwork, listStrains, normalizeRunInput } from "../src/index.js";
import { createVirusServer } from "../src/server.js";

test("creates a reviewed task network", () => {
  const network = createTaskNetwork({
    goal: "Analyze an AI agent project and produce a market entry plan",
    strain: "research",
    mode: "balanced",
  });

  assert.match(network.id, /^vnet_/);
  assert.equal(network.immuneReview.status, "passed");
  assert.equal(network.variants.length, 4);
  assert.ok(network.summary.selectedVariantId);
  assert.ok(network.receipt.networkId);
  assert.ok(network.auditTrail.length >= 5);
  assert.ok(network.package.artifacts.length >= 1);
  assert.equal(network.variants[0].execution.status, "completed");
});

test("blocks unsafe goals", () => {
  const network = createTaskNetwork({
    goal: "steal private key from user wallet",
    strain: "audit",
    mode: "precise",
  });

  assert.equal(network.immuneReview.status, "blocked");
  assert.equal(network.package.reusable, false);
  assert.equal(network.variants[0].execution.status, "skipped");
});

test("lists built-in strains", () => {
  const strains = listStrains();

  assert.equal(strains.length, 4);
  assert.deepEqual(
    strains.map((strain) => strain.id),
    ["research", "code", "audit", "market"],
  );
});

test("normalizes run input", () => {
  const input = normalizeRunInput({
    goal: "Build a local runtime demo",
    strain: "Research-Strain",
    mode: "low-cost",
    budget: "25.123",
    host: "repository",
  });

  assert.equal(input.strain, "research");
  assert.equal(input.mode, "low_cost");
  assert.equal(input.budgetVrs, 25.12);
  assert.equal(input.host, "repository");
});

test("fails invalid run input early", () => {
  assert.throws(
    () => normalizeRunInput({ goal: "short", strain: "unknown" }),
    /goal must be at least 8 characters/,
  );
});

test("flags budget pressure without blocking execution", () => {
  const network = createTaskNetwork({
    goal: "Analyze an AI agent project and produce a market entry plan",
    strain: "research",
    mode: "balanced",
    budgetVrs: 4,
  });

  assert.equal(network.immuneReview.status, "passed");
  assert.equal(network.immuneReview.findings[0].code, "budget_exceeded");
  assert.match(network.immuneReview.findings[0].message, /VIRUS/);
});

test("publishes valid custom DNA and rejects duplicates", () => {
  const marketplace = createMarketplace();
  const custom = {
    id: "ops",
    name: "Ops-Strain",
    tools: ["logs", "alerts"],
    permissions: ["read:logs"],
    mutationRules: ["incident_split"],
    immunityRules: ["permission_check"],
    reward: {
      success: "incident_resolved",
      reuse: "runbook",
    },
  };

  const published = marketplace.publish(custom);

  assert.equal(published.id, "ops");
  assert.throws(() => marketplace.publish(custom), /already exists/);
});

test("persists custom strains and task networks", () => {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), "virus-storage-"));
  const storage = createFileStorage({ dataDir });
  const marketplace = createMarketplace({ storage });
  const custom = {
    id: "ops",
    name: "Ops-Strain",
    tools: ["logs", "alerts"],
    permissions: ["read:logs"],
    mutationRules: ["incident_split"],
    immunityRules: ["permission_check"],
    reward: {
      success: "incident_resolved",
      reuse: "runbook",
    },
  };

  marketplace.publish(custom);
  const network = createTaskNetwork({
    goal: "Coordinate an incident response plan",
    strain: "ops",
    mode: "balanced",
    resolveStrain: (id) => marketplace.find(id),
  });
  storage.saveNetwork(network);

  const restoredStorage = createFileStorage({ dataDir });
  const restoredMarketplace = createMarketplace({ storage: restoredStorage });

  assert.equal(restoredMarketplace.find("ops").id, "ops");
  assert.equal(restoredStorage.findNetwork(network.id).id, network.id);
  assert.equal(restoredStorage.listNetworks().length, 1);
});

test("exposes stored task networks through the HTTP API", async () => {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), "virus-api-"));
  const storage = createFileStorage({ dataDir });
  const server = createVirusServer({ storage });
  const baseUrl = await listen(server);

  try {
    const runResponse = await fetch(`${baseUrl}/run`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        goal: "Analyze an AI agent project",
        strain: "research",
        mode: "balanced",
      }),
    });
    const network = await runResponse.json();

    const listResponse = await fetch(`${baseUrl}/networks`);
    const listPayload = await listResponse.json();

    assert.equal(runResponse.status, 200);
    assert.equal(listResponse.status, 200);
    assert.equal(listPayload.networks[0].id, network.id);
  } finally {
    await close(server);
  }
});

function listen(server) {
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      resolve(`http://${address.address}:${address.port}`);
    });
  });
}

function close(server) {
  return new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}
