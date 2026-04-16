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
  folder = "arenadesk-ems/employees",
) {
  if (!file || file.size === 0) {
    return null;
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("Only image uploads are supported.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  return new Promise<{ publicId: string; url: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
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
