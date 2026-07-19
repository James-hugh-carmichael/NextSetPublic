import { Modal, View, Text, Pressable, Image } from "react-native";
import { Check, Plus } from "lucide-react-native";
import type { MyBand } from "../hooks/useMyBands";

const FALLBACK_IMAGE = "https://via.placeholder.com/150?text=No+Image";

type Props = {
  visible: boolean;
  onClose: () => void;
  musicianName: string | null;
  musicianAvatarUrl: string | null;
  bands: MyBand[];
  onSelectMusician: () => void;
  onSelectBand: (band: MyBand) => void;
  onCreateBand: () => void;
};

export default function ProfileSwitcherSheet({
  visible,
  onClose,
  musicianName,
  musicianAvatarUrl,
  bands,
  onSelectMusician,
  onSelectBand,
  onCreateBand,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable className="flex-1 bg-black/60 justify-end" onPress={onClose}>
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="bg-[#1a1a1a] rounded-t-3xl pb-8 pt-3 px-4"
        >
          <View className="w-10 h-1 bg-[#3a3a3a] rounded-full self-center mb-4" />

          {/* musician profile */}
          <Pressable
            onPress={onSelectMusician}
            className="flex-row items-center py-3"
          >
            <Image
              source={{ uri: musicianAvatarUrl || FALLBACK_IMAGE }}
              className="w-11 h-11 rounded-full bg-[#2a2a2a]"
            />
            <View className="flex-1 ml-3">
              <Text className="text-white font-medium text-base">
                {musicianName || "Your profile"}
              </Text>
              <Text className="text-gray-500 text-xs">Musician profile</Text>
            </View>
            <View className="w-6 h-6 rounded-full bg-purple-600 items-center justify-center">
              <Check size={14} color="white" />
            </View>
          </Pressable>


          {/* band profile user has */}
          {bands.map((band) => (
            <Pressable
              key={band.id}
              onPress={() => onSelectBand(band)}
              className="flex-row items-center py-3"
            >
              <Image
                source={{ uri: band.image_url || FALLBACK_IMAGE }}
                className="w-11 h-11 rounded-full bg-[#2a2a2a]"
              />
              <View className="flex-1 ml-3">
                <Text className="text-white font-medium text-base">
                  {band.name || "Unnamed band"}
                </Text>
                <Text className="text-gray-500 text-xs">
                  {band.is_leader ? "Leader" : band.role || "Member"}
                </Text>
              </View>
            </Pressable>
          ))}

          <View className="h-[1px] bg-[#2a2a2a] my-2" />

          {/* create a new band */}
          <Pressable
            onPress={onCreateBand}
            className="flex-row items-center py-3"
          >
            <View className="w-11 h-11 rounded-full border border-[#3a3a3a] items-center justify-center">
              <Plus size={20} color="#a855f7" />
            </View>
            <Text className="text-white font-medium text-base ml-3">
              Create a Band
            </Text>
          </Pressable>

        </Pressable>
      </Pressable>
    </Modal>
  );
}