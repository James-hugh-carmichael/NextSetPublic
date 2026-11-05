import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { LogOut } from "lucide-react-native";

import { signOut, useUser } from "../../services/auth";

export default function Settings() {
  const { user } = useUser();

  const handleLogout = async () => {
    const { error } = await signOut();
    if (error) {
      Alert.alert("Unable to log out", error.message);
    }
  };

  return (
    <ScrollView className="flex-1 bg-[#0a0a0a]" showsVerticalScrollIndicator={false}>
      <View className="pt-16 pb-6 px-6 bg-gradient-to-b from-purple-900/30 to-transparent">
        <Text className="text-3xl font-bold text-white mb-1">Settings</Text>
        <Text className="text-gray-400">Manage your account</Text>
      </View>

      <View className="px-6 pb-10">
        <View className="mb-6">
          <Text className="text-lg font-bold text-white px-2 mb-3">Account</Text>
          <View className="p-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl mb-2 flex-row justify-between">
            <Text className="text-white font-medium">Account Type</Text>
            <Text className="text-gray-400 text-sm">Musician</Text>
          </View>
          <View className="p-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl flex-row justify-between">
            <Text className="text-white font-medium">Email</Text>
            <Text className="text-gray-400 text-sm">{user?.email ?? "Unavailable"}</Text>
          </View>
        </View>

        <View className="p-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl mb-6">
          <Text className="text-white font-medium mb-1">More settings are coming soon</Text>
          <Text className="text-gray-500 text-sm">
            Notification, privacy, and support settings need their own persisted configuration before they can be enabled.
          </Text>
        </View>

        <Pressable onPress={handleLogout} className="w-full mt-2 p-4 bg-red-600/20 border border-red-500/30 rounded-xl flex-row justify-center items-center gap-2">
          <LogOut size={20} color="#ef4444" />
          <Text className="text-red-500 font-medium">Log Out</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
