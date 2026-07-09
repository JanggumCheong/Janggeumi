"use client";

import { Search } from "lucide-react";

const PLACEHOLDER = "재료 이름으로 검색해보세요";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  autoFocus?: boolean;
};

export function SearchBar({ value, onChange, onSubmit, autoFocus }: SearchBarProps) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.();
      }}
      className="flex items-center gap-2 rounded-2xl px-4 py-3 bg-muted"
    >
      <button type="submit" aria-label="검색 실행" className="text-jg-ink-mute">
        <Search size={20} strokeWidth={1.8} />
      </button>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoFocus={autoFocus}
        placeholder={PLACEHOLDER}
        className="w-full bg-transparent text-sm outline-none placeholder:text-jg-ink-mute text-foreground"
        type="search"
        aria-label="재료 검색"
      />
    </form>
  );
}
