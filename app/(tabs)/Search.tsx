import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
} from "react-native";
import { X } from "lucide-react-native";

const genreOptions = [
  "Rock",
  "Jazz",
  "Classical",
  "Metal",
  "Pop",
  "Blues",
  "Electronic",
  "Hip Hop",
  "Folk",
  "Country",
];

const commitmentOptions = [
  "Casual",
  "Part-time",
  "Full-time",
  "Professional",
];

const roleOptions = [
  "Vocalist",
  "Guitar",
  "Bass",
  "Drums",
  "Keys",
  "Saxophone",
  "Violin",
  "DJ",
];

export default function Search() {
  const [genres, setGenres] = useState<string[]>([]);
  const [commitment, setCommitment] = useState("");
  const [location, setLocation] = useState("");
  const [roles, setRoles] = useState<string[]>([]);

  const toggleGenre = (genre: string) => {
    setGenres((prev) =>
      prev.includes(genre)
        ? prev.filter((g) => g !== genre)
        : [...prev, genre]
    );
  };

  const toggleRole = (role: string) => {
    setRoles((prev) =>
      prev.includes(role)
        ? prev.filter((r) => r !== role)
        : [...prev, role]
    );
  };

  const clearFilters = () => {
    setGenres([]);
    setCommitment("");
    setLocation("");
    setRoles([]);
  };

  const activeFilters =
    genres.length +
    (commitment ? 1 : 0) +
    (location ? 1 : 0) +
    roles.length;

  return (
    <ScrollView className="flex-1 bg-[#0a0a0a]" showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View className="pt-16 pb-6 px-6 bg-gradient-to-b from-purple-900/30 to-transparent">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-3xl font-bold text-white">
            Filter Bands
          </Text>

          {activeFilters > 0 && (
            <Pressable
              onPress={clearFilters}
              className="flex-row items-center gap-1"
            >
              <X size={16} color="#a855f7" />
              <Text className="text-purple-400 text-sm">
                Clear ({activeFilters})
              </Text>
            </Pressable>
          )}
        </View>

        <Text className="text-gray-400">Find the perfect match</Text>
      </View>

      <View className="px-6 pb-10 space-y-6">
        {/* Location */}
        <View>
          <Text className="text-sm font-medium text-gray-300 mb-3">
            Location
          </Text>

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
          <Text className="text-sm font-medium text-gray-300 mb-3">
            Music Genres
          </Text>

          <View className="flex-row flex-wrap gap-2">
            {genreOptions.map((genre) => (
              <Pressable
                key={genre}
                onPress={() => toggleGenre(genre)}
                className={`px-4 py-2 rounded-full ${
                  genres.includes(genre)
                    ? "bg-purple-600"
                    : "bg-[#1a1a1a]"
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    genres.includes(genre)
                      ? "text-white"
                      : "text-gray-400"
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
          <Text className="text-sm font-medium text-gray-300 mb-3">
            Roles Needed
          </Text>

          <View className="flex-row flex-wrap gap-2">
            {roleOptions.map((role) => (
              <Pressable
                key={role}
                onPress={() => toggleRole(role)}
                className={`px-4 py-2 rounded-full ${
                  roles.includes(role)
                    ? "bg-pink-600"
                    : "bg-[#1a1a1a]"
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    roles.includes(role)
                      ? "text-white"
                      : "text-gray-400"
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
          <Text className="text-sm font-medium text-gray-300 mb-3">
            Commitment Level
          </Text>

          <View className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl">
            <TextInput
              value={commitment}
              onChangeText={setCommitment}
              placeholder="Any commitment level"
              placeholderTextColor="#6b7280"
              className="px-4 py-3 text-white"
            />
          </View>
        </View>

        {/* Apply */}
        <Pressable className="w-full py-4 bg-purple-600 rounded-xl">
          <Text className="text-white text-center font-medium">
            Apply Filters
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}