import { View, Text, Pressable } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ChevronLeft, Music2 } from "lucide-react-native";

export default function BandProfile() {
  const router = useRouter();
  const { name } = useLocalSearchParams<{ id?: string; name?: string }>();

  return (
    <View className="flex-1 bg-[#0a0a0a] items-center justify-center px-6">
      <Pressable
        onPress={() => router.back()}
        className="absolute top-16 left-6 p-2 bg-black/50 rounded-full"
      >
        <ChevronLeft size={20} color="white" />
      </Pressable>

      <View className="w-16 h-16 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] items-center justify-center">
        <Music2 size={28} color="#a855f7" />
      </View>

      <Text className="text-white text-xl font-bold mt-4 text-center">
        {name || "Band profile"}
      </Text>
      <Text className="text-gray-400 text-center mt-2 px-8">
        The band profile view is coming soon — this is a placeholder for now.
      </Text>
    </View>
  );
}