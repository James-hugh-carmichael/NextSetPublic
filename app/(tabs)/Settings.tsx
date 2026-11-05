import { useCallback, useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, Share, Text, View } from "react-native";
import { ChevronRight, LogOut, Users } from "lucide-react-native";
import { useFocusEffect, useRouter } from "expo-router";

import { useActiveAccount } from "../../services/activeAccount";
import {
  getBandInviteCode,
  rotateBandInviteCode,
  useBandMemberships,
} from "../../services/bands";
import { signOut, useUser } from "../../services/auth";

export default function Settings() {
  const { user } = useUser();
  const router = useRouter();
  const { activeAccount, refresh: refreshActiveAccount } = useActiveAccount(user?.id);
  const { memberships, refresh: refreshMemberships } = useBandMemberships(user?.id);
  const activeBand =
    activeAccount.type === "band"
      ? memberships.find((membership) => membership.bandId === activeAccount.bandId)
      : null;
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [rotatingInvite, setRotatingInvite] = useState(false);

  useFocusEffect(
    useCallback(() => {
      refreshActiveAccount();
      refreshMemberships();
    }, [refreshActiveAccount, refreshMemberships])
  );

  useEffect(() => {
    if (activeAccount.type !== "band" || !activeBand?.isLeader) {
      setInviteCode(null);
      setInviteError(null);
      return;
    }

    getBandInviteCode(activeAccount.bandId)
      .then((code) => {
        setInviteCode(code);
        setInviteError(null);
      })
      .catch((loadError) => {
        setInviteError(
          loadError instanceof Error ? loadError.message : "Unable to load the invite code."
        );
      });
  }, [activeAccount, activeBand?.isLeader]);

  const handleLogout = async () => {
    const { error } = await signOut();
    if (error) {
      Alert.alert("Unable to log out", error.message);
    }
  };

  const shareInvite = async () => {
    if (!inviteCode || !activeBand?.band) {
      return;
    }

    await Share.share({
      message: `Join ${activeBand.band.name ?? "our band"} on NextSet: nextsetexpo://JoinBand?code=${inviteCode}\nInvite code: ${inviteCode}`,
    });
  };

  const rotateInvite = async () => {
    if (activeAccount.type !== "band") {
      return;
    }

    setRotatingInvite(true);
    try {
      setInviteCode(await rotateBandInviteCode(activeAccount.bandId));
      setInviteError(null);
    } catch (rotateError) {
      const message =
        rotateError instanceof Error
          ? rotateError.message
          : "The invite code could not be rotated.";
      Alert.alert("Unable to rotate invite code", message);
    } finally {
      setRotatingInvite(false);
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
            <Text className="text-gray-400 text-sm">
              {activeBand?.band?.name ?? "Musician"}
            </Text>
          </View>
          <View className="p-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl flex-row justify-between">
            <Text className="text-white font-medium">Email</Text>
            <Text className="text-gray-400 text-sm">{user?.email ?? "Unavailable"}</Text>
          </View>

          <Pressable onPress={() => router.push("/Bands")} className="p-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl mb-6 flex-row items-center">
            <View className="flex-1">
              <Text className="text-white font-medium">Band Accounts</Text>
              <Text className="text-gray-500 text-sm mt-1">Create, join, and switch accounts</Text>
            </View>
            <ChevronRight size={20} color="#6b7280" />
          </Pressable>
        </View>

        {activeAccount.type === "band" && activeBand?.isLeader && (
          <View className="mb-6">
            <Text className="text-lg font-bold text-white px-2 mb-3">Band settings</Text>
            <View className="p-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl">
              <Text className="text-white font-medium mb-1">Invite code</Text>
              <Text className="text-gray-500 text-sm mb-4">
                Share this privately with musicians you want to add.
              </Text>
              {inviteError && <Text className="text-red-400 mb-3">{inviteError}</Text>}
              {inviteCode && (
                <>
                  <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-xl font-bold tracking-widest text-white">{inviteCode}</Text>
                    <Pressable onPress={shareInvite} className="px-3 py-2 bg-purple-600 rounded-lg">
                      <Text className="text-white font-medium">Share</Text>
                    </Pressable>
                  </View>
                  {activeBand.isLeader && (
                    <Pressable onPress={rotateInvite} disabled={rotatingInvite} className="self-start px-3 py-2 border border-[#3a3a3a] rounded-lg">
                      <Text className="text-pink-400 font-medium">
                        {rotatingInvite ? "Rotating..." : "Rotate code"}
                      </Text>
                    </Pressable>
                  )}
                </>
              )}
            </View>
            <Pressable onPress={() => router.push("/BandMembers")} className="p-4 mt-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl flex-row items-center">
              <View className="flex-1">
                <Text className="text-white font-medium">Manage members</Text>
                <Text className="text-gray-500 text-sm mt-1">View members, update roles, and remove access.</Text>
              </View>
              <Users size={20} color="#a855f7" />
            </Pressable>
          </View>
        )}

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
