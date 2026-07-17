import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useAccount } from "@/account";
import { useI18n } from "@/i18n";
import { ThemedScreen } from "@/components/ui/ThemedScreen";
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

  return <ThemedScreen><ScrollView contentContainerClassName="pb-40 pt-14">
    <View className="px-5"><View className="flex-row items-center justify-between"><Text style={{ color: tokens.text, fontSize: 28, fontWeight: "800" }}>{t("profileTitle")}</Text><Pressable className="h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.surfaceBorder }} onPress={() => router.push("/settings")}><Text style={{ color: tokens.text, fontSize: 17 }}>⚙</Text></Pressable></View>
      <Pressable className="mt-8 flex-row items-center" onPress={() => router.push("/onboarding")}><Image className="h-[76px] w-[76px] rounded-full" source={{ uri: profile?.avatarUrl }} style={{ backgroundColor: `${tokens.accent}24`, borderWidth: 2, borderColor: `${tokens.accent}88` }} /><View className="ml-4 min-w-0 flex-1"><Text numberOfLines={1} style={{ color: tokens.text, fontSize: 22, fontWeight: "800" }}>{profile?.displayName || t("notSignedIn")}</Text><Text className="mt-1 text-xs" numberOfLines={1} style={{ color: tokens.mutedText }}>{profile?.backendUrl || t("apiReady")}</Text></View><Text style={{ color: tokens.mutedText, fontSize: 24 }}>›</Text></Pressable>
    </View>
    <View className="mt-12 px-5"><View className="flex-row items-baseline justify-between"><Text style={{ color: tokens.text, fontSize: 21, fontWeight: "800" }}>{t("myPlaylists")}</Text><Pressable onPress={() => void loadPlaylists()}><Text style={{ color: tokens.accent, fontSize: 12, fontWeight: "800" }}>{t("refresh")}</Text></Pressable></View>
      <View className="relative mt-5 h-[176px]">
        {loading ? <View className="h-full items-center justify-center"><ActivityIndicator color={tokens.accent} /></View> : null}
        {!loading && playlists.map((playlist, index) => <Pressable key={playlist.id} className="absolute overflow-hidden" style={{ width: 138, height: 138, left: index * 70 + 6, top: index === 1 ? 20 : index === 2 ? 4 : 30, zIndex: index + 1, borderRadius: 18, transform: [{ rotate: index === 0 ? "-10deg" : index === 1 ? "3deg" : "11deg" }], shadowColor: "#152233", shadowOpacity: 0.24, shadowRadius: 14, shadowOffset: { width: 0, height: 8 }, elevation: 6 }} onPress={() => router.replace("/(tabs)/library")}><Image className="h-full w-full" source={{ uri: playlist.coverUrl }} contentFit="cover" /></Pressable>)}
        {!loading && !playlists.length ? <Pressable className="h-[138px] items-center justify-center rounded-[18px] border" style={{ borderColor: tokens.surfaceBorder, backgroundColor: tokens.surface }} onPress={() => router.push("/sources")}><Text style={{ color: tokens.mutedText, fontSize: 13 }}>{t("myPlaylistsUnavailable")}</Text></Pressable> : null}
      </View>
    </View>
  </ScrollView></ThemedScreen>;
}