import { useRef } from "react";
import { PanResponder, Pressable, StyleSheet, Text, View } from "react-native";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import { useAudio } from "@/hooks/useAudio";
import { usePlayerStore } from "@/store/playerStore";
import { TrackCover } from "@/components/TrackCover";
import { useTheme } from "@/theme";

const HUAWEI_BLUE = "#00A1FF";
const HUAWEI_GRAY = "#86909C";

export function MiniPlayer(): React.JSX.Element | null {
  const track = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const { togglePlayback, seekBy } = useAudio();
  const { preferences } = useTheme();
  const dragRef = useRef(0);

  const panResponder = useRef(PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy) * 2,
    onPanResponderMove: (_, g) => { dragRef.current = g.dx; },
    onPanResponderRelease: () => {
      if (dragRef.current <= -30) void seekBy(99999);
      else if (dragRef.current >= 30) void seekBy(-99999);
      dragRef.current = 0;
    },
  })).current;

  if (!track) return null;

  if (preferences.miniPlayerStyle === "capsule") {
    return (
      <View pointerEvents="box-none" style={[s.wrap, { bottom: 100 }]}>
        <View style={s.bg}>
          <BlurView intensity={isPlaying ? 90 : 85} tint="light" style={StyleSheet.absoluteFill} />
          <View style={s.topLine} />
        </View>
        <View style={s.row} {...panResponder.panHandlers}>
          <Pressable style={s.info} onPress={() => router.push(`/player/${track.id}`)}>
            <TrackCover uri={track.artwork} title={track.title} size={36} radius={18} />
            <Text numberOfLines={1} style={s.capsuleTitle}>{track.title}</Text>
          </Pressable>
          <Pressable style={s.capsuleBtn} onPress={() => void togglePlayback()}>
            <Text style={s.btnText}>{isPlaying ? "Ⅱ" : "▶"}</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View pointerEvents="box-none" style={[s.wrap, { bottom: 100 }]}>
      <View style={s.bg}>
        <BlurView intensity={isPlaying ? 90 : 85} tint="light" style={StyleSheet.absoluteFill} />
        <View style={s.topLine} />
      </View>
      <View style={s.row} {...panResponder.panHandlers}>
        <Pressable style={s.info} onPress={() => router.push(`/player/${track.id}`)}>
          <TrackCover uri={track.artwork} title={track.title} size={46} radius={14} />
          <View style={s.textCol}>
            <Text numberOfLines={1} style={s.title}>{track.title}</Text>
            <Text numberOfLines={1} style={s.artist}>{track.artist}</Text>
          </View>
        </Pressable>
        <Pressable style={s.playBtn} onPress={() => void togglePlayback()}>
          <Text style={s.btnText}>{isPlaying ? "Ⅱ" : "▶"}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { position: "absolute", left: 16, right: 16, height: 64, zIndex: 20 },
  bg: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, borderRadius: 32, borderWidth: 1, borderColor: "rgba(255,255,255,0.58)", shadowColor: "#182848", shadowOpacity: 0.22, shadowRadius: 20, shadowOffset: { width: 0, height: 8 }, elevation: 8, overflow: "hidden" },
  topLine: { position: "absolute", left: 0, right: 0, top: 0, height: 1, backgroundColor: "rgba(255,255,255,0.78)" },
  row: { flex: 1, flexDirection: "row", alignItems: "center", paddingHorizontal: 10 },
  info: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
  textCol: { flex: 1, minWidth: 0 },
  title: { fontSize: 14, fontWeight: "700", color: "#1d2430" },
  artist: { fontSize: 12, color: HUAWEI_GRAY, marginTop: 2 },
  capsuleTitle: { maxWidth: 96, fontSize: 12, fontWeight: "800", color: "#1d2430" },
  playBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: HUAWEI_BLUE, alignItems: "center", justifyContent: "center" },
  capsuleBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: HUAWEI_BLUE, alignItems: "center", justifyContent: "center", marginLeft: 8 },
  btnText: { color: "#fff", fontSize: 18, fontWeight: "900" },
});