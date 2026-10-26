import { LifeBuoy } from "lucide-react";
import Link from "next/link";

export function CrisisStrip() {
  return (
    <div className="bg-ink text-bg dark:border-b dark:border-line dark:bg-surface-2 dark:text-ink">
      <div className="mx-auto flex max-w-6xl items-center justify-center gap-2 px-4 py-2 text-center text-xs sm:text-[13px]">
        <LifeBuoy className="size-3.5 shrink-0" aria-hidden />
        <p>
          In danger or thinking of ending your life? Call{" "}
          <a href="tel:14416" className="font-semibold underline underline-offset-2">
            Tele-MANAS 14416
          </a>{" "}
          (free, 24×7) or{" "}
          <a href="tel:112" className="font-semibold underline underline-offset-2">
            112
          </a>
          .{" "}
          <Link href="/help" className="hidden underline-offset-2 opacity-80 hover:underline sm:inline">
            More helplines →
          </Link>
        </p>
      </div>
    </div>
  );
}
