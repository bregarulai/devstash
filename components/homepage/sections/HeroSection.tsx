import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/homepage/reveal/Reveal';
import { ChaosVisual } from '@/components/homepage/chaosVisual/ChaosVisual';

export function HeroSection() {
  return (
    <section className="max-w-6xl mx-auto px-5 pt-[120px] pb-10 grid gap-12 lg:pt-[140px] lg:gap-14 lg:text-center">
      <Reveal className="lg:max-w-[760px] lg:mx-auto">
        <span className="inline-block text-xs font-semibold tracking-[0.12em] uppercase text-cyan-500 mb-4">
          The developer knowledge hub
        </span>
        <h1 className="text-[clamp(34px,7vw,60px)] leading-[1.05] tracking-[-0.03em] font-extrabold">
          Stop Losing Your<br />
          <span
            style={{
              background: 'linear-gradient(135deg, #818cf8, #22d3ee 60%, #f59e0b)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              color: 'transparent',
            }}
          >
            Developer Knowledge
          </span>
        </h1>
        <p className="mt-5 text-[clamp(16px,2.5vw,19px)] text-muted-foreground max-w-[620px] lg:mx-auto">
          Snippets scattered across Slack. Prompts buried in chat. Commands lost in shell history.
          DevStash brings every piece of dev knowledge into one fast, searchable home.
        </p>
        <div className="flex flex-wrap gap-3 mt-7 justify-center">
          <Button variant="gradient" size="lg" asChild>
            <Link href="/register">Get Started Free</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <a href="#features">See Features</a>
          </Button>
        </div>
        <div className="flex items-center gap-2 mt-4.5 text-muted-foreground text-[13px] justify-center">
          <span className="w-[7px] h-[7px] rounded-full bg-green-500 shadow-[0_0_10px_#22c55e]" />
          Free forever · No credit card · 50 items to start
        </div>
      </Reveal>

      <Reveal>
        <ChaosVisual />
      </Reveal>
    </section>
  );
}
