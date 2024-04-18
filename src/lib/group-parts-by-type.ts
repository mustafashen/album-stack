export function groupPartsByType(
  parts: {
    name: string;
    fileName: string;
    contentType: string;
    body: Buffer;
  }[]
) {

  const files = []
  const options = []
  parts.forEach((part) => {
    part.fileName ? files.push(part) : options.push(part)
  })

  return {
    files,
    options,
  }
}
