import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { ThemedScreen } from "@/components/ui/ThemedScreen";
import { LiquidControlSurface } from "@/components/ui/LiquidControlSurface";
import { useAccount } from "@/account";
import { useTheme } from "@/theme";
import { useI18n } from "@/i18n";
import { apiBase } from "@/utils/apiBase";
import { getLogText } from "@/utils/logger";
import { loadListeningHistory } from "@/services/listeningHistory";
import { loadFavorites } from "@/services/favorites";

interface HealthState {
  ok: boolean;
  status: string;
  latencyMs: number;
  checkedAt: string;
  direct?: boolean;
  capabilities?: Record<string, boolean>;
  error?: string;
}

function StatusDot({ ok }: { ok: boolean }): React.JSX.Element {
  return <View style={{ width: 9, height: 9, borderRadius: 9, backgroundColor: ok ? "#22c55e" : "#ef4444" }} />;
}

export default function AdminScreen(): React.JSX.Element {
  const { profile, getSourceCredential } = useAccount();
  const { tokens } = useTheme();
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [historyCount, setHistoryCount] = useState(0);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [credentials, setCredentials] = useState({ netease: false, bilibili: false });
  const [health, setHealth] = useState<HealthState | null>(null);
  const [logs, setLogs] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    const [history, favorites, netease, bilibili, logText] = await Promise.all([
      loadListeningHistory(), loadFavorites(), getSourceCredential("netease"), getSourceCredential("bilibili"), getLogText(),
    ]);
    setHistoryCount(history.length);
    setFavoriteCount(favorites.length);
    setCredentials({ netease: Boolean(netease), bilibili: Boolean(bilibili) });
    setLogs(logText.split("\n").slice(-120).join("\n"));
    if (profile?.backendUrl) {
      const started = Date.now();
      try {
        const response = await fetch(`${apiBase(profile.backendUrl)}/health`, { signal: AbortSignal.timeout(10000) });
        const body = await response.json() as { status?: string; netease?: { direct?: boolean; capabilities?: Record<string, boolean> } };
        setHealth({ ok: response.ok, status: body.status ?? `HTTP ${response.status}`, latencyMs: Date.now() - started, checkedAt: new Date().toLocaleString(), direct: body.netease?.direct, capabilities: body.netease?.capabilities });
      } catch (reason) {
        setHealth({ ok: false, status: t("backendUnavailable"), latencyMs: Date.now() - started, checkedAt: new Date().toLocaleString(), error: reason instanceof Error ? reason.message : String(reason) });
      }
    } else {
      setHealth({ ok: false, status: t("noServer"), latencyMs: 0, checkedAt: new Date().toLocaleString(), error: t("noServerConfigured") });
    }
    setLoading(false);
  }, [getSourceCredential, profile?.backendUrl, t]);

  useEffect(() => { void refresh(); }, [refresh]);
  const capabilityEntries = Object.entries(health?.capabilities ?? {});
  return <ThemedScreen><ScrollView contentContainerClassName="px-5 pb-12 pt-14" refreshControl={<RefreshControl refreshing={loading} onRefresh={() => void refresh()} tintColor={tokens.accent} />}>
    <View className="flex-row items-center justify-between"><Pressable onPress={() => router.back()}><Text style={{ color: tokens.accent, fontWeight: "900" }}>‹ {t("goBack")}</Text></Pressable><View className="items-end"><Text style={{ color: tokens.text, fontSize: 25, fontWeight: "900" }}>{t("adminPanel")}</Text><Text style={{ color: tokens.mutedText, fontSize: 12 }}>{t("localOnly")}</Text></View></View>
    <Text className="mb-3 mt-8 text-xs font-bold tracking-[2px]" style={{ color: tokens.mutedText }}>{t("userData")}</Text>
    <LiquidControlSurface className="p-5" style={{ borderRadius: 28 }}><Text style={{ color: tokens.text, fontSize: 20, fontWeight: "900" }}>{profile?.displayName || t("anonymousUser")}</Text><Text className="mt-2" style={{ color: tokens.mutedText }}>{profile?.musicSource ? `${t("currentSource")}：${profile.musicSource}` : t("noSourceSelected")}</Text><View className="mt-5 flex-row gap-3"><View className="flex-1 rounded-2xl p-4" style={{ backgroundColor: `${tokens.accent}12` }}><Text style={{ color: tokens.mutedText, fontSize: 12 }}>{t("listeningHistoryCount")}</Text><Text className="mt-1" style={{ color: tokens.text, fontSize: 24, fontWeight: "900" }}>{historyCount}</Text></View><View className="flex-1 rounded-2xl p-4" style={{ backgroundColor: `${tokens.accent}12` }}><Text style={{ color: tokens.mutedText, fontSize: 12 }}>{t("localFavorites")}</Text><Text className="mt-1" style={{ color: tokens.text, fontSize: 24, fontWeight: "900" }}>{favoriteCount}</Text></View></View><View className="mt-4 flex-row gap-4"><View className="flex-row items-center gap-2"><StatusDot ok={credentials.netease} /><Text style={{ color: tokens.text }}>{t("neteaseCredentials")}</Text></View><View className="flex-row items-center gap-2"><StatusDot ok={credentials.bilibili} /><Text style={{ color: tokens.text }}>{t("bilibiliCredentials")}</Text></View></View></LiquidControlSurface>
    <Text className="mb-3 mt-8 text-xs font-bold tracking-[2px]" style={{ color: tokens.mutedText }}>{t("backendStatus")}</Text>
    <LiquidControlSurface className="p-5" style={{ borderRadius: 28 }}>{loading && !health ? <ActivityIndicator color={tokens.accent} /> : <><View className="flex-row items-center gap-3"><StatusDot ok={Boolean(health?.ok)} /><Text style={{ color: tokens.text, fontSize: 18, fontWeight: "900" }}>{health?.status ?? t("checking")}</Text></View><Text className="mt-2" selectable style={{ color: tokens.mutedText }}>{profile?.backendUrl || t("noServer")}</Text><Text className="mt-2" style={{ color: tokens.mutedText }}>{t("latency")} {health?.latencyMs ?? 0} ms · {health?.checkedAt ?? "-"}</Text><Text className="mt-1" style={{ color: tokens.mutedText }}>{t("neteaseMode")}：{health?.direct ? t("directMode") : t("compatMode")}</Text>{health?.error ? <Text className="mt-3" style={{ color: "#ef4444" }}>{health.error}</Text> : null}{capabilityEntries.length ? <View className="mt-4 flex-row flex-wrap gap-2">{capabilityEntries.map(([name, enabled]) => <View key={name} className="flex-row items-center gap-1 rounded-full px-3 py-2" style={{ backgroundColor: `${enabled ? "#22c55e" : "#ef4444"}18` }}><StatusDot ok={enabled} /><Text style={{ color: tokens.text, fontSize: 11 }}>{name}</Text></View>)}</View> : null}</>}</LiquidControlSurface>
    <Text className="mb-3 mt-8 text-xs font-bold tracking-[2px]" style={{ color: tokens.mutedText }}>{t("clientLogs")}</Text>
    <LiquidControlSurface className="overflow-hidden p-4" style={{ borderRadius: 28 }}><Text selectable style={{ color: tokens.mutedText, fontFamily: "monospace", fontSize: 10, lineHeight: 15 }}>{logs || t("noLogs")}</Text></LiquidControlSurface>
  </ScrollView></ThemedScreen>;
}