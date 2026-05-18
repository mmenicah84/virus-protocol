import { listStrains, validateDNA } from "./dna.js";

export function createMarketplace() {
  const strains = listStrains().map((strain, index) => ({
    ...strain,
    rank: index + 1,
    calls: 1200 - index * 137,
    successRate: Number((0.91 - index * 0.03).toFixed(2)),
    creatorFeeBps: 250,
  }));

  return {
    list() {
      return strains.map((strain) => structuredClone(strain));
    },

    find(id) {
      return structuredClone(strains.find((strain) => strain.id === id));
    },

    publish(dna) {
      const validation = validateDNA(dna);

      if (!validation.ok) {
        throw new Error(`Cannot publish invalid DNA. Missing: ${validation.missing.join(", ")}`);
      }

      if (strains.some((strain) => strain.id === dna.id)) {
        throw new Error(`Strain already exists: ${dna.id}`);
      }

      const entry = {
        ...dna,
        rank: strains.length + 1,
        calls: 0,
        successRate: 0,
        creatorFeeBps: dna.creatorFeeBps ?? 250,
      };

      strains.push(entry);
      return structuredClone(entry);
    },
  };
}
