"use client";

import { useState } from "react";
import { categories, players, type CategoryKey } from "./data";

// Headless leaderboard: category state + rows sorted for it. The markup lives in each component.
export function useLeaderboard(keys: readonly CategoryKey[] = ["playtime", "blocks", "mobs"]) {
  const [key, setKey] = useState<CategoryKey>(keys[0]);
  const category = categories.find((c) => c.key === key)!;
  const sorted = [...players].sort((a, b) => b[key] - a[key]);
  const max = sorted[0][key];
  const rows = sorted.map((p, i) => ({ rank: i + 1, name: p.name, value: category.format(p[key]), share: p[key] / max }));
  return { categories: categories.filter((c) => keys.includes(c.key)), key, setKey, category, rows };
}
