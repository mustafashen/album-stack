import { IncomingMessage, ServerResponse } from "http";
import { routes } from "./routes.js";

async function handleRoute(
  req: IncomingMessage,
  res: ServerResponse<IncomingMessage>
) {
  
  try {
    const route = routes[req.url];
    if (route) {
      const method = req.method.toUpperCase();
      const handler = route[method];
      if (handler) {
        await handler(req, res);
      } else throw new Error("Method not allowed");
    } else throw new Error("Route not found");
  } catch (error) {
    console.log(error);
    res.writeHead(404, { "Content-Type": "text/html" });
    res.end(error.message);
  }
}

export async function handleRequest(
  req: IncomingMessage,
  res: ServerResponse<IncomingMessage>
) {
  handleRoute(req, res);
}