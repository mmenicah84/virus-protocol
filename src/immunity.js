const blockedGoalPatterns = [
  /steal/i,
  /phish/i,
  /malware/i,
  /private key/i,
  /seed phrase/i,
  /bypass/i,
];

const destructiveTools = new Set(["wallet:transfer", "shell:delete", "prod:write"]);

export function runImmuneReview({ goal, strain, variants, budgetVrs = 40, host = "local" }) {
  const findings = [];

  if (!goal || goal.trim().length < 8) {
    findings.push(makeFinding("goal_too_short", "Goal needs a clearer objective.", "medium"));
  }

  if (blockedGoalPatterns.some((pattern) => pattern.test(goal))) {
    findings.push(makeFinding("blocked_intent", "Goal appears to request a prohibited or unsafe action.", "high"));
  }

  const requestedCost = variants.reduce((sum, variant) => sum + variant.estimatedCostVrs, 0);
  if (requestedCost > budgetVrs) {
    findings.push(makeFinding("budget_exceeded", `Estimated ${requestedCost} VRS exceeds budget ${budgetVrs} VRS.`, "medium"));
  }

  const unsafePermissions = strain.permissions.filter((permission) => destructiveTools.has(permission));
  if (unsafePermissions.length > 0) {
    findings.push(makeFinding("unsafe_permission", `Unsafe permissions requested: ${unsafePermissions.join(", ")}`, "high"));
  }

  if (host === "public" && strain.memoryScope !== "task") {
    findings.push(makeFinding("public_host_memory", "Public hosts should use task-scoped memory by default.", "medium"));
  }

  const status = findings.some((finding) => finding.severity === "high") ? "blocked" : "passed";

  return {
    status,
    findings,
    requestedCost: Number(requestedCost.toFixed(2)),
    budgetVrs,
  };
}

function makeFinding(code, message, severity) {
  return {
    code,
    message,
    severity,
  };
}
