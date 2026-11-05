import { useEffect, useMemo, useState } from "react";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as VideoThumbnails from "expo-video-thumbnails";
import {
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { ArrowLeft, Camera, Pencil, Plus, Trash2, Upload, X } from "lucide-react-native";

import { useActiveAccount } from "../services/activeAccount";
import { useUser } from "../services/auth";
import {
  BandRosterMember,
  addBandRosterMember,
  deleteBand,
  getBandRosterMembers,
  removeBandRosterMember,
  updateBand,
  updateBandRosterMember,
  useBand,
  useBandMemberships,
} from "../services/bands";
import { MUSIC_GENRES, normalizeGenre } from "../lib/music";
import { uploadProfileMedia } from "../services/media";
import { parseStoredVideos, ProfileVideo } from "../services/musicians";

export default function BandSetup() {
  const router = useRouter();
  const { user } = useUser();
  const { activeAccount, setActiveAccount } = useActiveAccount(user?.id);
  const bandId = activeAccount.type === "band" ? activeAccount.bandId : undefined;
  const { band, loading: bandLoading } = useBand(bandId);
  const { memberships, loading: membershipsLoading } = useBandMemberships(user?.id);
  const membership = memberships.find((item) => item.bandId === bandId);
  const [name, setName] = useState("");
  const [genre, setGenre] = useState("");
  const [genreQuery, setGenreQuery] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [videos, setVideos] = useState<ProfileVideo[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [rosterMembers, setRosterMembers] = useState<BandRosterMember[]>([]);
  const [showRosterForm, setShowRosterForm] = useState(false);
  const [editingRosterMember, setEditingRosterMember] = useState<BandRosterMember | null>(null);
  const [rosterName, setRosterName] = useState("");
  const [rosterRole, setRosterRole] = useState("");
  const [rosterImageUrl, setRosterImageUrl] = useState<string | null>(null);
  const [savingRoster, setSavingRoster] = useState(false);
  const [uploadingRosterImage, setUploadingRosterImage] = useState(false);

  useEffect(() => {
    if (!band) {
      return;
    }

    setName(band.name ?? "");
    setGenre(band.genre ?? "");
    setLocation(band.location ?? "");
    setDescription(band.description ?? "");
    setImageUrl(band.image_url);
    setVideos(parseStoredVideos(band.videos));
  }, [band]);

  const loadRoster = async () => {
    if (!bandId) {
      setRosterMembers([]);
      return;
    }

    try {
      setRosterMembers(await getBandRosterMembers(bandId));
    } catch (loadError) {
      Alert.alert(
        "Unable to load band members",
        loadError instanceof Error ? loadError.message : "The visual roster could not be loaded."
      );
    }
  };

  useEffect(() => {
    void loadRoster();
  }, [bandId]);

  const matchingGenres = useMemo(
    () =>
      MUSIC_GENRES.filter((item) =>
        normalizeGenre(item).includes(normalizeGenre(genreQuery))
      ),
    [genreQuery]
  );

  const requestMediaPermission = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.granted) {
      return true;
    }

    Alert.alert("Media access needed", "Allow photo library access to upload media.");
    return false;
  };

  const uploadImage = async () => {
    if (!user || !(await requestMediaPermission())) {
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled) {
      return;
    }

    setUploading(true);
    try {
      setImageUrl(await uploadProfileMedia(user.id, result.assets[0], "avatar"));
    } catch (uploadError) {
      const message =
        uploadError instanceof Error ? uploadError.message : "The image could not be uploaded.";
      Alert.alert("Unable to upload image", message);
    } finally {
      setUploading(false);
    }
  };

  const uploadVideo = async () => {
    if (!user || videos.length >= 3 || !(await requestMediaPermission())) {
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["videos"],
      videoMaxDuration: 180,
    });
    if (result.canceled) {
      return;
    }

    setUploading(true);
    try {
      const videoUrl = await uploadProfileMedia(user.id, result.assets[0], "video");
      let thumbnailUrl: string | null = null;

      if (Platform.OS !== "web") {
        try {
          const thumbnail = await VideoThumbnails.getThumbnailAsync(result.assets[0].uri, {
            time: 1000,
            quality: 0.6,
          });
          thumbnailUrl = await uploadProfileMedia(
            user.id,
            {
              uri: thumbnail.uri,
              fileName: `band-video-thumbnail-${Date.now()}.jpg`,
              mimeType: "image/jpeg",
            },
            "video-thumbnail"
          );
        } catch {
          Alert.alert("Thumbnail unavailable", "The video uploaded without a thumbnail.");
        }
      }

      setVideos((current) => [...current, { url: videoUrl, thumbnailUrl }]);
    } catch (uploadError) {
      const message =
        uploadError instanceof Error ? uploadError.message : "The video could not be uploaded.";
      Alert.alert("Unable to upload video", message);
    } finally {
      setUploading(false);
    }
  };

  const resetRosterForm = () => {
    setEditingRosterMember(null);
    setRosterName("");
    setRosterRole("");
    setRosterImageUrl(null);
    setShowRosterForm(false);
  };

  const editRosterMember = (member: BandRosterMember) => {
    setEditingRosterMember(member);
    setRosterName(member.name);
    setRosterRole(member.role ?? "");
    setRosterImageUrl(member.imageUrl);
    setShowRosterForm(true);
  };

  const uploadRosterImage = async () => {
    if (!user || !(await requestMediaPermission())) {
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled) {
      return;
    }

    setUploadingRosterImage(true);
    try {
      setRosterImageUrl(await uploadProfileMedia(user.id, result.assets[0], "avatar"));
    } catch (uploadError) {
      Alert.alert(
        "Unable to upload photo",
        uploadError instanceof Error ? uploadError.message : "The photo could not be uploaded."
      );
    } finally {
      setUploadingRosterImage(false);
    }
  };

  const saveRosterMember = async () => {
    if (!bandId || !rosterName.trim()) {
      Alert.alert("Name required", "Add your bandmate's name.");
      return;
    }

    setSavingRoster(true);
    try {
      if (editingRosterMember) {
        await updateBandRosterMember({
          id: editingRosterMember.id,
          name: rosterName,
          role: rosterRole,
          imageUrl: rosterImageUrl,
        });
      } else {
        await addBandRosterMember({
          bandId,
          name: rosterName,
          role: rosterRole,
          imageUrl: rosterImageUrl,
        });
      }
      resetRosterForm();
      await loadRoster();
    } catch (saveError) {
      Alert.alert(
        "Unable to save bandmate",
        saveError instanceof Error ? saveError.message : "The bandmate could not be saved."
      );
    } finally {
      setSavingRoster(false);
    }
  };

  const confirmRemoveRosterMember = (member: BandRosterMember) => {
    Alert.alert(`Remove ${member.name}?`, "This removes them from the visual band profile.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          void (async () => {
            try {
              await removeBandRosterMember(member.id);
              await loadRoster();
            } catch (removeError) {
              Alert.alert(
                "Unable to remove bandmate",
                removeError instanceof Error
                  ? removeError.message
                  : "The bandmate could not be removed."
              );
            }
          })();
        },
      },
    ]);
  };

  const save = async () => {
    if (!bandId || !name.trim() || !genre || !location.trim()) {
      Alert.alert("Complete the band profile", "Band name, genre, and location are required.");
      return;
    }

    setSaving(true);
    try {
      await updateBand({
        bandId,
        name: name.trim(),
        genre,
        location: location.trim(),
        description,
        imageUrl,
        videos,
      });
      router.back();
    } catch (saveError) {
      const message =
        saveError instanceof Error ? saveError.message : "The band could not be updated.";
      Alert.alert("Unable to save band", message);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = () => {
    if (!bandId || !band) {
      return;
    }

    Alert.alert(
      `Delete ${band.name ?? "this band"}?`,
      "This permanently removes the band, its members, recruitment posts, and applications.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete band",
          style: "destructive",
          onPress: () => {
            void (async () => {
              setDeleting(true);
              try {
                await deleteBand(bandId);
                await setActiveAccount({ type: "musician" });
                router.replace("/(tabs)/Profile");
              } catch (deleteError) {
                const message =
                  deleteError instanceof Error
                    ? deleteError.message
                    : "The band could not be deleted.";
                Alert.alert("Unable to delete band", message);
              } finally {
                setDeleting(false);
              }
            })();
          },
        },
      ]
    );
  };

  if (bandLoading || membershipsLoading) {
    return <View className="flex-1 bg-[#0a0a0a]" />;
  }

  if (!band || !membership?.isLeader) {
    return (
      <View className="flex-1 items-center justify-center bg-[#0a0a0a] px-6">
        <Text className="text-gray-400 text-center">
          Only the band leader can edit this band account.
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
        <Text className="text-3xl font-bold text-white">Edit band</Text>
      </View>

      <View className="px-6 pb-12">
        <Pressable onPress={uploadImage} disabled={uploading} className="self-center w-32 h-32 rounded-full overflow-hidden bg-[#1a1a1a] items-center justify-center mb-6">
          {imageUrl ? <Image source={{ uri: imageUrl }} className="w-full h-full" /> : <Camera size={28} color="#a855f7" />}
        </Pressable>
        <Text className="text-sm text-gray-400 text-center mb-6">Tap to change the band image</Text>

        <TextInput value={name} onChangeText={setName} placeholder="Band name" placeholderTextColor="#6b7280" className="px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white mb-3" />
        <TextInput value={genreQuery} onChangeText={setGenreQuery} placeholder={genre || "Search band genre"} placeholderTextColor="#6b7280" className="px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white mb-3" />
        {genreQuery.trim() && (
          <View className="flex-row flex-wrap gap-2 mb-3">
            {matchingGenres.map((item) => (
              <Pressable key={item} onPress={() => { setGenre(item); setGenreQuery(""); }} className="px-3 py-2 bg-[#1a1a1a] rounded-full">
                <Text className="text-gray-300 text-sm">{item}</Text>
              </Pressable>
            ))}
          </View>
        )}
        {genre && <Text className="text-purple-400 mb-3">Selected genre: {genre}</Text>}
        <TextInput value={location} onChangeText={setLocation} placeholder="City or area" placeholderTextColor="#6b7280" className="px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white mb-3" />
        <TextInput value={description} onChangeText={setDescription} multiline textAlignVertical="top" placeholder="Tell musicians about the band" placeholderTextColor="#6b7280" className="h-28 px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white mb-6" />

        <View className="mb-8">
          <Text className="text-xl font-bold text-white mb-1">Band members</Text>
          <Text className="text-gray-400 mb-4">
            These are visual profile details only and do not give anyone account access.
          </Text>
          <Pressable
            onPress={() => (showRosterForm ? resetRosterForm() : setShowRosterForm(true))}
            className="flex-row items-center justify-center gap-2 py-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl mb-4"
          >
            {showRosterForm ? <X size={20} color="white" /> : <Plus size={20} color="#a855f7" />}
            <Text className={showRosterForm ? "text-white font-semibold" : "text-purple-400 font-semibold"}>
              {showRosterForm ? "Cancel" : "Add visual band member"}
            </Text>
          </Pressable>

          {showRosterForm && (
            <View className="p-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl mb-4">
              <Pressable onPress={uploadRosterImage} disabled={uploadingRosterImage} className="self-center w-20 h-20 rounded-full overflow-hidden bg-[#101010] items-center justify-center mb-4">
                {rosterImageUrl ? (
                  <Image source={{ uri: rosterImageUrl }} className="w-full h-full" />
                ) : (
                  <Camera size={24} color="#a855f7" />
                )}
              </Pressable>
              <Text className="text-gray-400 text-center text-sm mb-4">
                {uploadingRosterImage ? "Uploading photo..." : "Tap to add a photo (optional)"}
              </Text>
              <TextInput value={rosterName} onChangeText={setRosterName} placeholder="Member name" placeholderTextColor="#6b7280" className="px-4 py-3 bg-[#101010] border border-[#2a2a2a] rounded-xl text-white mb-3" />
              <TextInput value={rosterRole} onChangeText={setRosterRole} placeholder="Instrument or role, e.g. Drummer" placeholderTextColor="#6b7280" className="px-4 py-3 bg-[#101010] border border-[#2a2a2a] rounded-xl text-white mb-3" />
              <Pressable onPress={saveRosterMember} disabled={savingRoster || uploadingRosterImage} className={`py-3 rounded-xl ${savingRoster ? "bg-purple-900" : "bg-purple-600"}`}>
                <Text className="text-white text-center font-medium">
                  {savingRoster ? "Saving..." : editingRosterMember ? "Save member" : "Add member"}
                </Text>
              </Pressable>
            </View>
          )}

          {rosterMembers.map((member) => (
            <View key={member.id} className="flex-row items-center p-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl mb-3">
              {member.imageUrl ? (
                <Image source={{ uri: member.imageUrl }} className="w-11 h-11 rounded-full mr-3" />
              ) : (
                <View className="w-11 h-11 rounded-full mr-3 bg-pink-900 items-center justify-center">
                  <Text className="text-white font-bold">{member.name.trim().charAt(0).toUpperCase()}</Text>
                </View>
              )}
              <View className="flex-1">
                <Text className="text-white font-medium">{member.name}</Text>
                <Text className="text-gray-400 text-sm">{member.role ?? "Band member"}</Text>
              </View>
              <Pressable onPress={() => editRosterMember(member)} className="p-2 mr-1">
                <Pencil size={18} color="#a855f7" />
              </Pressable>
              <Pressable onPress={() => confirmRemoveRosterMember(member)} className="p-2">
                <Trash2 size={18} color="#f87171" />
              </Pressable>
            </View>
          ))}
          {rosterMembers.length === 0 && (
            <Text className="text-gray-500 text-center py-3">No visual band members added yet.</Text>
          )}
        </View>

        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-xl font-bold text-white">Performance videos</Text>
          <Text className="text-gray-400">{videos.length}/3</Text>
        </View>
        <View className="flex-row flex-wrap gap-3 mb-4">
          {videos.map((video) => (
            <View key={video.url} className="w-[30%] aspect-[9/16] rounded-xl overflow-hidden bg-[#1a1a1a]">
              {video.thumbnailUrl ? (
                <Image source={{ uri: video.thumbnailUrl }} className="w-full h-full" />
              ) : (
                <View className="w-full h-full items-center justify-center"><Text className="text-gray-500 text-xs text-center">Video</Text></View>
              )}
              <Pressable onPress={() => setVideos((current) => current.filter((item) => item.url !== video.url))} className="absolute top-2 right-2 p-1 bg-black/70 rounded-full">
                <X size={14} color="white" />
              </Pressable>
            </View>
          ))}
        </View>
        {videos.length < 3 && (
          <Pressable onPress={uploadVideo} disabled={uploading} className="flex-row items-center justify-center gap-2 py-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl mb-6">
            <Upload size={20} color="#a855f7" />
            <Text className="text-purple-400 font-semibold">{uploading ? "Uploading..." : "Add performance video"}</Text>
          </Pressable>
        )}

        <Pressable onPress={save} disabled={saving || uploading} className={`py-4 rounded-xl mb-4 ${saving ? "bg-pink-900" : "bg-pink-600"}`}>
          <Text className="text-white text-center font-semibold">{saving ? "Saving..." : "Save band profile"}</Text>
        </Pressable>
        <Pressable onPress={confirmDelete} disabled={deleting} className="flex-row items-center justify-center gap-2 py-4 border border-red-500/60 rounded-xl">
          <Trash2 size={20} color="#f87171" />
          <Text className="text-red-400 font-semibold">{deleting ? "Deleting..." : "Delete band"}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
