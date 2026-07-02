import { supabase } from "../lib/supabase";

const PAGE_SIZE = 20;

export async function fetchBandPosts(filters = {}, page = 0) {
  let query = supabase
    .from("bandPosts")
    .select(`
      *,
      Bands (
        name,
        genre,
        location,
        image_url
      )
    `)
    .eq("is_open", true)
    .order("created_at", { ascending: false })
    .range(
      page * PAGE_SIZE,
      page * PAGE_SIZE + PAGE_SIZE - 1
    );

  if (filters.genre) {
    query = query.eq("Bands.genre", filters.genre);
  }

  if (filters.location) {
    query = query.eq("Bands.location", filters.location);
  }

  if (filters.commitmentLevel) {
    query = query.eq("commitment_level", filters.commitmentLevel);
  }

  if (filters.minAge) {
    query = query.gte("min_age", filters.minAge);
  }

  if (filters.maxAge) {
    query = query.lte("max_age", filters.maxAge);
  }

  if (filters.search) {
    query = query.or(
      `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
    );
  }

  const { data, error } = await query;

  if (error) throw error;

  return data;
}