# LOVE MEEE - Personal Productivity & Motivation Mobile App

LOVE MEEE is a cross-platform productivity and motivation web/mobile application built with React, Vite, TailwindCSS, Framer Motion, and Web Audio API.

## Features

- **Goal & Onboarding Setup:** Personal primary goal, category selection, monitored distracting apps, and sleep/wake schedule setup.
- **Task Management (CRUD):** Add, edit, prioritize (Low, Med, High), toggle completion, and delete tasks with local persistence.
- **Pomodoro Timer & Stopwatch:** Focus timer cycles with custom work/break intervals, Web Audio synthesized completion chimes, haptic vibration alerts (`navigator.vibrate`), and live tab title countdown.
- **Calendar & Streak Tracking:** Dynamic streak calculation and color-coded productivity log thresholds (High, Medium, Low).
- **Distraction Shield & Pattern Interrupt:** Simulated distraction app usage monitor with automatic intervention alerts and motivational nudges.
- **Local Notifications:** Browser Web Notifications & custom toast alerts for sleep/wake reminders and motivational quotes.

## Getting Started

### Installation
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```

The app will start at `http://localhost:5173`. Access from your phone or local network using the network IP provided in the terminal console.

### Production Build
```bash
npm run build
```
