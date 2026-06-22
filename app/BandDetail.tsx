import { View, Text, Pressable, ScrollView, Image } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  MapPin,
  Users,
  MessageCircle,
  UserPlus,
  Play,
} from "lucide-react-native";

const bandDetails = {
  "1": {
    name: "The Midnight Riders",
    genre: "Rock",
    location: "Los Angeles, CA",
    memberCount: 3,
    image:
      "https://images.unsplash.com/photo-1552595458-e8ad6af8aa10?auto=format&fit=crop&w=800",
    description:
      "We're a high-energy rock band that's been playing together for 3 years. Our sound blends classic rock influences with modern production. We practice twice a week and play local venues regularly. Looking for dedicated musicians who share our passion and commitment.",
    rolesNeeded: [
      {
        role: "Drummer",
        description: "Must have 5+ years experience, own kit",
      },
      {
        role: "Lead Guitar",
        description:
          "Looking for someone who can shred and contribute to songwriting",
      },
    ],
    currentMembers: [
      {
        name: "Alex",
        role: "Vocals/Rhythm Guitar",
        image:
          "https://images.unsplash.com/photo-1618674782816-1c1c777bd2c1?auto=format&fit=crop&w=400",
      },
      {
        name: "Jordan",
        role: "Bass",
        image:
          "https://images.unsplash.com/photo-1580069771051-10691ff2daf7?auto=format&fit=crop&w=400",
      },
      {
        name: "Sam",
        role: "Keys",
        image:
          "https://images.unsplash.com/photo-1659150140146-eccc70a8515c?auto=format&fit=crop&w=400",
      },
    ],
    videos: [
      "https://images.unsplash.com/photo-1695192577284-fd1b10529579?auto=format&fit=crop&w=400",
      "https://images.unsplash.com/photo-1763889593924-982aef0c705e?auto=format&fit=crop&w=400",
      "https://images.unsplash.com/photo-1598295893369-1918ffaf89a2?auto=format&fit=crop&w=400",
    ],
  },
};

export default function BandDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const band =
    bandDetails[id as keyof typeof bandDetails] || bandDetails["1"];

  return (
    <ScrollView className="flex-1 bg-[#0a0a0a]" showsVerticalScrollIndicator={false}>
      {/* Header image */}
      <View className="relative h-64">
        <Image
          source={{ uri: band.image }}
          className="w-full h-full"
        />

        <View className="absolute inset-0 bg-black/50" />

        <Pressable
          onPress={() => router.back()}
          className="absolute top-4 left-4 p-2 bg-black/50 rounded-full"
        >
          <ArrowLeft size={24} color="white" />
        </Pressable>

        <View className="absolute bottom-6 left-6 right-6">
          <Text className="text-3xl font-bold text-white mb-2">
            {band.name}
          </Text>

          <View className="flex-row items-center flex-wrap gap-3">
            <View className="px-3 py-1 bg-purple-600 rounded-full">
              <Text className="text-white font-medium">
                {band.genre}
              </Text>
            </View>

            <View className="flex-row items-center gap-1">
              <MapPin size={14} color="#ccc" />
              <Text className="text-gray-300 text-sm">
                {band.location}
              </Text>
            </View>

            <View className="flex-row items-center gap-1">
              <Users size={14} color="#ccc" />
              <Text className="text-gray-300 text-sm">
                {band.memberCount} members
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View className="px-6 py-6 space-y-6">
        {/* Action buttons */}
        <View className="flex-row gap-3">
          <Pressable className="flex-1 py-3 bg-purple-600 rounded-xl flex-row items-center justify-center gap-2">
            <UserPlus size={20} color="white" />
            <Text className="text-white font-medium">
              Request to Join
            </Text>
          </Pressable>

          <Pressable className="px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl">
            <MessageCircle size={20} color="white" />
          </Pressable>
        </View>

        {/* About */}
        <View>
          <Text className="text-xl font-bold text-white mb-3">
            About
          </Text>
          <Text className="text-gray-400 leading-relaxed">
            {band.description}
          </Text>
        </View>

        {/* Videos */}
        <View>
          <Text className="text-xl font-bold text-white mb-3">
            Performance Videos
          </Text>

          <View className="flex-row flex-wrap gap-3">
            {band.videos.map((video, index) => (
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

        {/* Members */}
        <View>
          <Text className="text-xl font-bold text-white mb-3">
            Current Members
          </Text>

          <View className="space-y-3">
            {band.currentMembers.map((member, index) => (
              <View
                key={index}
                className="flex-row items-center gap-3 p-3 bg-[#1a1a1a] rounded-xl"
              >
                <Image
                  source={{ uri: member.image }}
                  className="w-12 h-12 rounded-full"
                />

                <View>
                  <Text className="text-white font-medium">
                    {member.name}
                  </Text>
                  <Text className="text-gray-400 text-sm">
                    {member.role}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Roles needed */}
        <View>
          <Text className="text-xl font-bold text-white mb-3">
            Roles Needed
          </Text>

          <View className="space-y-3">
            {band.rolesNeeded.map((position, index) => (
              <View
                key={index}
                className="p-4 bg-purple-600/10 border border-purple-500/30 rounded-xl"
              >
                <Text className="text-white font-medium mb-1">
                  {position.role}
                </Text>
                <Text className="text-gray-400 text-sm">
                  {position.description}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}