import { useEffect, useMemo, useState } from "react";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import QRCode from "qrcode";
import { Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAccount } from "@/account";
import { ThemedCard } from "@/components/ui/ThemedCard";
import { ThemedScreen } from "@/components/ui/ThemedScreen";
import { useTheme } from "@/theme";

type Source = "netease" | "bilibili";
interface QrPayload { key?: string; qrUrl?: string; message?: string; }
interface PollPayload { status?: "pending" | "confirmed" | "expired"; cookie?: string; }

function apiBase(url: string | undefined): string {
  return (url ?? "").trim().replace(/\/+$/, "").replace(/\/api\/v1$/, "") + "/api/v1";
}

export default function SourcesScreen(): React.JSX.Element {
  const { profile, saveSourceCredential } = useAccount();
  const { preferences, tokens } = useTheme();
  const isLiquid = preferences.uiStyle === "liquid";
  const [source, setSource] = useState<Source>("netease");
  const [qr, setQr] = useState("");
  const [key, setKey] = useState("");
  const [cookie, setCookie] = useState("");
  const [note, setNote] = useState("Credentials stay encrypted on this device.");
  const [loading, setLoading] = useState(false);
  const base = useMemo(() => apiBase(profile?.backendUrl), [profile?.backendUrl]);

  const createQr = async (): Promise<void> => {
    setLoading(true);
    setNote("Creating a Netease login session...");
    try {
      const response = await fetch(`${base}/music-sources/netease/qr`);
      const data = await response.json() as QrPayload;
      if (!response.ok || !data.key || !data.qrUrl) throw new Error(data.message);
      setKey(data.key);
      setQr(await QRCode.toDataURL(data.qrUrl, { margin: 0, width: 280, color: { dark: "#17212d", light: "#ffffff" } }));
      setNote("Scan this code in the Netease Cloud Music app.");
    } catch {
      setNote("Could not get a QR code. Configure NETEASE_API_BASE and use a backend address reachable from this device.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!key) return;
    const timer = setInterval(() => {
      void fetch(`${base}/music-sources/netease/qr/${encodeURIComponent(key)}`)
        .then(async (response) => ({ response, data: await response.json() as PollPayload }))
        .then(({ response, data }) => {
          if (!response.ok) return;
          if (data.status === "confirmed" && data.cookie) {
            clearInterval(timer);
            void saveSourceCredential("netease", data.cookie).then(() => router.replace("/(tabs)"));
          }
          if (data.status === "expired") {
            clearInterval(timer);
            setNote("This QR code expired. Get a new one.");
          }
        })
        .catch(() => undefined);
    }, 1800);
    return () => clearInterval(timer);
  }, [base, key, saveSourceCredential]);

  const saveBilibili = async (): Promise<void> => {
    if (!cookie.trim()) return;
    setLoading(true);
    setNote("Checking Cookie format...");
    try {
      const response = await fetch(`${base}/music-sources/bilibili/validate-cookie`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ cookie }),
      });
      const data = await response.json() as { valid?: boolean };
      if (!response.ok || !data.valid) throw new Error();
      await saveSourceCredential("bilibili", cookie);
      router.replace("/(tabs)");
    } catch {
      setNote("Validation failed. On a phone, use your computer's LAN IP instead of 127.0.0.1.");
    } finally {
      setLoading(false);
    }
  };

  const tabStyle = (item: Source) => ({
    backgroundColor: source === item ? (isLiquid ? "#ffffffa8" : tokens.surfaceStrong) : "transparent",
    borderRadius: 18,
  });

  return <ThemedScreen>
    <SafeAreaView className="flex-1" edges={["top", "bottom"]}>
      <View className="flex-1 px-5">
        <View className="mt-3 flex-row items-center justify-between">
          <View>
            <Text style={{ color: tokens.mutedText, fontSize: 13, fontWeight: "700" }}>FIRST RUN / 03</Text>
            <Text className="mt-1" style={{ color: tokens.text, fontSize: 32, fontWeight: "800" }}>Music sources</Text>
          </View>
          <View className="h-11 w-11 items-center justify-center rounded-full" style={{ backgroundColor: isLiquid ? "#ffffff52" : tokens.surface, borderWidth: 1, borderColor: tokens.surfaceBorder }}>
            <Text style={{ color: tokens.text, fontSize: 18, fontWeight: "700" }}>03</Text>
          </View>
        </View>

        <Text className="mt-5 text-base leading-6" style={{ color: tokens.mutedText }}>Connect one source before you enter Hyacine.</Text>

        <ThemedCard className="mt-8 p-1.5" style={{ borderRadius: 23 }}>
          <View className="flex-row">
            {(["netease", "bilibili"] as Source[]).map((item) => <Pressable key={item} className="h-12 flex-1 items-center justify-center" style={tabStyle(item)} onPress={() => { setSource(item); setNote("Credentials stay encrypted on this device."); }}>
              <Text style={{ color: source === item ? tokens.text : tokens.mutedText, fontSize: 15, fontWeight: "800" }}>{item === "netease" ? "Netease Cloud" : "Bilibili"}</Text>
            </Pressable>)}
          </View>
        </ThemedCard>

        {source === "netease" ? <View className="flex-1 items-center justify-center pb-12">
          <View className="items-center">
            <ThemedCard className="h-[294px] w-[294px] items-center justify-center p-2" style={{ borderRadius: 42 }}>
              {qr ? <Image className="h-[278px] w-[278px] rounded-[34px]" source={{ uri: qr }} contentFit="contain" /> : <LinearGradient className="h-[278px] w-[278px] items-center justify-center rounded-[34px]" colors={isLiquid ? ["#ffffff74", "#d8ecff50"] : [tokens.backgroundSecondary, tokens.surface]}>
                <Text style={{ color: tokens.mutedText, fontSize: 15, fontWeight: "700" }}>Secure session waiting</Text>
              </LinearGradient>}
            </ThemedCard>
            <Text className="mt-6" style={{ color: tokens.text, fontSize: 19, fontWeight: "800" }}>{qr ? "Scan in Netease Cloud Music" : "Connect Netease Cloud Music"}</Text>
            <Text className="mt-2 text-center text-sm leading-5" style={{ color: tokens.mutedText }}>{qr ? "It completes automatically after confirmation" : "The QR code is only valid for this session"}</Text>
          </View>
        </View> : <View className="flex-1 pt-8">
          <ThemedCard className="p-0" style={{ borderRadius: 28 }}>
            <View className="px-5 pb-3 pt-5"><Text style={{ color: tokens.text, fontSize: 18, fontWeight: "800" }}>Import login Cookie</Text><Text className="mt-1 text-sm leading-5" style={{ color: tokens.mutedText }}>SESSDATA and bili_jct are required.</Text></View>
            <TextInput value={cookie} onChangeText={setCookie} autoCapitalize="none" autoCorrect={false} multiline placeholder="Paste Bilibili Cookie" placeholderTextColor={tokens.mutedText} textAlignVertical="top" style={{ minHeight: 210, color: tokens.text, backgroundColor: isLiquid ? "#ffffff30" : tokens.backgroundSecondary, borderTopWidth: 1, borderColor: tokens.surfaceBorder, padding: 20, fontSize: 14, lineHeight: 22 }} />
          </ThemedCard>
        </View>}

        <View className="mb-2">
          <Pressable disabled={loading || (source === "bilibili" && !cookie.trim())} className="h-14 items-center justify-center overflow-hidden rounded-[28px]" style={{ opacity: loading || (source === "bilibili" && !cookie.trim()) ? 0.48 : 1 }} onPress={() => void (source === "netease" ? createQr() : saveBilibili())}>
            <LinearGradient className="absolute inset-0" colors={isLiquid ? ["#203e60", "#6b9cc0", "#274561"] : [tokens.accent, tokens.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
            <Text style={{ color: "#ffffff", fontSize: 16, fontWeight: "800" }}>{loading ? "Working..." : source === "netease" ? (qr ? "Refresh QR code" : "Get QR code") : "Verify and save"}</Text>
          </Pressable>
          <Text className="mx-5 mt-4 text-center text-xs leading-5" style={{ color: tokens.mutedText }}>{note}</Text>
        </View>
      </View>
    </SafeAreaView>
  </ThemedScreen>;
}