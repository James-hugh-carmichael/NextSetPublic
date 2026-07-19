import { Pressable, Text, ActivityIndicator, View } from "react-native";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  icon?: ReactNode;
  loading?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  className?: string;
};

export default function PrimaryButton({
  children,
  icon,
  loading = false,
  disabled = false,
  onPress,
  className = "",
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={loading || disabled}
      className={`w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex-row items-center justify-center gap-2 ${
        loading || disabled ? "opacity-60" : ""
      } ${className}`}
    >
      {loading && <ActivityIndicator color="white" size={20} />}
      {icon && (
        <View className="flex-shrink-0">{icon}</View>
      )}
      <Text className="text-white text-center font-semibold">
        {loading ? "Please wait..." : children}
      </Text>
    </Pressable>
  );
}