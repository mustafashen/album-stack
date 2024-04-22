function parsePartHead(partHead: string) {
  const nameMatch = partHead.match(/name="(.*?)"/)
  const contentTypeMatch = partHead.match(/Content-Type: (.*)/)
  const fileNameMatch = partHead.match(/filename="(.*?)"/)


  const name = nameMatch ? nameMatch[1] : null;
  const contentType = contentTypeMatch ? contentTypeMatch[1] : null;
  const fileName = fileNameMatch ? fileNameMatch[1] : null;

  return {
    name,
    contentType,
    fileName,
  };
}

export function parseFormBuffer(body: Buffer, boundary: string) {
  const formPartsBuffer = body
    .toString("hex")
    .split(Buffer.from(boundary).toString("hex"))
    .filter((x) => x !== "" && x !== "2d2d0d0a");

  const formPartsArr = formPartsBuffer.map((part) => {
    const formPart = part.split("0d0a0d0a");
    const partHead = formPart[0];
    const partBody = formPart[1];

    const headObj = parsePartHead(
      Buffer.from(partHead, "hex").toString("utf-8")
    );

    return {
      ...headObj,
      body: Buffer.from(partBody, "hex"),
    };
  });

  return formPartsArr;
}
