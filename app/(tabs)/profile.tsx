import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useAccount } from "@/account";
import { ThemedCard } from "@/components/ui/ThemedCard";
import { ThemedScreen } from "@/components/ui/ThemedScreen";
import { useI18n } from "@/i18n";
import { useTheme } from "@/theme";
import { apiBase } from "@/utils/apiBase";

interface PersonalPlaylist { id: number; name: string; coverUrl: string; }

export default function ProfileScreen(): React.JSX.Element {
  const { t } = useI18n();
  const { profile, getSourceCredential } = useAccount();
  const { tokens } = useTheme();
  const [playlists, setPlaylists] = useState<PersonalPlaylist[]>([]);
  const [loading, setLoading] = useState(false);

  const loadPlaylists = useCallback(async (): Promise<void> => {
    if (!profile || profile.musicSource !== "netease") return;
    setLoading(true);
    try {
      const cookie = await getSourceCredential("netease");
      if (!cookie) return;
      const response = await fetch(`${apiBase(profile.backendUrl)}/music-sources/netease/playlists`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cookie }),
      });
      const data = await response.json() as PersonalPlaylist[];
      setPlaylists(response.ok && Array.isArray(data) ? data.slice(0, 3) : []);
    } catch {
      setPlaylists([]);
    } finally {
      setLoading(false);
    }
  }, [getSourceCredential, profile]);

  useEffect(() => { void loadPlaylists(); }, [loadPlaylists]);
  const sourceName = profile?.musicSource === "netease" ? "网易云音乐已绑定" : profile?.musicSource === "bilibili" ? "哔哩哔哩已绑定" : "尚未绑定音乐服务";

  return (
    <ThemedScreen>
      <ScrollView contentContainerClassName="px-5 pb-40 pt-14">
        <View className="flex-row items-center justify-between">
          <Text style={{ color: tokens.text, fontSize: 28, fontWeight: "800" }}>{t("profileTitle")}</Text>
          <Pressable
            className="h-12 w-12 items-center justify-center rounded-full"
            style={{ backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.surfaceBorder }}
            onPress={() => router.push("/settings")}
          >
            <Text style={{ color: tokens.text, fontSize: 19 }}>⚙</Text>
          </Pressable>
        </View>

        <ThemedCard className="mt-8 p-0" style={{ borderRadius: 28 }}>
          <Pressable className="flex-row items-center p-5" onPress={() => router.push("/onboarding")}>
            <View className="h-20 w-20 overflow-hidden rounded-full" style={{ backgroundColor: `${tokens.accent}24`, borderWidth: 2, borderColor: `${tokens.accent}88` }}>
              {profile?.avatarUrl ? <Image className="h-full w-full" source={{ uri: profile.avatarUrl }} contentFit="cover" /> : <Text className="pt-5 text-center" style={{ color: tokens.accent, fontSize: 24, fontWeight: "900" }}>{profile?.displayName?.slice(0, 1).toUpperCase() || "H"}</Text>}
            </View>
            <View className="ml-4 min-w-0 flex-1">
              <Text numberOfLines={1} style={{ color: tokens.text, fontSize: 22, fontWeight: "800" }}>{profile?.displayName || t("notSignedIn")}</Text>
              <Text className="mt-2 text-sm" numberOfLines={1} style={{ color: tokens.mutedText }}>{sourceName}</Text>
              <Text className="mt-1 text-xs" numberOfLines={1} style={{ color: tokens.mutedText }}>{profile?.backendUrl || t("apiReady")}</Text>
            </View>
            <Text style={{ color: tokens.mutedText, fontSize: 26 }}>›</Text>
          </Pressable>
        </ThemedCard>

        <View className="mt-10 flex-row items-center justify-between">
          <Text style={{ color: tokens.text, fontSize: 21, fontWeight: "800" }}>{t("myPlaylists")}</Text>
          <Pressable onPress={() => void loadPlaylists()}><Text style={{ color: tokens.accent, fontSize: 13, fontWeight: "800" }}>{t("refresh")}</Text></Pressable>
        </View>

        <ThemedCard className="mt-4 min-h-[172px] p-4" style={{ borderRadius: 24 }}>
          {loading ? <View className="flex-1 items-center justify-center"><ActivityIndicator color={tokens.accent} /></View> : null}
          {!loading && playlists.length ? <View className="flex-row justify-between">{playlists.map((playlist) => <Pressable key={playlist.id} className="w-[31%]" onPress={() => router.replace("/(tabs)/library")}><Image className="aspect-square w-full rounded-2xl" source={{ uri: playlist.coverUrl }} contentFit="cover" /><Text className="mt-2 text-xs font-bold" numberOfLines={1} style={{ color: tokens.text }}>{playlist.name}</Text></Pressable>)}</View> : null}
          {!loading && !playlists.length ? <Pressable className="flex-1 items-center justify-center" onPress={() => router.push("/sources")}><Text style={{ color: tokens.mutedText, fontSize: 13 }}>{profile?.musicSource === "netease" ? "暂无歌单，点击刷新" : "绑定网易云音乐后查看我的歌单"}</Text></Pressable> : null}
        </ThemedCard>
      </ScrollView>
    </ThemedScreen>
  );
}