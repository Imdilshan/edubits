import https from "node:https";
import http from "node:http";

export const config = {
  api: { bodyParser: false },
};

export default function apiProxy(req, res) {
  const backendUrl = process.env.BACKEND_URL;
  if (!backendUrl) {
    res.statusCode = 500;
    res.end("API proxy is missing BACKEND_URL");
    return;
  }

  let backendOrigin;
  let proxyRequest;
  try {
    backendOrigin = new URL(backendUrl);
    proxyRequest = new URL(req.url, "http://vercel-proxy.local");
  } catch {
    res.statusCode = 500;
    res.end("Invalid API proxy configuration");
    return;
  }

  const apiPath = proxyRequest.searchParams.get("proxyPath");
  if (!/^https?:$/.test(backendOrigin.protocol) || !apiPath || apiPath.startsWith("/") || apiPath.includes("..")) {
    res.statusCode = 400;
    res.end("Invalid API proxy request");
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

  const transport = target.protocol === "https:" ? https : http;
  const upstream = transport.request(
    target,
    { method: req.method, headers },
    (upstreamResponse) => {
      const responseHeaders = { ...upstreamResponse.headers, "cache-control": "no-store" };
      res.writeHead(upstreamResponse.statusCode || 502, responseHeaders);
      upstreamResponse.pipe(res);
    }
  );

  upstream.on("error", () => {
    if (!res.headersSent) res.statusCode = 502;
    res.end("Could not reach the API server");
  });

  req.pipe(upstream);
}
