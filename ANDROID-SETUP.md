# Habit Tracker — Android APK using GitHub Actions (no Android Studio)

This project wraps the existing HTML/CSS/JavaScript app with Capacitor. You can build a **debug APK in GitHub's cloud** without installing Android Studio or the Android SDK on your laptop.

## What you need

- A free GitHub account: https://github.com/
- The ZIP extracted on your computer
- Internet access

## 1. Create a GitHub repository

1. Sign in to GitHub and create a new repository named `habit-tracker-android`.
2. For the simplest no-cost setup, make it **Public**. GitHub says standard hosted runners are free and unlimited for public repositories. If you keep it private, GitHub Free has a monthly included Actions allowance and usage limits may apply.
3. Do not upload passwords, private API keys, signing keystores, or other secrets.

## 2. Upload this project

1. Extract this ZIP.
2. Open the extracted `habit_tracker_android` folder.
3. Upload its contents to the root of your GitHub repository. Make sure `package.json`, `capacitor.config.json`, `www/`, and `.github/workflows/build-android.yml` are at the repository root (not nested inside another folder).
4. Commit the files to the `main` branch.

## 3. Start the cloud build

1. Open your repository on GitHub.
2. Select **Actions**.
3. Select **Build Habit Tracker APK**.
4. Click **Run workflow** and confirm.
5. Wait for the workflow to finish with a green check mark.

The workflow installs Node, Java and Android SDK on a temporary GitHub runner, generates the native Android project with Capacitor, and builds the debug APK.

## 4. Download the APK

1. Open the completed workflow run.
2. Scroll to **Artifacts**.
3. Download `habit-tracker-debug-apk`.
4. Extract the downloaded artifact ZIP to get `app-debug.apk`.
5. Transfer the APK to your Android phone and install it. Android may ask you to allow installation from that file manager/browser.

## Important

- This workflow creates a **debug APK for testing**, not a signed production release or Play Store AAB.
- Keep your repository public only if you are comfortable making the app's source code public. A public repo is not required for the app itself to be public, but it makes the standard GitHub-hosted build free and unlimited under GitHub's current policy.
- Before public distribution, review the Supabase leaderboard security and privacy policy. Never commit service-role keys or passwords.
- The app stores much of its data locally. Uninstalling the app or clearing its data can erase that data; use the app's export/backup feature.
- The original app files are kept under `www/`.


## Automatic updates (no new APK needed)

The APK contains a built-in copy of the app, so it works offline. When you change the app later you do **not** have to rebuild or re-share the APK:

1. **One-time setup:** in your GitHub repository open **Settings → Pages**, and under **Build and deployment → Source** choose **GitHub Actions**. (The repository must be public for free Pages hosting.)
2. Edit files in `www/` and push to `main`. The workflow **Publish app update** runs automatically (about a minute) and publishes the new web bundle to `https://<your-username>.github.io/<repo-name>/`.
3. Phones that have the app installed check for it a few seconds after opening the app, download it quietly, and show *"Update downloaded"*. It takes effect the next time the app is closed or sent to the background. Settings shows the running build number (e.g. `v5.0 · build 42`) so you can confirm.

Safety: if a new bundle fails to start, the app automatically rolls back to the last working version. User data (habits, etc.) is never touched by an update.

**When you DO need a new APK:** only for changes outside `www/` — a new Capacitor plugin, the app icon, app name/ID, or Android permissions. Run **Build Habit Tracker APK** and share the new APK. Anyone who installed an APK from *before* this update feature existed must install a new APK once; after that, web changes arrive automatically.

How the build number works: it is the number of commits on `main` (`git rev-list --count HEAD`), so it always goes up. An installed app only accepts a bundle with a higher number than the one it is running, so it can never be "updated" backwards.

## App icon and Android Back behavior

The Android build uses the brand icon layers in `assets/`. The workflow runs `@capacitor/assets` to generate native Android launcher icon resources. Android Back closes the topmost open layer (Settings, sheets, dialogs) first; at the root screen, Back exits the app normally.
