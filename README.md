# Hyacine.music Mobile

[简体中文](README.zh-CN.md) · [日本語](README.ja-JP.md)

Hyacine.music is the React Native / Expo mobile client for a separately deployed
NestJS music backend.

## Implemented Features
- Playback foundation with queue management, media controls, background playback, a mini player, and a full-screen player.
- Interface localization for Simplified Chinese, English, and Japanese, with the language preference persisted locally.
- Four UI styles: Default, Frosted, Liquid, and MIUI; four visual presets: Midnight, Black, Daylight, and Aurora.
- Three player layouts: Vinyl, Immersive, and Minimal.
- Locally persisted theme settings for style, preset, layout, font scale, list density, and a custom six-digit HEX accent color.
- Frosted and Liquid use different material treatments: Frosted is a stable translucent surface, while Liquid adds animated refraction highlights and a dynamic color field.

### Glass Rendering Notes
On iOS, Frosted uses the official `expo-blur` `BlurView` for background blur. Android real-time blur behavior depends on the Expo native implementation, OS version, and device capability. The Android-compatible presentation uses translucent tinting and, for Liquid, animated refraction and gloss; it does not claim identical native real-time blur on every Android device.

## Technology

- Expo SDK 57, React Native 0.86, TypeScript
- Expo Router and NativeWind
- Zustand for UI state
- `react-native-track-player` for queue, background audio, lock-screen and media controls
- Expo SecureStore for JWT storage

> `react-native-track-player` is a native module. Use an Android Development Build,
> Debug APK, or production build. Expo Go is not supported.

## Backend API address

Copy the environment template:

```bash
cp .env.example .env
```

Set `EXPO_PUBLIC_API_URL` to the independent backend's `/api/v1` URL:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.100:3000/api/v1
```

### Local-network device testing

- The Android phone and backend machine must use the same network.
- NestJS must listen on `0.0.0.0`, not only `localhost`.
- Allow the backend port through the host firewall.
- Android Emulator uses `10.0.2.2` to reach a backend running on the host:

```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000/api/v1
```

Do not commit `.env`; use `.env.example` as the documented template.

## Development

```bash
pnpm install
pnpm typecheck
pnpm start
```

Generate and run an Android Development Build locally:

```bash
pnpm android
```

## Android Release APK with GitHub Actions

Every push to `master`, `main`, or `develop` triggers **Android Release APK**.
The workflow performs:

1. pnpm dependency installation with cache;
2. Gradle dependency and build-output caching;
3. TypeScript validation;
4. Expo Android prebuild;
5. ARM64 (`arm64-v8a`) `assembleRelease`;
6. embedded JavaScript bundle and assets, so Metro `8081` is not required;
7. Artifact upload.

Open the repository's **Actions** page, choose a successful run, and download
the `hyacine-music-release-apk-arm64` artifact. Its ZIP contains
`app-release.apk`.

For a manually started workflow, enter the backend API URL in **Backend API URL**,
for example:

```text
http://192.168.1.100:3000/api/v1
```

The value is embedded as `EXPO_PUBLIC_API_URL` in that Release APK.

## Track Player compatibility patch

`react-native-track-player@4.1.2` has a Kotlin nullability incompatibility with
React Native 0.86. The repository includes a pnpm native patch at:

```text
patches/react-native-track-player@4.1.2.patch
```

pnpm records and applies it automatically during installation. Keep this patch
until upgrading to a Track Player release that officially supports React Native 0.86.
