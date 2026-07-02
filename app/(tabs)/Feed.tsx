import { useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, Pressable, Image, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "../../lib/supabase";
import { Filter, MapPin, Users } from "lucide-react-native";
import { useFilterStore, useActiveFilterCount } from "../../store/userFilters";

type BandPost = {
  id: string;
  title: string;
  description: string;
  roles_needed: string;
  is_open: boolean;
  min_age: number;
  max_age: number;
  commitment_level: string;
  Bands: {
    id: string;
    name: string;
    genre: string;
    location: string;
    description: string;
    image_url: string;
  };
};

export default function Feed() {
  const router = useRouter();

  const [posts, setPosts] = useState<BandPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const genres = useFilterStore((s) => s.genres);
  const roles = useFilterStore((s) => s.roles);
  const commitment = useFilterStore((s) => s.commitment);
  const location = useFilterStore((s) => s.location);
  const age = useFilterStore((s) => s.age);
  const activeFilters = useActiveFilterCount();

  useEffect(() => {
    let isMounted = true;

    async function fetchPosts() {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("bandPosts")
        .select(
          `
          id,
          title,
          description,
          roles_needed,
          is_open,
          min_age,
          max_age,
          commitment_level,
          Bands (
            id,
            name,
            genre,
            location,
            description,
            image_url
          )
        `
        )
        .eq("is_open", true)
        .order("created_at", { ascending: false });

      if (!isMounted) return;

      if (error) {
        setError(error.message);
        setPosts([]);
      } else {
        setPosts((data as unknown as BandPost[]) ?? []);
      }

      setLoading(false);
    }

    fetchPosts();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const band = post.Bands;
      const postRoles = post.roles_needed
        ? post.roles_needed.split(",").map((r) => r.trim())
        : [];

      const matchesGenre = genres.length === 0 || genres.includes(band.genre);

      const matchesRole =
        roles.length === 0 || postRoles.some((role) => roles.includes(role));

      const matchesCommitment =
        commitment.length === 0 || commitment.includes(post.commitment_level);

      const matchesLocation =
        !location.trim() ||
        band.location.toLowerCase().includes(location.trim().toLowerCase());

      const matchesAge = post.max_age <= age;

      return (
        matchesGenre &&
        matchesRole &&
        matchesCommitment &&
        matchesLocation &&
        matchesAge
      );
    });
  }, [posts, genres, roles, commitment, location, age]);

  if (loading) {
    return (
      <View className="flex-1 bg-[#0a0a0a] items-center justify-center">
        <ActivityIndicator size="large" color="#a855f7" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-[#0a0a0a] items-center justify-center px-6">
        <Text className="text-gray-400 text-center">
          Couldn't load bands right now.
        </Text>
        <Text className="text-gray-600 text-xs text-center mt-2">{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-[#0a0a0a]" showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View className="pt-16 pb-6 px-6 bg-gradient-to-b from-purple-900/30 to-transparent">
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-3xl font-bold text-white mb-1">
              Find a Band
            </Text>
            <Text className="text-gray-400">
              Discover your next musical journey
            </Text>
          </View>

          <Pressable
            onPress={() => router.push("/Search")}
            className="relative p-3 bg-[#1a1a1a] rounded-xl"
          >
            <Filter size={20} color="#a855f7" />
            {activeFilters > 0 && (
              <View className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-purple-600 rounded-full items-center justify-center">
                <Text className="text-white text-[10px] font-bold">
                  {activeFilters}
                </Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>

      {/* Feed */}
      <View className="px-4 pb-6 space-y-4">
        {filteredPosts.length === 0 ? (
          <View className="items-center justify-center py-16 px-6">
            <Text className="text-gray-400 text-center text-base mb-1">
              No bands match your filters
            </Text>
            <Pressable onPress={() => router.push("/Search")}>
              <Text className="text-purple-400 text-sm">Adjust filters</Text>
            </Pressable>
          </View>
        ) : (
          filteredPosts.map((post) => {
            const band = post.Bands;
            const rolesList = post.roles_needed
              ? post.roles_needed.split(",").map((r) => r.trim())
              : [];

            return (
              <Pressable
                key={post.id}
                onPress={() => router.push(`/BandDetail?id=${post.id}`)}
                className="bg-[#1a1a1a] rounded-2xl overflow-hidden border border-[#2a2a2a] mb-4"
              >
                {/* Image */}
                <View className="relative h-48">
                  <Image source={{ uri: band.image_url }} className="w-full h-full" />

                  <View className="absolute inset-0 bg-black/50" />

                  <View className="absolute bottom-4 left-4 right-4">
                    <Text className="text-xl font-bold text-white mb-1">
                      {band.name}
                    </Text>

                    <View className="flex-row items-center gap-2">
                      <View className="px-2 py-1 bg-purple-600 rounded-full">
                        <Text className="text-white text-xs font-medium">
                          {band.genre}
                        </Text>
                      </View>

                      <View className="flex-row items-center gap-1">
                        <MapPin size={12} color="#ccc" />
                        <Text className="text-gray-300 text-xs">
                          {band.location}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Content */}
                <View className="p-4">
                  <Text className="text-gray-400 text-sm mb-3">
                    {post.description}
                  </Text>

                  <View className="flex-row items-center gap-2 mb-3">
                    <Users size={16} color="#9ca3af" />
                    <Text className="text-gray-400 text-sm">
                      {post.commitment_level}
                    </Text>
                  </View>

                  <Text className="text-xs font-medium text-gray-500 mb-2">
                    Looking for:
                  </Text>

                  <View className="flex-row flex-wrap gap-2">
                    {rolesList.map((role) => (
                      <View
                        key={role}
                        className="px-3 py-1 bg-pink-600/20 border border-pink-500/30 rounded-full"
                      >
                        <Text className="text-pink-400 text-xs font-medium">
                          {role}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              </Pressable>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}