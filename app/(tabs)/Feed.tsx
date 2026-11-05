import { useCallback, useEffect, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { Filter, MapPin, Users } from "lucide-react-native";

import { BandPost, getOpenBandPosts, parseRoles } from "../../services/bandPosts";

export default function Feed() {
  const router = useRouter();
  const [posts, setPosts] = useState<BandPost[]>([]);
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

  useFocusEffect(
    useCallback(() => {
      loadPosts();
    }, [loadPosts])
  );

  return (
    <ScrollView className="flex-1 bg-[#0a0a0a]" showsVerticalScrollIndicator={false}>
      <View className="pt-16 pb-6 px-6 bg-gradient-to-b from-purple-900/30 to-transparent">
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-3xl font-bold text-white mb-1">Find a Band</Text>
            <Text className="text-gray-400">Open opportunities from bands</Text>
          </View>
          <Pressable onPress={() => router.push("/Search")} className="p-3 bg-[#1a1a1a] rounded-xl">
            <Filter size={20} color="#a855f7" />
          </Pressable>
        </View>
      </View>

      <View className="px-4 pb-6">
        {loading && <Text className="text-center text-gray-400 py-8">Loading opportunities...</Text>}
        {error && <Text className="text-center text-red-400 py-8">{error}</Text>}
        {!loading && !error && posts.length === 0 && (
          <Text className="text-center text-gray-400 py-8">There are no open band opportunities yet.</Text>
        )}
        {posts.map((post) => {
          const band = post.band;
          const roles = parseRoles(post.roles_needed);

          return (
            <Pressable
              key={post.id}
              onPress={() => router.push({ pathname: "/BandDetail", params: { id: post.id } })}
              className="bg-[#1a1a1a] rounded-2xl overflow-hidden border border-[#2a2a2a] mb-4"
            >
              {band?.image_url && (
                <View className="relative h-48">
                  <Image source={{ uri: band.image_url }} className="w-full h-full" />
                  <View className="absolute inset-0 bg-black/50" />
                  <View className="absolute bottom-4 left-4 right-4">
                    <Text className="text-xl font-bold text-white mb-1">{band.name ?? "Unnamed band"}</Text>
                    <View className="flex-row items-center gap-2">
                      {band.genre && (
                        <View className="px-2 py-1 bg-purple-600 rounded-full">
                          <Text className="text-white text-xs font-medium">{band.genre}</Text>
                        </View>
                      )}
                      {band.location && (
                        <View className="flex-row items-center gap-1">
                          <MapPin size={12} color="#ccc" />
                          <Text className="text-gray-300 text-xs">{band.location}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              )}
              <View className="p-4">
                {!band?.image_url && <Text className="text-xl font-bold text-white mb-2">{band?.name ?? "Unnamed band"}</Text>}
                <Text className="text-white font-medium mb-1">{post.title ?? "Band opportunity"}</Text>
                {post.description && <Text className="text-gray-400 text-sm mb-3">{post.description}</Text>}
                {post.commitment_level && (
                  <View className="flex-row items-center gap-2 mb-3">
                    <Users size={16} color="#9ca3af" />
                    <Text className="text-gray-400 text-sm">{post.commitment_level} commitment</Text>
                  </View>
                )}
                {roles.length > 0 && (
                  <>
                    <Text className="text-xs font-medium text-gray-500 mb-2">Looking for:</Text>
                    <View className="flex-row flex-wrap gap-2">
                      {roles.map((role) => (
                        <View key={role} className="px-3 py-1 bg-pink-600/20 border border-pink-500/30 rounded-full">
                          <Text className="text-pink-400 text-xs font-medium">{role}</Text>
                        </View>
                      ))}
                    </View>
                  </>
                )}
              </View>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}
