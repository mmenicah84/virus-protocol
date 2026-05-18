import { getMutationMode, getStrain, validateDNA } from "./dna.js";
import { createVariants } from "./mutation.js";
import { runImmuneReview } from "./immunity.js";
import { scoreVariants, summarizeNetwork } from "./scoring.js";
import { createAuditTrail } from "./audit.js";
import { createRunReceipt, normalizeRunInput } from "./contract.js";
import { executeVariants } from "./execution.js";

export function createTaskNetwork(options = {}) {
  const input = normalizeRunInput(options);

  const strain = getStrain(input.strain);
  const dnaValidation = validateDNA(strain);

  if (!dnaValidation.ok) {
    throw new Error(`Invalid Agent DNA. Missing: ${dnaValidation.missing.join(", ")}`);
  }

  const mutationMode = getMutationMode(input.mode);
  const variants = createVariants({ goal: input.goal, strain, mode: input.mode });
  const immuneReview = runImmuneReview({
    goal: input.goal,
    strain,
    variants,
    budgetVrs: input.budgetVrs,
    host: input.host,
  });
  const executedVariants = executeVariants({ variants, immuneReview });
  const scoredVariants = scoreVariants({ variants: executedVariants, immuneReview });
  const summary = summarizeNetwork({ scoredVariants, immuneReview });
  const createdAt = new Date().toISOString();
  const network = {
    id: createNetworkId(input.goal, strain.id),
    createdAt,
    input,
    goal: input.goal,
    host: input.host,
    strain,
    mutationMode,
    variants: scoredVariants,
    immuneReview,
    summary,
    auditTrail: createAuditTrail({
      input,
      strain,
      mutationMode,
      variants: scoredVariants,
      immuneReview,
      summary,
    }),
    package: {
      dna: strain.name,
      selectedVariantId: summary.selectedVariantId,
      reusable: immuneReview.status === "passed",
      marketplaceReady: immuneReview.status === "passed" && summary.reuseScore >= 70,
      artifacts: collectSelectedArtifacts(scoredVariants, summary.selectedVariantId),
    },
  };

  return {
    ...network,
    receipt: createRunReceipt({ network }),
  };
}

function createNetworkId(goal, strainId) {
  const seed = `${strainId}:${goal}`.toLowerCase();
  let hash = 0;

  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }

  return `vnet_${hash.toString(16).padStart(8, "0")}`;
}

function collectSelectedArtifacts(variants, selectedVariantId) {
  const selected = variants.find((variant) => variant.id === selectedVariantId);
  return selected?.execution?.artifacts ?? [];
}
