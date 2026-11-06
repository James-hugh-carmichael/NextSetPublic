import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import Slider from "@react-native-community/slider";
import { LocateFixed, X } from "lucide-react-native";

import { MUSIC_GENRES, normalizeGenre } from "../../lib/music";
import {
  EMPTY_OPPORTUNITY_FILTERS,
  OpportunityFilters,
  getOpportunityFilters,
  saveOpportunityFilters,
} from "../../services/opportunityFilters";
import {
  getApproximateCurrentLocation,
  getApproximateLocationByName,
  getSavedUserLocation,
  saveUserLocation,
  searchApproximateLocations,
} from "../../services/location";
import { useUser } from "../../services/auth";

const commitmentOptions = ["Casual", "Part-time", "Full-time", "Professional"];

export default function Search() {
  const { user } = useUser();
  const [filters, setFilters] = useState<OpportunityFilters>(EMPTY_OPPORTUNITY_FILTERS);
  const [genreQuery, setGenreQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState<
    { area: string; latitude: number; longitude: number }[]
  >([]);

  useEffect(() => {
    let active = true;

    Promise.all([getOpportunityFilters(user?.id), getSavedUserLocation(user?.id)])
      .then(([savedFilters, savedLocation]) => {
        if (active) {
          setFilters(
            savedFilters.latitude === null && savedLocation
              ? {
                  ...savedFilters,
                  latitude: savedLocation.latitude,
                  longitude: savedLocation.longitude,
                  locationArea: savedLocation.area,
                }
              : savedFilters
          );
        }
      })
      .catch((loadError) => {
        if (active) {
          Alert.alert(
            "Unable to load filters",
            loadError instanceof Error ? loadError.message : "Your filters could not be loaded."
          );
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [user?.id]);

  useEffect(() => {
    if (!user || loading) {
      return;
    }

    saveOpportunityFilters(user.id, filters).catch((saveError) => {
      Alert.alert(
        "Unable to save filters",
        saveError instanceof Error ? saveError.message : "Your filters could not be saved."
      );
    });
  }, [filters, loading, user]);

  useEffect(() => {
    if (filters.locationQuery.trim().length < 2) {
      setLocationSuggestions([]);
      return;
    }

    let active = true;
    const timer = setTimeout(() => {
      searchApproximateLocations(filters.locationQuery)
        .then((locations) => {
          if (active) {
            setLocationSuggestions(locations);
          }
        })
        .catch(() => {
          if (active) {
            setLocationSuggestions([]);
          }
        });
    }, 350);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [filters.locationQuery]);

  const matchingGenres = useMemo(
    () =>
      MUSIC_GENRES.filter(
        (genre) =>
          !filters.genres.includes(genre) &&
          normalizeGenre(genre).includes(normalizeGenre(genreQuery))
      ),
    [filters.genres, genreQuery]
  );

  const clearFilters = () => {
    setFilters(EMPTY_OPPORTUNITY_FILTERS);
    setGenreQuery("");
  };

  const useCurrentLocation = async () => {
    if (!user) {
      return;
    }

    setLocating(true);
    try {
      const location = await getApproximateCurrentLocation();
      await saveUserLocation(user.id, location);
      setFilters((current) => ({
        ...current,
        locationQuery: "",
        latitude: location.latitude,
        longitude: location.longitude,
        locationArea: location.area,
      }));
    } catch (locationError) {
      Alert.alert(
        "Unable to use location",
        locationError instanceof Error
          ? locationError.message
          : "Your location could not be retrieved."
      );
    } finally {
      setLocating(false);
    }
  };

  const lookUpLocationName = async () => {
    if (!user) {
      return;
    }

    setLocating(true);
    try {
      const location = await getApproximateLocationByName(filters.locationQuery);
      await saveUserLocation(user.id, location);
      setFilters((current) => ({
        ...current,
        latitude: location.latitude,
        longitude: location.longitude,
        locationArea: location.area,
      }));
    } catch (locationError) {
      Alert.alert(
        "Unable to look up location",
        locationError instanceof Error
          ? locationError.message
          : "That location could not be found."
      );
    } finally {
      setLocating(false);
    }
  };

  const selectLocationSuggestion = async (location: {
    area: string;
    latitude: number;
    longitude: number;
  }) => {
    if (!user) {
      return;
    }

    try {
      await saveUserLocation(user.id, location);
      setFilters((current) => ({
        ...current,
        locationQuery: "",
        latitude: location.latitude,
        longitude: location.longitude,
        locationArea: location.area,
      }));
      setLocationSuggestions([]);
    } catch (locationError) {
      Alert.alert(
        "Unable to save location",
        locationError instanceof Error
          ? locationError.message
          : "The location could not be saved."
      );
    }
  };

  const activeFilters =
    filters.genres.length +
    Number(Boolean(filters.commitment)) +
    Number(Boolean(filters.locationQuery)) +
    Number(Boolean(filters.role)) +
    Number(filters.latitude !== null && filters.longitude !== null);

  if (loading) {
    return <View className="flex-1 bg-[#0a0a0a]" />;
  }

  return (
    <ScrollView className="flex-1 bg-[#0a0a0a]" showsVerticalScrollIndicator={false}>
      <View className="pt-16 pb-6 px-6 bg-gradient-to-b from-purple-900/30 to-transparent">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-3xl font-bold text-white">Filters</Text>
          {activeFilters > 0 && (
            <Pressable onPress={clearFilters} className="flex-row items-center gap-1">
              <X size={16} color="#a855f7" />
              <Text className="text-purple-400 text-sm">Clear ({activeFilters})</Text>
            </Pressable>
          )}
        </View>
        <Text className="text-gray-400">Matching opportunities update in the Feed</Text>
      </View>

      <View className="px-6 pb-10">
        <Text className="text-sm font-medium text-gray-300 mb-3">Nearby opportunities</Text>
        <Pressable
          onPress={useCurrentLocation}
          disabled={locating}
          className="flex-row items-center justify-center gap-2 py-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl mb-3"
        >
          <LocateFixed size={20} color="#a855f7" />
          <Text className="text-purple-400 font-semibold">
            {locating ? "Finding your location..." : "Use my approximate location"}
          </Text>
        </Pressable>
        {filters.locationArea && (
          <Text className="text-gray-400 mb-3">Using approximate area: {filters.locationArea}</Text>
        )}
        {filters.latitude !== null && filters.longitude !== null && (
          <View className="mb-6 px-1">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-sm font-medium text-gray-300">Distance</Text>
              <Text className="text-pink-400 font-semibold">
                {filters.radiusKm > 100 ? "100 km+" : `${filters.radiusKm} km`}
              </Text>
            </View>
            <Slider
              minimumValue={1}
              maximumValue={101}
              step={1}
              value={Math.min(filters.radiusKm, 101)}
              onValueChange={(radiusKm) =>
                setFilters((current) => ({ ...current, radiusKm: Math.round(radiusKm) }))
              }
              minimumTrackTintColor="#ec4899"
              maximumTrackTintColor="#2a2a2a"
              thumbTintColor="#a855f7"
            />
          </View>
        )}

        <Text className="text-sm font-medium text-gray-300 mb-3">Look up a location name</Text>
        <TextInput
          value={filters.locationQuery}
          onChangeText={(locationQuery) =>
            setFilters((current) => ({
              ...current,
              locationQuery,
              latitude: null,
              longitude: null,
              locationArea: "",
            }))
          }
          placeholder="City, town, or area"
          placeholderTextColor="#6b7280"
          className="px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white mb-6"
        />
        {locationSuggestions.length > 0 && (
          <View className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden -mt-3 mb-4">
            {locationSuggestions.map((location) => (
              <Pressable
                key={`${location.latitude}:${location.longitude}`}
                onPress={() => selectLocationSuggestion(location)}
                className="px-4 py-3 border-b border-[#2a2a2a]"
              >
                <Text className="text-white">{location.area}</Text>
              </Pressable>
            ))}
          </View>
        )}
        <Pressable
          onPress={lookUpLocationName}
          disabled={locating || !filters.locationQuery.trim()}
          className="py-3 border border-[#2a2a2a] rounded-xl mb-6"
        >
          <Text className="text-purple-400 text-center font-medium">
            {locating ? "Looking up location..." : "Use this location"}
          </Text>
        </Pressable>

        <Text className="text-sm font-medium text-gray-300 mb-3">Music Genres</Text>
        {filters.genres.length > 0 && (
          <View className="mb-3">
            <Text className="text-xs font-medium text-purple-400 mb-2">Selected genres</Text>
            <View className="flex-row flex-wrap gap-2">
              {filters.genres.map((genre) => (
                <Pressable key={genre} onPress={() => setFilters((current) => ({ ...current, genres: current.genres.filter((item) => item !== genre) }))} className="flex-row items-center gap-1 px-4 py-2 rounded-full bg-purple-600">
                  <Text className="text-white">{genre}</Text>
                  <X size={14} color="white" />
                </Pressable>
              ))}
            </View>
          </View>
        )}
        <TextInput value={genreQuery} onChangeText={setGenreQuery} placeholder="Search genres, e.g. Post-Hardcore" placeholderTextColor="#6b7280" className="px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white mb-3" />
        {genreQuery.trim() && (
          <View className="flex-row flex-wrap gap-2 mb-6">
            {matchingGenres.map((genre) => (
              <Pressable key={genre} onPress={() => { setFilters((current) => ({ ...current, genres: [...current.genres, genre] })); setGenreQuery(""); }} className="px-4 py-2 rounded-full bg-[#1a1a1a]">
                <Text className="text-gray-400">{genre}</Text>
              </Pressable>
            ))}
          </View>
        )}

        <Text className="text-sm font-medium text-gray-300 mb-3">Role needed</Text>
        <TextInput value={filters.role} onChangeText={(role) => setFilters((current) => ({ ...current, role }))} placeholder="e.g. Drummer" placeholderTextColor="#6b7280" className="px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white mb-6" />

        <Text className="text-sm font-medium text-gray-300 mb-3">Commitment Level</Text>
        <View className="flex-row flex-wrap gap-2 mb-8">
          {commitmentOptions.map((option) => (
            <Pressable key={option} onPress={() => setFilters((current) => ({ ...current, commitment: current.commitment === option ? "" : option }))} className={`px-4 py-2 rounded-full ${filters.commitment === option ? "bg-pink-600" : "bg-[#1a1a1a]"}`}>
              <Text className={filters.commitment === option ? "text-white" : "text-gray-400"}>{option}</Text>
            </Pressable>
          ))}
        </View>

        <Text className="text-center text-gray-500 py-4">
          Matching opportunities appear in the Feed.
        </Text>
      </View>
    </ScrollView>
  );
}
