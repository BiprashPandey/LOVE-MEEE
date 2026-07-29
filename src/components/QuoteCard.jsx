import { Sparkles } from 'lucide-react';
import { getDailyQuote } from '@/lib/quotes';

export default function QuoteCard() {
  const quote = getDailyQuote();
  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 to-accent p-5">
      <Sparkles className="h-5 w-5 text-primary mb-2" />
      <p className="font-heading text-base font-bold leading-snug text-foreground">
        "{quote.text}"
      </p>
      <p className="mt-2 text-sm font-medium text-muted-foreground">— {quote.author}</p>
    </div>
  );
}