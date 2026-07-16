import { useEffect, useRef, useState } from "react";
import { Animated, FlatList, Pressable, Text, TextInput, useWindowDimensions, View, type ListRenderItemInfo } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useAccount } from "@/account";
import { LiquidControlSurface } from "@/components/ui/LiquidControlSurface";
import { ThemedScreen } from "@/components/ui/ThemedScreen";
import { useTheme } from "@/theme";

interface Page { key: "welcome" | "profile" | "backend"; title: string; body: string; }
const pages: Page[] = [
  { key: "welcome", title: "Hyacine.music", body: "Put your music, identity, and server connection in one player." },
  { key: "profile", title: "Create your profile", body: "Your name and avatar appear in your profile." },
  { key: "backend", title: "Connect your server", body: "Add a Hyacine server address before entering your library." },
];
const urlPattern = /^https?:\/\/[^\s]+$/i;

export default function OnboardingScreen(): React.JSX.Element {
  const listRef = useRef<FlatList<Page>>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [page, setPage] = useState(0);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [backend, setBackend] = useState("");
  const [saving, setSaving] = useState(false);
  const { profile, saveProfile } = useAccount();
  const { tokens } = useTheme();
  const { width } = useWindowDimensions();

  useEffect(() => {
    if (!profile) return;
    setName(profile.displayName);
    setAvatar(profile.avatarUrl);
    setBackend(profile.backendUrl);
  }, [profile]);

  const complete = Boolean(name.trim() && avatar.trim() && urlPattern.test(backend.trim()));
  const next = (): void => listRef.current?.scrollToOffset({ offset: Math.min(page + 1, pages.length - 1) * width, animated: true });
  const finish = async (): Promise<void> => {
    if (!complete || saving) return;
    setSaving(true);
    await saveProfile({ displayName: name, avatarUrl: avatar, backendUrl: backend, musicSource: profile?.musicSource ?? null });
    router.replace("/sources");
  };

  const render = ({ item, index }: ListRenderItemInfo<Page>): React.JSX.Element => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
    const opacity = scrollX.interpolate({ inputRange, outputRange: [0.18, 1, 0.18], extrapolate: "clamp" });
    const translateX = scrollX.interpolate({ inputRange, outputRange: [42, 0, -42], extrapolate: "clamp" });
    const scale = scrollX.interpolate({ inputRange, outputRange: [0.94, 1, 0.94], extrapolate: "clamp" });
    return <View style={{ width }}><Animated.View className="px-7 pt-24" style={{ opacity, transform: [{ translateX }, { scale }] }}>
      <Text style={{ color: tokens.mutedText, fontSize: 12, fontWeight: "800", letterSpacing: 1.4 }}>FIRST RUN / 0{index + 1}</Text>
      {item.key === "welcome" ? <>
        <LiquidControlSurface className="mt-7 h-24 w-24 items-center justify-center rounded-[32px]" style={{ borderRadius: 32 }}><Text style={{ color: tokens.text, fontSize: 38, fontWeight: "900" }}>H</Text></LiquidControlSurface>
        <Text className="mt-10" style={{ color: tokens.text, fontSize: 35, fontWeight: "800" }}>{item.title}</Text>
        <Text className="mt-4 text-base leading-7" style={{ color: tokens.mutedText }}>{item.body}</Text>
      </> : null}
      {item.key === "profile" ? <>
        <Text className="mt-7" style={{ color: tokens.text, fontSize: 31, fontWeight: "800" }}>{item.title}</Text><Text className="mt-3 text-base leading-7" style={{ color: tokens.mutedText }}>{item.body}</Text>
        <View className="mt-11 h-20 w-20 overflow-hidden rounded-full" style={{ backgroundColor: `${tokens.accent}2a` }}>{avatar ? <Image className="h-full w-full" source={{ uri: avatar }} /> : <Text className="pt-5 text-center" style={{ color: tokens.accent, fontSize: 24, fontWeight: "900" }}>{name.trim().slice(0, 1).toUpperCase() || "H"}</Text>}</View>
        <LiquidControlSurface className="mt-8 h-14 rounded-[18px] px-5" style={{ borderRadius: 18 }}><TextInput value={name} onChangeText={setName} placeholder="Name" placeholderTextColor={tokens.mutedText} style={{ color: tokens.text, height: "100%", fontSize: 16 }} /></LiquidControlSurface>
        <LiquidControlSurface className="mt-3 h-14 rounded-[18px] px-5" style={{ borderRadius: 18 }}><TextInput value={avatar} onChangeText={setAvatar} autoCapitalize="none" placeholder="Avatar image URL" placeholderTextColor={tokens.mutedText} style={{ color: tokens.text, height: "100%", fontSize: 16 }} /></LiquidControlSurface>
      </> : null}
      {item.key === "backend" ? <>
        <Text className="mt-7" style={{ color: tokens.text, fontSize: 31, fontWeight: "800" }}>{item.title}</Text><Text className="mt-3 text-base leading-7" style={{ color: tokens.mutedText }}>{item.body}</Text>
        <LiquidControlSurface className="mt-12 h-14 rounded-[18px] px-5" style={{ borderRadius: 18, borderColor: backend && !urlPattern.test(backend) ? "#ef4444" : undefined }}><TextInput value={backend} onChangeText={setBackend} autoCapitalize="none" keyboardType="url" placeholder="https://music.example.com" placeholderTextColor={tokens.mutedText} style={{ color: tokens.text, height: "100%", fontSize: 16 }} /></LiquidControlSurface>
        <Text className="mt-3 text-xs leading-5" style={{ color: tokens.mutedText }}>Use a complete address beginning with http:// or https://.</Text>
      </> : null}
    </Animated.View></View>;
  };

  return <ThemedScreen>
    <Animated.FlatList ref={listRef} data={pages} renderItem={render} horizontal pagingEnabled bounces={false} showsHorizontalScrollIndicator={false} keyExtractor={(item) => item.key} onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: true })} scrollEventThrottle={16} onMomentumScrollEnd={(event) => setPage(Math.round(event.nativeEvent.contentOffset.x / width))} />
    <View className="absolute bottom-12 left-7 right-7 flex-row items-center justify-between"><View className="flex-row gap-2">{pages.map((item, index) => <Animated.View key={item.key} className="h-2 rounded-full" style={{ width: scrollX.interpolate({ inputRange: [(index - 1) * width, index * width, (index + 1) * width], outputRange: [8, 26, 8], extrapolate: "clamp" }), backgroundColor: tokens.accent }} />)}</View><LiquidControlSurface className="h-12 rounded-full px-6" style={{ borderRadius: 24, opacity: page === 2 && !complete ? 0.5 : 1 }}><Pressable disabled={page === 2 && !complete} className="h-full items-center justify-center" onPress={page === 2 ? () => void finish() : next}><Text style={{ color: tokens.text, fontWeight: "900" }}>{page === 2 ? (saving ? "Saving" : "Finish") : "Continue"}</Text></Pressable></LiquidControlSurface></View>
  </ThemedScreen>;
}