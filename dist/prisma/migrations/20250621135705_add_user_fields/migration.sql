-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN', 'AGENT');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isPaid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isValidUser" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "otp" TEXT,
ADD COLUMN     "profilePic" TEXT DEFAULT 'https://your-default-image-url.com/default.png',
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER';
