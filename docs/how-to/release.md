# Release the app

Web-only changes ship over the air (OTA); native changes (plugins, native config, Capacitor upgrades) need a store release. Why, and how the channels work, is in [Updates and version drift](../explanation/updates.md).

## Ship an OTA bundle

CI uploads on frontend changes. To upload by hand, from `apps/frontend`:

```bash
pnpm build
OTA_API_URL=https://api.myfit.fit OTA_UPLOAD_KEY=<key> pnpm ota:upload
```

The script uploads to the channel `pnpm ota:channel` prints. Set `OTA_CHANNEL` to override it.

If the change alters the client contract, deploy the matching API right after; until then, updated clients get 409 on sync and keep their edits queued.

## Withdraw a bad OTA bundle

There is no rollback endpoint. Check out the last good commit, build it, and upload it as a new version in the same channel. Don't rely on this across a schema change: IndexedDB migrations a newer bundle already ran stay applied.

## Ship a store release

The `version` in `apps/frontend/package.json` is the app version for both platforms. Bump it by hand in the release commit. Web-only changes don't need a new version.

- **Android** reads `versionName` and `versionCode` from it in `android/app/build.gradle`.
- **iOS** can't read it. `MARKETING_VERSION` and `CURRENT_PROJECT_VERSION` in the Xcode project (`1.0` and `1`) are placeholders, so pass the real values when archiving:

  ```bash
  xcodebuild archive -project ios/App/App.xcodeproj -scheme App $(node scripts/native-version.js)
  ```

## Run on a device during development

```bash
pnpm build
pnpm exec cap sync            # or: cap sync ios / cap sync android
pnpm exec cap open ios        # or: cap open android
```

To load the Vite dev server in the native app instead of the bundled build, set `CAPACITOR_DEV_SERVER_URL=http://localhost:5173` before `cap sync`. On the Android emulator, first run `adb reverse tcp:5173 tcp:5173` (and `tcp:3000` for a local API). `http://10.0.2.2` is not a secure context, so the app fails there without `crypto.randomUUID`. Leave the variable unset for release builds.
