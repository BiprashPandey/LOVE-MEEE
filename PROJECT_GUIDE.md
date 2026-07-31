# LOVE MEEE — Project Guide

> **This file is in** **`.gitignore`** **and will never be committed.**
> It is your personal reference for understanding, editing, and deploying the app.

***

## Table of Contents

1. [What Is This App?](#1-what-is-this-app)
2. [Folder & File Map](#2-folder--file-map)
3. [Every Component Explained](#3-every-component-explained)
4. [Every Page Explained](#4-every-page-explained)
5. [Data Layer & Theme System](#5-data-layer--theme-system)
6. [How To Change Things Manually](#6-how-to-change-things-manually)
7. [Running the App Locally](#7-running-the-app-locally)
8. [Play Store Deployment (Step-by-Step)](#8-play-store-deployment-step-by-step)

***

## 1. What Is This App?

**LOVE MEEE** is a personal productivity and motivation app that:

* Helps you set and track a single big commitment/goal

* Plays locally-saved motivational Instagram/YouTube reels

* Tracks your daily tasks, focus sessions (Pomodoro with adjustable durations), and streaks

* Sends smart notifications (daily reel, goal countdown, sleep reminders)

* Has a Distraction Shield that simulates/monitors distracting apps

* Supports 3 custom color themes (**Pink-Red**, **Green**, **Golden**)

* Works fully offline — all data is saved to `localStorage` on your device

The app is a **React (Vite) PWA** served on `localhost:5173`. A companion **Node.js download server** on port `3001` handles downloading videos via `yt-dlp`.

***

## 2. Folder & File Map

```
LOVE-MEEE/
├── public/
│   └── videos/           ← Downloaded .mp4 files live here (git-ignored)
├── src/
│   ├── api/
│   │   └── storageClient.js     ← All localStorage CRUD (your "database")
│   ├── components/              ← Reusable UI pieces
│   │   ├── AppLayout.jsx        ← Shell: bottom nav + page outlet
│   │   ├── DistractionMonitor.jsx ← Monitored apps & pattern interrupt simulation
│   │   ├── MotivationalReel.jsx ← Hero video card + inline reel player + heart overlay
│   │   ├── PomodoroTimer.jsx    ← Focus timer with presets & +/- minute adjustments
│   │   ├── ProtectedRoute.jsx   ← Redirects to onboarding if no goal set
│   │   ├── QuickNoteModal.jsx
│   │   ├── QuoteCard.jsx
│   │   ├── SleepSchedule.jsx    ← Editable sleep/wake times
│   │   ├── StreakCard.jsx        ← Streak + today's level (e.g. GRIND Day)
│   │   └── ThemeToggle.jsx      ← Dark / Light mode toggle
│   ├── hooks/                   ← Custom React hooks
│   ├── lib/
│   │   ├── AppContext.jsx       ← Global state, theme engine + data operations
│   │   ├── AuthContext.jsx      ← Auth state (local-only)
│   │   ├── dayLog.js            ← Streak/level calculation logic
│   │   ├── defaultReels.js      ← Seed list of Instagram reel URLs
│   │   ├── NotificationService.js ← All notifications, sounds, haptics
│   │   ├── quotes.js            ← 100 motivational quotes array
│   │   └── utils.js             ← Tailwind `cn()` helper
│   ├── pages/
│   │   ├── CalendarPage.jsx     ← History calendar view
│   │   ├── Dashboard.jsx        ← Home tab (random splash + reel + streak + notes)
│   │   ├── Extra.jsx            ← Color theme picker, Sleep, Distractions, Quote
│   │   ├── Onboarding.jsx       ← 5-step setup (Name, Theme, Goal, Distractions, Sleep)
│   │   ├── Pomodoro.jsx         ← Focus / Timer tab
│   │   └── Tasks.jsx            ← Tasks tab
│   ├── App.jsx                  ← Route definitions
│   ├── index.css                ← Global styles, design tokens & 3 theme CSS variables
│   └── main.jsx                 ← React root mount
├── download-server.js           ← Node.js video downloader (yt-dlp)
├── start.js                     ← Launches both servers concurrently
├── vite.config.js               ← Vite + path alias config
├── package.json
└── PROJECT_GUIDE.md             ← (This file — git-ignored)
```

***

## 3. Every Component Explained

### `AppLayout.jsx`

**What it does:** Persistent shell wrapping every page. Renders the bottom navigation bar (Home, Tasks, Focus, Calendar, Extra) and an `<Outlet>` for page content.

***

### `MotivationalReel.jsx`

**What it does:** Hero card on the Dashboard. Shows a motivational image with a daily quote, play button, and heart (like) button.

* **On every refresh**: Picks a weighted random reel (liked reels have 3× higher chance).

* **Inline Video Player (`VideoOverlay`)**: Plays the `.mp4` video directly on the card.

* **Heart Button on Overlay**: A heart button stays overlayed right on top of playing video reels so users can heart/unheart while watching.

* **Reel Pool Modal**: Access to manually adding/opening the reel pool modal has been disabled to keep the experience clean and focused.

***

### `PomodoroTimer.jsx`

**What it does:** Adjustable focus timer with Pomodoro and Stopwatch modes.

* **Settings Panel (⚙️)**:

  * Presets: `15/5`, `25/5`, `45/10`, `90/20` (focus/break minutes)

  * Steppers: `+` / `-` buttons to fine-tune focus and break minutes.

* Logs completed focus minutes to `FocusSession` & `DayLog`.

***

### `StreakCard.jsx`

**What it does:** Displays 3 metrics: current streak, best streak, and today's productivity level (`On Fire`, `Solid`, `Getting Started`, or `GRIND Day`).

***

### `SleepSchedule.jsx`

**What it does:** Displays sleep/wake times with an inline **Edit** button to customize and save sleep schedules.

***

### `DistractionMonitor.jsx`

**What it does:** Displays monitored distraction apps with an **Edit** button to add/remove apps, plus a pattern interrupt simulation.

***

### `NotificationService.js`

**What it does:** Central engine for Web Notifications, audio chimes, and haptics.

* `sendGoalCountdownIfNeeded(goal)`: Sends daily goal countdown notification.

* `sendReelNotificationIfNeeded(title)`: Sends daily reel notification (clicking it auto-plays the reel in app).

***

## 4. Every Page Explained

### `Dashboard.jsx` (Home tab)

* **Random Splash Screen Overlay**: On every page refresh or home load, one of 3 splash variants appears randomly for 3s (or until tapped):

  1. 💬 Quote of the Day
  2. 🔥 Streak count with fire glow
  3. 🎯 Your stated goal / commitment

* Renders `MotivationalReel`, `StreakCard`, and quick notes.

### `Onboarding.jsx` (5-Step Initial Setup)

1. **Your Name**: "What should we call you?"
2. **App Theme**: Interactive theme picker (**Pink-Red**, **Green**, **Golden**)
3. **Your Goal**: "I will \_\_\_ by \_\_\_"
4. **Distractions**: Select distracting apps
5. **Sleep Schedule**: Bedtime & wake times

### `Tasks.jsx`

* Manage daily tasks with priority tags (high/medium/low).

### `Pomodoro.jsx`

* Adjustable Pomodoro & Stopwatch focus timer.

### `CalendarPage.jsx`

* Monthly history grid showing daily productivity levels.

### `Extra.jsx`

* Color Theme Picker (Pink-Red, Green, Golden), Quote Card, Distraction Monitor, and Sleep Schedule.

***

## 5. Data Layer & Theme System

### Theme Engine (`src/index.css` & `src/lib/AppContext.jsx`)

The app supports 3 custom color themes:

* **Pink-Red** (Default: Rose / Fuchsia)

* **Green** (Emerald / Mint)

* **Golden** (Amber / Gold)

`AppContext` manages `appTheme` and applies `data-theme="green|golden|pink-red"` to `document.documentElement`. CSS custom properties (`--primary`, `--ring`, `--accent`) dynamically update across light and dark modes.

### Local Storage Entities (`src/api/storageClient.js`)

* `Goal`: Commitment text, deadline, theme, user\_name, sleep\_time, wake\_time, distracting\_apps

* `Task`: Daily tasks & completion status

* `FocusSession`: Completed Pomodoro & stopwatch sessions

* `DayLog`: Daily productivity score & streak tracking

* `Note`: Quick notes

* `Reel`: Seeded motivational reel links

***

## 6. How To Change Things Manually

### Change the app name or title

* Update `<title>` in `index.html` and `name` in `public/manifest.json`.

### Add or edit theme colors

* Edit the `[data-theme="..."]` CSS variables in `src/index.css`.

### Add new motivational quotes

* Edit the `QUOTES` array in `src/lib/quotes.js`.

### Change streak labels ("GRIND Day", "On Fire")

* Edit `levelLabels` in `src/components/StreakCard.jsx`.

### Change productivity level thresholds

* Edit `computeLevel()` in `src/lib/dayLog.js`.

***

## 7. Running the App Locally

### Start both servers

```bash
node start.js
```

* Web App: `http://localhost:5173` (or phone WiFi `http://192.168.x.x:5173`)

* Video Download Server: `http://localhost:3001`

***

## 8. Play Store Deployment (Step-by-Step)

1. **Deploy frontend to Vercel/Netlify**: `npm run build` → deploy `dist/` over HTTPS.
2. **Setup PWA Manifest**: Ensure `public/manifest.json` has app name, colors, and 512x512 icons.
3. **Build TWA Package with Bubblewrap**:

   ```bash
   npm install -g @bubblewrap/cli
   bubblewrap init --manifest https://biprashpandey.com.np/apps/lovemeee/manifest.json
   bubblewrap build
   ```
4. **Setup Asset Links**: Place `.well-known/assetlinks.json` containing SHA-256 fingerprint on your domain.
5. **Upload** **`.aab`** **to Google Play Console**: Complete store listing and publish!
