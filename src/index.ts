import http from "node:http";
import { handleRequest } from "./request-handler.js";

const server = http.createServer();

server.on("request", (req, res) => {
  handleRequest(req, res);
});

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});
