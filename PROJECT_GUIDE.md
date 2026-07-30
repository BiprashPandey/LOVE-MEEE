# LOVE MEEE — Complete Project Guide

> A productivity & motivation mobile app built with React + Vite + Capacitor (Android).
> No cloud, no subscriptions — everything runs locally on your device.

---

## Table of Contents

1. [What the App Does](#1-what-the-app-does)
2. [Tech Stack](#2-tech-stack)
3. [Directory Structure](#3-directory-structure)
4. [File-by-File Breakdown](#4-file-by-file-breakdown)
5. [How Each Feature Works](#5-how-each-feature-works)
6. [Running the App (Development)](#6-running-the-app-development)
7. [Building the Android APK](#7-building-the-android-apk)
8. [Publishing to Google Play Store](#8-publishing-to-google-play-store)
9. [Adding New Features](#9-adding-new-features)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. What the App Does

LOVE MEEE is a personal productivity companion with five core pillars:

| Feature | What it does |
|---|---|
| **Dashboard** | Daily overview, quick notes, motivational reel card |
| **Tasks** | Full CRUD task management with priority levels |
| **Focus / Pomodoro** | Countdown timer (Pomodoro) + open-ended stopwatch with audio chimes & haptics |
| **Calendar** | Visual streak tracker + tap any day to see that day's summary |
| **Motivational Reels** | Download Instagram/YouTube reels locally — plays in-app, no Instagram opened |

All data is stored **locally** (no server, no sign-up, no internet required for core features).

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Frontend Framework | React 18 + Vite 6 |
| Styling | Tailwind CSS 3 + shadcn/ui component primitives |
| Animations | Framer Motion |
| State Management | React Context API (`AppContext`) |
| Local Storage | Browser `localStorage` (via custom `storageClient`) |
| Native App Wrapper | Capacitor 8 (Android) |
| Video Downloader | `yt-dlp` (Python) — wrapped by a local Node.js Express server |
| Icons | Lucide React |
| Toasts | Sonner |
| Calendar | react-day-picker |
| Charts | Recharts |

---

## 3. Directory Structure

```
LOVE-MEEE/
│
├── android/                    ← Capacitor-generated Android project
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── AndroidManifest.xml  ← App permissions
│   │   │   └── assets/public/       ← Built web app lives here
│   │   └── build.gradle             ← Android build config
│   ├── build.gradle                 ← Root Gradle config
│   └── variables.gradle             ← SDK versions, dependencies
│
├── public/
│   └── videos/                 ← Downloaded reels stored here
│       └── registry.json       ← Maps reel URLs → local filenames
│
├── src/
│   ├── api/
│   │   ├── storageClient.js    ← localStorage CRUD engine
│   │   └── base44Client.js     ← Compatibility re-export of storageClient
│   │
│   ├── components/
│   │   ├── DistractionMonitor.jsx   ← Pattern-interrupt popups
│   │   ├── DaySummaryModal.jsx      ← Calendar day detail view
│   │   ├── MotivationalReel.jsx     ← Reel card with inline video player
│   │   ├── PomodoroTimer.jsx        ← Pomodoro + stopwatch timer
│   │   ├── QuickNoteModal.jsx       ← Quick note entry dialog
│   │   ├── ReelPlayerModal.jsx      ← Full-screen video player modal
│   │   └── TaskItem.jsx             ← Individual task with edit support
│   │
│   ├── lib/
│   │   ├── AppContext.jsx       ← Global state + all actions
│   │   ├── AuthContext.jsx      ← Local guest profile context
│   │   ├── dayLog.js            ← Streak/level calculation logic
│   │   ├── NotificationService.js  ← Web Audio API chimes + haptics
│   │   └── quotes.js            ← Daily motivational quotes array
│   │
│   ├── pages/
│   │   ├── App.jsx              ← Root router
│   │   ├── AppLayout.jsx        ← Tab bar + page wrapper
│   │   ├── CalendarPage.jsx     ← Calendar + streak view
│   │   ├── Dashboard.jsx        ← Home screen
│   │   ├── Onboarding.jsx       ← First-launch goal setup
│   │   ├── Pomodoro.jsx         ← Focus timer page
│   │   └── Tasks.jsx            ← Task list page
│   │
│   ├── index.css                ← Tailwind base + custom CSS variables
│   └── main.jsx                 ← React entry point
│
├── capacitor.config.json        ← Capacitor app ID, server config
├── download-server.js           ← yt-dlp video download API (port 3001)
├── start.js                     ← Starts both servers concurrently
├── START_APP.bat                ← Double-click Windows launcher
├── vite.config.js               ← Vite + path aliases
├── tailwind.config.js           ← Tailwind theme
├── package.json                 ← Scripts + dependencies
└── PROJECT_GUIDE.md             ← This file
```

---

## 4. File-by-File Breakdown

### `src/api/storageClient.js`
The entire "database" of the app. Uses `localStorage` under the hood.

- Defines collections: `Goal`, `Task`, `FocusSession`, `DayLog`, `Note`, `Reel`
- Each collection has: `.list(sort, limit)`, `.filter(query)`, `.create(data)`, `.update(id, data)`, `.delete(id)`
- Fires a custom DOM event `love_meee_storage_change` on every write so the UI re-renders
- No network calls — works offline forever

### `src/lib/AppContext.jsx`
The single source of truth for all app state.

- Loads all data from `storageClient` on mount
- Exposes helper actions: `addTask`, `toggleTask`, `editTask`, `deleteTask`, `completeFocusSession`, `addNote`, `deleteNote`, `addReel`, `deleteReel`, `saveGoal`
- Computes derived values: `streak`, `longestStreak`, `todayLog`
- On startup, calls `POST /sync-reels` on the download server — any saved reel URLs get queued for automatic background download
- Polls `GET /registry` every 8 seconds to know which reels are locally saved
- Exposes `reelRegistry` (URL → local file mapping) to all components

### `src/lib/NotificationService.js`
Audio + haptic feedback engine — no external sounds needed.

- `playCompletionChime()` — synthesizes a pleasant chime using Web Audio API
- `playTickSound()` — soft tick for Pomodoro countdown
- `triggerHapticFeedback(pattern)` — vibrates the device (works on Android)
- `sendNotification(title, body)` — sends a browser/OS notification

### `src/lib/dayLog.js`
Pure calculation functions for streaks and productivity levels.

- `computeStreak(dayLogs)` — counts consecutive productive days up to today
- `getLongestStreak(dayLogs)` — historical best streak
- `computeLevel(tasks, focusMinutes)` — returns `'low'`, `'medium'`, `'high'`, or `'excellent'`
- `getTodayStr()` — returns today as `"YYYY-MM-DD"`

### `src/components/MotivationalReel.jsx`
The reel card on the Dashboard home screen.

- Picks a random reel from the saved pool each session
- Checks `reelRegistry` to see if the reel has been downloaded locally
- If downloaded → play button is **green**, tap plays the video inline on the card immediately (no extra steps)
- If downloading → shows a spinner badge
- If queued → shows "Queued" badge
- Manages the Reels Pool (add / delete / view status of all saved reels)

### `src/components/ReelPlayerModal.jsx`
Full-screen video player used when playing from the local library.

- Supports YouTube embeds (iframe) and local/direct video files (`<video>`)
- For Instagram URLs not yet downloaded, shows a branded download prompt

### `download-server.js`
A small Express HTTP server running on port **3001**.

**Endpoints:**
- `GET /status` — health check, reports yt-dlp availability and queue state
- `GET /registry` — returns the URL→filename registry (JSON)
- `POST /sync-reels` — accepts `[{url, title}]`, queues downloads for any not already saved
- `POST /download` — downloads a single URL immediately
- `GET /videos` — lists all local video files
- `DELETE /videos/:filename` — deletes a local video

**How downloads work:**
1. Calls `yt-dlp` with the URL
2. Uses `--cookies-from-browser chrome` so it can access reels you're logged into on Instagram in Chrome
3. Saves to `public/videos/` as a clean `slug_timestamp.mp4`
4. Updates `public/videos/registry.json` with the URL → filename mapping
5. Downloads are queued sequentially (2-second gap between each) to avoid Instagram rate limiting

### `start.js`
Launches both `download-server.js` (port 3001) and Vite (port 5173) in a single terminal with color-coded output.

### `START_APP.bat`
Double-click this file in Windows Explorer to start everything. Shows a console window.

### `capacitor.config.json`
Tells Capacitor:
- App ID: `com.lovemeee.app`
- App Name: LOVE MEEE
- Where the built web assets live: `dist/`

### `android/app/build.gradle`
Android build configuration:
- `minSdkVersion 22` (Android 5.1+)
- `targetSdkVersion 34` (Android 14)
- `compileSdk 35`
- `compileOptions` set to Java 17

### `android/app/src/main/AndroidManifest.xml`
Permissions the app requests on Android:
- `INTERNET` — for loading web content
- `VIBRATE` — haptic feedback
- `POST_NOTIFICATIONS` — focus session completion alerts
- `WAKE_LOCK` — keep screen on during focus sessions

---

## 5. How Each Feature Works

### Task Management
1. User types a task → `addTask()` in AppContext → `storageClient.Task.create()` → localStorage
2. Toggle → `toggleTask()` → updates `completed` + `completed_at` → plays chime + haptic → `updateTodayLog({ tasksDelta: +1 })`
3. Day log tracks `tasks_completed` count per day for the calendar heatmap

### Pomodoro Timer
1. Countdown starts (default 25 min)
2. Every second: `playTickSound()` (subtle)
3. On complete: `completeFocusSession('pomodoro', seconds)` → creates a FocusSession record → `updateTodayLog({ focusDelta: minutes })` → chime + vibration + OS notification

### Streak System
1. `DayLog` table has one row per day with `tasks_completed` and `focus_minutes`
2. `computeStreak()` walks backwards from today counting consecutive days where `productivity_level !== 'low'`
3. Displayed on the Calendar page with color-coded day cells

### Calendar Day Summary
- Tap any day cell → `DaySummaryModal` opens
- Looks up the `DayLog` for that date
- Shows: tasks completed that day, focus minutes, productivity badge, and any notes logged that day

### Reel Auto-Download System
1. App starts → `AppContext` calls `POST /sync-reels` with all saved reel URLs
2. Download server queues any not yet in `registry.json`
3. `yt-dlp` downloads each to `public/videos/`
4. Registry updated → `AppContext` polls and updates `reelRegistry` state
5. `MotivationalReel` sees the registry entry → play button turns green
6. User taps → video plays inline on the card immediately

---

## 6. Running the App (Development)

### First-time setup

```bash
# Install Node dependencies
npm install

# Install yt-dlp (for reel downloading)
pip install yt-dlp
```

### Start everything (recommended)

```bash
npm start
# OR: double-click START_APP.bat
```

This starts:
- **Download server** at `http://localhost:3001`
- **Vite dev server** at `http://localhost:5173` (also accessible on your local network)

### Access on your Android phone (same WiFi)

Open Chrome on your phone and go to:
```
http://192.168.x.x:5173
```
(Your PC's local IP — shown in the terminal when Vite starts)

### Run individual servers separately (advanced)

```bash
# Terminal 1
npm run download:server

# Terminal 2
npm run dev
```

---

## 7. Building the Android APK

### Debug APK (for testing on your phone)

```bash
# 1. Build the web app
npm run build

# 2. Sync to Android project
npx cap sync android

# 3. Build the APK
cd android
.\gradlew.bat assembleDebug

# Output: android/app/build/outputs/apk/debug/app-debug.apk
```

### Install on connected Android phone via USB

```bash
# Make sure USB debugging is ON in Developer Options
npx cap run android
```

Or manually via `adb`:
```bash
adb install android\app\build\outputs\apk\debug\app-debug.apk
```

---

## 8. Publishing to Google Play Store

### Step 1 — Create a Release Keystore (one time only)

```bash
keytool -genkeypair -v -keystore lovemeee-release.keystore -alias lovemeee -keyalg RSA -keysize 2048 -validity 10000
```

Save this file somewhere safe. **If you lose it, you cannot update the app on Play Store.**

### Step 2 — Configure signing in Gradle

Edit `android/app/build.gradle` and add:

```groovy
android {
    signingConfigs {
        release {
            storeFile file('../../lovemeee-release.keystore')
            storePassword 'YOUR_STORE_PASSWORD'
            keyAlias 'lovemeee'
            keyPassword 'YOUR_KEY_PASSWORD'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
        }
    }
}
```

### Step 3 — Build the release AAB (Android App Bundle)

```bash
npm run build:aab
# OR manually:
npm run build
npx cap sync android
cd android
.\gradlew.bat bundleRelease
```

Output: `android/app/build/outputs/bundle/release/app-release.aab`

### Step 4 — Create a Google Play Developer Account

1. Go to [play.google.com/console](https://play.google.com/console)
2. Pay the one-time $25 registration fee
3. Complete account details

### Step 5 — Create a New App

1. Click **"Create app"**
2. Set: App name `LOVE MEEE`, Default language `English`, App type `App`, Free/Paid
3. Complete all required sections:
   - **App content**: Privacy policy URL, content rating questionnaire
   - **Store listing**: App description, screenshots (at least 2 phone screenshots), feature graphic (1024×500px), app icon (512×512px)
   - **Pricing & distribution**: Select countries

### Step 6 — Upload the AAB

1. Go to **Production** → **Create new release**
2. Upload `app-release.aab`
3. Write release notes
4. Click **"Review release"** → **"Start rollout to Production"**

### Step 7 — Wait for Review

Google takes **1–7 days** for first-time reviews. You'll get an email.

### Screenshots needed for Play Store

- **Phone**: At least 2, up to 8 (recommended size: 1080×1920px)
- **Feature graphic**: 1024×500px (banner image)
- **App icon**: 512×512px PNG

> **Tip**: Take screenshots of the app running on your phone (or use Android Studio's emulator) and then edit them in Canva or Figma.

### Privacy Policy requirement

Google requires a privacy policy URL. You can:
1. Create a free page on [privacypolicygenerator.info](https://privacypolicygenerator.info)
2. Host it on GitHub Pages for free

---

## 9. Adding New Features

### Add a new entity (data type)

1. Open `src/api/storageClient.js` and add to the `entities` object:
```js
Habit: createEntityMethods('habits'),
```

2. Add to `AppContext.jsx` — load it in `loadAllData()` and create CRUD functions

3. Use in any component via `const { habits } = useApp()`

### Add a new page/tab

1. Create `src/pages/MyPage.jsx`
2. Add a route in `src/App.jsx`
3. Add a tab button in `src/pages/AppLayout.jsx`

### Add new motivational quotes

Edit `src/lib/quotes.js` — it's just an array of `{ text, author }` objects.

### Add a new reel to the default pool

Add it in `MotivationalReel.jsx` where `activeReel` fallback is defined, or add it through the in-app "Reels Pool" manager.

---

## 10. Troubleshooting

### "Download server not running"
- Make sure you ran `npm start` or `node download-server.js` in a terminal
- The download server must be running on your PC for the auto-download feature to work
- Once videos are downloaded, the app plays them even without the server

### "Instagram sent empty media response"
- Instagram requires you to be logged in for some reels
- yt-dlp uses `--cookies-from-browser chrome` — make sure you're logged into Instagram in Google Chrome on your PC
- Try opening the reel in Chrome first, then trigger the download

### "invalid source release: 21" (Gradle build error)
- Already fixed: `compileOptions { sourceCompatibility JavaVersion.VERSION_17 }` is set in `android/app/build.gradle` and `android/build.gradle`

### App doesn't load on phone (Wi-Fi testing)
- Make sure your phone and PC are on the **same Wi-Fi network**
- Find your PC's local IP in the Vite terminal output (`Network: http://192.168.x.x:5173`)
- Check Windows Firewall — allow Node.js through if prompted

### Videos don't play after download
- Videos are served from `public/videos/` via the Vite dev server
- The `registry.json` maps URLs to filenames — check `public/videos/registry.json`
- If a video file is corrupted, delete it from `public/videos/` and re-add the reel URL in the pool

### "yt-dlp not found"
- Run `pip install yt-dlp` in a terminal
- Or install manually: download `yt-dlp.exe` from [github.com/yt-dlp/yt-dlp/releases](https://github.com/yt-dlp/yt-dlp/releases) and place it in the project root

---

## Quick Reference Commands

```bash
npm start              # Start everything (recommended)
npm run dev            # Vite only
npm run download:server # Download server only
npm run build          # Build web app for production
npm run build:android  # Build + sync to Android
npm run build:aab      # Full release bundle
npx cap run android    # Install + run on connected phone
npx cap open android   # Open in Android Studio
```

---

*Built with ❤️ for personal productivity. No data leaves your device.*
