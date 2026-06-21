import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/homepage/reveal/Reveal';

export function CtaSection() {
  return (
    <Reveal>
      <section className="max-w-[760px] mx-auto my-10 py-14 px-6 text-center rounded-2xl border border-border bg-[oklch(0.97_0.01_260)] dark:bg-[oklch(0.205_0.02_260)]">
        <h2 className="text-[clamp(1.625rem,3vw+0.75rem,2.5rem)] font-bold tracking-[-0.02em] leading-[1.15] text-balance">
          Ready to Organize Your Knowledge?
        </h2>
        <p className="mt-3.5 mx-auto max-w-[460px] text-muted-foreground leading-relaxed text-pretty">
          Join developers who turned their chaos into a searchable stash. Free to start, no credit
          card.
        </p>
        <Button size="lg" className="mt-6" asChild>
          <Link href="/register">Get Started Free</Link>
        </Button>
      </section>
    </Reveal>
  );
}
