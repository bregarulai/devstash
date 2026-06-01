interface KeyboardHintProps {
  shortcut: string;
  className?: string;
}

export function KeyboardHint({ shortcut, className = '' }: KeyboardHintProps) {
  return (
    <span
      className={`ml-2 text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded ${className}`}
    >
      {shortcut}
    </span>
  );
}
