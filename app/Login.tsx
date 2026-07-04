import { useState } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator } from "react-native";
import { Music2, MailCheck } from "lucide-react-native";
import { signIn, signUp } from "../services/auth";

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [pendingConfirmation, setPendingConfirmation] = useState(false);

  const handleSubmit = async () => {
    setErrorMsg(null);

    if (!email.trim() || !password) {
      setErrorMsg("Please enter your email and password.");
      return;
    }

    setSubmitting(true);

    if (isSignUp) {
      const { data, error } = await signUp(email, password);

      if (error) {
        setErrorMsg(error.message);
        setSubmitting(false);
        return;
      }
      setSubmitting(false);

 
      if (!data?.session) {
        setPendingConfirmation(true);
      }
    } else {
      const { error } = await signIn(email, password);

      if (error) {
        setErrorMsg(error.message);
        setSubmitting(false);
        return;
      }

      setSubmitting(false);
    }
  };

  if (pendingConfirmation) {
    return (
      <View className="flex-1 items-center justify-center bg-gradient-to-b from-[#0a0a0a] to-[#1a0a2e] px-6">
        <View className="w-full max-w-md items-center">
          <View className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-2xl mb-6">
            <MailCheck size={48} color="white" />
          </View>

          <Text className="text-2xl font-bold text-white mb-3 text-center">
            Check your email
          </Text>

          <Text className="text-gray-400 text-center mb-8">
            We sent a confirmation link to {email}. Tap it, then come back
            and log in to finish setting up your profile.
          </Text>

          <Pressable
            onPress={() => {
              setPendingConfirmation(false);
              setIsSignUp(false);
              setPassword("");
            }}
            className="w-full py-3 bg-purple-600 rounded-xl"
          >
            <Text className="text-white text-center font-semibold">
              Back to log in
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 items-center justify-center bg-gradient-to-b from-[#0a0a0a] to-[#1a0a2e] px-6">
      <View className="w-full max-w-md">
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

        <View className="space-y-4">
          {errorMsg && (
            <View className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-2">
              <Text className="text-red-400 text-sm">{errorMsg}</Text>
            </View>
          )}

          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-300 mb-2">
              Email
            </Text>

            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="your@email.com"
              placeholderTextColor="#6b7280"
              autoCapitalize="none"
              keyboardType="email-address"
              className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white"
            />
          </View>

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

          <Pressable
            onPress={handleSubmit}
            disabled={submitting}
            className={`w-full py-3 bg-purple-600 rounded-xl flex-row items-center justify-center gap-2 ${
              submitting ? "opacity-60" : ""
            }`}
          >
            {submitting && <ActivityIndicator color="white" />}
            <Text className="text-white text-center font-semibold">
              {submitting ? "Please wait..." : isSignUp ? "Sign Up" : "Log In"}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              setIsSignUp(!isSignUp);
              setErrorMsg(null);
            }}
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