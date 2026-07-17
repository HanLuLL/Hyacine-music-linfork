import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { Image } from "expo-image";
import { useAccount } from "@/account";
import { useI18n } from "@/i18n";
import { LiquidControlSurface } from "@/components/ui/LiquidControlSurface";
import { ThemedScreen } from "@/components/ui/ThemedScreen";
import { useTheme } from "@/theme";
import { apiBase } from "@/utils/apiBase";

interface Playlist { id: number; name: string; coverUrl: string; playCount: number; trackCount: number; description: string; }

function formatPlayCount(value: number, language: string): string {
  return new Intl.NumberFormat(language, { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

export default function LibraryScreen(): React.JSX.Element {
  const { profile, getSourceCredential } = useAccount();
  const { language, t } = useI18n();
  const { tokens } = useTheme();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadRecommendations = useCallback(async (refresh = false): Promise<void> => {
    if (!profile || profile.musicSource !== "netease") {
      setPlaylists([]);
      setError(t("neteaseRequired"));
      setLoading(false);
      return;
    }
    refresh ? setRefreshing(true) : setLoading(true);
    setError("");
    try {
      const cookie = await getSourceCredential("netease");
      if (!cookie) throw new Error("missing credential");
      const response = await fetch(`${apiBase(profile.backendUrl)}/music-sources/netease/recommendations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cookie }),
      });
      const data = await response.json() as Playlist[];
      if (!response.ok || !Array.isArray(data)) throw new Error("request failed");
      setPlaylists(data);
      if (!data.length) setError(t("noRecommendations"));
    } catch {
      setPlaylists([]);
      setError(t("recommendationsUnavailable"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getSourceCredential, profile, t]);

  useEffect(() => { void loadRecommendations(); }, [loadRecommendations]);

  return <ThemedScreen><ScrollView className="flex-1" contentContainerClassName="px-5 pb-40 pt-16" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void loadRecommendations(true)} tintColor={tokens.accent} />}>
    <View className="flex-row items-start justify-between"><View><Text style={{ color: tokens.text, fontSize: 31, fontWeight: "800" }}>{t("library")}</Text><Text className="mt-2 text-sm" style={{ color: tokens.mutedText }}>{t("neteaseRecommendations")}</Text></View><LiquidControlSurface className="h-11 w-11 items-center justify-center rounded-full"><Pressable className="h-full w-full items-center justify-center" onPress={() => void loadRecommendations(true)}><Text style={{ color: tokens.text, fontSize: 18 }}>↻</Text></Pressable></LiquidControlSurface></View>
    <View className="mt-10 flex-row items-center justify-between"><Text style={{ color: tokens.text, fontSize: 21, fontWeight: "800" }}>{t("recommendedPlaylists")}</Text><Text className="text-xs font-semibold" style={{ color: tokens.accent }}>NETEASE</Text></View>
    {loading ? <View className="h-72 items-center justify-center"><ActivityIndicator color={tokens.accent} /><Text className="mt-4 text-sm" style={{ color: tokens.mutedText }}>{t("loadingRecommendations")}</Text></View> : null}
    {!loading && error ? <View className="h-72 items-center justify-center px-8"><View className="h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: `${tokens.accent}1c` }}><Text style={{ color: tokens.accent, fontSize: 28 }}>♫</Text></View><Text className="mt-5 text-center text-sm leading-6" style={{ color: tokens.mutedText }}>{error}</Text><LiquidControlSurface className="mt-6 h-11 rounded-full px-5" style={{ borderRadius: 22 }}><Pressable className="h-full items-center justify-center" onPress={() => void loadRecommendations(true)}><Text style={{ color: tokens.text, fontWeight: "800" }}>{t("refresh")}</Text></Pressable></LiquidControlSurface></View> : null}
    {!loading && playlists.length ? <View className="mt-5 flex-row flex-wrap justify-between">{playlists.map((playlist) => <Pressable key={playlist.id} className="mb-7 w-[48%]" onPress={() => undefined}><View className="aspect-square overflow-hidden rounded-2xl" style={{ backgroundColor: tokens.surface }}><Image className="h-full w-full" source={{ uri: playlist.coverUrl }} contentFit="cover" /><View className="absolute bottom-2 right-2 rounded-full px-2 py-1" style={{ backgroundColor: "#00000080" }}><Text style={{ color: "#ffffff", fontSize: 10, fontWeight: "800" }}>▶ {formatPlayCount(playlist.playCount, language)}</Text></View></View><Text className="mt-3 text-sm font-bold" numberOfLines={2} style={{ color: tokens.text }}>{playlist.name}</Text><Text className="mt-1 text-xs" numberOfLines={1} style={{ color: tokens.mutedText }}>{playlist.description || `${playlist.trackCount} ${t("playlistTracks")}`}</Text></Pressable>)}</View> : null}
  </ScrollView></ThemedScreen>;
}