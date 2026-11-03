export default function MarwarDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 text-gold ${className}`}>
      <span className="h-px w-12 bg-gradient-to-r from-transparent to-gold/70 sm:w-20" />
      <svg width="30" height="16" viewBox="0 0 30 16" fill="none" aria-hidden="true" className="shrink-0">
        <path d="M15 1l4.5 7L15 15l-4.5-7L15 1z" fill="currentColor" />
        <path d="M0 8h8M22 8h8" stroke="currentColor" strokeWidth="1.2" />
        <circle cx="8" cy="8" r="1.6" fill="currentColor" />
        <circle cx="22" cy="8" r="1.6" fill="currentColor" />
      </svg>
      <span className="h-px w-12 bg-gradient-to-l from-transparent to-gold/70 sm:w-20" />
    </div>
  );
}

