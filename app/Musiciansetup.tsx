import { useState } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Upload } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../lib/supabase";

export default function ProfileSetup() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [bio, setBio] = useState("");

  const [location, setLocation] = useState("");
  const [profilePic, setProfilePic] = useState<string | null>(null);

  const [genres, setGenres] = useState<string[]>([]);
  const [experience, setExperience] = useState("");
  const [commitment, setCommitment] = useState("");

  const [videos, setVideos] = useState<string[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const genreOptions = [
    "Rock", "Jazz", "Classical", "Metal", "Pop", "Blues",
    "Electronic", "Hip Hop", "Folk", "Country", "Post-hardcore",
  ];

  const toggleGenre = (genre: string) => {
    setGenres((prev) =>
      prev.includes(genre)
        ? prev.filter((g) => g !== genre)
        : [...prev, genre]
    );
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.7,
    });

    if (!result.canceled) {
      setProfilePic(result.assets[0].uri);
    }
  };

  const addVideo = () => {
    if (videos.length < 3) {
      setVideos([...videos, Date.now().toString()]);
    }
  };

  const handleSubmit = async () => {
    setErrorMsg(null);

    if (!name.trim() || !age || genres.length === 0 || !experience || !commitment) {
      setErrorMsg(
        "Please fill in your name, age, at least one genre, experience, and commitment level."
      );
      return;
    }

    setSubmitting(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setErrorMsg("Your session expired. Please log in again.");
      setSubmitting(false);
      return;
    }

    const ageNum = parseInt(age, 10);
    const approxDob = !isNaN(ageNum)
      ? `${new Date().getFullYear() - ageNum}-01-01`
      : null;

    const { error } = await supabase
      .from("Musicians")
      .upsert({
        id: user.id,
        name: name.trim(),
        bio: bio.trim(),
        genres: genres.join(", "),
        experience_level: experience,
        commitment_level: commitment,
        Age: approxDob,
        onboarding_complete: true,
      })
      .eq("id", user.id);

    if (error) {
      setSubmitting(false);
      setErrorMsg(error.message);
      return;
    }


    setSubmitting(false);
    router.replace("/(tabs)/Feed");
  };

  return (
    <ScrollView className="flex-1 bg-[#0a0a0a]">
      <View className="pt-16 px-6">
        <Text className="text-3xl font-bold text-white mb-2">
          Complete Your Profile
        </Text>
        <Text className="text-gray-400">
          Musicians need a full profile to join bands
        </Text>
      </View>

      <View className="px-6 pb-8 mt-6">
        {errorMsg && (
          <View className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-4">
            <Text className="text-red-400 text-sm">{errorMsg}</Text>
          </View>
        )}

        <Text className="text-white mb-2">Profile Picture</Text>
        <Pressable onPress={pickImage} className="mb-4">
          {profilePic ? (
            <Image
              source={{ uri: profilePic }}
              className="w-24 h-24 rounded-full"
            />
          ) : (
            <View className="w-24 h-24 bg-[#1a1a1a] rounded-full items-center justify-center">
              <Upload color="white" />
            </View>
          )}
        </Pressable>

        <TextInput
          placeholder="Name"
          placeholderTextColor="#6b7280"
          value={name}
          onChangeText={setName}
          className="bg-[#1a1a1a] text-white p-3 rounded-xl mb-3"
        />

        <TextInput
          placeholder="Age"
          placeholderTextColor="#6b7280"
          keyboardType="numeric"
          value={age}
          onChangeText={setAge}
          className="bg-[#1a1a1a] text-white p-3 rounded-xl mb-3"
        />

        <TextInput
          placeholder="Location (optional)"
          placeholderTextColor="#6b7280"
          value={location}
          onChangeText={setLocation}
          className="bg-[#1a1a1a] text-white p-3 rounded-xl mb-3"
        />

        <Text className="text-white mb-2">Genres</Text>
        <View className="flex-row flex-wrap gap-2 mb-4">
          {genreOptions.map((g) => (
            <Pressable
              key={g}
              onPress={() => toggleGenre(g)}
              className={`px-3 py-2 rounded-full ${
                genres.includes(g) ? "bg-purple-600" : "bg-[#1a1a1a]"
              }`}
            >
              <Text className="text-white">{g}</Text>
            </Pressable>
          ))}
        </View>

        <Text className="text-white mb-2">Experience</Text>
        <View className="bg-[#1a1a1a] rounded-xl mb-3">
          <Picker selectedValue={experience} onValueChange={setExperience}>
            <Picker.Item label="Select experience" value="" />
            <Picker.Item label="Beginner" value="Beginner" />
            <Picker.Item label="Intermediate" value="Intermediate" />
            <Picker.Item label="Advanced" value="Advanced" />
            <Picker.Item label="Professional" value="Professional" />
          </Picker>
        </View>

        <Text className="text-white mb-2">Commitment</Text>
        <View className="bg-[#1a1a1a] rounded-xl mb-3">
          <Picker selectedValue={commitment} onValueChange={setCommitment}>
            <Picker.Item label="Select commitment" value="" />
            <Picker.Item label="Casual" value="Casual" />
            <Picker.Item label="Part-time" value="Part-time" />
            <Picker.Item label="Full-time" value="Full-time" />
          </Picker>
        </View>

        <TextInput
          placeholder="Bio (optional)"
          placeholderTextColor="#6b7280"
          value={bio}
          onChangeText={setBio}
          multiline
          className="bg-[#1a1a1a] text-white p-3 rounded-xl mt-3 mb-3"
        />

        <Text className="text-white mb-2">Videos (optional for now)</Text>

        <View className="flex-row gap-3 mb-6">
          {videos.map((v) => (
            <View
              key={v}
              className="w-20 h-20 bg-[#1a1a1a] rounded-xl items-center justify-center"
            >
              <Text className="text-white">▶</Text>
            </View>
          ))}

          {videos.length < 3 && (
            <Pressable
              onPress={addVideo}
              className="w-20 h-20 bg-[#1a1a1a] rounded-xl items-center justify-center"
            >
              <Text className="text-white">+</Text>
            </Pressable>
          )}
        </View>

        <Pressable
          onPress={handleSubmit}
          disabled={submitting}
          className={`bg-purple-600 p-4 rounded-xl flex-row items-center justify-center gap-2 ${
            submitting ? "opacity-60" : ""
          }`}
        >
          {submitting && <ActivityIndicator color="white" />}
          <Text className="text-white text-center font-bold">
            {submitting ? "Saving..." : "Complete Profile"}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}