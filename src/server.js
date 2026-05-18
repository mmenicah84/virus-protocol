import http from "node:http";
import { pathToFileURL } from "node:url";
import { createFileStorage, createMarketplace, createTaskNetwork, listStrains, runtimeVersion } from "./index.js";

const port = Number(process.env.PORT ?? 8787);

export function createVirusServer(options = {}) {
  const storage = options.storage ?? createFileStorage();
  const marketplace = createMarketplace({ storage });

  return http.createServer(async (request, response) => {
    try {
      const url = new URL(request.url, "http://localhost");

      if (request.method === "OPTIONS") {
        return sendJson(response, 204, {});
      }

      if (request.method === "GET" && url.pathname === "/health") {
        return sendJson(response, 200, {
          ok: true,
          service: "virus-runtime",
          version: runtimeVersion,
        });
      }

      if (request.method === "GET" && url.pathname === "/strains") {
        return sendJson(response, 200, {
          strains: marketplace.list(),
        });
      }

      if (request.method === "POST" && url.pathname === "/strains") {
        const body = await readJson(request);
        const strain = marketplace.publish(body);
        return sendJson(response, 201, {
          strain,
        });
      }

      if (request.method === "GET" && url.pathname === "/networks") {
        return sendJson(response, 200, {
          networks: storage.listNetworks().map(summarizeStoredNetwork),
        });
      }

      if (request.method === "GET" && url.pathname.startsWith("/networks/")) {
        const id = decodeURIComponent(url.pathname.replace("/networks/", ""));
        const network = storage.findNetwork(id);

        if (!network) {
          return sendJson(response, 404, {
            error: "network_not_found",
          });
        }

        return sendJson(response, 200, network);
      }

      if (request.method === "POST" && url.pathname === "/run") {
        const body = await readJson(request);
        const network = createTaskNetwork({
          ...body,
          resolveStrain: (id) => marketplace.find(id),
        });
        storage.saveNetwork(network);
        return sendJson(response, 200, network);
      }

      if (request.method === "GET" && url.pathname === "/") {
        return sendJson(response, 200, {
          name: "VIRUS Runtime v1",
          endpoints: ["GET /health", "GET /strains", "POST /strains", "GET /networks", "GET /networks/:id", "POST /run"],
          strains: listStrains().map((strain) => strain.id),
        });
      }

      return sendJson(response, 404, {
        error: "not_found",
      });
    } catch (error) {
      return sendJson(response, 400, {
        error: "bad_request",
        message: error.message,
      });
    }
  });
}

function summarizeStoredNetwork(network) {
  return {
    id: network.id,
    createdAt: network.createdAt,
    goal: network.goal,
    strain: network.strain.id,
    mode: network.input.mode,
    host: network.host,
    immuneStatus: network.immuneReview.status,
    selectedStrategy: network.summary.selectedStrategy,
    estimatedCostVrs: network.summary.estimatedCostVrs,
    marketplaceReady: network.package.marketplaceReady,
  };
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type",
  });
  response.end(JSON.stringify(payload, null, 2));
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let raw = "";

    request.on("data", (chunk) => {
      raw += chunk;

      if (raw.length > 64_000) {
        reject(new Error("Request body is too large."));
        request.destroy();
      }
    });

    request.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (error) {
        reject(new Error(`Invalid JSON: ${error.message}`));
      }
    });

    request.on("error", reject);
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  createVirusServer().listen(port, () => {
    console.log(`VIRUS Runtime listening on http://localhost:${port}`);
  });
}
