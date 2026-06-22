import { useRouter } from "expo-router";
import { View, Text, Pressable } from "react-native";
import { Users, Music } from "lucide-react-native";

export default function Onboarding() {
  const router = useRouter();

  const handleSelection = (role: string) => {
    router.push({
      pathname: "/ProfileSetup",
      params: { role },
    });
  };

  return (
    <View className="flex-1 items-center justify-center bg-gradient-to-b from-[#0a0a0a] to-[#1a0a2e] px-6">
      <View className="w-full max-w-md">
        <View className="text-center mb-12">
          <Text className="text-3xl font-bold text-white mb-3">
            What are you looking for?
          </Text>
          <Text className="text-gray-400 text-center">
            Choose your role to get started
          </Text>
        </View>

        <View className="space-y-4">
          {/* Musician */}
          <Pressable
            onPress={() => handleSelection("musician")}
            className="w-full p-6 bg-[#1a1a1a]/30 border-2 border-purple-500/30 rounded-2xl"
          >
            <View className="flex-row items-center gap-4">
              <View className="p-3 bg-purple-600 rounded-xl">
                <Music size={32} color="white" />
              </View>

              <View className="flex-1">
                <Text className="text-xl font-bold text-white mb-1">
                  I'm a Musician
                </Text>
                <Text className="text-gray-400 text-sm">
                  Looking for a band to join
                </Text>
              </View>
            </View>
          </Pressable>

          {/* Band */}
          <Pressable
            onPress={() => handleSelection("band")}
            className="w-full p-6 bg-[#1a1a1a]/30 border-2 border-pink-500/30 rounded-2xl"
          >
            <View className="flex-row items-center gap-4">
              <View className="p-3 bg-pink-600 rounded-xl">
                <Users size={32} color="white" />
              </View>

              <View className="flex-1">
                <Text className="text-xl font-bold text-white mb-1">
                  I'm a Band
                </Text>
                <Text className="text-gray-400 text-sm">
                  Looking to recruit members
                </Text>
              </View>
            </View>
          </Pressable>
        </View>
      </View>
    </View>
  );
}