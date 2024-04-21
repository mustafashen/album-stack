import { IncomingMessage } from "node:http";
import url from "node:url"
export function parseUrl(req: IncomingMessage) {
  return {
    ...url.parse(req.url, true)
  } 
}