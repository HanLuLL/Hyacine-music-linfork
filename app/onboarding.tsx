import { useEffect, useRef, useState } from "react";
import { FlatList, Pressable, Text, TextInput, useWindowDimensions, View, type ListRenderItemInfo } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useAccount } from "@/account";
import { ThemedScreen } from "@/components/ui/ThemedScreen";
import { useTheme } from "@/theme";

interface Page { key: "welcome" | "profile" | "backend"; title: string; body: string; }
const pages: Page[] = [
  { key: "welcome", title: "Hyacine.music", body: "把你的音乐、账号和服务端连接放在同一个播放器里。" },
  { key: "profile", title: "创建你的资料", body: "昵称和头像会显示在个人中心。" },
  { key: "backend", title: "连接后端", body: "填写 Hyacine 服务端地址后才能进入音乐库。" },
];
const urlPattern = /^https?:\/\/[^\s]+$/i;

export default function OnboardingScreen(): React.JSX.Element {
  const listRef = useRef<FlatList<Page>>(null);
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

  const next = (): void => listRef.current?.scrollToIndex({ index: Math.min(page + 1, pages.length - 1), animated: true });
  const finish = async (): Promise<void> => {
    if (!complete || saving) return;
    setSaving(true);
    await saveProfile({ displayName: name, avatarUrl: avatar, backendUrl: backend, musicSource: profile?.musicSource ?? null });
    router.replace("/sources");
  };
  const render = ({ item }: ListRenderItemInfo<Page>): React.JSX.Element => <View className="px-7 pt-24" style={{ width }}>
    {item.key === "welcome" ? <>
      <View className="h-24 w-24 items-center justify-center rounded-[32px]" style={{ backgroundColor: `${tokens.accent}2e` }}><Text style={{ color: tokens.accent, fontSize: 40, fontWeight: "900" }}>H</Text></View>
      <Text className="mt-10" style={{ color: tokens.text, fontSize: 34, fontWeight: "900" }}>{item.title}</Text>
      <Text className="mt-4 text-base leading-7" style={{ color: tokens.mutedText }}>{item.body}</Text>
    </> : null}
    {item.key === "profile" ? <>
      <Text style={{ color: tokens.text, fontSize: 30, fontWeight: "900" }}>{item.title}</Text><Text className="mt-3 text-base leading-7" style={{ color: tokens.mutedText }}>{item.body}</Text>
      <View className="mt-12 h-20 w-20 overflow-hidden rounded-full" style={{ backgroundColor: `${tokens.accent}2a` }}>{avatar ? <Image className="h-full w-full" source={{ uri: avatar }} /> : <Text className="pt-5 text-center" style={{ color: tokens.accent, fontSize: 24, fontWeight: "900" }}>{name.trim().slice(0, 1).toUpperCase() || "H"}</Text>}</View>
      <TextInput value={name} onChangeText={setName} placeholder="昵称" placeholderTextColor={tokens.mutedText} className="mt-8 h-14 px-5 text-base" style={{ color: tokens.text, borderRadius: 18, borderWidth: 1, borderColor: tokens.surfaceBorder, backgroundColor: tokens.surface }} />
      <TextInput value={avatar} onChangeText={setAvatar} autoCapitalize="none" placeholder="头像图片 URL" placeholderTextColor={tokens.mutedText} className="mt-3 h-14 px-5 text-base" style={{ color: tokens.text, borderRadius: 18, borderWidth: 1, borderColor: tokens.surfaceBorder, backgroundColor: tokens.surface }} />
    </> : null}
    {item.key === "backend" ? <>
      <Text style={{ color: tokens.text, fontSize: 30, fontWeight: "900" }}>{item.title}</Text><Text className="mt-3 text-base leading-7" style={{ color: tokens.mutedText }}>{item.body}</Text>
      <TextInput value={backend} onChangeText={setBackend} autoCapitalize="none" keyboardType="url" placeholder="https://music.example.com" placeholderTextColor={tokens.mutedText} className="mt-12 h-14 px-5 text-base" style={{ color: tokens.text, borderRadius: 18, borderWidth: 1, borderColor: backend && !urlPattern.test(backend) ? "#ef4444" : tokens.surfaceBorder, backgroundColor: tokens.surface }} />
      <Text className="mt-3 text-xs leading-5" style={{ color: tokens.mutedText }}>必须使用 http:// 或 https:// 开头的完整地址。</Text>
    </> : null}
  </View>;

  return <ThemedScreen><FlatList ref={listRef} data={pages} renderItem={render} horizontal pagingEnabled showsHorizontalScrollIndicator={false} keyExtractor={(item) => item.key} onMomentumScrollEnd={(event) => setPage(Math.round(event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width))} />
    <View className="absolute bottom-12 left-7 right-7 flex-row items-center justify-between"><View className="flex-row gap-2">{pages.map((item, index) => <View key={item.key} className="h-2 rounded-full" style={{ width: index === page ? 24 : 8, backgroundColor: index === page ? tokens.accent : `${tokens.text}25` }} />)}</View><Pressable className="min-h-12 items-center justify-center px-6" style={{ borderRadius: 24, backgroundColor: page === 2 ? (complete ? tokens.accent : `${tokens.text}22`) : tokens.accent }} onPress={page === 2 ? () => void finish() : next}><Text style={{ color: page === 2 && !complete ? tokens.mutedText : "#111111", fontWeight: "900" }}>{page === 2 ? (saving ? "保存中" : "完成") : "继续"}</Text></Pressable></View>
  </ThemedScreen>;
}