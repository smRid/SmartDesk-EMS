import { v2 as cloudinary } from "cloudinary";
import { env } from "@/lib/env";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function uploadImage(
  file: File,
  folder = "smartdesk-ems/employees",
) {
  if (!file || file.size === 0) {
    return null;
  }
  const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
  if (!allowedTypes.has(file.type)) throw new Error("Only JPEG, PNG, and WebP images are supported.");
  if (file.size > 5 * 1024 * 1024) throw new Error("Images must be 5 MB or smaller.");

  const buffer = Buffer.from(await file.arrayBuffer());
  const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  const isPng = buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  const isWebp = buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP";
  if (!isJpeg && !isPng && !isWebp) throw new Error("The uploaded file content is not a supported image.");

  return new Promise<{ publicId: string; url: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
        overwrite: false,
        resource_type: "image",
        transformation: [{ crop: "limit", height: 1600, width: 1600 }],
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Image upload failed."));
          return;
        }

        resolve({
          publicId: result.public_id,
          url: result.secure_url,
        });
      },
    );

    stream.end(buffer);
  });
}

export async function deleteImage(publicId?: string | null) {
  if (!publicId) {
    return;
  }

  await cloudinary.uploader.destroy(publicId, {
    resource_type: "image",
  });
}
