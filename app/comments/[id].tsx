import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { ThemedScreen } from "@/components/ui/ThemedScreen";
import { LiquidControlSurface } from "@/components/ui/LiquidControlSurface";
import { useTheme } from "@/theme";
import { useI18n } from "@/i18n";
import { useAccount } from "@/account";
import { loadSongComments, type SongComment } from "@/services/comments";
import { normalizeMediaUrl } from "@/utils/media";
const PAGE_SIZE = 20;
const MAX_COMMENTS = 200;
export default function CommentsScreen(): React.JSX.Element {
  const params = useLocalSearchParams<{ id: string; title?: string }>();
  const { tokens } = useTheme();
  const { t } = useI18n();
  const { profile, getSourceCredential } = useAccount();
  const [comments, setComments] = useState<SongComment[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [offset, setOffset] = useState(0);
  const [more, setMore] = useState(false);
  const load = useCallback(async () => {
    if (!profile?.backendUrl || !params.id) return;
    setLoading(true); setError("");
    try {
      const cookie = await getSourceCredential("netease");
      const page = await loadSongComments(profile.backendUrl, params.id, cookie, 0);
      const limited = page.comments.slice(0, MAX_COMMENTS);
      setComments(limited); setTotal(page.total);
      setOffset(limited.length);
      setMore(page.more && limited.length < MAX_COMMENTS);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "评论加载失败");
    } finally { setLoading(false); }
  }, [getSourceCredential, params.id, profile?.backendUrl]);
  const loadMore = useCallback(async () => {
    if (!profile?.backendUrl || !params.id || loadingMore || !more) return;
    if (comments.length >= MAX_COMMENTS) return;
    setLoadingMore(true);
    try {
      const cookie = await getSourceCredential("netease");
      const page = await loadSongComments(profile.backendUrl, params.id, cookie, offset);
      const remaining = MAX_COMMENTS - comments.length;
      if (remaining <= 0) {
        setMore(false);
        setLoadingMore(false);
        return;
      }
      const toAdd = page.comments.slice(0, remaining);
      setComments((prev) => [...prev, ...toAdd]);
      setMore(page.more && comments.length + toAdd.length < MAX_COMMENTS);
      setOffset((prev) => prev + toAdd.length);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "评论加载失败");
    } finally { setLoadingMore(false); }
  }, [getSourceCredential, loadingMore, more, offset, params.id, profile?.backendUrl, comments.length]);
  useEffect(() => { void load(); }, [load]);
  return <ThemedScreen><View className="flex-1 px-5 pb-8 pt-14">
    <View className="mb-5 flex-row items-center justify-between"><Pressable onPress={() => router.back()}><Text style={{ color: tokens.accent, fontWeight: "900" }}>‹ {t("backToHome")}</Text></Pressable><View className="items-end"><Text numberOfLines={1} style={{ color: tokens.text, fontSize: 18, fontWeight: "900" }}>{params.title || t("comments")}</Text><Text style={{ color: tokens.mutedText, fontSize: 12 }}>{total} {t("comments")}</Text></View></View>
    {loading && !comments.length ? <View className="flex-1 items-center justify-center"><ActivityIndicator color={tokens.accent} /></View> : null}
    {error ? <LiquidControlSurface className="p-4" style={{ borderRadius: 20 }}><Text style={{ color: tokens.text }}>{error}</Text><Pressable className="mt-3" onPress={() => void load()}><Text style={{ color: tokens.accent, fontWeight: "800" }}>{t("refresh")}</Text></Pressable></LiquidControlSurface> : null}
    {!loading && !error && !comments.length ? <View className="flex-1 items-center justify-center"><Text style={{ color: tokens.mutedText }}>{t("noMoreComments")}</Text></View> : null}
    <LiquidControlSurface className="flex-1 overflow-hidden px-4" style={{ borderRadius: 28 }}><ScrollView refreshControl={<RefreshControl refreshing={loading} onRefresh={() => void load()} tintColor={tokens.accent} />} onScroll={({ nativeEvent }) => { const { layoutMeasurement, contentOffset, contentSize } = nativeEvent; if (layoutMeasurement.height + contentOffset.y >= contentSize.height - 80 && !loadingMore && more) void loadMore(); }} scrollEventThrottle={120} showsVerticalScrollIndicator={false}>{comments.map((comment) => <View key={comment.id} className="flex-row border-b py-5" style={{ borderColor: tokens.surfaceBorder }}>
      {comment.avatarUrl ? <Image source={{ uri: normalizeMediaUrl(comment.avatarUrl) }} style={{ width: 42, height: 42, borderRadius: 21 }} /> : <View className="h-[42px] w-[42px] rounded-full" style={{ backgroundColor: `${tokens.accent}22` }} />}
      <View className="ml-3 min-w-0 flex-1"><View className="flex-row justify-between"><Text numberOfLines={1} style={{ color: tokens.accent, fontWeight: "800" }}>{comment.nickname}</Text><Text style={{ color: tokens.mutedText, fontSize: 11 }}>♡ {comment.likedCount}</Text></View><Text className="mt-2" style={{ color: tokens.text, lineHeight: 22 }}>{comment.content}</Text><Text className="mt-2" style={{ color: tokens.mutedText, fontSize: 11 }}>{comment.timeText || new Date(comment.time).toLocaleDateString()}{comment.location ? ` · ${comment.location}` : ""}</Text></View>
    </View>)}{loadingMore ? <View className="py-5 items-center justify-center"><ActivityIndicator color={tokens.accent} /></View> : null}{!loadingMore && more ? <Pressable className="py-5 items-center" onPress={() => void loadMore()}><Text style={{ color: tokens.accent, fontWeight: "800" }}>{t("loadMoreComments")}</Text></Pressable> : null}{!more && comments.length > 0 ? <View className="py-5 items-center"><Text style={{ color: tokens.mutedText, fontSize: 12 }}>{t("noMoreComments")}</Text></View> : null}</ScrollView></LiquidControlSurface>
  </View></ThemedScreen>;
}
