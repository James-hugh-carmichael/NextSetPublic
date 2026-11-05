import { useCallback, useEffect, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { ArrowLeft, Save, Trash2 } from "lucide-react-native";

import { useActiveAccount } from "../services/activeAccount";
import { useUser } from "../services/auth";
import {
  BandMember,
  getBandMembers,
  removeBandMember,
  updateBandMember,
  useBandMemberships,
} from "../services/bands";

export default function BandMembers() {
  const router = useRouter();
  const { user } = useUser();
  const { activeAccount } = useActiveAccount(user?.id);
  const bandId = activeAccount.type === "band" ? activeAccount.bandId : null;
  const { memberships, loading: membershipsLoading } = useBandMemberships(user?.id);
  const membership = memberships.find((item) => item.bandId === bandId);
  const [members, setMembers] = useState<BandMember[]>([]);
  const [roles, setRoles] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [savingMemberId, setSavingMemberId] = useState<string | null>(null);

  const loadMembers = useCallback(async () => {
    if (!bandId) {
      setMembers([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const memberList = await getBandMembers(bandId);
      setMembers(memberList);
      setRoles(
        Object.fromEntries(memberList.map((member) => [member.userId, member.role ?? ""]))
      );
    } catch (loadError) {
      Alert.alert(
        "Unable to load members",
        loadError instanceof Error ? loadError.message : "The members could not be loaded."
      );
    } finally {
      setLoading(false);
    }
  }, [bandId]);

  useEffect(() => {
    void loadMembers();
  }, [loadMembers]);

  useFocusEffect(
    useCallback(() => {
      void loadMembers();
    }, [loadMembers])
  );

  const saveRole = async (member: BandMember) => {
    if (!bandId) {
      return;
    }

    setSavingMemberId(member.userId);
    try {
      await updateBandMember(bandId, member.userId, roles[member.userId] ?? "");
      await loadMembers();
    } catch (saveError) {
      Alert.alert(
        "Unable to update member",
        saveError instanceof Error ? saveError.message : "The member could not be updated."
      );
    } finally {
      setSavingMemberId(null);
    }
  };

  const confirmRemove = (member: BandMember) => {
    if (!bandId) {
      return;
    }

    Alert.alert(
      `Remove ${member.name ?? "member"}?`,
      "They will no longer be able to access this band account.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            void (async () => {
              setSavingMemberId(member.userId);
              try {
                await removeBandMember(bandId, member.userId);
                await loadMembers();
              } catch (removeError) {
                Alert.alert(
                  "Unable to remove member",
                  removeError instanceof Error
                    ? removeError.message
                    : "The member could not be removed."
                );
              } finally {
                setSavingMemberId(null);
              }
            })();
          },
        },
      ]
    );
  };

  if (!bandId || membershipsLoading || loading) {
    return <View className="flex-1 bg-[#0a0a0a]" />;
  }

  if (!membership?.isLeader) {
    return (
      <View className="flex-1 items-center justify-center bg-[#0a0a0a] px-6">
        <Text className="text-gray-400 text-center">
          Only the band leader can manage members.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-[#0a0a0a]" showsVerticalScrollIndicator={false}>
      <View className="pt-14 pb-6 px-6">
        <Pressable onPress={() => router.back()} className="self-start p-2 -ml-2 mb-3">
          <ArrowLeft size={24} color="white" />
        </Pressable>
        <Text className="text-3xl font-bold text-white mb-1">Band Members</Text>
        <Text className="text-gray-400">Update roles or remove members from the band.</Text>
      </View>

      <View className="px-6 pb-10">
        {members.map((member) => (
          <View key={member.userId} className="p-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl mb-3">
            <View className="flex-row items-center mb-4">
              {member.avatarUrl ? (
                <Image source={{ uri: member.avatarUrl }} className="w-12 h-12 rounded-full mr-3" />
              ) : (
                <View className="w-12 h-12 rounded-full mr-3 bg-purple-900 items-center justify-center">
                  <Text className="text-white font-bold">
                    {member.name?.trim().charAt(0).toUpperCase() ?? "?"}
                  </Text>
                </View>
              )}
              <View className="flex-1">
                <Text className="text-white font-semibold">{member.name ?? "Band member"}</Text>
                <Text className="text-gray-400 text-sm">
                  {member.isLeader ? "Band leader" : "Band member"}
                </Text>
              </View>
            </View>

            {member.isLeader ? (
              <Text className="text-purple-400">Band Leader</Text>
            ) : (
              <>
                <TextInput
                  value={roles[member.userId] ?? ""}
                  onChangeText={(role) => setRoles((current) => ({ ...current, [member.userId]: role }))}
                  placeholder="Member role, e.g. Drummer"
                  placeholderTextColor="#6b7280"
                  className="px-4 py-3 bg-[#101010] border border-[#2a2a2a] rounded-xl text-white mb-3"
                />
                <View className="flex-row gap-2">
                  <Pressable onPress={() => saveRole(member)} disabled={savingMemberId === member.userId} className="flex-1 flex-row items-center justify-center gap-2 py-3 bg-purple-600 rounded-xl">
                    <Save size={16} color="white" />
                    <Text className="text-white font-medium">Save role</Text>
                  </Pressable>
                  <Pressable onPress={() => confirmRemove(member)} disabled={savingMemberId === member.userId} className="px-4 py-3 border border-red-500/60 rounded-xl">
                    <Trash2 size={18} color="#f87171" />
                  </Pressable>
                </View>
              </>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
