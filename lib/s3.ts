import { S3Client } from '@aws-sdk/client-s3';

// STORAGE_ENDPOINT should be the Supabase S3 endpoint:
// https://<project-ref>.supabase.co/storage/v1/s3
export const s3Client = new S3Client({
  forcePathStyle: true,
  region: process.env.STORAGE_REGION || 'eu-central-1',
  endpoint: process.env.STORAGE_ENDPOINT,
  credentials: {
    accessKeyId: process.env.STORAGE_ACCESS_KEY!,
    secretAccessKey: process.env.STORAGE_SECRET_KEY!,
  },
});

export const bucketName = process.env.STORAGE_BUCKET_NAME || 'uploads';

// Public URL prefix for constructing file URLs after upload
// Format: https://<project-ref>.supabase.co/storage/v1/object/public/<bucket>
export const publicUrlPrefix = process.env.STORAGE_PUBLIC_URL;
