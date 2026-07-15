import { Text, View } from "react-native";

export default function ProfileScreen(): React.JSX.Element {
  return (
    <View className="flex-1 bg-zinc-950 px-5 pt-16">
      <Text className="text-3xl font-bold text-white">Profile</Text>
      <View className="mt-8 rounded-lg border border-zinc-800 bg-zinc-900 p-5">
        <Text className="text-lg font-bold text-white">Not signed in</Text>
        <Text className="mt-2 text-sm leading-6 text-zinc-400">
          JWT tokens belong in Expo SecureStore. Authentication endpoints are ready to be
          connected through the shared API client.
        </Text>
      </View>
    </View>
  );
}