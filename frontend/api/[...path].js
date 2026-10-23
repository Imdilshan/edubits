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

  let target;
  let backendOrigin;
  try {
    backendOrigin = new URL(backendUrl);
    target = new URL(req.url, backendOrigin);
  } catch {
    res.statusCode = 500;
    res.end("Invalid API proxy configuration");
    return;
  }

  if (!/^https?:$/.test(target.protocol) || target.origin !== backendOrigin.origin || !target.pathname.startsWith("/api/")) {
    res.statusCode = 500;
    res.end("BACKEND_URL must use HTTP or HTTPS");
    return;
  }

  const headers = { ...req.headers };
  delete headers.host;
  delete headers.connection;

  const transport = target.protocol === "https:" ? https : http;
  const upstream = transport.request(
    target,
    { method: req.method, headers },
    (upstreamResponse) => {
      res.writeHead(upstreamResponse.statusCode || 502, upstreamResponse.headers);
      upstreamResponse.pipe(res);
    }
  );

  upstream.on("error", () => {
    if (!res.headersSent) res.statusCode = 502;
    res.end("Could not reach the API server");
  });

  req.pipe(upstream);
}
