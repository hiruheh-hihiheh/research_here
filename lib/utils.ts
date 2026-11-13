type ClassValue = string | number | boolean | null | undefined | ClassValue[] | Record<string, boolean | null | undefined>;

export function cn(...inputs: ClassValue[]): string {
  const classes = inputs
    .flatMap((i) => {
      if (!i) return [];
      if (typeof i === "string") return i.split(/\s+/);
      if (typeof i === "number") return [String(i)];
      if (Array.isArray(i)) return i;
      if (typeof i === "object") {
        return Object.entries(i as Record<string, unknown>)
          .filter(([, v]) => Boolean(v))
          .map(([k]) => k);
      }
      return [];
    })
    .filter(Boolean) as string[];
  // dedupe preserving last? simple join
  return classes.join(" ");
}

export function formatNumber(n: number) {
  return new Intl.NumberFormat().format(n);
}