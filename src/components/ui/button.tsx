import Link from "next/link";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

const base =
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-[background-color,color,box-shadow,transform] duration-200 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50";

const variants = {
  primary: "bg-ink text-bg shadow-soft hover:bg-ink/90",
  rose: "bg-rose text-rose-ink shadow-soft hover:brightness-105",
  secondary: "bg-surface text-ink ring-1 ring-line shadow-soft hover:bg-surface-2",
  ghost: "text-ink hover:bg-surface-2",
  danger: "bg-danger-soft text-danger hover:brightness-95",
} as const;

const sizes = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-[15px]",
  lg: "h-13 px-7 text-base",
} as const;

export type ButtonVariant = keyof typeof variants;
export type ButtonSize = keyof typeof sizes;

export function buttonClasses(variant: ButtonVariant = "primary", size: ButtonSize = "md", className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

type ButtonProps = ComponentProps<"button"> & { variant?: ButtonVariant; size?: ButtonSize };

export function Button({ variant, size, className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonClasses(variant, size, className)} {...props} />;
}

type ButtonLinkProps = ComponentProps<typeof Link> & { variant?: ButtonVariant; size?: ButtonSize };

export function ButtonLink({ variant, size, className, ...props }: ButtonLinkProps) {
  return <Link className={buttonClasses(variant, size, className)} {...props} />;
}

/** Primary call-to-action with a light sweep, in the style of 21st.dev shimmer buttons. */
export function ShimmerLink({ className, children, ...props }: ComponentProps<typeof Link>) {
  return (
    <Link
      className={cn(buttonClasses("rose", "lg"), "overflow-hidden shadow-[0_10px_30px_-10px_var(--rose)]", className)}
      {...props}
    >
      <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-1/3 animate-sweep bg-gradient-to-r from-transparent via-white/40 to-transparent" />
      <span className="relative inline-flex items-center gap-2">{children}</span>
    </Link>
  );
}
