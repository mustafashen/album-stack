import { readFile } from "fs/promises";
import { IncomingMessage, ServerResponse } from "http";
import { join } from "path";

export const routes = {
  "/": {
    GET: async (
      req: IncomingMessage,
      res: ServerResponse<IncomingMessage>
    ) => {
      const indexHtml = await readFile(
        join(process.cwd(), "public", "index.html")
      );
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(indexHtml);
    },
  },
  "/upload": {
    POST: async (
      req: IncomingMessage,
      res: ServerResponse<IncomingMessage>
    ) => {
      const chunks = [];
      req.on("data", (chunk) => {
        chunks.push(chunk);
      });
      req.on("end", async () => {
        const file = Buffer.concat(chunks);
      });
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "File uploaded successfully" }));
    },
  },
};
