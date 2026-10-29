"use client";

import { Check, Copy, Heart, RefreshCw, Sparkles } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type QuoteCategory =
  | "Exams & Ranks"
  | "Burnout & Rest"
  | "Self-Worth"
  | "Family & Guilt"
  | "Overcoming Fear"
  | "Midnight Solidarity";

export interface MotivationalQuote {
  quote: string;
  punchline: string;
  category: QuoteCategory;
  author: string;
  hinglish?: boolean;
}

export const MOTIVATIONAL_QUOTES: MotivationalQuote[] = [
  {
    punchline: "Ek rank tumhari poori zindagi define nahi kar sakti.",
    quote:
      "The exam tested your memory on a single Tuesday. It did not test your courage, your kindness, or the next 60 years of your life. You are so much bigger than a 6-digit roll number.",
    category: "Exams & Ranks",
    author: "MannMitr Big Bro",
    hinglish: true,
  },
  {
    punchline: "Your parents need YOU alive, not just your rank card.",
    quote:
      "Ghar wale gussa ho sakte hain, disappointed ho sakte hain... par unki duniya tumhare bina andheri ho jayegi. Never let a piece of paper convince you that they would be better off without you.",
    category: "Family & Guilt",
    author: "Big Sis Aarti",
    hinglish: true,
  },
  {
    punchline: "Gaadi ka petrol khatam ho toh gaadi feki nahi jaati.",
    quote:
      "Burnout is not failure — it is your mind and body begging you to breathe. Rest is not surrender. Take tonight off, sleep, and remember that survival comes before achievement.",
    category: "Burnout & Rest",
    author: "Big Bro Kabir",
    hinglish: true,
  },
  {
    punchline: "You have survived 100% of your worst days so far.",
    quote:
      "You survived the bad mock tests, the sleepless hostel nights, the quiet tears behind locked washroom doors. You stumbled, but you are still standing. Trust that resilience.",
    category: "Overcoming Fear",
    author: "Former Aspirant Survivor",
  },
  {
    punchline: "5 saal baad koi attempt nahi puchega, tumhara jazba dekhega.",
    quote:
      "A drop year or a delayed start is a detour, never a dead end. In the long race of life, consistency and mental peace outlive every initial sprint.",
    category: "Exams & Ranks",
    author: "MannMitr Elder",
    hinglish: true,
  },
  {
    punchline: "Dil ka bojh akele mat uthao. Kisi se keh do, thoda halka lagega.",
    quote:
      "When we trap heavy thoughts in our heads, they turn into monsters. The moment you say them out loud to someone who won't judge, half their weight vanishes into the air.",
    category: "Self-Worth",
    author: "Big Sis Meera",
    hinglish: true,
  },
  {
    punchline: "Failure is an event in time, never the identity of a human.",
    quote:
      "You failed a mock test. You didn't fail as a son, daughter, friend, or human being. Disentangle who you are from what you scored.",
    category: "Self-Worth",
    author: "MannMitr Founder",
  },
  {
    punchline: "Breathe. You don't have to figure out the next 10 years tonight.",
    quote:
      "You just have to survive tonight. Have a glass of water, step onto the balcony, look at the sky, and take it one single breath at a time.",
    category: "Burnout & Rest",
    author: "Big Bro Aarav",
  },
  {
    punchline: "Andheri raat ke baad subah aati hi aati hai — physics ka rule hai.",
    quote:
      "No dark phase is permanent. Even the longest, most suffocating night runs out of hours when the sun climbs over the horizon. Hold on till morning.",
    category: "Midnight Solidarity",
    author: "Big Sis Sneha",
    hinglish: true,
  },
  {
    punchline: "A broken mock test is just data, not a death sentence.",
    quote:
      "A bad score doesn't mean you are broken; it just reveals which formulas need another look. Treat errors as compass needles, not shame badges.",
    category: "Exams & Ranks",
    author: "Big Bro Rohan",
  },
  {
    punchline: "Sharma ji ke bete ki journey alag hai, tumhari alag.",
    quote:
      "Comparison is a thief that steals your peace without giving you anything in return. Don't measure your chapter 2 against someone else's chapter 12. You have your own timeline.",
    category: "Family & Guilt",
    author: "Big Sis Tanya",
    hinglish: true,
  },
  {
    punchline: "Tumhari keemat kisi cutoff list par depend nahi karti.",
    quote:
      "Cutoffs are arbitrary numbers created by seating capacity, not an appraisal of your worth as a human soul. You are worthy simply because you exist.",
    category: "Self-Worth",
    author: "Big Bro Yash",
    hinglish: true,
  },
  {
    punchline: "Rona kamzori nahi hai, dil ke pressure cooker se steam nikalna hai.",
    quote:
      "Crying isn't giving up. It's your heart releasing the immense pressure so it doesn't shatter. Let the tears fall, wash your face, and breathe.",
    category: "Burnout & Rest",
    author: "Big Sis Priya",
    hinglish: true,
  },
  {
    punchline: "The race is only against yesterday's self, not a classroom of 200.",
    quote:
      "If you understood one more concept today than you did yesterday, you won. Don't let coaching rank-boards make you forget your real progress.",
    category: "Overcoming Fear",
    author: "Big Bro Dev",
  },
  {
    punchline: "It's okay to feel lost. Even GPS recalculates before the right highway.",
    quote:
      "When your path seems blocked, life isn't punishing you — it's forcing a pause so you don't sprint full speed in the wrong direction.",
    category: "Overcoming Fear",
    author: "MannMitr Mentor",
  },
  {
    punchline: "Zindagi ka canvas bohot bada hai, yeh exam bas ek chhota sa kona hai.",
    quote:
      "Ten years from now, you will laugh with people you haven't met yet, visit cities you haven't seen yet, and live stories you can't even imagine today. Stay alive for them.",
    category: "Midnight Solidarity",
    author: "Big Sis Ananya",
    hinglish: true,
  },
];

export const CATEGORIES: (QuoteCategory | "All")[] = [
  "All",
  "Exams & Ranks",
  "Burnout & Rest",
  "Self-Worth",
  "Family & Guilt",
  "Overcoming Fear",
  "Midnight Solidarity",
];

export function DailyQuoteCard({ className }: { className?: string }) {
  const [index, setIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [animating, setAnimating] = useState(false);

  const current = MOTIVATIONAL_QUOTES[index];

  function nextQuote() {
    setAnimating(true);
    setTimeout(() => {
      setIndex((prev) => (prev + 1) % MOTIVATIONAL_QUOTES.length);
      setAnimating(false);
    }, 180);
  }

  function handleCopy() {
    if (!current) return;
    const text = `"${current.punchline}"\n\n${current.quote} — ${current.author} (via MannMitr)`;
    void navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!current) return null;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[2.5rem] border border-rose/30 bg-gradient-to-br from-rose-soft/40 via-surface to-surface-2 p-6 shadow-soft sm:p-8 backdrop-blur-sm",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose/10 px-3.5 py-1 text-xs font-semibold text-rose">
          <Sparkles className="size-3.5" /> {current.category}
        </span>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="size-8 rounded-full p-0 text-muted hover:text-ink"
            aria-label="Copy quote"
            title="Copy quote"
          >
            {copied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={nextQuote}
            className="gap-1.5 rounded-full text-xs font-medium"
          >
            <RefreshCw className={cn("size-3.5 transition-transform", animating && "rotate-180")} />
            Next punchline
          </Button>
        </div>
      </div>

      <div
        className={cn(
          "mt-6 transition-all duration-200",
          animating ? "scale-95 opacity-0 blur-xs" : "scale-100 opacity-100 blur-0",
        )}
      >
        <p className="font-serif text-2xl font-bold italic leading-snug tracking-tight text-ink sm:text-3xl">
          &ldquo;{current.punchline}&rdquo;
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">{current.quote}</p>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wider text-rose/90">— {current.author}</p>
          <span className="text-[11px] text-muted/80">Tap &ldquo;Next punchline&rdquo; for another reminder</span>
        </div>
      </div>
    </div>
  );
}

export function MotivationalQuotesGrid({ className }: { className?: string }) {
  const [selectedCategory, setSelectedCategory] = useState<QuoteCategory | "All">("All");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const filteredQuotes =
    selectedCategory === "All"
      ? MOTIVATIONAL_QUOTES
      : MOTIVATIONAL_QUOTES.filter((q) => q.category === selectedCategory);

  function handleCopy(quote: MotivationalQuote, index: number) {
    const text = `"${quote.punchline}"\n\n${quote.quote}\n— ${quote.author} (MannMitr)`;
    void navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  }

  return (
    <div className={cn("space-y-8", className)}>
      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              "rounded-full px-4 py-2 text-xs font-medium transition-all duration-200",
              selectedCategory === cat
                ? "bg-rose text-white shadow-sm shadow-rose/30 scale-105"
                : "border border-line bg-surface text-muted hover:border-rose/40 hover:text-ink",
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid of Punchline Cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filteredQuotes.map((item, idx) => (
          <div
            key={item.punchline}
            className="group relative flex flex-col justify-between rounded-3xl border border-line bg-surface p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-rose/40 hover:shadow-hover"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="rounded-full bg-surface-2 px-3 py-1 text-[11px] font-medium text-muted">
                  {item.category}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(item, idx)}
                  className="rounded-full p-1.5 text-muted transition hover:bg-rose/10 hover:text-rose"
                  title="Copy punchline"
                  aria-label="Copy punchline"
                >
                  {copiedIndex === idx ? (
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                      <Check className="size-3.5" /> Copied
                    </span>
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                </button>
              </div>

              <h3 className="mt-4 font-serif text-xl font-bold italic leading-snug tracking-tight text-ink group-hover:text-rose transition-colors">
                &ldquo;{item.punchline}&rdquo;
              </h3>

              <p className="mt-3 text-xs leading-relaxed text-muted line-clamp-4">{item.quote}</p>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-line/60 pt-3 text-[11px] text-muted">
              <span className="font-medium text-rose/90">{item.author}</span>
              <span className="flex items-center gap-1 opacity-70">
                <Heart className="size-3 text-rose fill-rose/20" /> Peer reminder
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
