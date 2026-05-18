export const mutationModes = {
  balanced: {
    label: "Balanced Mutation",
    costMultiplier: 1,
    riskTolerance: "medium",
    variants: ["baseline", "fast", "precise", "low_cost"],
  },
  fast: {
    label: "Fast Mutation",
    costMultiplier: 0.72,
    riskTolerance: "medium",
    variants: ["fast", "baseline", "low_cost"],
  },
  precise: {
    label: "High Precision Mutation",
    costMultiplier: 1.35,
    riskTolerance: "low",
    variants: ["precise", "baseline", "audit_heavy"],
  },
  low_cost: {
    label: "Low Cost Mutation",
    costMultiplier: 0.54,
    riskTolerance: "low",
    variants: ["low_cost", "baseline", "fast"],
  },
};

export const strainLibrary = {
  research: {
    id: "research",
    name: "Research-Strain",
    summary: "Due diligence, source review, competitive intelligence.",
    tools: ["search", "documents", "citations", "summarizer"],
    memoryScope: "project",
    permissions: ["read:web", "read:docs"],
    mutationRules: ["compare_sources", "challenge_claims", "compress_findings"],
    immunityRules: ["source_check", "privacy_check", "budget_check"],
    reward: {
      success: "validated_findings",
      reuse: "report_template",
    },
  },
  code: {
    id: "code",
    name: "Code-Strain",
    summary: "Implementation planning, patch generation, test loops.",
    tools: ["filesystem", "tests", "shell", "docs"],
    memoryScope: "repository",
    permissions: ["read:repo", "write:workspace", "run:tests"],
    mutationRules: ["small_patch", "test_first", "fallback_plan"],
    immunityRules: ["destructive_command_check", "scope_check", "budget_check"],
    reward: {
      success: "tests_passed",
      reuse: "patch_recipe",
    },
  },
  audit: {
    id: "audit",
    name: "Audit-Strain",
    summary: "Risk review, hallucination checks, permissions, budget gates.",
    tools: ["policy", "logs", "diff", "source_check"],
    memoryScope: "task",
    permissions: ["read:logs", "read:outputs"],
    mutationRules: ["risk_matrix", "source_trace", "rollback_path"],
    immunityRules: ["source_check", "privacy_check", "permission_check"],
    reward: {
      success: "risk_reduced",
      reuse: "review_checklist",
    },
  },
  market: {
    id: "market",
    name: "Market-Strain",
    summary: "Positioning, content loops, growth experiments.",
    tools: ["search", "social", "analytics", "copywriter"],
    memoryScope: "campaign",
    permissions: ["read:web", "read:social"],
    mutationRules: ["audience_split", "message_test", "channel_mix"],
    immunityRules: ["brand_safety", "privacy_check", "budget_check"],
    reward: {
      success: "conversion_signal",
      reuse: "campaign_playbook",
    },
  },
};

export function getStrain(id = "research") {
  const normalized = String(id).toLowerCase().replace("-strain", "");
  const strain = strainLibrary[normalized];

  if (!strain) {
    throw new Error(`Unknown strain: ${id}`);
  }

  return structuredClone(strain);
}

export function listStrains() {
  return Object.values(strainLibrary).map((strain) => structuredClone(strain));
}

export function getMutationMode(mode = "balanced") {
  const normalized = String(mode).toLowerCase().replace("-", "_");
  const mutationMode = mutationModes[normalized];

  if (!mutationMode) {
    throw new Error(`Unknown mutation mode: ${mode}`);
  }

  return structuredClone(mutationMode);
}

export function validateDNA(dna) {
  const required = ["id", "name", "tools", "permissions", "mutationRules", "immunityRules", "reward"];
  const missing = required.filter((key) => dna[key] === undefined);

  return {
    ok: missing.length === 0,
    missing,
  };
}
