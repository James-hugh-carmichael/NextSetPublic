import { useCallback, useEffect, useState } from "react";
import { Alert, Image, Modal, Pressable, ScrollView, Text, useWindowDimensions, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { VideoView, useVideoPlayer } from "expo-video";
import { MapPin, Pencil, Settings, X } from "lucide-react-native";

import { useActiveAccount } from "../../services/activeAccount";
import {
  Band,
  BandRosterMember,
  getBandRosterMembers,
  useBand,
  useBandMemberships,
} from "../../services/bands";
import { useUser } from "../../services/auth";
import {
  parseStoredList,
  parseStoredVideos,
  ProfileVideo as StoredProfileVideo,
  getAgeFromBirthDate,
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

function BandAccountProfile({
  band,
  isLeader,
}: {
  band: Band;
  isLeader: boolean;
}) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const initial = band.name?.trim().charAt(0).toUpperCase() || "?";
  const [rosterMembers, setRosterMembers] = useState<BandRosterMember[]>([]);
  const [activeVideo, setActiveVideo] = useState<StoredProfileVideo | null>(null);
  const videos = parseStoredVideos(band.videos);

  useEffect(() => {
    getBandRosterMembers(band.id)
      .then(setRosterMembers)
      .catch(() => {
        setRosterMembers([]);
      });
  }, [band.id]);

  return (
    <ScrollView className="flex-1 bg-[#0a0a0a]" showsVerticalScrollIndicator={false}>
      <View className="h-[460px] relative bg-[#1a0a2e]">
        {band.image_url ? (
          <Image source={{ uri: band.image_url }} className="w-full h-full" />
        ) : (
          <View className="w-full h-full bg-[#1a0a2e] items-center justify-center">
            <Text className="text-8xl font-bold text-pink-300">{initial}</Text>
          </View>
        )}
        <View className="absolute inset-0 bg-black/35" />
        {isLeader && (
          <Pressable onPress={() => router.push("/BandSetup")} className="absolute top-12 left-5 p-3 bg-black/50 rounded-full">
            <Pencil size={20} color="white" />
          </Pressable>
        )}
        <Pressable onPress={() => router.push("/Settings")} className="absolute top-12 right-5 p-3 bg-black/50 rounded-full">
          <Settings size={20} color="white" />
        </Pressable>
        <View className="absolute bottom-0 left-0 right-0 px-6 py-6">
          <Text className="text-4xl font-bold text-white mb-3">{band.name ?? "Band"}</Text>
          <View className="flex-row flex-wrap gap-2">
            {band.genre && (
              <View className="px-3 py-1 bg-purple-600 rounded-full">
                <Text className="text-white text-xs font-medium">{band.genre}</Text>
              </View>
            )}
            {band.location && (
              <View className="flex-row items-center gap-1 px-3 py-1 bg-pink-600 rounded-full">
                <MapPin size={12} color="white" />
                <Text className="text-white text-xs font-medium">{band.location}</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View className="px-6 py-7">
        <Pressable onPress={() => router.push("/BandPosts")} className="py-4 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] mb-6">
          <Text className="text-white text-center font-semibold">Manage band posts</Text>
        </Pressable>
        <Text className="text-xl font-bold text-white mb-2">About the band</Text>
        <Text className="text-gray-400 leading-relaxed">
          {band.description ?? "This band has not added a description yet."}
        </Text>

        {videos.length > 0 && (
          <View className="mt-8">
            <Text className="text-xl font-bold text-white mb-3">Performance videos</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {videos.map((video, index) => (
                <VideoGalleryItem
                  key={video.url}
                  video={video}
                  index={index}
                  onPress={() => setActiveVideo(video)}
                />
              ))}
            </ScrollView>
          </View>
        )}

        <View className="mt-8">
          <Text className="text-xl font-bold text-white mb-3">Band members</Text>
          {rosterMembers.length === 0 && (
            <Text className="text-gray-400">This band has not added public roster details yet.</Text>
          )}
          {rosterMembers.length > 0 && (
            <>
              <Text className="text-gray-500 text-sm mb-3">Swipe to meet the band</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={width - 36}
                decelerationRate="fast"
                contentContainerStyle={{ gap: 12 }}
              >
                {rosterMembers.map((member) => (
                  <View
                    key={member.id}
                    style={{ width: width - 48 }}
                    className="rounded-2xl overflow-hidden bg-[#1a1a1a] border border-[#2a2a2a]"
                  >
                    {member.imageUrl ? (
                      <Image source={{ uri: member.imageUrl }} className="w-full h-80" />
                    ) : (
                      <View className="w-full h-80 bg-pink-900 items-center justify-center">
                        <Text className="text-8xl font-bold text-pink-200">
                          {member.name.trim().charAt(0).toUpperCase()}
                        </Text>
                      </View>
                    )}
                    <View className="p-5">
                      <Text className="text-2xl font-bold text-white">
                        {member.name}{member.age !== null ? `, ${member.age}` : ""}
                      </Text>
                      <Text className="text-white mt-1">{member.role ?? "Band member"}</Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </>
          )}
        </View>

      </View>
      {activeVideo && (
        <FullscreenVideo source={activeVideo.url} onClose={() => setActiveVideo(null)} />
      )}
    </ScrollView>
  );
}

export default function Profile() {
  const router = useRouter();
  const { user } = useUser();
  const { musician, loading, error } = useMusician(user?.id);
  const [activeVideo, setActiveVideo] = useState<StoredProfileVideo | null>(null);
  const {
    activeAccount,
    loading: accountLoading,
    refresh: refreshActiveAccount,
  } = useActiveAccount(user?.id);
  const selectedBandId =
    activeAccount.type === "band" ? activeAccount.bandId : undefined;
  const {
    band: activeBand,
    loading: activeBandLoading,
    error: activeBandError,
    refresh: refreshActiveBand,
  } = useBand(selectedBandId);
  const { memberships, loading: membershipsLoading } = useBandMemberships(
    selectedBandId ? user?.id : undefined
  );
  useFocusEffect(
    useCallback(() => {
      refreshActiveAccount();
      refreshActiveBand();
    }, [refreshActiveAccount, refreshActiveBand])
  );

  if (loading || accountLoading || activeBandLoading || membershipsLoading) {
    return <View className="flex-1 bg-[#0a0a0a]" />;
  }

  if (error || !musician) {
    return (
      <View className="flex-1 items-center justify-center bg-[#0a0a0a] px-6">
        <Text className="text-gray-400 text-center">{error ?? "Your profile is unavailable."}</Text>
      </View>
    );
  }

  if (activeAccount.type === "band") {
    if (activeBandError || !activeBand) {
      return (
        <View className="flex-1 items-center justify-center bg-[#0a0a0a] px-6">
          <Text className="text-gray-400 text-center">
            {activeBandError ?? "The active band account is unavailable."}
          </Text>
          <Pressable onPress={() => router.push("/Bands")} className="mt-4 px-4 py-3 bg-purple-600 rounded-xl">
            <Text className="text-white font-medium">Switch account</Text>
          </Pressable>
        </View>
      );
    }

    return (
      <BandAccountProfile
        band={activeBand}
        isLeader={
          memberships.find((membership) => membership.bandId === activeBand.id)
            ?.isLeader === true
        }
      />
    );
  }

  const genres = parseStoredList(musician.genres);
  const roles = parseStoredList(musician.roles);
  const videos = parseStoredVideos(musician.videos);
  const age = getAgeFromBirthDate(musician.Age);
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
          <Text className="text-4xl font-bold text-white mb-3">
            {musician.name ?? "Musician"}{age !== null ? `, ${age}` : ""}
          </Text>
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
