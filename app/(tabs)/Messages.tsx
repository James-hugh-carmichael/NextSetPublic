import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Image,
} from "react-native";
import { Search } from "lucide-react-native";

const conversations = [
  {
    id: 1,
    bandName: "The Midnight Riders",
    lastMessage:
      "Thanks for your interest! Can you tell us more about your experience?",
    timestamp: "2m ago",
    unread: true,
    image:
      "https://images.unsplash.com/photo-1552595458-e8ad6af8aa10?auto=format&fit=crop&w=200",
  },
  {
    id: 2,
    bandName: "Jazz Collective",
    lastMessage: "We'd love to have you audition next week",
    timestamp: "1h ago",
    unread: true,
    image:
      "https://images.unsplash.com/photo-1767462372393-e6fdecd8314b?auto=format&fit=crop&w=200",
  },
  {
    id: 3,
    bandName: "Electric Dreams",
    lastMessage: "Sounds great! Let me check our schedule",
    timestamp: "5h ago",
    unread: false,
    image:
      "https://images.unsplash.com/photo-1771229139173-18d2538a6ab8?auto=format&fit=crop&w=200",
  },
  {
    id: 4,
    bandName: "Metal Forge",
    lastMessage: "You: I've been playing drums for 8 years",
    timestamp: "Yesterday",
    unread: false,
    image:
      "https://images.unsplash.com/photo-1772587000150-73b49a4069f9?auto=format&fit=crop&w=200",
  },
  {
    id: 5,
    bandName: "Acoustic Souls",
    lastMessage:
      "Thanks for reaching out! We'll get back to you soon",
    timestamp: "2d ago",
    unread: false,
    image:
      "https://images.unsplash.com/photo-1771694942395-879a480856e4?auto=format&fit=crop&w=200",
  },
];

export default function Messages() {
  const [search, setSearch] = useState("");

  const filtered = conversations.filter((c) =>
    c.bandName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View className="flex-1 bg-[#0a0a0a]">
      {/* Header */}
      <View className="pt-16 pb-6 px-6 bg-gradient-to-b from-purple-900/30 to-transparent">
        <Text className="text-3xl font-bold text-white mb-4">
          Messages
        </Text>

        {/* Search */}
        <View className="relative">
          <View className="absolute left-4 top-3 z-10">
            <Search size={20} color="#6b7280" />
          </View>

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search conversations"
            placeholderTextColor="#6b7280"
            className="w-full pl-12 pr-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white"
          />
        </View>
      </View>

      {/* List */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {filtered.map((conversation) => (
          <Pressable
            key={conversation.id}
            className="flex-row items-center gap-4 px-6 py-4 border-b border-[#1a1a1a]"
          >
            {/* Avatar */}
            <View className="relative">
              <Image
                source={{ uri: conversation.image }}
                className="w-14 h-14 rounded-full bg-[#2a2a2a]"
              />

              {conversation.unread && (
                <View className="absolute -top-1 -right-1 w-3 h-3 bg-purple-600 rounded-full border border-[#0a0a0a]" />
              )}
            </View>

            {/* Text */}
            <View className="flex-1 min-w-0">
              <View className="flex-row justify-between mb-1">
                <Text
                  className={`font-medium truncate ${
                    conversation.unread
                      ? "text-white"
                      : "text-gray-300"
                  }`}
                >
                  {conversation.bandName}
                </Text>

                <Text className="text-xs text-gray-500 ml-2">
                  {conversation.timestamp}
                </Text>
              </View>

              <Text
                className={`text-sm truncate ${
                  conversation.unread
                    ? "text-gray-300"
                    : "text-gray-500"
                }`}
              >
                {conversation.lastMessage}
              </Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}