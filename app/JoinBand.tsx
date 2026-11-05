import { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Alert, Pressable, Text, TextInput, View } from "react-native";
import { ArrowLeft, KeyRound } from "lucide-react-native";

import { useActiveAccount } from "../services/activeAccount";
import { joinBandWithInvite } from "../services/bands";
import { useUser } from "../services/auth";

export default function JoinBand() {
  const router = useRouter();
  const { code: inviteCode } = useLocalSearchParams<{ code?: string }>();
  const { user } = useUser();
  const { setActiveAccount } = useActiveAccount(user?.id);
  const [code, setCode] = useState(inviteCode ?? "");
  const [role, setRole] = useState("");
  const [joining, setJoining] = useState(false);

  const handleJoin = async () => {
    if (!code.trim()) {
      Alert.alert("Invite code required", "Enter the code shared by a band member.");
      return;
    }

    setJoining(true);
    try {
      const bandId = await joinBandWithInvite(code, role);
      await setActiveAccount({ type: "band", bandId });
      router.replace("/(tabs)/Profile");
    } catch (joinError) {
      const message =
        joinError instanceof Error ? joinError.message : "Unable to join this band.";
      Alert.alert("Unable to join band", message);
    } finally {
      setJoining(false);
    }
  };

  return (
    <View className="flex-1 bg-[#0a0a0a] px-6 pt-14">
      <Pressable onPress={() => router.back()} className="self-start p-2 -ml-2 mb-5">
        <ArrowLeft size={24} color="white" />
      </Pressable>
      <View className="w-16 h-16 rounded-2xl bg-purple-600/20 items-center justify-center mb-6">
        <KeyRound size={30} color="#a855f7" />
      </View>
      <Text className="text-3xl font-bold text-white mb-2">Join a band</Text>
      <Text className="text-gray-400 mb-8">
        Enter the invite code shared by a confirmed band member.
      </Text>
      <Text className="text-sm font-medium text-gray-300 mb-2">Invite code</Text>
      <TextInput value={code} onChangeText={setCode} autoCapitalize="characters" placeholder="XXXXXXXXXX" placeholderTextColor="#6b7280" className="px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white mb-4 tracking-widest" />
      <Text className="text-sm font-medium text-gray-300 mb-2">Your role in the band (optional)</Text>
      <TextInput value={role} onChangeText={setRole} placeholder="e.g. Bass" placeholderTextColor="#6b7280" className="px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white mb-8" />
      <Pressable onPress={handleJoin} disabled={joining} className={`py-4 rounded-xl ${joining ? "bg-purple-900" : "bg-purple-600"}`}>
        <Text className="text-white text-center font-semibold">{joining ? "Joining..." : "Join band"}</Text>
      </Pressable>
    </View>
  );
}
