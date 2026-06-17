import { View, Text, Pressable, Image, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import {
  Settings,
  MapPin,
  Music,
  Award,
  Clock,
  Play,
} from "lucide-react-native";

export default function Profile() {
  const router = useRouter();

  const profile = {
    name: "Alex Johnson",
    age: 28,
    location: "Brooklyn, NY",
    bio: "Passionate guitarist with 10+ years of experience. Love creating original music and jamming with talented musicians. Looking for a rock or indie band to join for serious projects and regular gigs.",
    genres: ["Rock", "Indie", "Alternative"],
    experience: "Advanced",
    commitment: "Part-time",
    videos: [
      "https://images.unsplash.com/photo-1695192577284-fd1b10529579?auto=format&fit=crop&w=400",
      "https://images.unsplash.com/photo-1763889593924-982aef0c705e?auto=format&fit=crop&w=400",
      "https://images.unsplash.com/photo-1598295893369-1918ffaf89a2?auto=format&fit=crop&w=400",
    ],
    profileImage:
      "https://images.unsplash.com/photo-1618674782816-1c1c777bd2c1?auto=format&fit=crop&w=600",
  };

  return (
    <ScrollView className="flex-1 bg-[#0a0a0a]" showsVerticalScrollIndicator={false}>
      {/* Top bar */}
      <View className="pt-16 pb-6 px-6 relative">
        <Pressable
          onPress={() => router.push("/Settings")}
          className="absolute top-4 right-4 p-2 bg-black/50 rounded-full"
        >
          <Settings size={20} color="white" />
        </Pressable>
      </View>

      <View className="px-6 -mt-16 pb-6">
        {/* Profile header */}
        <View className="flex-row items-end gap-4 mb-6">
          <Image
            source={{ uri: profile.profileImage }}
            className="w-32 h-32 rounded-2xl border-4 border-[#0a0a0a] bg-[#1a1a1a]"
          />

          <View className="flex-1 pb-2">
            <Text className="text-2xl font-bold text-white mb-1">
              {profile.name}, {profile.age}
            </Text>

            <View className="flex-row items-center gap-1">
              <MapPin size={14} color="#9ca3af" />
              <Text className="text-gray-400 text-sm">
                {profile.location}
              </Text>
            </View>
          </View>
        </View>

        {/* Edit button */}
        <Pressable className="w-full py-3 bg-purple-600 rounded-xl mb-6">
          <Text className="text-white text-center font-medium">
            Edit Profile
          </Text>
        </Pressable>

        {/* Stats */}
        <View className="flex-row gap-3 mb-6">
          <View className="flex-1 p-4 bg-[#1a1a1a] rounded-xl border border-[#2a2a2a]">
            <Award size={20} color="#a855f7" />
            <Text className="text-gray-500 text-xs mt-2">
              Experience
            </Text>
            <Text className="text-white font-medium text-sm">
              {profile.experience}
            </Text>
          </View>

          <View className="flex-1 p-4 bg-[#1a1a1a] rounded-xl border border-[#2a2a2a]">
            <Clock size={20} color="#ec4899" />
            <Text className="text-gray-500 text-xs mt-2">
              Commitment
            </Text>
            <Text className="text-white font-medium text-sm">
              {profile.commitment}
            </Text>
          </View>

          <View className="flex-1 p-4 bg-[#1a1a1a] rounded-xl border border-[#2a2a2a]">
            <Music size={20} color="#3b82f6" />
            <Text className="text-gray-500 text-xs mt-2">
              Genres
            </Text>
            <Text className="text-white font-medium text-sm">
              {profile.genres.length}
            </Text>
          </View>
        </View>

        {/* About */}
        <View className="mb-6">
          <Text className="text-xl font-bold text-white mb-3">
            About
          </Text>
          <Text className="text-gray-400 leading-relaxed">
            {profile.bio}
          </Text>
        </View>

        {/* Genres */}
        <View className="mb-6">
          <Text className="text-xl font-bold text-white mb-3">
            Music Genres
          </Text>

          <View className="flex-row flex-wrap gap-2">
            {profile.genres.map((genre) => (
              <View
                key={genre}
                className="px-4 py-2 bg-purple-600/20 border border-purple-500/30 rounded-full"
              >
                <Text className="text-purple-400 text-sm font-medium">
                  {genre}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Videos */}
        <View>
          <Text className="text-xl font-bold text-white mb-3">
            Performance Videos
          </Text>

          <View className="flex-row flex-wrap gap-3">
            {profile.videos.map((video, index) => (
              <View
                key={index}
                className="w-[30%] aspect-square rounded-xl overflow-hidden relative"
              >
                <Image
                  source={{ uri: video }}
                  className="w-full h-full"
                />

                <View className="absolute inset-0 bg-black/40 items-center justify-center">
                  <View className="w-10 h-10 bg-white rounded-full items-center justify-center">
                    <Play size={18} color="black" />
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}