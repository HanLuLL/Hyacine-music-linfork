# Hyacine.music Mobile

Hyacine.music is the React Native / Expo mobile client for a separately deployed
NestJS music backend.

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

## Android Debug APK with GitHub Actions

Every push to `master`, `main`, or `develop` triggers **Android Debug APK**.
The workflow performs:

1. dependency installation and TypeScript validation;
2. Expo Android prebuild;
3. Gradle `assembleDebug`;
4. Artifact upload.

Open the repository's **Actions** page, choose the successful workflow run, and
download the `hyacine-music-debug-apk` artifact. Its ZIP contains `app-debug.apk`.

## Track Player compatibility patch

`react-native-track-player@4.1.2` has a Kotlin nullability incompatibility with
React Native 0.86. The repository includes a pnpm native patch at:

```text
patches/react-native-track-player@4.1.2.patch
```

pnpm records and applies it automatically during installation. Keep this patch
until upgrading to a Track Player release that officially supports React Native 0.86.
