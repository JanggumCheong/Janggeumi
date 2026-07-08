"use client";

import { Search } from "lucide-react";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
};

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div>
      <div className="flex items-center gap-2 rounded-2xl px-4 py-3 bg-muted">
        <Search size={20} strokeWidth={1.8} className="text-jg-ink-mute" />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="재료 이름으로 검색해보세요"
          className="w-full bg-transparent text-sm outline-none placeholder:text-jg-ink-mute text-foreground "
          type="search"
          aria-label="재료 검색"
        />
      </div>
    </div>
  );
}
