import fs from "node:fs";
import path from "node:path";

const collectionFiles = {
  networks: "networks.json",
  strains: "strains.json",
};

export function resolveDataDir() {
  return path.resolve(process.env.VIRUS_DATA_DIR ?? "data");
}

export function createMemoryStorage(initialState = {}) {
  const state = {
    networks: structuredClone(initialState.networks ?? []),
    strains: structuredClone(initialState.strains ?? []),
  };

  return {
    listNetworks() {
      return structuredClone(state.networks);
    },

    findNetwork(id) {
      return structuredClone(state.networks.find((network) => network.id === id));
    },

    saveNetwork(network) {
      upsertById(state.networks, network);
      return structuredClone(network);
    },

    listStrains() {
      return structuredClone(state.strains);
    },

    saveStrain(strain) {
      upsertById(state.strains, strain);
      return structuredClone(strain);
    },
  };
}

export function createFileStorage(options = {}) {
  const dataDir = path.resolve(options.dataDir ?? resolveDataDir());
  fs.mkdirSync(dataDir, { recursive: true });

  return {
    dataDir,

    listNetworks() {
      return readCollection(dataDir, "networks");
    },

    findNetwork(id) {
      return readCollection(dataDir, "networks").find((network) => network.id === id);
    },

    saveNetwork(network) {
      const networks = readCollection(dataDir, "networks");
      upsertById(networks, network);
      writeCollection(dataDir, "networks", networks);
      return structuredClone(network);
    },

    listStrains() {
      return readCollection(dataDir, "strains");
    },

    saveStrain(strain) {
      const strains = readCollection(dataDir, "strains");
      upsertById(strains, strain);
      writeCollection(dataDir, "strains", strains);
      return structuredClone(strain);
    },
  };
}

function readCollection(dataDir, name) {
  const filePath = collectionPath(dataDir, name);

  if (!fs.existsSync(filePath)) {
    return [];
  }

  const raw = fs.readFileSync(filePath, "utf8");
  if (!raw.trim()) {
    return [];
  }

  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error(`Storage collection must be an array: ${collectionFiles[name]}`);
  }

  return structuredClone(parsed);
}

function writeCollection(dataDir, name, collection) {
  const filePath = collectionPath(dataDir, name);
  const tempPath = `${filePath}.tmp`;
  fs.writeFileSync(tempPath, `${JSON.stringify(collection, null, 2)}\n`);
  fs.renameSync(tempPath, filePath);
}

function collectionPath(dataDir, name) {
  const fileName = collectionFiles[name];
  if (!fileName) {
    throw new Error(`Unknown storage collection: ${name}`);
  }

  return path.join(dataDir, fileName);
}

function upsertById(collection, entry) {
  const index = collection.findIndex((item) => item.id === entry.id);

  if (index >= 0) {
    collection[index] = structuredClone(entry);
  } else {
    collection.push(structuredClone(entry));
  }
}
