import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Alert, Image, Modal, Pressable, ScrollView, Text, View } from "react-native";
import { VideoView, useVideoPlayer } from "expo-video";
import { ArrowLeft, MapPin, UserPlus, X } from "lucide-react-native";

import { useUser } from "../services/auth";
import { getBandRosterMembers, BandRosterMember } from "../services/bands";
import { BandPost, getBandPost, parseRoles, requestToJoin } from "../services/bandPosts";
import { parseStoredVideos, ProfileVideo } from "../services/musicians";

function FullscreenVideo({ source, onClose }: { source: string; onClose: () => void }) {
  const player = useVideoPlayer(source, (videoPlayer) => {
    videoPlayer.loop = false;
    videoPlayer.play();
  });

  return (
    <Modal visible animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <View className="flex-1 bg-black">
        <VideoView player={player} nativeControls contentFit="contain" style={{ flex: 1 }} />
        <Pressable onPress={onClose} className="absolute top-12 right-5 p-3 rounded-full bg-black/60">
          <X size={24} color="white" />
        </Pressable>
      </View>
    </Modal>
  );
}

export default function BandDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useUser();
  const [post, setPost] = useState<BandPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requesting, setRequesting] = useState(false);
  const [requestStatus, setRequestStatus] = useState<string | null>(null);
  const [rosterMembers, setRosterMembers] = useState<BandRosterMember[]>([]);
  const [activeVideo, setActiveVideo] = useState<ProfileVideo | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError("This opportunity could not be found.");
      return;
    }

    getBandPost(id)
      .then((data) => {
        setPost(data);
        if (!data) {
          setError("This opportunity is no longer available.");
        }
      })
      .catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : "Unable to load this opportunity.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!post?.band_id) {
      setRosterMembers([]);
      return;
    }

    getBandRosterMembers(post.band_id)
      .then(setRosterMembers)
      .catch(() => {
        setRosterMembers([]);
      });
  }, [post?.band_id]);

  const handleRequest = async () => {
    if (!user || !post) {
      Alert.alert("Sign in required", "Please sign in again before applying.");
      return;
    }

    setRequesting(true);
    try {
      const request = await requestToJoin(post.id, user.id);
      setRequestStatus(request.status ?? "pending");
    } catch (requestError) {
      const message =
        requestError instanceof Error ? requestError.message : "Your request could not be sent.";
      Alert.alert("Unable to send request", message);
    } finally {
      setRequesting(false);
    }
  };

  if (loading) {
    return <View className="flex-1 bg-[#0a0a0a]" />;
  }

  if (error || !post) {
    return (
      <View className="flex-1 items-center justify-center bg-[#0a0a0a] px-6">
        <Text className="text-center text-gray-400">{error ?? "Opportunity unavailable."}</Text>
      </View>
    );
  }

  const band = post.band;
  const roles = parseRoles(post.roles_needed);
  const opportunityLocation = post.location ?? band?.location;
  const videos = parseStoredVideos(band?.videos ?? null);

  return (
    <ScrollView className="flex-1 bg-[#0a0a0a]" showsVerticalScrollIndicator={false}>
      <View className="relative">
        {band?.image_url ? (
          <View className="h-64">
            <Image source={{ uri: band.image_url }} className="w-full h-full" />
            <View className="absolute inset-0 bg-black/50" />
          </View>
        ) : (
          <View className="h-40 bg-purple-900/30" />
        )}
        <Pressable onPress={() => router.back()} className="absolute top-12 left-4 p-2 bg-black/50 rounded-full">
          <ArrowLeft size={24} color="white" />
        </Pressable>
      </View>

      <View className="px-6 py-6">
        <Text className="text-3xl font-bold text-white mb-2">{post.title ?? "Band opportunity"}</Text>
        <Text className="text-xl text-gray-200 mb-3">{band?.name ?? "Unnamed band"}</Text>
        <View className="flex-row items-center flex-wrap gap-3 mb-6">
          {band?.genre && (
            <View className="px-3 py-1 bg-purple-600 rounded-full">
              <Text className="text-white font-medium">{band.genre}</Text>
            </View>
          )}
          {opportunityLocation && (
            <View className="flex-row items-center gap-1">
              <MapPin size={14} color="#ccc" />
              <Text className="text-gray-300 text-sm">Gig location: {opportunityLocation}</Text>
            </View>
          )}
        </View>

        <View className="mb-6">
          <Text className="text-xl font-bold text-white mb-3">What the band is looking for</Text>
          {post.description ? (
            <Text className="text-gray-400 leading-relaxed mb-4">{post.description}</Text>
          ) : (
            <Text className="text-gray-400 mb-4">The band has not added a description yet.</Text>
          )}
          {roles.length === 0 ? (
            <Text className="text-gray-400">The band has not listed roles yet.</Text>
          ) : (
            <View className="flex-row flex-wrap gap-2">
              {roles.map((role) => (
                <View key={role} className="px-3 py-2 bg-pink-600/20 border border-pink-500/30 rounded-full">
                  <Text className="text-pink-400 font-medium">{role}</Text>
                </View>
              ))}
            </View>
          )}
          {post.commitment_level && (
            <Text className="text-gray-400 mt-4">{post.commitment_level} commitment</Text>
          )}
        </View>

        {band?.description && (
          <View className="mb-6">
            <Text className="text-xl font-bold text-white mb-3">About the band</Text>
            <Text className="text-gray-400 leading-relaxed">{band.description}</Text>
          </View>
        )}

        <View className="mb-6">
          <Text className="text-xl font-bold text-white mb-3">Performance videos</Text>
          {videos.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {videos.map((video, index) => (
                <Pressable key={video.url} onPress={() => setActiveVideo(video)} className="w-36 h-56 mr-3 rounded-2xl overflow-hidden bg-[#1a1a1a]">
                  {video.thumbnailUrl ? (
                    <Image source={{ uri: video.thumbnailUrl }} className="w-full h-full" />
                  ) : (
                    <View className="w-full h-full items-center justify-center">
                      <Text className="text-gray-500 text-xs text-center px-2">Performance video {index + 1}</Text>
                    </View>
                  )}
                </Pressable>
              ))}
            </ScrollView>
          ) : (
            <Text className="text-gray-400">This band has not added performance videos yet.</Text>
          )}
        </View>

        {rosterMembers.length > 0 && (
          <View className="mb-6">
            <Text className="text-xl font-bold text-white mb-3">Meet the band</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {rosterMembers.map((member) => (
                <View key={member.id} className="w-28 mr-3">
                  {member.imageUrl ? (
                    <Image source={{ uri: member.imageUrl }} className="w-28 h-28 rounded-2xl mb-2" />
                  ) : (
                    <View className="w-28 h-28 rounded-2xl mb-2 bg-pink-900 items-center justify-center">
                      <Text className="text-4xl font-bold text-pink-200">
                        {member.name.trim().charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <Text className="text-white font-medium" numberOfLines={1}>
                    {member.name}{member.age !== null ? `, ${member.age}` : ""}
                  </Text>
                  <Text className="text-white text-sm" numberOfLines={1}>
                    {member.role ?? "Band member"}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        <Pressable
          onPress={handleRequest}
          disabled={requesting || Boolean(requestStatus)}
          className={`py-3 rounded-xl flex-row items-center justify-center gap-2 mb-6 ${
            requestStatus ? "bg-green-700" : requesting ? "bg-purple-900" : "bg-purple-600"
          }`}
        >
          <UserPlus size={20} color="white" />
          <Text className="text-white font-medium">
            {requestStatus ? `Request ${requestStatus}` : requesting ? "Sending request..." : "Request to Join"}
          </Text>
        </Pressable>

      </View>
      {activeVideo && (
        <FullscreenVideo source={activeVideo.url} onClose={() => setActiveVideo(null)} />
      )}
    </ScrollView>
  );
}
