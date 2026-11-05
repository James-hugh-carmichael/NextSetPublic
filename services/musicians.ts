import { useEffect, useState } from "react";

import { supabase } from "../lib/supabase";

export type Musician = {
  id: string;
  name: string | null;
  bio: string | null;
  genres: string | null;
  roles: string | null;
  experience_level: string | null;
  commitment_level: string | null;
  videos: string | null;
  avatar_url: string | null;
  onboarding_complete: boolean | null;
};

export type MusicianProfileInput = {
  name: string;
  bio: string;
  genres: string[];
  roles: string[];
  experienceLevel: string;
  commitmentLevel: string;
  videos: string[];
  avatarUrl: string | null;
};

export function parseStoredList(value: string | null) {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed) && parsed.every((item) => typeof item === "string")) {
      return parsed;
    }
  } catch {
    // Older rows may use comma-separated text.
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function useMusician(userId?: string) {
  const [musician, setMusician] = useState<Musician | null>(null);
  const [loading, setLoading] = useState(Boolean(userId));
  const [error, setError] = useState<string | null>(null);
  const [loadedUserId, setLoadedUserId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    if (!userId) {
      setMusician(null);
      setLoading(false);
      setError(null);
      setLoadedUserId(null);
      return () => {
        active = false;
      };
    }

    setLoading(true);
    setError(null);

    supabase
      .from("Musicians")
      .select(
        "id, name, bio, genres, roles, experience_level, commitment_level, videos, avatar_url, onboarding_complete"
      )
      .eq("id", userId)
      .maybeSingle()
      .then(({ data, error: queryError }) => {
        if (!active) {
          return;
        }

        if (queryError) {
          setError(queryError.message);
          setMusician(null);
        } else {
          setMusician(data as Musician | null);
        }
        setLoading(false);
        setLoadedUserId(userId);
      });

    return () => {
      active = false;
    };
  }, [userId]);

  return { musician, loading, error, loadedUserId };
}

export async function saveMusicianProfile(
  userId: string,
  profile: MusicianProfileInput
) {
  const { data, error } = await supabase
    .from("Musicians")
    .upsert(
      {
        id: userId,
        name: profile.name.trim(),
        bio: profile.bio.trim(),
        genres: JSON.stringify(profile.genres),
        roles: JSON.stringify(profile.roles),
        experience_level: profile.experienceLevel,
        commitment_level: profile.commitmentLevel,
        videos: JSON.stringify(profile.videos),
        avatar_url: profile.avatarUrl,
        onboarding_complete: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    )
    .select(
      "id, name, bio, genres, roles, experience_level, commitment_level, videos, avatar_url, onboarding_complete"
    )
    .single();

  if (error) {
    throw error;
  }

  return data as Musician;
}
