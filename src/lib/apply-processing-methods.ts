import sharp, { Sharp } from "sharp";
import { parentPort } from "node:worker_threads";

function applyMethods(transformer: Sharp, options: { [key: string]: string }) {
  transformer =
    options.width && options.height
      ? transformer.resize(Number(options.width), Number(options.height), {
          fit: "fill",
        })
      : transformer;
  transformer = options.rotate
    ? transformer.rotate(Number(options.rotate))
    : transformer;
  transformer = options.flip === "true" ? transformer.flip() : transformer;
  transformer = options.flop === "true" ? transformer.flop() : transformer;
  transformer = options.blur
    ? transformer.blur(Number(options.blur))
    : transformer;

  return transformer;
}

parentPort.on(
  "message",
  async (message: { chunk: Buffer[]; options: { [key: string]: string } }) => {
    const { chunk, options } = message;
    const processedFiles: Buffer[] = await Promise.all(
      chunk.map((file) => {
        return applyMethods(sharp(file), options).toFormat("jpeg").toBuffer();
      })
    );

    parentPort.postMessage(processedFiles);
  }
);
