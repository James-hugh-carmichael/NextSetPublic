import { useState } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Image,
  ActivityIndicator,
  Platform,
  Pressable,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Upload, Calendar } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../lib/supabase";
import { PrimaryButton } from "../components";

export default function ProfileSetup() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [dob, setDob] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [bio, setBio] = useState("");

  const [location, setLocation] = useState("");
  const [profilePic, setProfilePic] = useState<string | null>(null);

  const [genres, setGenres] = useState<string[]>([]);
  const [experience, setExperience] = useState("");
  const [commitment, setCommitment] = useState("");

  const [videos, setVideos] = useState<string[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const isWeb = Platform.OS === "web";

  const genreOptions = [
    "Rock", "Jazz", "Classical", "Metal", "Pop", "Blues",
    "Electronic", "Hip Hop", "Folk", "Country", "Post-hardcore",
  ];

  const experienceOptions = ["Beginner", "Intermediate", "Advanced", "Professional"];
  const commitmentOptions = ["Casual", "Part-time", "Full-time"];

  const inputBase =
    "bg-white/5 text-white p-4 rounded-2xl border border-white/10 focus:border-purple-500";

  // Shared pill styling helper
  const pillClass = (selected: boolean) =>
    `px-3 py-2 rounded-full border ${
      selected ? "bg-purple-600 border-purple-500" : "bg-white/5 border-white/10"
    }`;

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

  const onChangeDobNative = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setDob(selectedDate);
    }
  };

  const onChangeDobWeb = (e: any) => {
    const value = e.target.value; 
    if (value) {
      const [y, m, d] = value.split("-").map(Number);
      setDob(new Date(y, m - 1, d));
    } else {
      setDob(null);
    }
  };

  const calculateAge = (birthDate: Date) => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const formatDate = (date: Date) =>
    date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const toInputDateString = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
      date.getDate()
    ).padStart(2, "0")}`;

  const validate = () => {
    const errors: Record<string, string> = {};

    if (!name.trim()) {
      errors.name = "Please enter your name.";
    }

    if (!dob) {
      errors.dob = "Please select your date of birth.";
    } else {
      const age = calculateAge(dob);
      if (age < 13) {
        errors.dob = "You must be at least 13 years old.";
      } else if (age > 120) {
        errors.dob = "Please enter a valid date of birth.";
      }
    }

    if (genres.length === 0) {
      errors.genres = "Please select at least one genre.";
    }

    if (!experience) {
      errors.experience = "Please select your experience level.";
    }

    if (!commitment) {
      errors.commitment = "Please select your commitment level.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    setErrorMsg(null);

    const isValid = validate();
    if (!isValid) {
      setErrorMsg("Please fix the highlighted fields below.");
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

    let profilePhotoPath: string | null = null;

    if (profilePic) {
      const response = await fetch(profilePic);
      const blob = await response.blob();

      const extension = profilePic.split(".").pop() || "jpg";
      const filePath = `${user.id}/profile.${extension}`;

      const { data, error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, blob, {
          contentType: blob.type,
          upsert: true,
        });

      if (uploadError) {
        setSubmitting(false);
        setErrorMsg(uploadError.message);
        return;
      }

      profilePhotoPath = data.path;
    }
    
    const dobString = dob ? toInputDateString(dob) : null;

    const { error } = await supabase
    .from("Musicians")
    .upsert({
      id: user.id,
      name: name.trim(),
      bio: bio.trim(),
      genres: genres.join(", "),
      experience_level: experience,
      commitment_level: commitment,
      Age: dobString,
      onboarding_complete: true,
      avatar_url: profilePhotoPath,
    });

    if (error) {
      setSubmitting(false);
      setErrorMsg(error.message);
      return;
    }

    setSubmitting(false);
    router.replace("/(tabs)/Feed");
  };

  return (
    <ScrollView className="flex-1 bg-gradient-to-b from-[#0a0a0a] to-[#1a0a2e]">
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
          <View className="bg-red-500/10 border border-red-500/30 rounded-2xl px-4 py-3 mb-4">
            <Text className="text-red-400 text-sm">{errorMsg}</Text>
          </View>
        )}

        <Text className="text-white mb-2">Profile Picture</Text>
        <Pressable onPress={pickImage} className="mb-4">
          {profilePic ? (
            <Image
              source={{ uri: profilePic }}
              className="w-24 h-24 rounded-full border border-white/10"
            />
          ) : (
            <View className="w-24 h-24 bg-white/5 border border-white/10 rounded-full items-center justify-center">
              <Upload color="white" />
            </View>
          )}
        </Pressable>

        <TextInput
          placeholder="Name"
          placeholderTextColor="#6b7280"
          value={name}
          onChangeText={setName}
          className={`${inputBase} ${fieldErrors.name ? "border-red-500" : ""}`}
        />
        {fieldErrors.name && (
          <Text className="text-red-500 text-xs mt-1 mb-2">{fieldErrors.name}</Text>
        )}
        {!fieldErrors.name && <View className="mb-3" />}

        {/* Date of Birth */}
        {isWeb ? (
          <View className="relative mb-1">
            {/* @ts-ignore - raw HTML input for web */}
            <input
              type="date"
              value={dob ? toInputDateString(dob) : ""}
              onChange={onChangeDobWeb}
              max={toInputDateString(new Date())}
              placeholder="Select date of birth"
              className={`w-full bg-white/5 text-white p-4 pl-12 rounded-2xl border outline-none ${
                fieldErrors.dob ? "border-red-500" : "border-white/10"
              }`}
              style={{
                colorScheme: "dark",
                fontSize: 14,
              }}
            />
            <View className="absolute left-4 top-0 bottom-0 justify-center pointer-events-none">
              <Calendar size={18} color="#a78bfa" />
            </View>
          </View>
        ) : (
          <>
            <Pressable
              onPress={() => setShowDatePicker(true)}
              className={`relative bg-white/5 border rounded-2xl ${
                fieldErrors.dob ? "border-red-500" : "border-white/10"
              }`}
            >
              <View className="flex-row items-center p-4 pl-12">
                <Text className={dob ? "text-white" : "text-gray-500"}>
                  {dob ? formatDate(dob) : "Select date of birth"}
                </Text>
              </View>
              <View className="absolute left-4 top-0 bottom-0 justify-center">
                <Calendar size={18} color="#a78bfa" />
              </View>
            </Pressable>

            {showDatePicker && (
              <DateTimePicker
                value={dob ?? new Date(2000, 0, 1)}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                maximumDate={new Date()}
                onChange={onChangeDobNative}
              />
            )}
          </>
        )}

        {dob && (
          <Text className="text-gray-500 text-xs mt-1">
            Age: {calculateAge(dob)}
          </Text>
        )}
        {fieldErrors.dob && (
          <Text className="text-red-500 text-xs mt-1 mb-2">{fieldErrors.dob}</Text>
        )}
        {!fieldErrors.dob && <View className="mb-3" />}

        <TextInput
          placeholder="Location (optional)"
          placeholderTextColor="#6b7280"
          value={location}
          onChangeText={setLocation}
          className={`${inputBase} mb-3`}
        />

        <Text className="text-white mb-2">Genres</Text>
        <View className="flex-row flex-wrap gap-2 mb-1">
          {genreOptions.map((g) => (
            <Pressable
              key={g}
              onPress={() => toggleGenre(g)}
              className={pillClass(genres.includes(g))}
            >
              <Text className="text-white">{g}</Text>
            </Pressable>
          ))}
        </View>
        {fieldErrors.genres && (
          <Text className="text-red-500 text-xs mt-1 mb-2">{fieldErrors.genres}</Text>
        )}
        {!fieldErrors.genres && <View className="mb-4" />}

        <Text className="text-white mb-2">Experience</Text>
        <View className="flex-row flex-wrap gap-2 mb-1">
          {experienceOptions.map((level) => (
            <Pressable
              key={level}
              onPress={() => setExperience(level)}
              className={pillClass(experience === level)}
            >
              <Text className="text-white">{level}</Text>
            </Pressable>
          ))}
        </View>
        {fieldErrors.experience && (
          <Text className="text-red-500 text-xs mt-1 mb-2">
            {fieldErrors.experience}
          </Text>
        )}
        {!fieldErrors.experience && <View className="mb-4" />}

        <Text className="text-white mb-2">Commitment</Text>
        <View className="flex-row flex-wrap gap-2 mb-1">
          {commitmentOptions.map((level) => (
            <Pressable
              key={level}
              onPress={() => setCommitment(level)}
              className={pillClass(commitment === level)}
            >
              <Text className="text-white">{level}</Text>
            </Pressable>
          ))}
        </View>
        {fieldErrors.commitment && (
          <Text className="text-red-500 text-xs mt-1 mb-2">
            {fieldErrors.commitment}
          </Text>
        )}
        {!fieldErrors.commitment && <View className="mb-3" />}

        {/* Bio */}
        <TextInput
          placeholder="Bio (optional)"
          placeholderTextColor="#6b7280"
          value={bio}
          onChangeText={setBio}
          multiline
          className={`${inputBase} mt-3 mb-3`}
        />

        <Text className="text-white mb-2">Videos (optional for now)</Text>

        <View className="flex-row gap-3 mb-6">
          {videos.map((v) => (
            <View
              key={v}
              className="w-20 h-20 bg-white/5 border border-white/10 rounded-2xl items-center justify-center"
            >
              <Text className="text-white">▶</Text>
            </View>
          ))}

          {videos.length < 3 && (
            <Pressable
              onPress={addVideo}
              className="w-20 h-20 bg-white/5 border border-white/10 rounded-2xl items-center justify-center"
            >
              <Text className="text-white">+</Text>
            </Pressable>
          )}
        </View>

        <PrimaryButton
          onPress={handleSubmit}
          loading={submitting}
          disabled={submitting}
        >
          {submitting ? "Saving..." : "Complete Profile"}
        </PrimaryButton>
      </View>
    </ScrollView>
  );
}