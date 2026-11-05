import { Image, Linking, Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Award, Clock, Music, Settings } from "lucide-react-native";

import { useUser } from "../../services/auth";
import { parseStoredList, useMusician } from "../../services/musicians";

export default function Profile() {
  const router = useRouter();
  const { user } = useUser();
  const { musician, loading, error } = useMusician(user?.id);

  if (loading) {
    return <View className="flex-1 bg-[#0a0a0a]" />;
  }

  if (error || !musician) {
    return (
      <View className="flex-1 items-center justify-center bg-[#0a0a0a] px-6">
        <Text className="text-gray-400 text-center">{error ?? "Your profile is unavailable."}</Text>
      </View>
    );
  }

  const genres = parseStoredList(musician.genres);
  const roles = parseStoredList(musician.roles);
  const videos = parseStoredList(musician.videos);
  const initial = musician.name?.trim().charAt(0).toUpperCase() || "?";

  return (
    <ScrollView className="flex-1 bg-[#0a0a0a]" showsVerticalScrollIndicator={false}>
      <View className="pt-16 pb-6 px-6 relative">
        <Pressable onPress={() => router.push("/Settings")} className="absolute top-12 right-4 p-2 bg-black/50 rounded-full">
          <Settings size={20} color="white" />
        </Pressable>
        {musician.avatar_url ? (
          <Image source={{ uri: musician.avatar_url }} className="w-28 h-28 rounded-2xl mb-5" />
        ) : (
          <View className="w-28 h-28 rounded-2xl bg-purple-600 items-center justify-center mb-5">
            <Text className="text-5xl font-bold text-white">{initial}</Text>
          </View>
        )}
        <Text className="text-3xl font-bold text-white mb-2">{musician.name ?? "Musician"}</Text>
      </View>

      <View className="px-6 pb-8">
        <Pressable onPress={() => router.push("/ProfileSetup")} className="w-full py-3 bg-purple-600 rounded-xl mb-6">
          <Text className="text-white text-center font-medium">Edit Profile</Text>
        </Pressable>

        <View className="flex-row gap-3 mb-6">
          <View className="flex-1 p-4 bg-[#1a1a1a] rounded-xl border border-[#2a2a2a]">
            <Award size={20} color="#a855f7" />
            <Text className="text-gray-500 text-xs mt-2">Experience</Text>
            <Text className="text-white font-medium text-sm">{musician.experience_level ?? "Not set"}</Text>
          </View>
          <View className="flex-1 p-4 bg-[#1a1a1a] rounded-xl border border-[#2a2a2a]">
            <Clock size={20} color="#ec4899" />
            <Text className="text-gray-500 text-xs mt-2">Commitment</Text>
            <Text className="text-white font-medium text-sm">{musician.commitment_level ?? "Not set"}</Text>
          </View>
          <View className="flex-1 p-4 bg-[#1a1a1a] rounded-xl border border-[#2a2a2a]">
            <Music size={20} color="#3b82f6" />
            <Text className="text-gray-500 text-xs mt-2">Genres</Text>
            <Text className="text-white font-medium text-sm">{genres.length}</Text>
          </View>
        </View>

        {musician.bio && (
          <View className="mb-6">
            <Text className="text-xl font-bold text-white mb-3">About</Text>
            <Text className="text-gray-400 leading-relaxed">{musician.bio}</Text>
          </View>
        )}
        <View className="mb-6">
          <Text className="text-xl font-bold text-white mb-3">Music Genres</Text>
          {genres.length === 0 ? (
            <Text className="text-gray-400">No genres added yet.</Text>
          ) : (
            <View className="flex-row flex-wrap gap-2">
              {genres.map((genre) => (
                <View key={genre} className="px-4 py-2 bg-purple-600/20 border border-purple-500/30 rounded-full">
                  <Text className="text-purple-400 text-sm font-medium">{genre}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
        <View className="mb-6">
          <Text className="text-xl font-bold text-white mb-3">Instruments & Roles</Text>
          {roles.length === 0 ? (
            <Text className="text-gray-400">No instruments or roles added yet.</Text>
          ) : (
            <View className="flex-row flex-wrap gap-2">
              {roles.map((role) => (
                <View key={role} className="px-4 py-2 bg-pink-600/20 border border-pink-500/30 rounded-full">
                  <Text className="text-pink-400 text-sm font-medium">{role}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
        <View>
          <Text className="text-xl font-bold text-white mb-3">Performance Videos</Text>
          {videos.length === 0 ? (
            <Text className="text-gray-400">No performance videos added yet.</Text>
          ) : (
            videos.map((video) => (
              <Pressable key={video} onPress={() => Linking.openURL(video)} className="p-4 bg-[#1a1a1a] rounded-xl mb-2">
                <Text className="text-purple-400" numberOfLines={1}>{video}</Text>
              </Pressable>
            ))
          )}
        </View>
      </View>
    </ScrollView>
  );
}
