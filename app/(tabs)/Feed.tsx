import { View, Text, ScrollView, Pressable, Image } from "react-native";
import { useRouter } from "expo-router";
import { Filter, MapPin, Users } from "lucide-react-native";

const bands = [
  {
    id: 1,
    name: "The Midnight Riders",
    genre: "Rock",
    location: "Los Angeles, CA",
    rolesNeeded: ["Drummer", "Lead Guitar"],
    memberCount: 3,
    image:
      "https://images.unsplash.com/photo-1552595458-e8ad6af8aa10?auto=format&fit=crop&w=800",
    description: "High-energy rock band looking for committed musicians",
  },
  {
    id: 2,
    name: "Jazz Collective",
    genre: "Jazz",
    location: "New York, NY",
    rolesNeeded: ["Saxophone", "Bass"],
    memberCount: 4,
    image:
      "https://images.unsplash.com/photo-1767462372393-e6fdecd8314b?auto=format&fit=crop&w=800",
    description:
      "Professional jazz ensemble seeking experienced players",
  },
  {
    id: 3,
    name: "Electric Dreams",
    genre: "Electronic",
    location: "San Francisco, CA",
    rolesNeeded: ["Vocalist", "Synth Player"],
    memberCount: 2,
    image:
      "https://images.unsplash.com/photo-1771229139173-18d2538a6ab8?auto=format&fit=crop&w=800",
    description: "Electronic music collective pushing boundaries",
  },
  {
    id: 4,
    name: "Metal Forge",
    genre: "Metal",
    location: "Chicago, IL",
    rolesNeeded: ["Vocalist", "Drummer"],
    memberCount: 3,
    image:
      "https://images.unsplash.com/photo-1772587000150-73b49a4069f9?auto=format&fit=crop&w=800",
    description: "Heavy metal band ready to dominate the scene",
  },
  {
    id: 5,
    name: "Acoustic Souls",
    genre: "Folk",
    location: "Austin, TX",
    rolesNeeded: ["Violinist", "Vocalist"],
    memberCount: 4,
    image:
      "https://images.unsplash.com/photo-1771694942395-879a480856e4?auto=format&fit=crop&w=800",
    description:
      "Intimate acoustic performances with heartfelt lyrics",
  },
];

export default function Feed() {
  const router = useRouter();

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
            className="p-3 bg-[#1a1a1a] rounded-xl"
          >
            <Filter size={20} color="#a855f7" />
          </Pressable>
        </View>
      </View>

      {/* Feed */}
      <View className="px-4 pb-6 space-y-4">
        {bands.map((band) => (
          <Pressable
            key={band.id}
            onPress={() => router.push(`/BandDetail?id=${band.id}`)}
            className="bg-[#1a1a1a] rounded-2xl overflow-hidden border border-[#2a2a2a] mb-4"
          >
            {/* Image */}
            <View className="relative h-48">
              <Image
                source={{ uri: band.image }}
                className="w-full h-full"
              />

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
                {band.description}
              </Text>

              <View className="flex-row items-center gap-2 mb-3">
                <Users size={16} color="#9ca3af" />
                <Text className="text-gray-400 text-sm">
                  {band.memberCount} members
                </Text>
              </View>

              <Text className="text-xs font-medium text-gray-500 mb-2">
                Looking for:
              </Text>

              <View className="flex-row flex-wrap gap-2">
                {band.rolesNeeded.map((role) => (
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
        ))}
      </View>
    </ScrollView>
  );
}