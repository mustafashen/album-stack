import { access, readFile, writeFile } from "fs/promises";
import { IncomingMessage, ServerResponse } from "http";
import { join } from "path";
import { parseFormBuffer } from "./lib/parse-multipart-form.js";
import { groupPartsByType } from "./lib/group-parts-by-type.js";
import { validateContent } from "./lib/validate-content-type.js";
import { applyProcessing } from "./lib/apply-processing.js";
import { Url } from "url";
import { ParsedUrlQuery } from "querystring";
import { createReadStream } from "fs";

export const routes = {
  "/": {
    GET: async (
      req: IncomingMessage,
      res: ServerResponse<IncomingMessage>,
      parsedUrl?: Url
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
        try {
          const contentTypeHeader = req.headers["content-type"];
          const partBoundaryString = `--${
            contentTypeHeader.split("boundary=")[1]
          }`;

          const body = Buffer.concat(chunks);

          const formParts = parseFormBuffer(body, partBoundaryString);
          const { files, options } = groupPartsByType(formParts);

          const validFiles = validateContent(files);
          const filesArr = validFiles.map((fileObj) => fileObj.body);

          const optionsObj = {};
          options.forEach((option) => {
            optionsObj[option.name] = Buffer.from(option.body, "hex")
              .toString()
              .replace("\r\n", "");
          });

          const processedFiles = await applyProcessing(filesArr, optionsObj);
          const fileName = `${Date.now()}.zip`;
          await writeFile(join("/tmp", fileName), processedFiles);

          res.setHeader(
            "Content-Disposition",
            "attachment; filename=bundled_files.zip"
          );
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ fileName }));
        } catch (error: unknown) {
          console.log(error)
          res.writeHead(500, { "Content-Type": "application/json" });
          if (error instanceof Error)
            res.end(JSON.stringify({ message: error.message }));
          else res.end(JSON.stringify({ message: "Internal Server Error" }));
        }
      });
    },
  },
  "/download": {
    GET: async (
      req: IncomingMessage,
      res: ServerResponse<IncomingMessage>,
      parsedUrl: Url
    ) => {
      try {
        const query = parsedUrl.query as ParsedUrlQuery;
        if (query && "fileName" in query) {
          const filePath = join("/tmp", query.fileName as string);
          await access(filePath);
          res.writeHead(200, {
            "Content-Type": "application/octet-stream",
            "Content-Disposition": `attachment; filename="${query.fileName}"`,
            "Transfer-Encoding": "chunked",
          });
          const readStream = createReadStream(filePath);
          readStream.pipe(res);
        } else {
          throw new Error("Error during file download");
        }
      } catch (error: unknown) {
        res.writeHead(500, { "Content-Type": "application/json" });
        if (error instanceof Error)
          res.end(JSON.stringify({ message: error.message }));
        else res.end(JSON.stringify({ message: "Internal Server Error" }));
      }
    },
  },
};
