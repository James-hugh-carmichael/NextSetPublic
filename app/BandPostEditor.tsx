import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { ArrowLeft, Trash2 } from "lucide-react-native";

import { useActiveAccount } from "../services/activeAccount";
import { useUser } from "../services/auth";
import { getBandPost, parseRoles } from "../services/bandPosts";
import { deleteBandPost, updateBandPost } from "../services/bands";
import { getApproximateLocationByName } from "../services/location";

const commitmentOptions = ["Casual", "Part-time", "Full-time", "Professional"];

export default function BandPostEditor() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useUser();
  const { activeAccount } = useActiveAccount(user?.id);
  const bandId = activeAccount.type === "band" ? activeAccount.bandId : null;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [rolesNeeded, setRolesNeeded] = useState("");
  const [commitment, setCommitment] = useState("");
  const [isOpen, setIsOpen] = useState(true);
  const [location, setLocation] = useState("");
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    if (!id || !bandId) {
      setLoading(false);
      setError(!bandId ? "Switch to the band account that owns this post to edit it." : "This post could not be found.");
      return;
    }

    getBandPost(id)
      .then((post) => {
        if (!post || post.band_id !== bandId) {
          setError("This post is not part of the active band account.");
          return;
        }

        setTitle(post.title ?? "");
        setDescription(post.description ?? "");
        setRolesNeeded(parseRoles(post.roles_needed).join(", "));
        setCommitment(post.commitment_level ?? "");
        setIsOpen(post.is_open !== false);
        setLocation(post.location ?? post.band?.location ?? "");
        const postBand = post.band;
        setCoordinates(
          post.latitude !== null && post.longitude !== null
            ? { latitude: post.latitude, longitude: post.longitude }
            : postBand && postBand.latitude !== null && postBand.longitude !== null
              ? { latitude: postBand.latitude, longitude: postBand.longitude }
              : null
        );
      })
      .catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : "The post could not be loaded.");
      })
      .finally(() => setLoading(false));
  }, [bandId, id]);

  const lookUpLocation = async () => {
    setLocating(true);
    try {
      const approximateLocation = await getApproximateLocationByName(location);
      setLocation(approximateLocation.area);
      setCoordinates({
        latitude: approximateLocation.latitude,
        longitude: approximateLocation.longitude,
      });
    } catch (locationError) {
      Alert.alert(
        "Unable to look up location",
        locationError instanceof Error ? locationError.message : "That location could not be found."
      );
    } finally {
      setLocating(false);
    }
  };

  const savePost = async () => {
    if (!id || !title.trim()) {
      Alert.alert("Title required", "Add a title for the recruitment post.");
      return;
    }

    setSaving(true);
    try {
      await updateBandPost({
        postId: id,
        title,
        description,
        rolesNeeded: rolesNeeded.split(",").map((role) => role.trim()).filter(Boolean),
        commitmentLevel: commitment,
        isOpen,
        location,
        latitude: coordinates?.latitude ?? null,
        longitude: coordinates?.longitude ?? null,
      });
      router.back();
    } catch (saveError) {
      Alert.alert(
        "Unable to save post",
        saveError instanceof Error ? saveError.message : "The post could not be saved."
      );
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      "Delete recruitment post?",
      "This will permanently remove the post and its applications.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete post",
          style: "destructive",
          onPress: () => void deletePost(),
        },
      ]
    );
  };

  const deletePost = async () => {
    if (!id) {
      return;
    }

    setDeleting(true);
    try {
      await deleteBandPost(id);
      router.replace("/BandPosts");
    } catch (deleteError) {
      Alert.alert(
        "Unable to delete post",
        deleteError instanceof Error ? deleteError.message : "The post could not be deleted."
      );
      setDeleting(false);
    }
  };

  if (loading) {
    return <View className="flex-1 bg-[#0a0a0a]" />;
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-[#0a0a0a] px-6">
        <Text className="text-gray-400 text-center mb-5">{error}</Text>
        <Pressable onPress={() => router.back()} className="px-5 py-3 bg-[#1a1a1a] rounded-xl">
          <Text className="text-white font-medium">Go back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-[#0a0a0a]" showsVerticalScrollIndicator={false}>
      <View className="pt-14 pb-6 px-6">
        <Pressable onPress={() => router.back()} className="self-start p-2 -ml-2 mb-3">
          <ArrowLeft size={24} color="white" />
        </Pressable>
        <Text className="text-3xl font-bold text-white mb-1">Edit post</Text>
        <Text className="text-gray-400">Update this recruitment opportunity.</Text>
      </View>

      <View className="px-6 pb-10">
        <TextInput value={title} onChangeText={setTitle} placeholder="Post title" placeholderTextColor="#6b7280" className="px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white mb-3" />
        <TextInput value={description} onChangeText={setDescription} multiline textAlignVertical="top" placeholder="Describe who the band is looking for" placeholderTextColor="#6b7280" className="h-28 px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white mb-3" />
        <TextInput value={rolesNeeded} onChangeText={setRolesNeeded} placeholder="Roles needed, separated by commas" placeholderTextColor="#6b7280" className="px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white mb-3" />
        <TextInput value={location} onChangeText={(value) => { setLocation(value); setCoordinates(null); }} placeholder="Gig location" placeholderTextColor="#6b7280" className="px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white mb-3" />
        <Pressable onPress={lookUpLocation} disabled={locating || !location.trim()} className="py-3 border border-[#2a2a2a] rounded-xl mb-4">
          <Text className="text-purple-400 text-center font-medium">{locating ? "Looking up location..." : "Use this gig location"}</Text>
        </Pressable>

        <View className="flex-row flex-wrap gap-2 mb-4">
          {commitmentOptions.map((option) => (
            <Pressable key={option} onPress={() => setCommitment((current) => current === option ? "" : option)} className={`px-4 py-2 rounded-full ${commitment === option ? "bg-pink-600" : "bg-[#1a1a1a]"}`}>
              <Text className={commitment === option ? "text-white" : "text-gray-400"}>{option}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable onPress={() => setIsOpen((current) => !current)} className="self-start px-4 py-2 rounded-full bg-[#1a1a1a] mb-4">
          <Text className={isOpen ? "text-pink-400" : "text-gray-400"}>
            {isOpen ? "Open opportunity" : "Closed opportunity"}
          </Text>
        </Pressable>

        <Pressable onPress={savePost} disabled={saving || deleting} className={`py-4 rounded-xl mb-4 ${saving ? "bg-pink-900" : "bg-pink-600"}`}>
          <Text className="text-white text-center font-semibold">{saving ? "Saving..." : "Save changes"}</Text>
        </Pressable>
        <Pressable onPress={confirmDelete} disabled={saving || deleting} className="flex-row items-center justify-center gap-2 py-4 border border-red-500/60 rounded-xl">
          <Trash2 size={18} color="#f87171" />
          <Text className="text-red-400 font-semibold">{deleting ? "Deleting..." : "Delete post"}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
