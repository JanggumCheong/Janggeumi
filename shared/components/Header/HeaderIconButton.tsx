type HeaderIconButtonProps = {
  onClick?: () => void;
  children: React.ReactNode;
  label: string;
};

export function HeaderIconButton({ onClick, children, label }: HeaderIconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      className="flex size-9 items-center justify-center rounded-full text-jg-ink-sub hover:bg-muted"
      onClick={onClick}
    >
      {children}
    </button>
  );
}
