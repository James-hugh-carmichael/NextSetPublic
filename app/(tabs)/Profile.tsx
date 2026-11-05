import { useState } from "react";
import { Image, Modal, Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { VideoView, useVideoPlayer } from "expo-video";
import { Pencil, Settings, X } from "lucide-react-native";

import { useUser } from "../../services/auth";
import {
  parseStoredList,
  parseStoredVideos,
  ProfileVideo as StoredProfileVideo,
  useMusician,
} from "../../services/musicians";

type VideoGalleryItemProps = {
  video: StoredProfileVideo;
  index: number;
  onPress: () => void;
};

function VideoGalleryItem({ video, index, onPress }: VideoGalleryItemProps) {
  return (
    <Pressable onPress={onPress} className="w-40 h-64 mr-3 rounded-2xl overflow-hidden bg-[#1a1a1a]">
      {video.thumbnailUrl ? (
        <Image source={{ uri: video.thumbnailUrl }} className="w-full h-full" />
      ) : (
        <View className="w-full h-full bg-[#1a1a1a] items-center justify-center">
          <Text className="text-gray-500 text-xs text-center px-2">Performance video {index + 1}</Text>
        </View>
      )}
    </Pressable>
  );
}

function FullscreenVideo({
  source,
  onClose,
}: {
  source: string;
  onClose: () => void;
}) {
  const player = useVideoPlayer(source, (videoPlayer) => {
    videoPlayer.loop = false;
    videoPlayer.play();
  });

  return (
    <Modal visible animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <View className="flex-1 bg-black">
        <VideoView
          player={player}
          nativeControls
          contentFit="contain"
          style={{ flex: 1 }}
        />
        <Pressable onPress={onClose} className="absolute top-12 right-5 p-3 rounded-full bg-black/60">
          <X size={24} color="white" />
        </Pressable>
      </View>
    </Modal>
  );
}

export default function Profile() {
  const router = useRouter();
  const { user } = useUser();
  const { musician, loading, error } = useMusician(user?.id);
  const [activeVideo, setActiveVideo] = useState<StoredProfileVideo | null>(null);

  if (loading) {
    return <View className="flex-1 bg-[#0a0a0a]" />;
  }

  if (error || !musician) {
    return (
      <View className="flex-1 items-center justify-center bg-[#0a0a0a] px-6">
        <Text className="text-gray-400 text-center">{error ?? "Your profile is unavailable."}</Text>
      </View>
    );
  }

  const genres = parseStoredList(musician.genres);
  const roles = parseStoredList(musician.roles);
  const videos = parseStoredVideos(musician.videos);
  const initial = musician.name?.trim().charAt(0).toUpperCase() || "?";

  return (
    <ScrollView className="flex-1 bg-[#0a0a0a]" showsVerticalScrollIndicator={false}>
      <View className="h-[460px] relative bg-[#1a0a2e]">
        {musician.avatar_url ? (
          <Image source={{ uri: musician.avatar_url }} className="w-full h-full" />
        ) : (
          <View className="w-full h-full bg-[#1a0a2e] items-center justify-center">
            <Text className="text-8xl font-bold text-purple-300">{initial}</Text>
          </View>
        )}
        <View className="absolute inset-0 bg-black/35" />
        <Pressable onPress={() => router.push("/ProfileSetup")} className="absolute top-12 left-5 p-3 bg-black/50 rounded-full">
          <Pencil size={20} color="white" />
        </Pressable>
        <Pressable onPress={() => router.push("/Settings")} className="absolute top-12 right-5 p-3 bg-black/50 rounded-full">
          <Settings size={20} color="white" />
        </Pressable>
        <View className="absolute bottom-0 left-0 right-0 px-6 py-6">
          <Text className="text-4xl font-bold text-white mb-3">{musician.name ?? "Musician"}</Text>
          <View className="flex-row flex-wrap gap-2">
            <View className="px-3 py-1 bg-purple-600 rounded-full">
              <Text className="text-white text-xs font-medium">
                {musician.experience_level ?? "Experience not set"}
              </Text>
            </View>
            <View className="px-3 py-1 bg-pink-600 rounded-full">
              <Text className="text-white text-xs font-medium">
                {musician.commitment_level ?? "Availability not set"}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View className="px-6 py-7">
        <View className="mb-6">
          <View className="flex-row items-baseline justify-between mb-3">
            <Text className="text-xl font-bold text-white">Performances</Text>
            {videos.length > 0 && <Text className="text-purple-400 text-sm">{videos.length} videos</Text>}
          </View>
          {videos.length === 0 ? (
            <Pressable onPress={() => router.push("/ProfileSetup")} className="h-40 rounded-2xl border border-dashed border-[#3a3a3a] items-center justify-center">
              <Text className="text-purple-400 font-medium">Add performance videos</Text>
            </Pressable>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {videos.map((video, index) => (
                <VideoGalleryItem key={video.url} video={video} index={index} onPress={() => setActiveVideo(video)} />
              ))}
            </ScrollView>
          )}
        </View>

        {musician.bio && (
          <View className="mb-6">
            <Text className="text-xl font-bold text-white mb-2">About</Text>
            <Text className="text-gray-400 leading-relaxed">{musician.bio}</Text>
          </View>
        )}
        <View className="mb-6">
          <Text className="text-xl font-bold text-white mb-3">Music</Text>
          <Text className="text-xs font-medium text-gray-500 uppercase mb-2">Genres</Text>
          {genres.length === 0 ? (
            <Text className="text-gray-400">No genres added yet.</Text>
          ) : (
            <View className="flex-row flex-wrap gap-2">
              {genres.map((genre) => (
                <View key={genre} className="px-4 py-2 bg-purple-600/20 border border-purple-500/30 rounded-full">
                  <Text className="text-purple-400 text-sm font-medium">{genre}</Text>
                </View>
              ))}
            </View>
          )}
          <Text className="text-xs font-medium text-gray-500 uppercase mt-5 mb-2">Instruments & Roles</Text>
          {roles.length === 0 ? (
            <Text className="text-gray-400">No instruments or roles added yet.</Text>
          ) : (
            <View className="flex-row flex-wrap gap-2">
              {roles.map((role) => (
                <View key={role} className="px-4 py-2 bg-pink-600/20 border border-pink-500/30 rounded-full">
                  <Text className="text-pink-400 text-sm font-medium">{role}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>

      {activeVideo && (
        <FullscreenVideo source={activeVideo.url} onClose={() => setActiveVideo(null)} />
      )}
    </ScrollView>
  );
}
