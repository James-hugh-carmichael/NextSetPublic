import { useState } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Upload, X } from "lucide-react-native";

export default function ProfileSetup() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [bio, setBio] = useState("");
  const [genres, setGenres] = useState<string[]>([]);
  const [experience, setExperience] = useState("");
  const [commitment, setCommitment] = useState("");
  const [videos, setVideos] = useState<number[]>([]);

  const genreOptions = [
    "Rock",
    "Jazz",
    "Classical",
    "Metal",
    "Pop",
    "Blues",
    "Electronic",
    "Hip Hop",
  ];

  const experienceOptions = [
    "Beginner",
    "Intermediate",
    "Advanced",
    "Professional",
  ];

  const commitmentOptions = [
    "Casual",
    "Part-time",
    "Full-time",
    "Professional",
  ];

  const toggleGenre = (genre: string) => {
    setGenres((prev) =>
      prev.includes(genre)
        ? prev.filter((g) => g !== genre)
        : [...prev, genre]
    );
  };

  const addVideoSlot = () => {
    if (videos.length < 3) {
      setVideos([...videos, Date.now()]);
    }
  };

  const removeVideoSlot = (id: number) => {
    setVideos(videos.filter((v) => v !== id));
  };

  const handleSubmit = () => {
    router.push("../Feed");
  };

  return (
    <ScrollView className="flex-1 bg-[#0a0a0a]" showsVerticalScrollIndicator={false}>
      <View className="pt-16 pb-8 px-6">
        <Text className="text-3xl font-bold text-white mb-2">
          Create Your Profile
        </Text>

        <Text className="text-gray-400">
          Tell bands about yourself
        </Text>
      </View>

      <View className="px-6 pb-8">
        <Text className="text-sm font-medium text-gray-300 mb-3">
          Profile Videos (up to 3)
        </Text>

        <View className="flex-row flex-wrap gap-3 mb-6">
          {videos.map((id) => (
            <View
              key={id}
              className="relative w-24 h-24 bg-[#1a1a1a] rounded-xl border-2 border-dashed border-[#2a2a2a] items-center justify-center"
            >
              <View className="w-8 h-8 bg-purple-600 rounded-lg items-center justify-center mb-1">
                <Text className="text-white">▶</Text>
              </View>

              <Text className="text-xs text-gray-500">
                Video
              </Text>

              <Pressable
                onPress={() => removeVideoSlot(id)}
                className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
              >
                <X size={12} color="white" />
              </Pressable>
            </View>
          ))}

          {videos.length < 3 && (
            <Pressable
              onPress={addVideoSlot}
              className="w-24 h-24 bg-[#1a1a1a] rounded-xl border-2 border-dashed border-[#2a2a2a] items-center justify-center"
            >
              <Upload size={24} color="#888" />
              <Text className="text-xs text-gray-500 mt-1">
                Upload
              </Text>
            </Pressable>
          )}
        </View>

        <Text className="text-sm font-medium text-gray-300 mb-2">
          Name
        </Text>

        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Your name"
          placeholderTextColor="#6b7280"
          className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white mb-4"
        />

        <Text className="text-sm font-medium text-gray-300 mb-2">
          Age
        </Text>

        <TextInput
          value={age}
          onChangeText={setAge}
          keyboardType="numeric"
          placeholder="25"
          placeholderTextColor="#6b7280"
          className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white mb-4"
        />

        <Text className="text-sm font-medium text-gray-300 mb-2">
          Bio
        </Text>

        <TextInput
          value={bio}
          onChangeText={setBio}
          multiline
          textAlignVertical="top"
          placeholder="Tell bands about yourself..."
          placeholderTextColor="#6b7280"
          className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white h-32 mb-6"
        />

        <Text className="text-sm font-medium text-gray-300 mb-3">
          Music Genres
        </Text>

        <View className="flex-row flex-wrap gap-2 mb-6">
          {genreOptions.map((genre) => (
            <Pressable
              key={genre}
              onPress={() => toggleGenre(genre)}
              className={`px-4 py-2 rounded-full ${
                genres.includes(genre)
                  ? "bg-purple-600"
                  : "bg-[#1a1a1a]"
              }`}
            >
              <Text
                className={
                  genres.includes(genre)
                    ? "text-white"
                    : "text-gray-400"
                }
              >
                {genre}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text className="text-sm font-medium text-gray-300 mb-2">
          Experience Level
        </Text>

        <View className="bg-[#1a1a1a] rounded-xl mb-4">
          <Picker
            selectedValue={experience}
            onValueChange={setExperience}
          >
            <Picker.Item
              label="Select experience level"
              value=""
            />
            {experienceOptions.map((opt) => (
              <Picker.Item
                key={opt}
                label={opt}
                value={opt}
              />
            ))}
          </Picker>
        </View>

        <Text className="text-sm font-medium text-gray-300 mb-2">
          Commitment Level
        </Text>

        <View className="bg-[#1a1a1a] rounded-xl mb-8">
          <Picker
            selectedValue={commitment}
            onValueChange={setCommitment}
          >
            <Picker.Item
              label="Select commitment level"
              value=""
            />
            {commitmentOptions.map((opt) => (
              <Picker.Item
                key={opt}
                label={opt}
                value={opt}
              />
            ))}
          </Picker>
        </View>

        <Pressable
          onPress={handleSubmit}
          className="bg-purple-600 py-4 rounded-xl"
        >
          <Text className="text-center text-white font-semibold">
            Complete Profile
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}