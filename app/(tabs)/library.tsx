import { Pressable, Text, View } from "react-native";
import * as MediaLibrary from "expo-media-library";
import { useI18n } from "@/i18n";

export default function LibraryScreen(): React.JSX.Element {
  const { t } = useI18n();

  async function requestLibraryAccess(): Promise<void> {
    await MediaLibrary.requestPermissionsAsync();
  }

  return (
    <View className="flex-1 bg-[#09090b] px-5 pt-16">
      <Text className="text-3xl font-bold tracking-tight text-white">{t("library")}</Text>
      <View className="mt-8 items-center rounded-3xl border border-zinc-800 bg-[#121214] px-6 py-10">
        <View className="h-16 w-16 items-center justify-center rounded-full bg-lime-300/10">
          <Text className="text-3xl text-lime-300">♫</Text>
        </View>
        <Text className="mt-6 text-xl font-bold text-white">{t("localTitle")}</Text>
        <Text className="mt-3 text-center text-sm leading-6 text-zinc-500">{t("localHint")}</Text>
        <Pressable
          className="mt-7 rounded-full bg-lime-300 px-5 py-3"
          onPress={() => void requestLibraryAccess()}
        >
          <Text className="font-bold text-[#171a13]">{t("allowAudio")}</Text>
        </Pressable>
      </View>
      <Text className="mt-5 text-center text-xs text-zinc-600">{t("permissionNote")}</Text>
    </View>
  );
}