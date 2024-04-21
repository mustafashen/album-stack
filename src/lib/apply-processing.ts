import os from "node:os";
import {Worker} from "node:worker_threads";
import {join} from "node:path";
import AdmZip from "adm-zip";

function createChunks(files: Buffer[]) {
  const numberOfCores = os.cpus().length;
  const chunkSize = Math.ceil(files.length / numberOfCores);

  const chunks = [];
  for (let i = 0; i < files.length; i += chunkSize) {
    chunks.push(files.slice(i, i + chunkSize));
  }

  return chunks;
}

function newProcessingWork(
  chunk: Buffer[],
  options: { [key: string]: string }
) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(
      join(process.cwd(), "dist", "lib", "apply-processing-methods.js")
    );
    worker.postMessage({ chunk, options });
    worker.on("message", (result) => {
      resolve(result);
    });
    worker.on("error", (error) => {
      reject(error);
    });
  });
}

function zipFiles(files: Buffer[]) {
  const zip = new AdmZip();

  files.forEach((file: Buffer, index: number) => {
    zip.addFile(`${index}.jpeg`, file )
  })

  return zip.toBuffer()
}

export async function applyProcessing(
  files: Buffer[],
  options: { [key: string]: string }
) {
  const chunks = createChunks(files);

  console.log('started processing')

  const processedChunks = await Promise.all(
    chunks.map(async (chunk) => {
      try {
        return await newProcessingWork(chunk, options);
      } catch (error: unknown) {
        console.log(error);
        return [];
      }
    })
  );

  console.log('completed processing')
  
  return zipFiles(processedChunks.flat() as Buffer[])
}
