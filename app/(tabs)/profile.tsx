import { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useAccount } from "@/account";
import { ThemedScreen } from "@/components/ui/ThemedScreen";
import { useAudio } from "@/hooks/useAudio";
import { useI18n } from "@/i18n";
import { loadListeningHistory } from "@/services/listeningHistory";
import { useTheme } from "@/theme";
import type { Track } from "@/types/music";

export default function ProfileScreen(): React.JSX.Element {
  const { t } = useI18n();
  const { profile } = useAccount();
  const { tokens } = useTheme();
  const { playTrack } = useAudio();
  const [history, setHistory] = useState<Track[]>([]);

  const refreshHistory = useCallback(async (): Promise<void> => {
    setHistory(await loadListeningHistory());
  }, []);

  useEffect(() => {
    void refreshHistory();
  }, [refreshHistory]);

  const sourceName = profile?.musicSource === "netease" ? "网易云音乐已绑定" : profile?.musicSource === "bilibili" ? "哔哩哔哩已绑定" : "尚未绑定音乐服务";

  return (
    <ThemedScreen>
      <ScrollView contentContainerClassName="px-5 pb-40 pt-14">
        <View className="flex-row items-center justify-between">
          <Text style={{ color: tokens.text, fontSize: 28, fontWeight: "800" }}>{t("profileTitle")}</Text>
          <Pressable className="h-12 w-12 items-center justify-center rounded-full" style={{ borderWidth: 1, borderColor: tokens.surfaceBorder }} onPress={() => router.push("/settings")}>
            <Text style={{ color: tokens.text, fontSize: 19 }}>⚙</Text>
          </Pressable>
        </View>

        <View className="mt-8 overflow-hidden border" style={{ backgroundColor: "transparent", borderColor: tokens.surfaceBorder, borderRadius: 28 }}>
          <Pressable className="flex-row items-center p-5" style={{ backgroundColor: "transparent" }} onPress={() => router.push("/onboarding")}>
            <View className="h-20 w-20 overflow-hidden rounded-full" style={{ backgroundColor: `${tokens.accent}24`, borderWidth: 2, borderColor: `${tokens.accent}88` }}>
              {profile?.avatarUrl ? <Image className="h-full w-full" source={{ uri: profile.avatarUrl }} contentFit="cover" /> : <Text className="pt-5 text-center" style={{ color: tokens.accent, fontSize: 24, fontWeight: "900" }}>{profile?.displayName?.slice(0, 1).toUpperCase() || "H"}</Text>}
            </View>
            <View className="ml-4 min-w-0 flex-1">
              <Text numberOfLines={1} style={{ color: tokens.text, fontSize: 22, fontWeight: "800" }}>{profile?.displayName || t("notSignedIn")}</Text>
              <Text className="mt-2 text-sm" numberOfLines={1} style={{ color: tokens.mutedText }}>{sourceName}</Text>
            </View>
            <Text style={{ color: tokens.mutedText, fontSize: 26 }}>›</Text>
          </Pressable>
        </View>

        <View className="mt-10 flex-row items-center justify-between">
          <Text style={{ color: tokens.text, fontSize: 21, fontWeight: "800" }}>听歌记录</Text>
          <Pressable onPress={() => void refreshHistory()}><Text style={{ color: tokens.accent, fontSize: 13, fontWeight: "800" }}>{t("refresh")}</Text></Pressable>
        </View>
        <View className="mt-4 gap-3">
          {history.map((track) => (
            <View key={track.id} className="overflow-hidden border" style={{ backgroundColor: "transparent", borderColor: tokens.surfaceBorder, borderRadius: 20 }}>
              <Pressable className="flex-row items-center p-3" style={{ backgroundColor: "transparent" }} onPress={() => void playTrack(track)}>
                <Image className="h-14 w-14 rounded-2xl" source={{ uri: track.artwork }} contentFit="cover" style={{ backgroundColor: `${tokens.text}12` }} />
                <View className="ml-3 min-w-0 flex-1">
                  <Text numberOfLines={1} style={{ color: tokens.text, fontWeight: "800" }}>{track.title}</Text>
                  <Text className="mt-1 text-xs" numberOfLines={1} style={{ color: tokens.mutedText }}>{track.artist}</Text>
                </View>
                <Text style={{ color: tokens.accent, fontSize: 18 }}>▶</Text>
              </Pressable>
            </View>
          ))}
          {!history.length ? <View className="items-center border py-10" style={{ backgroundColor: "transparent", borderColor: tokens.surfaceBorder, borderRadius: 24 }}><Text style={{ color: tokens.mutedText, fontSize: 14 }}>播放歌曲后会显示在这里</Text></View> : null}
        </View>
      </ScrollView>
    </ThemedScreen>
  );
}