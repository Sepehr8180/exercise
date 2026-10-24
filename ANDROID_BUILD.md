# Android build (Capacitor)

This adds an Android packaging path around the existing web app. The original root-level
`index.html`, PWA files, Firebase data model, and GitHub Pages deployment source are not
rewritten. The Android build copies the current web files into `www/` immediately before
Capacitor syncs them, so the app does not depend on a separately hosted website at runtime.

## Automated debug APK

1. Open the repository's **Actions** tab.
2. Run **Android debug APK** using **Run workflow**, or push a change to the Android packaging
   files / web app files.
3. Open the successful workflow run and download the `workout-tracker-debug-apk` artifact.
4. Extract the ZIP and install `app-debug.apk` on an Android device. Android may ask you to
   allow installation from that file source.

The workflow builds a debug APK for testing. It does not publish to Google Play, create a
release APK, or require signing secrets.

## Local build prerequisites

- Node.js 20 or newer
- Java 21
- Android SDK / Android Studio command-line components

Then run:

```sh
npm install
npm run android:prepare
npx cap add android
npx cap sync android
cd android
./gradlew assembleDebug
```

On Windows PowerShell, run `.\gradlew.bat assembleDebug` from the `android` directory.

## Offline data behavior

- The app keeps downloaded workout history and personal records in IndexedDB on the device.
- Workout saves and day clears are committed locally first, then queued for Firestore sync.
- Pending changes retry when connectivity returns while the app is open, and again on the next launch.
- If a date was also changed on the server while this device was offline, the app asks before replacing the server version. If you cancel, the local change remains saved and waits for a later decision.
- Open the app online once after installing/updating so the app shell and CDN JavaScript dependencies can be cached. Demonstration videos are cached only after they are played/downloaded once.
- Automatic upload is not guaranteed while the app is fully closed; pending changes resume on reconnect events or the next launch.

## Important compatibility notes

- The initial Android application ID is `com.sepehr.exercise`. If an older Android app has
  already been distributed, confirm its application ID and signing key before installing this
  build as an update.
- Debug APKs use a debug signing key and are not suitable as a production release.
- Keep the release signing key private. A future release workflow should use GitHub Actions
  secrets and only be added after the production package ID and signing-key continuity are
  confirmed.
- This packaging step does not change Firestore security rules, add user authentication, or
  migrate existing cloud data. Those require a separate, verified data/security plan.
- The current web app asks for a Gemini API key and stores it in browser local storage. Treat
  this as a personal testing build; a client-side key is not a secure secret.
