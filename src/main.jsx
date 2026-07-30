import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

// ── One-time migration: clear old fake-URL reels so 17 real reels get seeded ──
const MIGRATION_KEY = 'love_meee_migrated_real_reels_v1';
if (!localStorage.getItem(MIGRATION_KEY)) {
  const fakeUrls = [
    'https://www.instagram.com/reel/C3x9w4PL_Y7/',
    'https://www.instagram.com/reel/C8XYZ123456/',
    'https://www.instagram.com/reel/C5ABC987654/',
    'https://www.instagram.com/reel/DY95pVyT82B/',
  ];
  try {
    const stored = JSON.parse(localStorage.getItem('love_meee_reels') || '[]');
    const hasFakes = stored.some(r => fakeUrls.includes(r.url));
    if (hasFakes || stored.length <= 4) {
      localStorage.removeItem('love_meee_reels');
    }
  } catch {}
  localStorage.setItem(MIGRATION_KEY, '1');
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
