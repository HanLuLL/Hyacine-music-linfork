import { Text, TextInput, View } from "react-native";

export default function SearchScreen(): React.JSX.Element {
  return (
    <View className="flex-1 bg-zinc-950 px-5 pt-16">
      <Text className="text-3xl font-bold text-white">Search</Text>
      <TextInput
        className="mt-7 rounded bg-zinc-900 px-4 py-4 text-base text-white"
        placeholder="Songs, artists, or playlists"
        placeholderTextColor="#a1a1aa"
        returnKeyType="search"
      />
      <Text className="mt-8 text-sm leading-6 text-zinc-400">
        Search requests will use the backend track endpoint. Source-specific integration
        remains server-side.
      </Text>
    </View>
  );
}