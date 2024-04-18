import { readFile } from "fs/promises";
import { IncomingMessage, ServerResponse } from "http";
import { join } from "path";
import { parseFormBuffer } from "./lib/parse-multipart-form.js";
import { write, writeFile } from "fs";
import { groupPartsByType } from "./lib/group-parts-by-type.js";
import { validateContent } from "./lib/validate-content-type.js";
import { applyProcessing } from "./lib/apply-processing.js";

export const routes = {
  "/": {
    GET: async (req: IncomingMessage, res: ServerResponse<IncomingMessage>) => {
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
        const contentTypeHeader = req.headers["content-type"];
        const partBoundaryString = `--${contentTypeHeader.split("boundary=")[1]}`;

        const body = Buffer.concat(chunks);

        const formParts = parseFormBuffer(body, partBoundaryString)
        const {files, options} = groupPartsByType(formParts)

        const validFiles = validateContent(files)

        applyProcessing(validFiles, options)

      });
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "File uploaded successfully" }));
    },
  },
};
