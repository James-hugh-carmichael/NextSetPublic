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
  Age: string | null;
  onboarding_complete: boolean | null;
};

export type ProfileVideo = {
  url: string;
  thumbnailUrl: string | null;
};

export type MusicianProfileInput = {
  name: string;
  bio: string;
  genres: string[];
  roles: string[];
  experienceLevel: string;
  commitmentLevel: string;
  videos: ProfileVideo[];
  avatarUrl: string | null;
  birthDate: string;
};

export function getAgeFromBirthDate(birthDate: string | null | undefined) {
  if (!birthDate || !/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
    return null;
  }

  const date = new Date(`${birthDate}T00:00:00`);
  const [year, month, day] = birthDate.split("-").map(Number);
  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() + 1 !== month ||
    date.getDate() !== day
  ) {
    return null;
  }

  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const birthdayHasPassed =
    today.getMonth() > date.getMonth() ||
    (today.getMonth() === date.getMonth() && today.getDate() >= date.getDate());

  if (!birthdayHasPassed) {
    age -= 1;
  }

  return age >= 0 && age <= 120 ? age : null;
}

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

export function parseStoredVideos(value: string | null): ProfileVideo[] {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.flatMap((item) => {
        if (typeof item === "string") {
          return [{ url: item, thumbnailUrl: null }];
        }

        if (
          item &&
          typeof item === "object" &&
          typeof item.url === "string" &&
          (typeof item.thumbnailUrl === "string" || item.thumbnailUrl === null)
        ) {
          return [item as ProfileVideo];
        }

        return [];
      });
    }
  } catch {
    // Older rows may use comma-separated text.
  }

  return parseStoredList(value).map((url) => ({ url, thumbnailUrl: null }));
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
        "id, name, bio, genres, roles, experience_level, commitment_level, videos, avatar_url, Age, onboarding_complete"
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
        Age: profile.birthDate,
        onboarding_complete: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    )
    .select(
      "id, name, bio, genres, roles, experience_level, commitment_level, videos, avatar_url, Age, onboarding_complete"
    )
    .single();

  if (error) {
    throw error;
  }

  return data as Musician;
}
