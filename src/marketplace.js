import { listStrains, validateDNA } from "./dna.js";
import { createMemoryStorage } from "./storage.js";

export function createMarketplace(options = {}) {
  const storage = options.storage ?? createMemoryStorage();
  const builtinStrains = listStrains().map((strain, index) => ({
    ...strain,
    rank: index + 1,
    calls: 1200 - index * 137,
    successRate: Number((0.91 - index * 0.03).toFixed(2)),
    creatorFeeBps: 250,
  }));

  return {
    list() {
      return listAllStrains({ builtinStrains, storage });
    },

    find(id) {
      return structuredClone(listAllStrains({ builtinStrains, storage }).find((strain) => strain.id === id));
    },

    publish(dna) {
      const validation = validateDNA(dna);

      if (!validation.ok) {
        throw new Error(`Cannot publish invalid DNA. Missing: ${validation.missing.join(", ")}`);
      }

      if (listAllStrains({ builtinStrains, storage }).some((strain) => strain.id === dna.id)) {
        throw new Error(`Strain already exists: ${dna.id}`);
      }

      const entry = {
        ...dna,
        rank: listAllStrains({ builtinStrains, storage }).length + 1,
        calls: 0,
        successRate: 0,
        creatorFeeBps: dna.creatorFeeBps ?? 250,
      };

      storage.saveStrain(entry);
      return structuredClone(entry);
    },
  };
}

function listAllStrains({ builtinStrains, storage }) {
  return [...builtinStrains, ...storage.listStrains()].map((strain, index) => ({
    ...structuredClone(strain),
    rank: index + 1,
  }));
}
