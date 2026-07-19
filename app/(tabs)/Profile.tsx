import { useEffect, useState } from "react";
import { View, Text, Pressable, Image, ScrollView, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import {
  Settings,
  MapPin,
  Music,
  Award,
  Clock,
  Play,
  ChevronDown,
} from "lucide-react-native";
import { supabase } from "../../lib/supabase";
import { useMyBands, type MyBand } from "../../hooks/useMyBands";
import ProfileSwitcherSheet from "../../components/Profileswitchersheet";

type MusicianProfile = {
  id: string;
  name: string | null;
  bio: string | null;
  genres: string | null;
  experience_level: string | null;
  commitment_level: string | null;
  videos: string | null;
  avatar_url: string | null;
  Location: any; 
  Age: string | null;
  Gender: string | null;
};

const calculateAge = (dobString: string) => {
  const dob = new Date(dobString);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
};

// attempt of geography function for when it gets implemented properly on onboarding.
const formatLocation = (location: any): string | null => {
  if (!location) return null;
  if (typeof location === "string") return location;
  if (location?.coordinates?.length === 2) {
    const [lng, lat] = location.coordinates;
    return `${lat.toFixed(2)}, ${lng.toFixed(2)}`;
  }
  return null;
};

export default function Profile() {
  const router = useRouter();
  const [profile, setProfile] = useState<MusicianProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [switcherVisible, setSwitcherVisible] = useState(false);

  const { bands } = useMyBands();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setErrorMsg(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setErrorMsg("Your session expired. Please log in again.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("Musicians")
        .select(
          "id, name, bio, genres, experience_level, commitment_level, videos, avatar_url, Location, Age, Gender"
        )
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
        return;
      }

      setProfile(data);
      setLoading(false);
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 bg-[#0a0a0a] items-center justify-center">
        <ActivityIndicator color="#a855f7" />
      </View>
    );
  }

  if (errorMsg || !profile) {
    return (
      <View className="flex-1 bg-[#0a0a0a] items-center justify-center px-6">
        <Text className="text-red-400 text-center">
          {errorMsg || "We couldn't find a profile for this account."}
        </Text>
      </View>
    );
  }

  const genreList = profile.genres
    ? profile.genres.split(",").map((g) => g.trim()).filter(Boolean)
    : [];

  const videoList = profile.videos
    ? profile.videos.split(",").map((v) => v.trim()).filter(Boolean)
    : [];

  const age = profile.Age ? calculateAge(profile.Age) : null;
  const locationText = formatLocation(profile.Location);
  const avatarUrl = profile.avatar_url
    ? supabase.storage
        .from("avatars")
        .getPublicUrl(profile.avatar_url).data.publicUrl
    : null;

  const handleSelectMusician = () => {
    setSwitcherVisible(false);
  };

  const handleSelectBand = (band: MyBand) => {
    setSwitcherVisible(false);
    router.push({
      pathname: "../BandProfile",
      params: { id: band.id, name: band.name ?? "" },
    });
  };

  const handleCreateBand = () => {
    setSwitcherVisible(false);
    router.push("/BandSetup");
  };

  return (
    <>
      <ScrollView className="flex-1 bg-[#0a0a0a]" showsVerticalScrollIndicator={false}>
        {/* Top bar */}
        <View className="pt-16 pb-4 px-6 relative">
          <Pressable
            onPress={() => router.push("/Settings")}
            className="absolute top-4 right-4 p-2 bg-black/50 rounded-full"
          >
            <Settings size={20} color="white" />
          </Pressable>
        </View>

        <View className="px-6 pb-6">
          {/* Profile header */}
          <View className="flex-row items-end gap-4 mb-6">
            <Image
              source={{
                uri:
                  avatarUrl || "https://via.placeholder.com/150?text=No+Avatar",
              }}
              className="w-32 h-32 rounded-2xl border-4 border-[#0a0a0a] bg-[#1a1a1a]"
            />

            <View className="flex-1 pb-2">
              <Pressable
                onPress={() => setSwitcherVisible(true)}
                className="flex-row items-center gap-1 mb-1 self-start"
              >
                <Text className="text-2xl font-bold text-white">
                  {profile.name || "Unnamed"}
                  {age !== null ? `, ${age}` : ""}
                </Text>

                <ChevronDown size={20} color="white" />
              </Pressable>

              {locationText && (
                <View className="flex-row items-center gap-1">
                  <MapPin size={14} color="#9ca3af" />
                  <Text className="text-gray-400 text-sm">{locationText}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Edit button */}
          <Pressable
            onPress={() => router.push("/Musiciansetup")}
            className="w-full py-3 bg-purple-600 rounded-xl mb-6"
          >
            <Text className="text-white text-center font-medium">
              Edit Profile
            </Text>
          </Pressable>

          {/* Stats */}
          <View className="flex-row gap-3 mb-6">
            <View className="flex-1 p-4 bg-[#1a1a1a] rounded-xl border border-[#2a2a2a]">
              <Award size={20} color="#a855f7" />
              <Text className="text-gray-500 text-xs mt-2">Experience</Text>
              <Text className="text-white font-medium text-sm">
                {profile.experience_level || "—"}
              </Text>
            </View>

            <View className="flex-1 p-4 bg-[#1a1a1a] rounded-xl border border-[#2a2a2a]">
              <Clock size={20} color="#ec4899" />
              <Text className="text-gray-500 text-xs mt-2">Commitment</Text>
              <Text className="text-white font-medium text-sm">
                {profile.commitment_level || "—"}
              </Text>
            </View>

            <View className="flex-1 p-4 bg-[#1a1a1a] rounded-xl border border-[#2a2a2a]">
              <Music size={20} color="#3b82f6" />
              <Text className="text-gray-500 text-xs mt-2">Genres</Text>
              <Text className="text-white font-medium text-sm">
                {genreList.length}
              </Text>
            </View>
          </View>

          {/* About */}
          <View className="mb-6">
            <Text className="text-xl font-bold text-white mb-3">About</Text>
            <Text className="text-gray-400 leading-relaxed">
              {profile.bio || "No bio added yet."}
            </Text>
          </View>

          {/* Genres */}
          {genreList.length > 0 && (
            <View className="mb-6">
              <Text className="text-xl font-bold text-white mb-3">
                Music Genres
              </Text>

              <View className="flex-row flex-wrap gap-2">
                {genreList.map((genre) => (
                  <View
                    key={genre}
                    className="px-4 py-2 bg-purple-600/20 border border-purple-500/30 rounded-full"
                  >
                    <Text className="text-purple-400 text-sm font-medium">
                      {genre}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Videos */}
          {videoList.length > 0 && (
            <View>
              <Text className="text-xl font-bold text-white mb-3">
                Performance Videos
              </Text>

              <View className="flex-row flex-wrap gap-3">
                {videoList.map((video, index) => (
                  <View
                    key={index}
                    className="w-[30%] aspect-square rounded-xl overflow-hidden relative"
                  >
                    <Image source={{ uri: video }} className="w-full h-full" />

                    <View className="absolute inset-0 bg-black/40 items-center justify-center">
                      <View className="w-10 h-10 bg-white rounded-full items-center justify-center">
                        <Play size={18} color="black" />
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <ProfileSwitcherSheet
        visible={switcherVisible}
        onClose={() => setSwitcherVisible(false)}
        musicianName={profile.name}
        musicianAvatarUrl={avatarUrl}
        bands={bands}
        onSelectMusician={handleSelectMusician}
        onSelectBand={handleSelectBand}
        onCreateBand={handleCreateBand}
      />
    </>
  );
}