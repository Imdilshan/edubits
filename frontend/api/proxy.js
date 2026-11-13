/* global process */
import https from "node:https";
import http from "node:http";
import { randomUUID } from "node:crypto";

export const config = {
  api: { bodyParser: false },
};

export default function apiProxy(req, res) {
  const requestId = randomUUID();
  res.setHeader("X-Request-ID", requestId);

  const sendError = (statusCode) => {
    res.statusCode = statusCode;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ error: "Request failed", requestId }));
  };

  const backendUrl = process.env.BACKEND_URL;
  if (!backendUrl) {
    console.error(`[${requestId}] BACKEND_URL is required for the production API proxy`);
    sendError(500);
    return;
  }

  let backendOrigin;
  let proxyRequest;
  try {
    backendOrigin = new URL(backendUrl);
    proxyRequest = new URL(req.url, "http://vercel-proxy.local");
  } catch {
    console.error(`[${requestId}] BACKEND_URL is invalid`);
    sendError(500);
    return;
  }

  const apiPath = proxyRequest.searchParams.get("proxyPath");
  const productionRequiresHttps = process.env.NODE_ENV === "production";
  if (
    !/^https?:$/.test(backendOrigin.protocol) ||
    (productionRequiresHttps && backendOrigin.protocol !== "https:") ||
    !apiPath || apiPath.startsWith("/") || apiPath.includes("..")
  ) {
    console.error(`[${requestId}] API proxy configuration or request path is invalid`);
    sendError(400);
    return;
  }

  proxyRequest.searchParams.delete("proxyPath");
  const target = new URL(`/api/${apiPath}`, backendOrigin);
  target.search = proxyRequest.searchParams.toString();

  const headers = { ...req.headers };
  delete headers.host;
  delete headers.connection;
  delete headers["if-none-match"];
  delete headers["if-modified-since"];
  headers["x-request-id"] = requestId;

  const transport = target.protocol === "https:" ? https : http;
  const upstream = transport.request(
    target,
    { method: req.method, headers },
    (upstreamResponse) => {
      if ((upstreamResponse.statusCode || 500) >= 400) {
        upstreamResponse.resume();
        sendError(upstreamResponse.statusCode || 502);
        return;
      }
      const responseHeaders = { ...upstreamResponse.headers, "cache-control": "no-store" };
      res.writeHead(upstreamResponse.statusCode || 502, responseHeaders);
      upstreamResponse.pipe(res);
    }
  );

  upstream.on("error", () => {
    if (res.headersSent) return res.end();
    sendError(502);
  });

  req.pipe(upstream);
}
