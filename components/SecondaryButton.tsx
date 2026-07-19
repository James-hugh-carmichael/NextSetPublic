import { Pressable, Text, View } from "react-native";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  icon?: ReactNode;
  onPress?: () => void;
  className?: string;
};

export default function SecondaryButton({
  children,
  icon,
  onPress,
  className = "",
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      className={`w-full py-3 border border-red-500/30 rounded-xl flex-row items-center justify-center gap-2 ${className}`}
    >
      {icon && (
        <View className="flex-shrink-0">{icon}</View>
      )}
      <Text className="text-red-500 text-center font-medium">
        {children}
      </Text>
    </Pressable>
  );
}