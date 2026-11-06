import * as Location from "expo-location";

import { supabase } from "../lib/supabase";

export type ApproximateLocation = {
  area: string;
  latitude: number;
  longitude: number;
};

function roundCoordinate(value: number) {
  return Math.round(value * 100) / 100;
}

async function getApproximateLocation(
  rawLatitude: number,
  rawLongitude: number
): Promise<ApproximateLocation> {
  const latitude = roundCoordinate(rawLatitude);
  const longitude = roundCoordinate(rawLongitude);
  const places = await Location.reverseGeocodeAsync({ latitude, longitude });
  const place = places[0];
  const area = [place?.city ?? place?.subregion ?? place?.district, place?.region]
    .filter((part, index, parts): part is string => Boolean(part) && parts.indexOf(part) === index)
    .join(", ");

  return {
    area: area || "Current area",
    latitude,
    longitude,
  };
}

export async function getApproximateCurrentLocation(): Promise<ApproximateLocation> {
  const permission = await Location.requestForegroundPermissionsAsync();
  if (!permission.granted) {
    throw new Error("Location permission is needed to find nearby opportunities.");
  }

  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  return getApproximateLocation(position.coords.latitude, position.coords.longitude);
}

export async function getApproximateLocationByName(locationName: string) {
  const trimmedName = locationName.trim();
  if (!trimmedName) {
    throw new Error("Enter a city or area to look up its location.");
  }

  const results = await Location.geocodeAsync(trimmedName);
  const result = results[0];
  if (!result) {
    throw new Error("No location was found for that name.");
  }

  return getApproximateLocation(result.latitude, result.longitude);
}

export async function searchApproximateLocations(locationName: string) {
  const trimmedName = locationName.trim();
  if (trimmedName.length < 2) {
    return [];
  }

  const results = await Location.geocodeAsync(trimmedName);
  const locations = await Promise.all(
    results.slice(0, 5).map((result) =>
      getApproximateLocation(result.latitude, result.longitude)
    )
  );

  return locations.filter(
    (location, index, list) =>
      list.findIndex(
        (candidate) =>
          candidate.latitude === location.latitude &&
          candidate.longitude === location.longitude
      ) === index
  );
}

export async function saveUserLocation(userId: string, location: ApproximateLocation) {
  const { error } = await supabase.from("user_locations").upsert(
    {
      user_id: userId,
      area: location.area,
      latitude: location.latitude,
      longitude: location.longitude,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) {
    throw error;
  }
}

export async function getSavedUserLocation(userId?: string) {
  if (!userId) {
    return null;
  }

  const { data, error } = await supabase
    .from("user_locations")
    .select("area, latitude, longitude")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data
    ? {
        area: data.area ?? "Saved area",
        latitude: data.latitude,
        longitude: data.longitude,
      }
    : null;
}

export function distanceInKilometers(
  latitudeA: number,
  longitudeA: number,
  latitudeB: number,
  longitudeB: number
) {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const latitudeDelta = toRadians(latitudeB - latitudeA);
  const longitudeDelta = toRadians(longitudeB - longitudeA);
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(toRadians(latitudeA)) *
      Math.cos(toRadians(latitudeB)) *
      Math.sin(longitudeDelta / 2) ** 2;

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}
