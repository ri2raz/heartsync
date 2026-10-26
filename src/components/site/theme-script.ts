export const THEME_STORAGE_KEY = "hs-theme";

/** Inline script that runs before paint so the page never flashes the wrong theme. */
export const themeInitScript = `(function(){document.documentElement.classList.add("js");try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");var d=t?t==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("dark",d);}catch(e){if(window.matchMedia("(prefers-color-scheme: dark)").matches)document.documentElement.classList.add("dark");}})();`;
