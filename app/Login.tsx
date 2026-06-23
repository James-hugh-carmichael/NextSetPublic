import { useState } from "react";
import { useRouter } from "expo-router";
import { View, Text, TextInput, Pressable } from "react-native";
import { Music2 } from "lucide-react-native";
import { signIn, signUp } from "../services/auth";

export default function Login() {
  const router = useRouter();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async () => {
    if (!email || !password) return;

    if (isSignUp) {
      const { data, error } = await signUp(email, password);

      if (error) {
        console.log("Sign up error:", error.message);
        return;
      }
      alert("Check your email to confirm your account");
      router.push("/Onboarding");
    } else {
      const { data, error } = await signIn(email, password);

      if (error) {
        console.log("Login error:", error.message);
        return;
      }
      router.push("/(tabs)/Feed");
    }
  };

  return (
    <View className="flex-1 items-center justify-center bg-gradient-to-b from-[#0a0a0a] to-[#1a0a2e] px-6">
      <View className="w-full max-w-md">
        {/* Header */}
        <View className="items-center mb-12">
          <View className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-2xl mb-4">
            <Music2 size={48} color="white" />
          </View>

          <Text className="text-4xl font-bold text-white mb-2">
            BandMatch
          </Text>

          <Text className="text-gray-400 text-center">
            Find your perfect musical connection
          </Text>
        </View>

        {/* Form */}
        <View className="space-y-4">
          {/* Email */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-300 mb-2">
              Email
            </Text>

            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="your@email.com"
              placeholderTextColor="#6b7280"
              className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white"
            />
          </View>

          {/* Password */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-300 mb-2">
              Password
            </Text>

            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor="#6b7280"
              secureTextEntry
              className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white"
            />
          </View>

          {/* Submit */}
          <Pressable
            onPress={handleSubmit}
            className="w-full py-3 bg-purple-600 rounded-xl"
          >
            <Text className="text-white text-center font-semibold">
              {isSignUp ? "Sign Up" : "Log In"}
            </Text>
          </Pressable>

          {/* Toggle */}
          <Pressable
            onPress={() => setIsSignUp(!isSignUp)}
            className="mt-6"
          >
            <Text className="text-center text-gray-400">
              {isSignUp
                ? "Already have an account? Log in"
                : "Don't have an account? Sign up"}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}