import { File } from "expo-file-system";
import type { ImagePickerAsset } from "expo-image-picker";

import { supabase } from "../lib/supabase";

type MediaKind = "avatar" | "video" | "video-thumbnail";
type UploadAsset = Pick<ImagePickerAsset, "uri" | "fileName" | "mimeType">;

function getExtension(asset: UploadAsset, kind: MediaKind) {
  const fileExtension = asset.fileName?.split(".").pop()?.toLowerCase();
  if (fileExtension && /^[a-z0-9]+$/.test(fileExtension)) {
    return fileExtension;
  }

  return kind === "video" ? "mp4" : "jpg";
}

export async function uploadProfileMedia(
  userId: string,
  asset: UploadAsset,
  kind: MediaKind
) {
  const bucket =
    kind === "avatar" ? "avatars" : kind === "video" ? "videos" : "gallery";
  const extension = getExtension(asset, kind);
  const objectPath = `${userId}/${kind}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}.${extension}`;
  const file = new File(asset.uri);
  const fileData = await file.arrayBuffer();
  const { error } = await supabase.storage.from(bucket).upload(objectPath, fileData, {
    contentType: asset.mimeType ?? (kind === "video" ? "video/mp4" : "image/jpeg"),
    upsert: false,
  });

  if (error) {
    throw error;
  }

  return supabase.storage.from(bucket).getPublicUrl(objectPath).data.publicUrl;
}
