import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT || 4001,
  google_client_id: process.env.GOOGLE_CLIENT_ID || "",
  google_client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
  jwt_secret: process.env.JWT_SECRET || "",
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET || "",
  redis_url: process.env.UPSTASH_REDIS_REST_URL!,
  redis_token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  aws_access_key: process.env.AWS_SES_ACCESS_KEY!,
  aws_secret_access_key: process.env.AWS_SES_ACCESS_SECRET_KEY!,
  aws_region: process.env.AWS_RELIGEN!,
  aws_s3_bucket_name: process.env.S3_BUCKET_NAME!,
  sorce_email: process.env.SORCE_EMAIL!,
};
