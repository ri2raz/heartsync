import Link from "next/link";

import { APP_NAME, HELPLINES } from "@/lib/constants";

import { Logo } from "./logo";

const COLUMNS = [
  {
    title: "Talk",
    links: [
      { href: "/listeners", label: "Find a listener" },
      { href: "/pricing", label: "100% Free Support" },
      { href: "/signup", label: "Start free chat" },
    ],
  },
  {
    title: "Listen",
    links: [
      { href: "/become-a-listener", label: "Become a listener" },
      { href: "/safety#code", label: "Code of conduct" },
    ],
  },
  {
    title: "Trust",
    links: [
      { href: "/safety", label: "Safety" },
      { href: "/contact", label: "Contact Us" },
      { href: "/help", label: "Crisis helplines" },
      { href: "/terms", label: "Terms" },
      { href: "/privacy", label: "Privacy" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-xs text-sm leading-relaxed text-muted">
            Peer support from verified big bros and big sisters. We listen — we are not therapists, doctors or an
            emergency service.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h3 className="text-sm font-semibold">{col.title}</h3>
            <ul className="mt-4 space-y-3">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted transition hover:text-ink">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 text-xs text-muted sm:px-6 md:flex-row md:items-center md:justify-between">
          <p>
            In crisis? Call{" "}
            {HELPLINES.slice(0, 2).map((h, i) => (
              <span key={h.number}>
                {i > 0 ? " or " : ""}
                <a href={`tel:${h.number}`} className="font-semibold text-ink underline-offset-2 hover:underline">
                  {h.number}
                </a>
              </span>
            ))}
            . {APP_NAME} is not an emergency service.
          </p>
          <p>
            © {new Date().getFullYear()} {APP_NAME}. Made in India, with care.
          </p>
        </div>
      </div>
    </footer>
  );
}
