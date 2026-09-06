export function Skeleton({ className = '' }: { className?: string }) {
  return <div aria-hidden="true" className={`animate-pulse rounded-md bg-[var(--bg-elevated)] ${className}`} />;
}
