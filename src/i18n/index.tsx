import * as SecureStore from "expo-secure-store";
import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";

export const languages = ["zh-CN", "en", "ja"] as const;
export type Language = (typeof languages)[number];

type TranslationKey = keyof typeof dictionaries.en;

const dictionaries = {
  en: {
    home: "Home",
    search: "Search",
    library: "Library",
    profile: "Profile",
    greeting: "Good evening",
    subtitle: "Your music, without interruption.",
    featured: "FEATURED FOR YOU",
    playDemo: "Play demo track",
    recentlyPlayed: "Recently played",
    historyHint: "Connect your music service to bring your listening history, recommendations, and playlists together.",
    searchPlaceholder: "Songs, artists, or playlists",
    searchHint: "Find songs, artists, albums, and playlists from your music service.",
    browseTitle: "Browse everything",
    browseHint: "Search becomes available when your music catalog is connected.",
    localTitle: "Your library",
    localHint: "Give Hyacine.music access to your local audio files and keep your collection in one place.",
    allowAudio: "Allow local audio access",
    permissionNote: "Android 13 and later asks for audio-only permission.",
    profileTitle: "Your profile",
    notSignedIn: "Not signed in",
    profileHint: "Sign in to sync favorites, playlists, and listening history across devices.",
    language: "Language",
    appearance: "Appearance",
    darkMode: "Dark listening room",
    apiStatus: "Music service",
    apiReady: "Ready to connect",
    closePlayer: "Close player",
    nothingPlaying: "Nothing is playing",
    backToHome: "Back to home",
    nowPlaying: "NOW PLAYING",
    pause: "Pause",
    play: "Play",
    previous15: "Back 15 seconds",
    next15: "Forward 15 seconds",
    miniPlayer: "Now playing",
  },
  "zh-CN": {
    home: "首页",
    search: "搜索",
    library: "音乐库",
    profile: "我的",
    greeting: "晚上好",
    subtitle: "让音乐，不被打断。",
    featured: "为你推荐",
    playDemo: "播放试听歌曲",
    recentlyPlayed: "最近播放",
    historyHint: "连接音乐服务后，可在这里集中查看播放历史、推荐与歌单。",
    searchPlaceholder: "歌曲、歌手或歌单",
    searchHint: "从你的音乐服务中查找歌曲、歌手、专辑与歌单。",
    browseTitle: "开始探索",
    browseHint: "连接曲库后即可使用搜索。",
    localTitle: "你的音乐库",
    localHint: "授权 Hyacine.music 访问本地音频，把收藏集中在一个地方。",
    allowAudio: "允许访问本地音频",
    permissionNote: "Android 13 及以上仅会请求音频读取权限。",
    profileTitle: "个人中心",
    notSignedIn: "尚未登录",
    profileHint: "登录后可在不同设备间同步收藏、歌单与播放历史。",
    language: "语言",
    appearance: "外观",
    darkMode: "深色聆听空间",
    apiStatus: "音乐服务",
    apiReady: "等待连接",
    closePlayer: "关闭播放器",
    nothingPlaying: "当前没有播放内容",
    backToHome: "返回首页",
    nowPlaying: "正在播放",
    pause: "暂停",
    play: "播放",
    previous15: "后退 15 秒",
    next15: "前进 15 秒",
    miniPlayer: "正在播放",
  },
  ja: {
    home: "ホーム",
    search: "検索",
    library: "ライブラリ",
    profile: "プロフィール",
    greeting: "こんばんは",
    subtitle: "音楽を、途切れさせない。",
    featured: "FEATURED FOR YOU",
    playDemo: "デモ曲を再生",
    recentlyPlayed: "最近再生した曲",
    historyHint: "音楽サービスを接続すると、再生履歴・おすすめ・プレイリストをまとめて確認できます。",
    searchPlaceholder: "曲、アーティスト、プレイリスト",
    searchHint: "音楽サービスから曲、アーティスト、アルバム、プレイリストを探します。",
    browseTitle: "さあ、探そう",
    browseHint: "音楽カタログを接続すると検索を利用できます。",
    localTitle: "あなたのライブラリ",
    localHint: "ローカル音源へのアクセスを許可し、コレクションをひとつにまとめます。",
    allowAudio: "ローカル音源を許可",
    permissionNote: "Android 13 以降では音声ファイルのみへのアクセスを要求します。",
    profileTitle: "プロフィール",
    notSignedIn: "ログインしていません",
    profileHint: "ログインすると、お気に入り、プレイリスト、再生履歴を端末間で同期できます。",
    language: "言語",
    appearance: "表示",
    darkMode: "ダーク・リスニングルーム",
    apiStatus: "音楽サービス",
    apiReady: "接続待ち",
    closePlayer: "プレーヤーを閉じる",
    nothingPlaying: "再生中の曲はありません",
    backToHome: "ホームへ戻る",
    nowPlaying: "NOW PLAYING",
    pause: "一時停止",
    play: "再生",
    previous15: "15秒戻る",
    next15: "15秒進む",
    miniPlayer: "再生中",
  },
} as const;

interface I18nContextValue {
  language: Language;
  setLanguage: (language: Language) => Promise<void>;
  t: (key: TranslationKey) => string;
}

const LANGUAGE_STORAGE_KEY = "hyacine.language";
const I18nContext = createContext<I18nContextValue | null>(null);

function detectLanguage(): Language {
  const locale = Intl.DateTimeFormat().resolvedOptions().locale.toLowerCase();
  if (locale.startsWith("ja")) return "ja";
  if (locale.startsWith("zh")) return "zh-CN";
  return "en";
}

export function I18nProvider({ children }: PropsWithChildren): React.JSX.Element {
  const [language, setCurrentLanguage] = useState<Language>(detectLanguage());

  useEffect(() => {
    void SecureStore.getItemAsync(LANGUAGE_STORAGE_KEY).then((savedLanguage) => {
      if (languages.includes(savedLanguage as Language)) {
        setCurrentLanguage(savedLanguage as Language);
      }
    });
  }, []);

  const value = useMemo<I18nContextValue>(
    () => ({
      language,
      setLanguage: async (nextLanguage) => {
        setCurrentLanguage(nextLanguage);
        await SecureStore.setItemAsync(LANGUAGE_STORAGE_KEY, nextLanguage);
      },
      t: (key) => dictionaries[language][key],
    }),
    [language],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used inside I18nProvider");
  return context;
}