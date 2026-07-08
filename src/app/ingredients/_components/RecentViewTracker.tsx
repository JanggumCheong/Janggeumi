"use client";

import { useEffect } from "react";

import { addRecentViewedIngredient } from "../_lib/recent-views";

type RecentViewTrackerProps = {
  slug: string;
  name: string;
  emoji: string;
};

export function RecentViewTracker({ slug, name, emoji }: RecentViewTrackerProps) {
  useEffect(() => {
    addRecentViewedIngredient({ slug, name, emoji });
  }, [emoji, name, slug]);

  return null;
}
