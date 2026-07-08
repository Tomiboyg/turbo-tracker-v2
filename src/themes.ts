export type ThemeId = "volt" | "blue" | "purple" | "orange" | "pink" | "cyan" | "red" | "amber";

export type ThemeVars = {
  volt: string;
  "volt-foreground": string;
  primary: string;
  "primary-foreground": string;
  ring: string;
  "chart-1": string;
  "chart-2": string;
  "chart-3": string;
  "chart-4": string;
  "chart-5": string;
};

export type Theme = {
  id: ThemeId;
  label: string;
  vars: ThemeVars;
};

export const THEMES: Theme[] = [
  {
    id: "volt",
    label: "Volt",
    vars: {
      volt: "oklch(0.92 0.22 128)",
      "volt-foreground": "oklch(0.15 0.02 130)",
      primary: "oklch(0.92 0.22 128)",
      "primary-foreground": "oklch(0.15 0.02 130)",
      ring: "oklch(0.92 0.22 128)",
      "chart-1": "oklch(0.92 0.22 128)",
      "chart-2": "oklch(0.75 0.16 200)",
      "chart-3": "oklch(0.7 0.19 30)",
      "chart-4": "oklch(0.75 0.19 300)",
      "chart-5": "oklch(0.85 0.18 85)",
    },
  },
  {
    id: "blue",
    label: "Azure",
    vars: {
      volt: "oklch(0.7 0.18 250)",
      "volt-foreground": "oklch(0.15 0.02 260)",
      primary: "oklch(0.7 0.18 250)",
      "primary-foreground": "oklch(0.15 0.02 260)",
      ring: "oklch(0.7 0.18 250)",
      "chart-1": "oklch(0.7 0.18 250)",
      "chart-2": "oklch(0.65 0.15 200)",
      "chart-3": "oklch(0.6 0.17 30)",
      "chart-4": "oklch(0.65 0.16 300)",
      "chart-5": "oklch(0.75 0.14 85)",
    },
  },
  {
    id: "purple",
    label: "Violet",
    vars: {
      volt: "oklch(0.7 0.2 290)",
      "volt-foreground": "oklch(0.15 0.02 260)",
      primary: "oklch(0.7 0.2 290)",
      "primary-foreground": "oklch(0.15 0.02 260)",
      ring: "oklch(0.7 0.2 290)",
      "chart-1": "oklch(0.7 0.2 290)",
      "chart-2": "oklch(0.65 0.15 200)",
      "chart-3": "oklch(0.6 0.17 30)",
      "chart-4": "oklch(0.65 0.18 320)",
      "chart-5": "oklch(0.75 0.14 85)",
    },
  },
  {
    id: "orange",
    label: "Ember",
    vars: {
      volt: "oklch(0.78 0.19 50)",
      "volt-foreground": "oklch(0.15 0.02 30)",
      primary: "oklch(0.78 0.19 50)",
      "primary-foreground": "oklch(0.15 0.02 30)",
      ring: "oklch(0.78 0.19 50)",
      "chart-1": "oklch(0.78 0.19 50)",
      "chart-2": "oklch(0.7 0.16 200)",
      "chart-3": "oklch(0.65 0.18 30)",
      "chart-4": "oklch(0.7 0.17 300)",
      "chart-5": "oklch(0.8 0.14 85)",
    },
  },
  {
    id: "pink",
    label: "Bloom",
    vars: {
      volt: "oklch(0.72 0.2 350)",
      "volt-foreground": "oklch(0.15 0.02 260)",
      primary: "oklch(0.72 0.2 350)",
      "primary-foreground": "oklch(0.15 0.02 260)",
      ring: "oklch(0.72 0.2 350)",
      "chart-1": "oklch(0.72 0.2 350)",
      "chart-2": "oklch(0.65 0.15 200)",
      "chart-3": "oklch(0.6 0.17 30)",
      "chart-4": "oklch(0.65 0.18 300)",
      "chart-5": "oklch(0.75 0.14 85)",
    },
  },
  {
    id: "cyan",
    label: "Cyan",
    vars: {
      volt: "oklch(0.8 0.16 195)",
      "volt-foreground": "oklch(0.15 0.02 200)",
      primary: "oklch(0.8 0.16 195)",
      "primary-foreground": "oklch(0.15 0.02 200)",
      ring: "oklch(0.8 0.16 195)",
      "chart-1": "oklch(0.8 0.16 195)",
      "chart-2": "oklch(0.7 0.15 250)",
      "chart-3": "oklch(0.65 0.17 30)",
      "chart-4": "oklch(0.7 0.16 300)",
      "chart-5": "oklch(0.78 0.13 85)",
    },
  },
  {
    id: "red",
    label: "Crimson",
    vars: {
      volt: "oklch(0.68 0.22 25)",
      "volt-foreground": "oklch(0.15 0.02 20)",
      primary: "oklch(0.68 0.22 25)",
      "primary-foreground": "oklch(0.15 0.02 20)",
      ring: "oklch(0.68 0.22 25)",
      "chart-1": "oklch(0.68 0.22 25)",
      "chart-2": "oklch(0.65 0.15 200)",
      "chart-3": "oklch(0.6 0.18 350)",
      "chart-4": "oklch(0.65 0.17 300)",
      "chart-5": "oklch(0.75 0.14 85)",
    },
  },
  {
    id: "amber",
    label: "Solar",
    vars: {
      volt: "oklch(0.84 0.18 85)",
      "volt-foreground": "oklch(0.15 0.02 60)",
      primary: "oklch(0.84 0.18 85)",
      "primary-foreground": "oklch(0.15 0.02 60)",
      ring: "oklch(0.84 0.18 85)",
      "chart-1": "oklch(0.84 0.18 85)",
      "chart-2": "oklch(0.7 0.16 200)",
      "chart-3": "oklch(0.65 0.18 30)",
      "chart-4": "oklch(0.7 0.17 300)",
      "chart-5": "oklch(0.78 0.14 120)",
    },
  },
];

export function applyTheme(themeId: ThemeId) {
  const theme = THEMES.find((t) => t.id === themeId) ?? THEMES[0];
  const root = document.documentElement;
  for (const [key, value] of Object.entries(theme.vars)) {
    root.style.setProperty(`--${key}`, value);
  }
}

export function getThemeVars(themeId: ThemeId): ThemeVars {
  return (THEMES.find((t) => t.id === themeId) ?? THEMES[0]).vars;
}
