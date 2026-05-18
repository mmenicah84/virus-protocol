const allowedHosts = new Set(["local", "public", "repository", "cloud"]);
const allowedStrains = new Set(["research", "code", "audit", "market"]);
const allowedModes = new Set(["balanced", "fast", "precise", "low_cost", "low-cost"]);

export function normalizeRunInput(input = {}) {
  const goal = normalizeGoal(input.goal);
  const strain = normalizeStrain(input.strain ?? "research");
  const mode = normalizeChoice(input.mode ?? "balanced", "mode", allowedModes).replace("-", "_");
  const host = normalizeChoice(input.host ?? "local", "host", allowedHosts);
  const budgetVrs = normalizeBudget(input.budgetVrs ?? input.budget ?? 40);
  const metadata = normalizeMetadata(input.metadata);

  return {
    goal,
    strain,
    mode,
    host,
    budgetVrs,
    metadata,
  };
}

export function createRunReceipt({ network }) {
  return {
    networkId: network.id,
    createdAt: network.createdAt,
    goal: network.goal,
    strain: network.strain.id,
    mode: network.mutationMode.label,
    host: network.host,
    immuneStatus: network.immuneReview.status,
    selectedVariantId: network.summary.selectedVariantId,
    selectedStrategy: network.summary.selectedStrategy,
    estimatedCostVrs: network.summary.estimatedCostVrs,
    marketplaceReady: network.package.marketplaceReady,
  };
}

function normalizeGoal(goal) {
  if (typeof goal !== "string") {
    throw new Error("Run input requires a goal string.");
  }

  const trimmed = goal.trim();
  if (trimmed.length < 8) {
    throw new Error("Run input goal must be at least 8 characters.");
  }

  if (trimmed.length > 800) {
    throw new Error("Run input goal must be 800 characters or fewer.");
  }

  return trimmed;
}

function normalizeChoice(value, label, allowed) {
  const normalized = String(value).trim().toLowerCase();

  if (!allowed.has(normalized)) {
    throw new Error(`Unsupported ${label}: ${value}`);
  }

  return normalized;
}

function normalizeStrain(value) {
  const normalized = String(value).trim().toLowerCase().replace("-strain", "");

  if (!allowedStrains.has(normalized)) {
    throw new Error(`Unsupported strain: ${value}`);
  }

  return normalized;
}

function normalizeBudget(value) {
  const budget = Number(value);

  if (!Number.isFinite(budget) || budget <= 0) {
    throw new Error("Run input budget must be a positive number.");
  }

  if (budget > 10000) {
    throw new Error("Run input budget is too high for the MVP runtime.");
  }

  return Number(budget.toFixed(2));
}

function normalizeMetadata(metadata) {
  if (metadata === undefined) {
    return {};
  }

  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    throw new Error("Run input metadata must be an object.");
  }

  return structuredClone(metadata);
}
