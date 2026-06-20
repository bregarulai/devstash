import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/homepage/reveal/Reveal';

export function CtaSection() {
  return (
    <Reveal>
      <section className="max-w-[760px] mx-auto my-10 py-14 px-6 text-center rounded-[22px] border border-border relative"
        style={{
          background: `radial-gradient(60% 100% at 50% 0%, rgba(99, 102, 241, 0.22), transparent 70%), var(--secondary)`,
        }}
      >
        <h2 className="text-[clamp(26px,4.5vw,36px)] font-bold tracking-[-0.02em]">
          Ready to Organize Your Knowledge?
        </h2>
        <p className="mt-3.5 mx-auto max-w-[460px] text-muted-foreground">
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
