import AsyncStorage from "@react-native-async-storage/async-storage";

import { genresMatch } from "../lib/music";
import { BandPost, parseRoles } from "./bandPosts";
import { distanceInKilometers } from "./location";

export type OpportunityFilters = {
  genres: string[];
  commitment: string;
  locationQuery: string;
  role: string;
  latitude: number | null;
  longitude: number | null;
  locationArea: string;
  radiusKm: number;
};

export const EMPTY_OPPORTUNITY_FILTERS: OpportunityFilters = {
  genres: [],
  commitment: "",
  locationQuery: "",
  role: "",
  latitude: null,
  longitude: null,
  locationArea: "",
  radiusKm: 50,
};

function getStorageKey(userId: string) {
  return `nextset-opportunity-filters:${userId}`;
}

export async function getOpportunityFilters(userId?: string) {
  if (!userId) {
    return EMPTY_OPPORTUNITY_FILTERS;
  }

  const stored = await AsyncStorage.getItem(getStorageKey(userId));
  if (!stored) {
    return EMPTY_OPPORTUNITY_FILTERS;
  }

  try {
    return {
      ...EMPTY_OPPORTUNITY_FILTERS,
      ...JSON.parse(stored),
    } as OpportunityFilters;
  } catch {
    return EMPTY_OPPORTUNITY_FILTERS;
  }
}

export async function saveOpportunityFilters(
  userId: string,
  filters: OpportunityFilters
) {
  await AsyncStorage.setItem(getStorageKey(userId), JSON.stringify(filters));
}

export function matchesOpportunityFilters(
  post: BandPost,
  filters: OpportunityFilters
) {
  const band = post.band;
  const locationQuery = filters.locationQuery.trim().toLowerCase();
  const roleQuery = filters.role.trim().toLowerCase();
  const genreMatches =
    filters.genres.length === 0 ||
    (band?.genre
      ? filters.genres.some((genre) => genresMatch(genre, band.genre ?? ""))
      : false);
  const commitmentMatches =
    !filters.commitment || post.commitment_level === filters.commitment;
  const roleMatches =
    !roleQuery ||
    parseRoles(post.roles_needed).some((item) => item.toLowerCase().includes(roleQuery));
  const opportunityLocation = post.location ?? band?.location;
  const opportunityLatitude = post.latitude ?? band?.latitude;
  const opportunityLongitude = post.longitude ?? band?.longitude;
  const textLocationMatches =
    filters.latitude !== null && filters.longitude !== null
      ? true
      : !locationQuery || opportunityLocation?.toLowerCase().includes(locationQuery);
  const distanceMatches =
    filters.latitude === null ||
    filters.longitude === null ||
    (    opportunityLatitude !== null &&
      opportunityLatitude !== undefined &&
      opportunityLongitude !== null &&
      opportunityLongitude !== undefined &&
      (filters.radiusKm > 100 ||
        distanceInKilometers(
          filters.latitude,
          filters.longitude,
          opportunityLatitude,
          opportunityLongitude
        ) <= filters.radiusKm));

  return genreMatches && commitmentMatches && roleMatches && textLocationMatches && distanceMatches;
}
