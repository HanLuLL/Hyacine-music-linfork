import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { ThemedScreen } from "@/components/ui/ThemedScreen";
import { LiquidControlSurface } from "@/components/ui/LiquidControlSurface";
import { useTheme } from "@/theme";
import { useAccount } from "@/account";
import { loadSongComments, type SongComment } from "@/services/comments";
import { normalizeMediaUrl } from "@/utils/media";

export default function CommentsScreen(): React.JSX.Element {
  const params = useLocalSearchParams<{ id: string; title?: string }>();
  const { tokens } = useTheme();
  const { profile, getSourceCredential } = useAccount();
  const [comments, setComments] = useState<SongComment[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    if (!profile?.backendUrl || !params.id) return;
    setLoading(true); setError("");
    try {
      const cookie = await getSourceCredential("netease");
      const page = await loadSongComments(profile.backendUrl, params.id, cookie);
      setComments(page.comments); setTotal(page.total);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "评论加载失败");
    } finally { setLoading(false); }
  }, [getSourceCredential, params.id, profile?.backendUrl]);
  useEffect(() => { void load(); }, [load]);
  return <ThemedScreen><View className="flex-1 px-5 pb-8 pt-14">
    <View className="mb-5 flex-row items-center justify-between"><Pressable onPress={() => router.back()}><Text style={{ color: tokens.accent, fontWeight: "900" }}>‹ 返回</Text></Pressable><View className="items-end"><Text numberOfLines={1} style={{ color: tokens.text, fontSize: 18, fontWeight: "900" }}>{params.title || "歌曲评论"}</Text><Text style={{ color: tokens.mutedText, fontSize: 12 }}>{total} 条评论</Text></View></View>
    {loading && !comments.length ? <View className="flex-1 items-center justify-center"><ActivityIndicator color={tokens.accent} /></View> : null}
    {error ? <LiquidControlSurface className="p-4" style={{ borderRadius: 20 }}><Text style={{ color: tokens.text }}>{error}</Text><Pressable className="mt-3" onPress={() => void load()}><Text style={{ color: tokens.accent, fontWeight: "800" }}>重新加载</Text></Pressable></LiquidControlSurface> : null}
    {!loading && !error && !comments.length ? <View className="flex-1 items-center justify-center"><Text style={{ color: tokens.mutedText }}>暂无评论</Text></View> : null}
    <ScrollView refreshControl={<RefreshControl refreshing={loading} onRefresh={() => void load()} tintColor={tokens.accent} />} showsVerticalScrollIndicator={false}>{comments.map((comment) => <View key={comment.id} className="flex-row border-b py-4" style={{ borderColor: tokens.surfaceBorder }}>
      {comment.avatarUrl ? <Image source={{ uri: normalizeMediaUrl(comment.avatarUrl) }} style={{ width: 42, height: 42, borderRadius: 21 }} /> : <View className="h-[42px] w-[42px] rounded-full" style={{ backgroundColor: `${tokens.accent}22` }} />}
      <View className="ml-3 min-w-0 flex-1"><View className="flex-row justify-between"><Text numberOfLines={1} style={{ color: tokens.accent, fontWeight: "800" }}>{comment.nickname}</Text><Text style={{ color: tokens.mutedText, fontSize: 11 }}>♡ {comment.likedCount}</Text></View><Text className="mt-2" style={{ color: tokens.text, lineHeight: 22 }}>{comment.content}</Text><Text className="mt-2" style={{ color: tokens.mutedText, fontSize: 11 }}>{comment.timeText || new Date(comment.time).toLocaleDateString()}{comment.location ? ` · ${comment.location}` : ""}</Text></View>
    </View>)}</ScrollView>
  </View></ThemedScreen>;
}