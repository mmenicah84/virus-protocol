import test from "node:test";
import assert from "node:assert/strict";
import { createMarketplace, createTaskNetwork, listStrains, normalizeRunInput } from "../src/index.js";

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
