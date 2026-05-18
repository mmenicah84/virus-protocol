import http from "node:http";
import { pathToFileURL } from "node:url";
import { createMarketplace, createTaskNetwork, listStrains } from "./index.js";

const marketplace = createMarketplace();
const port = Number(process.env.PORT ?? 8787);

export function createVirusServer() {
  return http.createServer(async (request, response) => {
    try {
      if (request.method === "OPTIONS") {
        return sendJson(response, 204, {});
      }

      if (request.method === "GET" && request.url === "/health") {
        return sendJson(response, 200, {
          ok: true,
          service: "virus-runtime",
          version: "0.1.0",
        });
      }

      if (request.method === "GET" && request.url === "/strains") {
        return sendJson(response, 200, {
          strains: marketplace.list(),
        });
      }

      if (request.method === "POST" && request.url === "/strains") {
        const body = await readJson(request);
        const strain = marketplace.publish(body);
        return sendJson(response, 201, {
          strain,
        });
      }

      if (request.method === "POST" && request.url === "/run") {
        const body = await readJson(request);
        const network = createTaskNetwork(body);
        return sendJson(response, 200, network);
      }

      if (request.method === "GET" && request.url === "/") {
        return sendJson(response, 200, {
          name: "VIRUS Runtime MVP",
          endpoints: ["GET /health", "GET /strains", "POST /strains", "POST /run"],
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

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  createVirusServer().listen(port, () => {
    console.log(`VIRUS Runtime listening on http://localhost:${port}`);
  });
}
