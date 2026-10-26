"use client";

import { useEffect, useState } from "react";

/** False during SSR and hydration, true after. Use it to render clock- or timezone-dependent text. */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
