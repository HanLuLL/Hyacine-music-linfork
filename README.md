# Hyacine Music · 风堇音乐

[简体中文](README.zh-CN.md) · English · [日本語](README.ja-JP.md)

Hyacine Music is an Expo Router / React Native music client written in TypeScript. It connects to [Hyacine Server](https://github.com/Ruoxi-TH/hyacine-server) and supports Netease Cloud Music and Bilibili sources.

## Current implementation

- TypeScript, Expo Router, React Native, NativeWind, `expo-image`, and `expo-audio`
- Native, liquid-glass, and MIUIX interface styles
- Four player layouts: centered lyrics, full artwork, compact artwork, and artwork with lyrics
- Netease QR login, profile, daily songs, recommendations, playlists, search, playback, timed lyrics, read-only comments
- Local favorites and listening history stored on the device
- Play URLs are resolved again before playback so saved/history entries do not depend on expired stream URLs
- Lyrics auto-positioning and tap-to-seek
- Bottom-bar-only swipe navigation; page content does not capture tab swipes
- On-device administration screen for profile summary, local data counts, credential-presence status, redacted logs, and backend health

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

See [LICENSE](LICENSE).