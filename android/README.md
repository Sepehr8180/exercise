# Workout Tracker for Android

This is a lightweight Android WebView shell around the existing deployed website. It deliberately does not copy, rewrite, or migrate the web app: the website and its current backend remain the source of truth, so web changes continue to appear in the Android app.

- Website: https://sepehr8180.github.io/exercise/
- Application ID (debug): `com.sepehr8180.workout.debug`
- Minimum Android version: Android 6.0 (API 23)
- Build output: `app/build/outputs/apk/debug/app-debug.apk`

## Build

Use JDK 17, Android SDK platform 35, and Gradle 8.9:

```sh
gradle --no-daemon assembleDebug
```

A GitHub Actions workflow builds the debug APK and uploads it as an artifact when changes are pushed to the Android wrapper branch or when manually triggered. Download the artifact from the workflow run, unzip it, and install `app-debug.apk` on your Android phone.

## Important behavior

- Requires an internet connection; it loads the current hosted website.
- Workout records are not copied or migrated by this wrapper.
- Existing website storage and Firebase behavior are unchanged.
- This first build is an installable debug APK for testing, not a signed Play Store release.
- The app uses the website's current Firebase configuration. Before using it for sensitive or multi-user data, verify Firestore security rules and access control in the Firebase console.
