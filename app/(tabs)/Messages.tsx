import { MessageCircle } from "lucide-react-native";
import { Text, View } from "react-native";

export default function Messages() {
  return (
    <View className="flex-1 items-center justify-center bg-[#0a0a0a] px-8">
      <View className="w-16 h-16 items-center justify-center rounded-full bg-purple-600/20 mb-5">
        <MessageCircle size={30} color="#a855f7" />
      </View>
      <Text className="text-xl font-bold text-white mb-2">Messages are coming soon</Text>
      <Text className="text-center text-gray-400">
        Conversations will appear here once messaging is connected to its Supabase schema.
      </Text>
    </View>
  );
}
