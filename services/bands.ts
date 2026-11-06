import { useCallback, useEffect, useState } from "react";

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

export type BandMembership = {
  bandId: string;
  role: string | null;
  isLeader: boolean | null;
  band: Band | null;
};

export type BandJoinRequest = {
  id: string;
  requestedRole: string | null;
  musicianName: string | null;
};

export type BandMember = {
  userId: string;
  name: string | null;
  avatarUrl: string | null;
  role: string | null;
  isLeader: boolean;
  joinedAt: string | null;
};

export type BandRosterMember = {
  id: string;
  name: string;
  role: string | null;
  imageUrl: string | null;
  age: number | null;
};

type MembershipQueryResult = {
  band_id: string;
  role: string | null;
  is_leader: boolean | null;
  Bands: Band[] | Band | null;
};

function normalizeMembership(membership: MembershipQueryResult): BandMembership {
  return {
    bandId: membership.band_id,
    role: membership.role,
    isLeader: membership.is_leader,
    band: Array.isArray(membership.Bands)
      ? membership.Bands[0] ?? null
      : membership.Bands,
  };
}

export async function getMyBandMemberships(userId: string) {
  const { data, error } = await supabase
    .from("band_members")
    .select("band_id, role, is_leader, Bands(id, name, genre, location, description, image_url, videos, latitude, longitude)")
    .eq("user_id", userId)
    .order("joined_at", { ascending: true });

  if (error) {
    throw error;
  }

  return ((data ?? []) as unknown as MembershipQueryResult[]).map(normalizeMembership);
}

export function useBandMemberships(userId?: string) {
  const [memberships, setMemberships] = useState<BandMembership[]>([]);
  const [loading, setLoading] = useState(Boolean(userId));
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!userId) {
      setMemberships([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    try {
      setMemberships(await getMyBandMemberships(userId));
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load your bands.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { memberships, loading, error, refresh };
}

export function useBand(bandId?: string) {
  const [band, setBand] = useState<Band | null>(null);
  const [loading, setLoading] = useState(Boolean(bandId));
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!bandId) {
      setBand(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    const { data, error: queryError } = await supabase
      .from("Bands")
      .select("id, name, genre, location, description, image_url, videos, latitude, longitude")
      .eq("id", bandId)
      .maybeSingle();

    if (queryError) {
      setError(queryError.message);
      setBand(null);
    } else {
      setBand(data as Band | null);
      setError(null);
    }
    setLoading(false);
  }, [bandId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { band, loading, error, refresh };
}

export async function createBand(input: {
  name: string;
  genre: string;
  location: string;
  description: string;
}) {
  const { data, error } = await supabase.rpc("create_band", {
    band_name: input.name,
    band_genre: input.genre,
    band_location: input.location,
    band_description: input.description,
    band_image_url: null,
  });

  if (error) {
    throw error;
  }

  return data as string;
}

export async function updateBand(input: {
  bandId: string;
  name: string;
  genre: string;
  location: string;
  description: string;
  imageUrl: string | null;
  videos: { url: string; thumbnailUrl: string | null }[];
}) {
  const { error } = await supabase.rpc("update_band", {
    target_band_id: input.bandId,
    band_name: input.name,
    band_genre: input.genre,
    band_location: input.location,
    band_description: input.description,
    band_image_url: input.imageUrl,
    band_videos: JSON.stringify(input.videos),
  });

  if (error) {
    throw error;
  }
}

export async function deleteBand(bandId: string) {
  const { error } = await supabase.rpc("delete_band", {
    target_band_id: bandId,
  });

  if (error) {
    throw error;
  }
}

export async function updateBandLocation(
  bandId: string,
  location: { area: string; latitude: number; longitude: number }
) {
  const { error } = await supabase.rpc("update_band_location", {
    target_band_id: bandId,
    band_area: location.area,
    band_latitude: location.latitude,
    band_longitude: location.longitude,
  });

  if (error) {
    throw error;
  }
}

export async function getBandInviteCode(bandId: string) {
  const { data, error } = await supabase.rpc("get_band_invite_code", {
    target_band_id: bandId,
  });

  if (error) {
    throw error;
  }

  return data as string;
}

export async function rotateBandInviteCode(bandId: string) {
  const { data, error } = await supabase.rpc("rotate_band_invite_code", {
    target_band_id: bandId,
  });

  if (error) {
    throw error;
  }

  return data as string;
}

export async function joinBandWithInvite(inviteCode: string, memberRole?: string) {
  const { data, error } = await supabase.rpc("join_band_with_invite", {
    invite_code: inviteCode,
    member_role: memberRole?.trim() || null,
  });

  if (error) {
    throw error;
  }

  return data as string;
}

export async function getBandMembers(bandId: string) {
  const { data, error } = await supabase.rpc("get_band_members", {
    target_band_id: bandId,
  });

  if (error) {
    throw error;
  }

  return ((data ?? []) as Array<{
    user_id: string;
    name: string | null;
    avatar_url: string | null;
    role: string | null;
    is_leader: boolean;
    joined_at: string | null;
  }>).map((member) => ({
    userId: member.user_id,
    name: member.name,
    avatarUrl: member.avatar_url,
    role: member.role,
    isLeader: member.is_leader,
    joinedAt: member.joined_at,
  }));
}

export async function updateBandMember(
  bandId: string,
  userId: string,
  role: string
) {
  const { error } = await supabase.rpc("update_band_member", {
    target_band_id: bandId,
    target_user_id: userId,
    member_role: role.trim() || null,
  });

  if (error) {
    throw error;
  }
}

export async function removeBandMember(bandId: string, userId: string) {
  const { error } = await supabase.rpc("remove_band_member", {
    target_band_id: bandId,
    target_user_id: userId,
  });

  if (error) {
    throw error;
  }
}

export async function getBandRosterMembers(bandId: string) {
  const { data, error } = await supabase.rpc("get_band_roster_members", {
    target_band_id: bandId,
  });

  if (error) {
    throw error;
  }

  return ((data ?? []) as Array<{
    id: string;
    name: string;
    role: string | null;
    image_url: string | null;
    age: number | null;
  }>).map((member) => ({
    id: member.id,
    name: member.name,
    role: member.role,
    imageUrl: member.image_url,
    age: member.age,
  }));
}

export async function addBandRosterMember(input: {
  bandId: string;
  name: string;
  role: string;
  imageUrl: string | null;
  age: number | null;
}) {
  const { error } = await supabase.rpc("add_band_roster_member", {
    target_band_id: input.bandId,
    roster_name: input.name,
    roster_role: input.role.trim() || null,
    roster_image_url: input.imageUrl,
    roster_age: input.age,
  });

  if (error) {
    throw error;
  }
}

export async function updateBandRosterMember(input: {
  id: string;
  name: string;
  role: string;
  imageUrl: string | null;
  age: number | null;
}) {
  const { error } = await supabase.rpc("update_band_roster_member", {
    target_roster_member_id: input.id,
    roster_name: input.name,
    roster_role: input.role.trim() || null,
    roster_image_url: input.imageUrl,
    roster_age: input.age,
  });

  if (error) {
    throw error;
  }
}

export async function removeBandRosterMember(id: string) {
  const { error } = await supabase.rpc("remove_band_roster_member", {
    target_roster_member_id: id,
  });

  if (error) {
    throw error;
  }
}

export async function createBandPost(input: {
  bandId: string;
  title: string;
  description: string;
  rolesNeeded: string[];
  commitmentLevel: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
}) {
  const { data, error } = await supabase.rpc("create_band_post", {
    target_band_id: input.bandId,
    post_title: input.title,
    post_description: input.description,
    post_roles_needed: JSON.stringify(input.rolesNeeded),
    post_commitment_level: input.commitmentLevel || null,
    post_min_age: null,
    post_max_age: null,
    post_location: input.location || null,
    post_latitude: input.latitude,
    post_longitude: input.longitude,
  });

  if (error) {
    throw error;
  }

  return data as string;
}

export async function updateBandPost(input: {
  postId: string;
  title: string;
  description: string;
  rolesNeeded: string[];
  commitmentLevel: string;
  isOpen: boolean;
  location: string;
  latitude: number | null;
  longitude: number | null;
}) {
  const { error } = await supabase.rpc("update_band_post", {
    target_post_id: input.postId,
    post_title: input.title,
    post_description: input.description,
    post_roles_needed: JSON.stringify(input.rolesNeeded),
    post_commitment_level: input.commitmentLevel || null,
    post_is_open: input.isOpen,
    post_location: input.location || null,
    post_latitude: input.latitude,
    post_longitude: input.longitude,
  });

  if (error) {
    throw error;
  }
}

export async function deleteBandPost(postId: string) {
  const { error } = await supabase.rpc("delete_band_post", {
    target_post_id: postId,
  });

  if (error) {
    throw error;
  }
}

export async function getPendingBandJoinRequests(bandId: string) {
  const { data, error } = await supabase
    .from("band_join_requests")
    .select("id, requested_role, Musicians(name)")
    .eq("band_id", bandId)
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return ((data ?? []) as Array<{
    id: string;
    requested_role: string | null;
    Musicians: { name: string | null }[] | { name: string | null } | null;
  }>).map((request) => {
    const musician = Array.isArray(request.Musicians)
      ? request.Musicians[0] ?? null
      : request.Musicians;

    return {
      id: request.id,
      requestedRole: request.requested_role,
      musicianName: musician?.name ?? null,
    };
  });
}

export async function reviewBandJoinRequest(
  requestId: string,
  approve: boolean,
  memberRole?: string
) {
  const { error } = await supabase.rpc("review_band_join_request", {
    target_request_id: requestId,
    approve,
    member_role: memberRole?.trim() || null,
  });

  if (error) {
    throw error;
  }
}
