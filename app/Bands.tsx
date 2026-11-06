import { useCallback, useEffect, useMemo, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { ArrowLeft, Check, KeyRound, Plus } from "lucide-react-native";

import { useActiveAccount } from "../services/activeAccount";
import {
  BandMembership,
  createBand,
  getMyBandMemberships,
  updateBandLocation,
} from "../services/bands";
import { getApproximateCurrentLocation } from "../services/location";
import { useUser } from "../services/auth";
import { MUSIC_GENRES, normalizeGenre } from "../lib/music";

export default function Bands() {
  const router = useRouter();
  const { user } = useUser();
  const { activeAccount, setActiveAccount } = useActiveAccount(user?.id);
  const [memberships, setMemberships] = useState<BandMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [name, setName] = useState("");
  const [genre, setGenre] = useState("");
  const [genreQuery, setGenreQuery] = useState("");
  const [location, setLocation] = useState("");
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [locating, setLocating] = useState(false);

  const loadBands = useCallback(async () => {
    if (!user) {
      return;
    }

    setLoading(true);
    try {
      setMemberships(await getMyBandMemberships(user.id));
      setError(null);
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Unable to load your bands."
      );
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadBands();
  }, [loadBands]);

  useFocusEffect(
    useCallback(() => {
      loadBands();
    }, [loadBands])
  );

  const matchingGenres = useMemo(
    () =>
      MUSIC_GENRES.filter((item) =>
        normalizeGenre(item).includes(normalizeGenre(genreQuery))
      ),
    [genreQuery]
  );

  const handleCreateBand = async () => {
    if (!name.trim() || !genre || !location.trim()) {
      Alert.alert(
        "Complete the band profile",
        "Band name, genre, and location are required."
      );
      return;
    }

    setCreating(true);
    try {
      const bandId = await createBand({
        name: name.trim(),
        genre,
        location: location.trim(),
        description,
      });
      if (coordinates) {
        await updateBandLocation(bandId, {
          area: location,
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
        });
      }
      await setActiveAccount({ type: "band", bandId });
      setName("");
      setGenre("");
      setGenreQuery("");
      setLocation("");
      setCoordinates(null);
      setDescription("");
      setShowCreateForm(false);
      await loadBands();
      Alert.alert("Band created", "You are now the band leader and active account.");
    } catch (createError) {
      const message =
        createError instanceof Error ? createError.message : "The band could not be created.";
      Alert.alert("Unable to create band", message);
    } finally {
      setCreating(false);
    }
  };

  const useCurrentLocation = async () => {
    setLocating(true);
    try {
      const currentLocation = await getApproximateCurrentLocation();
      setLocation(currentLocation.area);
      setCoordinates({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
      });
    } catch (locationError) {
      Alert.alert(
        "Unable to use location",
        locationError instanceof Error
          ? locationError.message
          : "The band location could not be retrieved."
      );
    } finally {
      setLocating(false);
    }
  };

  const switchToBand = async (bandId: string) => {
    try {
      await setActiveAccount({ type: "band", bandId });
      router.back();
    } catch (switchError) {
      const message =
        switchError instanceof Error ? switchError.message : "Unable to switch accounts.";
      Alert.alert("Unable to switch account", message);
    }
  };

  const switchToMusician = async () => {
    try {
      await setActiveAccount({ type: "musician" });
      router.back();
    } catch (switchError) {
      const message =
        switchError instanceof Error ? switchError.message : "Unable to switch account.";
      Alert.alert("Unable to switch account", message);
    }
  };

  return (
    <ScrollView className="flex-1 bg-[#0a0a0a]" showsVerticalScrollIndicator={false}>
      <View className="pt-14 pb-6 px-6">
        <Pressable onPress={() => router.back()} className="self-start p-2 -ml-2 mb-3">
          <ArrowLeft size={24} color="white" />
        </Pressable>
        <Text className="text-3xl font-bold text-white mb-1">Band Accounts</Text>
        <Text className="text-gray-400">
          Create a band or join one with an invite code from a member.
        </Text>
      </View>

      <View className="px-6 pb-10">
        <Text className="text-sm font-medium text-gray-300 mb-3">Active account</Text>
        <Pressable
          onPress={switchToMusician}
          className={`p-4 rounded-xl border mb-3 ${
            activeAccount.type === "musician"
              ? "bg-purple-600/20 border-purple-500"
              : "bg-[#1a1a1a] border-[#2a2a2a]"
          }`}
        >
          <Text className="text-white font-medium">Musician profile</Text>
          <Text className="text-gray-400 text-sm mt-1">Browse bands and apply to open posts.</Text>
        </Pressable>

        {loading && <Text className="text-gray-400 py-4">Loading band accounts...</Text>}
        {error && <Text className="text-red-400 py-4">{error}</Text>}
        {memberships.map((membership) => (
          <Pressable
            key={membership.bandId}
            onPress={() => switchToBand(membership.bandId)}
            className={`p-4 rounded-xl border mb-3 ${
              activeAccount.type === "band" &&
              activeAccount.bandId === membership.bandId
                ? "bg-pink-600/20 border-pink-500"
                : "bg-[#1a1a1a] border-[#2a2a2a]"
            }`}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-white font-medium">
                  {membership.band?.name ?? "Unnamed band"}
                </Text>
                <Text className="text-gray-400 text-sm mt-1">
                  {membership.isLeader ? "Band Leader" : membership.role ?? "Band member"}
                </Text>
              </View>
              {activeAccount.type === "band" &&
                activeAccount.bandId === membership.bandId && (
                  <Check size={20} color="#ec4899" />
                )}
            </View>
          </Pressable>
        ))}

        <Pressable
          onPress={() => router.push("/JoinBand")}
          className="flex-row items-center justify-center gap-2 py-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl mt-3 mb-3"
        >
          <KeyRound size={20} color="#a855f7" />
          <Text className="text-purple-400 font-semibold">Join with an invite code</Text>
        </Pressable>
        <Pressable
          onPress={() => setShowCreateForm((current) => !current)}
          className="flex-row items-center justify-center gap-2 py-4 bg-purple-600 rounded-xl mb-6"
        >
          <Plus size={20} color="white" />
          <Text className="text-white font-semibold">
            {showCreateForm ? "Cancel band creation" : "Create a band"}
          </Text>
        </Pressable>

        {showCreateForm && (
          <View>
            <Text className="text-xl font-bold text-white mb-4">New band</Text>
            <TextInput value={name} onChangeText={setName} placeholder="Band name" placeholderTextColor="#6b7280" className="px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white mb-3" />
            {genre && (
              <View className="flex-row items-center gap-2 self-start px-3 py-2 bg-purple-600 rounded-full mb-3">
                <Text className="text-white">{genre}</Text>
                <Pressable onPress={() => setGenre("")}>
                  <Text className="text-white font-bold">×</Text>
                </Pressable>
              </View>
            )}
            <TextInput value={genreQuery} onChangeText={setGenreQuery} placeholder="Search band genre" placeholderTextColor="#6b7280" className="px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white mb-3" />
            {genreQuery.trim() && !genre && (
              <View className="flex-row flex-wrap gap-2 mb-3">
                {matchingGenres.map((item) => (
                  <Pressable key={item} onPress={() => { setGenre(item); setGenreQuery(""); }} className="px-3 py-2 bg-[#1a1a1a] rounded-full">
                    <Text className="text-gray-300 text-sm">{item}</Text>
                  </Pressable>
                ))}
              </View>
            )}
            <TextInput value={location} onChangeText={setLocation} placeholder="City or area" placeholderTextColor="#6b7280" className="px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white mb-3" />
            <Pressable onPress={useCurrentLocation} disabled={locating} className="py-3 border border-[#2a2a2a] rounded-xl mb-3">
              <Text className="text-purple-400 text-center font-medium">
                {locating ? "Finding location..." : "Use approximate current location"}
              </Text>
            </Pressable>
            <TextInput value={description} onChangeText={setDescription} multiline textAlignVertical="top" placeholder="Tell musicians about the band" placeholderTextColor="#6b7280" className="h-28 px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white mb-3" />
            <Pressable onPress={handleCreateBand} disabled={creating} className={`py-4 rounded-xl ${creating ? "bg-purple-900" : "bg-purple-600"}`}>
              <Text className="text-white text-center font-semibold">{creating ? "Creating..." : "Create band account"}</Text>
            </Pressable>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
