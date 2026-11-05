import { useRouter } from "expo-router";
import { View, Text, Pressable } from "react-native";
import { Music } from "lucide-react-native";

export default function Onboarding() {
  const router = useRouter();

  return (
    <View className="flex-1 items-center justify-center bg-gradient-to-b from-[#0a0a0a] to-[#1a0a2e] px-6">
      <View className="w-full max-w-md">
        <View className="text-center mb-12">
          <Text className="text-3xl font-bold text-white mb-3">
            Create your musician profile
          </Text>
          <Text className="text-gray-400 text-center">
            Tell bands what you play and what you are looking for
          </Text>
        </View>

        <View className="space-y-4">
          <Pressable
            onPress={() => router.push("/ProfileSetup")}
            className="w-full p-6 bg-[#1a1a1a]/30 border-2 border-purple-500/30 rounded-2xl"
          >
            <View className="flex-row items-center gap-4">
              <View className="p-3 bg-purple-600 rounded-xl">
                <Music size={32} color="white" />
              </View>

              <View className="flex-1">
                <Text className="text-xl font-bold text-white mb-1">
                  Set up profile
                </Text>
                <Text className="text-gray-400 text-sm">
                  Add your experience, genres, and availability
                </Text>
              </View>
            </View>
          </Pressable>

        </View>
      </View>
    </View>
  );
}