import { Pressable, Text, View } from "react-native";
import * as MediaLibrary from "expo-media-library";

export default function LibraryScreen(): React.JSX.Element {
  async function requestLibraryAccess(): Promise<void> {
    await MediaLibrary.requestPermissionsAsync();
  }

  return (
    <View className="flex-1 bg-zinc-950 px-5 pt-16">
      <Text className="text-3xl font-bold text-white">Library</Text>
      <Text className="mt-3 text-sm leading-6 text-zinc-400">
        Local scanning is permission-gated and varies by platform. Android 13 and later
        uses READ_MEDIA_AUDIO.
      </Text>
      <Pressable
        className="mt-7 self-start rounded border border-zinc-700 px-4 py-3"
        onPress={() => void requestLibraryAccess()}
      >
        <Text className="font-semibold text-lime-300">Allow local audio access</Text>
      </Pressable>
    </View>
  );
}