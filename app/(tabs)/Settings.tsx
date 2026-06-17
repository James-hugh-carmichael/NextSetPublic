import { View, Text, Pressable, ScrollView } from "react-native";
import { ChevronRight, Bell, Lock, HelpCircle, LogOut } from "lucide-react-native";
import { signOut } from "../../services/auth";
import { useRouter } from "expo-router";


export default function Settings() {
  const router = useRouter();
  const handleLogout = async () => {
    const { error } = await signOut();

    if (error) {
      console.log("Logout error:", error.message);
      return;
    }
  };
  const settingsOptions = [
    {
      icon: Bell,
      label: "Notifications",
      description: "Manage your notification preferences",
    },
    {
      icon: Lock,
      label: "Privacy & Security",
      description: "Control your privacy settings",
    },
    {
      icon: HelpCircle,
      label: "Help & Support",
      description: "Get help with BandMatch",
    },
  ];

  return (
    <ScrollView className="flex-1 bg-[#0a0a0a]" showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View className="pt-16 pb-6 px-6 bg-gradient-to-b from-purple-900/30 to-transparent">
        <Text className="text-3xl font-bold text-white mb-1">
          Settings
        </Text>
        <Text className="text-gray-400">
          Manage your account and preferences
        </Text>
      </View>

      <View className="px-6 pb-10">
        {/* Options */}
        <View className="space-y-2 mb-6">
          {settingsOptions.map((option, index) => (
            <Pressable
              key={index}
              className="w-full p-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl flex-row items-center gap-4"
            >
              <View className="p-2 bg-purple-600/20 rounded-lg">
                <option.icon size={20} color="#a855f7" />
              </View>

              <View className="flex-1">
                <Text className="text-white font-medium mb-0.5">
                  {option.label}
                </Text>
                <Text className="text-sm text-gray-500">
                  {option.description}
                </Text>
              </View>

              <ChevronRight size={20} color="#6b7280" />
            </Pressable>
          ))}
        </View>

        {/* Account */}
        <View className="space-y-3 mb-6">
          <Text className="text-lg font-bold text-white px-2">
            Account
          </Text>

          <View className="w-full p-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl flex-row justify-between">
            <Text className="text-white font-medium">
              Account Type
            </Text>
            <Text className="text-gray-400 text-sm">
              Musician
            </Text>
          </View>

          <View className="w-full p-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl flex-row justify-between">
            <Text className="text-white font-medium">Email</Text>
            <Text className="text-gray-400 text-sm">
              alex@email.com
            </Text>
          </View>
        </View>

        {/* About */}
        <View className="space-y-3">
          <Text className="text-lg font-bold text-white px-2">
            About
          </Text>

          <Pressable className="w-full p-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl flex-row justify-between items-center">
            <Text className="text-white font-medium">
              Terms of Service
            </Text>
            <ChevronRight size={20} color="#6b7280" />
          </Pressable>

          <Pressable className="w-full p-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl flex-row justify-between items-center">
            <Text className="text-white font-medium">
              Privacy Policy
            </Text>
            <ChevronRight size={20} color="#6b7280" />
          </Pressable>

          <View className="w-full p-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl flex-row justify-between items-center">
            <Text className="text-white font-medium">Version</Text>
            <Text className="text-gray-400 text-sm">1.0.0</Text>
          </View>
        </View>

        {/* Logout */}
        <Pressable onPress={handleLogout} className="w-full mt-8 p-4 bg-red-600/20 border border-red-500/30 rounded-xl flex-row justify-center items-center gap-2">
          <LogOut size={20} color="#ef4444" />
          <Text className="text-red-500 font-medium">
            Log Out
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}