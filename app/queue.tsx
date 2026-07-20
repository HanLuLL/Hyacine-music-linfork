import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useAudio } from "@/hooks/useAudio";
import { usePlayerStore } from "@/store/playerStore";
import { ThemedScreen } from "@/components/ui/ThemedScreen";
import { useTheme } from "@/theme";
import { normalizeMediaUrl } from "@/utils/media";
export default function QueueScreen(): React.JSX.Element {
  const { tokens } = useTheme();
  const { playTrack } = useAudio();
  const queue = usePlayerStore((state) => state.queue);
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const playMode = usePlayerStore((state) => state.playMode);
  const cyclePlayMode = usePlayerStore((state) => state.cyclePlayMode);
  const setQueue = usePlayerStore((state) => state.setQueue);
  const removeFromQueue = usePlayerStore((state) => state.removeFromQueue);
  const clearQueue = usePlayerStore((state) => state.clearQueue);
  const play = (id: string): void => {
const track = queue.find((item) => item.id === id);
    if (!track) return;
    setQueue(queue, id);
    void playTrack(track);
  };
  const clear = (): void => Alert.alert("清空播放队列", "当前播放会继续，但不会再自动切换下一首。", [{ text: "取消", style: "cancel" }, { text: "清空", style: "destructive", onPress: clearQueue }]);
  const modeIcon = playMode === "shuffle" ? "⇄" : playMode === "loop" ? "↻" : "→";
  const modeLabel = playMode === "shuffle" ? "随机播放" : playMode === "loop" ? "循环播放" : "顺序播放";
  return <ThemedScreen><ScrollView contentContainerClassName="px-5 pb-16 pt-16"><View className="flex-row items-center justify-between"><View className="flex-row items-center gap-4"><Pressable accessibilityLabel="返回" onPress={() => router.back()}><Text style={{ color: tokens.accent, fontSize: 24, fontWeight: "900" }}>‹</Text></Pressable><Text style={{ color: tokens.text, fontSize: 27, fontWeight: "900" }}>当前播放</Text><Text style={{ color: tokens.mutedText, fontWeight: "700" }}>{queue.length} 首</Text></View><View className="flex-row gap-3"><Pressable accessibilityLabel={modeLabel} className="h-11 w-11 items-center justify-center rounded-full" style={{ backgroundColor: `${tokens.accent}18` }} onPress={cyclePlayMode}><Text style={{ color: playMode !== "sequential" ? tokens.accent : tokens.text, fontSize: 22, fontWeight: "900" }}>{modeIcon}</Text></Pressable><Pressable accessibilityLabel="清空队列" className="h-11 w-11 items-center justify-center rounded-full" style={{ backgroundColor: `${tokens.accent}18` }} onPress={clear}><Text style={{ color: tokens.text, fontSize: 22, fontWeight: "900" }}>♲</Text></Pressable></View></View><Text className="mt-2" style={{ color: tokens.mutedText }}>{modeLabel} · 队列</Text>{queue.map((track, index) => { const current = track.id === currentTrack?.id; return <Pressable key={track.id} className="mt-3 flex-row items-center gap-3 rounded-2xl px-3 py-3" style={{ backgroundColor: current ? `${tokens.accent}1c` : `${tokens.text}08` }} onPress={() => play(track.id)}><Text style={{ color: current ? tokens.accent : tokens.mutedText, fontWeight: "800", width: 34 }}>{current ? "•••" : index + 1}</Text>{track.artwork ? <Image source={{ uri: normalizeMediaUrl(track.artwork) }} style={{ height: 52, width: 52, borderRadius: 12 }} contentFit="cover" /> : <View style={{ height: 52, width: 52, borderRadius: 12, backgroundColor: `${tokens.accent}20` }} />}<View className="min-w-0 flex-1"><Text numberOfLines={1} style={{ color: current ? tokens.accent : tokens.text, fontWeight: "800" }}>{track.title}</Text><Text className="mt-1" numberOfLines={1} style={{ color: tokens.mutedText, fontSize: 12 }}>{track.artist}</Text></View><Pressable accessibilityLabel="移出队列" className="h-10 w-10 items-center justify-center" onPress={() => removeFromQueue(track.id)}><Text style={{ color: tokens.mutedText, fontSize: 24 }}>♲</Text></Pressable></Pressable>; })}{!queue.length ? <View className="h-64 items-center justify-center"><Text style={{ color: tokens.mutedText }}>播放歌曲后会出现在这里</Text></View> : null}</ScrollView></ThemedScreen>;
}
