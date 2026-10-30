type IconName = 'arrow' | 'external' | 'seed' | 'pause' | 'play' | 'refresh' | 'check' | 'wheel' | 'work' | 'ethereum' | 'globe' | 'close' | 'share' | 'info' | 'chevron';

export function Icon({ name, className = '' }: { name: IconName; className?: string }) {
  const paths: Record<IconName, React.ReactNode> = {
    arrow: <><path d="M4 12h15m-6-6 6 6-6 6" /></>,
    external: <><path d="M14 4h6v6m0-6-10 10M10 5H5v14h14v-5" /></>,
    seed: <><path d="M18 4C9 2 3 9 5 15c2 7 14 3 13-11Z" /><path d="m8 16 7-9" /></>,
    pause: <><path d="M8 5v14M16 5v14" strokeWidth="3" /></>,
    play: <path d="m8 4 12 8-12 8Z" />,
    refresh: <><path d="M20 10a8 8 0 1 0-2 8M20 4v6h-6" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    wheel: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="2" /><path d="M12 3v7m0 4v7M3 12h7m4 0h7m-15-6 5 5m2 2 5 5m0-12-5 5m-2 2-5 5" /></>,
    work: <><path d="m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5" /></>,
    ethereum: <><path d="m12 2 7 10-7 4-7-4 7-10Zm-7 13 7 7 7-7-7 4-7-4Z" /><path d="M12 2v14M5 12l7-4 7 4" /></>,
    globe: <><circle cx="12" cy="12" r="9" /><ellipse cx="12" cy="12" rx="4" ry="9" /><path d="M3 12h18" /></>,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    share: <><path d="M12 16V3m-5 5 5-5 5 5M5 12v8h14v-8" /></>,
    info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v6m0-10v1" /></>,
    chevron: <path d="m9 5 7 7-7 7" />,
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={`icon ${className}`} aria-hidden="true">{paths[name]}</svg>;
}
