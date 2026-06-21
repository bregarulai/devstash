import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-border mt-15 bg-secondary relative z-10">
      <div className="max-w-6xl mx-auto px-5 pt-12 pb-7 grid gap-8 lg:grid-cols-[1.2fr_2fr]">
        <div>
          <Link href="/" className="flex items-center gap-2.5 font-bold text-lg tracking-tight">
            <span className="inline-flex" aria-hidden="true">
              <svg viewBox="0 0 32 32" width="24" height="24" fill="none">
                <rect x="3" y="3" width="26" height="26" rx="7" fill="var(--color-snippet)" />
                <path
                  d="M11 21V11h6.5a3.5 3.5 0 0 1 0 7H14"
                  stroke="#0b1020"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="text-foreground">DevStash</span>
          </Link>
          <p className="text-muted-foreground text-sm mt-3.5 max-w-[280px]">
            The developer knowledge hub. Stop losing, start organizing.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
          <div>
            <h4 className="text-[13px] font-bold mb-3">Product</h4>
            <a href="#features" className="block text-muted-foreground text-sm py-[5px] hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#ai" className="block text-muted-foreground text-sm py-[5px] hover:text-foreground transition-colors">
              AI
            </a>
            <a href="#pricing" className="block text-muted-foreground text-sm py-[5px] hover:text-foreground transition-colors">
              Pricing
            </a>
          </div>
          <div>
            <h4 className="text-[13px] font-bold mb-3">Account</h4>
            <Link href="/sign-in" className="block text-muted-foreground text-sm py-[5px] hover:text-foreground transition-colors">
              Sign In
            </Link>
            <Link href="/register" className="block text-muted-foreground text-sm py-[5px] hover:text-foreground transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-5 py-4.5 border-t border-border flex flex-col gap-3 items-center text-muted-foreground text-[13px] sm:flex-row sm:justify-between">
        <span>&copy; {new Date().getFullYear()} DevStash. All rights reserved.</span>
        <div className="flex gap-3">
          <a
            href="https://github.com/your-repo"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="inline-flex w-[34px] h-[34px] items-center justify-center rounded-lg bg-card border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground hover:border-border/22"
          >
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path
                fill="currentColor"
                d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49v-1.7c-2.78.62-3.37-1.36-3.37-1.36-.45-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.7 0 0 .84-.28 2.75 1.05A9.4 9.4 0 0 1 12 6.85c.85 0 1.7.12 2.5.34 1.91-1.33 2.75-1.05 2.75-1.05.55 1.4.2 2.44.1 2.7.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.06.36.32.68.94.68 1.9v2.82c0 .27.18.6.69.49A10.26 10.26 0 0 0 22 12.25C22 6.58 17.52 2 12 2z"
              />
            </svg>
          </a>
          <a
            href="https://x.com/your-handle"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="X"
            className="inline-flex w-[34px] h-[34px] items-center justify-center rounded-lg bg-card border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground hover:border-border/22"
          >
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path
                fill="currentColor"
                d="M18.9 2H22l-7.3 8.3L23 22h-6.8l-5-6.6L5.4 22H2l7.8-8.9L1.5 2h6.9l4.6 6 5.9-6zm-1.2 18h1.9L7.4 4H5.4l12.3 16z"
              />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}
