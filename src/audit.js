export function createAuditTrail({ input, strain, mutationMode, variants, immuneReview, summary }) {
  return [
    makeEvent("input.normalized", {
      goalLength: input.goal.length,
      strain: input.strain,
      mode: input.mode,
      host: input.host,
      budgetVrs: input.budgetVrs,
    }),
    makeEvent("dna.loaded", {
      strain: strain.name,
      tools: strain.tools,
      permissions: strain.permissions,
    }),
    makeEvent("mutation.spawned", {
      mode: mutationMode.label,
      variants: variants.map((variant) => variant.id),
    }),
    makeEvent("immunity.reviewed", {
      status: immuneReview.status,
      findings: immuneReview.findings.map((finding) => finding.code),
      requestedCost: immuneReview.requestedCost,
    }),
    makeEvent("network.scored", {
      selectedVariantId: summary.selectedVariantId,
      selectedStrategy: summary.selectedStrategy,
      risk: summary.risk,
      reuseScore: summary.reuseScore,
    }),
  ];
}

function makeEvent(type, data) {
  return {
    type,
    data,
  };
}
