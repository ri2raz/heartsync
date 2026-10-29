"use client";

import { Heart } from "lucide-react";
import { useState, useTransition } from "react";

import { toggleFavorite } from "@/actions/booking";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  listenerProfileId: string;
  initialFavorited?: boolean;
  className?: string;
}

export function FavoriteButton({ listenerProfileId, initialFavorited = false, className }: FavoriteButtonProps) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [pending, startTransition] = useTransition();

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    const next = !favorited;
    setFavorited(next);

    startTransition(async () => {
      try {
        const res = await toggleFavorite(listenerProfileId);
        setFavorited(res.favorited);
      } catch {
        // Rollback on failure
        setFavorited(!next);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      aria-label={favorited ? "Remove from bookmarks" : "Bookmark this listener"}
      aria-pressed={favorited}
      className={cn(
        "group relative flex size-9 items-center justify-center rounded-full border border-line bg-surface/90 shadow-soft backdrop-blur-sm transition-all hover:scale-105 active:scale-95",
        favorited ? "border-rose/40 text-rose" : "text-muted hover:text-rose",
        className,
      )}
    >
      <Heart
        className={cn(
          "size-4.5 transition-transform group-hover:scale-110",
          favorited ? "fill-rose text-rose" : "fill-transparent text-current",
        )}
      />
    </button>
  );
}
