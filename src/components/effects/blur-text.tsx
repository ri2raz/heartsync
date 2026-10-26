import { cn } from "@/lib/utils";

/**
 * Word-by-word blur-in, after the React Bits "BlurText" component.
 * Pure CSS so it starts on first paint — no waiting for JavaScript, which keeps the hero fast.
 */
export function BlurText({
  text,
  className,
  delay = 0,
  stagger = 0.07,
}: {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
}) {
  const words = text.split(" ");
  return (
    <span className={cn("inline", className)}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {words.map((word, i) => (
          <span
            key={`${word}-${i}`}
            className="inline-block animate-blur-in whitespace-pre"
            style={{ animationDelay: `${delay + i * stagger}s` }}
          >
            {word}
            {i < words.length - 1 ? " " : ""}
          </span>
        ))}
      </span>
    </span>
  );
}
