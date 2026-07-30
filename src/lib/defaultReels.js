/**
 * Default motivational reels for LOVE MEEE.
 * These are seeded on first app launch.
 * priority: true → downloaded first (must be ready to play immediately)
 */
export const DEFAULT_REELS = [
  // ── Priority / Featured (downloads first) ────────────────────────────
  {
    url: 'https://www.instagram.com/p/DTz98mgDwzc',
    title: 'Build Your Legacy',
    author: 'Instagram',
    priority: true,
  },
  // ── Rest of the pool (2 random download with the first, others queued) ─
  { url: 'https://www.instagram.com/p/DRcgcnDjE4p/', title: 'Rise & Grind', author: 'Instagram' },
  { url: 'https://www.instagram.com/p/DJ4X0vFs2Ij/', title: 'Discipline Over Motivation', author: 'Instagram' },
  { url: 'https://www.instagram.com/p/DHc7i8YycNj/', title: 'The Champion Mindset', author: 'Instagram' },
  { url: 'https://www.instagram.com/p/C4xoogoPbOj', title: 'Never Stop Pushing', author: 'Instagram' },
  { url: 'https://www.instagram.com/p/DY0PG_3h4x7/', title: 'Relentless', author: 'Instagram' },
  { url: 'https://www.instagram.com/p/DT1TZtXADZF', title: 'Elite Mindset', author: 'Instagram' },
  { url: 'https://www.instagram.com/reels/DYeyp9psqj7/', title: 'Stay Hard', author: 'Instagram' },
  { url: 'https://www.instagram.com/reels/DZ7N3xSTWh1/', title: 'Outwork Everyone', author: 'Instagram' },
  { url: 'https://www.instagram.com/p/DYTeKXezzKe/', title: 'No Days Off', author: 'Instagram' },
  { url: 'https://www.instagram.com/p/DK0L-fto2cl', title: 'The Grind Never Stops', author: 'Instagram' },
  { url: 'https://www.instagram.com/p/DRcFGFOEUTH', title: 'Become Unstoppable', author: 'Instagram' },
  { url: 'https://www.instagram.com/p/DZKDGmVTVXa', title: 'Winners Mentality', author: 'Instagram' },
  { url: 'https://www.instagram.com/p/C-aib0cS47v', title: 'Do It Scared', author: 'Instagram' },
  { url: 'https://www.instagram.com/p/DH2ryIYi04p', title: 'The Cost of Success', author: 'Instagram' },
  { url: 'https://www.instagram.com/p/DXG1a-VjHwX', title: 'Earn It Every Day', author: 'Instagram' },
];
