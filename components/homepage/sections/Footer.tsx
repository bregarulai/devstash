import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-border mt-15 bg-secondary">
      <div className="max-w-6xl mx-auto px-5 pt-12 pb-7 grid gap-8 lg:grid-cols-[1.2fr_2.5fr]">
        <div>
          <Link href="/" className="flex items-center gap-2.5 font-bold text-lg tracking-tight">
            <span className="inline-flex" aria-hidden="true">
              <svg viewBox="0 0 32 32" width="24" height="24" fill="none">
                <rect x="3" y="3" width="26" height="26" rx="7" fill="var(--color-brand)" />
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
          <p className="text-muted-foreground text-xs mt-3 max-w-[280px]">
            Your data stays yours. Snippets are encrypted at rest and never used for AI training.
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
          <div>
            <h4 className="text-[13px] font-bold mb-3">Resources</h4>
            <span className="block text-muted-foreground text-sm py-[5px]">
              Open source
            </span>
            <span className="block text-muted-foreground text-sm py-[5px]">
              MIT licensed
            </span>
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-5 py-4.5 border-t border-border flex flex-col gap-3 items-center text-muted-foreground text-[13px] sm:flex-row sm:justify-between">
        <span>&copy; {new Date().getFullYear()} DevStash. All rights reserved.</span>

      </div>
    </footer>
  );
}
