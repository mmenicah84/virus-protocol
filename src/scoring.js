export function scoreVariants({ variants, immuneReview }) {
  return variants
    .map((variant) => {
      const riskPenalty = variant.risk * 24;
      const costPenalty = Math.min(18, variant.estimatedCostVrs * 0.9);
      const blockedPenalty = immuneReview.status === "blocked" ? 42 : 0;
      const qualityScore = variant.quality * 48;
      const reuseScore = variant.reuse * 32;
      const score = Math.max(0, qualityScore + reuseScore - riskPenalty - costPenalty - blockedPenalty);

      return {
        ...variant,
        score: Number(score.toFixed(2)),
        status: immuneReview.status === "blocked" ? "blocked" : "reviewed",
      };
    })
    .sort((a, b) => b.score - a.score);
}

export function summarizeNetwork({ scoredVariants, immuneReview }) {
  const best = scoredVariants[0];

  return {
    selectedVariantId: best?.id ?? null,
    selectedStrategy: best?.strategy ?? null,
    immuneStatus: immuneReview.status,
    estimatedCostVrs: immuneReview.requestedCost,
    reuseScore: best ? Number((best.reuse * 100).toFixed(0)) : 0,
    risk: best ? classifyRisk(best.risk) : "unknown",
  };
}

function classifyRisk(risk) {
  if (risk < 0.24) return "low";
  if (risk < 0.4) return "medium";
  return "elevated";
}
