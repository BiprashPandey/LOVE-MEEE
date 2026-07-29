export const MOTIVATIONAL_QUOTES = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { text: "Discipline is the bridge between goals and accomplishment.", author: "Jim Rohn" },
  { text: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "The future depends on what you do today.", author: "Mahatma Gandhi" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "Quality is not an act, it is a habit.", author: "Aristotle" },
  { text: "Your only limit is you.", author: "Unknown" },
  { text: "Push yourself, because no one else is going to do it for you.", author: "Unknown" },
  { text: "Great things never come from comfort zones.", author: "Unknown" },
  { text: "Wake up with determination. Go to bed with satisfaction.", author: "Unknown" },
  { text: "The harder you work for something, the greater you'll feel when you achieve it.", author: "Unknown" },
  { text: "Dream it. Wish it. Do it.", author: "Unknown" },
  { text: "Little things make big days.", author: "Unknown" },
  { text: "It's going to be hard, but hard does not mean impossible.", author: "Unknown" },
  { text: "Don't wait for opportunity. Create it.", author: "Unknown" },
  { text: "Sometimes we're tested not to show our weaknesses, but to discover our strengths.", author: "Unknown" },
  { text: "The key to success is to focus on goals, not obstacles.", author: "Unknown" },
  { text: "Wake up, be kind, do good, repeat.", author: "Unknown" },
  { text: "Progress, not perfection.", author: "Unknown" },
  { text: "One day or day one. You decide.", author: "Unknown" },
  { text: "Stop wishing. Start doing.", author: "Unknown" },
];

export const PATTERN_INTERRUPT_MESSAGES = [
  "You've been scrolling for a while. Your goals are waiting. 🌟",
  "Pattern interrupt! Take a breath and refocus on what matters. 💪",
  "Hey — that app isn't helping you become who you want to be. 🚀",
  "Time check: is this moving you closer to your goal? 🎯",
  "Break the loop. Stand up, stretch, and get back to it. ⚡",
];

export function getRandomQuote() {
  return MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
}

export function getRandomInterrupt() {
  return PATTERN_INTERRUPT_MESSAGES[Math.floor(Math.random() * PATTERN_INTERRUPT_MESSAGES.length)];
}

export function getDailyQuote() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  return MOTIVATIONAL_QUOTES[dayOfYear % MOTIVATIONAL_QUOTES.length];
}