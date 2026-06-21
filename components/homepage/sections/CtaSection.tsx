import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/homepage/reveal/Reveal';

export function CtaSection() {
  return (
    <Reveal>
      <section className="max-w-[760px] mx-auto my-10 py-14 px-6 text-center rounded-2xl border border-border bg-secondary">
        <h2 className="text-[clamp(26px,4.5vw,36px)] font-bold tracking-[-0.02em] text-balance">
          Ready to Organize Your Knowledge?
        </h2>
        <p className="mt-3.5 mx-auto max-w-[460px] text-muted-foreground text-pretty">
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
