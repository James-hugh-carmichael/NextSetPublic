import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
} from "react-native";
import { X } from "lucide-react-native";
import Slider from "@react-native-community/slider";
import { useFilterStore, useActiveFilterCount } from "../../store/userFilters";

/**
 * Search screen for filtering available bands.
 *
 * Provides users with filtering controls to discover bands based on:
 * - Location
 * - Music genres
 * - Required roles/instruments
 * - Commitment level
 * - Maximum age requirements
 *
 * Uses the global filter store to persist selected filters
 */

const genreOptions = [
  "Rock", "Jazz", "Classical", "Metal", "Pop", "Blues",
  "Electronic", "Hip Hop", "Folk", "Country", "Posthardcore",
];

const commitmentOptions = ["Casual", "Part-time", "Full-time", "Professional"];

const roleOptions = [
  "Vocalist", "Lead Guitar", "Rhythm Guitar", "Bass", "Drums",
  "Keys", "Saxophone", "Violin", "DJ",
];

export default function Search() {
  const genres = useFilterStore((s) => s.genres);
  const commitment = useFilterStore((s) => s.commitment);
  const location = useFilterStore((s) => s.location);
  const roles = useFilterStore((s) => s.roles);
  const age = useFilterStore((s) => s.age);

  const toggleGenre = useFilterStore((s) => s.toggleGenre);
  const toggleRole = useFilterStore((s) => s.toggleRole);
  const toggleCommitment = useFilterStore((s) => s.toggleCommitment);
  const setLocation = useFilterStore((s) => s.setLocation);
  const setAge = useFilterStore((s) => s.setAge);
  const clearFilters = useFilterStore((s) => s.clearFilters);

  const activeFilters = useActiveFilterCount();

  return (
    <ScrollView className="flex-1 bg-[#0a0a0a]" showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View className="pt-16 pb-6 px-6 bg-gradient-to-b from-purple-900/30 to-transparent">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-3xl font-bold text-white">Filter Bands</Text>

          {activeFilters > 0 && (
            <Pressable onPress={clearFilters} className="flex-row items-center gap-1">
              <X size={16} color="#a855f7" />
              <Text className="text-purple-400 text-sm">Clear ({activeFilters})</Text>
            </Pressable>
          )}
        </View>

        <Text className="text-gray-400">Find the perfect match</Text>
      </View>

      <View className="px-6 pb-10 space-y-6">
        {/* Location */}
        <View>
          <Text className="text-sm font-medium text-gray-300 mb-3">Location</Text>
          <TextInput
            value={location}
            onChangeText={setLocation}
            placeholder="City or ZIP code"
            placeholderTextColor="#6b7280"
            className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white"
          />
        </View>

        {/* Genres */}
        <View>
          <Text className="text-sm font-medium text-gray-300 mb-3">Music Genres</Text>
          <View className="flex-row flex-wrap gap-2">
            {genreOptions.map((genre) => (
              <Pressable
                key={genre}
                onPress={() => toggleGenre(genre)}
                className={`px-4 py-2 rounded-full ${
                  genres.includes(genre) ? "bg-purple-600" : "bg-[#1a1a1a]"
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    genres.includes(genre) ? "text-white" : "text-gray-400"
                  }`}
                >
                  {genre}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Roles */}
        <View>
          <Text className="text-sm font-medium text-gray-300 mb-3">Roles Needed</Text>
          <View className="flex-row flex-wrap gap-2">
            {roleOptions.map((role) => (
              <Pressable
                key={role}
                onPress={() => toggleRole(role)}
                className={`px-4 py-2 rounded-full ${
                  roles.includes(role) ? "bg-pink-600" : "bg-[#1a1a1a]"
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    roles.includes(role) ? "text-white" : "text-gray-400"
                  }`}
                >
                  {role}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Commitment */}
        <View>
          <Text className="text-sm font-medium text-gray-300 mb-3">Commitment Level</Text>
          <View className="flex-row flex-wrap gap-2">
            {commitmentOptions.map((option) => (
              <Pressable
                key={option}
                onPress={() => toggleCommitment(option)}
                className={`px-4 py-2 rounded-full ${
                  commitment.includes(option) ? "bg-purple-600" : "bg-[#1a1a1a]"
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    commitment.includes(option) ? "text-white" : "text-gray-400"
                  }`}
                >
                  {option}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Age */}
        <View>
          <Text className="text-sm font-medium text-gray-300 mb-3">
            Maximum Band Age: {age}
          </Text>
          <View className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3">
            <Slider
              minimumValue={16}
              maximumValue={80}
              step={1}
              value={age}
              onValueChange={setAge}
              minimumTrackTintColor="#9333ea"
              maximumTrackTintColor="#374151"
              thumbTintColor="#a855f7"
            />
            <View className="flex-row justify-between">
              <Text className="text-gray-500 text-xs">16</Text>
              <Text className="text-gray-500 text-xs">80+</Text>
            </View>
          </View>
        </View>

        {/* Apply */}
        <Pressable className="w-full py-4 bg-purple-600 rounded-xl">
          <Text className="text-white text-center font-medium">Apply Filters</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}