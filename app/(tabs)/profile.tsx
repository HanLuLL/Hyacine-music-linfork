import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useAccount } from "@/account";
import { languages, type Language, useI18n } from "@/i18n";
import { useAudio } from "@/hooks/useAudio";
import { usePlayerStore } from "@/store/playerStore";
import { ThemedScreen } from "@/components/ui/ThemedScreen";
import { useTheme } from "@/theme";

interface RecommendedPlaylist { id: number; name: string; coverUrl: string; }

const languageLabels: Record<Language, string> = { "zh-CN": "简体中文", en: "English", ja: "日本語" };

function apiBase(url: string): string {
  return url.trim().replace(/\/+$/, "").replace(/\/api\/v1$/, "") + "/api/v1";
}

export default function ProfileScreen(): React.JSX.Element {
  const { language, setLanguage, t } = useI18n();
  const { profile, getSourceCredential } = useAccount();
  const { tokens } = useTheme();
  const track = usePlayerStore((state) => state.currentTrack);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const { togglePlayback } = useAudio();
  const [playlists, setPlaylists] = useState<RecommendedPlaylist[]>([]);
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);

  const loadPlaylists = useCallback(async (): Promise<void> => {
    if (!profile || profile.musicSource !== "netease") return;
    setLoadingPlaylists(true);
    try {
      const cookie = await getSourceCredential("netease");
      if (!cookie) return;
      const response = await fetch(`${apiBase(profile.backendUrl)}/music-sources/netease/recommendations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cookie }),
      });
      const data = await response.json() as RecommendedPlaylist[];
      if (response.ok && Array.isArray(data)) setPlaylists(data.slice(0, 3));
    } catch {
      setPlaylists([]);
    } finally {
      setLoadingPlaylists(false);
    }
  }, [getSourceCredential, profile]);

  useEffect(() => { void loadPlaylists(); }, [loadPlaylists]);

  return <ThemedScreen><ScrollView contentContainerClassName="pb-40 pt-14">
    <View className="px-5"><View className="flex-row items-center justify-between"><Text style={{ color: tokens.text, fontSize: 28, fontWeight: "800" }}>{t("profileTitle")}</Text><Pressable className="h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.surfaceBorder }} onPress={() => router.push("/settings")}><Text style={{ color: tokens.text, fontSize: 17 }}>⚙</Text></Pressable></View>
      <Pressable className="mt-8 flex-row items-center" onPress={() => router.push("/onboarding")}><Image className="h-[76px] w-[76px] rounded-full" source={{ uri: profile?.avatarUrl }} style={{ backgroundColor: `${tokens.accent}24`, borderWidth: 2, borderColor: `${tokens.accent}88` }} /><View className="ml-4 min-w-0 flex-1"><Text numberOfLines={1} style={{ color: tokens.text, fontSize: 22, fontWeight: "800" }}>{profile?.displayName || t("notSignedIn")}</Text><Text className="mt-1 text-xs" numberOfLines={1} style={{ color: tokens.mutedText }}>{profile?.backendUrl || t("apiReady")}</Text><Text className="mt-2 text-xs font-bold" style={{ color: tokens.accent }}>{profile?.musicSource === "netease" ? t("neteaseCloud") : t("apiStatus")}</Text></View><Text style={{ color: tokens.mutedText, fontSize: 24 }}>›</Text></Pressable>
    </View>

    <View className="mt-10 px-5"><View className="flex-row items-baseline justify-between"><Text style={{ color: tokens.text, fontSize: 21, fontWeight: "800" }}>{t("recommendedPlaylists")}</Text><Pressable onPress={() => router.replace("/(tabs)/library")}><Text style={{ color: tokens.accent, fontSize: 12, fontWeight: "800" }}>NETEASE ›</Text></Pressable></View>
      <View className="relative mt-5 h-[166px]">
        {loadingPlaylists ? <View className="h-full items-center justify-center"><ActivityIndicator color={tokens.accent} /></View> : null}
        {!loadingPlaylists && playlists.map((playlist, index) => <Pressable key={playlist.id} className="absolute overflow-hidden" style={{ width: 132, height: 132, left: index * 68 + 8, top: index === 1 ? 18 : index === 2 ? 5 : 28, zIndex: index + 1, borderRadius: 18, transform: [{ rotate: index === 0 ? "-10deg" : index === 1 ? "3deg" : "11deg" }], shadowColor: "#000000", shadowOpacity: 0.22, shadowRadius: 12, shadowOffset: { width: 0, height: 7 }, elevation: 5 }} onPress={() => router.replace("/(tabs)/library")}><Image className="h-full w-full" source={{ uri: playlist.coverUrl }} contentFit="cover" /></Pressable>)}
        {!loadingPlaylists && !playlists.length ? <Pressable className="h-[132px] items-center justify-center rounded-[18px] border" style={{ borderColor: tokens.surfaceBorder, backgroundColor: tokens.surface }} onPress={() => router.replace("/(tabs)/library")}><Text style={{ color: tokens.mutedText, fontSize: 13 }}>{t("neteaseRequired")}</Text></Pressable> : null}
      </View>
    </View>

    <View className="mt-6 border-y px-5 py-7" style={{ borderColor: tokens.surfaceBorder, backgroundColor: tokens.isLight ? "#151715" : "#070908" }}>
      <Text className="text-xs font-bold tracking-[2px]" style={{ color: `${tokens.accent}dd` }}>{t("nowPlaying")}</Text>
      {track ? <><View className="mt-5 flex-row items-center"><View className="h-14 w-14 overflow-hidden rounded-xl" style={{ backgroundColor: `${tokens.accent}33` }}>{track.artwork ? <Image className="h-full w-full" source={{ uri: track.artwork }} contentFit="cover" /> : null}</View><View className="ml-4 min-w-0 flex-1"><Text numberOfLines={1} style={{ color: "#ffffff", fontSize: 22, fontWeight: "800" }}>{track.title}</Text><Text className="mt-1 text-sm" numberOfLines={1} style={{ color: "#b6bcb6" }}>{track.artist}</Text></View><Pressable className="ml-3 h-11 w-11 items-center justify-center rounded-full" style={{ backgroundColor: tokens.accent }} onPress={() => void togglePlayback()}><Text style={{ color: "#101310", fontSize: 18, fontWeight: "900" }}>{isPlaying ? "Ⅱ" : "▶"}</Text></Pressable></View><View className="mt-8"><Text className="text-center text-base leading-8" style={{ color: "#dce1dc" }}>{t("lyricsUnavailable")}</Text></View></> : <View className="mt-8 h-28 items-center justify-center"><Text className="text-center text-base leading-7" style={{ color: "#b6bcb6" }}>{t("nothingPlaying")}</Text></View>}
    </View>

    <View className="mt-8 px-5"><Text className="text-xs font-bold tracking-[2px]" style={{ color: tokens.mutedText }}>{t("language").toUpperCase()}</Text><View className="mt-3">{languages.map((item, index) => <Pressable key={item} className="flex-row items-center justify-between py-4" style={index ? { borderTopWidth: 1, borderColor: tokens.surfaceBorder } : undefined} onPress={() => void setLanguage(item)}><Text style={{ color: language === item ? tokens.accent : tokens.text, fontWeight: "700" }}>{languageLabels[item]}</Text><Text style={{ color: language === item ? tokens.accent : tokens.mutedText }}>{language === item ? "●" : "○"}</Text></Pressable>)}</View></View>
  </ScrollView></ThemedScreen>;
}
