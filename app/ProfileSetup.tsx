import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { Camera, Upload, X } from "lucide-react-native";

import { useUser } from "../services/auth";
import { uploadProfileMedia } from "../services/media";
import {
  parseStoredList,
  saveMusicianProfile,
  useMusician,
} from "../services/musicians";

const genreOptions = ["Rock", "Jazz", "Classical", "Metal", "Pop", "Blues", "Electronic", "Hip Hop"];
const roleOptions = [
  "Lead Vocals",
  "Backing Vocals",
  "Guitar",
  "Lead Guitar",
  "Rhythm Guitar",
  "Acoustic Guitar",
  "Bass",
  "Double Bass",
  "Drums",
  "Percussion",
  "Keys",
  "Piano",
  "Organ",
  "Synthesizer",
  "DJ",
  "Turntables",
  "Music Producer",
  "Songwriter",
  "Composer",
  "Saxophone",
  "Trumpet",
  "Trombone",
  "Tuba",
  "Flute",
  "Clarinet",
  "Harmonica",
  "Violin",
  "Viola",
  "Cello",
  "Banjo",
  "Mandolin",
  "Ukulele",
  "Accordion",
  "Sound Engineer",
];
const experienceOptions = ["Beginner", "Intermediate", "Advanced", "Professional"];
const commitmentOptions = ["Casual", "Part-time", "Full-time", "Professional"];

export default function ProfileSetup() {
  const router = useRouter();
  const { user } = useUser();
  const { musician, loading } = useMusician(user?.id);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [genres, setGenres] = useState<string[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [experience, setExperience] = useState("");
  const [commitment, setCommitment] = useState("");
  const [videos, setVideos] = useState<string[]>([]);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!musician) {
      return;
    }

    setName(musician.name ?? "");
    setBio(musician.bio ?? "");
    setGenres(parseStoredList(musician.genres));
    setRoles(parseStoredList(musician.roles));
    setExperience(musician.experience_level ?? "");
    setCommitment(musician.commitment_level ?? "");
    setVideos(parseStoredList(musician.videos));
    setAvatarUrl(musician.avatar_url);
  }, [musician]);

  const requestMediaPermission = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.granted) {
      return true;
    }

    Alert.alert("Media access needed", "Allow photo library access to upload media.");
    return false;
  };

  const uploadAvatar = async () => {
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
      setAvatarUrl(await uploadProfileMedia(user.id, result.assets[0], "avatar"));
    } catch (error) {
      const message = error instanceof Error ? error.message : "The avatar could not be uploaded.";
      Alert.alert("Unable to upload avatar", message);
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
      setVideos((currentVideos) => [...currentVideos, videoUrl]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "The video could not be uploaded.";
      Alert.alert("Unable to upload video", message);
    } finally {
      setUploading(false);
    }
  };

  const toggleGenre = (genre: string) => {
    setGenres((currentGenres) =>
      currentGenres.includes(genre)
        ? currentGenres.filter((item) => item !== genre)
        : [...currentGenres, genre]
    );
  };

  const toggleRole = (role: string) => {
    setRoles((currentRoles) =>
      currentRoles.includes(role)
        ? currentRoles.filter((item) => item !== role)
        : [...currentRoles, role]
    );
  };

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert("Sign in required", "Please sign in again to save your profile.");
      return;
    }

    if (!name.trim() || !experience || !commitment) {
      Alert.alert("Complete your profile", "Name, experience level, and commitment level are required.");
      return;
    }

    setSaving(true);
    try {
      await saveMusicianProfile(user.id, {
        name,
        bio,
        genres,
        roles,
        experienceLevel: experience,
        commitmentLevel: commitment,
        videos,
        avatarUrl,
      });
      router.replace("/(tabs)/Profile");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Your profile could not be saved.";
      Alert.alert("Unable to save profile", message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <View className="flex-1 bg-[#0a0a0a]" />;
  }

  return (
    <ScrollView className="flex-1 bg-[#0a0a0a]" showsVerticalScrollIndicator={false}>
      <View className="pt-16 pb-8 px-6">
        <Text className="text-3xl font-bold text-white mb-2">
          {musician ? "Edit Your Profile" : "Create Your Profile"}
        </Text>
        <Text className="text-gray-400">Tell bands about yourself</Text>
      </View>

      <View className="px-6 pb-8">
        <Text className="text-sm font-medium text-gray-300 mb-3">Profile photo</Text>
        <Pressable onPress={uploadAvatar} disabled={uploading} className="self-start relative mb-6">
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} className="w-28 h-28 rounded-2xl" />
          ) : (
            <View className="w-28 h-28 rounded-2xl bg-[#1a1a1a] border border-dashed border-[#3a3a3a] items-center justify-center">
              <Camera size={28} color="#a855f7" />
              <Text className="text-gray-400 text-xs mt-2">Add photo</Text>
            </View>
          )}
          {avatarUrl && (
            <View className="absolute -bottom-2 -right-2 p-2 rounded-full bg-purple-600">
              <Camera size={16} color="white" />
            </View>
          )}
        </Pressable>

        <Text className="text-sm font-medium text-gray-300 mb-2">Name</Text>
        <TextInput value={name} onChangeText={setName} placeholder="Your name" placeholderTextColor="#6b7280" className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white mb-4" />

        <Text className="text-sm font-medium text-gray-300 mb-2">Bio</Text>
        <TextInput value={bio} onChangeText={setBio} multiline textAlignVertical="top" placeholder="Tell bands about yourself..." placeholderTextColor="#6b7280" className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white h-32 mb-6" />

        <Text className="text-sm font-medium text-gray-300 mb-3">Music Genres</Text>
        <View className="flex-row flex-wrap gap-2 mb-6">
          {genreOptions.map((genre) => (
            <Pressable key={genre} onPress={() => toggleGenre(genre)} className={`px-4 py-2 rounded-full ${genres.includes(genre) ? "bg-purple-600" : "bg-[#1a1a1a]"}`}>
              <Text className={genres.includes(genre) ? "text-white" : "text-gray-400"}>{genre}</Text>
            </Pressable>
          ))}
        </View>

        <Text className="text-sm font-medium text-gray-300 mb-3">Instruments & Roles</Text>
        <View className="flex-row flex-wrap gap-2 mb-6">
          {roleOptions.map((role) => (
            <Pressable key={role} onPress={() => toggleRole(role)} className={`px-4 py-2 rounded-full ${roles.includes(role) ? "bg-pink-600" : "bg-[#1a1a1a]"}`}>
              <Text className={roles.includes(role) ? "text-white" : "text-gray-400"}>{role}</Text>
            </Pressable>
          ))}
          {roles
            .filter((role) => !roleOptions.includes(role))
            .map((role) => (
              <Pressable key={role} onPress={() => toggleRole(role)} className="flex-row items-center gap-1 px-4 py-2 rounded-full bg-pink-600">
                <Text className="text-white">{role}</Text>
                <X size={14} color="white" />
              </Pressable>
            ))}
        </View>

        <Text className="text-sm font-medium text-gray-300 mb-3">Experience Level</Text>
        <View className="flex-row flex-wrap gap-2 mb-6">
          {experienceOptions.map((option) => (
            <Pressable key={option} onPress={() => setExperience(option)} className={`px-4 py-2 rounded-full ${experience === option ? "bg-purple-600" : "bg-[#1a1a1a]"}`}>
              <Text className={experience === option ? "text-white" : "text-gray-400"}>{option}</Text>
            </Pressable>
          ))}
        </View>

        <Text className="text-sm font-medium text-gray-300 mb-3">Commitment Level</Text>
        <View className="flex-row flex-wrap gap-2 mb-6">
          {commitmentOptions.map((option) => (
            <Pressable key={option} onPress={() => setCommitment(option)} className={`px-4 py-2 rounded-full ${commitment === option ? "bg-pink-600" : "bg-[#1a1a1a]"}`}>
              <Text className={commitment === option ? "text-white" : "text-gray-400"}>{option}</Text>
            </Pressable>
          ))}
        </View>

        <Text className="text-sm font-medium text-gray-300 mb-2">Performance Videos</Text>
        <Text className="text-xs text-gray-500 mb-3">Upload up to three videos, each no longer than three minutes.</Text>
        {videos.map((video, index) => (
          <View key={video} className="flex-row items-center gap-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-3 mb-2">
            <Text className="flex-1 text-gray-300 text-sm">Performance video {index + 1}</Text>
            <Pressable onPress={() => setVideos((currentVideos) => currentVideos.filter((item) => item !== video))}>
              <X size={18} color="#ef4444" />
            </Pressable>
          </View>
        ))}
        {videos.length < 3 && (
          <Pressable onPress={uploadVideo} disabled={uploading} className="flex-row items-center justify-center gap-2 py-4 border-2 border-dashed border-[#3a3a3a] rounded-xl mb-8">
            <Upload size={20} color="#a855f7" />
            <Text className="text-purple-400 font-medium">{uploading ? "Uploading..." : "Upload Video"}</Text>
          </Pressable>
        )}

        <Pressable onPress={handleSubmit} disabled={saving || uploading} className={`py-4 rounded-xl ${saving || uploading ? "bg-purple-900" : "bg-purple-600"}`}>
          <Text className="text-center text-white font-semibold">{saving ? "Saving..." : "Save Profile"}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
