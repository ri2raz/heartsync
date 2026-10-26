"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { logout } from "@/actions/auth";
import { Avatar } from "@/components/ui/avatar";
import { buttonClasses } from "@/components/ui/button";
import type { Role } from "@/lib/constants";
import { cn, hueFromString } from "@/lib/utils";

import { Logo } from "./logo";
import { ThemeToggle } from "./theme";

type NavUser = { alias: string; role: Role } | null;

const PUBLIC_LINKS = [
  { href: "/listeners", label: "Listeners" },
  { href: "/pricing", label: "100% Free" },
  { href: "/safety", label: "Safety" },
  { href: "/become-a-listener", label: "Become a listener" },
  { href: "/contact", label: "Contact Us" },
];

function userLinks(user: NonNullable<NavUser>) {
  if (user.role === "ADMIN") return [{ href: "/admin", label: "Safety desk" }];
  if (user.role === "LISTENER") return [{ href: "/listener/dashboard", label: "Dashboard" }];
  return [{ href: "/chat", label: "My chats" }];
}

export function Navbar({ user }: { user: NavUser }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = user ? [...PUBLIC_LINKS.filter((l) => l.href !== "/become-a-listener" || user.role === "SEEKER"), ...userLinks(user)] : PUBLIC_LINKS;

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-[background-color,box-shadow,backdrop-filter] duration-300",
        scrolled || open ? "bg-bg/80 shadow-[0_1px_0_var(--line)] backdrop-blur-xl" : "bg-transparent",
      )}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6" aria-label="Main">
        <Logo />

        <ul className="hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={pathname.startsWith(link.href) ? "page" : undefined}
                className={cn(
                  "rounded-full px-3.5 py-2 text-sm transition hover:bg-surface-2",
                  pathname.startsWith(link.href) ? "font-medium text-ink" : "text-muted",
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          {user ? (
            <div className="hidden items-center gap-2 lg:flex">
              <Link href="/account" className="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 text-sm transition hover:bg-surface-2">
                <Avatar name={user.alias} hue={hueFromString(user.alias)} size={30} />
                <span className="max-w-28 truncate">{user.alias}</span>
              </Link>
              <form action={logout}>
                <button type="submit" className={buttonClasses("ghost", "sm")}>
                  Log out
                </button>
              </form>
            </div>
          ) : (
            <div className="hidden items-center gap-2 lg:flex">
              <Link href="/login" className={buttonClasses("ghost", "sm")}>
                Log in
              </Link>
              <Link href="/signup" className={buttonClasses("primary", "sm")}>
                Start free chat
              </Link>
            </div>
          )}
          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-full hover:bg-surface-2 lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>

      {open ? (
        <div id="mobile-menu" className="border-t border-line px-4 pb-6 pt-2 lg:hidden">
          <ul className="flex flex-col">
            {links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="block rounded-2xl px-3 py-3 text-base hover:bg-surface-2">
                  {link.label}
                </Link>
              </li>
            ))}
            {user ? (
              <>
                <li>
                  <Link href="/account" className="block rounded-2xl px-3 py-3 text-base hover:bg-surface-2">
                    Account
                  </Link>
                </li>
                <li>
                  <form action={logout}>
                    <button type="submit" className="w-full rounded-2xl px-3 py-3 text-left text-base text-muted hover:bg-surface-2">
                      Log out
                    </button>
                  </form>
                </li>
              </>
            ) : (
              <li className="mt-3 grid grid-cols-2 gap-2">
                <Link href="/login" className={buttonClasses("secondary", "md")}>
                  Log in
                </Link>
                <Link href="/signup" className={buttonClasses("primary", "md")}>
                  Start free chat
                </Link>
              </li>
            )}
          </ul>
        </div>
      ) : null}
    </header>
  );
}
