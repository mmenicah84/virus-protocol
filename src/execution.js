const stepMessages = {
  parse_goal: "Parsed the user objective into execution requirements.",
  select_tools: "Selected tools from the strain DNA.",
  execute_plan: "Executed the planned task route.",
  summarize_output: "Prepared a reusable output summary.",
  skip_noncritical_checks: "Skipped noncritical checks to reduce latency.",
  execute_short_plan: "Executed the shortest viable plan.",
  cross_check_sources: "Cross-checked source assumptions.",
  audit_output: "Reviewed output quality and traceability.",
  package_dna: "Packaged the reusable DNA pattern.",
  use_cached_context: "Reused cached context to reduce cost.",
  execute_minimal_plan: "Executed the minimal viable plan.",
  permission_review: "Reviewed permissions before execution.",
  immune_review: "Applied immune review before packaging.",
  rollback_plan: "Prepared a rollback path for risky actions.",
};

export function executeVariants({ variants, immuneReview }) {
  return variants.map((variant) => {
    if (immuneReview.status === "blocked") {
      return {
        ...variant,
        status: "blocked",
        execution: {
          status: "skipped",
          durationMs: 0,
          confidence: 0,
          artifacts: [],
          trace: ["Execution skipped because immune review blocked the task."],
        },
      };
    }

    const trace = variant.steps.map((step) => stepMessages[step] ?? `Ran ${step}.`);
    const confidence = calculateConfidence(variant);
    const durationMs = Math.round(420 + variant.steps.length * 180 + variant.estimatedCostVrs * 35);

    return {
      ...variant,
      status: "executed",
      execution: {
        status: "completed",
        durationMs,
        confidence,
        artifacts: createArtifacts(variant),
        trace,
      },
    };
  });
}

function calculateConfidence(variant) {
  const score = variant.quality * 0.58 + variant.reuse * 0.28 + (1 - variant.risk) * 0.14;
  return Number(score.toFixed(2));
}

function createArtifacts(variant) {
  return [
    {
      type: "plan",
      title: `${variant.label} execution plan`,
      content: `Use ${variant.toolPlan.join(", ")} to pursue: ${variant.goal}`,
    },
    {
      type: "dna_patch",
      title: `${variant.strainName} reusable pattern`,
      content: `Strategy ${variant.strategy} can be reused when goals match this strain and risk profile.`,
    },
  ];
}
