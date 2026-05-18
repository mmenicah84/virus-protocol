import { getMutationMode } from "./dna.js";

const strategyProfiles = {
  baseline: {
    label: "Baseline",
    cost: 1,
    risk: 0.34,
    quality: 0.72,
    reuse: 0.72,
    steps: ["parse_goal", "select_tools", "execute_plan", "summarize_output"],
  },
  fast: {
    label: "Fast",
    cost: 0.68,
    risk: 0.42,
    quality: 0.62,
    reuse: 0.54,
    steps: ["parse_goal", "skip_noncritical_checks", "execute_short_plan", "summarize_output"],
  },
  precise: {
    label: "Precise",
    cost: 1.32,
    risk: 0.22,
    quality: 0.9,
    reuse: 0.82,
    steps: ["parse_goal", "cross_check_sources", "execute_plan", "audit_output", "package_dna"],
  },
  low_cost: {
    label: "Low Cost",
    cost: 0.48,
    risk: 0.3,
    quality: 0.58,
    reuse: 0.68,
    steps: ["parse_goal", "use_cached_context", "execute_minimal_plan", "summarize_output"],
  },
  audit_heavy: {
    label: "Audit Heavy",
    cost: 1.18,
    risk: 0.16,
    quality: 0.82,
    reuse: 0.78,
    steps: ["parse_goal", "permission_review", "execute_plan", "immune_review", "rollback_plan"],
  },
};

export function createVariants({ goal, strain, mode = "balanced" }) {
  const mutationMode = getMutationMode(mode);

  return mutationMode.variants.map((strategy, index) => {
    const profile = strategyProfiles[strategy];
    const estimatedCost = Number((8 * profile.cost * mutationMode.costMultiplier).toFixed(2));

    return {
      id: `${strain.id}-${strategy}-${index + 1}`,
      strainId: strain.id,
      strainName: strain.name,
      goal,
      strategy,
      label: profile.label,
      steps: profile.steps,
      toolPlan: selectTools(strain.tools, strategy),
      estimatedCostVrs: estimatedCost,
      risk: profile.risk,
      quality: profile.quality,
      reuse: profile.reuse,
      status: "spawned",
    };
  });
}

function selectTools(tools, strategy) {
  if (strategy === "low_cost") {
    return tools.slice(0, Math.max(1, Math.ceil(tools.length / 2)));
  }

  if (strategy === "audit_heavy") {
    return Array.from(new Set([...tools, "immune_review", "logs"]));
  }

  return [...tools];
}
