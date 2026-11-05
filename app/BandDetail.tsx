import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Alert, Image, Pressable, ScrollView, Text, View } from "react-native";
import { ArrowLeft, MapPin, UserPlus } from "lucide-react-native";

import { useUser } from "../services/auth";
import { BandPost, getBandPost, parseRoles, requestToJoin } from "../services/bandPosts";

export default function BandDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useUser();
  const [post, setPost] = useState<BandPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requesting, setRequesting] = useState(false);
  const [requestStatus, setRequestStatus] = useState<string | null>(null);

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
          {band?.location && (
            <View className="flex-row items-center gap-1">
              <MapPin size={14} color="#ccc" />
              <Text className="text-gray-300 text-sm">{band.location}</Text>
            </View>
          )}
        </View>

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

        {post.description && (
          <View className="mb-6">
            <Text className="text-xl font-bold text-white mb-3">About this opportunity</Text>
            <Text className="text-gray-400 leading-relaxed">{post.description}</Text>
          </View>
        )}
        {band?.description && (
          <View className="mb-6">
            <Text className="text-xl font-bold text-white mb-3">About the band</Text>
            <Text className="text-gray-400 leading-relaxed">{band.description}</Text>
          </View>
        )}
        <View className="mb-6">
          <Text className="text-xl font-bold text-white mb-3">Roles needed</Text>
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
        </View>
        {post.commitment_level && (
          <View>
            <Text className="text-xl font-bold text-white mb-2">Commitment</Text>
            <Text className="text-gray-400">{post.commitment_level}</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
