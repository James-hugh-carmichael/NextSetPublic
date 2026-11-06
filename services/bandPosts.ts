import { supabase } from "../lib/supabase";

export type Band = {
  id: string;
  name: string | null;
  genre: string | null;
  location: string | null;
  description: string | null;
  image_url: string | null;
  videos: string | null;
  latitude: number | null;
  longitude: number | null;
};

export type BandPost = {
  id: string;
  band_id: string;
  title: string | null;
  description: string | null;
  roles_needed: string | null;
  is_open: boolean | null;
  min_age: number | null;
  max_age: number | null;
  commitment_level: string | null;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string | null;
  band: Band | null;
};

const postFields =
  "id, band_id, title, description, roles_needed, is_open, min_age, max_age, commitment_level, location, latitude, longitude, created_at, Bands(id, name, genre, location, description, image_url, videos, latitude, longitude)";

type PostQueryResult = Omit<BandPost, "band"> & {
  Bands: Band[] | Band | null;
};

function normalizePost(post: PostQueryResult): BandPost {
  return {
    id: post.id,
    band_id: post.band_id,
    title: post.title,
    description: post.description,
    roles_needed: post.roles_needed,
    is_open: post.is_open,
    min_age: post.min_age,
    max_age: post.max_age,
    commitment_level: post.commitment_level,
    location: post.location,
    latitude: post.latitude,
    longitude: post.longitude,
    created_at: post.created_at,
    band: Array.isArray(post.Bands) ? post.Bands[0] ?? null : post.Bands,
  };
}

export function parseRoles(value: string | null) {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed) && parsed.every((item) => typeof item === "string")) {
      return parsed;
    }
  } catch {
    // Existing values may be comma-separated text.
  }

  return value
    .split(",")
    .map((role) => role.trim())
    .filter(Boolean);
}

export async function getOpenBandPosts() {
  const { data, error } = await supabase
    .from("bandPosts")
    .select(postFields)
    .eq("is_open", true)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return ((data ?? []) as unknown as PostQueryResult[]).map(normalizePost);
}

export async function getBandPostsForBand(bandId: string) {
  const { data, error } = await supabase
    .from("bandPosts")
    .select(postFields)
    .eq("band_id", bandId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return ((data ?? []) as unknown as PostQueryResult[]).map(normalizePost);
}

export async function getBandPost(postId: string) {
  const { data, error } = await supabase
    .from("bandPosts")
    .select(postFields)
    .eq("id", postId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? normalizePost(data as unknown as PostQueryResult) : null;
}

export async function requestToJoin(postId: string, musicianId: string) {
  const { data: existingRequest, error: existingRequestError } = await supabase
    .from("requests")
    .select("id, status")
    .eq("post_id", postId)
    .eq("musician_id", musicianId)
    .maybeSingle();

  if (existingRequestError) {
    throw existingRequestError;
  }

  if (existingRequest) {
    return existingRequest;
  }

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("requests")
    .insert({
      post_id: postId,
      musician_id: musicianId,
      status: "pending",
      created_at: now,
      updated_at: now,
    })
    .select("id, status")
    .single();

  if (error) {
    throw error;
  }

  return data;
}
