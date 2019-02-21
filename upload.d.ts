export type Upload = Promise<{
    filePath: string;
    mimeType: string;
    createReadStream(): NodeJS.ReadableStream;
    stream: NodeJS.ReadableStream;
}>;
