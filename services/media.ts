import { File } from "expo-file-system";
import type { ImagePickerAsset } from "expo-image-picker";

import { supabase } from "../lib/supabase";

type MediaKind = "avatar" | "video";

function getExtension(asset: ImagePickerAsset, kind: MediaKind) {
  const fileExtension = asset.fileName?.split(".").pop()?.toLowerCase();
  if (fileExtension && /^[a-z0-9]+$/.test(fileExtension)) {
    return fileExtension;
  }

  return kind === "avatar" ? "jpg" : "mp4";
}

export async function uploadProfileMedia(
  userId: string,
  asset: ImagePickerAsset,
  kind: MediaKind
) {
  const bucket = kind === "avatar" ? "avatars" : "videos";
  const extension = getExtension(asset, kind);
  const objectPath = `${userId}/${kind}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}.${extension}`;
  const file = new File(asset.uri);
  const fileData = await file.arrayBuffer();
  const { error } = await supabase.storage.from(bucket).upload(objectPath, fileData, {
    contentType: asset.mimeType ?? (kind === "avatar" ? "image/jpeg" : "video/mp4"),
    upsert: false,
  });

  if (error) {
    throw error;
  }

  return supabase.storage.from(bucket).getPublicUrl(objectPath).data.publicUrl;
}
