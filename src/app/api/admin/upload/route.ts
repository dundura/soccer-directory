import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { auth } from "@/lib/auth";
import { getUserByEmail } from "@/lib/db";

const MAX_SIZE_MB = 50;

const s3 = new S3Client({
  region: process.env.AWS_S3_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.email) return null;
  const user = await getUserByEmail(session.user.email);
  if (!user || user.role !== "admin") return null;
  return user;
}

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { filename, contentType, folder } = await req.json();

    if (!filename || !contentType) {
      return NextResponse.json({ error: "Missing filename or contentType" }, { status: 400 });
    }

    const ext = filename.split(".").pop()?.toLowerCase() || "bin";
    const prefix = folder ? `${folder.replace(/^\/|\/$/g, "")}/` : "soccer-directory/uploads/";
    const key = `${prefix}${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET || "anytime-soccer-media",
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 600 });
    const cdnUrl = `${(process.env.CLOUDFRONT_URL || "https://d2vm0l3c6tu9qp.cloudfront.net").replace(/\/$/, "")}/${key}`;

    return NextResponse.json({ uploadUrl, cdnUrl, key });
  } catch (err) {
    console.error("Admin upload presign error:", err);
    return NextResponse.json({ error: "Failed to generate upload URL" }, { status: 500 });
  }
}
