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
import { ArrowLeft, MapPin, Pencil, Plus, Users } from "lucide-react-native";

import { useActiveAccount } from "../services/activeAccount";
import { useUser } from "../services/auth";
import { BandPost, getBandPostsForBand, parseRoles } from "../services/bandPosts";
import { createBandPost, updateBandPost } from "../services/bands";

const commitmentOptions = ["Casual", "Part-time", "Full-time", "Professional"];

export default function BandPosts() {
  const router = useRouter();
  const { user } = useUser();
  const { activeAccount } = useActiveAccount(user?.id);
  const bandId = activeAccount.type === "band" ? activeAccount.bandId : null;
  const [posts, setPosts] = useState<BandPost[]>([]);
  const [showComposer, setShowComposer] = useState(false);
  const [editingPost, setEditingPost] = useState<BandPost | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [rolesNeeded, setRolesNeeded] = useState("");
  const [commitment, setCommitment] = useState("");
  const [isOpen, setIsOpen] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadPosts = useCallback(async () => {
    if (!bandId) {
      setPosts([]);
      return;
    }

    try {
      setPosts(await getBandPostsForBand(bandId));
    } catch (loadError) {
      Alert.alert(
        "Unable to load posts",
        loadError instanceof Error ? loadError.message : "The posts could not be loaded."
      );
    }
  }, [bandId]);

  useEffect(() => {
    void loadPosts();
  }, [loadPosts]);

  useFocusEffect(
    useCallback(() => {
      void loadPosts();
    }, [loadPosts])
  );

  const resetComposer = () => {
    setEditingPost(null);
    setTitle("");
    setDescription("");
    setRolesNeeded("");
    setCommitment("");
    setIsOpen(true);
    setShowComposer(false);
  };

  const startEditing = (post: BandPost) => {
    setEditingPost(post);
    setTitle(post.title ?? "");
    setDescription(post.description ?? "");
    setRolesNeeded(parseRoles(post.roles_needed).join(", "));
    setCommitment(post.commitment_level ?? "");
    setIsOpen(post.is_open !== false);
    setShowComposer(true);
  };

  const savePost = async () => {
    if (!bandId || !title.trim()) {
      Alert.alert("Title required", "Add a title for the recruitment post.");
      return;
    }

    const roles = rolesNeeded
      .split(",")
      .map((role) => role.trim())
      .filter(Boolean);

    setSaving(true);
    try {
      if (editingPost) {
        await updateBandPost({
          postId: editingPost.id,
          title,
          description,
          rolesNeeded: roles,
          commitmentLevel: commitment,
          isOpen,
        });
      } else {
        await createBandPost({
          bandId,
          title,
          description,
          rolesNeeded: roles,
          commitmentLevel: commitment,
        });
      }

      resetComposer();
      await loadPosts();
    } catch (saveError) {
      const message =
        saveError instanceof Error ? saveError.message : "The post could not be saved.";
      Alert.alert("Unable to save post", message);
    } finally {
      setSaving(false);
    }
  };

  if (!bandId) {
    return (
      <View className="flex-1 items-center justify-center bg-[#0a0a0a] px-6">
        <Text className="text-gray-400 text-center">
          Switch to a band account to manage its posts.
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
        <Text className="text-3xl font-bold text-white mb-1">Band Posts</Text>
        <Text className="text-gray-400">Your live recruitment opportunities.</Text>
      </View>

      <View className="px-4 pb-10">
        <Pressable
          onPress={() => (showComposer ? resetComposer() : setShowComposer(true))}
          className="flex-row items-center justify-center gap-2 py-4 bg-pink-600 rounded-xl mb-6 mx-2"
        >
          <Plus size={20} color="white" />
          <Text className="text-white font-semibold">
            {showComposer ? "Cancel" : "Create recruitment post"}
          </Text>
        </Pressable>

        {showComposer && (
          <View className="mx-2 mb-8">
            <Text className="text-xl font-bold text-white mb-3">
              {editingPost ? "Edit post" : "New post"}
            </Text>
            <TextInput value={title} onChangeText={setTitle} placeholder="Post title" placeholderTextColor="#6b7280" className="px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white mb-3" />
            <TextInput value={description} onChangeText={setDescription} multiline textAlignVertical="top" placeholder="Describe who the band is looking for" placeholderTextColor="#6b7280" className="h-28 px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white mb-3" />
            <TextInput value={rolesNeeded} onChangeText={setRolesNeeded} placeholder="Roles needed, separated by commas" placeholderTextColor="#6b7280" className="px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white mb-3" />
            <View className="flex-row flex-wrap gap-2 mb-4">
              {commitmentOptions.map((option) => (
                <Pressable key={option} onPress={() => setCommitment((current) => current === option ? "" : option)} className={`px-4 py-2 rounded-full ${commitment === option ? "bg-pink-600" : "bg-[#1a1a1a]"}`}>
                  <Text className={commitment === option ? "text-white" : "text-gray-400"}>{option}</Text>
                </Pressable>
              ))}
            </View>
            {editingPost && (
              <Pressable onPress={() => setIsOpen((current) => !current)} className="self-start px-4 py-2 rounded-full bg-[#1a1a1a] mb-4">
                <Text className={isOpen ? "text-pink-400" : "text-gray-400"}>
                  {isOpen ? "Open opportunity" : "Closed opportunity"}
                </Text>
              </Pressable>
            )}
            <Pressable onPress={savePost} disabled={saving} className={`py-4 rounded-xl ${saving ? "bg-pink-900" : "bg-pink-600"}`}>
              <Text className="text-white text-center font-semibold">
                {saving ? "Saving..." : editingPost ? "Save changes" : "Publish post"}
              </Text>
            </Pressable>
          </View>
        )}

        <Text className="text-xl font-bold text-white mb-3 px-2">Your posts</Text>
        {posts.length === 0 ? (
          <Text className="text-gray-400 px-2">No recruitment posts yet.</Text>
        ) : (
          posts.map((post) => {
            const band = post.band;
            const roles = parseRoles(post.roles_needed);

            return (
              <View key={post.id} className="bg-[#1a1a1a] rounded-2xl overflow-hidden border border-[#2a2a2a] mb-4">
                {band?.image_url && (
                  <View className="relative h-48">
                    <Image source={{ uri: band.image_url }} className="w-full h-full" />
                    <View className="absolute inset-0 bg-black/50" />
                    <View className="absolute bottom-4 left-4 right-4">
                      <Text className="text-xl font-bold text-white mb-1">{band.name ?? "Unnamed band"}</Text>
                      <View className="flex-row items-center gap-2">
                        {band.genre && <View className="px-2 py-1 bg-purple-600 rounded-full"><Text className="text-white text-xs font-medium">{band.genre}</Text></View>}
                        {band.location && <View className="flex-row items-center gap-1"><MapPin size={12} color="#ccc" /><Text className="text-gray-300 text-xs">{band.location}</Text></View>}
                      </View>
                    </View>
                  </View>
                )}
                <View className="p-4">
                  {!band?.image_url && <Text className="text-xl font-bold text-white mb-2">{band?.name ?? "Unnamed band"}</Text>}
                  <View className="flex-row items-start justify-between gap-3">
                    <Text className="text-white font-medium flex-1">{post.title ?? "Band opportunity"}</Text>
                    <Text className={post.is_open ? "text-pink-400 text-sm" : "text-gray-500 text-sm"}>{post.is_open ? "Open" : "Closed"}</Text>
                  </View>
                  {post.description && <Text className="text-gray-400 text-sm mt-2 mb-3">{post.description}</Text>}
                  {post.commitment_level && <View className="flex-row items-center gap-2 mb-3"><Users size={16} color="#9ca3af" /><Text className="text-gray-400 text-sm">{post.commitment_level} commitment</Text></View>}
                  {roles.length > 0 && <View className="flex-row flex-wrap gap-2 mb-4">{roles.map((role) => <View key={role} className="px-3 py-1 bg-pink-600/20 border border-pink-500/30 rounded-full"><Text className="text-pink-400 text-xs font-medium">{role}</Text></View>)}</View>}
                  <Pressable onPress={() => startEditing(post)} className="flex-row items-center justify-center gap-2 py-3 bg-[#2a2a2a] rounded-xl">
                    <Pencil size={16} color="white" />
                    <Text className="text-white font-medium">Edit post</Text>
                  </Pressable>
                </View>
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}
