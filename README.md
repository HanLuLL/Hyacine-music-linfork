# Hyacine Music · 风堇音乐

[简体中文](README.zh-CN.md) · [日本語](README.ja-JP.md)

Hyacine Music is an Expo Router / React Native music client written in TypeScript. It connects to [Hyacine Server](https://github.com/Ruoxi-TH/hyacine-server) and supports Netease Cloud Music and Bilibili sources.

## Current implementation

- TypeScript, Expo Router, React Native, NativeWind, `expo-image`, and `expo-audio`
- Native, liquid-glass, and MIUIX interface styles
- Four player layouts: centered lyrics, full artwork, compact artwork, and artwork with lyrics
- Netease QR login, profile, daily songs, recommendations, playlists, search, playback, timed lyrics, read-only comments
- Local favorites and listening history stored on the device
- Favorites sync to Netease dedicated playlist "收藏风堇音乐" with local-first fallback
- Play URLs are resolved again before playback so saved/history entries do not depend on expired stream URLs
- Lyrics auto-positioning and tap-to-seek
- Dedicated audio settings for Netease streaming quality, sound presets, and a saved ten-band equalizer configuration
- Queue with 100‑track initial limit, append‑on‑play and auto‑trim after 10 played tracks
- Paginated comments (20 per load, scroll‑triggered appends)
- OPPO Fluid Cloud real‑time notification with artwork, progress, lyrics and play/pause/skip controls
- Repeat‑one, repeat‑all, sequential, and shuffle play modes
- Bottom-bar-only swipe navigation; page content does not capture tab swipes
- On-device administration screen for profile summary, local data counts, credential-presence status, redacted logs, and backend health
- Playback queue with sequential, loop (repeat list), and shuffle modes (single toggle button)
- Auto-next track on completion (works regardless of which screen the user is on)
- Lock screen media controls (title, artist, artwork, seek forward/backward)
- MiniPlayer hidden on admin and queue pages for clean browsing
- Native swipe gesture for daily recommendation cards
- Paginated recommended playlists (load more on scroll)
- Server health monitoring and non-JSON upstream response protection
- Desktop lyric overlay (floating window) support
- Repeat-one mode replays the current track instead of advancing
- Fluid Cloud now-playing card on OPPO/realme devices shows cover, title, artist, lyrics, real-time progress, and play/pause/prev/next/seek controls

## Administration and privacy

Open **Settings → Administration**. The screen reads data from the current device only. It never displays raw cookies, tokens, or authorization headers. Logs are redacted before persistence and display. This is a diagnostics screen, not a remote multi-user server console.

## Run

```bash
pnpm install
pnpm start
```

Use an Expo Development Build for native modules. Configure a Hyacine Server URL reachable from the phone; do not use `localhost` unless the backend runs on that phone.

```bash
pnpm typecheck
pnpm android
```

## Repositories

- Mobile: <https://github.com/Ruoxi-TH/Hyacine-music>
- Backend: <https://github.com/Ruoxi-TH/hyacine-server>

## Status boundaries

A source commit or successful TypeScript check does not mean a phone has received the change. Build, installation, backend deployment, and real-device verification are separate steps.

## License

MIT License — see [LICENSE](LICENSE).