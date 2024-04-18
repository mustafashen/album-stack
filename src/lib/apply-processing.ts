import sharp, { Sharp } from "sharp";

export async function applyProcessing(
  files: Buffer[],
  options: { [key: string]: string }
) {
  const processedFiles: Buffer[] = await Promise.all(
    files.map((file) => {
      return applyMethods(sharp(file), options).toFormat("jpeg").toBuffer();
    })
  );
}

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
  transformer = options.flip === 'true' ? transformer.flip() : transformer;
  transformer = options.flop === 'true' ? transformer.flop() : transformer;
  transformer = options.blur
    ? transformer.blur(Number(options.blur))
    : transformer;

  return transformer;
}
