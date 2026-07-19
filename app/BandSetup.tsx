import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft, Plus } from "lucide-react-native";

export default function BandSetup() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-[#0a0a0a] items-center justify-center px-6">
      <Pressable
        onPress={() => router.back()}
        className="absolute top-16 left-6 p-2 bg-black/50 rounded-full"
      >
        <ChevronLeft size={20} color="white" />
      </Pressable>

      <View className="w-16 h-16 rounded-full border border-[#3a3a3a] items-center justify-center">
        <Plus size={28} color="#a855f7" />
      </View>

      <Text className="text-white text-xl font-bold mt-4 text-center">
        Create a Band
      </Text>
      <Text className="text-gray-400 text-center mt-2 px-8">
        The create-band form is coming soon — this is a placeholder for now.
      </Text>
    </View>
  );
}