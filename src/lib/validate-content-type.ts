export function validateContent(
  files: {
    name: string;
    fileName: string;
    contentType: string;
    body: Buffer;
  }[]
) {
  return files.filter((file) => {
    if (file.contentType.startsWith("image/")) {
      return true;
    } else return false;
  });
}
