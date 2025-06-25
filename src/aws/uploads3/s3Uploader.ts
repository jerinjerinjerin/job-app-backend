import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

import { config } from "../../lib/config";

const s3Client = new S3Client({
  region: config.aws_region!,
  credentials: {
    accessKeyId: config.aws_ses_access_key,
    secretAccessKey: config.aws_ses_secret_access_key,
  },
});

export const uploadToS3 = async (file: {
  createReadStream: () => NodeJS.ReadableStream;
  filename: string;
  mimetype: string;
}): Promise<string> => {
  const { createReadStream, filename, mimetype } = file;

  const stream = createReadStream();
  const chunks: Buffer[] = [];

  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const fileBuffer = Buffer.concat(chunks);

  const uploadParams = {
    Bucket: config.aws_s3_bucket_name,
    Key: `uploads/${Date.now()}-${filename}`,
    Body: fileBuffer,
    ContentType: mimetype,
    ContentLength: fileBuffer.length,
    ACL: "public-read" as const,
  };

  try {
    await s3Client.send(new PutObjectCommand(uploadParams));

    return `https://${uploadParams.Bucket}.s3.amazonaws.com/${uploadParams.Key}`;
  } catch (error) {
    throw new Error(`Failed to upload to S3: ${(error as Error).message}`);
  }
};
