import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { X } from "lucide-react-native";

import { BandPost, getOpenBandPosts, parseRoles } from "../../services/bandPosts";

const genreOptions = ["Rock", "Jazz", "Classical", "Metal", "Pop", "Blues", "Electronic", "Hip Hop", "Folk", "Country"];
const commitmentOptions = ["Casual", "Part-time", "Full-time", "Professional"];

export default function Search() {
  const router = useRouter();
  const [posts, setPosts] = useState<BandPost[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [commitment, setCommitment] = useState("");
  const [location, setLocation] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      setPosts(await getOpenBandPosts());
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load opportunities.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const filteredPosts = useMemo(() => {
    const locationQuery = location.trim().toLowerCase();
    const roleQuery = role.trim().toLowerCase();

    return posts.filter((post) => {
      const band = post.band;
      const genresMatch = genres.length === 0 || (band?.genre && genres.includes(band.genre));
      const commitmentMatch = !commitment || post.commitment_level === commitment;
      const locationMatch = !locationQuery || band?.location?.toLowerCase().includes(locationQuery);
      const roleMatch = !roleQuery || parseRoles(post.roles_needed).some((item) => item.toLowerCase().includes(roleQuery));

      return genresMatch && commitmentMatch && locationMatch && roleMatch;
    });
  }, [posts, genres, commitment, location, role]);

  const clearFilters = () => {
    setGenres([]);
    setCommitment("");
    setLocation("");
    setRole("");
  };

  const activeFilters = genres.length + Number(Boolean(commitment)) + Number(Boolean(location)) + Number(Boolean(role));

  return (
    <ScrollView className="flex-1 bg-[#0a0a0a]" showsVerticalScrollIndicator={false}>
      <View className="pt-16 pb-6 px-6 bg-gradient-to-b from-purple-900/30 to-transparent">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-3xl font-bold text-white">Find a Band</Text>
          {activeFilters > 0 && (
            <Pressable onPress={clearFilters} className="flex-row items-center gap-1">
              <X size={16} color="#a855f7" />
              <Text className="text-purple-400 text-sm">Clear ({activeFilters})</Text>
            </Pressable>
          )}
        </View>
        <Text className="text-gray-400">Filters update matching opportunities instantly</Text>
      </View>

      <View className="px-6 pb-10">
        <Text className="text-sm font-medium text-gray-300 mb-3">Location</Text>
        <TextInput value={location} onChangeText={setLocation} placeholder="City or ZIP code" placeholderTextColor="#6b7280" className="px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white mb-6" />

        <Text className="text-sm font-medium text-gray-300 mb-3">Music Genres</Text>
        <View className="flex-row flex-wrap gap-2 mb-6">
          {genreOptions.map((genre) => (
            <Pressable key={genre} onPress={() => setGenres((current) => current.includes(genre) ? current.filter((item) => item !== genre) : [...current, genre])} className={`px-4 py-2 rounded-full ${genres.includes(genre) ? "bg-purple-600" : "bg-[#1a1a1a]"}`}>
              <Text className={genres.includes(genre) ? "text-white" : "text-gray-400"}>{genre}</Text>
            </Pressable>
          ))}
        </View>

        <Text className="text-sm font-medium text-gray-300 mb-3">Role needed</Text>
        <TextInput value={role} onChangeText={setRole} placeholder="e.g. Drummer" placeholderTextColor="#6b7280" className="px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white mb-6" />

        <Text className="text-sm font-medium text-gray-300 mb-3">Commitment Level</Text>
        <View className="flex-row flex-wrap gap-2 mb-8">
          {commitmentOptions.map((option) => (
            <Pressable key={option} onPress={() => setCommitment((current) => current === option ? "" : option)} className={`px-4 py-2 rounded-full ${commitment === option ? "bg-pink-600" : "bg-[#1a1a1a]"}`}>
              <Text className={commitment === option ? "text-white" : "text-gray-400"}>{option}</Text>
            </Pressable>
          ))}
        </View>

        {loading && <Text className="text-center text-gray-400 py-6">Loading opportunities...</Text>}
        {error && <Text className="text-center text-red-400 py-6">{error}</Text>}
        {!loading && !error && (
          <>
            <Text className="text-gray-400 mb-3">{filteredPosts.length} matching opportunities</Text>
            {filteredPosts.map((post) => (
              <Pressable key={post.id} onPress={() => router.push({ pathname: "/BandDetail", params: { id: post.id } })} className="p-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl mb-3">
                <Text className="text-white font-semibold">{post.title ?? "Band opportunity"}</Text>
                <Text className="text-gray-400 mt-1">{post.band?.name ?? "Unnamed band"}{post.band?.location ? ` · ${post.band.location}` : ""}</Text>
              </Pressable>
            ))}
          </>
        )}
      </View>
    </ScrollView>
  );
}
