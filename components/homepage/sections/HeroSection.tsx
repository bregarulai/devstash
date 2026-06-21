import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/homepage/reveal/Reveal';
import { ChaosVisual } from '@/components/homepage/chaosVisual/ChaosVisual';

export function HeroSection() {
  return (
    <section className="max-w-6xl mx-auto px-5 pt-[120px] pb-10 grid gap-12 lg:pt-[140px] lg:gap-14 lg:text-center">
      <Reveal defaultVisible className="lg:max-w-[760px] lg:mx-auto">
        <span className="inline-block text-xs font-medium text-muted-foreground mb-4">
          The developer knowledge hub
        </span>
        <h1 className="text-[clamp(34px,7vw,60px)] leading-[1.05] tracking-[-0.03em] font-extrabold text-balance">
          Stop Losing Your{' '}
          <span className="text-[var(--color-brand)]">
            Developer Knowledge
          </span>
        </h1>
        <p className="mt-5 text-[clamp(16px,2.5vw,19px)] text-muted-foreground max-w-[620px] lg:mx-auto text-pretty">
          Snippets scattered across Slack. Prompts buried in chat. Commands lost in shell history.
          DevStash brings every piece of dev knowledge into one fast, searchable home.
        </p>
        <div className="flex flex-wrap gap-3 mt-7 justify-center">
          <Button variant="default" size="lg" className="h-11" asChild>
            <Link href="/register">Get Started Free</Link>
          </Button>
          <Button variant="outline" size="lg" className="h-11" asChild>
            <a href="#features">See Features</a>
          </Button>
        </div>
        <div className="flex items-center gap-2 mt-4.5 text-muted-foreground text-[13px] justify-center">
          <span className="w-[7px] h-[7px] rounded-full bg-success" />
          Free forever · No credit card · 50 items to start
        </div>
      </Reveal>

      <Reveal>
        <ChaosVisual />
      </Reveal>
    </section>
  );
}
